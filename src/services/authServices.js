import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_LIFE = '15m'; 
const REFRESH_TOKEN_LIFE = '30d';

// ------------------- REGISTER -------------------
export const register = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createHttpError(409, 'Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    return {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
    };
};

// ------------------- LOGIN -------------------
export const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(401, 'Email or password is wrong');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw createHttpError(401, 'Email or password is wrong');
    }

    const payload = { id: user._id.toString(), email: user.email };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFE });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFE });

    await Session.findOneAndDelete({ userId: user._id });

    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); 
    const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 

    await Session.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
    });

    return { accessToken, refreshToken };
};

// ------------------- REFRESH SESSION -------------------
export const refreshSession = async (oldRefreshToken) => {
    let payload;
    try {
        payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
    } catch {
        throw createHttpError(401, 'Invalid refresh token');
    }

    const session = await Session.findOne({ refreshToken: oldRefreshToken });
    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const newPayload = { _id: payload._id, email: payload.email };

    const newAccessToken = jwt.sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFE });
    const newRefreshToken = jwt.sign(newPayload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFE });

    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = accessTokenValidUntil;
    session.refreshTokenValidUntil = refreshTokenValidUntil;
    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ------------------- LOGOUT -------------------
export const logout = async (refreshToken) => {
    const session = await Session.findOne({ refreshToken });
    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    await Session.findByIdAndDelete(session._id);
};

export const sendResetEmail = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(404, "User not found!");
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    console.log("Transporter config:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM,
        passwordSet: !!process.env.SMTP_PASSWORD,
    });

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Тимчасово для тестування
        },
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Reset your password",
        html: `
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 5 minutes.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
    } catch (error) {
        console.error("Email sending error:", error.message, error.stack); 
        throw createHttpError(500, "Failed to send the email, please try again later.");
    }
};

export const resetPassword = async ({ token, password }) => {
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw createHttpError(401, "Token is expired or invalid.");
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(404, "User not found!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });
};

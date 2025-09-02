import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
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

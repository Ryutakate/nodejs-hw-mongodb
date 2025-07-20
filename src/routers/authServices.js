import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import { Session } from '../models/sessionModel.js';
import { User } from '../models/userModel.js';

export const register = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createHttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;


    
    return userWithoutPassword;
};

export const refreshSession = async (refreshToken) => {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
        throw createHttpError(401, 'Invalid refresh token');
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    await Session.findByIdAndDelete(session._id);

    const newPayload = { _id: payload._id, email: payload.email };

    const accessToken = jwt.sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(newPayload, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Session.create({
        userId: payload._id,
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
    });

    return { accessToken, refreshToken: newRefreshToken };
};





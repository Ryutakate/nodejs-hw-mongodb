import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Session } from '../models/sessionModel.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_LIFE = '15m'; 
const REFRESH_TOKEN_LIFE = '30d';

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(401, 'Email or password is wrong');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw createHttpError(401, 'Email or password is wrong');
    }

    const payload = { _id: user._id, email: user.email };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFE });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFE });

    await Session.findOneAndDelete({ userId: user._id });

    const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 хвилин
    const refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 днів

    await Session.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
    });

    return { accessToken, refreshToken };
};

export const logout = async (refreshToken) => {
    const session = await Session.findOne({ refreshToken });
    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    await Session.findByIdAndDelete(session._id);
};

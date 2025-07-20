import * as authServices from '../services/authServices.js';
import createHttpError from 'http-errors';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await authServices.register({ name, email, password });
    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await authServices.login({ email, password });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    });

    res.status(200).json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: { accessToken },
    });
};

export const refreshSession = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw createHttpError(401, 'Refresh token missing');
    }

    const { accessToken, refreshToken: newRefreshToken } = await authServices.refreshSession(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: { accessToken },
    });
};

export const logout = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw createHttpError(401, 'Refresh token missing');
    }

    await authServices.logout(refreshToken);

    res.clearCookie('refreshToken');

    res.status(204).send();
};


export default {
    register,
    login,
}; 


import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Session } from '../models/sessionModel.js';
import { User } from '../models/userModel.js';

const authenticate = async (req, res, next) => {
    try {
        const { authorization = '' } = req.headers;
        const [type, token] = authorization.split(' ');

        if (type !== 'Bearer' || !token) {
            throw createHttpError(401, 'Not authorized');
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw createHttpError(401, 'Access token expired');
            }
            throw createHttpError(401, 'Invalid token');
        }

        const session = await Session.findOne({ accessToken: token });
        if (!session) {
            throw createHttpError(401, 'Session not found');
        }

        const user = await User.findById(payload.id).select('-password');
        if (!user) {
            throw createHttpError(401, 'User not found');
        }

        req.user = user; 
        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;

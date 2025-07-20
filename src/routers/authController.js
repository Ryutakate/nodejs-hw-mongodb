import * as authServices from '../services/authServices.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    const user = await authServices.register({ name, email, password });

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export default {
    register,
};

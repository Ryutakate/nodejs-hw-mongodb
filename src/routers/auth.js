import express from 'express';
import ctrl from '../controllers/authController.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';


const authRouter = express.Router();

authRouter.post(
    '/register',
    validateBody(registerSchema),
    ctrlWrapper(ctrl.register)
);

authRouter.post(
    '/login',
    validateBody(loginSchema),
    ctrlWrapper(ctrl.login)
);

authRouter.post('/refresh', ctrlWrapper(ctrl.refreshSession));

authRouter.post('/logout', ctrlWrapper(ctrl.logout));


export default authRouter;

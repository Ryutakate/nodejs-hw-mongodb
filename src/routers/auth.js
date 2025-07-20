import express from 'express';
import ctrl  from '../controllers/authController.js';
import { registerSchema, loginSchema, sendResetEmailSchema, resetPasswordSchema } from '../schemas/authSchemas.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import { resetPasswordController, sendResetEmailController} from '../controllers/authController.js';

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

authRouter.post(
    "/send-reset-email",
    validateBody(sendResetEmailSchema),
    ctrlWrapper(sendResetEmailController)
);

authRouter.post(
    '/reset-pwd',
    validateBody(resetPasswordSchema),
    ctrlWrapper(resetPasswordController)
);

export default authRouter;

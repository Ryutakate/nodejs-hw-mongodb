import express from 'express';
import contactsController from '../controllers/contactsController';

const router = express.Router();

router.get('/', contactsController.getAllContacts);
router.get('/:contactId', contactsController.getContactById);

export default router;

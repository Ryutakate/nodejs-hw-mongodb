import express from 'express';
import contactsController from '../controllers/contactsController.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import authenticate from '../middlewares/authenticate.js';
import { createContactSchema, updateContactSchema } from '../schemas/contactSchemas.js';

const router = express.Router();

router.use(authenticate);
router.get('/', ctrlWrapper(contactsController.getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(contactsController.getContactById));
router.post('/', validateBody(createContactSchema), ctrlWrapper(contactsController.createNewContact));
router.patch('/:contactId', isValidId, validateBody(updateContactSchema),
ctrlWrapper(contactsController.updateContact));
router.delete('/:contactId', isValidId, ctrlWrapper(contactsController.deleteContact));

export default router;

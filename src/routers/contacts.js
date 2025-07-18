import express from 'express';
import contactsController from '../controllers/contactsController.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', ctrlWrapper(contactsController.getAllContacts));
router.get('/:contactId', ctrlWrapper(contactsController.getContactById));
router.post('/', ctrlWrapper(contactsController.createNewContact));
router.patch('/:contactId', ctrlWrapper(contactsController.updateContact));
router.delete('/:contactId', ctrlWrapper(contactsController.deleteContact));


export default router;

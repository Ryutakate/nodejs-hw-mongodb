import express from 'express';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import authenticate from '../middlewares/authenticate.js';
import { updateContactSchema } from '../schemas/contactSchemas.js';
import upload from '../middlewares/uploadMiddleware.js';
import { createContact, updateContact, getContactById, getAllContacts, deleteContact } from '../services/contacts.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', type, isFavourite, userId } = req.query;
        const { contacts, totalItems, totalPages } = await getAllContacts({ page, perPage, sortBy, sortOrder, type, isFavourite, userId });
        res.status(200).json({
            status: 200,
            message: 'Contacts retrieved successfully',
            data: {
                page: Number(page),
                perPage: Number(perPage),
                totalItems,
                totalPages,
                contacts,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:contactId', isValidId, ctrlWrapper(async (req, res) => {
    const contact = await getContactById(req.params.contactId, req.user._id);
    if (!contact) {
        return res.status(404).json({
        status: 404,
        message: 'Contact not found',
        });
    }
    res.status(200).json({
        status: 200,
        message: 'Contact retrieved successfully',
        data: { contact },
    });
}));

router.post('/', upload.single('photo'), async (req, res, next) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const file = req.file;
        const contact = await createContact({ name, email, phoneNumber, userId: req.user._id }, file);
        res.status(201).json({
            status: 201,
            message: 'Contact created',
            data: { contact },
        });
    } catch (error) {
        next(error);
    }
});

router.patch('/:contactId', isValidId, upload.single('photo'), validateBody(updateContactSchema), ctrlWrapper(async (req, res) => {
    const { contactId } = req.params;
    const { name, email, phoneNumber } = req.body;
    const file = req.file;
    const contact = await updateContact(contactId, { name, email, phoneNumber, userId: req.user._id }, file);
    if (!contact) {
        return res.status(404).json({
            status: 404,
            message: 'Contact not found',
        });
    }
    res.status(200).json({
            status: 200,
            message: 'Contact updated',
            data: { contact },
    });
}));

router.delete('/:contactId', isValidId, async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const result = await deleteContact(contactId, req.user._id);
        if (!result) {
        return res.status(404).json({
            status: 404,
            message: 'Contact not found',
        });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
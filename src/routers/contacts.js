// import express from 'express';
// import contactsController from '../controllers/contactsController.js';
// import ctrlWrapper from '../utils/ctrlWrapper.js';
// import validateBody from '../middlewares/validateBody.js';
// import isValidId from '../middlewares/isValidId.js';
// import authenticate from '../middlewares/authenticate.js';
// import { createContactSchema, updateContactSchema } from '../schemas/contactSchemas.js';
// import upload from '../middlewares/uploadMiddleware.js';


// const router = express.Router();

// router.use(authenticate);
// router.get('/', ctrlWrapper(contactsController.getAllContacts));
// router.get('/:contactId', isValidId, ctrlWrapper(contactsController.getContactById));
// router.post('/', upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(contactsController.createNewContact));
// router.patch('/:contactId', isValidId, upload.single('photo'), validateBody(updateContactSchema), ctrlWrapper(contactsController.updateContact));
// router.delete('/:contactId', isValidId, ctrlWrapper(contactsController.deleteContact));

// export default router;



import express from 'express';
import contactsController from '../controllers/contactsController.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import authenticate from '../middlewares/authenticate.js';
import { createContactSchema, updateContactSchema } from '../schemas/contactSchemas.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ctrlWrapper(async (req, res) => {
    const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc', type, isFavourite } = req.query;
    const result = await contactsController.getAllContacts({ page, perPage, sortBy, sortOrder, type, isFavourite });
    res.status(200).json({
        status: 200,
        message: 'Contacts retrieved successfully',
        data: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            page: Number(page),
            limit: Number(perPage),
            contacts: result.contacts,
        },
    });
}));

router.get('/:contactId', isValidId, ctrlWrapper(async (req, res) => {
    const contact = await contactsController.getContactById(req.params.contactId);
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

router.post('/', upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(async (req, res) => {
    const { file } = req;
    const contact = await contactsController.createNewContact(req.body, file);
    res.status(201).json({
        status: 201,
        message: 'Contact created',
        data: { contact },
    });
}));

router.patch('/:contactId', isValidId, upload.single('photo'), validateBody(updateContactSchema), ctrlWrapper(async (req, res) => {
    const { file } = req;
    const contact = await contactsController.updateContact(req.params.contactId, req.body, file);
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

router.delete('/:contactId', isValidId, ctrlWrapper(async (req, res) => {
    const result = await contactsController.deleteContact(req.params.contactId);
    if (!result) {
        return res.status(404).json({
            status: 404,
            message: 'Contact not found',
        });
    }
    res.status(204).send();
}));

export default router;
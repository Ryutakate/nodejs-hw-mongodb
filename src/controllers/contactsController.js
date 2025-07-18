// import express from 'express';
// import { getAllContacts, getContactById } from '../services/contacts.js';

// const router = express.Router();

// router.get('/', async (req, res) => {
//     try {
//         const contacts = await getAllContacts();
//         res.json({
//             status: 200,
//             message: 'Successfully found contacts!',
//             data: contacts,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// router.get('/:contactId', async (req, res) => {
//     try {
//         const { contactId } = req.params;
//         const contact = await getContactById(contactId);
//         if (!contact) {
//             return res.status(404).json({ message: 'Contact not found' });
//         }
//         res.json({
//             status: 200,
//             message: `Successfully found contact with id ${contactId}!`,
//             data: contact,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// export default router;


import { getAllContacts as getAllContactsService, getContactById as getContactByIdService } from '../services/contacts.js';
import createError from 'http-errors';

const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await getAllContactsService();
        res.json({
            status: 200,
            message: 'Successfully found contacts!',
            data: contacts,
        });
    } catch (error) {
        next(error);
    }
};

const getContactById = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const contact = await getContactByIdService(contactId);
        if (!contact) {
            throw createError(404, 'Contact not found');
        }
        res.json({
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAllContacts,
    getContactById,
};

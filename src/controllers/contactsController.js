import {
    getAllContacts,
    getContactById,
    createContact,
    updateContactById,
    deleteContactById
} from '../services/contacts.js';
import createError from 'http-errors';

const getAllContactsController = async (req, res) => {
    const { page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite } = req.query;
    const userId = req.user._id; 

    const {
        contacts,
        totalItems,
        totalPages,
    } = await getAllContacts({ page, perPage, sortBy, sortOrder, type, isFavourite, userId }); 

    res.json({
        status: 200,
        message: "Successfully found contacts!",
        data: {
            data: contacts,
            page: Number(page),
            perPage: Number(perPage),
            totalItems,
            totalPages,
            hasPreviousPage: Number(page) > 1,
            hasNextPage: Number(page) < totalPages,
        },
    });
};

const getContactByIdController = async (req, res, next) => {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await getContactById(contactId, userId); 

    if (!contact) {
        return next(createError(404, 'Contact not found'));
    }

    res.json({
        status: 200,
        message: "Successfully found contact!",
        data: contact,
    });
};

const createNewContactController = async (req, res, next) => {
    const { name, phoneNumber, contactType } = req.body;
    const userId = req.user._id; 

    if (!name || !phoneNumber || !contactType) {
        return next(createError(400, 'Missing required fields: name, phoneNumber, contactType'));
    }

    const newContact = await createContact({ ...req.body, userId }); 

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: newContact,
    });
};

const updateContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const dataToUpdate = req.body;
    const userId = req.user._id; 

    const updatedContact = await updateContactById(contactId, dataToUpdate, userId); 

    if (!updatedContact) {
        return next(createError(404, 'Contact not found'));
    }
    res.status(200).json({
        status: 200,
        message: 'Successfully patched a contact!',
        data: updatedContact,
    });
};

const deleteContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const userId = req.user._id; 

    const deletedContact = await deleteContactById(contactId, userId); 

    if (!deletedContact) {
        return next(createError(404, 'Contact not found'));
    }

    res.status(204).send();
};

export default {
    getAllContacts: getAllContactsController,
    getContactById: getContactByIdController,
    createNewContact: createNewContactController,
    updateContact: updateContactController,
    deleteContact: deleteContactController,
};

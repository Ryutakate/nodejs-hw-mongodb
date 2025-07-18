import { Contact } from '../models/contactModel.js';

export const getAllContacts = async () => {
    return await Contact.find();
};

export const getContactById = async (id) => {
    return await Contact.findById(id);
};

export const createContact = async (data) => {
    const newContact = await Contact.create(data);
    return newContact;
};

export const updateContactById = async (id, data) => {
    const updatedContact = await Contact.findByIdAndUpdate(id, data, { new: true });
    return updatedContact;
};

export const deleteContactById = async (id) => {
    const deletedContact = await Contact.findByIdAndDelete(id);
    return deletedContact;
};
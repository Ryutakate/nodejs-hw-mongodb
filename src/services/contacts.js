import { Contact } from '../models/contactModel.js';

export const getAllContacts = async ({ page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite }) => {
    const skip = (page - 1) * perPage;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const filter = {};
    if (type) {
        filter.contactType = type;
    }
    if (isFavourite !== undefined) {
        filter.isFavourite = isFavourite === "true";
    }

    const totalItems = await Contact.countDocuments(filter);

    const contacts = await Contact.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(perPage));

    const totalPages = Math.ceil(totalItems / perPage);

    return {
        contacts,
        totalItems,
        totalPages,
    };
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
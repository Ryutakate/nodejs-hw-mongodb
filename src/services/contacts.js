import { Contact } from '../models/contactModel.js';
import { uploadImageToCloudinary } from '../utils/uploadToCloudinary.js';


export const getAllContacts = async ({ page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite, userId }) => {
    const skip = (page - 1) * perPage;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const filter = { userId };

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

export const getContactById = async (id, userId) => {
    return await Contact.findOne({ _id: id, userId }); 
};

export const createContact = async (data, file) => {
    if (file) {
        const photoUrl = await uploadImageToCloudinary(file.buffer);
        data.photo = photoUrl;
    }
    const newContact = await Contact.create(data);
    return newContact;
};

export const updateContactById = async (id, data, file) => {
    if (file) {
        const photoUrl = await uploadImageToCloudinary(file.buffer);
        data.photo = photoUrl;
    }
    const updatedContact = await Contact.findByIdAndUpdate(id, data, { new: true });
    return updatedContact;
};

export const deleteContactById = async (id, userId) => {
    return await Contact.findOneAndDelete({ _id: id, userId });
};



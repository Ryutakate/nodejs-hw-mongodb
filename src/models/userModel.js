import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        }, 
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            match: [/.+@.+\..+/, 'Must match a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
    },
    {
        timestamps: true,
    }
);

export const User = model('User', userSchema);

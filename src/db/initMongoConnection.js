import mongoose from 'mongoose';

export const initMongoConnection = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
        );
        console.log('Mongo connection successfully established!');
    } catch (error) {
        console.error('Mongo connection error:', error);
        process.exit(1);
    }
};

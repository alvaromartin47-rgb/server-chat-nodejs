import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatIdSchema = new Schema({
    idChat: { type: Number }
});

module.exports = mongoose.model('chatId', chatIdSchema);
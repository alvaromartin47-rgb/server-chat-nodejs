import mongoose from 'mongoose';
const { Schema } = mongoose;

const userConnectionSchema = new Schema({
    socketId: { type: String, required: true },
    name: { type: String, required: true },
    idChat: { type: Number, required: true }
});

module.exports = mongoose.model('userConnection', userConnectionSchema);
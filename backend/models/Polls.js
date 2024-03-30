const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  qrCode: {
    type: Buffer // Store the QR code as a Buffer
  }
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;

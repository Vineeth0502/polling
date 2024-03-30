const mongoose = require('mongoose');

const pollResponseSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId }, // If you have user authentication
  selectedOption: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const PollResponse = mongoose.model('PollResponse', pollResponseSchema);

module.exports = PollResponse;

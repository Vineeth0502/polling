const mongoose = require('mongoose');

// Define the schema for the Comment model
const commentSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Polls', // Reference to the Poll model (assuming you have a Poll model)
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Comment model
const Comment = mongoose.model('Comment', commentSchema);

// Export the Comment model
module.exports = Comment;

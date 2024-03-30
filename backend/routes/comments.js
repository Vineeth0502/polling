const express = require('express');
const router = express.Router();
const Comment = require('../models/Comments');

module.exports = (io) => {
  // POST route to handle posting comments
  router.post('/', async (req, res) => {
    try {
      const { pollId, comment, userId } = req.body;

      const newComment = new Comment({
        pollId,
        comment,
        userId
      });

      await newComment.save();

      // Emit the new comment to connected clients
      io.emit('newComment', { pollId, comment, userId });

      // Optionally, you can save the comment to your database

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  router.get('/:pollId', async (req, res) => {
    try {
      const pollId = req.params.pollId;
      
      // Query the database for poll responses with the given poll ID
      const responses = await Comment.find({ pollId });
      
      // Return the responses as JSON
      res.status(200).json({ success: true, data: responses });
    } catch (error) {
      console.error('Error fetching poll responses:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};

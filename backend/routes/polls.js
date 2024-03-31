const express = require('express');
const router = express.Router();
const Poll = require('../models/Polls');
const QRCode = require('qrcode');

module.exports = (io) => {
  // POST route to create a new poll
  router.post('/', async (req, res) => {
    try {
      const { question, options, userId, isActive } = req.body;
      
      // Create the poll
      const poll = await Poll.create({ question, options, userId, isActive });
  
      // Generate QR code for poll ID
      const pollURL = `https://polling-3zpd.vercel.app/singlepoll/${poll.id}`;
      const qrCodeDataURL = await QRCode.toDataURL(pollURL);
      // const qrCodeData = JSON.stringify({ pollId: poll.id });
      // const qrCodeDataURL = await QRCode.toDataURL(qrCodeData);
  
      // Convert the QR code Data URL to Base64
      const base64QRCode = qrCodeDataURL.split(',')[1]; // Remove the data prefix
      const qrCodeBuffer = Buffer.from(base64QRCode, 'base64');
  
      // Store the QR code as Buffer in the database
      poll.qrCode = qrCodeBuffer;
      await poll.save();
  
      // Emit the newly created poll to all connected clients
      io.emit('newPoll', poll);
  
      // Respond with the ID of the created poll
      res.json({ polls: { id: poll.id } });
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ error: 'Error creating poll' });
    }
  });

  
  // GET route to fetch all polls
  router.get('/', async (_req, res) => {
    try {
      // Fetch all polls from the database
      const polls = await Poll.find({ isActive: true });
      res.json({ polls });
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: 'Error fetching polls' });
    }
  });

  router.get('/deactive', async (_req, res) => {
    try {
      // Fetch all polls from the database
      const polls = await Poll.find({ isActive: false });
      res.json({ polls });
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: 'Error fetching polls' });
    }
  });

  // Route to fetch a single poll by its ID
router.get('/:id', async (req, res) => {
  try {
    // Fetch the poll by its ID
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ poll });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ error: 'Error fetching poll' });
  }
});

  router.get('/history/active/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      // Fetch polls created by the specified user
      const userPolls = await Poll.find({ userId, isActive: true });

      // Respond with the user's polls
      res.json({ userPolls });
    } catch (error) {
      console.error("Error fetching user's polls:", error);
      res.status(500).json({ error: "Error fetching user's polls" });
    }
  });

  router.get('/history/deactive/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      // Fetch polls created by the specified user
      const userPolls = await Poll.find({ userId, isActive: false });

      // Respond with the user's polls
      res.json({ userPolls });
    } catch (error) {
      console.error("Error fetching user's polls:", error);
      res.status(500).json({ error: "Error fetching user's polls" });
    }
  });

  router.put('/end/:pollId', async (req, res) => {
    try {
      const pollId = req.params.pollId;
  
      // Update the isActive status of the poll to false
      const updatedPoll = await Poll.findByIdAndUpdate(pollId, { isActive: false }, { new: true });
  
      if (!updatedPoll) {
        console.error('Poll not found');
        return res.status(404).json({ error: 'Poll not found' });
      }
  
      // Respond with the updated poll
      res.json({ updatedPoll });
    } catch (error) {
      console.error('Error ending polling:', error);
      res.status(500).json({ error: 'Error ending polling' });
    }
  });

  router.put('/reopen/:pollId', async (req, res) => {
    try {
      const pollId = req.params.pollId;
  
      // Update the isActive status of the poll to true
      const updatedPoll = await Poll.findByIdAndUpdate(pollId, { isActive: true }, { new: true });
  
      if (!updatedPoll) {
        console.error('Poll not found');
        return res.status(404).json({ error: 'Poll not found' });
      }
  
      // Respond with the updated poll
      res.json({ updatedPoll });
    } catch (error) {
      console.error('Error reopening polling:', error);
      res.status(500).json({ error: 'Error reopening polling' });
    }
  });

  router.delete('/:pollId', async (req, res) => {
    try {
      const pollId = req.params.pollId;
  
      // Find the poll by ID and delete it
      await Poll.findByIdAndDelete(pollId);
  
      res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
      console.error('Error deleting poll:', error);
      res.status(500).json({ error: 'Error deleting poll' });
    }
  });
  

  return router;
};

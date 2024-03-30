const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const PollResponse = require('../models/PollResponse'); // Assuming you have a PollResponse model

// Route to handle submission of poll responses
router.post('/', async (req, res) => {
  try {
    // Extract poll response data from the request body
    const { pollId, userId, selectedOption } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Create a new poll response document
    const pollResponse = new PollResponse({
      pollId,
      userId, // If you have user authentication
      selectedOption,
      submittedAt: new Date(), // Timestamp
    });

    // Save the poll response to the database
    await pollResponse.save();

    // Respond with a success message
    res.status(201).json({ message: 'Poll response submitted successfully' });
  } catch (error) {
    console.error('Error submitting poll response:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}); 

router.get('/:pollId', async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const responses = await PollResponse.find({ pollId });
    const totalVotes = responses.length;
    const optionCounts = {};
    const userVotes = {}; // Object to store user IDs for each option
    responses.forEach((response) => {
      // Count the number of votes for each option
      optionCounts[response.selectedOption] = (optionCounts[response.selectedOption] || 0) + 1;
      // Store user ID for the option
      if (!userVotes[response.selectedOption]) {
        userVotes[response.selectedOption] = [];
      }
      userVotes[response.selectedOption].push(response.userId);
    });
    const percentages = {};
    for (const option in optionCounts) {
      // Calculate percentages for each option
      percentages[option] = ((optionCounts[option] / totalVotes) * 100).toFixed(2);
    }
    res.json({ success: true, data: { percentages, totalVotes, userVotes } }); // Include userVotes in the response
  } catch (error) {
    console.error('Error fetching poll responses:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to check if the user has already voted on a poll
router.get('/hasVoted/:userId/:pollId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const pollId = req.params.pollId;

    // Check if the user has already voted on the specified poll
    const existingResponse = await PollResponse.findOne({ userId, pollId: new ObjectId(pollId) });

    // If an existing response is found, the user has already voted
    const hasVoted = !!existingResponse;

    // Respond with whether the user has voted or not
    res.json({ hasVoted });
  } catch (error) {
    console.error("Error checking if user has voted:", error);
    res.status(500).json({ error: 'Error checking if user has voted' });
  }
});

router.get('/fetchpoll/:userId/:pollId', async (req, res) => {
  try {
    const { userId, pollId } = req.params;
    
    // Find the poll response for the given user and poll ID
    const pollResponse = await PollResponse.findOne({ userId, pollId });
    
    if (!pollResponse) {
      return res.status(404).json({ message: 'Poll response not found' });
    }

    // Send the selected option for the poll
    res.json({ selectedOption: pollResponse.selectedOption });
  } catch (error) {
    console.error('Error fetching poll response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

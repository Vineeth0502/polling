import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePoll.css';

const PollHistory = () => {
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null); // To store the ID of the selected poll
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  
  const fetchPollHistory = async () => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/polls/history/deactive/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPolls(data.userPolls); 
      } else {
        console.error('Failed to fetch poll history');
      }
    } catch (error) {
      console.error('Error fetching poll history:', error);
    }
  };

  const fetchPollPercentages = async (pollId) => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/pollResponses/${pollId}`);
      if (response.ok) {
        const data = await response.json();
        // Update the state with the selected poll ID and its percentages
        setSelectedPollId(pollId);
        setPolls(prevPolls => prevPolls.map(poll => poll._id === pollId ? {...poll, percentages: data.percentages} : poll));
      } else {
        console.error('Failed to fetch poll percentages');
      }
    } catch (error) {
      console.error('Error fetching poll percentages:', error);
    }
  };

  const reopenPolling = async (pollId) => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/polls/reopen/${pollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Poll successfully reopened');
        // Refresh poll history after updating the poll status
        fetchPollHistory();
      } else {
        console.error('Failed to reopen poll');
      }
    } catch (error) {
      console.error('Error reopening poll:', error);
    }
  };

  const deletePoll = async (pollId) => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/polls/${pollId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Remove the deleted poll from the state
        setPolls(prevPolls => prevPolls.filter(poll => poll._id !== pollId));
        console.log('Poll deleted successfully');
      } else {
        console.error('Failed to delete poll');
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  useEffect(() => {
    fetchPollHistory();
  }, []);

  const handlePollClick = (pollId) => {
    // Redirect to a new page with the poll statistics
    navigate(`/poll/${pollId}`);
  };

  return (
    <div className="poll-history-container">
      <h2 className="mb-4">Poll History</h2>
      {polls.length === 0 ? (
        <p>No previous polls available.</p>
      ) : (
        <div className="row row-cols-1">
          {polls.map((poll) => (
            <div className="col mb-4" key={poll._id}>
              <div className="card w-100">
                <div className="card-body" style={{ cursor: "pointer" }} >
                <h5 className="card-title d-flex justify-content-between align-items-center" onClick={() => handlePollClick(poll._id)}>
  <span>{poll.question}</span>
  <span className="text-danger" style={{ fontSize: "15px" }}>• Completed</span>
</h5>                  <ul className="list-group">
                    {poll.options?.map((option, index) => (
                      <li 
                        key={index} 
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          {option}
                          {/* Display the percentage if the poll ID matches the selected poll ID */}
                          {selectedPollId === poll._id && <span className="badge badge-light ml-2">{poll.percentages?.[option]}%</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Pass the poll ID to fetchPollPercentages */}
                  <button className="btn btn-primary btn-sm" onClick={() => {reopenPolling(poll._id) }} style={{ marginTop: "9px", marginBottom: "-8px" }}>Reopen Poll</button>
                  <button className="btn btn-success btn-sm" onClick={() => {handlePollClick(poll._id) }} style={{ marginTop: "9px", marginBottom: "-8px" }}>View Result</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {deletePoll(poll._id) }} style={{ marginTop: "9px", marginBottom: "-8px" }}>Delete Poll</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PollHistory;

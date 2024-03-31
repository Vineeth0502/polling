import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PollResults = () => {
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null); // To store the ID of the selected poll
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  
  const fetchPollHistory = async () => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/polls/history/active/${userId}`);
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

  const endPolling = async (pollId) => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/polls/end/${pollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Poll successfully ended');
        // Refresh poll history after updating the poll status
        fetchPollHistory();
      } else {
        console.error('Failed to end poll');
      }
    } catch (error) {
      console.error('Error ending poll:', error);
    }
  };

  useEffect(() => {
    fetchPollHistory();
  }, []);

  const handlePollClick = (pollId) => {
    // Redirect to a new page with the poll statistics
    navigate(`/poll/${pollId}`);
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};


  return (
    <div>
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
  <span className="text-success" style={{ fontSize: "15px" }}>• Active</span>
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
                  {poll.qrCode && (
                        <div>
                            <h2>QR Code:</h2>
                            <img src={`data:image/png;base64,${arrayBufferToBase64(poll.qrCode.data)}`} alt="QR Code" />
                        </div>
                    )}
                  {/* Pass the poll ID to fetchPollPercentages */}
                  <button className="btn btn-primary btn-sm" onClick={() => {endPolling(poll._id) }} style={{ marginTop: "9px", marginBottom: "-8px" }}>End Polling</button>
                  <button className="btn btn-success btn-sm" onClick={() => {handlePollClick(poll._id) }} style={{ marginTop: "9px", marginBottom: "-8px" }}>View Result</button>
                </div>
              </div>
            </div>
            
          ))}
        </div>
        
      )}
    </div>
  );
};

export default PollResults;

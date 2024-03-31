import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';

const Singlepoll = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPollId, setSelectedPollId] = useState(null); // State to track the currently selected poll ID
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [hasVoted, setHasVoted] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const pollResponse = await fetch(`https://polling-chi.vercel.app/api/pollResponses/fetchpoll/${userId}/${pollId}`);
        const pollResponseData = await pollResponse.json();
  
        const responseOption = pollResponseData.selectedOption || null;
        setSelectedOption(responseOption);
        console.log("responseOption",responseOption)
        const response = await fetch(`https://polling-chi.vercel.app/api/polls/${pollId}`);
        if (response.ok) {
          const pollData = await response.json();
          setPoll({ ...pollData.poll, selectedOption: responseOption });
          checkHasVoted(pollId);
        } else {
          console.error('Failed to fetch poll');
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    };
  
    fetchPoll();
  }, [pollId]);
  
  const checkHasVoted = async (pollId) => {
    try {
      const response = await fetch(`https://polling-chi.vercel.app/api/pollResponses/hasVoted/${userId}/${pollId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasVoted) {
          setHasVoted(true);
          setUserAnswer(data.selectedOption);
        }
      } else {
        console.error('Failed to check if user has voted');
      }
    } catch (error) {
      console.error('Error checking if user has voted:', error);
    }
  };

  const submitPollResponse = async () => {
    try {
      const response = await fetch('https://polling-chi.vercel.app/api/pollResponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollId, userId, selectedOption }),
      });

      if (response.ok) {
        console.log('Poll response submitted successfully');
        setHasVoted(true);
        setUserAnswer(selectedOption);
      } else {
        console.error('Failed to submit poll response');
      }
    } catch (error) {
      console.error('Error submitting poll response:', error);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const clearVote = () => {
    setSelectedOption(null);
  };

  const viewResults = () => {
    navigate(`/comment/${pollId}`);
  };

  useEffect(() => {
    // Check if userId exists in localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
        // User is logged in, allow access
        setIsLoggedIn(true);
    } else {
        // User is not logged in, redirect to login page
window.location.href = '/studentlogin';      }
}, []);

// If user is not logged in, render nothing or a message
if (!isLoggedIn) {
    return null;
}


  return (
    <>
      <div className="container">
        <h1 className="text-center mt-5">Poll Details</h1>
        {poll && (
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">{poll.question}</h5>
              {hasVoted && (
                <p className="text-muted">You have already voted. Your answer: {userAnswer}</p>
              )}
              <form>
                {poll.options.map((option, idx) => (
                  <div key={idx} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pollOption"
                      id={`option-${idx}`}
                      value={option}
                      checked={selectedOption == option}
                      onChange={() => handleOptionSelect(option)}
                      disabled={hasVoted}
                    />
                    <label className="form-check-label" htmlFor={`option-${idx}`}>
                      {option}
                    </label>
                  </div>
                ))}
              </form>
            </div>
            <div className="card-footer">
              <button
                className="btn btn-primary me-2"
                onClick={submitPollResponse}
                disabled={!selectedOption || hasVoted}
              >
                Submit
              </button>
              <button
                className="btn btn-secondary me-2"
                onClick={clearVote}
                disabled={!selectedOption || hasVoted}
              >
                Clear Vote
              </button>
              <button className="btn btn-info" onClick={viewResults}>
                View Results
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Singlepoll;

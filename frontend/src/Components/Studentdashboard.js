import { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import io from 'socket.io-client';
import './TeacherDashboard.css';

const socket = io('http://localhost:5000');

const StudentDashboard = () => {
  const [polls, setPolls] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedPollId, setSelectedPollId] = useState(null); // State to track the currently selected poll ID
  const [pollResults, setPollResults] = useState(null);
  const [votedPolls, setVotedPolls] = useState([]); // State to store the IDs of polls the user has already voted on
  const [hasVotedMap, setHasVotedMap] = useState({}); // Store whether user has voted for each poll
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleOptionSelect = (pollId, option) => {
    setSelectedOptions({ ...selectedOptions, [pollId]: option });
    setSelectedPollId(pollId);
  };
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

// useEffect to fetch polls and user's previous responses
useEffect(() => {
  const fetchPollsAndResponses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('https://polling-chi.vercel.app/api/polls');
      if (response.ok) {
        const data = await response.json();
        const fetchedPolls = data.polls;

        const responsePromises = fetchedPolls.map(async (poll) => {
          const pollResponse = await fetch(`https://polling-chi.vercel.app/api/pollResponses/fetchpoll/${userId}/${poll._id}`);
          if (pollResponse.ok) {
            const responseData = await pollResponse.json();
            if (responseData.selectedOption) {
              return { ...poll, selectedOption: responseData.selectedOption };
            }
          }
          return poll; // Return the unmodified poll object if no response is found
        });

        const updatedPolls = await Promise.all(responsePromises);
        setPolls(updatedPolls);

        // Populate selectedOptions based on fetched data
        const initialSelectedOptions = {};
        updatedPolls.forEach((poll) => {
          if (poll.selectedOption) {
            initialSelectedOptions[poll._id] = poll.selectedOption;
          }
        });
        setSelectedOptions(initialSelectedOptions);
      } else {
        console.error('Failed to fetch polls');
      }
    } catch (error) {
      console.error('Error fetching polls and responses:', error);
    }
  };

  fetchPollsAndResponses();
}, []);

  const submitPollResponse = async (pollId, selectedOption) => {
    try {
      if (votedPolls.includes(pollId)) {
        console.error('You have already voted on this poll.');
        return;
      }

      const response = await fetch('https://polling-chi.vercel.app/api/pollResponses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollId, userId, selectedOption }),
      });

      if (response.ok) {
        console.log('Poll response submitted successfully');
        setSelectedOptions({ ...selectedOptions, [pollId]: null }); // Clear selected option after submission
        setVotedPolls([...votedPolls, pollId]); // Add the poll ID to the list of voted polls
      } else {
        console.error('Failed to submit poll response');
      }
    } catch (error) {
      console.error('Error submitting poll response:', error);
    }
  };

  const clearVote = () => {
    // Clear the selected option for the current poll
    setSelectedOptions({ ...selectedOptions, [selectedPollId]: null });
  };

  const viewResults = async (pollId) => {
    try {
      setSelectedPollId(pollId); // Set the selected poll ID when viewing results
      navigate(`/comment/${pollId}`);
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };



 // useEffect to check if user has voted for each poll
 useEffect(() => {
  const checkHasVoted = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const promises = polls.map(async (poll) => {
        const response = await fetch(`https://polling-chi.vercel.app/api/pollResponses/hasVoted/${userId}/${poll._id}`);
        if (response.ok) {
          const data = await response.json();
          setHasVotedMap((prevMap) => ({ ...prevMap, [poll._id]: data.hasVoted }));
          console.log(`User has voted for poll ${poll._id}: ${data.hasVoted}`);
        } else {
          console.error(`Failed to check if user has voted for poll ${poll._id}`);
        }
      });
      await Promise.all(promises);
    } catch (error) {
      console.error('Error checking if user has voted:', error);
    }
  };

  // Call checkHasVoted
  checkHasVoted();
}, [polls]);



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
  
  <div className="teacher-dashboard">

    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/studentdashboard">Student Dashboard</Link>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/studentdashboard">Current Polls</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pastpolls">Past Polls</Link>
            </li>
          </ul>
          <form className="d-flex">
            <Link className="btn btn-outline-danger" to="/">Logout</Link>
          </form>
        </div>
      </div>
    </nav>

    <div className="container">
      <h1 className="text-center mt-5">Current Polls</h1>
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <h2>Available Polls</h2>
          {polls.length === 0 ? (
            <p>No polls available at the moment.</p>
          ) : (
            <div className="mx-0 mx-sm-auto">
              {polls.map((poll) => (
                <div key={poll._id} className="card mb-3">
                  <div className="card-body">
                    <div className="text-center" onClick={() => viewResults(poll._id)} style={{ cursor: "pointer" }}>
                      <i className="far fa-file-alt fa-4x mb-3 text-primary"></i>
                       <p>
                        <strong>{poll.question}</strong>
                      </p>
                    </div>

                    <hr />

                    <form className="px-4">
                      {poll.options.map((option, idx) => (
                        <div key={idx} className="custom-radio">
                          <input
                            className="custom-radio-input"
                            type="radio"
                            name={`poll-${poll._id}-${idx}`}
                            id={`radio${poll._id}-${idx + 1}`}
                            value={option}
                            onChange={() => handleOptionSelect(poll._id, option)}
                            checked={selectedOptions[poll._id] === option}
                            disabled={hasVotedMap[poll._id]} // Disable if user has voted
                          />
                          <label className="custom-radio-label" htmlFor={`radio${poll._id}-${idx + 1}`}>
                            <div className="custom-radio-button"></div>
                            <span className="custom-radio-option">{option}</span>
                            {/* Display the user's selected option */}
                          
                          </label>
                        </div>
                      ))}
                    </form>
                  </div>
                  <div className="card-footer text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={clearVote}
                      disabled={!selectedOptions[poll._id] || selectedPollId !== poll._id}
                    >
                      Clear Vote
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={() => submitPollResponse(poll._id, selectedOptions[poll._id])}
                      disabled={!selectedOptions[poll._id] || selectedPollId !== poll._id || votedPolls.includes(poll._id)}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => viewResults(poll._id)}
                      >
                      Comment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {pollResults && (
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <h2>Poll Results</h2>
            <div>
              <p>Total Votes: {pollResults.totalVotes}</p>
              <ul>
                {Object.entries(pollResults.percentages).map(([option, percentage]) => (
                  <li key={option}>
                    Option: {option}, Percentage: {percentage}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  </>
);
};


export default StudentDashboard;

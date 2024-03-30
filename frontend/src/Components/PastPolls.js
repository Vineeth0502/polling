import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const StudentDashboard = () => {
  const [polls, setPolls] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [pollResults, setPollResults] = useState({});
  const [votedPolls, setVotedPolls] = useState([]);
  const [selectedOptionsFromServer, setSelectedOptionsFromServer] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/polls/deactive');
        if (response.ok) {
          const data = await response.json();
          setPolls(data.polls);

          // Fetch results for each poll
          let tempSelectedOptions = {};
          let promises = data.polls.forEach(async poll => {
            const res = await fetch(`http://localhost:5000/api/polls/${poll._id}/results`);
            if (res.ok) {
              const pollData = await res.json();
              setPollResults(prevResults => ({ ...prevResults, [poll._id]: pollData }));
            }
            const resSelectedOption = await fetch(`http://localhost:5000/api/pollResponses/fetchpoll/${userId}/${poll._id}`);
            if (resSelectedOption.ok) {
              const dataSelectedOption = await resSelectedOption.json();
              tempSelectedOptions = { ...tempSelectedOptions, [poll._id]: dataSelectedOption.selectedOption };            }
          });
          await Promise.all(promises);
          setSelectedOptionsFromServer(tempSelectedOptions);
        } else {
          console.error('Failed to fetch polls');
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPolls();

    socket.on('newPoll', (poll) => {
      setPolls((prevPolls) => [...prevPolls, poll]);
    });

    return () => {
      socket.off('newPoll');
    };
  }, []);

  const viewResults = (pollId) => {
    navigate(`/pastcomment/${pollId}`);
  };

  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Student Dashboard</Link>
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
        <h1 className="text-center mt-5">Past Polls</h1>
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
                              disabled={selectedOptionsFromServer[poll._id] !== option}
                              checked={selectedOptionsFromServer[poll._id] === option}
                            />
                            <label className="custom-radio-label" htmlFor={`radio${poll._id}-${idx + 1}`}>
                              <div className="custom-radio-button"></div>
                              <span className="custom-radio-option">{option}</span>
                              {pollResults && pollResults[poll._id] && pollResults[poll._id].percentages[option] && (
                                <span className="custom-radio-percent">({pollResults[poll._id].percentages[option]}%)</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </form>
                    </div>
                    <div className="card-footer text-end">
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => viewResults(poll._id)}
                        disabled={!votedPolls.includes(poll._id)}
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
  
        {pollResults && pollResults.percentages && (
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
    </>
  );
};

export default StudentDashboard;

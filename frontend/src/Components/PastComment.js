import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Chart from 'chart.js/auto';

const PastComment = () => {
  const { pollId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [socket, setSocket] = useState(null);
  const [poll, setPoll] = useState(null);
  const [percentages, setPercentages] = useState([]);
  const [showColumns, setShowColumns] = useState(false);
  const [votesData, setVotesData] = useState({});
  const userId = localStorage.getItem('userId');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);




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

  useEffect(() => {
    if (socket) {
      socket.on('newComment', ({ pollId: commentPollId, comment, userId }) => {
        if (commentPollId === pollId) {
          setComments((prevComments) => [...prevComments, comment, userId]);
        }
      });

      return () => {
        socket.off('newComment');
      };
    }
  }, [socket, pollId]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`https://polling-chi.vercel.app/api/polls/${pollId}`);
        if (response.ok) {
          const data = await response.json();
          setPoll(data.poll);
        } else {
          console.error('Failed to fetch poll data');
        }
      } catch (error) {
        console.error('Error fetching poll data:', error);
      }
    };

    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`https://polling-chi.vercel.app/api/comments/${pollId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.data);
        } else {
          console.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://polling-chi.vercel.app/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pollId, comment: newComment, userId })
      });
      
      if (response.ok) {
        console.log('Comment added successfully');
        setNewComment('');
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

      // Fetch poll percentages
      useEffect(() => {
        const fetchPollPercentages = async () => {
            try {
                // Fetch poll percentages
                const response = await fetch(`https://polling-chi.vercel.app/api/pollResponses/${pollId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch poll percentages');
                }
                const data = await response.json();
                setPercentages(data.data.percentages);
            } catch (error) {
                console.error('Error fetching poll percentages:', error);
            }
        };
        fetchPollPercentages();
    }, [pollId]);


    useEffect(() => {
      if (poll && percentages) {
          createBarChart();
      }
  }, [poll, percentages]);

  // Function to create the bar chart
  const createBarChart = () => {
      const ctx = document.getElementById('barChart');
  
      // Check if a chart instance already exists
      if (window.myBarChart instanceof Chart) {
          window.myBarChart.destroy(); // Destroy the existing chart
      }
  
      // Create new chart instance
      window.myBarChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: poll.options.map(option => option),
              datasets: [{
                  label: 'Percentage',
                  data: poll.options.map(option => parseFloat(percentages[option]) || 0), // Fetch percentage for each option
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.5)',
                      'rgba(54, 162, 235, 0.5)',
                      'rgba(255, 206, 86, 0.5)',
                      'rgba(75, 192, 192, 0.5)',
                      // Add more colors if needed
                  ],
                  borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      // Add more colors if needed
                  ],
                  borderWidth: 1
              }]
          },
          options: {
            aspectRatio: 2,
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  };





  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          {/* Display the poll on the left side */}
          {poll && (
            <div className="card mb-3">
              <div className="card-body">
                <div className="text-center">
                  <i className="far fa-file-alt fa-4x mb-3 text-primary"></i>
                  <p>
                    <strong>{poll.question}</strong>
                  </p>
                </div>
                <hr />
                <ul>
                  {poll.options.map((option, idx) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
              </div>
              <canvas id="barChart" style={{marginTop: "30px"}}></canvas>

            </div>
          )}
        </div>
        <div className="col-md-6">
          {/* Comment box on the right side */}
          
          {/* Display comments */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Comments</h5>
              <ul className="list-group list-group-flush">
                {comments.map((comment, idx) => (
                  <li key={idx} className="list-group-item">{comment.userId}: {comment.comment}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastComment;



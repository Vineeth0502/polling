import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';


export default function PollPage() {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [percentages, setPercentages] = useState([]);
    const [showColumns, setShowColumns] = useState(false);
    const [votesData, setVotesData] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const fetchPollData = async () => {
            try {
                // Fetch poll data
                const pollResponse = await fetch(`http://localhost:5000/api/polls/${pollId}`);
                if (!pollResponse.ok) {
                    throw new Error('Failed to fetch poll data');
                }
                const pollData = await pollResponse.json();

                setPoll(pollData.poll);
                console.log("sss",poll.question)

            } catch (error) {
                console.error('Error fetching poll data:', error);
            }
        };
        fetchPollData();
    }, [pollId]);



useEffect(() => {
    // Check if userId exists in localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
        // User is logged in, allow access
        setIsLoggedIn(true);
    } else {
        // User is not logged in, redirect to login page
window.location.href = '/teacherlogin';      }
}, []);



    // Fetch votes data for each option
    useEffect(() => {
        const fetchVotesData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/pollResponses/${pollId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch votes data');
                }
                const data = await response.json();
                // Format the votes data
                const formattedData = {};
                Object.keys(data.data.userVotes).forEach(option => {
                    formattedData[option] = data.data.userVotes[option];
                });
    
                // Fetch user names based on user IDs
                const updatedFormattedData = {};
                for (const option in formattedData) {
                    const userIds = formattedData[option];
                    const userNames = await Promise.all(userIds.map(async userId => {
                        const userResponse = await fetch(`http://localhost:5000/api/studentauth/getusername/${userId}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            return userData.username;
                        }
                        return null;
                    }));
                    updatedFormattedData[option] = userNames;
                }
    
                console.log("Updated formatted data:", updatedFormattedData); // Check the updatedFormattedData
                setVotesData(updatedFormattedData);
            } catch (error) {
                console.error('Error fetching votes data:', error);
            }
        };
        fetchVotesData();
    }, [pollId]);

    // Fetch poll percentages
    useEffect(() => {
        const fetchPollPercentages = async () => {
            try {
                // Fetch poll percentages
                const response = await fetch(`http://localhost:5000/api/pollResponses/${pollId}`);
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






    // Create bar chart once both poll data and percentages are fetched
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
            type: 'bar',
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
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

     // Function to convert ArrayBuffer to Base64
     const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };
    
    // Function to handle the "Visualise" button click
    const handleVisualiseClick = () => {
        setShowColumns(true);
        console.log(votesData)
    };

    return (
        <div>
            <div>
                <h1 className="mb-4 text-center">Poll Page</h1>
                {poll && (
                    <div className="card">
                        <div className="card-body" style={{width: "50%", height: "340px"}}>
                            <h2 className="card-title">Poll Question:</h2>
                            <p className="card-text">{poll.question}</p>
                            <h3 className="card-subtitle mb-2 mt-4">Poll Options:</h3>
                            <ul className="list-group">
                                {poll.options.map((option, index) => (
                                    <li key={index} className="list-group-item">{option}</li>
                                ))}
                            </ul>
                            {/* {poll.qrCode && (
                        <div>
                            <h2>QR Code:</h2>
                            <img src={`data:image/png;base64,${arrayBufferToBase64(poll.qrCode.data)}`} alt="QR Code" />
                        </div>
                    )} */}
                        </div>
                    </div>
                    
                )}
              
        
            </div>
                <button className='btn btn-primary mt-3' onClick={handleVisualiseClick} style={{position: "absolute", right: "20%", top: "78%"}}>Visualise</button>
            <div style={{ flex: 1 }}>
                <div style={{ position: 'absolute', right: '0', top: '0', width: '50%' }}>
                    
                    <canvas id="barChart" style={{marginTop: "90px"}}></canvas>
                </div>
            </div>
            {showColumns && (
                 <div className="row mt-8">
                 <div className="col" style={{ marginTop: "100px" }}>
                     <h2 className="text-center">Poll Breakdown</h2>
                     <div className="row">
                         {poll && poll.options.map((option, index) => (
                             <div key={index} className={`col-md-${Math.floor(12 / poll.options.length)} text-center`}>
                                 <h4>{option}</h4>
                                 <ul className="list-group">
                                     {votesData[option] && votesData[option].map((userName, idx) => (
                                         <li key={idx} className="list-group-item">{userName}</li>
                                     ))}
                                 </ul>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
            )}  
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import './PollPage.css'; // Import custom CSS file for additional styling

export default function PollPage() {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [percentages, setPercentages] = useState([]);
    const [votesData, setVotesData] = useState({});
    const [showColumns, setShowColumns] = useState(false);

    useEffect(() => {
        const fetchPollData = async () => {
            try {
                const pollResponse = await fetch(`https://polling-chi.vercel.app/api/polls/${pollId}`);
                if (!pollResponse.ok) {
                    throw new Error('Failed to fetch poll data');
                }
                const pollData = await pollResponse.json();
                setPoll(pollData.poll);
            } catch (error) {
                console.error('Error fetching poll data:', error);
            }
        };
        fetchPollData();
    }, [pollId]);

    useEffect(() => {
        const fetchVotesData = async () => {
            try {
                const response = await fetch(`https://polling-chi.vercel.app/api/pollResponses/${pollId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch votes data');
                }
                const data = await response.json();
                const formattedData = {};
                Object.keys(data.data.userVotes).forEach(option => {
                    formattedData[option] = data.data.userVotes[option];
                });
                const updatedFormattedData = {};
                for (const option in formattedData) {
                    const userIds = formattedData[option];
                    const userNames = await Promise.all(userIds.map(async userId => {
                        const userResponse = await fetch(`https://polling-chi.vercel.app/api/studentauth/getusername/${userId}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            return userData.username;
                        }
                        return null;
                    }));
                    updatedFormattedData[option] = userNames;
                }
                setVotesData(updatedFormattedData);
            } catch (error) {
                console.error('Error fetching votes data:', error);
            }
        };
        fetchVotesData();
    }, [pollId]);

    useEffect(() => {
        const fetchPollPercentages = async () => {
            try {
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

    const createBarChart = () => {
        const ctx = document.getElementById('barChart');
        if (window.myBarChart instanceof Chart) {
            window.myBarChart.destroy();
        }
        window.myBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: poll ? poll.options : [],
                datasets: [{
                    label: 'Percentage',
                    data: poll ? poll.options.map(option => parseFloat(percentages[option]) || 0) : [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
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

    const handleVisualiseClick = () => {
        setShowColumns(true);
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Poll Page</h1>
            {poll && (
                <Card className="mb-4">
                    <Card.Body>
                        <Card.Title>Poll Question:</Card.Title>
                        <Card.Text>{poll.question}</Card.Text>
                        <Card.Subtitle className="mb-2 mt-4">Poll Options:</Card.Subtitle>
                        <ul className="list-group">
                            {poll.options.map((option, index) => (
                                <li key={index} className="list-group-item">{option}</li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            )}
            <Button className='btn btn-primary mt-3' onClick={handleVisualiseClick}>Visualise</Button>
            <Row className="mt-4">
                <Col>
                    <canvas id="barChart"></canvas>
                </Col>
                {showColumns && (
                    <Col>
                        <h2 className="text-center mb-4">Poll Breakdown</h2>
                        <Row>
                            {poll && poll.options.map((option, index) => (
                                <Col key={index} xs={12} md={6} className="mb-4">
                                    <h4 className="text-center">{option}</h4>
                                    <ul className="list-group">
                                        {votesData[option] && votesData[option].map((userName, idx) => (
                                            <li key={idx} className="list-group-item">{userName}</li>
                                        ))}
                                    </ul>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

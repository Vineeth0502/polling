import React, { useState, useRef } from 'react';
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import './CreatePoll.css'; 

export default function CreatePoll({ onCreatePoll }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const formRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(userId)
    const pollData = {
      question,
      options: options.filter(option => option.trim() !== ''),
      userId: userId,
      isActive: true
    };

    try {
      const response = await fetch('https://polling-chi.vercel.app/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pollData)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Successfully created poll");
        window.location.href = '/Teacherdashboard#pollResults';

        onCreatePoll(data.polls.id);
        formRef.current.reset(); // Reset the form fields
      } else {
        console.error('Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card create-poll-card">
            <div className="card-body">
              <h3 className="card-title text-center">Create Poll</h3>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="question" className="form-label create-poll-label">Question:</label>
                  <input type="text" id="question" className="form-control create-poll-input" value={question} onChange={(e) => setQuestion(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label create-poll-label">Options:</label>
                  {options.map((option, index) => (
                    <div key={index} className="input-group mb-3">
                      <input type="text" className="form-control create-poll-input" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} />
                      {index > 1 && (
                        <button type="button" className="btn btn-danger create-poll-remove-btn" onClick={() => handleRemoveOption(index)} style={{height: "52px"}}>
                          <FiMinusCircle />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-primary create-poll-add-btn" onClick={handleAddOption}>
                    <FiPlusCircle />
                    Add Option
                  </button>
                </div>
                <button type="submit" className="btn btn-primary create-poll-submit-btn">Create Poll</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

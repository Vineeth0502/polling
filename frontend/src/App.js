import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Teacherlogin from './Components/Teacherlogin'; 
import Teacheregister from './Components/Teacheregister'; 
import Studentlogin from './Components/Studentlogin'; 
import Studentregister from './Components/Studentregister'; 
import Home from './Components/Home'; 
import TeacherDashboard from './Components/Teacherdashboard';
import StudentDashboard from './Components/Studentdashboard';
import PollPage from './Components/PollPage';
import CommentPage from './Components/CommentPage';
import PastPolls from './Components/PastPolls';
import PastComment from './Components/PastComment';
import Singlepoll from './Components/Singlepoll';
import Example from './Components/Example';

import { useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  const socket = io('http://localhost:5000');
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacherlogin" element={<Teacherlogin />} />
          <Route path="/teacheregister" element={<Teacheregister />} />
          <Route path="/studentlogin" element={<Studentlogin />} />
          <Route path="/studentregister" element={<Studentregister />} />
          <Route path="/Teacherdashboard" element={<TeacherDashboard />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/poll/:pollId" element={<PollPage />} />
          <Route path="/comment/:pollId" element={<CommentPage />} />
          <Route path="/pastcomment/:pollId" element={<PastComment />} />
          <Route path="/pastpolls" element={<PastPolls />} />
          <Route path="/singlepoll/:pollId" element={<Singlepoll />} />
          <Route path="/example" element={<Example />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;

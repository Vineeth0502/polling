import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import './Home.css'; // Import CSS file for additional styles

export default function Home() {
  return (
    <div className="container-fluid text-center py-5 background-gradient d-flex align-items-center">
      <div className="container">
        <h1 className="display-4 mb-4 text-white title">Empower Education with Real-Time Polling</h1>
        <p className="lead mb-5 text-white">Empowering educators and students through interactive learning</p>

        <div className="row justify-content-center">
          <div className="col-md-6 mb-4">
            <div className="card bg-light">
              <div className="card-body">
                <h2 className="card-title text-primary"><FaChalkboardTeacher className="mr-2" /> Teachers</h2>
                <p className="card-text">Access powerful tools to create and manage polls for your classes.</p>
                <Link to="/teacherlogin" className="btn btn-primary btn-lg">Login as Teacher</Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card bg-light">
              <div className="card-body">
                <h2 className="card-title text-success"><FaUserGraduate className="mr-2" /> Students</h2>
                <p className="card-text">Engage in real-time polls and enhance your learning experience.</p>
                <Link to="/studentlogin" className="btn btn-success btn-lg">Login as Student</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

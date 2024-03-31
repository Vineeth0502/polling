import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

function TeacherLogin() {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("https://polling-chi.vercel.app/api/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        const json = await response.json();

        if (json.success) {
            localStorage.setItem('token', json.authtoken);
           localStorage.setItem('userId', json.data.user.id);
            window.location.href = '/Teacherdashboard';
            alert("success")
        } else {
            setErrorMessage("Invalid credentials");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container-fluid text-center py-5 background-gradient d-flex justify-content-center align-items-center">
            <div className="card login-card">
                <div className="card-body">
                    <h2 className="mb-4 text-blue">Teacher Login</h2>
                    <form className="d-flex flex-column my-5" onSubmit={handleSubmit}>
                        <input className='form-control mb-4' type='email' placeholder='Email Address' value={credentials.email} onChange={onChange} name="email" />
                        <input className='form-control mb-4' type='password' placeholder='Password' value={credentials.password} onChange={onChange} name="password" />
                        <div className="d-flex justify-content-between align-items-center pb-3">
                            <a href="!#" className="forgot-password-link text-blue">Forgot password?</a>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block mb-4">Sign in</button>
                        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                        <div className="text-center">
                            <p className="text-blue">Not a member? <Link to="/teacheregister" className="text-primary">Register</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TeacherLogin;

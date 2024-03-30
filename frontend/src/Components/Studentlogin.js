import React, { useState } from 'react';
import { Link } from 'react-router-dom';



function App() {

    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/api/studentauth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        const json = await response.json();

        if (json.success) {
            localStorage.setItem('token', json.authtoken);
            console.log(json.data.user.id)
            localStorage.setItem('userId', json.data.user.id); // Save userId
            window.location.href = '/studentdashboard';
            alert("success")
        } else {
            setErrorMessage("Invalid credentials");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };




  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
    <div className="card" style={{width: "34rem"}}>
        <div class="card-body">
        <form className="d-flex flex-column my-5" onSubmit={handleSubmit}>

        <input className='mb-4' id='form1' type='email' placeholder='Email Address' value={credentials.email} onChange={onChange} name="email"/>
        <input className='mb-4' id='form2' type='password' placeholder='Password' value={credentials.password} onChange={onChange} name="password"/>

        <div className="d-flex justify-content-center align-items-center pb-3">
            <a href="!#">Forgot password?</a>
        </div>

        <button type="submit" className="btn btn-primary mb-4">Sign in</button>
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

        <div className="text-center">
            <p>Not a member?<Link to="/studentregister">Register</Link></p>
        </div>

        </form>
        </div>
        </div>
        </div>
  );
}

export default App;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function App() {

    const [credentials, setCredentials] = useState({ name: "", email: "", password: "" });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate password length
        if (credentials.password.length < 5) {
            setErrorMessage("Password must be at least 5 characters");
            return;
        }
    
        const response = await fetch("http://localhost:5000/api/studentauth/createuser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password })
        });
    
        try {
            const json = await response.json();
            console.log(json);
    
            if (response.ok) {
                setSuccessMessage("Registration successful");
                setTimeout(() => {
                    window.location.href = '/studentlogin';
                }, 2000); 
            } else {
                if (response.status === 400 && json.error === "Sorry a user with this email already exists") {
                    setErrorMessage("Email already exists. Please login.");
                } else {
                    setErrorMessage(json.error || "Registration failed");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred. Please try again.");
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

        <input className='mb-4' id='form1' type='text' placeholder='Name' value={credentials.name} onChange={onChange} name='name'/>
        <input className='mb-4' id='form2' type='email' placeholder='Email' value={credentials.email} onChange={onChange} name="email"/>
        <input className='mb-4' id='form2' type='password' placeholder='Password'value={credentials.password} onChange={onChange} name="password"/>

        <button type="submit" className="btn btn-primary mb-4">Create Account</button>
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}


        <div className="text-center">
            <p>Already a member? <Link to="/studentlogin">Login</Link></p>
        </div>

        </form>
        </div>
        </div>
        </div>
  );
}

export default App;
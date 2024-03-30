import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Example() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    // If user is not logged in, render nothing or a message
    if (!isLoggedIn) {
        return null;
    }

    // If user is logged in, render the content of the restricted page
    return (
        <div>
            <h1>Restricted Page</h1>
            <p>This is a restricted page accessible only to logged-in users.</p>
        </div>
    );
}

export default Example;

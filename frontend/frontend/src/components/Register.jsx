import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';
import API from '../api'

const Register = ({ setShowLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // await axios.post('http://localhost:5000/api/auth/register', {
            await API.post('/auth/register', {    
            username,
                email,
                password,
                role,
            });
            alert("Registration successful! Please login.");
            setShowLogin(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleRegister} className="auth-box">
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button type="submit">Register</button>

                <p className="switch-auth">
                    Already have an account? <span onClick={() => setShowLogin(true)} className="link">Login</span>
                </p>
            </form>
        </div>
    );
};

export default Register;

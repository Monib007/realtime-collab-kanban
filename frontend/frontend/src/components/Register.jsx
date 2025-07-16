import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setShowLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // 👈 Default role
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password,
                role,   // 👈 Send role to backend
            });
            alert("Registration successful! Please login.");
            setShowLogin(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                
                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button type="submit" style={{ width: '100%', padding: '10px' }}>Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <p>Already have an account? <span onClick={() => setShowLogin(true)} style={{ color: 'blue', cursor: 'pointer' }}>Login</span></p>
        </div>
    );
};

export default Register;

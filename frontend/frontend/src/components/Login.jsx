import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';
import API from '../api'

const Login = ({ setShowLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post("http://localhost:5000/api/auth/login", {
      const res = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      login(res.data.user, res.data.token); // ✅ This sets both user + token + localStorage

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-box">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Login</button>
        <p className="switch-auth">
          Don’t have an account?{" "}
          <span onClick={() => setShowLogin(false)} className="link">
            Register
          </span>

        </p>
      </form>
    </div>
  );
};

export default Login;

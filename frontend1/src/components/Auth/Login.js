import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/login",
        { ...inputValue },
        { withCredentials: true }
      );

      const { success, message, username } = data; 
      if (success) {
        handleSuccess(message);
        sessionStorage.setItem("username", username); // Store username in sessionStorage
        setTimeout(() => {
          navigate("/dashboard"); // Redirect to dashboard after successful login
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      handleError("An error occurred. Please try again.");
      console.error("Login error:", error);
    }
    
    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div className="login-page">
      <div className="form_container">
        <h2>Login Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form_group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
              required
            />
          </div>
          <div className="form_group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
              required
            />
          </div>
          <button type="submit">Login</button>
          <span className="redirect_text">
            Don't have an account? <Link to="/register">Signup</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;

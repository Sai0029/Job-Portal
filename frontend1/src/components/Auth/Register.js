import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaPhone, FaBuilding, FaEnvelope, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [inputValue, setInputValue] = useState({
    name: "",
    phone: "",
    companyName: "",
    companyEmail: "",
    employeeSize: "",
  });
  const [emailOTP, setEmailOTP] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOTPInputs, setShowOTPInputs] = useState(false);

  const { name, phone, companyName, companyEmail, employeeSize } = inputValue;

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
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/send-otp", {
        email: companyEmail,
      });
      if (data.success) {
        setShowOTPInputs(true);
        handleSuccess("OTP sent successfully!");
      } else {
        handleError(data.message);
      }
    } catch (error) {
      handleError("An error occurred. Please try again.");
    }
  };

  const verifyEmailOTP = async () => {
    try {
      const { data } = await axios.post("http://localhost:5000/verify-email-otp", {
        otp: emailOTP,
        email: companyEmail,
      });
      if (data.success) {
        setIsEmailVerified(true);
        handleSuccess("Email verified successfully!");
      } else {
        handleError("Invalid Email OTP.");
      }
    } catch (error) {
      handleError("Error verifying email OTP.");
    }
  };

  const handleFinalSubmit = async () => {
    if (isEmailVerified) {
      try {
        const { data } = await axios.post("http://localhost:5000/signup", {
          username: name,
          password: phone,
          email: companyEmail,
          companyName,
          companyEmail,
          employeeSize: Number(employeeSize),
        });
        if (data.success) {
          handleSuccess("User registered successfully!");
          setTimeout(() => {
            navigate("/dashboard"); // Redirect to dashboard after successful registration
          }, 1000);
        } else {
          handleError(data.message);
        }
      } catch (error) {
        handleError("An error occurred. Please try again.");
      }
    } else {
      handleError("Please verify Email.");
    }
  };

  return (
    <div className="signup-container">
      {/* Job Portal Information */}
      <div className="job-portal-info">
        <h2>About Job Portal</h2>
        <p>Join our job portal to connect with top employers and find your dream job!</p>
        <p>Explore various job opportunities tailored to your skills and interests.</p>
      </div>

      {/* Signup Form */}
      <div className="signup-form">
        <h2>Sign Up</h2>
        {!showOTPInputs ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label><FaUser /> Name</label>
              <input type="text" name="name" value={name} onChange={handleOnChange} required />
            </div>
            <div>
              <label><FaPhone /> Phone</label>
              <input type="tel" name="phone" value={phone} onChange={handleOnChange} required />
            </div>
            <div>
              <label><FaBuilding /> Company Name</label>
              <input type="text" name="companyName" value={companyName} onChange={handleOnChange} required />
            </div>
            <div>
              <label><FaEnvelope /> Company Email</label>
              <input type="email" name="companyEmail" value={companyEmail} onChange={handleOnChange} required />
            </div>
            <div>
              <label><FaUsers /> Employee Size</label>
              <input type="text" name="employeeSize" value={employeeSize} onChange={handleOnChange} required />
            </div>
            <button type="submit">Proceed</button>
          </form>
        ) : (
          <div>
            <div>
              <label><FaEnvelope /> Enter Email OTP</label>
              <input type="text" value={emailOTP} onChange={(e) => setEmailOTP(e.target.value)} />
              <button onClick={verifyEmailOTP} style={{ color: 'blue' }}>Verify</button>
              {isEmailVerified ? <FaCheck color="green" /> : <FaTimes color="red" />}
            </div>
            <button onClick={handleFinalSubmit}>
              Register
            </button>
          </div>
        )}
        <div className="terms">
          <p>By clicking on proceed, you accept the <Link to="/terms" style={{ color: 'blue' }}>terms and conditions</Link>.</p>
        </div>
        <div className="already-registered">
          <p>Already registered? <Link to="/login" style={{ color: 'blue' }}>Login here</Link>.</p>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;

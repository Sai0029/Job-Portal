import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import { FaHome } from 'react-icons/fa'; // Importing the home icon

const Dashboard = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    jobTitle: "",
    jobDescription: "",
    experienceLevel: "",
    candidates: "",
    endDate: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInterviewDetails({
      ...interviewDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/create-interview", interviewDetails);
      if (data.success) {
        toast.success("Interview details sent successfully!");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Interview submission error:", error);
    }
  };

  return (
    <div className="dashboard-container">
    {/* Sidebar */}
    <aside className="sidebar">
      <FaHome size={30} style={{ marginBottom: '20px' }} /> {/* Home Icon */}
      {/* You can add more sidebar items here */}
    </aside>

      {/* Main Content */}
      <div className="content-area">
        <button className="create-interview-btn" onClick={() => setFormVisible(!formVisible)}>
          Create Interview
        </button>

        {/* Interview Form */}
        {formVisible && (
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={interviewDetails.jobTitle}
                  onChange={handleOnChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  name="jobDescription"
                  value={interviewDetails.jobDescription}
                  onChange={handleOnChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select
                  name="experienceLevel"
                  value={interviewDetails.experienceLevel}
                  onChange={handleOnChange}
                  required
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="form-group">
                <label>Candidates</label>
                <input
                  type="text"
                  name="candidates"
                  value={interviewDetails.candidates}
                  onChange={handleOnChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={interviewDetails.endDate}
                  onChange={handleOnChange}
                  required
                />
              </div>
              <div className="button-container">
      <button type="submit" className="submit-btn">
        Send
      </button>
    </div>
            </form>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Dashboard;



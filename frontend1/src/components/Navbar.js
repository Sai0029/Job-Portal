import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './cuvette_tech.png'; // Import the logo image

const Navbar = ({ username }) => {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src={logo} alt="Job Portal Logo" className="navbar-logo" />
            </div>
            <ul className="nav-links">
                <li><Link>Contact</Link></li>
                <li className="user-box">{username}</li> {/* Display username */}
            </ul>
        </nav>
    );
};

export default Navbar;

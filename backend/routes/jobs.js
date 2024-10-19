const express = require('express');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();

// Middleware to verify JWT token
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Post a Job
router.post('/post-job', auth, async (req, res) => {
    const { title, description, experienceLevel, endDate, candidateEmails } = req.body;

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newJob = new Job({
            title,
            description,
            experienceLevel,
            endDate,
            candidateEmails: candidateEmails.split(','),
            user: user.id
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

// controllers/jobController.js
const Job = require('../models/Job');
const nodemailer = require('nodemailer');

// Post a new job
exports.postJob = async (req, res) => {
  const { title, description, experienceLevel, endDate, candidates } = req.body;
  const companyId = req.user.id;  // Get company ID from JWT

  try {
    const job = new Job({
      company: companyId,
      title,
      description,
      experienceLevel,
      endDate,
      candidates,
    });

    await job.save();

    // Send email notifications to candidates
    sendEmailsToCandidates(candidates, job);

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Send Emails to Candidates
const sendEmailsToCandidates = async (candidates, job) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  candidates.forEach(async (email) => {
    await transporter.sendMail({
      from: '"Job Board" <no-reply@jobboard.com>',
      to: email,
      subject: `New Job: ${job.title}`,
      text: `You have been invited to apply for a job at ${job.company}`,
    });
  });
};

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const { body, validationResult } = require("express-validator");
dotenv.config();

const app = express();
const { MONGO_URL, PORT, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true },
  employeeSize: { type: Number, required: true },
  createdAt: { type: Date, default: new Date() }
});

// Create User model
const User = mongoose.model("User", userSchema);

// Email OTP store (In-memory for simplicity)
let emailOtpStore = {};
let otpExpiration = 5 * 60 * 1000; // 5 minutes expiration

// Function to send email OTP
const sendEmailOTP = async (email) => {
  const otp = otpGenerator.generate(6, { digits: true });
  emailOtpStore[email] = { otp, expires: Date.now() + otpExpiration }; // Store OTP with expiration

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD
    }
  });

  let mailOptions = {
    from: SMTP_EMAIL,
    to: email,
    subject: "Your OTP for Email Verification",
    text: `Your OTP is ${otp}`
  };

  await transporter.sendMail(mailOptions);
};

// Endpoint to trigger sending of OTPs
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    await sendEmailOTP(email);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Utility function to check OTP validity
const isOtpValid = (store, key, otp) => {
  const data = store[key];
  return data && data.otp === otp && Date.now() < data.expires;
};

// Endpoint to verify email OTP
app.post("/verify-email-otp", (req, res) => {
  const { otp, email } = req.body;
  if (isOtpValid(emailOtpStore, email, otp)) {
    delete emailOtpStore[email]; // Remove OTP after verification
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
});

// Signup route (only if OTP verified)
app.post("/signup", [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('companyEmail').isEmail().withMessage('Invalid company email format'),
  body('employeeSize').isInt().withMessage('Employee size must be an integer')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array().map(err => err.msg).join(', ') });
    }
  
    const { username, password, email, companyName, companyEmail, employeeSize } = req.body;
  
    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists." });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        companyName,
        companyEmail,
        employeeSize,
      });
  
      await newUser.save();
      res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while creating the user." });
    }
  });
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
  
      res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error logging in", error });
    }
});
app.post("/create-interview", async (req, res) => {
    const { jobTitle, jobDescription, experienceLevel, candidates, endDate } = req.body;
  
    // Set up your SMTP transporter
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD
    }
    });
  
    const candidateEmails = candidates.split(",").map(email => email.trim());
    
    const mailOptions = {
      from: SMTP_EMAIL,
      to: candidateEmails,
      subject: `Interview Invitation for ${jobTitle}`,
      text: `You are invited for an interview for the position of ${jobTitle}. Job Description: ${jobDescription}. Experience Level: ${experienceLevel}. End Date: ${endDate}.`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Interview details sent to candidates." });
    } catch (error) {
      res.json({ success: false, message: "Error sending email." });
    }
  });
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  

// routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

module.exports = authRouter;

// routes/jobRoutes.js
const express = require('express');
const { postJob } = require('../controllers/jobController');
const auth = require('../middleware/authMiddleware');
const jobRouter = express.Router();

jobRouter.post('/post-job', auth, postJob);

module.exports = jobRouter;

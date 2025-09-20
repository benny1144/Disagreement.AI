const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import the User model we created on Day 2
const User = require('../models/User');

// --- POST /api/users/register ---
// @desc  Register a new user
router.post('/register', async (req, res) => {
  try {
    // Get name, email, and password from the request body
    const { name, email, password } = req.body;

    // Basic validation: Check if fields are missing
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check if a user with that email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with that email already exists' });
    }

    // Create a new User instance
    const newUser = new User({
      name,
      email,
      password,
    });

    // Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save the new user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json({ 
        msg: 'User registered successfully!',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// We will add login and other routes here later

module.exports = router;
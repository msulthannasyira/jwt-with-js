const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = []; // Simulated database

// Preload a user with username "nasyira" and password "12345678"
(async () => {
    const hashedPassword = await bcrypt.hash("12345678", 10);
    users.push({ username: "nasyira", password: hashedPassword });
    console.log('Default user added: nasyira');
})();

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully!' });
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ message: 'Invalid credentials!' });

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token });

    console.log(`Generated Token for ${username}: ${token}`);
});

module.exports = router;

// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // You'll need to: npm install cors
const app = express();

app.use(cors());
app.use(express.json());

// This "endpoint" hides your key
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const apiKey = process.env.GYMBOT_API_KEY; // Hidden safely here!

    // Here, you make the actual call to the AI/GymBot API using the apiKey
    // Then send the answer back to the browser
    res.json({ reply: "Response from GymBot using hidden key" });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
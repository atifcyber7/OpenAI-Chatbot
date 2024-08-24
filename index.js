import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import ejs from 'ejs';

// Load environment variables from .env file
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// View engine setup
app.set('view engine', 'ejs');


let conversationHistory = [];

// Routes for EJS pages
app.get('/Home', (req, res) => res.render("pages/Home"));
app.get('/contact', (req, res) => res.render("pages/contact"));
app.get('/about', (req, res) => res.render("pages/about"));

// API routes
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

   
    conversationHistory.push({ role: "user", content: userMessage });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...conversationHistory, 
      ],
    });

    const assistantReply = completion.choices[0].message.content;

   
    conversationHistory.push({ role: "assistant", content: assistantReply });

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error("Error in /api/chat route: ", error.message);
    res.status(500).send(error.toString());
  }
});

// Start server

// console.log('hello')
app.listen(port, () => console.log(`Listening on port ${port}`));


app.post('/api/clear-history', (req, res) => {
  conversationHistory = [];
  res.json({ message: "Conversation history cleared." });
});

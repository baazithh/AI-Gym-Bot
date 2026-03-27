// ===== CONFIG =====
import { CONFIG } from './config.js';

const API_KEY = CONFIG.GYMBOT_API_KEY;
const MODEL = CONFIG.MODEL;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are GymBot, an expert bodybuilding and fitness coach. ...`; // Keep your prompt here

// ===== STATE =====
let chatHistory = [];
let isProcessing = false; 

// ... (Rest of your helper functions: formatText, addMessage, etc.) ...

// ===== CORE CHAT =====
async function sendMessage(text) {
  if (!text || !text.trim() || isProcessing) return;
  
  isProcessing = true;
  const userText = text.trim();
  userInputEl.value = "";
  sendBtnEl.disabled = true;

  addMessage("user", userText);
  chatHistory.push({ role: "user", parts: [{ text: userText }] });
  showTypingIndicator();

  const limitedHistory = chatHistory.slice(-8); // Protects your quota

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: limitedHistory,
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    removeTypingIndicator();
    addMessage("bot", reply);
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

  } catch (error) {
    removeTypingIndicator();
    let msg = error.message.includes("429") ? "Rate limit hit! Wait 30s." : error.message;
    addMessage("bot", `❌ ${msg}`);
    chatHistory.pop();
  } finally {
    setTimeout(() => {
        isProcessing = false;
        sendBtnEl.disabled = false;
    }, 2000);
  }
}

// ... (Rest of your Event Listeners) ...
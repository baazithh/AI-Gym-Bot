// ===== CONFIG =====
import { CONFIG } from './config.js';

const API_KEY = CONFIG.GYMBOT_API_KEY;
const MODEL = CONFIG.MODEL;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are GymBot, an expert bodybuilding and fitness coach. You help serious athletes and bodybuilders with:
- Personalized workout plans (push/pull/legs, bro splits, full body, Arnold split, etc.)
- Step-by-step exercise instructions with proper form cues and common mistakes to avoid
- Calorie and macro calculations based on height, weight, age, gender, and goal (bulk/cut/maintain)
- Cardio planning: duration, intensity, type based on goals (fat loss, endurance, conditioning)
- Supplement guidance (protein, creatine, pre-workout, vitamins, etc.)
- Recovery, sleep, and periodization advice

Tone: motivating, direct, knowledgeable. Use short clear sentences. No emojis.
When giving workout plans, list exercises with sets x reps (e.g., Bench Press - 4 x 8-10).
When calculating calories, use Mifflin-St Jeor formula. Ask for height, weight, age, gender, goal if not provided.
Be specific. Give real numbers and real programs.`;

// ===== STATE =====
let chatHistory = [];
let isProcessing = false; 

// ===== DOM REFS =====
const messagesEl = document.getElementById("messages");
const userInputEl = document.getElementById("userInput");
const sendBtnEl = document.getElementById("sendBtn");
const clearBtnEl = document.getElementById("clearBtn");
const menuToggleEl = document.getElementById("menuToggle");
const sidebarEl = document.querySelector(".sidebar");
const topicBtns = document.querySelectorAll(".topic-btn");

// ===== HELPERS =====
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .split("\n\n")
    .map((para) => {
      if (para.trim().match(/^[-•*]\s/m)) {
        const items = para.split("\n").filter(l => l.trim())
          .map(l => `<li>${l.replace(/^[-•*]\s/, "")}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (para.trim().match(/^\d+\.\s/m)) {
        const items = para.split("\n").filter(l => l.trim())
          .map(l => `<li>${l.replace(/^\d+\.\s/, "")}</li>`).join("");
        return `<ol>${items}</ol>`;
      }
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${role}`;
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "msg-avatar";
  
  // Uses your logo image for the bot avatar instead of emoji
  if (role === "bot") {
      avatarDiv.innerHTML = `<img src="/gb NEW (Copy).png" style="width:24px;height:24px;border-radius:50%;">`;
  } else {
      avatarDiv.textContent = "ME";
  }

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";
  bubbleDiv.innerHTML = formatText(text);
  
  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubbleDiv);
  messagesEl.appendChild(msgDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg bot";
  msgDiv.id = "typingIndicator";
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "msg-avatar";
  avatarDiv.innerHTML = `<img src="/gb NEW (Copy).png" style="width:24px;height:24px;border-radius:50%;">`;
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble typing-bubble";
  bubbleDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubbleDiv);
  messagesEl.appendChild(msgDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ===== CORE CHAT =====
async function sendMessage(text) {
  if (!text || !text.trim() || isProcessing) return;
  
  isProcessing = true;
  const userText = text.trim();
  userInputEl.value = "";
  userInputEl.style.height = "auto";
  sendBtnEl.disabled = true;

  addMessage("user", userText);
  chatHistory.push({ role: "user", parts: [{ text: userText }] });
  showTypingIndicator();

  // Protects Quota: Only sends the last 8 messages for context
  const limitedHistory = chatHistory.slice(-8);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: limitedHistory,
        generationConfig: { 
            maxOutputTokens: 800, 
            temperature: 0.7 
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) throw new Error("Empty response from Gemini");

    removeTypingIndicator();
    addMessage("bot", reply);
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

  } catch (error) {
    removeTypingIndicator();
    let msg = error.message;
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
      msg = "Rate limit reached. Please wait 30 seconds before next message.";
    } else if (msg.includes("Failed to fetch")) {
      msg = "Connection error. Ensure you are running a local server.";
    }
    addMessage("bot", `Error: ${msg}`);
    chatHistory.pop();
  } finally {
    // 2-second cooldown to prevent double-clicks
    setTimeout(() => {
        isProcessing = false;
        sendBtnEl.disabled = false;
        userInputEl.focus();
    }, 2000);
  }
}

// ===== EVENTS =====
sendBtnEl.addEventListener("click", () => sendMessage(userInputEl.value));

userInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { 
    e.preventDefault(); 
    sendMessage(userInputEl.value); 
  }
});

userInputEl.addEventListener("input", () => {
  userInputEl.style.height = "auto";
  userInputEl.style.height = Math.min(userInputEl.scrollHeight, 120) + "px";
  if (!isProcessing) sendBtnEl.disabled = !userInputEl.value.trim();
});

topicBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sendMessage(btn.getAttribute("data-msg"));
    sidebarEl.classList.remove("open");
  });
});

clearBtnEl.addEventListener("click", () => {
  chatHistory = [];
  messagesEl.innerHTML = "";
  addMessage("bot", "Chat cleared. Ready for a new session.");
});

menuToggleEl.addEventListener("click", () => sidebarEl.classList.toggle("open"));

// Close sidebar on mobile when clicking outside
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 700 && !sidebarEl.contains(e.target) && !menuToggleEl.contains(e.target)) {
    sidebarEl.classList.remove("open");
  }
});

userInputEl.focus();
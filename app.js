// ===== CONFIG =====
// 🔑 Paste your FREE Gemini API key here
// Get one at: https://aistudio.google.com → click "Get API Key" (no credit card needed!)
const API_KEY = "AIzaSyAINA4FqOaGR9FjCHDuf49sNeIhVMPXx2M";

const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are GymBot, an expert bodybuilding and fitness coach. You help serious athletes and bodybuilders with:
- Personalized workout plans (push/pull/legs, bro splits, full body, Arnold split, etc.)
- Step-by-step exercise instructions with proper form cues and common mistakes to avoid
- Calorie and macro calculations based on height, weight, age, gender, and goal (bulk/cut/maintain)
- Cardio planning: duration, intensity, type based on goals (fat loss, endurance, conditioning)
- Supplement guidance (protein, creatine, pre-workout, vitamins, etc.)
- Recovery, sleep, and periodization advice

Tone: motivating, direct, knowledgeable — like a gym coach who is also a nutritionist.
Use short clear sentences. Use emojis occasionally (💪🔥⚡).
When giving workout plans, list exercises with sets x reps (e.g., Bench Press — 4 x 8-10).
When calculating calories, use Mifflin-St Jeor formula. Ask for height, weight, age, gender, goal if not provided.
Be specific. Give real numbers and real programs.`;

// ===== STATE =====
let chatHistory = [];

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
  avatarDiv.textContent = role === "bot" ? "💪" : "ME";
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";
  bubbleDiv.innerHTML = formatText(text);
  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bubbleDiv);
  messagesEl.appendChild(msgDiv);
  scrollToBottom();
  return bubbleDiv;
}

function showTypingIndicator() {
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg bot";
  msgDiv.id = "typingIndicator";
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "msg-avatar";
  avatarDiv.textContent = "💪";
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
  if (!text || !text.trim()) return;
  const userText = text.trim();
  userInputEl.value = "";
  userInputEl.style.height = "auto";
  sendBtnEl.disabled = true;

  addMessage("user", userText);
  chatHistory.push({ role: "user", parts: [{ text: userText }] });
  showTypingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: chatHistory,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
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
    const msg = error.message.includes("Failed to fetch")
      ? "Connection error. Check your internet and try again."
      : `Error: ${error.message}`;
    addMessage("bot", `❌ ${msg}`);
    chatHistory.pop();
  } finally {
    sendBtnEl.disabled = false;
    userInputEl.focus();
  }
}

// ===== EVENTS =====
sendBtnEl.addEventListener("click", () => sendMessage(userInputEl.value));

userInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(userInputEl.value); }
});

userInputEl.addEventListener("input", () => {
  userInputEl.style.height = "auto";
  userInputEl.style.height = Math.min(userInputEl.scrollHeight, 120) + "px";
  sendBtnEl.disabled = !userInputEl.value.trim();
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
  addMessage("bot", "Chat cleared! 💪 Ready for a fresh session. What are we working on today?");
});

menuToggleEl.addEventListener("click", () => sidebarEl.classList.toggle("open"));

document.addEventListener("click", (e) => {
  if (window.innerWidth <= 700 && !sidebarEl.contains(e.target) && !menuToggleEl.contains(e.target)) {
    sidebarEl.classList.remove("open");
  }
});

userInputEl.focus();

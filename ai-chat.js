
/* =========================================
   VIDYAVERSE — PREMIUM AI TUTOR CHAT
========================================= */

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.querySelector(".new-chat");
const darkMode = document.querySelector(".fa-moon");
const mic = document.querySelector(".fa-microphone");

const API_URL = "http://127.0.0.1:8000/ai/ask";

let isSending = false;

// =========================================
// SAFE ELEMENT HELPERS
// =========================================

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function createMessage(role, content, isHTML = false) {
    const message = document.createElement("div");
    message.className = `message ${role}`;

    if (role === "ai") {
        const avatar = document.createElement("div");
        avatar.className = "avatar";

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-robot";

        avatar.appendChild(icon);
        message.appendChild(avatar);
    }

    const text = document.createElement("div");
    text.className = "text";

    if (isHTML) {
        text.innerHTML = content;
    } else {
        text.textContent = content;
    }

    message.appendChild(text);
    chatBox.appendChild(message);

    scrollToBottom();

    return message;
}

// Convert Markdown to safe HTML.
// DOMPurify is recommended for rendering model-generated content.
function renderMarkdown(answer) {
    if (typeof answer !== "string") {
        return "I couldn't understand the response. Please try again.";
    }

    if (window.marked && window.DOMPurify) {
        return DOMPurify.sanitize(marked.parse(answer));
    }

    // Safe fallback if the Markdown libraries aren't loaded.
    const fallback = document.createElement("div");
    fallback.textContent = answer;
    return fallback.innerHTML.replace(/\n/g, "<br>");
}

// =========================================
// WELCOME MESSAGE
// =========================================

function showWelcome(message = "Ask me anything about your studies.") {
    chatBox.replaceChildren();

    const welcome = document.createElement("div");
    welcome.className = "message ai";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const text = document.createElement("div");
    text.className = "text";

    const heading = document.createElement("h2");
    heading.textContent = "Hello, learner! 👋";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    const tip = document.createElement("blockquote");
    tip.textContent =
        "Try asking for a simple explanation, an example, or a BCA exam answer.";

    text.append(heading, paragraph, tip);
    welcome.append(avatar, text);
    chatBox.appendChild(welcome);
}

// =========================================
// TYPING INDICATOR
// =========================================

function showTypingIndicator() {
    const message = document.createElement("div");
    message.className = "message ai typing-message";
    message.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

    const text = document.createElement("div");
    text.className = "text typing-content";

    text.innerHTML = `
        <span class="typing-label">VidyaVerse is thinking</span>
        <span class="typing-dots" aria-label="Loading">
            <span></span><span></span><span></span>
        </span>
    `;

    message.append(avatar, text);
    chatBox.appendChild(message);
    scrollToBottom();

    return message;
}

// =========================================
// SEND MESSAGE
// =========================================

async function sendMessage() {
    const question = input.value.trim();

    if (!question || isSending) return;

    createMessage("user", question);

    input.value = "";
    isSending = true;
    sendBtn.disabled = true;

    const typing = showTypingIndicator();

    try {
        const token = localStorage.getItem("token");

        const headers = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                question: question,
                language: window.VidyaVerseI18n?.getLanguage?.() || localStorage.getItem("vidyaverse_language") || "en"
            })
        });

        if (!response.ok) {
            let detail = `Request failed (${response.status}).`;

            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    detail = typeof errorData.detail === "string"
                        ? errorData.detail
                        : JSON.stringify(errorData.detail);
                }
            } catch (_) {
                // Keep the default error message.
            }

            throw new Error(detail);
        }

        const data = await response.json();

        typing.remove();

        const answer = data.answer || data.response;

        if (!answer) {
            createMessage(
                "ai",
                "I received an empty response. Please try asking again."
            );
        } else {
            const html = renderMarkdown(answer);
            createMessage("ai", html, true);
        }

    } catch (error) {
        console.error("VidyaVerse AI error:", error);

        typing.remove();

        const errorMessage = document.createElement("div");
        errorMessage.className = "message ai";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';

        const text = document.createElement("div");
        text.className = "text";

        const heading = document.createElement("h3");
        heading.textContent = "Oops! Something went wrong.";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            error.message.includes("Failed to fetch")
                ? "I couldn't connect to the AI server. Please check that your FastAPI backend is running."
                : error.message;

        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "retry-button";
        retry.textContent = "Try again";

        retry.addEventListener("click", () => {
            input.value = question;
            input.focus();
        });

        text.append(heading, paragraph, retry);
        errorMessage.append(avatar, text);
        chatBox.appendChild(errorMessage);
        scrollToBottom();

    } finally {
        isSending = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

// =========================================
// SEND BUTTON AND ENTER KEY
// =========================================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// =========================================
// NEW CHAT
// =========================================

newChat.addEventListener("click", () => {
    showWelcome("A new conversation has started. What would you like to learn today?");
    input.value = "";
    input.focus();
});

// =========================================
// DARK MODE
// =========================================

let dark = localStorage.getItem("vidyaverseChatTheme") === "dark";

function applyTheme() {
    document.body.classList.toggle("chat-dark", dark);

    if (darkMode) {
        darkMode.classList.toggle("fa-moon", !dark);
        darkMode.classList.toggle("fa-sun", dark);
    }

    localStorage.setItem("vidyaverseChatTheme", dark ? "dark" : "light");
}

if (darkMode) {
    darkMode.addEventListener("click", () => {
        dark = !dark;
        applyTheme();
    });
}

applyTheme();

// =========================================
// VOICE INPUT
// =========================================

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (mic && SpeechRecognition) {
    const recognition = new SpeechRecognition();

    recognition.lang = ({ en: "en-IN", hi: "hi-IN", pa: "pa-IN" })[window.VidyaVerseI18n?.getLanguage?.() || "en"] || "en-IN";
    document.addEventListener("vidyaverse:languagechange", event => {
        recognition.lang = ({ en: "en-IN", hi: "hi-IN", pa: "pa-IN" })[event.detail.language] || "en-IN";
    });
    recognition.continuous = false;
    recognition.interimResults = false;

    mic.addEventListener("click", () => {
        try {
            recognition.start();
        } catch (error) {
            console.warn("Voice input is already active.", error);
        }
    });

    recognition.onresult = event => {
        input.value = event.results[0][0].transcript;
        input.focus();
    };

    recognition.onerror = event => {
        console.error("Voice recognition error:", event.error);
    };
} else if (mic) {
    mic.title = "Voice input is not supported in this browser.";
}

// =========================================
// INITIALIZATION
// =========================================

console.log("VidyaVerse AI Tutor loaded successfully.");

/* ==========================================
   VIDYAVERSE - DYNAMIC RECENT CHAT HISTORY
========================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "vidyaverse_ai_chat_history_v1";

    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const recentChats = document.getElementById("recentChats");
    const newChatBtn = document.getElementById("newChatBtn");

    if (!chatBox || !recentChats || !newChatBtn) {
        console.error("Chat history: Required HTML elements are missing.");
        return;
    }

    let chats = loadChats();
    let currentChatId = null;
    let observer = null;
    let saveTimer = null;

    function makeId() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function loadChats() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not load chat history:", error);
            return [];
        }
    }

    function saveChats() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(chats)
            );
        } catch (error) {
            console.error("Could not save chat history:", error);
        }
    }

    function getPlainText(element) {
        return (element?.innerText || element?.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getUserMessages() {
        return [...chatBox.querySelectorAll(
            ".message.user, .message.user-message, .message.human"
        )];
    }

    function getFirstUserMessage() {
        const messages = getUserMessages();

        if (messages.length) {
            const text = getPlainText(messages[0]);
            if (text) return text;
        }

        return "";
    }

    function createTitle(text) {
        if (!text) return "New Conversation";

        const cleaned = text.replace(/\s+/g, " ").trim();

        return cleaned.length > 34
            ? cleaned.slice(0, 34).trim() + "…"
            : cleaned;
    }

    function ensureCurrentChat() {
        if (currentChatId) {
            const existing = chats.find(
                chat => chat.id === currentChatId
            );

            if (existing) return existing;
        }

        const chat = {
            id: makeId(),
            title: "New Conversation",
            messagesHTML: chatBox.innerHTML,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        chats.unshift(chat);
        currentChatId = chat.id;

        return chat;
    }

    function saveCurrentChat() {
        const userMessages = getUserMessages();

        // Do not save a blank conversation to recent history.
        if (userMessages.length === 0) return;

        const chat = ensureCurrentChat();

        chat.messagesHTML = chatBox.innerHTML;
        chat.title = createTitle(getFirstUserMessage());
        chat.updatedAt = Date.now();

        saveChats();
        renderRecentChats();
    }

    function scheduleSave() {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
            saveCurrentChat();
        }, 250);
    }

    function stopObserving() {
        if (observer) {
            observer.disconnect();
        }
    }

    function startObserving() {
        stopObserving();

        observer = new MutationObserver(() => {
            scheduleSave();
        });

        observer.observe(chatBox, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function renderRecentChats() {
        recentChats.replaceChildren();

        const sortedChats = [...chats].sort(
            (a, b) => b.updatedAt - a.updatedAt
        );

        if (sortedChats.length === 0) {
            const empty = document.createElement("li");
            empty.className = "recent-chat-empty";
            empty.textContent = "Your conversations will appear here.";
            recentChats.appendChild(empty);
            return;
        }

        sortedChats.forEach(chat => {
            const item = document.createElement("li");
            item.className = "recent-chat-item";

            if (chat.id === currentChatId) {
                item.classList.add("active");
            }

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "recent-chat-open";
            openButton.title = chat.title;
            openButton.setAttribute("aria-label", "Open " + chat.title);

            const icon = document.createElement("i");
            icon.className = "fa-regular fa-message";
            icon.setAttribute("aria-hidden", "true");

            const title = document.createElement("span");
            title.className = "recent-chat-title";
            title.textContent = chat.title || "New Conversation";

            openButton.append(icon, title);

            openButton.addEventListener("click", () => {
                openChat(chat.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "recent-chat-delete";
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteButton.title = "Delete conversation";
            deleteButton.setAttribute(
                "aria-label",
                "Delete " + chat.title
            );

            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                deleteChat(chat.id);
            });

            item.append(openButton, deleteButton);
            recentChats.appendChild(item);
        });
    }

    function openChat(id) {
        // Save any unsaved messages before switching.
        clearTimeout(saveTimer);
        saveCurrentChat();

        const chat = chats.find(item => item.id === id);

        if (!chat) return;

        stopObserving();

        currentChatId = chat.id;
        chatBox.innerHTML = chat.messagesHTML;

        renderRecentChats();
        startObserving();

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function startNewChat() {
        clearTimeout(saveTimer);
        saveCurrentChat();

        stopObserving();

        currentChatId = null;

        chatBox.innerHTML = `
            <div class="message ai">
                <div class="avatar">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="text">
                    Hello 👋<br>
                    I'm your AI Tutor.<br>
                    Ask me anything about your studies.
                </div>
            </div>
        `;

        if (userInput) {
            userInput.value = "";
            userInput.focus();
        }

        renderRecentChats();
        startObserving();
    }

    function deleteChat(id) {
        const chat = chats.find(item => item.id === id);
        if (!chat) return;

        const confirmed = window.confirm(
            `Delete "${chat.title}"? This cannot be undone.`
        );

        if (!confirmed) return;

        chats = chats.filter(item => item.id !== id);

        if (currentChatId === id) {
            currentChatId = null;

            stopObserving();

            chatBox.innerHTML = `
                <div class="message ai">
                    <div class="avatar">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="text">
                        Hello 👋<br>
                        I'm your AI Tutor.<br>
                        Ask me anything about your studies.
                    </div>
                </div>
            `;

            startObserving();
        }

        saveChats();
        renderRecentChats();
    }

    // Start a new conversation.
    newChatBtn.addEventListener("click", startNewChat);

    /*
       Watch the chat area for messages added by ai-chat.js.
       This means the existing AI response logic can remain
       in ai-chat.js.
    */
    startObserving();

    // If the user sends a message, ensure it is saved.
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            setTimeout(scheduleSave, 100);
        });
    }

    if (userInput) {
        userInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                setTimeout(scheduleSave, 100);
            }
        });
    }

    // Restore the most recent conversation on page load.
    const mostRecent = [...chats].sort(
        (a, b) => b.updatedAt - a.updatedAt
    )[0];

    if (mostRecent) {
        currentChatId = mostRecent.id;
        chatBox.innerHTML = mostRecent.messagesHTML;
    }

    renderRecentChats();
    startObserving();
})();
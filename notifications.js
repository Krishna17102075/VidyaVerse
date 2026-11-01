
/* ==========================================
   VIDYAVERSE NOTIFICATION SYSTEM
========================================== */

(() => {
    "use strict";

    const PROGRESS_KEY = "vidyaverse_courses_progress";
    const LAST_COURSE_KEY = "vidyaverse_last_course";
    const READ_KEY = "vidyaverse_read_notifications";

    const courses = [
        { id: "web-development", name: "Web Development" },
        { id: "cpp-programming", name: "C++ Programming" },
        { id: "dbms-sql", name: "DBMS & SQL" },
        { id: "computer-networks", name: "Computer Networks" }
    ];

    let panel = null;
    let bell = null;

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function addStyles() {
        if (document.getElementById("vvNotificationStyles")) return;

        const style = document.createElement("style");
        style.id = "vvNotificationStyles";

        style.textContent = `
            .vv-notification-wrap {
                position: relative;
                display: inline-flex;
                align-items: center;
            }

            .vv-notification-bell {
                position: relative;
                display: inline-grid;
                place-items: center;
                width: 44px;
                height: 44px;
                border: 0;
                border-radius: 50%;
                background: transparent;
                color: #805064;
                font-size: 23px;
                cursor: pointer;
                transition: background .2s, color .2s, transform .2s;
            }

            .vv-notification-bell:hover {
                background: #f9e7e6;
                color: #a3264d;
                transform: translateY(-2px);
            }

            .vv-notification-badge {
                position: absolute;
                top: 1px;
                right: 0;
                display: grid;
                place-items: center;
                min-width: 18px;
                height: 18px;
                padding: 0 4px;
                border: 2px solid #fffaf8;
                border-radius: 20px;
                background: #b82e55;
                color: white;
                font: 700 10px Arial, sans-serif;
            }

            .vv-notification-panel {
                position: absolute;
                z-index: 9999;
                top: calc(100% + 12px);
                right: 0;
                width: min(370px, calc(100vw - 28px));
                max-height: min(530px, 75vh);
                overflow-y: auto;
                border: 1px solid #f0d9d7;
                border-radius: 20px;
                background: #fffdfc;
                box-shadow: 0 18px 55px rgba(83, 27, 48, .18);
                color: #713047;
            }

            .vv-notification-panel[hidden] {
                display: none;
            }

            .vv-notification-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
                padding: 20px;
                border-bottom: 1px solid #f3e4e1;
                background: linear-gradient(130deg, #fff8f6, #fbe9e7);
            }

            .vv-notification-header h3 {
                margin: 0;
                color: #72253f;
                font: 700 21px Georgia, serif;
            }

            .vv-notification-header p {
                margin: 6px 0 0;
                color: #9a7581;
                font: 12px Arial, sans-serif;
            }

            .vv-notification-readall {
                padding: 7px 9px;
                border: 0;
                border-radius: 8px;
                background: #fff;
                color: #a32d51;
                font-size: 11px;
                cursor: pointer;
            }

            .vv-notification-list {
                padding: 10px;
            }

            .vv-notification-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 14px 12px;
                border-radius: 13px;
                transition: background .2s;
            }

            .vv-notification-item + .vv-notification-item {
                margin-top: 3px;
            }

            .vv-notification-item:hover {
                background: #fff4f1;
            }

            .vv-notification-item.vv-unread {
                background: #fff2ef;
            }

            .vv-notification-symbol {
                display: grid;
                place-items: center;
                flex-shrink: 0;
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: #f9e6e4;
                font-size: 18px;
            }

            .vv-notification-copy {
                flex: 1;
                min-width: 0;
            }

            .vv-notification-copy h4 {
                margin: 1px 0 5px;
                color: #68283f;
                font-size: 13px;
                line-height: 1.5;
            }

            .vv-notification-copy p {
                margin: 0;
                color: #987582;
                font-size: 12px;
                line-height: 1.6;
                overflow-wrap: anywhere;
            }

            .vv-notification-dot {
                flex-shrink: 0;
                width: 8px;
                height: 8px;
                margin-top: 6px;
                border-radius: 50%;
                background: #b82e55;
            }

            .vv-notification-empty {
                padding: 32px 18px;
                text-align: center;
                color: #987582;
                font-size: 13px;
                line-height: 1.7;
            }

            .vv-notification-footer {
                padding: 13px 18px;
                border-top: 1px solid #f3e4e1;
                color: #a17b87;
                font-size: 11px;
                text-align: center;
            }

            @media (max-width: 480px) {
                .vv-notification-panel {
                    position: fixed;
                    top: 78px;
                    right: 12px;
                    left: 12px;
                    width: auto;
                    max-height: calc(100vh - 100px);
                }
            }
        `;

        document.head.appendChild(style);
    }

    function getNotifications() {
        const progress = readJSON(PROGRESS_KEY, {});
        const lastCourse = readJSON(LAST_COURSE_KEY, "");
        const items = [];

        const course = courses.find(item => item.id === lastCourse);

        if (course) {
            items.push({
                id: "continue-" + course.id,
                icon: "📚",
                title: "Continue your learning",
                message: `You last opened ${course.name}. Continue your course to keep making progress.`
            });
        } else {
            items.push({
                id: "welcome-learning",
                icon: "🎓",
                title: "Ready to learn?",
                message: "Open My Courses and choose a subject to begin learning."
            });
        }

        courses.forEach(courseItem => {
            const saved = progress[courseItem.id] || {};

            const completed = Array.isArray(saved.completed)
                ? saved.completed.length
                : Array.isArray(saved.completedLessons)
                    ? saved.completedLessons.length
                    : 0;

            if (completed > 0) {
                items.push({
                    id: "progress-" + courseItem.id,
                    icon: "✅",
                    title: courseItem.name + " progress",
                    message: `You've completed ${completed} lesson(s). Great work—keep going!`
                });
            }
        });

        const today = new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

        items.push({
            id: "daily-" + new Date().toISOString().slice(0, 10),
            icon: "🎯",
            title: "Today's study reminder",
            message: `Make a little progress today, even if you only study for 20 minutes. Today is ${today}.`
        });

        return items;
    }

    function getReadIds() {
        const saved = readJSON(READ_KEY, []);
        return Array.isArray(saved) ? saved : [];
    }

    function markAllRead() {
        const allIds = getNotifications().map(item => item.id);
        const existing = getReadIds();

        localStorage.setItem(
            READ_KEY,
            JSON.stringify([...new Set([...existing, ...allIds])])
        );

        renderNotifications();
    }

    function createPanel() {
        const wrap = document.createElement("div");
        wrap.className = "vv-notification-wrap";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "vv-notification-bell";
        button.setAttribute("aria-label", "Open notifications");
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = `
            <span aria-hidden="true">🔔</span>
            <span class="vv-notification-badge" hidden>0</span>
        `;

        const notificationPanel = document.createElement("section");
        notificationPanel.className = "vv-notification-panel";
        notificationPanel.hidden = true;
        notificationPanel.setAttribute("aria-label", "Notifications");

        notificationPanel.innerHTML = `
            <div class="vv-notification-header">
                <div>
                    <h3>Notifications</h3>
                    <p>Your VidyaVerse learning updates</p>
                </div>
                <button type="button" class="vv-notification-readall">
                    Mark all read
                </button>
            </div>
            <div class="vv-notification-list"></div>
            <div class="vv-notification-footer">
                Keep learning. Every lesson counts ✨
            </div>
        `;

        wrap.append(button, notificationPanel);
        document.body.appendChild(wrap);

        button.addEventListener("click", event => {
            event.stopPropagation();

            notificationPanel.hidden = !notificationPanel.hidden;
            button.setAttribute(
                "aria-expanded",
                String(!notificationPanel.hidden)
            );

            if (!notificationPanel.hidden) {
                renderNotifications();
            }
        });

        notificationPanel.addEventListener("click", event => {
            event.stopPropagation();

            if (event.target.closest(".vv-notification-readall")) {
                markAllRead();
            }
        });

        document.addEventListener("click", event => {
            if (!wrap.contains(event.target)) {
                notificationPanel.hidden = true;
                button.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                notificationPanel.hidden = true;
                button.setAttribute("aria-expanded", "false");
            }
        });

        return { wrap, button, notificationPanel };
    }

    function renderNotifications() {
        if (!panel) return;

        const list = panel.querySelector(".vv-notification-list");
        const badge = bell.querySelector(".vv-notification-badge");

        const notifications = getNotifications();
        const readIds = new Set(getReadIds());
        const unread = notifications.filter(item => !readIds.has(item.id));

        badge.textContent = unread.length > 9 ? "9+" : String(unread.length);
        badge.hidden = unread.length === 0;

        list.replaceChildren();

        if (notifications.length === 0) {
            const empty = document.createElement("div");
            empty.className = "vv-notification-empty";
            empty.textContent = "You're all caught up!";
            list.appendChild(empty);
            return;
        }

        notifications.forEach(item => {
            const isUnread = !readIds.has(item.id);

            const row = document.createElement("article");
            row.className =
                "vv-notification-item" + (isUnread ? " vv-unread" : "");

            const symbol = document.createElement("div");
            symbol.className = "vv-notification-symbol";
            symbol.textContent = item.icon;

            const copy = document.createElement("div");
            copy.className = "vv-notification-copy";

            const title = document.createElement("h4");
            title.textContent = item.title;

            const message = document.createElement("p");
            message.textContent = item.message;

            copy.append(title, message);
            row.append(symbol, copy);

            if (isUnread) {
                const dot = document.createElement("span");
                dot.className = "vv-notification-dot";
                dot.setAttribute("aria-label", "Unread");
                row.appendChild(dot);
            }

            row.addEventListener("click", () => {
                const updated = new Set(getReadIds());
                updated.add(item.id);

                localStorage.setItem(
                    READ_KEY,
                    JSON.stringify([...updated])
                );

                renderNotifications();
            });

            list.appendChild(row);
        });
    }

    function init() {
        addStyles();

        /*
          If your HTML already has a bell icon, remove it or
          hide its wrapper to avoid showing two bells.
          This script creates its own working bell button.
        */
        const existingBell = document.querySelector(
            "#notificationBell, .notification-bell, .fa-bell, .bell-icon"
        );

        const { wrap, button, notificationPanel } = createPanel();

        panel = notificationPanel;
        bell = button;

        if (existingBell) {
            const existingButton = existingBell.closest("button");

            if (existingButton) {
                existingButton.style.display = "none";
            } else {
                existingBell.style.display = "none";
            }
        }

        // Place the new bell in the header if possible.
        const header = document.querySelector(
            ".navbar, .topbar, header, .profile-section"
        );

        if (header) {
            header.appendChild(wrap);
            wrap.style.position = "absolute";
            wrap.style.top = "10px";
            wrap.style.right = "18px";
        }

        renderNotifications();

        // Update when course progress changes in another tab.
        window.addEventListener("storage", event => {
            if (
                event.key === PROGRESS_KEY ||
                event.key === LAST_COURSE_KEY ||
                event.key === READ_KEY
            ) {
                renderNotifications();
            }
        });

        // Update if courses.js changes progress in this same tab.
        window.addEventListener("vidyaverse:progress-updated", renderNotifications);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
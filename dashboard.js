
/* ==========================================
   VIDYAVERSE - DASHBOARD JAVASCRIPT
========================================== */

"use strict";

const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

/* ==========================================
   LOGIN CHECK
========================================== */

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

/* ==========================================
   WELCOME MESSAGE
========================================== */

function setWelcomeMessage() {
    const heading = document.querySelector(".navbar h2");
    if (!heading) return;

    const hour = new Date().getHours();

    if (hour < 12) {
        heading.textContent = "☀️ Good Morning!";
    } else if (hour < 18) {
        heading.textContent = "🌤️ Good Afternoon!";
    } else {
        heading.textContent = "🌙 Good Evening!";
    }
}

/* ==========================================
   LIVE DATE
========================================== */

function setLiveDate() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let dateElement = navbar.querySelector(".dashboard-live-date");

    if (!dateElement) {
        dateElement = document.createElement("p");
        dateElement.className = "dashboard-live-date";
        navbar.appendChild(dateElement);
    }

    dateElement.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    dateElement.style.marginTop = "10px";
    dateElement.style.color = "#987482";
}

/* ==========================================
   CARD HOVER EFFECT
========================================== */

function activateCardEffects() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-5px)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

/* ==========================================
   SIDEBAR ACTIVE MENU
========================================== */

function activateSidebar() {
    const menuItems = document.querySelectorAll(".sidebar li");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(menu => menu.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

/* ==========================================
   PROFILE IMAGE
========================================== */

const profileUpload = document.getElementById("profileUpload");
const profileImage = document.getElementById("profileImage");

async function loadProfileImage() {
    if (!token || !profileImage) return;

    try {
        const response = await fetch(`${API}/users/profile-image`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.profile_image) {
            profileImage.src = `${API}${data.profile_image}`;
        }
    } catch (error) {
        console.error("Unable to load profile image:", error);
    }
}

if (profileUpload) {
    profileUpload.addEventListener("change", async function () {
        const file = this.files && this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            this.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be smaller than 5 MB.");
            this.value = "";
            return;
        }

        const previewURL = URL.createObjectURL(file);

        if (profileImage) {
            profileImage.src = previewURL;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${API}/users/profile-image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.profile_image && profileImage) {
                profileImage.src =
                    `${API}${data.profile_image}?t=${Date.now()}`;
            }

            alert("Profile picture updated successfully!");
        } catch (error) {
            console.error("Profile upload failed:", error);
            alert("Unable to update your profile picture.");
            await loadProfileImage();
        } finally {
            URL.revokeObjectURL(previewURL);
        }
    });
}

/* ==========================================
   LOAD DASHBOARD STATISTICS
========================================== */

async function loadDashboardData() {
    if (!token) return;

    try {
        const response = await fetch(`${API}/dashboard/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`Dashboard request failed: ${response.status}`);
        }

        const data = await response.json();

        const notesCount = document.getElementById("notesCount");
        const tasksCount = document.getElementById("tasksCount");
        const quizCount = document.getElementById("quizCount");
        const averageScore = document.getElementById("averageScore");

        if (notesCount) {
            notesCount.textContent = data.total_notes ?? 0;
        }

        if (tasksCount) {
            tasksCount.textContent = data.total_tasks ?? 0;
        }

        if (quizCount) {
            quizCount.textContent = data.total_quizzes ?? 0;
        }

        if (averageScore) {
            averageScore.textContent = `${data.average_score ?? 0}%`;
        }
    } catch (error) {
        console.error("Dashboard data error:", error);
    }
}

/* ==========================================
   PERSONALIZED STUDY PLAN
========================================== */

const COURSE_PROGRESS_KEY = "vidyaverse_courses_progress";
const LAST_COURSE_KEY = "vidyaverse_last_course";
const DAILY_PLAN_KEY = "vidyaverse_daily_plan_v1";

/*
   IMPORTANT:
   These course IDs and lesson names must match
   the IDs and lesson order used in courses.js.
*/

const STUDY_COURSES = [
    {
        id: "web-development",
        title: "Web Development",
        lessons: [
            "HTML Basics",
            "HTML Forms and Tables",
            "CSS Fundamentals",
            "CSS Flexbox and Grid",
            "Responsive Design",
            "JavaScript Basics",
            "DOM Manipulation",
            "Events and Validation",
            "Build a Landing Page",
            "Web Development Mini Project"
        ],
        revision: "Review HTML, CSS, and JavaScript fundamentals",
        practice: "Build a small webpage using today's topic"
    },
    {
        id: "cpp-programming",
        title: "C++ Programming",
        lessons: [
            "Introduction to C++",
            "Variables and Data Types",
            "Operators and Conditions",
            "Loops",
            "Functions",
            "Arrays and Strings",
            "Pointers and References",
            "Classes and Objects",
            "Inheritance and Polymorphism",
            "C++ Mini Project"
        ],
        revision: "Revise C++ syntax, data types, and definitions",
        practice: "Write and test a short C++ program"
    },
    {
        id: "dbms-sql",
        title: "DBMS & SQL",
        lessons: [
            "Introduction to DBMS",
            "Tables, Rows and Keys",
            "ER Model",
            "SQL Basics",
            "SQL Filtering and Sorting",
            "SQL Joins",
            "Aggregate Functions",
            "Database Normalization",
            "Transactions and ACID",
            "DBMS Mini Project"
        ],
        revision: "Review database terminology, keys, and concepts",
        practice: "Write SQL queries based on your current topic"
    },
    {
        id: "computer-networks",
        title: "Computer Networks",
        lessons: [
            "Introduction to Networks",
            "Network Devices",
            "OSI Reference Model",
            "TCP/IP Model",
            "IP Addressing and Subnetting",
            "Network Protocols",
            "Switching and Routing",
            "Error Detection and Flow Control",
            "Network Security",
            "Computer Networks Mini Project"
        ],
        revision: "Revise networking definitions and important models",
        practice: "Practise networking questions and draw a diagram"
    }
];

/* ==========================================
   LOCAL STORAGE HELPERS
========================================== */

function readLocalJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function writeLocalJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Unable to save ${key}:`, error);
    }
}

function getLastCourseId() {
    const value = readLocalJSON(LAST_COURSE_KEY, "");

    if (typeof value === "string") {
        return value;
    }

    return localStorage.getItem(LAST_COURSE_KEY) || "";
}

/* ==========================================
   READ COURSE PROGRESS
========================================== */

function getCourseProgress(course) {
    const allProgress = readLocalJSON(COURSE_PROGRESS_KEY, {});
    const saved = allProgress?.[course.id] || {};

    /*
       This supports the following possible formats:
       completed: [0, 1, 2]
       completedLessons: [0, 1, 2]

       If courses.js uses a different format, update
       this function to match its actual data structure.
    */

    const rawCompleted = Array.isArray(saved.completed)
        ? saved.completed
        : Array.isArray(saved.completedLessons)
            ? saved.completedLessons
            : [];

    const completed = rawCompleted
        .map(value => {
            if (Number.isInteger(value)) return value;

            if (typeof value === "string" && /^\d+$/.test(value)) {
                return Number(value);
            }

            return -1;
        })
        .filter(index =>
            index >= 0 && index < course.lessons.length
        );

    return {
        completed: [...new Set(completed)],
        lastLesson: Number.isInteger(saved.lastLesson)
            ? saved.lastLesson
            : 0
    };
}

function getNextLessonIndex(course) {
    const progress = getCourseProgress(course);

    return course.lessons.findIndex(
        (_, index) => !progress.completed.includes(index)
    );
}

/* ==========================================
   CHOOSE CURRENT COURSE
========================================== */

function chooseStudyCourse() {
    const lastId = getLastCourseId();

    const lastCourse = STUDY_COURSES.find(
        course => course.id === lastId
    );

    // Continue the last-opened course if it is unfinished.
    if (lastCourse && getNextLessonIndex(lastCourse) !== -1) {
        return lastCourse;
    }

    // Otherwise, select the unfinished course with
    // the most completed lessons.
    const unfinished = STUDY_COURSES
        .filter(course => getNextLessonIndex(course) !== -1)
        .sort((a, b) =>
            getCourseProgress(b).completed.length -
            getCourseProgress(a).completed.length
        );

    return unfinished[0] || lastCourse || STUDY_COURSES[0];
}

/* ==========================================
   DAILY TASK GENERATOR
========================================== */

function getTodayPlanKey(course) {
    const date = new Date();

    const today = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

    return `${DAILY_PLAN_KEY}_${today}_${course.id}`;
}

function getPlanTasks(course) {
    const progress = getCourseProgress(course);
    const nextIndex = getNextLessonIndex(course);

    // The student has completed every lesson in this course.
    if (nextIndex === -1) {
        return [
            {
                id: "revision",
                title: `Revise ${course.title}`,
                duration: "30 minutes",
                priority: "High"
            },
            {
                id: "practice",
                title: course.practice,
                duration: "30 minutes",
                priority: "Medium"
            },
            {
                id: "next-course",
                title: "Choose your next course",
                duration: "15 minutes",
                priority: "Low"
            }
        ];
    }

    const tasks = [];

    const previousLesson = progress.completed
        .filter(index => index < nextIndex)
        .sort((a, b) => b - a)[0];

    tasks.push({
        id: "revision",
        title: previousLesson !== undefined
            ? `Revise: ${course.lessons[previousLesson]}`
            : course.revision,
        duration: "15 minutes",
        priority: "Medium"
    });

    tasks.push({
        id: `lesson-${nextIndex}`,
        title: `Continue ${course.title}: ${course.lessons[nextIndex]}`,
        duration: "40 minutes",
        priority: "High"
    });

    tasks.push({
        id: "practice",
        title: course.practice,
        duration: "25 minutes",
        priority: "High"
    });

    return tasks;
}

/* ==========================================
   CREATE HTML ELEMENTS SAFELY
========================================== */

function makePlanElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

/* ==========================================
   RENDER TODAY'S STUDY PLAN
========================================== */

function renderPersonalizedStudyPlan() {
    const container = document.getElementById("studyPlan");

    if (!container) {
        console.warn(
            'Study plan container not found. Add <div id="studyPlan"></div> to dashboard.html.'
        );
        return;
    }

    const course = chooseStudyCourse();
    const tasks = getPlanTasks(course);
    const planKey = getTodayPlanKey(course);
    const saved = readLocalJSON(planKey, {});

    const completedIds = new Set(
        tasks
            .filter(task => saved[task.id] === true)
            .map(task => task.id)
    );

    // Clear the old plan before drawing the updated one.
    container.replaceChildren();

    /* Header */

    const header = makePlanElement("div", "study-plan-header");
    const headingArea = document.createElement("div");

    headingArea.append(
        makePlanElement("h2", "", "Today's Study Plan"),
        makePlanElement(
            "p",
            "study-plan-subtitle",
            `Personalized for ${course.title}`
        )
    );

    header.append(
        headingArea,
        makePlanElement("span", "study-course-badge", course.title)
    );

    container.appendChild(header);

    /* Progress summary */

    const summary = makePlanElement("div", "study-plan-summary");

    const percent = tasks.length
        ? Math.round(completedIds.size / tasks.length * 100)
        : 0;

    const totalMinutes = tasks.reduce((sum, task) => {
        const match = String(task.duration).match(/\d+/);
        return sum + (match ? Number(match[0]) : 0);
    }, 0);

    summary.appendChild(
        makePlanElement(
            "p",
            "",
            `${completedIds.size} of ${tasks.length} tasks completed · ${totalMinutes} minutes planned`
        )
    );

    const track = makePlanElement("div", "study-plan-track");
    const fill = makePlanElement("div", "study-plan-fill");

    fill.style.width = `${percent}%`;
    track.appendChild(fill);
    summary.appendChild(track);
    container.appendChild(summary);

    /* Course completion message */

    if (getNextLessonIndex(course) === -1) {
        container.appendChild(
            makePlanElement(
                "p",
                "study-plan-note",
                `🎉 You've completed ${course.title}! Today's plan focuses on revision and practice.`
            )
        );
    }

    /* Tasks */

    const list = makePlanElement("div", "study-plan-list");

    tasks.forEach(task => {
        const done = completedIds.has(task.id);

        const row = makePlanElement(
            "article",
            `study-task${done ? " task-done" : ""}`
        );

        // Checkbox
        const label = makePlanElement("label", "study-task-check");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = done;
        checkbox.setAttribute(
            "aria-label",
            `Complete ${task.title}`
        );

        const customCheck = makePlanElement("span", "custom-check");
        label.append(checkbox, customCheck);

        // Task details
        const info = makePlanElement("div", "task-info");

        info.append(
            makePlanElement("h3", "", task.title),
            makePlanElement("span", "", task.duration)
        );

        // Priority and course link
        const actions = makePlanElement("div", "study-task-actions");

        actions.appendChild(
            makePlanElement(
                "span",
                `priority ${task.priority.toLowerCase()}`,
                done ? "Completed" : task.priority
            )
        );

        const openLink = makePlanElement(
            "a",
            "study-open-course",
            "Open courses →"
        );

        openLink.href = "courses.html";
        actions.appendChild(openLink);

        row.append(label, info, actions);
        list.appendChild(row);

        // Save task completion immediately.
        checkbox.addEventListener("change", () => {
            const latestSaved = readLocalJSON(planKey, {});

            if (checkbox.checked) {
                latestSaved[task.id] = true;
            } else {
                delete latestSaved[task.id];
            }

            writeLocalJSON(planKey, latestSaved);
            renderPersonalizedStudyPlan();
        });
    });

    container.appendChild(list);

    /* Footer */

    const footer = makePlanElement("div", "study-plan-footer");

    footer.appendChild(
        makePlanElement(
            "span",
            "",
            `${percent}% of today's plan completed`
        )
    );

    const resetButton = makePlanElement(
        "button",
        "study-reset-button",
        "Reset today's checklist"
    );

    resetButton.type = "button";

    resetButton.addEventListener("click", () => {
        const confirmed = window.confirm(
            "Reset today's study checklist?"
        );

        if (!confirmed) return;

        writeLocalJSON(planKey, {});
        renderPersonalizedStudyPlan();
    });

    footer.appendChild(resetButton);
    container.appendChild(footer);
}

/* ==========================================
   UPDATE WHEN PROGRESS CHANGES IN ANOTHER TAB
========================================== */

window.addEventListener("storage", event => {
    if (
        event.key === COURSE_PROGRESS_KEY ||
        event.key === LAST_COURSE_KEY
    ) {
        renderPersonalizedStudyPlan();
    }
});

/* ==========================================
   LOGOUT
========================================== */

function logout() {
    const confirmed = window.confirm("Do you want to logout?");

    if (!confirmed) return;

    localStorage.removeItem("token");
    window.location.href = "login.html";
}

/* ==========================================
   START DASHBOARD
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    setWelcomeMessage();
    setLiveDate();
    activateCardEffects();
    activateSidebar();

    loadProfileImage();
    loadDashboardData();
    renderPersonalizedStudyPlan();
});
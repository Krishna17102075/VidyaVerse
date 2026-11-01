
/* =====================================================
   VIDYAVERSE — PERSONALIZED TODAY'S STUDY PLAN
   Reads progress from courses.js and updates automatically.
===================================================== */

(() => {
    "use strict";

    const PROGRESS_KEY = "vidyaverse_courses_progress";
    const LAST_COURSE_KEY = "vidyaverse_last_course";
    const PLAN_KEY = "vidyaverse_daily_plan_v1";

    const container = document.getElementById("studyPlan");

    // This script is intended for the dashboard.
    if (!container) return;

    // Keep these lesson names in the same order as courses.js.
    const courseLessons = [
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
            revision: "Review HTML structure, tags and core definitions",
            practice: "Practise HTML and CSS with a small webpage"
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
            revision: "Revise C++ syntax, data types and key definitions",
            practice: "Write a short C++ program based on today's topic"
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
            revision: "Review database terminology, keys and core concepts",
            practice: "Write SQL queries using your current topic"
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
            practice: "Practise networking questions and draw a simple diagram"
        }
    ];

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Unable to save study plan:", error);
        }
    }

    function todayString() {
        const date = new Date();
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function getCourseState(course) {
        const allProgress = readJSON(PROGRESS_KEY, {});
        const saved = allProgress[course.id] || {};

        const completed = Array.isArray(saved.completed)
            ? saved.completed.filter(
                index => Number.isInteger(index) &&
                         index >= 0 &&
                         index < course.lessons.length
            )
            : [];

        return {
            completed: [...new Set(completed)],
            lastLesson: Number.isInteger(saved.lastLesson)
                ? saved.lastLesson
                : 0
        };
    }

    function getCompletedCount(course) {
        return getCourseState(course).completed.length;
    }

    function getNextLessonIndex(course) {
        const state = getCourseState(course);

        return course.lessons.findIndex(
            (_, index) => !state.completed.includes(index)
        );
    }

    function getLastCourseId() {
        // courses.js stores this value as a JSON string.
        const parsed = readJSON(LAST_COURSE_KEY, "");
        if (typeof parsed === "string") return parsed;

        // Also tolerate an older, unquoted localStorage value.
        return localStorage.getItem(LAST_COURSE_KEY) || "";
    }

    function chooseCourse() {
        const lastCourseId = getLastCourseId();
        const lastCourse = courseLessons.find(
            course => course.id === lastCourseId
        );

        // Prefer the course the student last opened, if unfinished.
        if (lastCourse && getNextLessonIndex(lastCourse) !== -1) {
            return lastCourse;
        }

        // Otherwise choose the unfinished course with most progress.
        const unfinished = courseLessons
            .filter(course => getNextLessonIndex(course) !== -1)
            .sort((a, b) =>
                getCompletedCount(b) - getCompletedCount(a)
            );

        return unfinished[0] || lastCourse || courseLessons[0];
    }

    function getDailyTasks(course) {
        const nextIndex = getNextLessonIndex(course);
        const state = getCourseState(course);
        const nextLesson = nextIndex >= 0
            ? course.lessons[nextIndex]
            : null;

        const previousCompleted = state.completed.length > 0;
        const completedCount = state.completed.length;

        if (!nextLesson) {
            return [
                {
                    id: "revision",
                    title: "Review " + course.title,
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

        if (previousCompleted) {
            const previousIndex = state.completed
                .filter(index => index < nextIndex)
                .sort((a, b) => b - a)[0];

            tasks.push({
                id: "revision",
                title: previousIndex !== undefined
                    ? "Revise: " + course.lessons[previousIndex]
                    : course.revision,
                duration: "20 minutes",
                priority: "Medium"
            });
        } else {
            tasks.push({
                id: "revision",
                title: course.revision,
                duration: "15 minutes",
                priority: "Medium"
            });
        }

        tasks.push({
            id: "lesson-" + nextIndex,
            title: "Continue " + course.title + ": " + nextLesson,
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

    function getPlanState(course, tasks) {
        const key = PLAN_KEY + "_" + todayString() + "_" + course.id;
        const saved = readJSON(key, {});

        return {
            key,
            completed: tasks
                .filter(task => saved[task.id] === true)
                .map(task => task.id)
        };
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function renderPlan() {
        const course = chooseCourse();
        const tasks = getDailyTasks(course);
        const planState = getPlanState(course, tasks);
        const completedIds = new Set(planState.completed);

        container.replaceChildren();

        const header = createElement("div", "study-plan-header");
        const headingArea = createElement("div");

        const heading = createElement("h2", "", "Today's Study Plan");
        const subtitle = createElement(
            "p",
            "study-plan-subtitle",
            "Personalized for " + course.title
        );

        headingArea.append(heading, subtitle);

        const badge = createElement(
            "span",
            "study-course-badge",
            course.title
        );

        header.append(headingArea, badge);
        container.appendChild(header);

        const summary = createElement("div", "study-plan-summary");
        const totalMinutes = tasks.reduce((sum, task) => {
            const minutes = parseInt(task.duration, 10);
            return sum + (Number.isFinite(minutes) ? minutes : 0);
        }, 0);

        const summaryText = createElement(
            "p",
            "",
            `${completedIds.size} of ${tasks.length} tasks completed · ${totalMinutes} minutes planned`
        );

        const track = createElement("div", "study-plan-track");
        const fill = createElement("div", "study-plan-fill");
        const percent = tasks.length
            ? Math.round(completedIds.size / tasks.length * 100)
            : 0;

        fill.style.width = percent + "%";
        track.appendChild(fill);
        summary.append(summaryText, track);
        container.appendChild(summary);

        if (getNextLessonIndex(course) === -1) {
            const note = createElement(
                "p",
                "study-plan-note",
                "🎉 You've completed this course! Your plan focuses on revision and practice."
            );
            container.appendChild(note);
        }

        const list = createElement("div", "study-plan-list");

        tasks.forEach(task => {
            const done = completedIds.has(task.id);
            const row = createElement(
                "article",
                "study-task" + (done ? " task-done" : "")
            );

            const checkLabel = createElement("label", "study-task-check");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = done;
            checkbox.setAttribute("aria-label", "Complete " + task.title);

            const checkMark = createElement("span", "custom-check");
            checkLabel.append(checkbox, checkMark);

            const info = createElement("div", "task-info");
            const title = createElement("h3", "", task.title);
            const duration = createElement("span", "", task.duration);
            info.append(title, duration);

            const rightSide = createElement("div", "study-task-actions");
            const priority = createElement(
                "span",
                "priority " + task.priority.toLowerCase(),
                done ? "Completed" : task.priority
            );

            const openButton = createElement(
                "a",
                "study-open-course",
                "Open course →"
            );
            openButton.href = "courses.html";
            openButton.setAttribute("aria-label", "Open " + course.title);

            rightSide.append(priority, openButton);
            row.append(checkLabel, info, rightSide);
            list.appendChild(row);

            checkbox.addEventListener("change", () => {
                const saved = readJSON(planState.key, {});

                if (checkbox.checked) {
                    saved[task.id] = true;
                } else {
                    delete saved[task.id];
                }

                saveJSON(planState.key, saved);
                renderPlan();
            });
        });

        container.appendChild(list);

        const footer = createElement("div", "study-plan-footer");
        const progressLabel = createElement(
            "span",
            "",
            percent + "% of today's plan completed"
        );

        const resetButton = createElement(
            "button",
            "study-reset-button",
            "Reset today's checklist"
        );

        resetButton.type = "button";
        resetButton.addEventListener("click", () => {
            if (!confirm("Reset today's study checklist?")) return;
            saveJSON(planState.key, {});
            renderPlan();
        });

        footer.append(progressLabel, resetButton);
        container.appendChild(footer);
    }

    // Recalculate whenever the dashboard is opened.
    renderPlan();

    // Refresh the plan if course progress changes in another open tab.
    window.addEventListener("storage", event => {
        if (
            event.key === PROGRESS_KEY ||
            event.key === LAST_COURSE_KEY
        ) {
            renderPlan();
        }
    });
})();
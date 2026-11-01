
/* =========================================
   VIDYAVERSE — PROGRESS PAGE
========================================= */

(() => {
    "use strict";

    /*
      IMPORTANT:
      Use the same storage key as your courses.js.
      If courses.js uses a different key, change it here.
    */
    const STORAGE_KEY = "vidyaVerseCourseProgressV1";

    const courses = [
        {
            id: "web-development",
            title: "Web Development",
            category: "Web Development",
            description: "HTML, CSS, JavaScript and responsive websites.",
            lessons: 10,
            icon: "fa-code",
            href: "courses.html"
        },
        {
            id: "cpp-programming",
            title: "C++ Programming",
            category: "Programming",
            description: "Programming fundamentals and object-oriented programming.",
            lessons: 10,
            icon: "fa-laptop-code",
            href: "courses.html"
        },
        {
            id: "dbms-sql",
            title: "DBMS & SQL",
            category: "Database",
            description: "Database design, SQL queries, joins and normalization.",
            lessons: 10,
            icon: "fa-database",
            href: "courses.html"
        },
        {
            id: "computer-networks",
            title: "Computer Networks",
            category: "Networking",
            description: "Network models, protocols, addressing and routing.",
            lessons: 10,
            icon: "fa-network-wired",
            href: "courses.html"
        }
    ];

    const $ = (id) => document.getElementById(id);

    function readSavedProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.error("Could not read saved course progress:", error);
            return {};
        }
    }

    /*
      Supports common progress formats:
      - { completedLessons: [0, 2] }
      - { completed: [true, false] }
      - { lessons: [{ completed: true }] }
      - { completedLessons: 3 }
      - [true, false, true]
    */
    function getCompletedCount(value, lessonCount) {
        if (value == null) return 0;

        if (typeof value === "number") {
            return Math.max(0, Math.min(lessonCount, value));
        }

        if (typeof value === "boolean") {
            return value ? lessonCount : 0;
        }

        if (Array.isArray(value)) {
            if (value.every((item) => typeof item === "boolean")) {
                return value.filter(Boolean).length;
            }

            if (value.every((item) => typeof item === "number")) {
                return new Set(value.filter(
                    (n) => Number.isInteger(n) && n >= 0 && n < lessonCount
                )).size;
            }

            return value.filter((item) =>
                item === true ||
                item?.completed === true ||
                item?.isCompleted === true
            ).length;
        }

        if (typeof value === "object") {
            if (Array.isArray(value.completed)) {
                return getCompletedCount(value.completed, lessonCount);
            }

            if (Array.isArray(value.completedLessons)) {
                return getCompletedCount(value.completedLessons, lessonCount);
            }

            if (Array.isArray(value.lessons)) {
                return getCompletedCount(value.lessons, lessonCount);
            }

            if (typeof value.completedLessons === "number") {
                return getCompletedCount(value.completedLessons, lessonCount);
            }

            if (typeof value.completedCount === "number") {
                return getCompletedCount(value.completedCount, lessonCount);
            }

            if (typeof value.progress === "number") {
                // Only treat progress as a percentage when explicitly named.
                return Math.round(
                    Math.max(0, Math.min(100, value.progress)) *
                    lessonCount / 100
                );
            }
        }

        return 0;
    }

    function getCourseProgress(saved, course) {
        const aliases = {
            "web-development": [
                "web-development", "webDevelopment", "web", "html-css-js"
            ],
            "cpp-programming": [
                "cpp-programming", "cppProgramming", "cpp", "c++"
            ],
            "dbms-sql": [
                "dbms-sql", "dbmsSql", "dbms", "sql"
            ],
            "computer-networks": [
                "computer-networks", "computerNetworks", "networking", "networks"
            ]
        };

        const keys = aliases[course.id] || [course.id];

        let courseData = null;

        for (const key of keys) {
            if (saved && Object.prototype.hasOwnProperty.call(saved, key)) {
                courseData = saved[key];
                break;
            }
        }

        // Also support data saved inside a "courses" property.
        if (courseData == null && saved?.courses) {
            for (const key of keys) {
                if (Object.prototype.hasOwnProperty.call(saved.courses, key)) {
                    courseData = saved.courses[key];
                    break;
                }
            }
        }

        const completed = Math.min(
            course.lessons,
            getCompletedCount(courseData, course.lessons)
        );

        return {
            completed,
            total: course.lessons,
            percentage: Math.round(completed / course.lessons * 100)
        };
    }

    function updateStats(progressList) {
        const totalCourses = courses.length;
        const totalLessons = courses.reduce(
            (sum, course) => sum + course.lessons, 0
        );
        const completedLessons = progressList.reduce(
            (sum, item) => sum + item.completed, 0
        );
        const remaining = totalLessons - completedLessons;
        const percentage = totalLessons
            ? Math.round(completedLessons / totalLessons * 100)
            : 0;

        $("totalCourses").textContent = totalCourses;
        $("completedLessons").textContent = completedLessons;
        $("overallProgress").textContent = percentage + "%";
        $("remainingLessons").textContent = remaining;

        $("overallFraction").textContent =
            `${completedLessons} / ${totalLessons} lessons`;

        $("overallProgressBar").style.width = percentage + "%";
        $("overallPercentLabel").textContent = percentage + "% complete";

        let message = "Your learning journey starts here.";

        if (percentage === 100) {
            message = "Amazing! You've completed every listed lesson.";
        } else if (percentage >= 75) {
            message = "Fantastic progress! You're almost at your goal.";
        } else if (percentage >= 40) {
            message = "Great work! Keep building your momentum.";
        } else if (percentage > 0) {
            message = "Every completed lesson brings you closer to your goal.";
        }

        $("overallMessage").textContent = message;

        $("learningSummary").innerHTML = `
            You have completed <strong>${completedLessons}</strong>
            out of <strong>${totalLessons}</strong> listed lessons.
            Your overall completion rate is
            <strong>${percentage}%</strong>.
            ${
                remaining > 0
                    ? `There are <strong>${remaining}</strong> lessons remaining.`
                    : "You've completed all listed lessons!"
            }
        `;
    }

    function renderCourseCards(progressList) {
        const container = $("progressCourseList");
        container.innerHTML = "";

        progressList.forEach(({ course, completed, total, percentage }) => {
            const card = document.createElement("article");
            card.className = "progress-course";

            const top = document.createElement("div");
            top.className = "progress-course-top";

            const icon = document.createElement("div");
            icon.className = "progress-course-icon";

            const iconElement = document.createElement("i");
            iconElement.className = `fas ${course.icon}`;
            icon.appendChild(iconElement);

            const info = document.createElement("div");
            info.className = "progress-course-info";

            const title = document.createElement("h3");
            title.textContent = course.title;

            const description = document.createElement("p");
            description.textContent = course.description;

            info.append(title, description);

            const percent = document.createElement("span");
            percent.className = "course-percent";
            percent.textContent = `${percentage}%`;

            top.append(icon, info, percent);

            const track = document.createElement("div");
            track.className = "course-track";
            track.setAttribute("role", "progressbar");
            track.setAttribute("aria-valuemin", "0");
            track.setAttribute("aria-valuemax", "100");
            track.setAttribute("aria-valuenow", String(percentage));
            track.setAttribute(
                "aria-label",
                `${course.title} completion`
            );

            const fill = document.createElement("div");
            fill.className = "course-fill";
            fill.style.width = `${percentage}%`;
            track.appendChild(fill);

            const meta = document.createElement("div");
            meta.className = "course-progress-meta";

            const lessonCount = document.createElement("span");
            lessonCount.textContent =
                `${completed} of ${total} lessons completed`;

            const status = document.createElement("span");
            status.textContent = percentage === 100
                ? "Completed"
                : percentage > 0
                    ? "In progress"
                    : "Not started";

            meta.append(lessonCount, status);

            const link = document.createElement("a");
            link.className = "course-action";
            link.href = course.href;
            link.innerHTML = percentage === 0
                ? 'Start learning <i class="fas fa-arrow-right"></i>'
                : percentage === 100
                    ? 'Review course <i class="fas fa-arrow-right"></i>'
                    : 'Continue learning <i class="fas fa-arrow-right"></i>';

            card.append(top, track, meta, link);
            container.appendChild(card);
        });
    }

    function renderProgress() {
        const saved = readSavedProgress();

        const progressList = courses.map((course) => ({
            course,
            ...getCourseProgress(saved, course)
        }));

        updateStats(progressList);
        renderCourseCards(progressList);
    }

    renderProgress();

    // Refresh when returning to this tab after studying.
    window.addEventListener("focus", renderProgress);
    window.addEventListener("pageshow", renderProgress);

    // Refresh when another page in this browser tab group changes storage.
    window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY || event.key === null) {
            renderProgress();
        }
    });
})();
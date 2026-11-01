
(() => {
    "use strict";

    const STORAGE_KEY = "vidyaVerseStudyPlannerV1";
    const $ = id => document.getElementById(id);

    const titles = {
        today: ["Today's Tasks", "Make today count. One task at a time."],
        week: ["Weekly Plan", "Organize your study schedule for the week."],
        goals: ["My Goals", "Set targets and celebrate your achievements."],
        progress: ["Study Progress", "See how consistently you're moving forward."]
    };

    const days = [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ];

    let activeView = "today";
    let selectedDay = getTodayName();
    let data = loadData();

    function getTodayName() {
        const day = new Date().getDay();
        return days[(day + 6) % 7];
    }

    function todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }

    function loadData() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return {
                tasks: Array.isArray(saved?.tasks) ? saved.tasks : [],
                goals: Array.isArray(saved?.goals) ? saved.goals : []
            };
        } catch {
            return { tasks: [], goals: [] };
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateStats();
    }

    function makeId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[char]);
    }

    function updateStats() {
        const completed = data.tasks.filter(t => t.completed).length;
        const total = data.tasks.length;
        const active = data.goals.filter(g => !g.completed).length;
        const rate = total ? Math.round(completed / total * 100) : 0;

        $("totalTasks").textContent = total;
        $("completedTasks").textContent = completed;
        $("activeGoals").textContent = active;
        $("completionRate").textContent = rate + "%";
    }

    function render() {
        $("currentDate").textContent = new Date().toLocaleDateString(
            "en-IN", { day: "numeric", month: "short", year: "numeric" }
        );

        document.querySelectorAll(".planner-tab").forEach(button => {
            button.classList.toggle("active", button.dataset.view === activeView);
        });

        $("pageTitle").textContent = titles[activeView][0];
        $("pageSubtitle").textContent = titles[activeView][1];

        updateStats();

        if (activeView === "today") renderToday();
        if (activeView === "week") renderWeek();
        if (activeView === "goals") renderGoals();
        if (activeView === "progress") renderProgress();
    }

    function empty(message, icon = "fa-seedling") {
        return `<div class="empty-state">
            <i class="fas ${icon}"></i>${message}
        </div>`;
    }

    function taskMarkup(task) {
        return `
        <div class="task-row ${task.completed ? "done" : ""}">
            <input type="checkbox" data-action="toggle-task"
                data-id="${escapeHTML(task.id)}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark ${escapeHTML(task.title)} complete">

            <div class="task-main">
                <strong>${escapeHTML(task.title)}</strong>
                <small>${escapeHTML(task.day)} · ${escapeHTML(task.date || "No deadline")}</small>
            </div>

            <span class="priority ${escapeHTML(task.priority.toLowerCase())}">
                ${escapeHTML(task.priority)}
            </span>

            <button class="delete-btn" data-action="delete-task"
                data-id="${escapeHTML(task.id)}" aria-label="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;
    }

    function taskForm(defaultDay, defaultDate = "") {
        return `
        <form class="task-form" id="taskForm">
            <input class="field" name="title" maxlength="120"
                placeholder="What do you want to study?" required>

            <select class="select-field" name="priority" aria-label="Task priority">
                <option value="Normal">Normal priority</option>
                <option value="High">High priority</option>
                <option value="Low">Low priority</option>
            </select>

            <button class="primary-btn" type="submit">
                <i class="fas fa-plus"></i> Add Task
            </button>

            <input type="hidden" name="day" value="${escapeHTML(defaultDay)}">
            <input type="hidden" name="date" value="${escapeHTML(defaultDate)}">
        </form>`;
    }

    function renderToday() {
        const today = getTodayName();
        const tasks = data.tasks.filter(t => t.date === todayKey());

        $("plannerContent").innerHTML = `
            <section class="panel">
                <div class="panel-heading">
                    <div>
                        <h2>Today's To-Do List</h2>
                        <p>Add your study tasks and tick them off when finished.</p>
                    </div>
                    <span class="priority">${tasks.filter(t => t.completed).length}/${tasks.length} done</span>
                </div>

                ${taskForm(today, todayKey())}

                <div class="task-list">
                    ${tasks.length
                        ? tasks.map(taskMarkup).join("")
                        : empty("No tasks for today yet. Add your first study task above.", "fa-calendar-plus")}
                </div>
            </section>

            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Today's Focus</h2><p>A little progress is better than none.</p></div>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${tasks.length ? Math.round(tasks.filter(t=>t.completed).length/tasks.length*100) : 0}%"></div>
                </div>
                <p style="color:var(--muted);font-size:12px;margin:12px 0 0">
                    ${tasks.length ? Math.round(tasks.filter(t=>t.completed).length/tasks.length*100) : 0}% of today's tasks completed
                </p>
            </section>`;
    }

    function renderWeek() {
        const weekTasks = data.tasks.filter(t => days.includes(t.day));

        $("plannerContent").innerHTML = `
            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Your Weekly Schedule</h2><p>Select a day to view or add tasks.</p></div>
                </div>

                <div class="day-selector">
                    ${days.map(day => `
                        <button class="day-btn ${day === selectedDay ? "active" : ""}"
                            data-action="select-day" data-day="${day}">
                            ${day.slice(0,3)}
                            <small>(${weekTasks.filter(t=>t.day===day).length})</small>
                        </button>
                    `).join("")}
                </div>

                <h3>${selectedDay}</h3>
                ${taskForm(selectedDay)}

                <div class="week-list">
                    ${weekTasks.filter(t=>t.day===selectedDay).length
                        ? weekTasks.filter(t=>t.day===selectedDay).map(taskMarkup).join("")
                        : empty(`Nothing planned for ${selectedDay}. Add a task to organize your day.`, "fa-calendar-day")}
                </div>
            </section>

            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Week at a Glance</h2><p>Your task distribution across the week.</p></div>
                </div>
                <div class="week-list">
                    ${days.map(day => {
                        const tasks = weekTasks.filter(t=>t.day===day);
                        const done = tasks.filter(t=>t.completed).length;
                        const percent = tasks.length ? Math.round(done/tasks.length*100) : 0;
                        return `
                        <div class="week-row">
                            <div class="task-main">
                                <strong>${day}</strong>
                                <small>${done} of ${tasks.length} tasks completed</small>
                                <div class="progress-track" style="margin-top:8px">
                                    <div class="progress-fill" style="width:${percent}%"></div>
                                </div>
                            </div>
                            <span class="course-percent">${percent}%</span>
                        </div>`;
                    }).join("")}
                </div>
            </section>`;
    }

    function renderGoals() {
        $("plannerContent").innerHTML = `
            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Create a Learning Goal</h2><p>Choose a target and a deadline to stay motivated.</p></div>
                </div>

                <form class="goal-form" id="goalForm">
                    <input class="field" name="title" maxlength="120"
                        placeholder="e.g. Complete HTML and CSS" required>
                    <input class="field" type="date" name="deadline"
                        min="${todayKey()}" required aria-label="Goal deadline">
                    <button class="primary-btn" type="submit">
                        <i class="fas fa-plus"></i> Add Goal
                    </button>
                </form>
            </section>

            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Your Goals</h2><p>Update goal progress as you work toward each target.</p></div>
                </div>

                <div class="goal-list">
                    ${data.goals.length ? data.goals.map(goal => `
                        <div class="goal-row">
                            <div class="goal-main">
                                <strong>${escapeHTML(goal.title)}</strong>
                                <small>Deadline: ${escapeHTML(goal.deadline)}</small>
                                <div class="goal-progress progress-track">
                                    <div class="progress-fill" style="width:${goal.progress}%"></div>
                                </div>
                                <small>${goal.progress}% complete ${goal.completed ? "· Goal achieved!" : ""}</small>
                            </div>

                            ${!goal.completed ? `
                                <select class="select-field" data-action="goal-progress"
                                    data-id="${escapeHTML(goal.id)}" aria-label="Goal progress">
                                    ${[0,25,50,75,100].map(n =>
                                        `<option value="${n}" ${goal.progress===n?"selected":""}>${n}%</option>`
                                    ).join("")}
                                </select>` : `<span class="priority">Achieved</span>`}

                            <button class="delete-btn" data-action="delete-goal"
                                data-id="${escapeHTML(goal.id)}" aria-label="Delete goal">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join("") : empty("You haven't created any goals yet. Add one above!", "fa-bullseye")}
                </div>
            </section>`;
    }

    function renderProgress() {
        const today = todayKey();
        const todayTasks = data.tasks.filter(t => t.date === today);
        const weekTasks = data.tasks.filter(t => days.includes(t.day));
        const completed = data.tasks.filter(t => t.completed).length;
        const total = data.tasks.length;
        const rate = total ? Math.round(completed/total*100) : 0;
        const goalsDone = data.goals.filter(g => g.completed).length;
        const goalRate = data.goals.length
            ? Math.round(goalsDone/data.goals.length*100)
            : 0;

        $("plannerContent").innerHTML = `
            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Your Study Overview</h2><p>Your activity is calculated from the tasks and goals you record here.</p></div>
                </div>

                <div class="summary-grid">
                    <div class="summary-box">
                        <span>All Tasks Completed</span>
                        <strong>${completed} / ${total}</strong>
                    </div>
                    <div class="summary-box">
                        <span>Task Completion Rate</span>
                        <strong>${rate}%</strong>
                    </div>
                    <div class="summary-box">
                        <span>Today's Tasks</span>
                        <strong>${todayTasks.filter(t=>t.completed).length} / ${todayTasks.length}</strong>
                    </div>
                    <div class="summary-box">
                        <span>Weekly Tasks Completed</span>
                        <strong>${weekTasks.filter(t=>t.completed).length} / ${weekTasks.length}</strong>
                    </div>
                    <div class="summary-box">
                        <span>Goals Achieved</span>
                        <strong>${goalsDone} / ${data.goals.length}</strong>
                    </div>
                    <div class="summary-box">
                        <span>Goal Completion Rate</span>
                        <strong>${goalRate}%</strong>
                    </div>
                </div>
            </section>

            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Task Completion</h2><p>Complete more tasks to fill your progress bar.</p></div>
                    <strong>${rate}%</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${rate}%"></div>
                </div>
            </section>

            <section class="panel">
                <div class="panel-heading">
                    <div><h2>Goal Achievement</h2><p>Your completed goals compared with all goals.</p></div>
                    <strong>${goalRate}%</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${goalRate}%"></div>
                </div>
            </section>`;
    }

    $("plannerContent").addEventListener("submit", event => {
        event.preventDefault();
        const form = event.target;

        if (form.id === "taskForm") {
            const fd = new FormData(form);
            const title = String(fd.get("title") || "").trim();
            if (!title) return;

            data.tasks.push({
                id: makeId(),
                title,
                priority: String(fd.get("priority") || "Normal"),
                day: String(fd.get("day") || selectedDay),
                date: String(fd.get("date") || ""),
                completed: false
            });

            saveData();
            render();
        }

        if (form.id === "goalForm") {
            const fd = new FormData(form);
            const title = String(fd.get("title") || "").trim();
            const deadline = String(fd.get("deadline") || "");
            if (!title || !deadline) return;

            data.goals.push({
                id: makeId(),
                title,
                deadline,
                progress: 0,
                completed: false
            });

            saveData();
            render();
        }
    });

    $("plannerContent").addEventListener("change", event => {
        const control = event.target;
        const action = control.dataset.action;
        const id = control.dataset.id;

        if (action === "toggle-task") {
            const task = data.tasks.find(t => t.id === id);
            if (task) task.completed = control.checked;
            saveData();
            render();
        }

        if (action === "goal-progress") {
            const goal = data.goals.find(g => g.id === id);
            if (goal) {
                goal.progress = Number(control.value);
                goal.completed = goal.progress === 100;
            }
            saveData();
            render();
        }
    });

    $("plannerContent").addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, id, day } = button.dataset;

        if (action === "select-day") {
            selectedDay = day;
            activeView = "week";
            render();
        }

        if (action === "delete-task") {
            data.tasks = data.tasks.filter(t => t.id !== id);
            saveData();
            render();
        }

        if (action === "delete-goal") {
            data.goals = data.goals.filter(g => g.id !== id);
            saveData();
            render();
        }
    });

    document.querySelectorAll(".planner-tab").forEach(button => {
        button.addEventListener("click", () => {
            activeView = button.dataset.view;
            render();
        });
    });

    render();
})();
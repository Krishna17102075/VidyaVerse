/* =========================================================
   VIDYAVERSE — COURSES.JS
   Features:
   - 4 BCA courses and 40 lessons
   - A separate YouTube search for every lesson
   - Introductory video player for each course
   - Course search and category filters
   - Lesson navigation
   - Mark lessons complete
   - Progress tracking with LocalStorage
   - Continue learning
========================================================= */

"use strict";

// =========================================================
// 1. STORAGE
// =========================================================

const STORAGE_KEY = "vidyaverse_courses_progress";
const LAST_COURSE_KEY = "vidyaverse_last_course";

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn("Could not read saved data:", error);
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Could not save data:", error);
    }
}

let progressData = readStorage(STORAGE_KEY, {});
let lastCourseId = readStorage(LAST_COURSE_KEY, "");

// =========================================================
// 2. COURSE DATA
// Each lesson has its own videoQuery.
// =========================================================

const courses = [
    {
        id: "web-development",
        title: "Web Development",
        category: "Web Development",
        icon: "fa-code",
        level: "Beginner",
        duration: "4–6 weeks",
        description: "Learn HTML, CSS and JavaScript by building real websites.",
        videoId: "pQN-pnXPaVg",

        lessons: [
            {
                title: "HTML Basics",
                videoQuery: "freeCodeCamp HTML full course for beginners",
                content: `
                    <h3>What is HTML?</h3>
                    <p>HTML (HyperText Markup Language) defines the structure
                    of a webpage using elements and tags.</p>
                    <h4>Your first webpage</h4>
                    <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;title&gt;My Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Welcome to VidyaVerse&lt;/h1&gt;
    &lt;p&gt;My first webpage.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
                    <p>Learn headings, paragraphs, links, images, lists and
                    semantic HTML elements.</p>
                `
            },
            {
                title: "HTML Forms and Tables",
                videoQuery: "HTML forms and tables tutorial for beginners",
                content: `
                    <h3>Forms and Tables</h3>
                    <p>Forms collect user information, while tables display
                    data in rows and columns.</p>
                    <pre><code>&lt;form&gt;
    &lt;label for="name"&gt;Name&lt;/label&gt;
    &lt;input id="name" type="text" required&gt;
    &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>
                    <p>Study input types, labels, validation, table headings,
                    table rows, colspan and rowspan.</p>
                `
            },
            {
                title: "CSS Fundamentals",
                videoQuery: "freeCodeCamp CSS full course for beginners",
                content: `
                    <h3>Introduction to CSS</h3>
                    <p>CSS controls the appearance and layout of HTML elements.</p>
                    <pre><code>h1 {
    color: #a52a52;
    font-size: 32px;
    text-align: center;
}</code></pre>
                    <p>Learn selectors, colors, fonts, backgrounds, borders,
                    margins, padding and the CSS box model.</p>
                `
            },
            {
                title: "CSS Flexbox and Grid",
                videoQuery: "CSS Flexbox and CSS Grid complete tutorial for beginners",
                content: `
                    <h3>Modern CSS Layouts</h3>
                    <p>Flexbox arranges elements along a row or column.
                    Grid organises elements into rows and columns.</p>
                    <pre><code>.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}</code></pre>
                    <p>Practise navigation bars, card layouts, alignment and
                    responsive grids.</p>
                `
            },
            {
                title: "Responsive Design",
                videoQuery: "responsive web design CSS media queries tutorial for beginners",
                content: `
                    <h3>Responsive Websites</h3>
                    <p>Responsive design makes a website adapt to mobile,
                    tablet and desktop screens.</p>
                    <pre><code>@media (max-width: 600px) {
    .container {
        flex-direction: column;
    }
}</code></pre>
                    <p>Learn media queries, flexible widths, responsive images
                    and mobile-first design.</p>
                `
            },
            {
                title: "JavaScript Basics",
                videoQuery: "JavaScript full course for beginners freeCodeCamp",
                content: `
                    <h3>Introduction to JavaScript</h3>
                    <p>JavaScript adds functionality and interactivity to
                    webpages.</p>
                    <pre><code>let name = "Student";
let marks = 85;

if (marks >= 40) {
    console.log("Pass");
} else {
    console.log("Fail");
}</code></pre>
                    <p>Study variables, data types, operators, conditions,
                    loops, arrays, objects and functions.</p>
                `
            },
            {
                title: "DOM Manipulation",
                videoQuery: "JavaScript DOM manipulation tutorial for beginners",
                content: `
                    <h3>Document Object Model</h3>
                    <p>The DOM allows JavaScript to access and change webpage
                    elements.</p>
                    <pre><code>const heading = document.querySelector("h1");
heading.textContent = "Hello Student!";</code></pre>
                    <p>Learn querySelector, textContent, classList,
                    createElement and remove operations.</p>
                `
            },
            {
                title: "Events and Validation",
                videoQuery: "JavaScript events and form validation tutorial for beginners",
                content: `
                    <h3>Events in JavaScript</h3>
                    <p>Events allow a website to respond to user actions.</p>
                    <pre><code>document.querySelector("button")
    .addEventListener("click", function () {
        alert("Button clicked!");
    });</code></pre>
                    <p>Learn click events, input events, event listeners
                    and form validation.</p>
                `
            },
            {
                title: "Build a Landing Page",
                videoQuery: "HTML CSS responsive landing page project step by step",
                content: `
                    <h3>Landing Page Project</h3>
                    <p>Combine HTML and CSS to build a professional landing
                    page.</p>
                    <ul>
                        <li>Create a navigation bar.</li>
                        <li>Build a hero section.</li>
                        <li>Add feature cards.</li>
                        <li>Design a footer.</li>
                        <li>Make the page responsive.</li>
                    </ul>
                `
            },
            {
                title: "Web Development Mini Project",
                videoQuery: "HTML CSS JavaScript student portfolio project for beginners",
                content: `
                    <h3>Build Your Portfolio</h3>
                    <p>Create a portfolio website to display your skills and
                    projects.</p>
                    <ul>
                        <li>About me section</li>
                        <li>Skills and projects</li>
                        <li>Contact form</li>
                        <li>Responsive layout</li>
                    </ul>
                `
            }
        ]
    },

    {
        id: "cpp-programming",
        title: "C++ Programming",
        category: "Programming",
        icon: "fa-laptop-code",
        level: "Beginner",
        duration: "4–6 weeks",
        description: "Learn programming fundamentals and object-oriented programming.",
        videoId: "vLnPwxZ2Jjc",

        lessons: [
            {
                title: "Introduction to C++",
                videoQuery: "freeCodeCamp C++ programming full course for beginners",
                content: `
                    <h3>What is C++?</h3>
                    <p>C++ is a general-purpose programming language used
                    to develop applications and software.</p>
                    <pre><code>#include &lt;iostream&gt;
using namespace std;

int main() {
    cout &lt;&lt; "Hello World";
    return 0;
}</code></pre>
                    <p>Understand header files, main(), cout and program
                    execution.</p>
                `
            },
            {
                title: "Variables and Data Types",
                videoQuery: "C++ variables data types tutorial for beginners",
                content: `
                    <h3>Variables and Data Types</h3>
                    <p>Variables store values in a program.</p>
                    <pre><code>int age = 19;
float marks = 85.5;
char grade = 'A';
bool passed = true;</code></pre>
                    <p>Learn int, float, double, char, bool and string.</p>
                `
            },
            {
                title: "Operators and Conditions",
                videoQuery: "C++ operators if else switch statements tutorial",
                content: `
                    <h3>Operators and Conditions</h3>
                    <p>Operators perform calculations and comparisons.</p>
                    <pre><code>int marks = 75;

if (marks >= 40) {
    cout &lt;&lt; "Pass";
} else {
    cout &lt;&lt; "Fail";
}</code></pre>
                    <p>Study arithmetic, relational, logical and assignment
                    operators, if-else and switch statements.</p>
                `
            },
            {
                title: "Loops",
                videoQuery: "C++ for while do while loops tutorial for beginners",
                content: `
                    <h3>Loops in C++</h3>
                    <p>Loops repeat a block of code.</p>
                    <pre><code>for (int i = 1; i <= 5; i++) {
    cout &lt;&lt; i &lt;&lt; endl;
}</code></pre>
                    <p>Learn for, while, do-while, break and continue.</p>
                `
            },
            {
                title: "Functions",
                videoQuery: "C++ functions parameters return values tutorial",
                content: `
                    <h3>Functions</h3>
                    <p>Functions organise code into reusable blocks.</p>
                    <pre><code>int add(int a, int b) {
    return a + b;
}</code></pre>
                    <p>Study function declarations, parameters, return values,
                    overloading and recursion.</p>
                `
            },
            {
                title: "Arrays and Strings",
                videoQuery: "C++ arrays and strings tutorial for beginners",
                content: `
                    <h3>Arrays and Strings</h3>
                    <p>Arrays store multiple values of the same data type.</p>
                    <pre><code>int marks[] = {70, 80, 90};
cout &lt;&lt; marks[0];</code></pre>
                    <p>Learn indexing, array traversal, multidimensional
                    arrays and string operations.</p>
                `
            },
            {
                title: "Pointers and References",
                videoQuery: "C++ pointers and references explained for beginners",
                content: `
                    <h3>Pointers and References</h3>
                    <p>A pointer stores a memory address. A reference is
                    another name for an existing variable.</p>
                    <pre><code>int number = 10;
int* ptr = &amp;number;

cout &lt;&lt; *ptr;</code></pre>
                    <p>Study addresses, dereferencing, references and
                    basic pointer operations.</p>
                `
            },
            {
                title: "Classes and Objects",
                videoQuery: "C++ classes objects constructors encapsulation tutorial",
                content: `
                    <h3>Classes and Objects</h3>
                    <p>A class defines the properties and behaviour of
                    objects.</p>
                    <pre><code>class Student {
public:
    string name;

    void display() {
        cout &lt;&lt; name;
    }
};</code></pre>
                    <p>Learn objects, access specifiers, constructors and
                    encapsulation.</p>
                `
            },
            {
                title: "Inheritance and Polymorphism",
                videoQuery: "C++ inheritance and polymorphism complete tutorial",
                content: `
                    <h3>Inheritance and Polymorphism</h3>
                    <p>Inheritance allows a class to reuse another class's
                    properties. Polymorphism allows the same interface to
                    have different behaviours.</p>
                    <p>Study single, multiple, multilevel and hierarchical
                    inheritance, function overriding and virtual functions.</p>
                `
            },
            {
                title: "C++ Mini Project",
                videoQuery: "C++ student management system project for beginners",
                content: `
                    <h3>Student Management System</h3>
                    <p>Build a program to manage student information.</p>
                    <ul>
                        <li>Enter student details.</li>
                        <li>Calculate total marks and percentage.</li>
                        <li>Display grades.</li>
                        <li>Practise functions and classes.</li>
                    </ul>
                `
            }
        ]
    },

    {
        id: "dbms-sql",
        title: "DBMS & SQL",
        category: "Database",
        icon: "fa-database",
        level: "Beginner",
        duration: "3–5 weeks",
        description: "Learn databases, SQL queries, joins and normalization.",
        videoId: "OMwgGL3lHlI",

        lessons: [
            {
                title: "Introduction to DBMS",
                videoQuery: "Neso Academy introduction to DBMS",
                content: `
                    <h3>What is DBMS?</h3>
                    <p>A Database Management System helps users create,
                    organise, retrieve and manage data.</p>
                    <ul>
                        <li>Database and DBMS</li>
                        <li>File system versus DBMS</li>
                        <li>Advantages of DBMS</li>
                        <li>Examples: MySQL and PostgreSQL</li>
                    </ul>
                `
            },
            {
                title: "Tables, Rows and Keys",
                videoQuery: "DBMS relational model primary key foreign key candidate key tutorial",
                content: `
                    <h3>Relational Database Model</h3>
                    <p>Relational databases store data in tables made up
                    of rows and columns.</p>
                    <p>Study primary keys, foreign keys, candidate keys,
                    composite keys and constraints.</p>
                `
            },
            {
                title: "ER Model",
                videoQuery: "Neso Academy ER model entity relationship diagram DBMS",
                content: `
                    <h3>Entity-Relationship Model</h3>
                    <p>The ER model helps design a database before it is
                    created.</p>
                    <ul>
                        <li>Entities and attributes</li>
                        <li>Relationships and cardinality</li>
                        <li>Strong and weak entities</li>
                        <li>ER diagrams</li>
                    </ul>
                `
            },
            {
                title: "SQL Basics",
                videoQuery: "SQL tutorial for beginners create table insert select update delete",
                content: `
                    <h3>Introduction to SQL</h3>
                    <p>SQL is used to create and manage relational databases.</p>
                    <pre><code>CREATE TABLE Students (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

SELECT * FROM Students;</code></pre>
                    <p>Practise CREATE, INSERT, SELECT, UPDATE and DELETE.</p>
                `
            },
            {
                title: "SQL Filtering and Sorting",
                videoQuery: "SQL WHERE ORDER BY LIKE BETWEEN IN tutorial for beginners",
                content: `
                    <h3>Filtering and Sorting</h3>
                    <p>Use conditions to retrieve specific database records.</p>
                    <pre><code>SELECT *
FROM Students
WHERE id > 5
ORDER BY name;</code></pre>
                    <p>Learn WHERE, LIKE, IN, BETWEEN, AND, OR and ORDER BY.</p>
                `
            },
            {
                title: "SQL Joins",
                videoQuery: "SQL joins inner left right full outer self join explained with examples",
                content: `
                    <h3>SQL Joins</h3>
                    <p>Joins combine related records from two or more tables.</p>
                    <ul>
                        <li>INNER JOIN</li>
                        <li>LEFT JOIN and RIGHT JOIN</li>
                        <li>FULL OUTER JOIN</li>
                        <li>SELF JOIN</li>
                    </ul>
                `
            },
            {
                title: "Aggregate Functions",
                videoQuery: "SQL aggregate functions COUNT SUM AVG MIN MAX GROUP BY HAVING",
                content: `
                    <h3>Aggregate Functions</h3>
                    <p>Aggregate functions calculate values from multiple rows.</p>
                    <pre><code>SELECT COUNT(*) AS total_students
FROM Students;</code></pre>
                    <p>Learn COUNT, SUM, AVG, MIN, MAX, GROUP BY and HAVING.</p>
                `
            },
            {
                title: "Database Normalization",
                videoQuery: "DBMS normalization 1NF 2NF 3NF BCNF functional dependencies tutorial",
                content: `
                    <h3>Normalization</h3>
                    <p>Normalization organises database tables to reduce
                    unnecessary duplication and data anomalies.</p>
                    <p>Study functional dependencies, 1NF, 2NF, 3NF and BCNF.</p>
                `
            },
            {
                title: "Transactions and ACID",
                videoQuery: "DBMS transactions ACID properties commit rollback tutorial",
                content: `
                    <h3>Transactions and ACID</h3>
                    <p>A transaction is a group of database operations treated
                    as one logical unit.</p>
                    <p>Learn Atomicity, Consistency, Isolation and Durability,
                    as well as COMMIT and ROLLBACK.</p>
                `
            },
            {
                title: "DBMS Mini Project",
                videoQuery: "MySQL student database management system project tutorial",
                content: `
                    <h3>College Student Database</h3>
                    <p>Design a database for managing student information.</p>
                    <ul>
                        <li>Create Students and Courses tables.</li>
                        <li>Insert sample records.</li>
                        <li>Define primary and foreign keys.</li>
                        <li>Write queries using joins.</li>
                    </ul>
                `
            }
        ]
    },

    {
        id: "computer-networks",
        title: "Computer Networks",
        category: "Networking",
        icon: "fa-network-wired",
        level: "Beginner",
        duration: "3–5 weeks",
        description: "Understand network devices, OSI, TCP/IP, addressing and routing.",
        videoId: "VwN91x5i25g",

        lessons: [
            {
                title: "Introduction to Networks",
                videoQuery: "Neso Academy introduction to computer networks",
                content: `
                    <h3>What is a Computer Network?</h3>
                    <p>A computer network connects devices so they can
                    communicate and share resources.</p>
                    <p>Learn LAN, MAN, WAN, nodes, communication links
                    and network topologies.</p>
                `
            },
            {
                title: "Network Devices",
                videoQuery: "computer networks hub switch router modem gateway explained",
                content: `
                    <h3>Network Devices</h3>
                    <p>Network devices connect computers and transfer data.</p>
                    <ul>
                        <li>Hub and switch</li>
                        <li>Router and gateway</li>
                        <li>Modem and access point</li>
                        <li>Repeater and bridge</li>
                    </ul>
                `
            },
            {
                title: "OSI Reference Model",
                videoQuery: "Neso Academy OSI reference model seven layers explained",
                content: `
                    <h3>OSI Reference Model</h3>
                    <p>The OSI model divides network communication into seven
                    layers.</p>
                    <ol>
                        <li>Physical</li>
                        <li>Data Link</li>
                        <li>Network</li>
                        <li>Transport</li>
                        <li>Session</li>
                        <li>Presentation</li>
                        <li>Application</li>
                    </ol>
                `
            },
            {
                title: "TCP/IP Model",
                videoQuery: "TCP IP model four layers explained computer networks tutorial",
                content: `
                    <h3>TCP/IP Model</h3>
                    <p>The TCP/IP model describes the protocols used for
                    communication over modern networks.</p>
                    <ul>
                        <li>Application layer</li>
                        <li>Transport layer</li>
                        <li>Internet layer</li>
                        <li>Network access layer</li>
                    </ul>
                `
            },
            {
                title: "IP and MAC Addressing",
                videoQuery: "IP address vs MAC address IPv4 IPv6 subnet mask explained",
                content: `
                    <h3>IP and MAC Addresses</h3>
                    <p>An IP address provides logical addressing. A MAC
                    address is used for communication on a local network link.</p>
                    <p>Study IPv4, IPv6, private and public addresses,
                    subnet masks and logical versus physical addresses.</p>
                `
            },
            {
                title: "Transmission Media",
                videoQuery: "guided and unguided transmission media computer networks tutorial",
                content: `
                    <h3>Transmission Media</h3>
                    <p>Transmission media carries data between network devices.</p>
                    <p>Learn twisted-pair cable, coaxial cable, optical fibre,
                    radio waves, microwaves and infrared transmission.</p>
                `
            },
            {
                title: "Switching Techniques",
                videoQuery: "circuit switching packet switching message switching explained",
                content: `
                    <h3>Switching Techniques</h3>
                    <p>Switching determines how data moves from a source
                    to its destination through a network.</p>
                    <ul>
                        <li>Circuit switching</li>
                        <li>Packet switching</li>
                        <li>Message switching</li>
                    </ul>
                `
            },
            {
                title: "Routing Algorithms",
                videoQuery: "computer networks routing algorithms distance vector link state flooding tutorial",
                content: `
                    <h3>Routing Algorithms</h3>
                    <p>Routing selects paths for forwarding packets between
                    networks.</p>
                    <p>Study routing tables, static and dynamic routing,
                    distance-vector routing and link-state routing.</p>
                `
            },
            {
                title: "TCP and UDP",
                videoQuery: "TCP vs UDP explained computer networks for beginners",
                content: `
                    <h3>TCP and UDP</h3>
                    <p>TCP and UDP are transport-layer protocols.</p>
                    <p>TCP provides reliable, ordered delivery. UDP has
                    lower overhead and does not guarantee delivery.</p>
                    <p>Learn ports, reliability, connection setup and use cases.</p>
                `
            },
            {
                title: "Networking Mini Project",
                videoQuery: "beginner computer networking project topology IP addressing tutorial",
                content: `
                    <h3>Design a College Network</h3>
                    <p>Plan a small network for a college computer lab.</p>
                    <ul>
                        <li>Connect computers using a switch.</li>
                        <li>Add a router for network access.</li>
                        <li>Assign example IP addresses.</li>
                        <li>Explain how packets reach their destination.</li>
                    </ul>
                `
            }
        ]
    }
];

// =========================================================
// 3. HTML ELEMENTS
// =========================================================

const $ = id => document.getElementById(id);

const courseCards = $("courseCards");
const courseSearch = $("courseSearch");
const categoryFilter = $("categoryFilter");
const emptyCourses = $("emptyCourses");
const courseCount = $("courseCount");

const totalCourses = $("totalCourses");
const completedLessons = $("completedLessons");
const overallProgress = $("overallProgress");

const continueSection = $("continueSection");
const continueCard = $("continueCard");

const courseGridSection = $("courseGrid");
const lessonPanel = $("lessonPanel");
const backToCourses = $("backToCourses");

const lessonCourseTitle = $("lessonCourseTitle");
const lessonCourseDescription = $("lessonCourseDescription");
const lessonProgressText = $("lessonProgressText");
const lessonProgressFill = $("lessonProgressFill");

const lessonList = $("lessonList");
const selectedLessonTitle = $("selectedLessonTitle");
const selectedLessonContent = $("selectedLessonContent");

const previousLessonButton = $("previousLesson");
const nextLessonButton = $("nextLesson");
const completeLessonButton = $("completeLesson");

// =========================================================
// 4. CURRENT STATE
// =========================================================

let currentCourseId = null;
let currentLessonIndex = 0;

// =========================================================
// 5. PROGRESS FUNCTIONS
// =========================================================

function getCourseProgress(courseId) {
    if (!progressData[courseId]) {
        progressData[courseId] = {
            completed: [],
            lastLesson: 0
        };
    }

    return progressData[courseId];
}

function isLessonComplete(courseId, index) {
    return getCourseProgress(courseId).completed.includes(index);
}

function setLessonComplete(courseId, index, complete) {
    const state = getCourseProgress(courseId);

    if (complete && !state.completed.includes(index)) {
        state.completed.push(index);
    }

    if (!complete) {
        state.completed = state.completed.filter(
            item => item !== index
        );
    }

    saveStorage(STORAGE_KEY, progressData);
}

function getCompletedCount(course) {
    return course.lessons.filter(
        (_, index) => isLessonComplete(course.id, index)
    ).length;
}

function getCoursePercentage(course) {
    return Math.round(
        getCompletedCount(course) / course.lessons.length * 100
    );
}

function getAllLessons() {
    return courses.reduce(
        (total, course) => total + course.lessons.length, 0
    );
}

function getAllCompletedLessons() {
    return courses.reduce(
        (total, course) => total + getCompletedCount(course), 0
    );
}

function saveLastLesson(courseId, index) {
    const state = getCourseProgress(courseId);
    state.lastLesson = index;

    lastCourseId = courseId;

    saveStorage(STORAGE_KEY, progressData);
    saveStorage(LAST_COURSE_KEY, courseId);
}

// =========================================================
// 6. SUMMARY STATISTICS
// =========================================================

function renderStats() {
    if (totalCourses) {
        totalCourses.textContent = courses.length;
    }

    if (completedLessons) {
        completedLessons.textContent = getAllCompletedLessons();
    }

    if (overallProgress) {
        const percentage = Math.round(
            getAllCompletedLessons() / getAllLessons() * 100
        );

        overallProgress.textContent = percentage + "%";
    }
}

// =========================================================
// 7. COURSE CARDS AND SEARCH
// =========================================================

function renderCourses() {
    if (!courseCards) return;

    const query = (courseSearch?.value || "").trim().toLowerCase();
    const category = categoryFilter?.value || "all";

    const filteredCourses = courses.filter(course => {
        const searchableText = [
            course.title,
            course.description,
            course.category,
            ...course.lessons.map(lesson => lesson.title)
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);
        const matchesCategory =
            category === "all" || course.category === category;

        return matchesSearch && matchesCategory;
    });

    courseCards.innerHTML = "";

    filteredCourses.forEach(course => {
        const percentage = getCoursePercentage(course);
        const completed = getCompletedCount(course);

        const card = document.createElement("article");
        card.className = "course-card";

        card.innerHTML = `
            <div class="course-icon">
                <i class="fa-solid ${course.icon}"></i>
            </div>

            <div class="course-meta">
                <span>${course.category}</span>
                <span>${course.level}</span>
            </div>

            <h3>${course.title}</h3>
            <p>${course.description}</p>

            <div class="course-details">
                <span>
                    <i class="fa-solid fa-book-open"></i>
                    ${course.lessons.length} lessons
                </span>
                <span>
                    <i class="fa-regular fa-clock"></i>
                    ${course.duration}
                </span>
            </div>

            <div class="course-progress">
                <div class="progress-label">
                    <span>Progress</span>
                    <strong>${percentage}%</strong>
                </div>

                <div class="progress-track">
                    <div class="progress-fill"
                         style="width:${percentage}%"></div>
                </div>

                <small>
                    ${completed} of ${course.lessons.length} lessons completed
                </small>
            </div>

            <div class="course-card-footer">
                <button type="button" class="primary-button open-course">
                    ${percentage === 100 ? "Review Course" :
                      percentage > 0 ? "Continue Learning" : "Start Learning"}
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        card.querySelector(".open-course").addEventListener("click", () => {
            openCourse(course.id);
        });

        courseCards.appendChild(card);
    });

    if (courseCount) {
        courseCount.textContent =
            `${filteredCourses.length} ${filteredCourses.length === 1 ? "Course" : "Courses"}`;
    }

    if (emptyCourses) {
        emptyCourses.hidden = filteredCourses.length > 0;
    }

    renderStats();
    renderContinueLearning();
}

// =========================================================
// 8. CREATE THE VIDEO PLAYER
// This works without changing courses.html.
// =========================================================

function ensureVideoPlayer() {
    let section = $("lessonVideo");

    if (!section && selectedLessonContent) {
        section = document.createElement("section");
        section.id = "lessonVideo";
        section.className = "lesson-video";

        section.innerHTML = `
            <h3>
                <i class="fa-brands fa-youtube"></i>
                Lesson Video
            </h3>

            <div class="video-container" id="lessonVideoContainer">
                <iframe
                    id="lessonVideoFrame"
                    title="Course introductory video"
                    src=""
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            </div>

            <a
                id="lessonVideoLink"
                href="#"
                target="_blank"
                rel="noopener noreferrer">
                Find this lesson on YouTube
            </a>

            <p class="video-note">
                Each topic has its own YouTube search.
                Choose a suitable video from the results.
            </p>
        `;

        selectedLessonContent.insertAdjacentElement("afterend", section);
    }

    return {
        section: $("lessonVideo"),
        frame: $("lessonVideoFrame"),
        link: $("lessonVideoLink"),
        container: $("lessonVideoContainer")
    };
}

// =========================================================
// 9. SHOW A VIDEO FOR THE SELECTED TOPIC
// =========================================================

function showLessonVideo(course, lesson, index) {
    const video = ensureVideoPlayer();

    if (!video.section || !video.link) return;

    video.section.hidden = false;

    // The introductory video is embedded for the first lesson
    // of each course. Other lessons have their own search links.
    const videoId = lesson.videoId ||
        (index === 0 ? course.videoId : null);

    if (video.frame) {
        if (videoId) {
            video.frame.src =
                "https://www.youtube-nocookie.com/embed/" +
                encodeURIComponent(videoId);

            video.frame.hidden = false;

            if (video.container) {
                video.container.hidden = false;
            }
        } else {
            video.frame.src = "";
            video.frame.hidden = true;

            if (video.container) {
                video.container.hidden = true;
            }
        }
    }

    const query = lesson.videoQuery ||
        `${course.title} ${lesson.title} tutorial`;

    video.link.href =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query);

    video.link.textContent = videoId
        ? `Find more videos for ${lesson.title} on YouTube`
        : `Watch ${lesson.title} videos on YouTube`;

    video.link.target = "_blank";
    video.link.rel = "noopener noreferrer";
}

function hideLessonVideo() {
    const video = ensureVideoPlayer();

    if (!video.section) return;

    video.section.hidden = true;

    if (video.frame) {
        video.frame.src = "";
    }
}

// =========================================================
// 10. OPEN A COURSE
// =========================================================

function openCourse(courseId, preferredIndex = null) {
    const course = courses.find(item => item.id === courseId);

    if (!course) return;

    currentCourseId = course.id;

    const state = getCourseProgress(course.id);

    const index = preferredIndex !== null
        ? preferredIndex
        : (state.lastLesson || 0);

    currentLessonIndex = Math.max(
        0,
        Math.min(index, course.lessons.length - 1)
    );

    if (courseGridSection) {
        courseGridSection.hidden = true;
    }

    if (continueSection) {
        continueSection.hidden = true;
    }

    if (lessonPanel) {
        lessonPanel.hidden = false;
    }

    if (lessonCourseTitle) {
        lessonCourseTitle.textContent = course.title;
    }

    if (lessonCourseDescription) {
        lessonCourseDescription.textContent = course.description;
    }

    saveLastLesson(course.id, currentLessonIndex);

    renderLessonList();
    showLesson(currentLessonIndex);
    renderStats();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================================================
// 11. LESSON LIST
// =========================================================

function renderLessonList() {
    if (!lessonList || !currentCourseId) return;

    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (!course) return;

    lessonList.innerHTML = "";

    course.lessons.forEach((lesson, index) => {
        const complete = isLessonComplete(course.id, index);

        const item = document.createElement("div");
        item.className = "lesson-item";

        if (index === currentLessonIndex) {
            item.classList.add("active");
        }

        if (complete) {
            item.classList.add("completed");
        }

        const label = document.createElement("label");
        label.className = "lesson-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = complete;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${lesson.title} complete`
        );

        const title = document.createElement("span");
        title.className = "lesson-name";
        title.textContent = `${index + 1}. ${lesson.title}`;

        const status = document.createElement("span");
        status.className = "lesson-status";

        if (complete) {
            status.innerHTML =
                '<i class="fa-solid fa-circle-check"></i>';
        }

        label.append(checkbox, title, status);
        item.appendChild(label);

        item.addEventListener("click", event => {
            if (event.target === checkbox) return;
            showLesson(index);
        });

        checkbox.addEventListener("change", () => {
            setLessonComplete(course.id, index, checkbox.checked);

            renderLessonList();
            updateLessonProgress();
            updateLessonButtons();
            renderStats();
            renderCourses();
        });

        lessonList.appendChild(item);
    });
}

// =========================================================
// 12. SHOW A LESSON AND ITS VIDEO LINK
// =========================================================

function showLesson(index) {
    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (!course) return;

    if (index < 0 || index >= course.lessons.length) return;

    currentLessonIndex = index;

    const lesson = course.lessons[index];

    if (selectedLessonTitle) {
        selectedLessonTitle.textContent = lesson.title;
    }

    if (selectedLessonContent) {
        selectedLessonContent.innerHTML = lesson.content;
    }

    saveLastLesson(course.id, index);

    renderLessonList();
    showLessonVideo(course, lesson, index);
    updateLessonProgress();
    updateLessonButtons();
    renderContinueLearning();
}

// =========================================================
// 13. UPDATE PROGRESS
// =========================================================

function updateLessonProgress() {
    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (!course) return;

    const completed = getCompletedCount(course);
    const percentage = getCoursePercentage(course);

    if (lessonProgressText) {
        lessonProgressText.textContent =
            `${percentage}% complete (${completed}/${course.lessons.length} lessons)`;
    }

    if (lessonProgressFill) {
        lessonProgressFill.style.width = percentage + "%";
    }
}

function updateLessonButtons() {
    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (!course) return;

    const complete = isLessonComplete(
        course.id,
        currentLessonIndex
    );

    if (previousLessonButton) {
        previousLessonButton.disabled = currentLessonIndex === 0;
    }

    if (nextLessonButton) {
        nextLessonButton.disabled =
            currentLessonIndex === course.lessons.length - 1;
    }

    if (completeLessonButton) {
        completeLessonButton.disabled = false;

        completeLessonButton.innerHTML = complete
            ? 'Completed <i class="fa-solid fa-check"></i>'
            : 'Mark Complete <i class="fa-solid fa-check"></i>';

        completeLessonButton.classList.toggle(
            "is-complete",
            complete
        );
    }
}

// =========================================================
// 14. MARK LESSON COMPLETE
// =========================================================

function toggleCurrentLessonComplete() {
    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (!course) return;

    const wasComplete = isLessonComplete(
        course.id,
        currentLessonIndex
    );

    setLessonComplete(
        course.id,
        currentLessonIndex,
        !wasComplete
    );

    renderLessonList();
    updateLessonProgress();
    updateLessonButtons();
    renderStats();
    renderCourses();
}

// =========================================================
// 15. CONTINUE LEARNING
// =========================================================

function renderContinueLearning() {
    if (!continueSection || !continueCard) return;

    let course = courses.find(
        item => item.id === lastCourseId
    );

    if (!course || getCoursePercentage(course) === 100) {
        course = courses.find(
            item => getCoursePercentage(item) < 100
        );
    }

    if (!course) {
        continueSection.hidden = true;
        continueCard.innerHTML = "";
        return;
    }

    continueSection.hidden = false;

    const state = getCourseProgress(course.id);
    const percentage = getCoursePercentage(course);

    const lastIndex = Math.min(
        state.lastLesson || 0,
        course.lessons.length - 1
    );

    const firstIncomplete = course.lessons.findIndex(
        (_, index) => !isLessonComplete(course.id, index)
    );

    const resumeIndex = firstIncomplete === -1
        ? lastIndex
        : firstIncomplete;

    continueCard.innerHTML = `
        <div class="continue-card">
            <div class="course-icon">
                <i class="fa-solid ${course.icon}"></i>
            </div>

            <div class="continue-card-content">
                <h3>${course.title}</h3>
                <p>${course.lessons[resumeIndex].title}</p>

                <div class="progress-track">
                    <div class="progress-fill"
                         style="width:${percentage}%"></div>
                </div>

                <small>${percentage}% complete</small>
            </div>

            <button type="button"
                    class="primary-button"
                    id="resumeCourse">
                Continue
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;

    $("resumeCourse")?.addEventListener("click", () => {
        openCourse(course.id, resumeIndex);
    });
}

// =========================================================
// 16. RETURN TO THE COURSE LIST
// =========================================================

function returnToCourses() {
    currentCourseId = null;

    if (lessonPanel) {
        lessonPanel.hidden = true;
    }

    if (courseGridSection) {
        courseGridSection.hidden = false;
    }

    hideLessonVideo();
    renderCourses();
    renderContinueLearning();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================================================
// 17. EVENT LISTENERS
// =========================================================

courseSearch?.addEventListener("input", renderCourses);
categoryFilter?.addEventListener("change", renderCourses);

backToCourses?.addEventListener("click", returnToCourses);

previousLessonButton?.addEventListener("click", () => {
    if (currentLessonIndex > 0) {
        showLesson(currentLessonIndex - 1);
    }
});

nextLessonButton?.addEventListener("click", () => {
    const course = courses.find(
        item => item.id === currentCourseId
    );

    if (course && currentLessonIndex < course.lessons.length - 1) {
        showLesson(currentLessonIndex + 1);
    }
});

completeLessonButton?.addEventListener("click", () => {
    toggleCurrentLessonComplete();
});

// =========================================================
// 18. INITIALISE THE PAGE
// =========================================================

function initialiseCoursesPage() {
    // Create the video player automatically.
    ensureVideoPlayer();

    // Render the courses and statistics.
    renderCourses();
    renderStats();

    // Start with the lesson panel hidden.
    if (lessonPanel) {
        lessonPanel.hidden = true;
    }

    if (courseGridSection) {
        courseGridSection.hidden = false;
    }

    renderContinueLearning();
}

initialiseCoursesPage();


/* =========================================
   VIDYAVERSE — VIDEO BUTTON FOR EVERY LESSON
========================================= */

(function setupLessonVideoButtons() {
    const lessonTitle = document.getElementById("selectedLessonTitle");
    const lessonContent = document.getElementById("selectedLessonContent");
    const courseTitle = document.getElementById("lessonCourseTitle");

    if (!lessonTitle || !lessonContent || !courseTitle) {
        console.warn(
            "VidyaVerse video buttons: lesson elements were not found."
        );
        return;
    }

    // Create one video section after the lesson content.
    let videoSection = document.getElementById("lessonVideoSection");

    if (!videoSection) {
        videoSection = document.createElement("section");
        videoSection.id = "lessonVideoSection";
        videoSection.className = "lesson-video-section";

        videoSection.innerHTML = `
            <div class="lesson-video-info">
                <div class="lesson-video-icon" aria-hidden="true">
                    <span style="font-size: 21px;">▶</span>
                </div>

                <div class="lesson-video-text">
                    <h3>Learn with Video</h3>
                    <p>Watch a tutorial related to this lesson.</p>
                </div>
            </div>

            <a
                id="watchLessonVideo"
                class="watch-video-button"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span aria-hidden="true">▶</span>
                <span>Watch Video</span>
                <span aria-hidden="true">↗</span>
            </a>
        `;

        lessonContent.insertAdjacentElement("afterend", videoSection);
    }

    const videoLink = videoSection.querySelector("#watchLessonVideo");

    function updateLessonVideo() {
        const currentLesson = lessonTitle.textContent.trim();
        const currentCourse = courseTitle.textContent.trim();

        if (!currentLesson || !currentCourse) {
            videoSection.hidden = true;
            return;
        }

        videoSection.hidden = false;

        // Build a topic-specific YouTube search for this lesson.
        const searchText =
            currentCourse + " " +
            currentLesson +
            " tutorial for beginners";

        videoLink.href =
            "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(searchText);

        videoLink.setAttribute(
            "aria-label",
            "Watch a YouTube tutorial for " +
            currentLesson +
            " in " +
            currentCourse
        );

        videoSection.querySelector(".lesson-video-text h3").textContent =
            "Learn: " + currentLesson;

        videoSection.querySelector(".lesson-video-text p").textContent =
            "Watch a video tutorial for this topic.";
    }

    // Update the button whenever a student selects another lesson.
    const observer = new MutationObserver(updateLessonVideo);

    observer.observe(lessonTitle, {
        childList: true,
        characterData: true,
        subtree: true
    });

    observer.observe(courseTitle, {
        childList: true,
        characterData: true,
        subtree: true
    });

    updateLessonVideo();
})();
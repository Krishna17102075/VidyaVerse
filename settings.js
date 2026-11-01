// =========================================
// Vidya Verse - SETTINGS
// =========================================


// =========================================
// CHECK LOGIN
// =========================================

const token = localStorage.getItem("token");

if (!token) {

    alert("Please login first.");

    window.location.href = "login.html";

}


// =========================================
// DARK MODE
// =========================================

const darkMode = document.getElementById("darkMode");


// Load saved theme

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    darkMode.checked = true;

}


// Change theme

darkMode.addEventListener("change", () => {

    if (darkMode.checked) {

        document.body.classList.add("dark");

        localStorage.setItem("theme", "dark");

    }

    else {

        document.body.classList.remove("dark");

        localStorage.setItem("theme", "light");

    }

});


// =========================================
// NOTIFICATIONS
// =========================================

const notifications =
    document.getElementById("notifications");


notifications.addEventListener("change", () => {

    if (notifications.checked) {

        localStorage.setItem(
            "notifications",
            "enabled"
        );

    }

    else {

        localStorage.setItem(
            "notifications",
            "disabled"
        );

    }

});


// Load notification preference

const savedNotifications =
    localStorage.getItem("notifications");

if (savedNotifications === "disabled") {

    notifications.checked = false;

}


// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    document.getElementById("logoutBtn");


logoutBtn.addEventListener("click", () => {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (!confirmLogout) {

        return;

    }


    // Remove login token

    localStorage.removeItem("token");


    // Redirect

    window.location.href = "login.html";

});


// =========================================
// LOAD USER PROFILE
// =========================================

async function loadProfile() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/users/me",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );


        if (!response.ok) {

            return;

        }


        const user =
            await response.json();


        document.getElementById(
            "profileName"
        ).textContent =
            user.name || "Student";


        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email || "";


        // First letter

        if (user.name) {

            document.getElementById(
                "avatar"
            ).textContent =
                user.name.charAt(0).toUpperCase();

        }

    }

    catch (error) {

        console.log(
            "Unable to load profile:",
            error
        );

    }

}

document.getElementById("profileName").textContent = "Krishna";
document.getElementById("profileEmail").textContent = "Your email";
document.getElementById("avatar").textContent = "K";
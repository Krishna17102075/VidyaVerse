const API = "http://127.0.0.1:8000";

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

async function loadProfile() {

    try {

        const response = await fetch(API + "/profile/", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            throw new Error("Unable to load profile");
        }

        const data = await response.json();

        document.getElementById("username").innerText = data.name;
        document.getElementById("email").innerText = data.email;

    } catch (error) {

        console.error(error);

        alert("Unable to load profile.");

    }

}

loadProfile();

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("token");

    alert("Logged out successfully.");

    window.location.href = "login.html";

});
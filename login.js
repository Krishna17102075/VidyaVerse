// ===============================
// SHOW / HIDE PASSWORD
// ===============================

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";

        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");

    }

    else{

        password.type = "password";

        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");

    }

});


// ===============================
// LOGIN VALIDATION
// ===============================

const form = document.querySelector("form");

form.addEventListener("submit", function(event){

    event.preventDefault();

    const email = document.querySelector("input[type='email']").value.trim();

    const passwordValue = password.value.trim();

    // Email Validation

    if(email === ""){

        alert("Please enter your email.");

        return;

    }

    // Password Validation

    if(passwordValue === ""){

        alert("Please enter your password.");

        return;

    }

    if(passwordValue.length < 6){

        alert("Password must be at least 6 characters.");

        return;

    }

    // Login Button Animation

const loginButton = document.querySelector("button");

loginButton.innerHTML = "Logging In...";

loginButton.disabled = true;


// Send Login Request

fetch("http://127.0.0.1:8000/users/login",{

    method:"POST",

    headers:{
        "Content-Type":"application/x-www-form-urlencoded"
    },

    body:new URLSearchParams({

        username:email,

        password:passwordValue

    })

})

.then(async(response)=>{

    const data=await response.json();

    if(response.ok){

        localStorage.setItem("token",data.access_token);

        alert("Login Successful!");

        window.location.href="dashboard.html";

    }

    else{

        alert(data.detail);

        loginButton.innerHTML="Login";

        loginButton.disabled=false;

    }

})

.catch(error=>{

    console.error(error);

    alert("Cannot connect to backend.");

    loginButton.innerHTML="Login";

    loginButton.disabled=false;

});

});

// ========================================
// GOOGLE LOGIN - VIDYAVERSE
// ========================================

const GOOGLE_CLIENT_ID = "375742097828-k2ifbmfe9odrmrta552tgf8s9g3obhga.apps.googleusercontent.com";

function initializeGoogleLogin() {

    if (!window.google || !google.accounts) {
        setTimeout(initializeGoogleLogin, 300);
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            width: 320
        }
    );
}

async function handleGoogleLogin(response) {

    try {

        const result = await fetch(
            "http://127.0.0.1:8000/users/google-login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );

        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.detail || "Google login failed.");
        }

        // Save VidyaVerse JWT, not Google's ID token
        localStorage.setItem("token", data.access_token);

        alert("Google Login Successful!");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Google Login Error:", error);

        alert(error.message || "Unable to login with Google.");

    }
}

// Wait for Google script to load
window.addEventListener("load", initializeGoogleLogin);
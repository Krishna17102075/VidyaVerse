// ===============================
// SHOW / HIDE PASSWORD
// ===============================

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirm = document.getElementById("toggleConfirm");

// Toggle Password

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

// Toggle Confirm Password

toggleConfirm.addEventListener("click", () => {

    if(confirmPassword.type === "password"){

        confirmPassword.type = "text";

        toggleConfirm.classList.remove("fa-eye");
        toggleConfirm.classList.add("fa-eye-slash");

    }

    else{

        confirmPassword.type = "password";

        toggleConfirm.classList.remove("fa-eye-slash");
        toggleConfirm.classList.add("fa-eye");

    }

});


// ===============================
// SIGNUP VALIDATION
// ===============================

const form = document.getElementById("signupForm");

form.addEventListener("submit", function(event){

    event.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const college = document.getElementById("college").value.trim();
    const course = document.getElementById("course").value.trim();

    const pass = password.value.trim();
    const confirm = confirmPassword.value.trim();

    // Name

    if(fullname === ""){

        alert("Please enter your full name.");
        return;

    }

    // Email

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if(!email.match(emailPattern)){

        alert("Please enter a valid email address.");
        return;

    }

    // Phone

    const phonePattern = /^[0-9]{10}$/;

    if(!phone.match(phonePattern)){

        alert("Enter a valid 10-digit phone number.");
        return;

    }

    // College

    if(college === ""){

        alert("Please enter your college name.");
        return;

    }

    // Course

    if(course === ""){

        alert("Please enter your course.");
        return;

    }

    // Password

    if(pass.length < 8){

        alert("Password must contain at least 8 characters.");
        return;

    }

    // Confirm Password

    if(pass !== confirm){

        alert("Passwords do not match.");
        return;

    }

    const button = document.querySelector("button");

button.innerHTML = "Creating Account...";
button.disabled = true;

fetch("http://127.0.0.1:8000/users/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: fullname,
        email: email,
        password: pass
    })
})
.then(async (response) => {

    const data = await response.json();

    if (response.ok) {

        alert("Account Created Successfully!");

        window.location.href = "login.html";

    } else {

        alert(data.detail || "Signup failed.");

        button.innerHTML = "Create Account";
        button.disabled = false;
    }

})
.catch((error) => {

    console.error(error);

    alert("Cannot connect to the backend.");

    button.innerHTML = "Create Account";
    button.disabled = false;

});

});
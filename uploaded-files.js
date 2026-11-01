
// ==========================================
// VIDYAVERSE - UPLOADED FILES
// Upload, display and delete study files
// ==========================================

// Change this URL when you deploy your backend.
const UPLOAD_API = "http://127.0.0.1:8000";

const uploadedFilesContainer =
    document.getElementById("uploadedFiles");

const fileUploadInput =
    document.getElementById("fileUpload");


// ==========================================
// GET AUTHENTICATION TOKEN
// ==========================================

function getUploadToken() {
    return localStorage.getItem("token");
}


// ==========================================
// LOAD UPLOADED FILES
// ==========================================

async function loadUploadedFiles() {

    const token = getUploadToken();

    if (!token) {
        uploadedFilesContainer.textContent =
            "Please log in to view your uploaded files.";
        return;
    }

    try {

        const response = await fetch(
            `${UPLOAD_API}/upload/files`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load uploaded files.");
        }

        const files = await response.json();

        uploadedFilesContainer.innerHTML = "";

        if (!files.length) {
            uploadedFilesContainer.innerHTML =
                "<p>No files uploaded yet.</p>";
            return;
        }

        files.forEach(file => {

            const card = document.createElement("div");

            card.className = "uploaded-file-card";

            const title = document.createElement("h4");

            title.textContent = `📄 ${file.filename}`;

            const actions = document.createElement("div");

            actions.className = "uploaded-file-actions";

            // Analyze button
            const analyzeButton =
                document.createElement("button");

            analyzeButton.type = "button";
            analyzeButton.className = "analyze-file-btn";
            analyzeButton.innerHTML =
                '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze';

            analyzeButton.addEventListener("click", () => {

                if (typeof window.analyzeFile === "function") {
                    window.analyzeFile(file.id);
                } else {
                    alert(
                        "The existing analyzeFile() function was not found in notes.js."
                    );
                }

            });

            // Delete button
            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-file-btn";

            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash"></i> Delete';

            deleteButton.addEventListener("click", () => {
                deleteUploadedFile(file.id, deleteButton);
            });

            actions.appendChild(analyzeButton);
            actions.appendChild(deleteButton);

            card.appendChild(title);
            card.appendChild(actions);

            uploadedFilesContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Load files error:", error);

        uploadedFilesContainer.textContent =
            error.message;

    }
}


// ==========================================
// UPLOAD STUDY FILE
// ==========================================

fileUploadInput.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const token = getUploadToken();

    if (!token) {
        alert("Please log in before uploading files.");
        this.value = "";
        return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {

        const response = await fetch(
            `${UPLOAD_API}/upload/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "File upload failed."
            );
        }

        alert("File uploaded successfully!");

        this.value = "";

        await loadUploadedFiles();

    } catch (error) {

        console.error("Upload error:", error);

        alert(error.message);

        this.value = "";

    }

});


// ==========================================
// DELETE UPLOADED FILE
// ==========================================

async function deleteUploadedFile(fileId, button) {

    const confirmed = confirm(
        "Are you sure you want to permanently delete this file?"
    );

    if (!confirmed) {
        return;
    }

    const token = getUploadToken();

    if (!token) {
        alert("Please log in again.");
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        const response = await fetch(
            `${UPLOAD_API}/upload/files/${fileId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to delete file."
            );
        }

        alert("File deleted successfully!");

        await loadUploadedFiles();

    } catch (error) {

        console.error("Delete error:", error);

        alert(error.message);

        button.disabled = false;
        button.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadUploadedFiles();
});

// =====================================
// SMART NOTES (Backend Version)
// =====================================

const API = "http://127.0.0.1:8000";

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

const titleInput = document.getElementById("noteTitle");
const tagInput = document.getElementById("noteTag");
const contentInput = document.getElementById("noteContent");

const saveBtn = document.getElementById("saveNote");
const clearBtn = document.getElementById("clearNote");
const searchInput = document.getElementById("searchInput");

const notesContainer = document.getElementById("notesContainer");
const uploadedFiles = document.getElementById("uploadedFiles");

let notes = [];
let editingId = null;


// ================================
// LOAD NOTES
// ================================

async function loadUploadedFiles(){

    try{

        const response = await fetch(API + "/upload/files",{

            headers:{
                "Authorization":"Bearer " + token
            }

        });

        const files = await response.json();

        uploadedFiles.innerHTML = "";

        files.forEach(file => {

            uploadedFiles.innerHTML += `

<div class="file-card">

    <h4>📄 ${file.filename}</h4>

    <button onclick="analyzeFile(${file.id})">
        Analyze
    </button>

</div>

`;

    });

    }

    catch(error){

        console.log(error);

       alert("Unable to load uploaded files.");

    }

}

loadUploadedFiles();

// ================================
// SAVE NOTE
// ================================

saveBtn.addEventListener("click", async ()=>{

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if(title==="" || content===""){

        alert("Please fill all fields.");

        return;

    }

    if(editingId==null){

        await fetch(API + "/notes/create",{

            method:"POST",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },

            body:JSON.stringify({

                title:title,
                content:content

            })

        });

    }

    else{

        await fetch(API + "/notes/update/" + editingId,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + token
            },

            body:JSON.stringify({

                title:title,
                content:content

            })

        });

        editingId=null;

    }

    clearForm();

    loadNotes();

});


// ================================
// RENDER NOTES
// ================================


const STORAGE_KEY = "vidyaverse_notes_metadata";

let activeView = "all";
let selectedFolder = null;

function getMetadata() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            pinned: [],
            trashed: [],
            folders: [],
            noteFolders: {}
        };
    } catch {
        return {
            pinned: [],
            trashed: [],
            folders: [],
            noteFolders: {}
        };
    }
}

function saveMetadata(metadata) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
}

// Call this after fetching your notes from the backend.
async function loadNotes() {
    try {
        // Adjust this URL if your notes router uses a different GET route.
        const response = await fetch(API + "/notes/", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            throw new Error("Could not load notes.");
        }

        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.error("Loading notes:", error);
        notesContainer.innerHTML =
            "<p>Unable to load notes. Check your backend notes endpoint.</p>";
    }
}

function renderNotes() {
    const metadata = getMetadata();
    const search = searchInput.value.toLowerCase().trim();

    notesContainer.innerHTML = "";

    let visibleNotes = notes.filter(note => {
        const isPinned = metadata.pinned.includes(note.id);
        const isTrashed = metadata.trashed.includes(note.id);
        const folder = metadata.noteFolders[note.id];

        if (activeView === "all" && isTrashed) return false;
        if (activeView === "pinned" && (!isPinned || isTrashed)) return false;
        if (activeView === "trash" && !isTrashed) return false;

        if (activeView === "folders") {
            if (isTrashed) return false;
            if (selectedFolder && folder !== selectedFolder) return false;
        }

        const text = `${note.title || ""} ${note.content || ""} ${note.tag || ""}`;
        return text.toLowerCase().includes(search);
    });

    if (activeView === "folders") {
        renderFolderControls(metadata);
    }

    if (!visibleNotes.length) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = activeView === "trash"
            ? "Your Trash is empty."
            : activeView === "pinned"
            ? "You haven't pinned any notes yet."
            : activeView === "folders"
            ? "No notes in this folder yet."
            : "No notes found.";
        notesContainer.appendChild(empty);
        return;
    }

    visibleNotes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-card";

        const isPinned = metadata.pinned.includes(note.id);
        const isTrashed = metadata.trashed.includes(note.id);

        const title = document.createElement("h3");
        title.textContent = note.title || "Untitled note";

        const content = document.createElement("p");
        content.textContent = note.content || "";

        const actions = document.createElement("div");
        actions.className = "note-actions";

        if (isTrashed) {
            actions.append(
                makeAction("Restore", () => restoreNote(note.id)),
                makeAction("Delete permanently", () => permanentlyDelete(note.id))
            );
        } else {
            actions.append(
                makeAction(isPinned ? "Unpin 📌" : "Pin 📌",
                    () => togglePin(note.id)),
                makeAction("Folder 📁", () => assignFolder(note.id)),
                makeAction("Edit ✏️", () => editNote(note)),
                makeAction("Trash 🗑️", () => moveToTrash(note.id))
            );
        }

        card.append(title, content, actions);
        notesContainer.appendChild(card);
    });
}

function makeAction(label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
}

// PIN / UNPIN
function togglePin(noteId) {
    const metadata = getMetadata();

    if (metadata.pinned.includes(noteId)) {
        metadata.pinned = metadata.pinned.filter(id => id !== noteId);
    } else {
        metadata.pinned.push(noteId);
    }

    saveMetadata(metadata);
    renderNotes();
}

// FOLDERS
function renderFolderControls(metadata) {
    const controls = document.createElement("div");
    controls.className = "folder-controls";

    const heading = document.createElement("h3");
    heading.textContent = selectedFolder
        ? `Folder: ${selectedFolder}`
        : "Your folders";

    controls.appendChild(heading);

    const allFolders = makeAction("All folders", () => {
        selectedFolder = null;
        renderNotes();
    });
    controls.appendChild(allFolders);

    metadata.folders.forEach(folder => {
        controls.appendChild(
            makeAction("📁 " + folder, () => {
                selectedFolder = folder;
                renderNotes();
            })
        );
    });

    notesContainer.prepend(controls);
}

document.getElementById("newFolder").addEventListener("click", () => {
    const name = prompt("Enter a folder name:");
    if (!name || !name.trim()) return;

    const metadata = getMetadata();
    const folderName = name.trim();

    if (metadata.folders.includes(folderName)) {
        alert("This folder already exists.");
        return;
    }

    metadata.folders.push(folderName);
    saveMetadata(metadata);

    activeView = "folders";
    selectedFolder = folderName;
    updateSidebar();
    renderNotes();
});

function assignFolder(noteId) {
    const metadata = getMetadata();

    if (!metadata.folders.length) {
        alert("Create a folder first using New Folder.");
        return;
    }

    const options = metadata.folders
        .map((folder, index) => `${index + 1}. ${folder}`)
        .join("\n");

    const choice = prompt(
        "Enter the folder number:\n" + options +
        "\nEnter 0 to remove the folder."
    );

    if (choice === null) return;

    const number = Number(choice);

    if (number === 0) {
        delete metadata.noteFolders[noteId];
    } else if (
        Number.isInteger(number) &&
        number >= 1 &&
        number <= metadata.folders.length
    ) {
        metadata.noteFolders[noteId] = metadata.folders[number - 1];
    } else {
        alert("Invalid folder number.");
        return;
    }

    saveMetadata(metadata);
    renderNotes();
}

// TRASH / RESTORE
function moveToTrash(noteId) {
    if (!confirm("Move this note to Trash?")) return;

    const metadata = getMetadata();

    if (!metadata.trashed.includes(noteId)) {
        metadata.trashed.push(noteId);
    }

    saveMetadata(metadata);
    renderNotes();
}

function restoreNote(noteId) {
    const metadata = getMetadata();

    metadata.trashed = metadata.trashed.filter(id => id !== noteId);

    saveMetadata(metadata);
    renderNotes();
}

async function permanentlyDelete(noteId) {
    if (!confirm("Permanently delete this note? This cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(API + "/notes/delete/" + noteId, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            throw new Error("The backend could not delete this note.");
        }

        const metadata = getMetadata();
        metadata.pinned = metadata.pinned.filter(id => id !== noteId);
        metadata.trashed = metadata.trashed.filter(id => id !== noteId);
        delete metadata.noteFolders[noteId];

        saveMetadata(metadata);
        notes = notes.filter(note => note.id !== noteId);
        renderNotes();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// EDIT
function editNote(note) {
    editingId = note.id;
    titleInput.value = note.title || "";
    contentInput.value = note.content || "";
    tagInput.value = note.tag || "";

    titleInput.focus();
    document.querySelector(".note-form").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// SIDEBAR NAVIGATION
function updateSidebar() {
    document.querySelectorAll(".sidebar li[data-view]").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.view === activeView
        );
    });

    const heading = document.querySelector(".notes-section h2");
    const headings = {
        all: "My Notes",
        pinned: "Pinned Notes",
        folders: "Folders",
        trash: "Trash"
    };

    heading.textContent = headings[activeView] || "My Notes";
}

document.querySelectorAll(".sidebar li[data-view]").forEach(item => {
    item.addEventListener("click", () => {
        activeView = item.dataset.view;
        selectedFolder = null;
        updateSidebar();
        renderNotes();
    });
});

searchInput.addEventListener("input", renderNotes);

// ================================
// CLEAR
// ================================

function clearForm(){

    titleInput.value="";
    tagInput.value="";
    contentInput.value="";

}

clearBtn.addEventListener("click",clearForm);



const fileUpload = document.getElementById("fileUpload");

fileUpload.addEventListener("change", async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/upload/",
            {
                method: "POST",

                 headers: {
            "Authorization": "Bearer " + token
        },

                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

    alert(data.detail || "Upload failed.");

    return;

}

        alert("✅ " + data.message);

    }

    catch (error) {

        console.error(error);

        alert("File upload failed.");

    }

});

async function analyzeFile(fileId) {

    const analysisBox = document.getElementById("analysisResult");

    analysisBox.innerHTML = "⏳ Analyzing document... Please wait.";

    try {

        const response = await fetch(
            API + "/analyze/" + fileId + "?language=" + encodeURIComponent(window.VidyaVerseI18n?.getLanguage?.() || "en"),
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        analysisBox.innerText = data.analysis;

    }

    catch(error){

        console.error(error);

        analysisBox.innerHTML = "❌ Analysis failed.";

    }

}
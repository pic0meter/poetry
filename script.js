/* =========================================
   POETRY NOTES ENGINE
   GitHub Pages + Markdown + Dynamic Effects
========================================= */

const POEMS_FOLDER = "poems";

const notesList = document.getElementById("notesList");
const noteCount = document.getElementById("noteCount");
const searchInput = document.getElementById("searchInput");

const emptyState = document.getElementById("emptyState");
const note = document.getElementById("note");
const noteArea = document.getElementById("noteArea");

const noteTitle = document.getElementById("noteTitle");
const noteDate = document.getElementById("noteDate");
const noteContent = document.getElementById("noteContent");
const githubButton = document.getElementById("githubButton");
const mobileBackButton = document.getElementById("mobileBackButton");

let poems = [];
let selectedPoem = null;


/* =========================================
   DETERMINE GITHUB REPOSITORY
========================================= */

function getRepositoryInfo() {

    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    if (!hostname.endsWith(".github.io")) {
        return null;
    }

    const owner = hostname.replace(".github.io", "");

    const parts = pathname
        .split("/")
        .filter(Boolean);

    if (parts.length === 0) {
        return {
            owner,
            repo: `${owner}.github.io`
        };
    }

    return {
        owner,
        repo: parts[0]
    };
}

const repository = getRepositoryInfo();


/* =========================================
   LOAD ALL POEMS
========================================= */

async function loadPoems() {

    if (!repository) {
        showError("This website needs to be hosted on GitHub Pages.");
        return;
    }

    const apiURL =
        `https://api.github.com/repos/` +
        `${repository.owner}/` +
        `${repository.repo}/contents/${POEMS_FOLDER}`;

    try {

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error(`GitHub returned ${response.status}`);
        }

        const files = await response.json();

        const markdownFiles = files.filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().endsWith(".md")
        );

        if (markdownFiles.length === 0) {
            showEmptyRepository();
            return;
        }

        const loadedPoems = await Promise.all(
            markdownFiles.map(loadPoem)
        );

        poems = loadedPoems
            .filter(Boolean)
            .sort(sortNewestFirst);

        renderNotesList();

        // 1. Check if a specific poem was requested in the URL parameter (?poem=filename.md)
        const urlParams = new URLSearchParams(window.location.search);
        const poemParam = urlParams.get("poem");

        if (poemParam) {
            const requestedPoem = poems.find(p => p.filename === poemParam);
            if (requestedPoem) {
                openPoem(requestedPoem);
                return;
            }
        }

        // 2. On desktop screens, open the first poem automatically
        //    On mobile screens, remain on the sidebar/front page list
        if (poems.length > 0 && window.innerWidth > 700) {
            openPoem(poems[0]);
        }

    } catch (error) {

        console.error(error);

        showError(
            "Unable to load poems. Ensure repository is public and 'poems' folder exists."
        );
    }
}


/* =========================================
   LOAD INDIVIDUAL POEM FILE
========================================= */

async function loadPoem(file) {

    try {

        const response = await fetch(file.download_url);

        if (!response.ok) {
            throw new Error(`Unable to load ${file.name}`);
        }

        const markdown = await response.text();
        const metadata = parseFrontMatter(markdown);

        return {
            filename: file.name,
            path: file.path,
            raw: markdown,
            content: metadata.content,
            title: metadata.title || filenameToTitle(file.name),
            date: metadata.date || "",
            background: metadata.background || "",
            dateObject: parseDate(metadata.date),
            githubURL:
                `https://github.com/${repository.owner}/` +
                `${repository.repo}/blob/main/${file.path}`
        };

    } catch (error) {

        console.error(error);
        return null;
    }
}


/* =========================================
   PARSER FOR FRONT MATTER & METADATA
========================================= */

function parseFrontMatter(markdown) {

    const match = markdown.match(
        /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m
    );

    if (!match) {
        return {
            title: "",
            date: "",
            background: "",
            content: markdown.trim()
        };
    }

    const frontMatter = match[1];
    const content = match[2].trim();

    let title = "";
    let date = "";
    let background = "";

    frontMatter.split("\n").forEach(line => {

        const separator = line.indexOf(":");

        if (separator === -1) {
            return;
        }

        const key = line
            .substring(0, separator)
            .trim()
            .toLowerCase();

        const value = line
            .substring(separator + 1)
            .trim()
            .replace(/^["']|["']$/g, "");

        if (key === "title") title = value;
        if (key === "date") date = value;
        if (key === "background" || key === "bg") background = value;
    });

    return {
        title,
        date,
        background,
        content
    };
}


/* =========================================
   HELPERS FOR TITLES AND DATES
========================================= */

function filenameToTitle(filename) {
    return filename
        .replace(/\.md$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function parseDate(dateString) {
    if (!dateString) return new Date(0);
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date(0) : date;
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = parseDate(dateString);
    if (date.getTime() === 0) return dateString;

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function sortNewestFirst(a, b) {
    return b.dateObject - a.dateObject;
}


/* =========================================
   RENDER SIDEBAR POEM LIST
========================================= */

function renderNotesList(filter = "") {

    notesList.innerHTML = "";
    const search = filter.trim().toLowerCase();

    const filteredPoems = poems.filter(poem => {
        return (
            poem.title.toLowerCase().includes(search) ||
            poem.content.toLowerCase().includes(search)
        );
    });

    noteCount.textContent = filteredPoems.length;

    if (filteredPoems.length === 0) {
        notesList.innerHTML = `
            <div class="no-results">
                No poems found.
            </div>
        `;
        return;
    }

    filteredPoems.forEach(poem => {

        const item = document.createElement("div");
        item.className = "note-item";

        if (selectedPoem && selectedPoem.filename === poem.filename) {
            item.classList.add("selected");
        }

        const preview = getPreview(poem.content);

        item.innerHTML = `
            <div class="note-item-title">
                ${escapeHTML(poem.title)}
            </div>

            <div class="note-item-preview">
                ${escapeHTML(preview)}
            </div>

            <div class="note-item-date">
                ${escapeHTML(formatDate(poem.date))}
            </div>
        `;

        item.addEventListener("click", () => openPoem(poem));
        notesList.appendChild(item);
    });
}


/* =========================================
   OPEN AND DISPLAY A POEM
========================================= */

function openPoem(poem) {

    selectedPoem = poem;

    emptyState.classList.add("hidden");
    note.classList.remove("hidden");

    noteTitle.textContent = poem.title;
    noteDate.textContent = formatDate(poem.date);

    // Apply custom dynamic background if defined in front matter, else white
    if (noteArea) {
        noteArea.style.background = poem.background ? poem.background : "#ffffff";
    }

    // Render markdown to safe HTML
    const rendered = marked.parse(poem.content, {
        breaks: true,
        gfm: true
    });

    noteContent.innerHTML = DOMPurify.sanitize(rendered);

    githubButton.onclick = () => {
        window.open(poem.githubURL, "_blank", "noopener,noreferrer");
    };

    renderNotesList(searchInput.value);

    // Mobile view handling
    if (window.innerWidth <= 700) {
        document.querySelector(".app").classList.add("show-note");
    }

    // Update browser address bar without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("poem", poem.filename);
    history.replaceState({}, "", url);
}


/* =========================================
   MOBILE BACK NAVIGATION
========================================= */

function closePoemMobile() {
    document.querySelector(".app").classList.remove("show-note");

    // Reset URL query parameter when exiting to front page
    const url = new URL(window.location.href);
    url.searchParams.delete("poem");
    history.replaceState({}, "", url);
}

if (mobileBackButton) {
    mobileBackButton.addEventListener("click", closePoemMobile);
}


/* =========================================
   SEARCH LISTENER
========================================= */

searchInput.addEventListener("input", event => {
    renderNotesList(event.target.value);
});


/* =========================================
   TEXT PROCESSING UTILITIES
========================================= */

function getPreview(markdown) {
    return markdown
        .replace(/[#*_>`~-]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100);
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   ERROR HANDLING & INIT
========================================= */

function showError(message) {
    notesList.innerHTML = `
        <div class="error-message">
            ${escapeHTML(message)}
        </div>
    `;
}

function showEmptyRepository() {
    notesList.innerHTML = `
        <div class="no-results">
            No poems yet.
        </div>
    `;
}

// Initialize application
loadPoems();

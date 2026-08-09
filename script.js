/* =========================================
POETRY NOTES
GitHub Pages + Markdown
========================================= */

const POEMS_FOLDER = "poems";

const notesList =
document.getElementById("notesList");

const noteCount =
document.getElementById("noteCount");

const searchInput =
document.getElementById("searchInput");

const emptyState =
document.getElementById("emptyState");

const note =
document.getElementById("note");

const noteTitle =
document.getElementById("noteTitle");

const noteDate =
document.getElementById("noteDate");

const noteContent =
document.getElementById("noteContent");

const githubButton =
document.getElementById("githubButton");

const mobileBackButton =
document.getElementById("mobileBackButton");

let poems = [];

let selectedPoem = null;

/* =========================================
GITHUB REPOSITORY
========================================= */

function getRepositoryInfo() {

```
const hostname =
    window.location.hostname;

const pathname =
    window.location.pathname;


if (!hostname.endsWith(".github.io")) {

    return null;

}


const owner =
    hostname.replace(".github.io", "");


const parts =
    pathname
        .split("/")
        .filter(Boolean);


if (parts.length === 0) {

    return {
        owner: owner,
        repo: `${owner}.github.io`
    };

}


return {
    owner: owner,
    repo: parts[0]
};
```

}

const repository =
getRepositoryInfo();

/* =========================================
LOAD POEMS
========================================= */

async function loadPoems() {

```
if (!repository) {

    showError(
        "This website needs to be hosted on GitHub Pages."
    );

    return;

}


const apiURL =
    `https://api.github.com/repos/` +
    `${repository.owner}/` +
    `${repository.repo}/contents/` +
    `${POEMS_FOLDER}`;


try {

    const response =
        await fetch(apiURL);


    if (!response.ok) {

        throw new Error(
            `GitHub returned ${response.status}`
        );

    }


    const files =
        await response.json();


    const markdownFiles =
        files.filter(file =>

            file.type === "file" &&

            file.name
                .toLowerCase()
                .endsWith(".md")

        );


    if (markdownFiles.length === 0) {

        showEmptyRepository();

        return;

    }


    const loadedPoems =
        await Promise.all(
            markdownFiles.map(
                loadPoem
            )
        );


    poems =
        loadedPoems
            .filter(Boolean)
            .sort(sortNewestFirst);


    renderNotesList();


    /*
       The homepage does NOT automatically
       open the newest poem.

       A poem is only opened automatically
       when ?poem=filename.md exists.
    */

    const requestedPoem =
        new URLSearchParams(
            window.location.search
        ).get("poem");


    if (requestedPoem) {

        const poemFromURL =
            poems.find(
                poem =>
                    poem.filename ===
                    requestedPoem
            );


        if (poemFromURL) {

            displayPoem(
                poemFromURL
            );

        }

    }


} catch (error) {

    console.error(error);


    showError(
        "Unable to load the poems. " +
        "Please check that the repository is public " +
        "and the poems folder exists."
    );

}
```

}

/* =========================================
LOAD INDIVIDUAL POEM
========================================= */

async function loadPoem(file) {

```
try {

    const response =
        await fetch(
            file.download_url
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load ${file.name}`
        );

    }


    const markdown =
        await response.text();


    const metadata =
        parseFrontMatter(
            markdown
        );


    return {

        filename:
            file.name,

        path:
            file.path,

        raw:
            markdown,

        content:
            metadata.content,

        title:
            metadata.title ||
            filenameToTitle(
                file.name
            ),

        date:
            metadata.date || "",

        dateObject:
            parseDate(
                metadata.date
            ),

        githubURL:
            `https://github.com/` +
            `${repository.owner}/` +
            `${repository.repo}/blob/main/` +
            `${file.path}`

    };


} catch (error) {

    console.error(error);

    return null;

}
```

}

/* =========================================
FRONT MATTER
========================================= */

function parseFrontMatter(markdown) {

```
const match =
    markdown.match(
        /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m
    );


if (!match) {

    return {

        title: "",

        date: "",

        content:
            markdown.trim()

    };

}


const frontMatter =
    match[1];

const content =
    match[2].trim();


let title = "";

let date = "";


frontMatter
    .split("\n")
    .forEach(line => {

        const separator =
            line.indexOf(":");


        if (separator === -1) {

            return;

        }


        const key =
            line
                .substring(
                    0,
                    separator
                )
                .trim()
                .toLowerCase();


        const value =
            line
                .substring(
                    separator + 1
                )
                .trim()
                .replace(
                    /^["']|["']$/g,
                    ""
                );


        if (key === "title") {

            title = value;

        }


        if (key === "date") {

            date = value;

        }

    });


return {

    title,
    date,
    content

};
```

}

/* =========================================
FILENAME → TITLE
========================================= */

function filenameToTitle(filename) {

```
return filename

    .replace(
        /\.md$/i,
        ""
    )

    .replace(
        /[-_]+/g,
        " "
    )

    .replace(
        /\b\w/g,
        letter =>
            letter.toUpperCase()
    );
```

}

/* =========================================
DATE
========================================= */

function parseDate(dateString) {

```
if (!dateString) {

    return new Date(0);

}


const date =
    new Date(dateString);


if (
    isNaN(
        date.getTime()
    )
) {

    return new Date(0);

}


return date;
```

}

function formatDate(dateString) {

```
if (!dateString) {

    return "";

}


const date =
    parseDate(dateString);


if (
    date.getTime() === 0
) {

    return dateString;

}


return date.toLocaleDateString(
    "en-US",
    {
        year: "numeric",
        month: "long",
        day: "numeric"
    }
);
```

}

/* =========================================
NEWEST FIRST
========================================= */

function sortNewestFirst(a, b) {

```
return b.dateObject - a.dateObject;
```

}

/* =========================================
SIDEBAR
========================================= */

function renderNotesList(
filter = ""
) {

```
notesList.innerHTML = "";


const search =
    filter
        .trim()
        .toLowerCase();


const filteredPoems =
    poems.filter(poem => {

        return (

            poem.title
                .toLowerCase()
                .includes(search)

            ||

            poem.content
                .toLowerCase()
                .includes(search)

        );

    });


noteCount.textContent =
    filteredPoems.length;


if (
    filteredPoems.length === 0
) {

    notesList.innerHTML = `

        <div class="no-results">
            No poems found.
        </div>

    `;

    return;

}


filteredPoems.forEach(
    poem => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "note-item";


        if (
            selectedPoem &&
            selectedPoem.filename ===
                poem.filename
        ) {

            item.classList.add(
                "selected"
            );

        }


        const preview =
            getPreview(
                poem.content
            );


        item.innerHTML = `

            <div class="note-item-title">
                ${escapeHTML(
                    poem.title
                )}
            </div>

            <div class="note-item-preview">
                ${escapeHTML(
                    preview
                )}
            </div>

            <div class="note-item-date">
                ${escapeHTML(
                    formatDate(
                        poem.date
                    )
                )}
            </div>

        `;


        item.addEventListener(
            "click",
            () => openPoem(poem)
        );


        notesList.appendChild(
            item
        );

    }
);
```

}

/* =========================================
OPEN POEM
========================================= */

function openPoem(poem) {

```
if (!poem) {

    return;

}


/*
   Don't create another history entry
   if the poem is already open.
*/

if (
    selectedPoem &&
    selectedPoem.filename ===
        poem.filename
) {

    return;

}


const url =
    new URL(
        window.location.href
    );


url.searchParams.set(
    "poem",
    poem.filename
);


history.pushState(
    {
        poem:
            poem.filename
    },
    "",
    url
);


displayPoem(
    poem
);
```

}

/* =========================================
DISPLAY POEM
========================================= */

function displayPoem(poem) {

```
selectedPoem =
    poem;


emptyState
    .classList
    .add("hidden");


note
    .classList
    .remove("hidden");


noteTitle.textContent =
    poem.title;


noteDate.textContent =
    formatDate(
        poem.date
    );


const rendered =
    marked.parse(
        poem.content,
        {
            breaks: true,
            gfm: true
        }
    );


noteContent.innerHTML =
    DOMPurify.sanitize(
        rendered
    );


githubButton.onclick =
    () => {

        window.open(
            poem.githubURL,
            "_blank",
            "noopener,noreferrer"
        );

    };


renderNotesList(
    searchInput.value
);


/*
   On mobile, hide the notes list
   and show the poem.
*/

if (
    window.innerWidth <= 700
) {

    document
        .querySelector(".app")
        .classList
        .add("show-note");

}
```

}

/* =========================================
RETURN TO FRONT PAGE
========================================= */

function showFrontPage(
addHistory = true
) {

```
selectedPoem = null;


const url =
    new URL(
        window.location.href
    );


url.searchParams.delete(
    "poem"
);


if (addHistory) {

    history.pushState(
        {
            poem: null
        },
        "",
        url
    );

} else {

    history.replaceState(
        {
            poem: null
        },
        "",
        url
    );

}


note
    .classList
    .add("hidden");


emptyState
    .classList
    .remove("hidden");


document
    .querySelector(".app")
    .classList
    .remove("show-note");


renderNotesList(
    searchInput.value
);
```

}

/* =========================================
MOBILE BACK BUTTON
========================================= */

if (mobileBackButton) {

```
mobileBackButton.addEventListener(
    "click",
    () => {

        showFrontPage(true);

    }
);
```

}

/* =========================================
BROWSER BACK / FORWARD
========================================= */

window.addEventListener(
"popstate",
() => {

```
    const requestedPoem =
        new URLSearchParams(
            window.location.search
        ).get("poem");


    if (!requestedPoem) {

        showFrontPage(false);

        return;

    }


    const poem =
        poems.find(
            item =>
                item.filename ===
                requestedPoem
        );


    if (poem) {

        displayPoem(
            poem
        );

    } else {

        showFrontPage(false);

    }

}
```

);

/* =========================================
SEARCH
========================================= */

if (searchInput) {

```
searchInput.addEventListener(
    "input",
    event => {

        renderNotesList(
            event.target.value
        );

    }
);
```

}

/* =========================================
PREVIEW
========================================= */

function getPreview(markdown) {

```
return markdown

    .replace(
        /[#*_>`~-]/g,
        ""
    )

    .replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
    )

    .replace(
        /\s+/g,
        " "
    )

    .trim()

    .substring(
        0,
        100
    );
```

}

/* =========================================
ESCAPE HTML
========================================= */

function escapeHTML(text) {

```
return text

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );
```

}

/* =========================================
ERRORS
========================================= */

function showError(message) {

```
notesList.innerHTML = `

    <div class="error-message">

        ${escapeHTML(message)}

    </div>

`;
```

}

function showEmptyRepository() {

```
notesList.innerHTML = `

    <div class="no-results">

        No poems yet.

    </div>

`;
```

}

/* =========================================
START
========================================= */

loadPoems();

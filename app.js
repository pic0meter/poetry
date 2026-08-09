const poems = [
  {
    id: 1,
    title: "Midnight Whispers",
    date: "August 9, 2026",
    content: `The clock strikes twelve, the house is still,
A silent moon upon the sill.
Words take shape in quiet light,
Carving echoes in the night.`
  },
  {
    id: 2,
    title: "Fading Horizons",
    date: "July 24, 2026",
    content: `Waves touch the shore and bleed away,
Chasing the ghosts of yesterday.
Where gold meets gray upon the sea,
A quiet space remains for me.`
  }
];

let activePoemId = poems[0].id;

function renderNotesList(filterText = "") {
  const notesListEl = document.getElementById("notesList");
  notesListEl.innerHTML = "";

  const filtered = poems.filter(p => 
    p.title.toLowerCase().includes(filterText.toLowerCase()) ||
    p.content.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach(poem => {
    const item = document.createElement("div");
    item.className = `note-item ${poem.id === activePoemId ? "active" : ""}`;
    item.onclick = () => selectPoem(poem.id);

    const snippet = poem.content.split("\n")[0];

    item.innerHTML = `
      <div class="note-item-title">${poem.title}</div>
      <div class="note-item-meta">
        <span>${poem.date}</span>
        <span class="note-item-snippet">${snippet}</span>
      </div>
    `;

    notesListEl.appendChild(item);
  });
}

function selectPoem(id) {
  activePoemId = id;
  const poem = poems.find(p => p.id === id);

  if (poem) {
    document.getElementById("noteDate").textContent = poem.date;
    document.getElementById("noteTitle").textContent = poem.title;
    document.getElementById("noteBody").textContent = poem.content;
  }

  renderNotesList(document.getElementById("searchInput").value);
}

// Search Filter Listener
document.getElementById("searchInput").addEventListener("input", (e) => {
  renderNotesList(e.target.value);
});

// Initial Render
selectPoem(activePoemId);

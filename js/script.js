const PASSWORD = "admin123";

const fileInput     = document.getElementById("fileInput");
const pdfList       = document.getElementById("pdf-list");
const searchInput   = document.getElementById("searchInput");
const suggestions   = document.getElementById("searchSuggestions");
const dropZone      = document.getElementById("dropZone");
const loginBtn      = document.getElementById("loginBtn");
const loginModal    = document.getElementById("loginModal");
const sidebar       = document.querySelector(".sidebar");
const header        = document.querySelector("header");
const main          = document.querySelector("main");
const pdfFrame      = document.getElementById("pdfFrame");
const pdfViewer     = document.getElementById("pdfViewer");
const closeBtn      = document.querySelector("#pdfViewer .close-btn");
const btnClear      = document.getElementById("btnClear");

let pdfData = {};
let currentCategory = "aeroespacial";

// Menu de contexto
let selectedCard = null;
const contextMenu = document.getElementById("contextMenu");
const deleteOption = document.getElementById("deleteOption");

function loadData() {
  const saved = localStorage.getItem("pdfManager");
  if (saved) {
    pdfData = JSON.parse(saved);
  } else {
    pdfData = {
      aeroespacial: [],
      defesa:       [],
      espaco:       [],
      naval:        [],
      automotivo:   [],
      mineracao:    []
    };
  }
  renderFiles();
}

function saveData() {
  localStorage.setItem("pdfManager", JSON.stringify(pdfData));
}

function renderFiles() {
  pdfList.innerHTML = "";

  const files = pdfData[currentCategory] || [];

  files.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "pdf-card";
    card.dataset.index = index;
    card.innerHTML = `
      <div>📄</div>
      <div>${file.name}</div>
    `;

    // Clique esquerdo → abrir
    card.addEventListener("click", (e) => {
      if (e.button === 0) {
        pdfFrame.src = file.url;
        pdfViewer.classList.add("show");
      }
    });

    // Botão direito → menu contexto
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      selectedCard = card;
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top  = `${e.pageY}px`;
      contextMenu.style.display = "block";
    });

    pdfList.appendChild(card);
  });

  // Mensagem de vazio
  document.getElementById("no-files").style.display = 
    files.length === 0 ? "block" : "none";
}

// Fecha visualizador
function closeViewer() {
  pdfViewer.classList.remove("show");
  pdfFrame.src = "";
}

closeBtn.addEventListener("click", closeViewer);
pdfViewer.addEventListener("click", (e) => {
  if (e.target === pdfViewer) closeViewer();
});

// Fecha menu contexto ao clicar fora
document.addEventListener("click", (e) => {
  if (!contextMenu.contains(e.target)) {
    contextMenu.style.display = "none";
  }
});

// Excluir documento
deleteOption.addEventListener("click", () => {
  if (!selectedCard) return;
  if (confirm("Deseja deletar o documento?")) {
    const index = parseInt(selectedCard.dataset.index);
    pdfData[currentCategory].splice(index, 1);
    saveData();
    renderFiles();
  }
  contextMenu.style.display = "none";
  selectedCard = null;
});

// Mudar categoria (clique na sidebar)
document.querySelectorAll(".sidebar li").forEach(li => {
  li.addEventListener("click", () => {
    document.querySelector(".sidebar .active")?.classList.remove("active");
    li.classList.add("active");
    
    currentCategory = li.dataset.category;
    renderFiles();
    searchInput.value = "";
    suggestions.style.display = "none";
  });
});

// Limpar categoria atual
btnClear.addEventListener("click", () => {
  if (confirm(`Deseja realmente limpar TODOS os documentos da categoria "${currentCategory}"?`)) {
    pdfData[currentCategory] = [];
    saveData();
    renderFiles();
  }
});

// Adicionar via input
fileInput.addEventListener("change", (e) => {
  Array.from(e.target.files).forEach(file => {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      pdfData[currentCategory].push({ name: file.name, url });
    }
  });
  saveData();
  renderFiles();
});

// Drag & Drop
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.style.background = "#eef2f7";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.background = "white";
});

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.style.background = "white";
  Array.from(e.dataTransfer.files).forEach(file => {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      pdfData[currentCategory].push({ name: file.name, url });
    }
  });
  saveData();
  renderFiles();
});

// Busca
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase().trim();
  suggestions.innerHTML = "";

  if (!term) {
    suggestions.style.display = "none";
    return;
  }

  const results = pdfData[currentCategory].filter(f => 
    f.name.toLowerCase().includes(term)
  );

  results.forEach(file => {
    const div = document.createElement("div");
    div.textContent = file.name;
    div.onclick = () => {
      pdfFrame.src = file.url;
      pdfViewer.classList.add("show");
      suggestions.style.display = "none";
      searchInput.value = "";
    };
    suggestions.appendChild(div);
  });

  suggestions.style.display = results.length > 0 ? "block" : "none";
});

// Login
loginBtn.onclick = () => {
  const pass = document.getElementById("password").value;
  if (pass === PASSWORD) {
    loginModal.style.display = "none";
    sidebar.hidden = false;
    header.hidden = false;
    main.hidden   = false;
    document.body.classList.remove("login-screen");
    document.body.classList.add("app");
    loadData();
  } else {
    document.getElementById("loginError").hidden = false;
  }
};

// Logout simples (recarrega página)
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  if (confirm("Deseja sair?")) {
    location.reload();
  }
});

// Inicialização
loadData();
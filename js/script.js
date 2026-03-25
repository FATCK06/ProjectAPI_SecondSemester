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
const addBtnLabel   = document.getElementById("addBtnLabel");

let pdfData = {};
let currentCategory = "aeroespacial";
let currentRole = null;        // "admin" ou "consultor"

const USERS = {
  administrador: { password: "admin123", role: "admin" },
  consultor:     { password: "consultor123", role: "consultor" }
};

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

    // Clique para visualizar (funciona para ambos os usuários)
    card.addEventListener("click", () => {
      pdfFrame.src = file.url;
      pdfViewer.classList.add("show");
    });

    // Menu de contexto só para administrador
    if (currentRole === "admin") {
      card.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        selectedCard = card;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top  = `${e.pageY}px`;
        contextMenu.style.display = "block";
      });
    }

    pdfList.appendChild(card);
  });

  document.getElementById("no-files").style.display = files.length === 0 ? "block" : "none";
}

function applyPermissions() {
  const isAdmin = currentRole === "admin";
  
  // Esconde/mostra controles de edição
  if (addBtnLabel) addBtnLabel.style.display = isAdmin ? "" : "none";
  if (btnClear) btnClear.style.display = isAdmin ? "" : "none";

  // Desabilita drag & drop para consultor
  if (currentRole === "consultor") {
    dropZone.style.pointerEvents = "auto";
    dropZone.style.opacity = "0.7";
  } else {
    dropZone.style.pointerEvents = "auto";
    dropZone.style.opacity = "1";
  }
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

// Excluir documento (só admin)
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

// Mudar categoria
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

// Limpar categoria (só admin)
btnClear.addEventListener("click", () => {
  if (confirm(`Deseja realmente limpar TODOS os documentos da categoria "${currentCategory}"?`)) {
    pdfData[currentCategory] = [];
    saveData();
    renderFiles();
  }
});

// Adicionar via input (só admin)
fileInput.addEventListener("change", (e) => {
  if (currentRole !== "admin") {
    e.target.value = "";
    return;
  }

  Array.from(e.target.files).forEach(file => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();

      reader.onload = function(event) {
        pdfData[currentCategory].push({
          name: file.name,
          url: event.target.result
        });

        saveData();
        renderFiles();

        fileInput.value = "";
      };

      reader.readAsDataURL(file);
    }
  });
});


// Drag & Drop (só admin)
dropZone.addEventListener("dragover", e => {
  e.preventDefault(); // SEMPRE roda

  if (currentRole !== "admin") return;

  dropZone.style.background = "#eef2f7";
});

dropZone.addEventListener("drop", e => {
  e.preventDefault(); // SEMPRE roda

  if (currentRole !== "admin") return;

  dropZone.style.background = "white";

  Array.from(e.dataTransfer.files).forEach(file => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();

      reader.onload = function(event) {
        pdfData[currentCategory].push({
          name: file.name,
          url: event.target.result
        });

        saveData();
        renderFiles();
      };

      reader.readAsDataURL(file);
    }
  });
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
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const user = USERS[username];

  if (user && user.password === password) {
    currentRole = user.role;

    loginModal.style.display = "none";
    sidebar.hidden = false;
    header.hidden = false;
    main.hidden   = false;
    document.body.classList.remove("login-screen");
    document.body.classList.add("app");

    // Atualiza nome do usuário
    const userSpan = document.querySelector(".user-area span");
    if (userSpan) {
      userSpan.textContent = `Usuário logado: ${username.charAt(0).toUpperCase() + username.slice(1)}`;
    }

    applyPermissions();
    loadData();           // Carrega os arquivos DEPOIS de aplicar permissões
  } else {
    document.getElementById("loginError").hidden = false;
  }
};

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Deseja sair?")) location.reload();
});

// Inicialização
loadData();
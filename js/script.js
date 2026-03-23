// =====================
// USUÁRIOS
// =====================
const USERS = {
  admin: {
    username: "administrador",
    password: "admin123",
    role: "admin"
  },
  consultor: {
    username: "consultor",
    password: "consultor123",
    role: "consultor"
  }
};

let userRole = null;

// =====================
// ELEMENTOS
// =====================
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

// =====================
// PERMISSÃO
// =====================
function isAdmin() {
  return userRole === "admin";
}

// =====================
// LOGIN
// =====================
loginBtn.onclick = () => {
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  let user = null;

  Object.values(USERS).forEach(u => {
    if (u.username === username && u.password === password) {
      user = u;
    }
  });

  if (!user) {
    document.getElementById("loginError").hidden = false;
    return;
  }

  userRole = user.role;
  iniciarSistema(user.username);
};

function iniciarSistema(nomeUsuario) {
  loginModal.style.display = "none";
  sidebar.hidden = false;
  header.hidden = false;
  main.hidden   = false;

  document.body.classList.remove("login-screen");
  document.body.classList.add("app");

  document.querySelector(".user-area span").textContent =
    userRole === "admin" ? "Administrador" : "Consultor";

  // BLOQUEIOS
  if (!isAdmin()) {
    fileInput.parentElement.style.display = "none";
    btnClear.style.display = "none";
  }

  loadData();
}

// =====================
// DADOS
// =====================
function loadData() {
  const saved = localStorage.getItem("pdfManager");
  if (saved) {
    pdfData = JSON.parse(saved);
  } else {
    pdfData = {
      aeroespacial: [],
      defesa: [],
      espaco: [],
      naval: [],
      automotivo: [],
      mineracao: []
    };
  }
  renderFiles();
}

function saveData() {
  localStorage.setItem("pdfManager", JSON.stringify(pdfData));
}

// =====================
// RENDER
// =====================
function renderFiles() {
  pdfList.innerHTML = "";

  const files = pdfData[currentCategory] || [];

  files.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "pdf-card";
    card.dataset.index = index;
    card.innerHTML = `📄 ${file.name}`;

    card.onclick = () => {
      pdfFrame.src = file.url;
      pdfViewer.classList.add("show");
    };

    if (isAdmin()) {
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

  document.getElementById("no-files").style.display =
    files.length === 0 ? "block" : "none";
}

// =====================
// CONTEXTO
// =====================
let selectedCard = null;
const contextMenu = document.getElementById("contextMenu");
const deleteOption = document.getElementById("deleteOption");

deleteOption.onclick = () => {
  if (!isAdmin()) return;

  const index = parseInt(selectedCard.dataset.index);
  pdfData[currentCategory].splice(index, 1);
  saveData();
  renderFiles();

  contextMenu.style.display = "none";
};

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

// =====================
// UPLOAD
// =====================
fileInput.addEventListener("change", (e) => {
  if (!isAdmin()) return;

  Array.from(e.target.files).forEach(file => {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      pdfData[currentCategory].push({ name: file.name, url });
    }
  });

  saveData();
  renderFiles();
});

// =====================
// DRAG DROP
// =====================
dropZone.addEventListener("dragover", e => {
  if (!isAdmin()) return;
  e.preventDefault();
});

dropZone.addEventListener("drop", e => {
  if (!isAdmin()) return;

  e.preventDefault();

  Array.from(e.dataTransfer.files).forEach(file => {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      pdfData[currentCategory].push({ name: file.name, url });
    }
  });

  saveData();
  renderFiles();
});

// =====================
// LIMPAR
// =====================
btnClear.addEventListener("click", () => {
  if (!isAdmin()) return;

  pdfData[currentCategory] = [];
  saveData();
  renderFiles();
});

// =====================
// CATEGORIAS
// =====================
document.querySelectorAll(".sidebar li").forEach(li => {
  li.onclick = () => {
    document.querySelector(".sidebar .active")?.classList.remove("active");
    li.classList.add("active");

    currentCategory = li.dataset.category;
    renderFiles();
  };
});

// =====================
// VISUALIZADOR
// =====================
closeBtn.onclick = () => {
  pdfViewer.classList.remove("show");
  pdfFrame.src = "";
};

// =====================
// LOGOUT
// =====================
document.getElementById("logoutBtn").onclick = () => {
  location.reload();
};

// Init
loadData();
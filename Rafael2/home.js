function openTab(evt, tabName) {
  
  const contents = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');

  contents.forEach(content => {
    content.classList.remove('active');
  });

  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.classList.add('active');
}


//popup
  function abrirPopup() {
    document.getElementById('overlay').classList.add('ativo');
  }
  
  function fecharPopup() {
    document.getElementById('overlay').classList.remove('ativo');
  }

  const normasDisponiveis = [
      "Norma 1", "Norma 2", "Norma 3", "Norma 4", "Norma 5",
      "Norma 6", "Norma 7", "Norma 8", "Norma 9", "Norma 10"
  ];

  let normaSelecionada = null;

  function abrirPopup() {
      document.getElementById('overlay').classList.add('ativo');
  }

  function fecharPopup() {
      document.getElementById('overlay').classList.remove('ativo');
      fecharDropdown();
  }

  function abrirDropdown() {
      filtrarNormas();
      document.getElementById('correlacaoDropdown').classList.add('aberto');
  }

  function fecharDropdown() {
      document.getElementById('correlacaoDropdown').classList.remove('aberto');
  }

  function filtrarNormas() {
      const input = document.getElementById('correlacaoInput').value.toLowerCase();
      const dropdown = document.getElementById('correlacaoDropdown');

      const filtradas = normasDisponiveis.filter(n => n.toLowerCase().includes(input));

      dropdown.innerHTML = '';

      if (filtradas.length === 0) {
          dropdown.innerHTML = '<p class="sem-resultado">Nenhuma norma encontrada</p>';
          return;
      }

      filtradas.forEach(norma => {
          const li = document.createElement('li');
          li.textContent = norma;
          if (norma === normaSelecionada) li.classList.add('selecionado');
          li.onclick = () => selecionarNorma(norma);
          dropdown.appendChild(li);
      });
  }

  function selecionarNorma(norma) {
      normaSelecionada = norma;
      document.getElementById('correlacaoInput').value = '';
      document.getElementById('normaSelecionadaTexto').textContent = norma;
      document.getElementById('normaSelecionadaTag').classList.add('visivel');
      fecharDropdown();
  }

  function removerCorrelacao() {
      normaSelecionada = null;
      document.getElementById('normaSelecionadaTexto').textContent = '';
      document.getElementById('normaSelecionadaTag').classList.remove('visivel');
  }

  document.addEventListener('click', function(e) {
      const wrapper = document.querySelector('.correlacao-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
          fecharDropdown();
      }
  });
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
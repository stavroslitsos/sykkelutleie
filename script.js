const html = document.documentElement;
const toggle = document.getElementById('lang-toggle');

function applyLang(lang) {
  html.setAttribute('lang', lang);
  toggle.textContent = lang === 'no' ? 'English' : 'Norsk';
  localStorage.setItem('lang', lang);
}

toggle.addEventListener('click', () => {
  const next = html.getAttribute('lang') === 'no' ? 'en' : 'no';
  applyLang(next);
});

applyLang(localStorage.getItem('lang') || 'no');

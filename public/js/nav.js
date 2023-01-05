const nav = document.querySelector('nav');
const hide_button = nav.querySelector('button[name="hide"]');
const show_button = nav.querySelector('button[name="show"]');
hide_button.addEventListener('click', (e) => {
  hide_button.style.display = 'none';
  show_button.style.display = 'inline-block';
  nav.querySelectorAll('a').forEach((a) => {
    a.style.display = 'none';
  });
});
show_button.addEventListener('click', (e) => {
  show_button.style.display = 'none';
  hide_button.style.display = 'inline-block';
  nav.querySelectorAll('a').forEach((a) => {
    a.style.display = 'block';
  });
});

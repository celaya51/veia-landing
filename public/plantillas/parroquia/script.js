/* ============================================================
   Parroquia de la Divina Misericordia · lógica de la plantilla
   La galería se delega al módulo ../_shared/galeria.js
   ============================================================ */

/* Menú móvil */
const header = document.getElementById('header');
const hamb = document.querySelector('.menu');
const mobileNav = document.getElementById('mobile-nav');

hamb.addEventListener('click', () => {
  const open = hamb.getAttribute('aria-expanded') === 'true';
  hamb.setAttribute('aria-expanded', String(!open));
  hamb.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
  mobileNav.classList.toggle('open', !open);
});

mobileNav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    hamb.setAttribute('aria-expanded', 'false');
    hamb.setAttribute('aria-label', 'Abrir menú');
    mobileNav.classList.remove('open');
  }
});

/* Header transparente -> sólido al hacer scroll */
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('toTop').classList.toggle('show', window.scrollY > 500);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Volver arriba */
document.getElementById('toTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Scrollspy: resalta la sección activa */
if ('IntersectionObserver' in window) {
  const secs = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const id = en.target.id;
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach((s) => spy.observe(s));
}

/* Datos de contacto (editar aquí) */
const DIRECCION = 'EL SALTO, JALISCO · dirección por confirmar';
const TEL = '521XXXXXXXXXX'; // número sin espacios
document.getElementById('btn-wa').href = 'https://wa.me/' + TEL.replace(/[^0-9]/g, '') +
  '?text=' + encodeURIComponent('Hola, quiero información de la parroquia');
document.getElementById('btn-maps').href = 'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(DIRECCION);

/* Galería interactiva (módulo compartido) */
const FOTOS = [
  { src: 'fotos/IMG_1162.webp', cat: 'exterior', cap: 'Bienvenida — patio techado' },
  { src: 'fotos/IMG_1163.webp', cat: 'exterior', cap: 'Zona de reunión' },
  { src: 'fotos/IMG_1167.webp', cat: 'interior', cap: 'Interior con decoración amarilla' },
  { src: 'fotos/IMG_1169.webp', cat: 'interior', cap: 'Nave central' },
  { src: 'fotos/IMG_1171.webp', cat: 'interior', cap: 'Altar y santuario' },
  { src: 'fotos/IMG_1173.webp', cat: 'detalle', cap: 'Última Cena — relieve' },
  { src: 'fotos/IMG_1174.webp', cat: 'detalle', cap: 'Custodia y cirio' },
  { src: 'fotos/IMG_1178.webp', cat: 'detalle', cap: 'Custodia dorada en sol' },
  { src: 'fotos/IMG_1179.webp', cat: 'detalle', cap: 'Virgen de Guadalupe' },
  { src: 'fotos/IMG_1180.webp', cat: 'interior', cap: 'Personas en la nave' },
  { src: 'fotos/IMG_1182.webp', cat: 'detalle', cap: 'Vitral con cruz' },
  { src: 'fotos/IMG_1189.webp', cat: 'interior', cap: 'Altar con mantel verde' },
  { src: 'fotos/IMG_1193.webp', cat: 'interior', cap: 'Panorámica con flores' },
  { src: 'fotos/IMG_1195.webp', cat: 'detalle', cap: 'Virgen María' }
];

VEIAgaleria.init({
  grid: '#galeria-grid',
  filtros: '#filtros',
  fotos: FOTOS,
  titulo: 'Parroquia de la Divina Misericordia'
});

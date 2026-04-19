/* ================================================================
PULIDOS C&R — main.js
Módulos:
1. Año automático en footer
2. Header: shrink + línea roja al scroll
3. Menú hamburger (móvil)
4. Link activo en navegación según sección visible
5. Scroll Reveal (Intersection Observer)
6. Slider Before/After en tarjetas de servicios
7. Galería horizontal con drag
8. Modal de imagen en pantalla completa
================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
1. AÑO AUTOMÁTICO EN FOOTER
──────────────────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ────────────────────────────────────────────────────────────────
2. HEADER — borde rojo al hacer scroll
──────────────────────────────────────────────────────────────── */
const header = document.getElementById('header');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // ejecutar al cargar por si ya hay desplazamiento

/* ────────────────────────────────────────────────────────────────
3. MENÚ HAMBURGER (MÓVIL)
──────────────────────────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger)   hamburger.addEventListener('click', openMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ────────────────────────────────────────────────────────────────
4. LINK ACTIVO EN NAVEGACIÓN
Resalta el enlace del header que corresponde a la sección
visible mientras el usuario hace scroll.
──────────────────────────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.header__nav-link');
const sections = document.querySelectorAll('section[id]');

// Inyectar estilo para link activo
const activeStyle = document.createElement('style');
activeStyle.textContent = `.header__nav-link.active { color: var(--white); } .header__nav-link.active::after { width: 100%; }`;
document.head.appendChild(activeStyle);

function highlightNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.header__nav-link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}
window.addEventListener('scroll', highlightNav, { passive: true });

/* ────────────────────────────────────────────────────────────────
5. SCROLL REVEAL — Intersection Observer
Cualquier elemento con clase .reveal se anima al entrar
en el viewport. La transición está definida en CSS.

CORRECCIÓN: se eliminó la función initScrollAnimation() duplicada
que estaba al final del archivo. Esta implementación es idéntica
en funcionalidad pero también llama .add('visible'), que es la
clase que el CSS de .reveal.visible espera. La de abajo usaba
.add('active') que no tenía ningún estilo asociado.
──────────────────────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // solo una vez
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ────────────────────────────────────────────────────────────────
6. SLIDER BEFORE / AFTER
─────────────────────────────────────────────────────────────────
Cómo funciona:

- Cada .service-card__compare es un comparador independiente.
- La imagen "Después" (.service-card__after) se recorta con
  clip-path: inset(0 X% 0 0). Al arrastrar, X disminuye y
  la imagen "Después" se va revelando de izquierda a derecha.
- El divisor (.service-card__divider) y el handle
  (.service-card__handle) se mueven al mismo porcentaje.
- Posición inicial: 50% (centro).
- Compatible con mouse y touch.
──────────────────────────────────────────────────────────────── */
const comparators = document.querySelectorAll('.service-card__compare');

comparators.forEach(comp => {
  const afterEl = comp.querySelector('.service-card__after');
  const divider = comp.querySelector('.service-card__divider');
  const handle  = comp.querySelector('.service-card__handle');

  let active = false;
  let currentPct = 50; // posición actual en porcentaje

  /* ── Aplica la posición visual ── */
  function applyPos(pct) {
    currentPct = Math.max(2, Math.min(98, pct));
    const rightClip = (100 - currentPct).toFixed(2);

    // Recortar imagen "Después": ocultar desde el lado derecho
    afterEl.style.clipPath = `inset(0 ${rightClip}% 0 0)`;

    // Mover la línea divisora y el handle
    divider.style.left = `${currentPct}%`;
    handle.style.left  = `${currentPct}%`;
  }

  /* ── Convierte coordenada X en porcentaje del contenedor ── */
  function clientXtoPct(clientX) {
    const rect = comp.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  // Inicializar centrado
  applyPos(50);

  /* ── Ratón ── */
  comp.addEventListener('mousedown', e => {
    active = true;
    applyPos(clientXtoPct(e.clientX));
    e.preventDefault(); // evitar arrastrar imágenes
  });

  window.addEventListener('mousemove', e => {
    if (!active) return;
    applyPos(clientXtoPct(e.clientX));
  });

  window.addEventListener('mouseup', () => { active = false; });

  /* ── Touch ── */
  comp.addEventListener('touchstart', e => {
    active = true;
    applyPos(clientXtoPct(e.touches[0].clientX));
    e.preventDefault(); // evitar scroll mientras se desliza
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    if (!active) return;
    applyPos(clientXtoPct(e.touches[0].clientX));
  }, { passive: true });

  window.addEventListener('touchend',    () => { active = false; });
  window.addEventListener('touchcancel', () => { active = false; });

  /* ── Recentrar al redimensionar ventana ── */
  window.addEventListener('resize', () => {
    applyPos(currentPct); // mantener la posición relativa actual
  }, { passive: true });
});

/* ────────────────────────────────────────────────────────────────
7. GALERÍA HORIZONTAL — drag to scroll
CORRECCIÓN: la función estaba definida pero nunca se llamaba.
──────────────────────────────────────────────────────────────── */
function initGallery() {
  const gallerySlider = document.querySelector('.gallery-slider');

  if (!gallerySlider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  gallerySlider.addEventListener('mousedown', (e) => {
    isDown = true;
    gallerySlider.style.cursor = 'grabbing';
    startX = e.pageX - gallerySlider.offsetLeft;
    scrollLeft = gallerySlider.scrollLeft;
  });

  gallerySlider.addEventListener('mouseleave', () => {
    isDown = false;
    gallerySlider.style.cursor = 'grab';
  });

  gallerySlider.addEventListener('mouseup', () => {
    isDown = false;
    gallerySlider.style.cursor = 'grab';
  });

  gallerySlider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - gallerySlider.offsetLeft;
    const walk = (x - startX) * 2;
    gallerySlider.scrollLeft = scrollLeft - walk;
  });
}

/* ────────────────────────────────────────────────────────────────
8. MODAL DE IMAGEN EN PANTALLA COMPLETA
CORRECCIÓN: la función estaba definida pero nunca se llamaba.
──────────────────────────────────────────────────────────────── */
function initFullscreenGallery() {
  const galleryImages    = document.querySelectorAll('.gallery-slide img');
  const fullscreenModal  = document.getElementById('fullscreenModal');
  const fullscreenImage  = fullscreenModal?.querySelector('.fullscreen-image');
  const closeBtn         = fullscreenModal?.querySelector('.fullscreen-close');
  const prevBtn          = fullscreenModal?.querySelector('.fullscreen-nav.prev');
  const nextBtn          = fullscreenModal?.querySelector('.fullscreen-nav.next');

  if (!fullscreenModal) return;

  let currentImageIndex = 0;
  const imagesArray = Array.from(galleryImages);

  /* ── Mostrar imagen en el modal ── */
  function showFullscreenImage(index) {
    if (fullscreenImage && imagesArray[index]) {
      fullscreenImage.src = imagesArray[index].src;
      fullscreenImage.alt = imagesArray[index].alt;
    }
  }

  /* ── Abrir al hacer clic en una imagen ── */
  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentImageIndex = index;
      showFullscreenImage(currentImageIndex);
      fullscreenModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // bloquear scroll al abrir modal
    });
  });

  /* ── Cerrar modal ── */
  function closeModal() {
    fullscreenModal.classList.remove('active');
    document.body.style.overflow = ''; // restaurar scroll al cerrar
  }

  closeBtn?.addEventListener('click', closeModal);

  // Cerrar al hacer clic en el fondo
  fullscreenModal.addEventListener('click', (e) => {
    if (e.target === fullscreenModal) closeModal();
  });

  /* ── Navegación con botones ── */
  prevBtn?.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + imagesArray.length) % imagesArray.length;
    showFullscreenImage(currentImageIndex);
  });

  nextBtn?.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % imagesArray.length;
    showFullscreenImage(currentImageIndex);
  });

  /* ── Navegación con teclado ── */
  document.addEventListener('keydown', (e) => {
    if (!fullscreenModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      prevBtn?.click();
    } else if (e.key === 'ArrowRight') {
      nextBtn?.click();
    }
  });
}

/* ────────────────────────────────────────────────────────────────
INICIALIZACIÓN
CORRECCIÓN: initGallery() e initFullscreenGallery() nunca
se llamaban. Se agregan aquí para que ambas funcionen.
──────────────────────────────────────────────────────────────── */
initGallery();
initFullscreenGallery();

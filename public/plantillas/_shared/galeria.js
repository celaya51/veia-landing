/* ============================================================
   VEIA · Galería interactiva (módulo reutilizable)
   Uso:
     VEIAgaleria.init({
       grid: '#galeria',          // contenedor de miniaturas
       filtros: '#filtros',       // botones con [data-filter] (opcional)
       fotos: [{ src, cat, cap }],
       titulo: 'Mi galería'       // opcional
     });

   Escritorio: visor con filmstrip, flechas, teclado, rueda y doble clic.
   Móvil: visor a pantalla completa con swipe, pinch, doble toque y
          arrastrar hacia abajo para cerrar.
   ============================================================ */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  function init(opts) {
    opts = opts || {};
    var grid = typeof opts.grid === 'string' ? document.querySelector(opts.grid) : opts.grid;
    if (!grid) return;

    var fotos = Array.isArray(opts.fotos) ? opts.fotos : [];
    var titulo = opts.titulo || '';
    var filtros = opts.filtros
      ? (typeof opts.filtros === 'string' ? document.querySelector(opts.filtros) : opts.filtros)
      : null;
    var esTactil = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    var visibles = fotos.slice();
    var actual = 0;
    var abierto = false;
    var ultimoFoco = null;

    /* ---------------- Visor ---------------- */
    var viewer = document.createElement('div');
    viewer.className = 'vg-viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Visor de imágenes');
    viewer.setAttribute('tabindex', '-1');
    viewer.innerHTML = [
      '<div class="vg-topbar">',
        '<button class="vg-back" type="button"><span aria-hidden="true">←</span> Volver a la galería</button>',
        '<span class="vg-title"></span>',
        '<div class="vg-tools">',
          '<button class="vg-zoom" type="button" aria-label="Acercar">＋</button>',
          '<button class="vg-close" type="button" aria-label="Cerrar">×</button>',
        '</div>',
      '</div>',
      '<button class="vg-arrow vg-prev" type="button" aria-label="Anterior">‹</button>',
      '<button class="vg-arrow vg-next" type="button" aria-label="Siguiente">›</button>',
      '<div class="vg-stage"><img class="vg-img" alt=""></div>',
      '<div class="vg-bar"><span class="vg-caption"></span><span class="vg-counter"></span></div>',
      '<div class="vg-filmstrip"></div>'
    ].join('');
    document.body.appendChild(viewer);

    var elTitle = viewer.querySelector('.vg-title');
    var elImg = viewer.querySelector('.vg-img');
    var elStage = viewer.querySelector('.vg-stage');
    var elFilm = viewer.querySelector('.vg-filmstrip');
    var elCap = viewer.querySelector('.vg-caption');
    var elCount = viewer.querySelector('.vg-counter');
    elTitle.textContent = titulo;

    /* ---------------- Rejilla + filmstrip ---------------- */
    function pintarGrid(filtro) {
      visibles = fotos.filter(function (f) {
        return !filtro || filtro === 'all' || f.cat === filtro;
      });
      grid.innerHTML = '';
      visibles.forEach(function (f, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'vg-item';
        b.innerHTML = '<img src="' + esc(f.src) + '" alt="' + esc(f.cap) + '" loading="lazy">' +
          '<span class="vg-item-cap">' + esc(f.cap) + '</span>';
        b.addEventListener('click', function () { abrir(i, b); });
        grid.appendChild(b);
      });
      pintarFilm();
    }

    function pintarFilm() {
      elFilm.innerHTML = '';
      visibles.forEach(function (f, i) {
        var t = document.createElement('button');
        t.type = 'button';
        t.className = 'vg-thumb';
        t.innerHTML = '<img src="' + esc(f.src) + '" alt="" loading="lazy">';
        t.addEventListener('click', function () { ir(i); });
        elFilm.appendChild(t);
      });
    }

    function marcarFilm() {
      var thumbs = elFilm.children;
      for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].classList.toggle('activo', i === actual);
      }
      var act = thumbs[actual];
      if (act) {
        var destino = act.offsetLeft - (elFilm.clientWidth - act.offsetWidth) / 2;
        elFilm.scrollTo({ left: Math.max(0, destino), behavior: 'smooth' });
      }
    }

    /* ---------------- Zoom / pan ---------------- */
    var scale = 1, tx = 0, ty = 0;

    function aplicar() {
      elImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      elStage.style.cursor = scale > 1 ? 'grab' : '';
    }

    function resetZoom() {
      scale = 1; tx = 0; ty = 0;
      viewer.classList.add('sin-transicion');
      aplicar();
      requestAnimationFrame(function () { viewer.classList.remove('sin-transicion'); });
    }

    function zoomEn(ns, px, py) {
      ns = clamp(ns, 1, 4);
      tx = px - (px - tx) * (ns / scale);
      ty = py - (py - ty) * (ns / scale);
      scale = ns;
      if (scale <= 1) { scale = 1; tx = 0; ty = 0; }
      aplicar();
    }

    /* ---------------- Abrir / cerrar / navegar ---------------- */
    function mostrar() {
      var f = visibles[actual];
      if (!f) return;
      elImg.src = f.src;
      elImg.alt = f.cap || '';
      elCap.textContent = f.cap || '';
      elCount.textContent = (actual + 1) + ' / ' + visibles.length;
      resetZoom();
      marcarFilm();
    }

    function abrir(i, origen) {
      actual = i;
      abierto = true;
      ultimoFoco = origen || null;
      mostrar();
      viewer.classList.add('abierto');
      document.body.classList.add('vg-bloqueado');
      viewer.focus();
    }

    function cerrar() {
      abierto = false;
      viewer.classList.remove('abierto', 'vg-oculto');
      document.body.classList.remove('vg-bloqueado');
      resetZoom();
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    }

    function ir(i) {
      actual = (i + visibles.length) % visibles.length;
      mostrar();
    }

    function nav(d) { ir(actual + d); }

    viewer.querySelector('.vg-back').addEventListener('click', cerrar);
    viewer.querySelector('.vg-close').addEventListener('click', cerrar);
    viewer.querySelector('.vg-prev').addEventListener('click', function () { nav(-1); });
    viewer.querySelector('.vg-next').addEventListener('click', function () { nav(1); });
    viewer.querySelector('.vg-zoom').addEventListener('click', function () {
      if (scale > 1) resetZoom(); else zoomEn(2.5, 0, 0);
    });

    /* ---------------- Teclado (escritorio) ---------------- */
    document.addEventListener('keydown', function (e) {
      if (!abierto) return;
      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
      else if (e.key === '+' || e.key === '=') zoomEn(scale * 1.25, 0, 0);
      else if (e.key === '-') zoomEn(scale / 1.25, 0, 0);
      else if (e.key === '0') resetZoom();
    });

    /* ---------------- Escritorio: rueda, arrastre, clic ---------------- */
    elStage.addEventListener('wheel', function (e) {
      if (!abierto || esTactil) return;
      e.preventDefault();
      var r = elStage.getBoundingClientRect();
      zoomEn(
        scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15),
        e.clientX - r.left - r.width / 2,
        e.clientY - r.top - r.height / 2
      );
    }, { passive: false });

    var arrastrando = false, seArrastro = false, mx0 = 0, my0 = 0, tx0 = 0, ty0 = 0;
    elStage.addEventListener('mousedown', function (e) {
      if (!abierto || esTactil || scale <= 1) return;
      arrastrando = true; seArrastro = false;
      mx0 = e.clientX; my0 = e.clientY; tx0 = tx; ty0 = ty;
      elStage.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!arrastrando) return;
      tx = tx0 + (e.clientX - mx0);
      ty = ty0 + (e.clientY - my0);
      seArrastro = true;
      aplicar();
    });
    window.addEventListener('mouseup', function () {
      if (!arrastrando) return;
      arrastrando = false;
      elStage.style.cursor = scale > 1 ? 'grab' : '';
    });

    elStage.addEventListener('click', function (e) {
      if (!abierto || esTactil) return;
      if (seArrastro) { seArrastro = false; return; }
      if (e.target === elStage) cerrar();
    });

    elStage.addEventListener('dblclick', function (e) {
      if (!abierto || esTactil) return;
      if (scale > 1) { resetZoom(); return; }
      var r = elStage.getBoundingClientRect();
      zoomEn(2.5, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    });

    /* ---------------- Móvil: gestos táctiles ---------------- */
    var modo = null;
    var t0x = 0, t0y = 0, tlx = 0, tly = 0, t0 = 0, dyCerrar = 0;
    var p0 = 0, ps0 = 1, pcx = 0, pcy = 0;

    function dist(a, b) { return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY); }

    elStage.addEventListener('touchstart', function (e) {
      if (!abierto) return;
      if (e.touches.length === 2) {
        modo = 'pinch';
        p0 = dist(e.touches[0], e.touches[1]);
        ps0 = scale;
        var r = elStage.getBoundingClientRect();
        pcx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left - r.width / 2;
        pcy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top - r.height / 2;
      } else if (e.touches.length === 1) {
        var t = e.touches[0];
        t0x = tlx = t.clientX;
        t0y = tly = t.clientY;
        t0 = Date.now();
        modo = scale > 1 ? 'pan' : 'swipe';
      }
    }, { passive: true });

    elStage.addEventListener('touchmove', function (e) {
      if (!abierto || !modo) return;

      if (modo === 'pinch' && e.touches.length === 2) {
        e.preventDefault();
        zoomEn(ps0 * dist(e.touches[0], e.touches[1]) / p0, pcx, pcy);
        return;
      }

      if (modo === 'pan' && e.touches.length === 1) {
        e.preventDefault();
        tx += e.touches[0].clientX - tlx;
        ty += e.touches[0].clientY - tly;
        tlx = e.touches[0].clientX;
        tly = e.touches[0].clientY;
        aplicar();
        return;
      }

      if (modo === 'swipe' && e.touches.length === 1) {
        var dx = e.touches[0].clientX - t0x;
        var dy = e.touches[0].clientY - t0y;
        if (dy > 0 && Math.abs(dy) > Math.abs(dx)) modo = 'cerrar';
        else return;
      }

      if (modo === 'cerrar') {
        e.preventDefault();
        dyCerrar = Math.max(0, e.touches[0].clientY - t0y);
        elStage.style.transform = 'translateY(' + dyCerrar + 'px)';
        elStage.style.opacity = String(Math.max(.35, 1 - dyCerrar / 420));
      }
    }, { passive: false });

    function finToque(e) {
      if (!abierto || !modo) return;

      if (modo === 'pinch') { modo = null; if (scale <= 1) resetZoom(); return; }
      if (modo === 'pan') { modo = null; return; }

      if (modo === 'cerrar') {
        elStage.style.transform = '';
        elStage.style.opacity = '';
        var cerrarYa = dyCerrar > 110;
        dyCerrar = 0;
        modo = null;
        if (cerrarYa) cerrar();
        return;
      }

      var t = e.changedTouches[0];
      var dx = t.clientX - t0x;
      var dy = t.clientY - t0y;
      var absx = Math.abs(dx), absy = Math.abs(dy);
      modo = null;

      if (absx > 50 && absx > absy) { nav(dx < 0 ? 1 : -1); return; }
      if (absx < 12 && absy < 12 && Date.now() - t0 < 350) toque(t.clientX, t.clientY);
    }

    elStage.addEventListener('touchend', finToque, { passive: true });
    elStage.addEventListener('touchcancel', function () {
      elStage.style.transform = '';
      elStage.style.opacity = '';
      modo = null;
    }, { passive: true });

    var ultimoToque = 0, temporizador = null;
    function toque(x, y) {
      var ahora = Date.now();
      if (ahora - ultimoToque < 300) {
        clearTimeout(temporizador);
        ultimoToque = 0;
        if (scale > 1) {
          resetZoom();
        } else {
          var r = elStage.getBoundingClientRect();
          zoomEn(2.5, x - r.left - r.width / 2, y - r.top - r.height / 2);
        }
        return;
      }
      ultimoToque = ahora;
      temporizador = setTimeout(function () {
        if (Date.now() - ultimoToque >= 280) viewer.classList.toggle('vg-oculto');
        ultimoToque = 0;
      }, 290);
    }

    /* ---------------- Filtros ---------------- */
    if (filtros) {
      filtros.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var todos = filtros.querySelectorAll('button');
        for (var i = 0; i < todos.length; i++) todos[i].classList.toggle('active', todos[i] === b);
        pintarGrid(b.dataset.filter);
      });
    }

    pintarGrid('all');
  }

  window.VEIAgaleria = { init: init };
})();

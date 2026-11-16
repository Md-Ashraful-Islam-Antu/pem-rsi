/* ============================================================
   IPE 403 PEM Study Guide — Tab & Lightbox Logic
   ============================================================ */

// ── Tab System ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // ── Star badges ───────────────────────────────────────────────
  document.querySelectorAll('.tab-btn[data-stars]').forEach(btn => {
    const n = parseInt(btn.getAttribute('data-stars'));
    // Wrap existing text in a label span
    btn.innerHTML = '<span class="tab-label">' + btn.innerHTML + '</span>';
    const stars = document.createElement('span');
    stars.className = 'tab-stars';
    for (let i = 1; i <= 4; i++) {
      const s = document.createElement('span');
      s.className = i <= n ? 's-on' : 's-off';
      s.textContent = '★';
      stars.appendChild(s);
    }
    btn.appendChild(stars);
  });

  // ── Progress tracking ─────────────────────────────────────────
  const SKIP = new Set(['summary', 'pyq', 'cheatsheet']);
  const topicBtns = Array.from(document.querySelectorAll('.tab-btn[data-stars]'));
  const storageKey = 'visited_' + location.pathname;

  function getVisited() {
    try { return new Set(JSON.parse(sessionStorage.getItem(storageKey) || '[]')); } catch(e) { return new Set(); }
  }
  function saveVisited(set) {
    try { sessionStorage.setItem(storageKey, JSON.stringify([...set])); } catch(e) {}
  }
  function updateProgress() {
    const visited = getVisited();
    const fill  = document.getElementById('progressFill');
    const label = document.getElementById('progressLabel');
    const total = topicBtns.length;
    const done  = topicBtns.filter(b => visited.has(b.dataset.tab)).length;
    topicBtns.forEach(b => b.classList.toggle('visited', visited.has(b.dataset.tab)));
    if (fill)  fill.style.width = total ? (done / total * 100) + '%' : '0%';
    if (label) label.textContent = done + ' / ' + total + ' topics read';
  }

  // ── Tab switching ─────────────────────────────────────────────
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
      // persist selection
      try { sessionStorage.setItem('activeTab-' + location.pathname, target); } catch(e) {}
      // mark visited
      if (!SKIP.has(target)) {
        const v = getVisited();
        v.add(target);
        saveVisited(v);
        updateProgress();
      }
    });
  });

  updateProgress();

  // Restore last tab
  try {
    const saved = sessionStorage.getItem('activeTab-' + location.pathname);
    if (saved) {
      const btn = document.querySelector(`.tab-btn[data-tab="${saved}"]`);
      if (btn) btn.click();
    }
  } catch(e) {}

  // ── Lightbox ───────────────────────────────────────────────
  let lbImages = [];
  let lbIndex = 0;

  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');

  function openLightbox(imgs, idx) {
    lbImages = imgs;
    lbIndex = idx;
    showLbImage();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showLbImage() {
    if (!lbImages.length) return;
    lbImg.src = lbImages[lbIndex].src;
    lbCap.textContent = lbImages[lbIndex].caption || '';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImages = [];
  }

  if (lb) {
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    document.getElementById('lightbox-prev').addEventListener('click', () => {
      lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
      showLbImage();
    });
    document.getElementById('lightbox-next').addEventListener('click', () => {
      lbIndex = (lbIndex + 1) % lbImages.length;
      showLbImage();
    });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLbImage(); }
      if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; showLbImage(); }
    });
  }

  // ── Gallery init ───────────────────────────────────────────
  document.querySelectorAll('.slide-gallery').forEach(gallery => {
    const thumbs = Array.from(gallery.querySelectorAll('.slide-thumb'));
    const imgData = thumbs.map(t => ({
      src: t.querySelector('img').src,
      caption: t.querySelector('img').alt || t.querySelector('.slide-num')?.textContent || ''
    }));
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => openLightbox(imgData, i));
    });
  });

  // Single clickable images (book images)
  document.querySelectorAll('.img-book, .img-slide').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox([{ src: img.src, caption: img.alt || img.nextElementSibling?.textContent || '' }], 0);
    });
  });
});

// ── Scroll-to-top button (auto-inject) ───────────────────────
window.addEventListener('load', () => {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.title = 'Back to top';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '500',
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'var(--accent)', color: '#000', border: 'none',
    fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700',
    display: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.4)'
  });
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 400 ? 'block' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

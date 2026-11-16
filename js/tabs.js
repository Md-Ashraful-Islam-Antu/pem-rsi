/* ============================================================
   IPE 403 PEM Study Guide — Tab & Lightbox Logic
   ============================================================ */

// ── Tab System ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Chapter key from filename (e.g. "aa01", "ch03") ──────
  const chapterKey = location.pathname.replace(/.*\//, '').replace(/\.html$/, '');

  // ── Star badges ───────────────────────────────────────────
  document.querySelectorAll('.tab-btn[data-stars]').forEach(btn => {
    const n = parseInt(btn.getAttribute('data-stars'));
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

  // ── Progress tracking ─────────────────────────────────────
  const SKIP = new Set(['summary', 'pyq', 'cheatsheet']);
  const topicBtns = Array.from(document.querySelectorAll('.tab-btn[data-stars]'));

  // Register this chapter's total topic count so index.html can read it
  try { localStorage.setItem('pem_total_' + chapterKey, String(topicBtns.length)); } catch(e) {}

  // ── Visited state (localStorage, persists across sessions) ──
  const visitKey = 'pem_visited_' + chapterKey;
  function getVisited() {
    try { return new Set(JSON.parse(localStorage.getItem(visitKey) || '[]')); } catch(e) { return new Set(); }
  }
  function saveVisited(set) {
    try { localStorage.setItem(visitKey, JSON.stringify([...set])); } catch(e) {}
  }

  // ── Done state (explicit "Mark Complete", cross-page) ─────
  function doneStorKey(tabId) { return 'pem_done_' + chapterKey + '_' + tabId; }
  function isDone(tabId) { return localStorage.getItem(doneStorKey(tabId)) === '1'; }
  function setDone(tabId, val) {
    try {
      if (val) localStorage.setItem(doneStorKey(tabId), '1');
      else localStorage.removeItem(doneStorKey(tabId));
    } catch(e) {}
  }

  // ── Inject "Mark Complete" toggle into each topic panel ───
  topicBtns.forEach(btn => {
    const tabId = btn.dataset.tab;
    const panel = document.getElementById(tabId);
    if (!panel) return;
    const bar = document.createElement('div');
    bar.className = 'done-bar';
    bar.innerHTML = '<button class="done-btn" type="button" data-tid="' + tabId + '">'
      + '<span class="done-icon">○</span> Mark as Complete'
      + '</button>';
    panel.insertBefore(bar, panel.firstChild);
    bar.querySelector('.done-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.tid;
      setDone(id, !isDone(id));
      refreshUI();
    });
  });

  // ── Refresh all tab-btn visuals and done-btn text ─────────
  function refreshUI() {
    const visited = getVisited();
    topicBtns.forEach(btn => {
      const id = btn.dataset.tab;
      const done = isDone(id);
      const vis = visited.has(id);
      // .done class takes visual priority over .visited
      btn.classList.toggle('visited', vis && !done);
      btn.classList.toggle('done', done);

      const doneBtn = document.querySelector('.done-btn[data-tid="' + id + '"]');
      if (doneBtn) {
        doneBtn.classList.toggle('done', done);
        // innerHTML replaces children only — the click listener on doneBtn itself is preserved
        doneBtn.innerHTML = done
          ? '<span class="done-icon">✓</span> Completed!'
          : '<span class="done-icon">○</span> Mark as Complete';
      }
    });
    updateProgress();
  }

  function updateProgress() {
    const fill  = document.getElementById('progressFill');
    const label = document.getElementById('progressLabel');
    const total = topicBtns.length;
    const doneCount = topicBtns.filter(b => isDone(b.dataset.tab)).length;
    const vis = getVisited();
    const visCount = topicBtns.filter(b => vis.has(b.dataset.tab)).length;
    // Progress bar shows the larger of (done, visited) so it never goes backwards
    const progPct = total ? Math.round(Math.max(doneCount, visCount) / total * 100) : 0;
    if (fill)  fill.style.width = progPct + '%';
    if (label) label.textContent = doneCount + ' / ' + total + ' done';
  }

  // ── Tab switching ─────────────────────────────────────────
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
      // Persist active tab per chapter (localStorage so it restores across sessions)
      try { localStorage.setItem('pem_tab_' + chapterKey, target); } catch(e) {}
      // Mark visited
      if (!SKIP.has(target)) {
        const v = getVisited();
        v.add(target);
        saveVisited(v);
        refreshUI();
      }
    });
  });

  refreshUI();

  // Restore last active tab for this chapter
  try {
    const saved = localStorage.getItem('pem_tab_' + chapterKey);
    if (saved) {
      const btn = document.querySelector('.tab-btn[data-tab="' + saved + '"]');
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

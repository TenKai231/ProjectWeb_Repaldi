/* ============================================================ */
/*         MARKET PAGE JS — LEVIATHAN STORE                     */
/*         Abyss Arsenal Logic v1.0                             */
/* ============================================================ */

/* ─── CART ──────────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('lev_cart') || '[]');

function saveCart() {
  localStorage.setItem('lev_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('hidden', total === 0);
  }
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`✅ ${name} added to cart!`);
}

/* ─── TOAST ─────────────────────────────────────────────────── */
function showToast(msg) {
  let toast = document.getElementById('lev-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lev-toast';
    toast.style.cssText =
      'position:fixed;bottom:2rem;right:2rem;background:#0ff2;color:#fff;' +
      'border:1px solid #0ff6;padding:0.75rem 1.25rem;border-radius:8px;' +
      'font-family:Orbitron,sans-serif;font-size:0.75rem;z-index:9999;' +
      'backdrop-filter:blur(12px);transition:opacity 0.4s';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

/* ─── EXPAND CARD ───────────────────────────────────────────── */
function expandCard(btn) {
  const card = btn.closest('.product-card');
  card.classList.toggle('expanded');
  const icon = btn.querySelector('i');
  if (card.classList.contains('expanded')) {
    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    btn.innerHTML = btn.innerHTML.replace('SELENGKAPNYA', 'TUTUP');
  } else {
    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    btn.innerHTML = btn.innerHTML.replace('TUTUP', 'SELENGKAPNYA');
  }
}

/* ─── FILTER ────────────────────────────────────────────────── */
let activeKasta     = 'all';
let activeFormation = 'all';
let activeCategory  = 'all';
let activeSearch    = '';

function applyFilters() {
  const cards = document.querySelectorAll('.product-card');
  let visible = 0;

  cards.forEach(card => {
    const kasta     = card.dataset.kasta     || '';
    const formation = card.dataset.formation || '';
    const category  = card.dataset.category  || '';
    const name      = (card.querySelector('.card-name')?.textContent || '').toLowerCase();

    const matchK = activeKasta     === 'all' || kasta     === activeKasta;
    const matchF = activeFormation === 'all' || formation === activeFormation;
    const matchC = activeCategory  === 'all' || category  === activeCategory;
    const matchS = !activeSearch   || name.includes(activeSearch);

    const show = matchK && matchF && matchC && matchS;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Hide sections with no visible cards
  document.querySelectorAll('.kasta-section').forEach(sec => {
    const anyVisible = [...sec.querySelectorAll('.product-card')]
      .some(c => c.style.display !== 'none');
    sec.style.display = anyVisible ? '' : 'none';
  });

  // Hide territory gaps for hidden sections
  document.querySelectorAll('.territory-gap').forEach(gap => {
    const territory = gap.dataset.territory;
    const sec = document.getElementById(
      'section' + territory.charAt(0).toUpperCase() + territory.slice(1)
    );
    gap.style.display = (sec && sec.style.display !== 'none') ? '' : 'none';
  });

  const countEl = document.getElementById('filterCount');
  if (countEl) countEl.textContent = `Showing ${visible} item${visible !== 1 ? 's' : ''}`;
}

// Kasta filter
document.getElementById('filterKasta')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  document.querySelectorAll('#filterKasta .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeKasta = btn.dataset.filter;
  applyFilters();
});

// Formation filter
document.getElementById('filterFormation')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-formation]');
  if (!btn) return;
  document.querySelectorAll('#filterFormation .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFormation = btn.dataset.formation;
  applyFilters();
});

// Category filter
document.getElementById('filterCategory')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;
  document.querySelectorAll('#filterCategory .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.category;
  applyFilters();
});

// Clear all filters
function clearAllFilters() {
  activeKasta = activeFormation = activeCategory = 'all';
  activeSearch = '';
  document.querySelectorAll('.filter-btn').forEach(b => {
    if (b.dataset.filter === 'all' || b.dataset.formation === 'all' || b.dataset.category === 'all') {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  const si = document.getElementById('marketSearch');
  if (si) si.value = '';
  document.getElementById('searchClear')?.classList.add('hidden');
  document.getElementById('searchSuggestions')?.classList.add('hidden');
  applyFilters();
}

document.getElementById('clearAllFilters')?.addEventListener('click', clearAllFilters);

/* ─── SEARCH ─────────────────────────────────────────────────── */
const searchInput = document.getElementById('marketSearch');
const searchClearBtn = document.getElementById('searchClear');

searchInput?.addEventListener('input', () => {
  activeSearch = searchInput.value.trim().toLowerCase();
  searchClearBtn?.classList.toggle('hidden', !activeSearch);
  applyFilters();
});

searchClearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  activeSearch = '';
  searchClearBtn.classList.add('hidden');
  applyFilters();
});

/* ─── DEPTH GAUGE ───────────────────────────────────────────── */
function updateDepthGauge() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  const maxDepth  = 10000;
  const depth     = Math.round(pct * maxDepth);

  const fill  = document.getElementById('depthGaugeFill');
  const value = document.getElementById('depthCurrentValue');
  const bc    = document.getElementById('bcDepth');

  if (fill)  fill.style.height = (pct * 100) + '%';
  if (value) value.textContent = depth.toLocaleString('id-ID') + 'm';
  if (bc)    bc.textContent    = '— ' + depth.toLocaleString('id-ID') + 'm';

  // Active depth label
  const labels = [
    { id: 'dgNereid',    depth:     0 },
    { id: 'dgPoseidon',  depth:  3000 },
    { id: 'dgLeviathan', depth:  6000 },
    { id: 'dgSovereign', depth: 10000 },
  ];
  let active = labels[0];
  labels.forEach(l => { if (depth >= l.depth) active = l; });
  labels.forEach(l => {
    document.getElementById(l.id)?.classList.toggle('active', l.id === active.id);
  });
}

window.addEventListener('scroll', updateDepthGauge, { passive: true });
updateDepthGauge();

/* ─── ABYSSAL DARK MODE TOGGLE ──────────────────────────────── */
const abyssToggle = document.getElementById('abyssToggle');
const sonar       = document.getElementById('sonarAmbient');
let abyssOn = false;

abyssToggle?.addEventListener('click', () => {
  abyssOn = !abyssOn;
  document.body.classList.toggle('abyss-mode', abyssOn);
  abyssToggle.classList.toggle('active', abyssOn);
  if (abyssOn) {
    sonar?.play().catch(() => {});
  } else {
    sonar?.pause();
  }
});

/* ─── STICKY HEADER SHADOW ──────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('marketHeader')?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ─── AUTH ───────────────────────────────────────────────────── */
(function checkAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('lev_user') || 'null');
    const container = document.getElementById('authContainer');
    if (user && container) {
      container.innerHTML = `
        <span class="tool-btn" style="cursor:default;font-size:0.7rem;opacity:0.8">${user.name || 'Hunter'}</span>
        <button class="tool-btn" title="Logout" onclick="localStorage.removeItem('lev_user');location.reload()">
          <i class="fas fa-sign-out-alt"></i>
        </button>`;
    }
  } catch (e) {}
})();

/* ─── INIT ───────────────────────────────────────────────────── */
updateCartBadge();

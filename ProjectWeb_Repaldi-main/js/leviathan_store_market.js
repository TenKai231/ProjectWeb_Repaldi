/* ============================================================ */
/*         MARKET PAGE JS — LEVIATHAN STORE                     */
/*         Abyss Arsenal Logic v2.0                             */
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
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
}

/* ─── EXPAND CARD ───────────────────────────────────────────── */
function expandCard(btn) {
  const card = btn.closest('.product-card');
  if (!card) return;

  card.classList.toggle('expanded');
  const icon = btn.querySelector('i');

  if (card.classList.contains('expanded')) {
    if (icon) {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    }
    btn.innerHTML = btn.innerHTML.replace('SELENGKAPNYA', 'TUTUP');
  } else {
    if (icon) {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
    btn.innerHTML = btn.innerHTML.replace('TUTUP', 'SELENGKAPNYA');
  }
}

/* ─── FILTER STATE ──────────────────────────────────────────── */
let activeKasta = 'all';
let activeFormation = 'all';
let activeCategory = 'all';
let activeSearch = '';

function applyFilters() {
  const cards = document.querySelectorAll('.product-card');
  let visible = 0;

  cards.forEach(card => {
    const kasta = card.dataset.kasta || '';
    const formation = card.dataset.formation || '';
    const category = card.dataset.category || '';
    const name = (card.querySelector('.card-name')?.textContent || '').toLowerCase();

    const matchK = activeKasta === 'all' || kasta === activeKasta;
    const matchF = activeFormation === 'all' || formation === activeFormation;
    const matchC = activeCategory === 'all' || category === activeCategory;
    const matchS = !activeSearch || name.includes(activeSearch);

    const show = matchK && matchF && matchC && matchS;
    card.style.display = show ? '' : 'none';

    if (show) visible++;
  });

  /* Hide section jika semua card di dalamnya tersembunyi */
  document.querySelectorAll('.kasta-section').forEach(section => {
    const anyVisible = [...section.querySelectorAll('.product-card')]
      .some(card => card.style.display !== 'none');

    section.style.display = anyVisible ? '' : 'none';
  });

  /* Hide territory gap kalau section berikutnya ikut hilang */
  document.querySelectorAll('.territory-gap').forEach(gap => {
    const territory = gap.dataset.territory;
    if (!territory) return;

    const sectionId =
      'section' + territory.charAt(0).toUpperCase() + territory.slice(1);

    const section = document.getElementById(sectionId);
    gap.style.display = section && section.style.display !== 'none' ? '' : 'none';
  });

  const countEl = document.getElementById('filterCount');
  if (countEl) {
    countEl.textContent = `Showing ${visible} item${visible !== 1 ? 's' : ''}`;
  }
}

/* ─── FILTER ACTIONS ────────────────────────────────────────── */
document.getElementById('filterKasta')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;

  document.querySelectorAll('#filterKasta .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeKasta = btn.dataset.filter || 'all';
  applyFilters();
});

document.getElementById('filterFormation')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-formation]');
  if (!btn) return;

  document.querySelectorAll('#filterFormation .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeFormation = btn.dataset.formation || 'all';
  applyFilters();
});

document.getElementById('filterCategory')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;

  document.querySelectorAll('#filterCategory .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeCategory = btn.dataset.category || 'all';
  applyFilters();
});

function clearAllFilters() {
  activeKasta = 'all';
  activeFormation = 'all';
  activeCategory = 'all';
  activeSearch = '';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isAllButton =
      btn.dataset.filter === 'all' ||
      btn.dataset.formation === 'all' ||
      btn.dataset.category === 'all';

    btn.classList.toggle('active', isAllButton);
  });

  const searchInput = document.getElementById('marketSearch');
  if (searchInput) searchInput.value = '';

  document.getElementById('searchClear')?.classList.add('hidden');
  document.getElementById('searchSuggestions')?.classList.add('hidden');

  applyFilters();
}

document.getElementById('clearAllFilters')?.addEventListener('click', clearAllFilters);

/* ─── SEARCH ────────────────────────────────────────────────── */
const searchInput = document.getElementById('marketSearch');
const searchClearBtn = document.getElementById('searchClear');

searchInput?.addEventListener('input', () => {
  activeSearch = searchInput.value.trim().toLowerCase();
  searchClearBtn?.classList.toggle('hidden', !activeSearch);
  applyFilters();
});

searchClearBtn?.addEventListener('click', () => {
  if (!searchInput) return;

  searchInput.value = '';
  activeSearch = '';
  searchClearBtn.classList.add('hidden');
  document.getElementById('searchSuggestions')?.classList.add('hidden');
  applyFilters();
});

/* ─── DEPTH GAUGE ───────────────────────────────────────────── */
function updateDepthGauge() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  const maxDepth = 10000;
  const depth = Math.round(pct * maxDepth);

  const fill = document.getElementById('depthGaugeFill');
  const value = document.getElementById('depthCurrentValue');
  const bc = document.getElementById('bcDepth');

  if (fill) {
    fill.style.height = `${pct * 100}%`;

    let color;
    if (depth < 2000) {
      color = 'var(--nereid-color)';
    } else if (depth < 5500) {
      color = '#9b59b6';
    } else if (depth < 9000) {
      color = 'var(--leviathan-color)';
    } else {
      color = 'var(--sovereign-color)';
    }

    fill.style.background = color;
  }

  if (value) value.textContent = `${depth.toLocaleString('id-ID')}m`;
  if (bc) bc.textContent = `— ${depth.toLocaleString('id-ID')}m`;

  const labels = [
    { id: 'dgNereid', depth: 0 },
    { id: 'dgPoseidon', depth: 2000 },
    { id: 'dgLeviathan', depth: 5500 },
    { id: 'dgSovereign', depth: 9000 }
  ];

  let active = labels[0];
  labels.forEach(label => {
    if (depth >= label.depth) active = label;
  });

  labels.forEach(label => {
    const el = document.getElementById(label.id);
    if (el) el.classList.toggle('active', label.id === active.id);
  });
}

/* ─── AUTO HIDE HEADER + FILTER BAR ─────────────────────────── */
const header = document.getElementById('marketHeader');
const filterBar = document.getElementById('filterBar');

let lastScrollY = window.scrollY;
const scrollThreshold = 8;

function handleHeaderAndFilterVisibility() {
  const currentScrollY = window.scrollY;
  const scrollDiff = currentScrollY - lastScrollY;

  if (Math.abs(scrollDiff) < scrollThreshold) return;

  /* Selalu tampil di atas halaman */
  if (currentScrollY <= 10) {
    header?.classList.remove('header-hidden');
    filterBar?.classList.remove('filter-hidden');
    filterBar?.classList.remove('header-hidden-state');
    lastScrollY = currentScrollY;
    return;
  }

  const isScrollingDown = scrollDiff > 0;
  const isScrollingUp = scrollDiff < 0;

  if (isScrollingDown && currentScrollY > 120) {
    header?.classList.add('header-hidden');
    filterBar?.classList.add('filter-hidden');
    filterBar?.classList.add('header-hidden-state');
  } else if (isScrollingUp) {
    header?.classList.remove('header-hidden');
    filterBar?.classList.remove('filter-hidden');
    filterBar?.classList.remove('header-hidden-state');
  }

  lastScrollY = currentScrollY;
}

/* ─── HEADER SHADOW ─────────────────────────────────────────── */
function updateHeaderShadow() {
  header?.classList.toggle('scrolled', window.scrollY > 10);
}

/* ─── ABYSSAL DARK MODE TOGGLE ──────────────────────────────── */
const abyssToggle = document.getElementById('abyssToggle');
const sonar = document.getElementById('sonarAmbient');
let abyssOn = false;

abyssToggle?.addEventListener('click', async () => {
  abyssOn = !abyssOn;
  document.body.classList.toggle('abyss-mode', abyssOn);
  abyssToggle.classList.toggle('active', abyssOn);

  if (abyssOn) {
    try {
      await sonar?.play();
    } catch (err) {
      /* abaikan error autoplay */
    }
  } else {
    sonar?.pause();
  }
});

/* ─── AUTH ──────────────────────────────────────────────────── */
(function checkAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('lev_user') || 'null');
    const container = document.getElementById('authContainer');

    if (user && container) {
      container.innerHTML = `
        <span class="tool-btn" style="cursor:default;font-size:0.7rem;opacity:0.8">
          ${user.name || 'Hunter'}
        </span>
        <button
          class="tool-btn"
          title="Logout"
          onclick="localStorage.removeItem('lev_user'); location.reload();"
        >
          <i class="fas fa-sign-out-alt"></i>
        </button>
      `;
    }
  } catch (e) {
    console.warn('Auth check failed:', e);
  }
})();

/* ─── SCROLL LISTENERS ──────────────────────────────────────── */
window.addEventListener('scroll', () => {
  handleHeaderAndFilterVisibility();
  updateHeaderShadow();
  updateDepthGauge();
}, { passive: true });

/* ─── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  applyFilters();
  updateDepthGauge();
  updateHeaderShadow();

  header?.classList.remove('header-hidden');
  filterBar?.classList.remove('filter-hidden');
  filterBar?.classList.remove('header-hidden-state');
});
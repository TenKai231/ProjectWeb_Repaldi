/* ============================================================ */
/*            HOME PAGE JS START - LEVIATHAN STORE              */
/*              Absolute Apex Performance v1.0                  */
/* ============================================================ */

'use strict';

/* ============================================================ */
/* SECTION 1: KONSTANTA & STATE                                 */
/* ============================================================ */

const HOME_STATE = {
  currentSlide:    0,
  totalSlides:     3,
  sliderTimer:     null,
  sliderPaused:    false,
  searchTimer:     null,
  cartItems:       [],
  toastTimer:      null,
};

// ✏️ EDIT: Sesuaikan nama file halaman lain jika berbeda
const PAGES = {
  login:     'leviathan_store_login.html',
  market:    'leviathan_store_market.html',
  transaksi: 'leviathan_store_transaksi.html',
  user:      'leviathan_store_user.html',
  other:     'leviathan_store_other.html',
};

// Key localStorage
const LS_LOGGED_IN = 'isLoggedIn';
const LS_EMAIL     = 'userEmail';
const LS_NAME      = 'userName';
const LS_CART      = 'leviathanCart';

/* ============================================================ */
/* SECTION 2: DATA PRODUK UNTUK SEARCH SUGGESTION              */
/* Array produk lengkap untuk smart search bar                 */
/* ============================================================ */

const PRODUCTS_DATA = [
  // ── CONSOLE (Nereid) ──────────────────────────────────────
  { id: 'nintendo_switch_2',  name: 'Nintendo Switch 2',         kasta: 'nereid',    category: 'console',   price: 'Rp 5.499.000',  img: '../assets/console/nintendo_swicth_2.jpg' },
  { id: 'ps5_pro',            name: 'PS5 Pro',                   kasta: 'nereid',    category: 'console',   price: 'Rp 9.999.000',  img: '../assets/console/ps_5_pro.jpg' },
  { id: 'rog_ally_x',         name: 'ROG Ally X',                kasta: 'nereid',    category: 'console',   price: 'Rp 12.999.000', img: '../assets/console/rog_ally_x.jpg' },
  { id: 'steam_deck_oled',    name: 'Steam Deck OLED',           kasta: 'nereid',    category: 'console',   price: 'Rp 7.499.000',  img: '../assets/console/steam_deck_oled.jpg' },
  { id: 'xbox_series_x',      name: 'Xbox Series X',             kasta: 'nereid',    category: 'console',   price: 'Rp 7.999.000',  img: '../assets/console/x.box_series_x.jpg' },

  // ── HANDPHONE NEREID ──────────────────────────────────────
  { id: 'infinix_gt30_pro',   name: 'Infinix GT 30 Pro',         kasta: 'nereid',    category: 'handphone', price: 'Rp 3.499.000',  img: '../assets/handphone/nereid/infinix_gt_30_pro.jpg' },
  { id: 'poco_x7_pro',        name: 'POCO X7 Pro',               kasta: 'nereid',    category: 'handphone', price: 'Rp 4.299.000',  img: '../assets/handphone/nereid/poco_x7_pro.jpg' },
  { id: 'tecno_pova7_ultra',  name: 'Tecno Pova 7 Ultra',        kasta: 'nereid',    category: 'handphone', price: 'Rp 3.999.000',  img: '../assets/handphone/nereid/tecno_pova7_ultra.jpg' },

  // ── HANDPHONE POSEIDON ────────────────────────────────────
  { id: 'vivo_iqoo_neo9',     name: 'Vivo iQOO Neo 9',           kasta: 'poseidon',  category: 'handphone', price: 'Rp 5.999.000',  img: '../assets/handphone/poseidon/vivo_iqoo_neo9.jpg' },
  { id: 'xiaomi_14t_pro',     name: 'Xiaomi 14T Pro',            kasta: 'poseidon',  category: 'handphone', price: 'Rp 7.499.000',  img: '../assets/handphone/poseidon/xiaomi_14t_pro.jpg' },
  { id: 'poco_f7_pro',        name: 'POCO F7 Pro',               kasta: 'poseidon',  category: 'handphone', price: 'Rp 6.499.000',  img: '../assets/handphone/poseidon/xiaomi_poco_f7_pro.jpg' },

  // ── HANDPHONE LEVIATHAN ───────────────────────────────────
  { id: 'rog_phone9_pro',     name: 'ASUS ROG Phone 9 Pro',      kasta: 'leviathan', category: 'handphone', price: 'Rp 14.999.000', img: '../assets/handphone/leviathan/asus_rog_phone_9_pro.jpg' },
  { id: 'samsung_s26_ultra',  name: 'Samsung Galaxy S26 Ultra',  kasta: 'leviathan', category: 'handphone', price: 'Rp 18.999.000', img: '../assets/handphone/leviathan/samsung_galaxy_s26_ultra_new.jpg' },
  { id: 'redmagic_11_pro',    name: 'ZTE Red Magic 11 Pro',      kasta: 'leviathan', category: 'handphone', price: 'Rp 12.999.000', img: '../assets/handphone/leviathan/zte_nubia_redmagic_11_pro.jpeg' },

  // ── LAPTOP NEREID ─────────────────────────────────────────
  { id: 'acer_aspire_lite',   name: 'Acer Aspire Lite AL14',     kasta: 'nereid',    category: 'laptop',    price: 'Rp 6.499.000',  img: '../assets/laptop/nereid/acer_aspire__lite_al14_51m.jpeg' },
  { id: 'asus_vivobook14',    name: 'ASUS Vivobook 14 A1404',    kasta: 'nereid',    category: 'laptop',    price: 'Rp 7.299.000',  img: '../assets/laptop/nereid/asus_vivobook_14_a1404.png' },
  { id: 'lenovo_ideapad3',    name: 'Lenovo IdeaPad Slim 3',     kasta: 'nereid',    category: 'laptop',    price: 'Rp 6.999.000',  img: '../assets/laptop/nereid/lenovo_ideapad_slim 3.jpeg' },

  // ── LAPTOP POSEIDON ───────────────────────────────────────
  { id: 'asus_tuf_a15',       name: 'ASUS TUF Gaming A15 2025',  kasta: 'poseidon',  category: 'laptop',    price: 'Rp 12.499.000', img: '../assets/laptop/poseidon/asus_tuf_gaming_a15_2025.jpeg' },
  { id: 'hp_victus16',        name: 'HP Victus 16',              kasta: 'poseidon',  category: 'laptop',    price: 'Rp 11.999.000', img: '../assets/laptop/poseidon/hp_victus_16.jpeg' },
  { id: 'lenovo_loq15',       name: 'Lenovo LOQ 15',             kasta: 'poseidon',  category: 'laptop',    price: 'Rp 13.499.000', img: '../assets/laptop/poseidon/lenovo_loq_15.jpeg' },

  // ── LAPTOP LEVIATHAN ──────────────────────────────────────
  { id: 'asus_zenbook_s14',   name: 'ASUS Zenbook S14 OLED',     kasta: 'leviathan', category: 'laptop',    price: 'Rp 19.999.000', img: '../assets/laptop/leviathan/asus_zenbook_s14_oled.jpeg' },
  { id: 'legion_slim5i',      name: 'Legion Slim 5i',            kasta: 'leviathan', category: 'laptop',    price: 'Rp 17.499.000', img: '../assets/laptop/leviathan/legion_slim_5i.jpeg' },
  { id: 'rog_zephyrus_g14',   name: 'ROG Zephyrus G14 2025',     kasta: 'leviathan', category: 'laptop',    price: 'Rp 29.999.000', img: '../assets/laptop/leviathan/rog_zephyrus_g14_2025.jpeg' },

  // ── SET PC SOVEREIGN ──────────────────────────────────────
  { id: 'set_red_comet',      name: 'Set Red Comet (ROG × Zaku II)',        kasta: 'leviathan', category: 'set_pc', price: 'Rp 70.000.000 – Rp 90.000.000',   img: '../assets/set_pc/set_leviathan_ zaku II.png' },
  { id: 'set_beast_mode',     name: 'Set Beast Mode (ROG × EVA-02)',        kasta: 'sovereign', category: 'set_pc', price: 'Rp 115.000.000 – Rp 135.000.000', img: '../assets/set_pc/set_sovereign_rog_eva.jpeg' },
  { id: 'set_eternal_melodies', name: 'Set Eternal Melodies (ROG × Miku)', kasta: 'sovereign', category: 'set_pc', price: 'Rp 85.000.000 – Rp 105.000.000',  img: '../assets/set_pc/set_sovereign_rog_hatsune_miku.jpeg' },
  { id: 'set_white_devil',    name: 'Set White Devil (ROG × Gundam)',       kasta: 'sovereign', category: 'set_pc', price: 'Rp 95.000.000 – Rp 120.000.000',  img: '../assets/set_pc/set_sovereign_rog_gundam.jpeg' },
];

/* ============================================================ */
/* SECTION 3: INISIALISASI SAAT DOM READY                      */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAuthContainer();
  initSlider();
  initSearchBar();
  initCartBadge();
  initMiniCart();
  initHeaderScroll();
  initBackToTop();
  initArsenalCards();
  checkLoginRedirect();
});

/* ============================================================ */
/* SECTION 4: AUTH CONTAINER                                   */
/* Cek localStorage — tampilkan profil pill atau login icon    */
/* ============================================================ */

function initAuthContainer() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;

  // ✅ BACA DARI sessionStorage (bukan localStorage)
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  const userEmail  = sessionStorage.getItem('userEmail');
  const userName   = sessionStorage.getItem('userName');

  if (isLoggedIn === 'true' && userEmail) {
    const initial     = (userName || userEmail).charAt(0).toUpperCase();
    const displayName = userName || userEmail.split('@')[0];

    authContainer.innerHTML = `
      <div class="user-profile-info" id="profilePill" title="Connected: ${userEmail}">
        <div class="user-initial">${initial}</div>
        <span class="user-email-text">${displayName}</span>
      </div>
    `;

    const profilePill = document.getElementById('profilePill');
    if (profilePill) {
      profilePill.addEventListener('click', () => {
        window.location.href = PAGES.user;
      });
    }
  } else {
    // 🔄 Kembalikan ke tombol login
    authContainer.innerHTML = `
      <a href="leviathan_store_login.html" class="tool-btn" title="Login" id="authButton">
        <i class="fas fa-user-circle"></i>
      </a>
    `;
  }
}

function checkLoginRedirect() {
  // Jika belum login dan ada elemen yang butuh auth, tidak perlu redirect
  // Home page bisa diakses tanpa login
}

/* ============================================================ */
/* SECTION 5: PRODUCT SLIDER                                   */
/* Auto-slide dengan dots & arrow navigation                   */
/* ============================================================ */

function initSlider() {
  const track    = document.getElementById('sliderTrack');
  const dots     = document.querySelectorAll('.dot');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  const container = document.querySelector('.product-slider-container');

  if (!track) return;

  // Set slide pertama aktif
  updateSlider(track, dots);

  // Auto slide setiap 4 detik
  HOME_STATE.sliderTimer = setInterval(() => {
    if (!HOME_STATE.sliderPaused) nextSlide(track, dots);
  }, 4000);

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide(track, dots);
    resetSliderTimer(track, dots);
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide(track, dots);
    resetSliderTimer(track, dots);
  });

  // Dots click
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      HOME_STATE.currentSlide = index;
      updateSlider(track, dots);
      resetSliderTimer(track, dots);
    });
  });

  // Pause saat hover
  if (container) {
    container.addEventListener('mouseenter', () => HOME_STATE.sliderPaused = true);
    container.addEventListener('mouseleave', () => HOME_STATE.sliderPaused = false);
  }

  // Touch/swipe support mobile
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide(track, dots);
        else prevSlide(track, dots);
        resetSliderTimer(track, dots);
      }
    }, { passive: true });
  }
}

function nextSlide(track, dots) {
  HOME_STATE.currentSlide = (HOME_STATE.currentSlide + 1) % HOME_STATE.totalSlides;
  updateSlider(track, dots);
}

function prevSlide(track, dots) {
  HOME_STATE.currentSlide = (HOME_STATE.currentSlide - 1 + HOME_STATE.totalSlides) % HOME_STATE.totalSlides;
  updateSlider(track, dots);
}

function updateSlider(track, dots) {
  // Geser track
  track.style.transform = `translateX(-${HOME_STATE.currentSlide * 100}%)`;

  // Update active class slide items
  const slides = track.querySelectorAll('.slide-item');
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === HOME_STATE.currentSlide);
  });

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === HOME_STATE.currentSlide);
  });
}

function resetSliderTimer(track, dots) {
  clearInterval(HOME_STATE.sliderTimer);
  HOME_STATE.sliderTimer = setInterval(() => {
    if (!HOME_STATE.sliderPaused) nextSlide(track, dots);
  }, 4000);
}

/* ============================================================ */
/* SECTION 6: SMART SEARCH BAR                                 */
/* Click to reveal — klik suggestion baru muncul gambar        */
/* ============================================================ */

function initSearchBar() {
  const input       = document.getElementById('globalSearch');
  const suggestions = document.getElementById('searchSuggestions');
  const clearBtn    = document.getElementById('searchClear');

  if (!input || !suggestions) return;

  input.addEventListener('input', () => {
    const query = input.value.trim();

    // Toggle clear button
    if (clearBtn) clearBtn.classList.toggle('hidden', query.length === 0);

    // Debounce search
    clearTimeout(HOME_STATE.searchTimer);
    if (query.length < 2) {
      suggestions.classList.add('hidden');
      return;
    }

    HOME_STATE.searchTimer = setTimeout(() => {
      const results = searchProducts(query);
      renderSuggestions(results, suggestions, input);
    }, 250);
  });

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.add('hidden');
      suggestions.classList.add('hidden');
      input.focus();
    });
  }

  // Enter key → ke market page dengan query
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `${PAGES.market}?search=${encodeURIComponent(input.value.trim())}`;
    }
    if (e.key === 'Escape') {
      suggestions.classList.add('hidden');
    }
  });

  // Tutup saat klik di luar
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      suggestions.classList.add('hidden');
    }
  });
}

function searchProducts(query) {
  const q = query.toLowerCase();
  return PRODUCTS_DATA.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.kasta.toLowerCase().includes(q)
  ).slice(0, 6);
}

function renderSuggestions(results, container, input) {
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 14px; font-size: 0.78rem; color: var(--text-gray); text-align: center;">
        No monsters found in the Abyss.
      </div>`;
    container.classList.remove('hidden');
    return;
  }

  results.forEach(product => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    // Saat di-klik → pergi ke market dengan ID produk
    item.addEventListener('click', () => {
      window.location.href = `${PAGES.market}?id=${product.id}`;
    });

    item.innerHTML = `
      <img src="${product.img}" alt="${product.name}"
           onerror="this.src='../assets/leviathan_store.png'">
      <div class="suggestion-item-info">
        <div class="suggestion-item-name">${highlightMatch(product.name, input.value)}</div>
        <div class="suggestion-item-kasta ${product.kasta}">${product.kasta.toUpperCase()} ◈ ${product.price}</div>
      </div>
    `;

    container.appendChild(item);
  });

  container.classList.remove('hidden');
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background:rgba(0,229,255,0.2);color:var(--monarch-blue);">$1</mark>');
}

/* ============================================================ */
/* SECTION 7: CART BADGE & MINI CART                           */
/* ============================================================ */

function initCartBadge() {
  updateCartBadge();
}

function updateCartBadge() {
  const badge    = document.getElementById('cartBadge');
  const cartData = localStorage.getItem(LS_CART);

  if (!badge) return;

  try {
    HOME_STATE.cartItems = cartData ? JSON.parse(cartData) : [];
  } catch {
    HOME_STATE.cartItems = [];
  }

  const totalItems = HOME_STATE.cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);

  if (totalItems > 0) {
    badge.textContent = totalItems > 99 ? '99+' : totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function initMiniCart() {
  const miniCartItems = document.getElementById('miniCartItems');
  const miniCartTotal = document.getElementById('miniCartTotal');

  if (!miniCartItems || !miniCartTotal) return;

  if (HOME_STATE.cartItems.length === 0) {
    miniCartItems.innerHTML = '<p class="mini-cart-empty">Cart is empty, Hunter.</p>';
    miniCartTotal.textContent = 'Rp 0';
    return;
  }

  // Render max 3 item di mini cart
  const displayItems = HOME_STATE.cartItems.slice(0, 3);
  miniCartItems.innerHTML = displayItems.map(item => `
    <div class="mini-cart-item">
      <img src="${item.img || '../assets/leviathan_store.png'}"
           alt="${item.name}"
           onerror="this.src='../assets/leviathan_store.png'">
      <span class="mini-cart-item-name">${item.name}</span>
      <span class="mini-cart-item-price">${item.price}</span>
    </div>
  `).join('');

  if (HOME_STATE.cartItems.length > 3) {
    miniCartItems.innerHTML += `
      <div style="padding: 8px 14px; font-size: 0.7rem; color: var(--text-gray);">
        +${HOME_STATE.cartItems.length - 3} more items...
      </div>`;
  }

  // Hitung total (simple, tanpa parse harga kompleks)
  miniCartTotal.textContent = `${HOME_STATE.cartItems.length} item(s)`;
}

/* ============================================================ */
/* SECTION 8: HEADER SCROLL EFFECT                             */
/* ============================================================ */

function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ============================================================ */
/* SECTION 9: BACK TO TOP BUTTON                               */
/* ============================================================ */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.remove('hidden');
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
      setTimeout(() => {
        if (!btn.classList.contains('visible')) {
          btn.classList.add('hidden');
        }
      }, 300);
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================ */
/* SECTION 10: ARSENAL CARDS HOVER EFFECT                     */
/* ============================================================ */

function initArsenalCards() {
  const cards = document.querySelectorAll('.arsenal-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cards.forEach(c => {
        if (c !== card) c.style.opacity = '0.6';
      });
    });
    card.addEventListener('mouseleave', () => {
      cards.forEach(c => c.style.opacity = '1');
    });
  });
}

/* ============================================================ */
/* SECTION 11: NEWSLETTER HANDLER                              */
/* ============================================================ */

function handleNewsletter() {
  const input = document.getElementById('newsletterEmail');
  const note  = document.getElementById('newsletterNote');
  if (!input || !note) return;

  const email = input.value.trim();

  if (!validateEmail(email)) {
    note.textContent = '⚠ Enter a valid Hunter email address.';
    note.style.color = '#ff4444';
    return;
  }

  // ✏️ EDIT: Ganti dengan fetch() ke API newsletter kamu jika ada backend
  note.textContent = '✓ Transmission received. Welcome to the Abyss fleet!';
  note.style.color = '#00ff88';
  input.value = '';

  showToast('Newsletter subscription confirmed, Hunter!', 'success');

  // Simpan ke localStorage sebagai referensi
  localStorage.setItem('newsletterEmail', email);
}

/* ============================================================ */
/* SECTION 12: TOAST NOTIFICATION                              */
/* ============================================================ */

function showToast(message, type = 'info') {
  const toast  = document.getElementById('toastNotif');
  const msg    = document.getElementById('toastMsg');
  const iconEl = toast ? toast.querySelector('.toast-icon i') : null;

  if (!toast || !msg) return;

  msg.textContent = message;
  toast.className = 'toast show ' + type;

  if (iconEl) {
    iconEl.className = 'fas';
    if (type === 'success') iconEl.classList.add('fa-check-circle');
    else if (type === 'error') iconEl.classList.add('fa-times-circle');
    else if (type === 'warning') iconEl.classList.add('fa-exclamation-triangle');
    else iconEl.classList.add('fa-info-circle');
  }

  clearTimeout(HOME_STATE.toastTimer);
  HOME_STATE.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================================ */
/* SECTION 13: HELPER FUNCTIONS                                */
/* ============================================================ */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================ */
/*             HOME PAGE JS END - LEVIATHAN STORE               */
/* ============================================================ */
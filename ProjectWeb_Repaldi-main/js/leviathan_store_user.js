'use strict';

/* ============================================================ */
/* USER PAGE JS — LEVIATHAN STORE                               */
/* Hunter Terminal Interaction System                           */
/* ============================================================ */

const USER_STATE = {
  lastScrollY: window.scrollY,
  scrollThreshold: 8,
  toastTimer: null,

  searchIndex: [
    { title: 'Informasi Profil', section: 'profile', icon: 'fa-id-card' },
    { title: 'Riwayat Pesanan', section: 'orders', icon: 'fa-receipt' },
    { title: 'Wishlist Produk', section: 'wishlist', icon: 'fa-heart' },
    { title: 'Buku Alamat', section: 'address', icon: 'fa-location-dot' },
    { title: 'Pengaturan Akun', section: 'settings', icon: 'fa-gear' },
    { title: 'Keluar Akun', section: 'logout', icon: 'fa-right-from-bracket' },
  ],

  cyberAvatars: [
    'https://api.dicebear.com/7.x/bottts/svg?seed=LeviathanHunter&backgroundColor=020508&eyes=bulging,dizzy,eva,frame1&mouth=diagram,grill01,smile01',
    'https://api.dicebear.com/7.x/bottts/svg?seed=AbyssWalker&backgroundColor=020508&eyes=frame1,frame2,robocop&mouth=diagram,grill02',
    'https://api.dicebear.com/7.x/bottts/svg?seed=DeepTerminal&backgroundColor=020508&eyes=eva,glow,bulging&mouth=smile02,grill01',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberHunter&backgroundColor=020508&eyes=hearts,robocop,frame2&mouth=diagram,smile01',
  ],
};

function guardUserPage() {
  const user = localStorage.getItem('lev_user');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!user && !isLoggedIn) {
    window.location.href = 'leviathan_store_login.html';
  }
}

/* ============================================================ */
/* ORDERS FROM TRANSACTION PAGE                                 */
/* Membaca riwayat pesanan dari localStorage key: lev_orders     */
/* ============================================================ */

function getUserOrders() {
  try {
    return JSON.parse(localStorage.getItem('lev_orders') || '[]');
  } catch {
    return [];
  }
}

function formatOrderPrice(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function safeOrderText(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getOrderStatusIcon(status) {
  const cleanStatus = String(status || '').toLowerCase();

  if (cleanStatus.includes('delivered')) return 'fa-circle-check';
  if (cleanStatus.includes('shipped')) return 'fa-truck-fast';
  if (cleanStatus.includes('processing')) return 'fa-gear';

  return 'fa-clock';
}

function getOrderStatusClass(status) {
  const cleanStatus = String(status || 'processing').toLowerCase();

  if (cleanStatus.includes('delivered')) return 'delivered';
  if (cleanStatus.includes('shipped')) return 'shipped';
  if (cleanStatus.includes('processing')) return 'processing';

  return 'processing';
}

function renderUserOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  const orders = getUserOrders();

  if (!orders.length) {
    ordersList.innerHTML = `
      <article class="order-card">
        <div class="order-top">
          <div>
            <span class="order-id">NO CONTRACT FOUND</span>
            <h3>Belum Ada Pesanan</h3>
            <p>Pesanan yang dibuat dari halaman transaksi akan muncul di sini.</p>
          </div>

          <span class="order-status processing">
            <i class="fas fa-clock"></i>
            Empty
          </span>
        </div>

        <div class="order-bottom">
          <strong>Total: Rp 0</strong>
          <a href="leviathan_store_market.html" class="btn-user-ghost small">
            <span>BELANJA</span>
            <i class="fas fa-store"></i>
          </a>
        </div>
      </article>
    `;
    return;
  }

  ordersList.innerHTML = orders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const firstItem = items[0]?.name || 'Unknown Product';
    const itemCount = items.reduce((sum, item) => sum + Number(item.qty || 1), 0);
    const status = order.status || 'Processing';
    const statusClass = getOrderStatusClass(status);
    const statusIcon = getOrderStatusIcon(status);

    return `
      <article class="order-card">
        <div class="order-top">
          <div>
            <span class="order-id">ORDER #${safeOrderText(order.id)}</span>
            <h3>${safeOrderText(firstItem)}</h3>
            <p>${safeOrderText(order.dateText || '-')} • ${itemCount} item</p>
          </div>

          <span class="order-status ${statusClass}">
            <i class="fas ${statusIcon}"></i>
            ${safeOrderText(status)}
          </span>
        </div>

        <div class="order-timeline">
          <div class="timeline-step done">
            <span></span>
            <p>Pending</p>
          </div>

          <div class="timeline-step active">
            <span></span>
            <p>Processing</p>
          </div>

          <div class="timeline-step">
            <span></span>
            <p>Shipped</p>
          </div>

          <div class="timeline-step">
            <span></span>
            <p>Delivered</p>
          </div>
        </div>

        <div class="order-bottom">
          <strong>Total: ${formatOrderPrice(order.total)}</strong>

          <button class="btn-user-ghost small" type="button" onclick="showOrderDetail('${safeOrderText(order.id)}')">
            <span>DETAIL</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function showOrderDetail(orderId) {
  const orders = getUserOrders();
  const order = orders.find(item => item.id === orderId);

  if (!order) {
    showToast('Order tidak ditemukan.');
    return;
  }

  const items = Array.isArray(order.items)
    ? order.items.map(item => `• ${item.name} × ${item.qty}`).join('\n')
    : '-';

  alert(
`DETAIL PESANAN LEVIATHAN STORE

No Pesanan: ${order.id}
Tanggal: ${order.dateText}
Status: ${order.status}
Pembayaran: ${order.paymentName}
Pengiriman: ${order.shippingName}

Item:
${items}

Total: ${formatOrderPrice(order.total)}`
  );
}

/* ============================================================ */
/* INIT                                                         */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  guardUserPage();

  initHeaderScroll();
  initSidebarScrollSpy();
  initSearchTerminal();
  initCartBadge();
  initProfileData();
  initAvatarUpload();

renderUserOrders();

  initProfileForm();
  initAddressData();
  initAddressForm();
  initSettings();
  initPasswordForm();
  initWishlistRemove();
  initLogoutModal();
  initRevealAnimation();
  initBackToTop();
});

/* ============================================================ */
/* HEADER AUTO HIDE                                             */
/* ============================================================ */

function initHeaderScroll() {
  const header = document.getElementById('userHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const diff = currentY - USER_STATE.lastScrollY;

    header.classList.toggle('scrolled', currentY > 20);

    if (Math.abs(diff) < USER_STATE.scrollThreshold) return;

    if (currentY <= 10) {
      header.classList.remove('header-hidden');
      USER_STATE.lastScrollY = currentY;
      return;
    }

    if (diff > 0 && currentY > 140) {
      header.classList.add('header-hidden');
    } else if (diff < 0) {
      header.classList.remove('header-hidden');
    }

    USER_STATE.lastScrollY = currentY;
  }, { passive: true });
}

/* ============================================================ */
/* SIDEBAR SCROLL SPY                                           */
/* ============================================================ */

function initSidebarScrollSpy() {
  const sections = document.querySelectorAll('.u-section[id]');
  const links = document.querySelectorAll('.sidebar-link[data-section]');

  if (!sections.length || !links.length) return;

  const activateLink = (id) => {
    links.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visibleEntries.length > 0) {
      activateLink(visibleEntries[0].target.id);
    }
  }, {
    root: null,
    threshold: [0.25, 0.45, 0.65],
    rootMargin: '-90px 0px -45% 0px',
  });

  sections.forEach(section => observer.observe(section));

  links.forEach(link => {
    link.addEventListener('click', () => {
      activateLink(link.dataset.section);
    });
  });
}

/* ============================================================ */
/* SEARCH TERMINAL                                               */
/* ============================================================ */

function initSearchTerminal() {
  const input = document.getElementById('userSearch');
  const clearBtn = document.getElementById('searchClear');
  const suggestions = document.getElementById('searchSuggestions');

  if (!input || !clearBtn || !suggestions) return;

  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();

    clearBtn.classList.toggle('hidden', keyword.length === 0);

    if (!keyword) {
      suggestions.classList.add('hidden');
      suggestions.innerHTML = '';
      return;
    }

    const results = USER_STATE.searchIndex.filter(item => {
      return item.title.toLowerCase().includes(keyword) ||
             item.section.toLowerCase().includes(keyword);
    });

    renderSearchSuggestions(results, suggestions);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    suggestions.classList.add('hidden');
    suggestions.innerHTML = '';
    input.focus();
  });

  document.addEventListener('click', (event) => {
    const clickedInside =
      event.target.closest('.search-container') ||
      event.target.closest('#searchSuggestions');

    if (!clickedInside) {
      suggestions.classList.add('hidden');
    }
  });
}

function renderSearchSuggestions(results, container) {
  if (!results.length) {
    container.innerHTML = `
      <div class="suggestion-item">
        <i class="fas fa-circle-exclamation"></i>
        <span>No terminal entry found</span>
      </div>
    `;
    container.classList.remove('hidden');
    return;
  }

  container.innerHTML = results.map(item => `
    <button class="suggestion-item" type="button" data-target="${item.section}">
      <i class="fas ${item.icon}"></i>
      <span>${item.title}</span>
    </button>
  `).join('');

  container.classList.remove('hidden');

  container.querySelectorAll('.suggestion-item[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      container.classList.add('hidden');

      const input = document.getElementById('userSearch');
      const clearBtn = document.getElementById('searchClear');

      if (input) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
    });
  });
}

/* ============================================================ */
/* CART BADGE                                                    */
/* ============================================================ */

function initCartBadge() {
  updateCartBadge();
  window.addEventListener('storage', updateCartBadge);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const cart = getCartItems();
  const total = cart.reduce((sum, item) => {
    const qty = Number(item.qty || item.quantity || 1);
    return sum + qty;
  }, 0);

  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);
}

function getCartItems() {
  const possibleKeys = ['lev_cart', 'leviathanCart'];

  for (const key of possibleKeys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');

      if (Array.isArray(data) && data.length) return data;
    } catch (error) {
      console.warn(`Cart data at ${key} is invalid`, error);
    }
  }

  return [];
}

/* ============================================================ */
/* PROFILE DATA                                                  */
/* ============================================================ */

function initProfileData() {
  const user = getStoredUser();

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');

  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (phoneInput) phoneInput.value = user.phone || '';

  updateProfileDisplay(user);
}

function getStoredUser() {
  let levUser = null;

  try {
    levUser = JSON.parse(localStorage.getItem('lev_user') || 'null');
  } catch (error) {
    levUser = null;
  }

  const legacyName = localStorage.getItem('userName');
  const legacyEmail = localStorage.getItem('userEmail');

  return {
    name: levUser?.name || legacyName || 'Hunter',
    email: levUser?.email || legacyEmail || 'hunter@leviathan.store',
    phone: levUser?.phone || localStorage.getItem('userPhone') || '',
    avatar: levUser?.avatar || localStorage.getItem('userAvatar') || '',
  };
}

function saveStoredUser(user) {
  localStorage.setItem('lev_user', JSON.stringify(user));

  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userName', user.name);
  localStorage.setItem('userEmail', user.email);
  localStorage.setItem('userPhone', user.phone || '');

  if (user.avatar) {
    localStorage.setItem('userAvatar', user.avatar);
  }
}

function updateProfileDisplay(user) {
  const displayName = document.getElementById('profileDisplayName');
  const displayEmail = document.getElementById('profileDisplayEmail');
  const avatarImage = document.getElementById('avatarImage');
  const avatarInitial = document.getElementById('avatarInitial');

  if (displayName) displayName.textContent = user.name || 'Hunter';
  if (displayEmail) displayEmail.textContent = user.email || 'hunter@leviathan.store';

  const initial = (user.name || user.email || 'Hunter').charAt(0).toUpperCase();

  if (avatarInitial) avatarInitial.textContent = initial;

  if (avatarImage && avatarInitial) {
    if (user.avatar) {
      avatarImage.src = user.avatar;
      avatarImage.classList.remove('hidden');
      avatarInitial.classList.add('hidden');
    } else {
      avatarImage.removeAttribute('src');
      avatarImage.classList.add('hidden');
      avatarInitial.classList.remove('hidden');
    }
  }
}

/* ============================================================ */
/* AVATAR                                                        */
/* ============================================================ */

function initAvatarUpload() {
  const upload = document.getElementById('avatarUpload');
  const generateBtn = document.getElementById('generateAvatarBtn');

  if (upload) {
    upload.addEventListener('change', handleAvatarUpload);
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateCyberAvatar);
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('File harus berupa gambar.', 'error');
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const user = getStoredUser();
    user.avatar = reader.result;
    saveStoredUser(user);
    updateProfileDisplay(user);
    showToast('Foto profil berhasil diupload.');
  };

  reader.readAsDataURL(file);
}

function generateCyberAvatar() {
  const user = getStoredUser();
  const randomIndex = Math.floor(Math.random() * USER_STATE.cyberAvatars.length);

  user.avatar = `${USER_STATE.cyberAvatars[randomIndex]}&t=${Date.now()}`;

  saveStoredUser(user);
  updateProfileDisplay(user);
  showToast('Cyber avatar berhasil dibuat.');
}

/* ============================================================ */
/* PROFILE FORM                                                  */
/* ============================================================ */

function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('profileName')?.value.trim();
    const email = document.getElementById('profileEmail')?.value.trim();
    const phone = document.getElementById('profilePhone')?.value.trim();

    if (!name || !email) {
      showToast('Nama dan email wajib diisi.', 'error');
      return;
    }

    const user = getStoredUser();

    user.name = name;
    user.email = email;
    user.phone = phone || '';

    saveStoredUser(user);
    updateProfileDisplay(user);
    showToast('Profil berhasil disimpan.');
  });
}

/* ============================================================ */
/* ADDRESS                                                       */
/* ============================================================ */

function initAddressData() {
  const address = getStoredAddress();

  const nameInput = document.getElementById('addrName');
  const phoneInput = document.getElementById('addrPhone');
  const fullInput = document.getElementById('addrFull');

  if (nameInput) nameInput.value = address.name || '';
  if (phoneInput) phoneInput.value = address.phone || '';
  if (fullInput) fullInput.value = address.full || '';

  updateAddressPreview(address);
}

function getStoredAddress() {
  try {
    return JSON.parse(localStorage.getItem('lev_address') || 'null') || {
      name: '',
      phone: '',
      full: '',
    };
  } catch (error) {
    return {
      name: '',
      phone: '',
      full: '',
    };
  }
}

function saveStoredAddress(address) {
  localStorage.setItem('lev_address', JSON.stringify(address));
}

function updateAddressPreview(address) {
  const name = document.getElementById('addressName');
  const phone = document.getElementById('addressPhone');
  const full = document.getElementById('addressFull');

  if (!name || !phone || !full) return;

  if (!address.name && !address.phone && !address.full) {
    name.textContent = 'Belum Ada Alamat';
    phone.textContent = 'Nomor belum diatur';
    full.textContent = 'Silakan isi alamat utama kamu melalui form di samping.';
    return;
  }

  name.textContent = address.name || 'Nama belum diatur';
  phone.textContent = address.phone || 'Nomor belum diatur';
  full.textContent = address.full || 'Alamat belum lengkap';
}

function initAddressForm() {
  const form = document.getElementById('addressForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const address = {
      name: document.getElementById('addrName')?.value.trim() || '',
      phone: document.getElementById('addrPhone')?.value.trim() || '',
      full: document.getElementById('addrFull')?.value.trim() || '',
    };

    if (!address.name || !address.phone || !address.full) {
      showToast('Alamat belum lengkap.', 'error');
      return;
    }

    saveStoredAddress(address);
    updateAddressPreview(address);
    showToast('Alamat berhasil disimpan.');
  });
}

/* ============================================================ */
/* SETTINGS                                                      */
/* ============================================================ */

function initSettings() {
  const settings = getStoredSettings();

  const emailNotif = document.getElementById('emailNotif');
  const waNotif = document.getElementById('waNotif');
  const promoNotif = document.getElementById('promoNotif');

  if (emailNotif) emailNotif.checked = settings.emailNotif;
  if (waNotif) waNotif.checked = settings.waNotif;
  if (promoNotif) promoNotif.checked = settings.promoNotif;

  [emailNotif, waNotif, promoNotif].forEach(input => {
    if (!input) return;

    input.addEventListener('change', () => {
      saveStoredSettings({
        emailNotif: !!emailNotif?.checked,
        waNotif: !!waNotif?.checked,
        promoNotif: !!promoNotif?.checked,
      });

      showToast('Preferensi notifikasi diperbarui.');
    });
  });
}

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem('lev_settings') || 'null') || {
      emailNotif: true,
      waNotif: true,
      promoNotif: false,
    };
  } catch (error) {
    return {
      emailNotif: true,
      waNotif: true,
      promoNotif: false,
    };
  }
}

function saveStoredSettings(settings) {
  localStorage.setItem('lev_settings', JSON.stringify(settings));
}

function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword')?.value.trim();
    const newPassword = document.getElementById('newPassword')?.value.trim();

    if (!currentPassword || !newPassword) {
      showToast('Password lama dan baru wajib diisi.', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error');
      return;
    }

    localStorage.setItem('lev_password_dummy', newPassword);

    form.reset();
    showToast('Password dummy berhasil diperbarui.');
  });
}

/* ============================================================ */
/* WISHLIST                                                      */
/* ============================================================ */

/* ============================================================ */
/* WISHLIST — CONNECTED WITH MARKET                             */
/* ============================================================ */

function getStoredWishlist() {
  try {
    return JSON.parse(localStorage.getItem('lev_wishlist') || '[]');
  } catch (error) {
    return [];
  }
}

function saveStoredWishlist(items) {
  localStorage.setItem('lev_wishlist', JSON.stringify(items));
}

function initWishlistRemove() {
  renderUserWishlist();
}

function renderUserWishlist() {
  const grid = document.getElementById('wishlistGrid');
  if (!grid) return;

  const wishlist = getStoredWishlist();

  if (!wishlist.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-heart-crack"></i>
        <h3>Wishlist Kosong</h3>
        <p>Produk yang kamu simpan dari Market akan muncul di sini.</p>
        <a href="leviathan_store_market.html" class="btn-user-primary small">
          <span>BUKA MARKET</span>
          <i class="fas fa-store"></i>
        </a>
      </div>
    `;
    return;
  }

  grid.innerHTML = wishlist.map(item => `
    <article class="wishlist-card" data-id="${item.id}">
      <div class="wishlist-img">
        <img src="${item.img}" alt="${item.name}">
        <span class="wishlist-badge ${item.kasta || ''}">
          ${(item.kasta || 'SAVED').toUpperCase()}
        </span>
      </div>

      <div class="wishlist-body">
        <h3>${item.name}</h3>
        <p>${item.price}</p>

        <div class="wishlist-actions">
          <a href="leviathan_store_market.html#${getSectionByKasta(item.kasta)}" class="btn-user-primary small">
            <span>VIEW</span>
          </a>

          <button class="btn-user-ghost small" type="button" onclick="addWishlistItemToCart('${item.id}')">
            <i class="fas fa-cart-plus"></i>
          </button>

          <button class="btn-remove-wishlist" type="button" onclick="removeWishlistItem('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function getSectionByKasta(kasta) {
  const map = {
    nereid: 'sectionNereid',
    poseidon: 'sectionPoseidon',
    leviathan: 'sectionLeviathan',
    sovereign: 'sectionSovereign',
  };

  return map[kasta] || 'marketMain';
}

function removeWishlistItem(id) {
  const wishlist = getStoredWishlist();
  const updated = wishlist.filter(item => item.id !== id);

  saveStoredWishlist(updated);
  renderUserWishlist();
  showToast('Produk dihapus dari wishlist.');
}

function addWishlistItemToCart(id) {
  const wishlist = getStoredWishlist();
  const product = wishlist.find(item => item.id === id);

  if (!product) {
    showToast('Produk tidak ditemukan.', 'error');
    return;
  }

  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem('lev_cart') || '[]');
  } catch (error) {
    cart = [];
  }

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty = Number(existing.qty || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: 1,
    });
  }

  localStorage.setItem('lev_cart', JSON.stringify(cart));
  updateCartBadge();
  showToast('Produk ditambahkan ke keranjang.');
}

/* ============================================================ */
/* LOGOUT MODAL                                                  */
/* ============================================================ */

function initLogoutModal() {
  const modal = document.getElementById('logoutModal');
  const openBtn = document.getElementById('openLogoutModal');
  const cancelBtn = document.getElementById('cancelLogoutBtn');
  const confirmBtn = document.getElementById('confirmLogoutBtn');

  if (!modal || !openBtn || !cancelBtn || !confirmBtn) return;

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  openBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);

  modal.querySelectorAll('[data-close-logout]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

confirmBtn.addEventListener('click', () => {
  // Menghapus data login utama
  localStorage.removeItem('lev_user');

  // Menghapus data login cadangan / legacy
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userPicture');
  localStorage.removeItem('loginProvider');

  // Menghapus session aktif di tab browser
  sessionStorage.clear();

  showToast('Exit protocol activated.');

  setTimeout(() => {
    window.location.href = 'leviathan_store_login.html';
  }, 650);
});

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* ============================================================ */
/* REVEAL ANIMATION                                              */
/* ============================================================ */

function initRevealAnimation() {
  const elements = document.querySelectorAll('.reveal-section');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================ */
/* BACK TO TOP                                                   */
/* ============================================================ */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', window.scrollY <= 420);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

/* ============================================================ */
/* TOAST                                                         */
/* ============================================================ */

function showToast(message, type = 'success') {
  const toast = document.getElementById('userToast');
  if (!toast) return;

  const icon = toast.querySelector('i');
  const text = toast.querySelector('span');

  if (text) text.textContent = message;

  if (icon) {
    icon.className = type === 'error'
      ? 'fas fa-circle-exclamation'
      : 'fas fa-circle-check';
  }

  toast.classList.remove('hidden');
  toast.classList.toggle('error', type === 'error');

  clearTimeout(USER_STATE.toastTimer);

  USER_STATE.toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('error');
  }, 2400);
}
'use strict';
// ================================================================
//   AZURE AIR — HOME JS v2
// ================================================================

let authUser       = null;
let passengerCount = 1;
let currentTripType = 'sekali';

// ===== AUTH =====
function checkAuth() {
    const stored = localStorage.getItem('skyPassUser');
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u.loggedIn) { authUser = { firstName: u.name, email: u.email }; updateHeaderUI(); }
        } catch (_) {}
    }
}

function updateHeaderUI() {
    const authDiv  = document.getElementById('header-auth');
    const userPill = document.getElementById('user-pill');
    if (authUser) {
        authDiv.style.display  = 'none';
        userPill.style.display = 'flex';
        const initial = (authUser.firstName || authUser.email[0] || 'A').toUpperCase();
        document.getElementById('user-avatar-initial').textContent = initial;
        document.getElementById('user-pill-name').textContent      = authUser.firstName || authUser.email;
        document.getElementById('dd-name').textContent             = authUser.firstName || authUser.email;
        document.getElementById('dd-email').textContent            = authUser.email;
    } else {
        authDiv.style.display  = 'flex';
        userPill.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('skyPassUser');
    authUser = null; updateHeaderUI();
    showToast('Anda telah keluar dari akun 👋');
}

// ===== NAVIGATION =====
function navigateTo(page) {
    const pages = {
        'home'        : 'azureairhome.html',
        'jadwal'      : 'azureairjadwal.html',   // <-- fix ke jadwal baru
        'cek-pesanan' : 'azureaircekpesanan.html',
        'promo'       : 'azureairpromo.html',
        'bantuan'     : 'azureairHelp.html',
    };
    if (pages[page]) window.location.href = pages[page];
    else showToast('Halaman sedang dalam pengembangan 🔧', true);
}

function openAuthModal(tab = 'login') { window.location.href = 'azureairlogin.html'; }
function openProfilModal() {
    if (!authUser) { openAuthModal(); return; }
    showToast('Fitur profil akan segera hadir! 👤');
}

// ===== DROPDOWN =====
function toggleDropdown(e) {
    e.stopPropagation();
    document.getElementById('user-pill').classList.toggle('open');
}

// ===== TOAST =====
function showToast(msg, isError = false) {
    const toast   = document.getElementById('toast');
    const msgSpan = document.getElementById('toastMessage');
    const iconEl  = document.getElementById('toast-icon');
    if (!toast) return;
    msgSpan.textContent = msg;
    toast.classList.toggle('error', isError);
    iconEl.textContent  = isError ? '✕' : '✓';
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== BOOKING FORM =====
function changePax(delta) {
    passengerCount = Math.max(1, Math.min(9, passengerCount + delta));
    document.getElementById('pax-count').textContent = passengerCount;
}

function swapAirports() {
    const fromEl = document.getElementById('from-station');
    const toEl   = document.getElementById('to-station');
    [fromEl.value, toEl.value] = [toEl.value, fromEl.value];
    showToast('Rute dibalik! ✈');
}

// ===== ANIMASI PESAWAT SAAT SEARCH =====
function showPlaneLoader() {
    const overlay = document.getElementById('searchLoadingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hidePlaneLoader() {
    const overlay = document.getElementById('searchLoadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

function handleSearch(e) {
    e.preventDefault();
    const from  = document.getElementById('from-station').value;
    const to    = document.getElementById('to-station').value;
    const date  = document.getElementById('depart-date').value;
    const kelas = document.getElementById('seat-class').value;

    if (!from) { showToast('Pilih bandara asal terlebih dahulu ✈', true); return; }
    if (!to)   { showToast('Pilih bandara tujuan terlebih dahulu ✈', true); return; }
    if (from === to) { showToast('Bandara asal dan tujuan tidak boleh sama', true); return; }
    if (!date) { showToast('Pilih tanggal keberangkatan 📅', true); return; }

    const searchData = { from, to, date, passengerCount, kelas, tripType: currentTripType };
    localStorage.setItem('skySearchData', JSON.stringify(searchData));

    // Tampilkan animasi pesawat
    showPlaneLoader();

    // Redirect setelah 2 detik (cukup untuk lihat animasinya)
    setTimeout(() => {
        hidePlaneLoader();
        window.location.href = 'azureairjadwal.html';
    }, 2000);
}

function quickSearch(fromCode, toCode, fromName, toName) {
    document.getElementById('from-station').value = fromCode;
    document.getElementById('to-station').value   = toCode;
    showToast(`Rute ${fromName} → ${toName} dipilih ✈`);
    document.querySelector('.booking-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== TRIP TYPE TOGGLE =====
function initTripTabs() {
    document.querySelectorAll('.trip-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.trip-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTripType = this.dataset.trip;
            const returnGroup = document.getElementById('return-group');
            if (currentTripType === 'pulang') {
                returnGroup.style.display = 'flex';
                document.querySelector('.form-row-details').style.gridTemplateColumns = '1fr 1fr 1fr 1fr auto';
            } else {
                returnGroup.style.display = 'none';
                document.querySelector('.form-row-details').style.gridTemplateColumns = '1.4fr 1fr 1fr auto';
            }
        });
    });
}

// ===== STAT COUNTER dengan suffix =====
function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    let current   = 0;
    const increment = target / (1800 / 16);

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current) + suffix;
    }, 16);
}

function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = '1';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    stats.forEach(el => observer.observe(el));
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(43,143,232,.14)' : '';
    }, { passive: true });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const today = new Date().toISOString().split('T')[0];
    const departEl = document.getElementById('depart-date');
    const returnEl = document.getElementById('return-date');
    if (departEl) { departEl.value = today; departEl.min = today; }
    if (returnEl) { returnEl.min = today; }

    initTripTabs();
    initStatCounters();
    initHeaderScroll();

    document.addEventListener('click', () => {
        const pill = document.getElementById('user-pill');
        if (pill) pill.classList.remove('open');
    });
});

// Expose ke global
window.toggleDropdown  = toggleDropdown;
window.changePax       = changePax;
window.swapAirports    = swapAirports;
window.navigateTo      = navigateTo;
window.openAuthModal   = openAuthModal;
window.openProfilModal = openProfilModal;
window.logout          = logout;
window.handleSearch    = handleSearch;
window.quickSearch     = quickSearch;
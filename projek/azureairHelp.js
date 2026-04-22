'use strict';

// ================================================================
//   AZUREAIR HELP — JS
//   Tema : Modern Minimalis | Dominan Putih + Clear Blue
// ================================================================

// ==================== STATE ====================
let authUser = null;

// ==================== UTILS ====================
function getUsers()       { return JSON.parse(localStorage.getItem('sky_users') || '[]'); }
function saveUsers(u)     { localStorage.setItem('sky_users', JSON.stringify(u)); }
function findUser(email)  { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }
function isValidEmail(e)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

/**
 * Tampilkan notifikasi toast
 * @param {string}  msg  - Pesan yang ditampilkan
 * @param {boolean} ok   - true = sukses (biru), false = error (merah)
 */
function notify(msg, ok = true) {
    const el      = document.getElementById('notif');
    const msgSpan = document.getElementById('notif-msg');
    const icon    = el.querySelector('.notif-icon');

    msgSpan.textContent = msg;

    if (ok) {
        el.style.borderColor  = 'var(--border-card)';
        el.style.background   = 'var(--bg-card)';
        icon.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
        icon.textContent      = '✓';
        el.classList.remove('error');
    } else {
        el.style.borderColor  = 'rgba(224, 82, 82, 0.30)';
        el.style.background   = 'var(--bg-card)';
        icon.style.background = 'linear-gradient(135deg, #e05252, #c0392b)';
        icon.textContent      = '✕';
        el.classList.add('error');
    }

    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3500);
}

// ================================================================
//   AUTH MODAL
// ================================================================
function openModal(tab = 'login') {
    document.getElementById('auth-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
}

function closeModal() {
    document.getElementById('auth-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('auth-modal')) closeModal();
}

function switchTab(tab) {
    ['login', 'register'].forEach(t => {
        document.getElementById('tab-'   + t).classList.toggle('active', t === tab);
        document.getElementById('panel-' + t).classList.toggle('active', t === tab);
    });
    document.getElementById('modal-strip-subtitle').textContent =
        tab === 'login' ? 'Selamat datang kembali' : 'Buat akun gratis sekarang';
}

// ==================== LOGIN ====================
function submitLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        notify('Mohon isi email dan kata sandi', false);
        return;
    }

    if (!isValidEmail(email)) {
        notify('Format email tidak valid', false);
        return;
    }

    const user = findUser(email);

    if (user && user.password === btoa(password)) {
        authUser = user;
        updateHeaderAuth();
        closeModal();
        notify(`Selamat datang kembali, ${user.firstName || user.email}! 🎉`);
    } else {
        notify('Email atau kata sandi salah', false);
    }
}

// ==================== REGISTER ====================
function submitRegister() {
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!name) {
        notify('Nama lengkap tidak boleh kosong', false);
        return;
    }
    if (!isValidEmail(email)) {
        notify('Format email tidak valid', false);
        return;
    }
    if (password.length < 8) {
        notify('Kata sandi minimal 8 karakter', false);
        return;
    }
    if (findUser(email)) {
        notify('Email sudah terdaftar, silakan masuk', false);
        return;
    }

    const newUser = {
        firstName : name,
        email,
        password  : btoa(password),
        createdAt : new Date().toISOString()
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    authUser = newUser;
    updateHeaderAuth();
    closeModal();
    notify(`Selamat datang, ${name}! Akun berhasil dibuat 🎉`);
}

// ==================== HEADER AUTH STATE ====================
function updateHeaderAuth() {
    const ad = document.getElementById('header-auth');
    const up = document.getElementById('user-pill');

    if (authUser) {
        ad.style.display = 'none';
        up.style.display = 'flex';

        const initial = (authUser.firstName || authUser.email[0]).toUpperCase();
        document.getElementById('user-avatar-initial').textContent = initial;
        document.getElementById('user-pill-name').textContent      = authUser.firstName || authUser.email;
        document.getElementById('dd-name').textContent             = authUser.firstName || authUser.email;
        document.getElementById('dd-email').textContent            = authUser.email;
    } else {
        ad.style.display = 'flex';
        up.style.display = 'none';
    }
}

// ================================================================
//   DROPDOWN & PROFIL
// ================================================================
function toggleDropdown(e) {
    document.getElementById('user-pill').classList.toggle('open');
    e.stopPropagation();
}

function logout() {
    authUser = null;
    updateHeaderAuth();
    closeProfilModal();
    notify('Anda telah keluar dari akun 👋');
}

function openProfilModal() {
    if (!authUser) { openModal('login'); return; }

    document.getElementById('profil-avatar-big').textContent =
        (authUser.firstName || authUser.email[0]).toUpperCase();
    document.getElementById('profil-fullname').textContent  = authUser.firstName || authUser.email;
    document.getElementById('profil-email-disp').textContent = authUser.email;

    document.getElementById('profil-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProfilModal() {
    document.getElementById('profil-modal').classList.remove('active');
    document.body.style.overflow = '';
}

// ================================================================
//   NAVIGASI
// ================================================================
function navigateTo(page) {
    const pages = {
        'home'       : 'azureairhome.html',
        'jadwal'     : 'jadwal.html',
        'cek-pesanan': 'cek-pesanan.html',
        'promo-page' : 'promo.html',
        'bantuan'    : 'azureairHelp.html'
    };

    if (pages[page]) window.location.href = pages[page];
    else notify('Halaman sedang dalam pengembangan', false);
}

// ================================================================
//   FAQ DATA & RENDER
// ================================================================
const faqs = [
    {
        q: 'Bagaimana cara memesan tiket pesawat?',
        a: 'Pilih bandara asal dan tujuan, tentukan tanggal berangkat, kelas, dan jumlah penumpang, lalu klik "Cari Penerbangan". Pilih penerbangan, pilih kursi, isi data penumpang, dan selesaikan pembayaran. E-tiket akan dikirim ke email dan WhatsApp Anda.'
    },
    {
        q: 'Apakah saya bisa membatalkan atau reschedule tiket?',
        a: 'Ya, pembatalan dan reschedule dapat dilakukan maksimal 2 jam sebelum keberangkatan. Biaya pembatalan 25% dari harga tiket. Reschedule dikenakan biaya Rp 50.000 per tiket.'
    },
    {
        q: 'Kapan e-tiket saya dikirimkan?',
        a: 'E-tiket akan dikirim ke email dan WhatsApp Anda dalam 5 menit setelah pembayaran berhasil dikonfirmasi. Jika belum menerima, cek folder spam atau hubungi CS kami.'
    },
    {
        q: 'Bagaimana cara menggunakan kode promo?',
        a: 'Pada halaman "Data Penumpang", masukkan kode promo di kolom yang tersedia dan klik "Gunakan". Diskon akan otomatis diterapkan ke total pembayaran Anda.'
    },
    {
        q: 'Apa saja metode pembayaran yang tersedia?',
        a: 'Kami menerima transfer bank (BCA, BNI, Mandiri, BRI), dompet digital (GoPay, OVO, Dana, ShopeePay), QRIS, serta kartu kredit/debit Visa dan Mastercard.'
    },
    {
        q: 'Berapa lama waktu untuk menyelesaikan pembayaran?',
        a: 'Anda memiliki waktu 15 menit untuk menyelesaikan pembayaran setelah memilih metode bayar. Jika melebihi batas waktu, pesanan akan otomatis dibatalkan.'
    },
    {
        q: 'Kapan saya harus tiba di bandara?',
        a: 'Disarankan tiba minimal 90 menit sebelum penerbangan domestik dan 3 jam untuk penerbangan internasional. Check-in ditutup 30 menit sebelum keberangkatan.'
    },
    {
        q: 'Apakah anak-anak perlu membeli tiket?',
        a: 'Anak di atas 2 tahun diwajibkan membeli tiket penuh. Bayi di bawah 2 tahun dikenakan biaya 10% dari harga tiket, namun tidak mendapat kursi sendiri.'
    }
];

/** Render FAQ ke dalam container */
function renderFaq(items) {
    const container = document.getElementById('faq-container');

    if (!items.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:var(--text-soft)">
                <div style="font-size:2rem;margin-bottom:0.5rem">🔍</div>
                <p>Tidak ada hasil untuk pencarian tersebut.</p>
            </div>`;
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="faq-item" id="faq-${index}">
            <button class="faq-question" onclick="toggleFaq(${index})">
                <span>${item.q}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="faq-answer">${item.a}</div>
        </div>
    `).join('');
}

/** Toggle buka/tutup FAQ item */
function toggleFaq(index) {
    const item = document.getElementById(`faq-${index}`);
    // Tutup semua yang lain (accordion behaviour)
    document.querySelectorAll('.faq-item').forEach((el, i) => {
        if (i !== index) el.classList.remove('open');
    });
    item.classList.toggle('open');
}

/** Filter FAQ berdasarkan kata kunci */
function filterFaq(searchTerm) {
    const term     = searchTerm.toLowerCase().trim();
    const filtered = faqs.filter(f =>
        f.q.toLowerCase().includes(term) ||
        f.a.toLowerCase().includes(term)
    );
    renderFaq(filtered);
}

// ================================================================
//   INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Pulihkan sesi dari localStorage (kompatibel dengan format lama)
    const legacy = localStorage.getItem('skyPassUser');
    if (legacy) {
        try {
            const u = JSON.parse(legacy);
            if (u.loggedIn) {
                authUser = { firstName: u.name, email: u.email };
                updateHeaderAuth();
            }
        } catch (_) { /* abaikan jika data korup */ }
    }

    // Render FAQ awal
    renderFaq(faqs);

    // Event search input (di hero)
    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            term === '' ? renderFaq(faqs) : filterFaq(term);
        });
    }

    // Tutup dropdown saat klik di luar
    document.addEventListener('click', () => {
        const pill = document.getElementById('user-pill');
        if (pill) pill.classList.remove('open');
    });
});
'use strict';

// ================================================================
//   SKY EXPRESS LOGIN — JS
// ================================================================

// ==================== ELEMEN DOM ====================
const loginForm     = document.getElementById('loginForm');
const loginEmail    = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const rememberMe    = document.getElementById('rememberMe');
const forgotLink    = document.getElementById('forgotPasswordLink');
const submitBtn     = document.getElementById('submitBtn');

// ================================================================
//   TOGGLE VISIBILITY PASSWORD
//   Fix: mencari input di dalam .input-wrap yang sama dengan tombol,
//   bukan lewat parentElement (yang sekarang = input-wrap, sudah benar).
// ================================================================
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
        // input-wrap adalah parentElement langsung dari tombol ini
        const inputWrap = this.parentElement;
        const input     = inputWrap.querySelector('input');
        const icon      = this.querySelector('i');

        const isHidden = input.type === 'password';

        // Toggle tipe input
        input.type = isHidden ? 'text' : 'password';

        // Toggle ikon mata
        icon.classList.toggle('fa-eye',       !isHidden);
        icon.classList.toggle('fa-eye-slash',  isHidden);

        // Aksesibilitas
        this.setAttribute('aria-label',
            isHidden ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
        );

        // Fokus kembali ke input agar UX tetap nyaman
        input.focus();
    });
});

// ================================================================
//   VALIDASI
// ================================================================
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Tampilkan pesan error pada input tertentu */
function showInputError(inputEl, errorId, message) {
    inputEl.classList.add('error');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = message;
}

/** Hapus semua error */
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('.input-wrap input').forEach(input => {
        input.classList.remove('error');
    });
}

// ================================================================
//   TOAST NOTIFIKASI
//   type: 'success' | 'error' | 'info'
// ================================================================
function showToast(message, type = 'info') {
    const toast       = document.getElementById('toast');
    const msgSpan     = document.getElementById('toastMessage');
    const iconEl      = document.getElementById('toastIcon');

    if (!toast || !msgSpan) return;

    // Atur teks & ikon
    msgSpan.textContent = message;

    const iconMap = {
        success : 'fas fa-check-circle',
        error   : 'fas fa-exclamation-circle',
        info    : 'fas fa-info-circle',
    };

    iconEl.className = iconMap[type] || iconMap.info;

    // Atur kelas warna
    toast.className = `toast toast-${type}`;

    // Tampilkan
    toast.classList.add('show');

    // Auto-sembunyikan setelah 3,5 detik
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ================================================================
//   SUBMIT LOGIN
// ================================================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const emailVal    = loginEmail.value.trim();
    const passwordVal = loginPassword.value;
    let valid         = true;

    // Validasi email
    if (!emailVal) {
        showInputError(loginEmail, 'loginEmailError', 'Email tidak boleh kosong');
        valid = false;
    } else if (!isValidEmail(emailVal)) {
        showInputError(loginEmail, 'loginEmailError', 'Format email tidak valid');
        valid = false;
    }

    // Validasi password
    if (!passwordVal) {
        showInputError(loginPassword, 'loginPasswordError', 'Kata sandi tidak boleh kosong');
        valid = false;
    } else if (passwordVal.length < 6) {
        showInputError(loginPassword, 'loginPasswordError', 'Kata sandi minimal 6 karakter');
        valid = false;
    }

    if (!valid) return;

    // --- Loading state ---
    submitBtn.disabled    = true;
    submitBtn.innerHTML   = '<i class="fas fa-circle-notch fa-spin"></i> <span>Memproses...</span>';

    // Simulasi delay API (hapus/ganti dengan fetch nyata)
    await new Promise(resolve => setTimeout(resolve, 900));

    // Cek user dari localStorage (sistem lokal)
    const users    = JSON.parse(localStorage.getItem('sky_users') || '[]');
    const matchUser = users.find(u =>
        u.email.toLowerCase() === emailVal.toLowerCase() &&
        u.password === btoa(passwordVal)
    );

    if (matchUser || users.length === 0) {
        // Login berhasil (atau belum ada user = demo mode)
        const userData = {
            email    : emailVal,
            name     : matchUser?.firstName || emailVal.split('@')[0],
            loggedIn : true,
        };

        localStorage.setItem('skyPassUser', JSON.stringify(userData));

        if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', emailVal);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        showToast('Login berhasil! Mengalihkan halaman...', 'success');

        setTimeout(() => {
            window.location.href = 'azureairhome.html'; // sesuaikan nama file
        }, 1200);

    } else {
        // Login gagal
        showToast('Email atau kata sandi salah', 'error');
        showInputError(loginEmail,    'loginEmailError',    ' ');
        showInputError(loginPassword, 'loginPasswordError', 'Email atau kata sandi tidak cocok');

        // Reset tombol
        submitBtn.disabled  = false;
        submitBtn.innerHTML = '<span>Masuk</span><i class="fas fa-arrow-right"></i>';
    }
});

// ================================================================
//   LUPA KATA SANDI
// ================================================================
forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    const emailVal = loginEmail.value.trim();

    if (emailVal && isValidEmail(emailVal)) {
        showToast(`Tautan reset dikirim ke ${emailVal} (simulasi)`, 'info');
    } else {
        loginEmail.focus();
        showInputError(loginEmail, 'loginEmailError', 'Masukkan email yang valid terlebih dahulu');
        showToast('Masukkan email yang valid terlebih dahulu', 'error');
    }
});

// ================================================================
//   INIT — Saat halaman siap
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Isi email yang diingat
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
        loginEmail.value        = remembered;
        rememberMe.checked      = true;
        loginPassword.focus();   // langsung fokus ke password
    }

    // Jika sudah login, redirect langsung
    const stored = localStorage.getItem('skyPassUser');
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u.loggedIn) {
                window.location.href = 'azureairhome.html';
            }
        } catch (_) { /* data korup, abaikan */ }
    }

    // Hapus error saat user mulai mengetik
    [loginEmail, loginPassword].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errId  = input.id + 'Error';
            const errEl  = document.getElementById(errId);
            if (errEl) errEl.textContent = '';
        });
    });
});
'use strict';
// ================================================================
//   AZURE AIR — DAFTAR (REGISTER) JS
//   Fitur: multi-step form, validasi, password strength, Google auth
// ================================================================

// ===== ELEMEN DOM =====
const registerForm = document.getElementById('registerForm');
const submitBtn    = document.getElementById('submitBtn');

// ===== UTILS =====
function isValidEmail(e)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function isValidPhone(p)  { return /^[0-9]{8,13}$/.test(p.replace(/[\s-]/g, '')); }
function getUsers()       { return JSON.parse(localStorage.getItem('sky_users') || '[]'); }
function saveUsers(u)     { localStorage.setItem('sky_users', JSON.stringify(u)); }
function findUser(email)  { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }

// ===== TOAST =====
function showToast(message, type = 'info') {
    const toast   = document.getElementById('toast');
    const msgSpan = document.getElementById('toastMessage');
    const iconEl  = document.getElementById('toastIcon');
    if (!toast) return;
    msgSpan.textContent = message;
    const iconMap = { success:'fas fa-check-circle', error:'fas fa-exclamation-circle', info:'fas fa-info-circle' };
    iconEl.className = iconMap[type] || iconMap.info;
    toast.className = `toast toast-${type}`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== TOGGLE PASSWORD =====
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function () {
        const wrap  = this.parentElement;
        const input = wrap.querySelector('input');
        const icon  = this.querySelector('i');
        const hide  = input.type === 'password';
        input.type  = hide ? 'text' : 'password';
        icon.classList.toggle('fa-eye',      !hide);
        icon.classList.toggle('fa-eye-slash', hide);
        input.focus();
    });
});

// ===== PASSWORD STRENGTH =====
const pwInput       = document.getElementById('regPassword');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');
const pwLen         = document.getElementById('pwLen');
const pwNum         = document.getElementById('pwNum');
const pwUpper       = document.getElementById('pwUpper');

function checkPwStrength(pw) {
    const hasLen   = pw.length >= 8;
    const hasNum   = /\d/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasSpec  = /[!@#$%^&*(),.?":{}|<>]/.test(pw);

    // Update checklist
    toggleCheck(pwLen,   hasLen);
    toggleCheck(pwNum,   hasNum);
    toggleCheck(pwUpper, hasUpper);

    // Score 0-4
    const score = [hasLen, hasNum, hasUpper, hasSpec].filter(Boolean).length;
    const map = [
        { w:0,   bg:'transparent', label:'' },
        { w:25,  bg:'#e05252',     label:'Lemah' },
        { w:50,  bg:'#f5a623',     label:'Cukup' },
        { w:75,  bg:'#2B8FE8',     label:'Baik' },
        { w:100, bg:'#22c55e',     label:'Kuat' },
    ];
    const s = map[score];
    if (strengthFill) {
        strengthFill.style.width    = s.w + '%';
        strengthFill.style.background = s.bg;
    }
    if (strengthLabel) {
        strengthLabel.textContent = s.label;
        strengthLabel.style.color = s.bg;
    }
}

function toggleCheck(el, ok) {
    if (!el) return;
    el.classList.toggle('valid', ok);
    const icon = el.querySelector('i');
    if (icon) icon.className = ok ? 'fas fa-check-circle' : 'fas fa-circle-dot';
}

if (pwInput) pwInput.addEventListener('input', () => checkPwStrength(pwInput.value));

// ===== STEP LOGIC =====
let currentStep = 1;

function goToStep(step) {
    if (step === 2 && !validateStep1()) return;

    // Update dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (!dot) continue;
        dot.classList.remove('active', 'done');
        if (i < step)  dot.classList.add('done');
        if (i === step) dot.classList.add('active');
    }

    // Update panels
    document.querySelectorAll('.form-step').forEach((el, idx) => {
        el.classList.toggle('active', idx + 1 === step);
    });

    currentStep = step;
}

// ===== VALIDASI STEP 1 =====
function validateStep1() {
    clearErrors();
    let ok = true;

    const firstName = document.getElementById('regFirstName').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const phone     = document.getElementById('regPhone').value.trim();

    if (!firstName) {
        showErr('regFirstName', 'errFirstName', 'Nama depan tidak boleh kosong');
        ok = false;
    }
    if (!isValidEmail(email)) {
        showErr('regEmail', 'errEmail', 'Format email tidak valid');
        ok = false;
    } else if (findUser(email)) {
        showErr('regEmail', 'errEmail', 'Email sudah terdaftar, silakan masuk');
        ok = false;
    }
    if (!phone) {
        showErr('regPhone', 'errPhone', 'Nomor telepon tidak boleh kosong');
        ok = false;
    } else if (!isValidPhone(phone)) {
        showErr('regPhone', 'errPhone', 'Nomor telepon tidak valid');
        ok = false;
    }

    return ok;
}

// ===== VALIDASI STEP 2 =====
function validateStep2() {
    clearErrors();
    let ok = true;

    const pw      = document.getElementById('regPassword').value;
    const pwConf  = document.getElementById('regConfirmPassword').value;
    const terms   = document.getElementById('agreeTerms').checked;

    if (pw.length < 8) {
        showErr('regPassword', 'errPassword', 'Kata sandi minimal 8 karakter');
        ok = false;
    }
    if (pw !== pwConf) {
        showErr('regConfirmPassword', 'errConfirmPassword', 'Kata sandi tidak cocok');
        ok = false;
    }
    if (!terms) {
        const errEl = document.getElementById('errTerms');
        if (errEl) errEl.textContent = 'Anda harus menyetujui Syarat & Ketentuan';
        ok = false;
    }

    return ok;
}

function showErr(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errorId);
    if (input)  input.classList.add('error');
    if (errEl)  errEl.textContent = msg;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
}

// ===== REGISTER SUBMIT =====
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Membuat akun...</span>';

    await new Promise(resolve => setTimeout(resolve, 1000));

    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName  = document.getElementById('regLastName').value.trim();
    const email     = document.getElementById('regEmail').value.trim();
    const phone     = document.getElementById('regPhone').value.trim();
    const pw        = document.getElementById('regPassword').value;
    const birthDate = document.getElementById('regBirthDate').value;
    const gender    = document.querySelector('input[name="gender"]:checked')?.value || '';
    const referral  = document.getElementById('regReferral').value.trim();

    const newUser = {
        firstName,
        lastName,
        email,
        phone    : '+62' + phone,
        password : btoa(pw),
        birthDate,
        gender,
        referral,
        createdAt: new Date().toISOString(),
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    // Auto-login
    const sessionData = {
        email,
        name    : firstName + (lastName ? ' ' + lastName : ''),
        loggedIn: true,
    };
    localStorage.setItem('skyPassUser', JSON.stringify(sessionData));

    // Tampilkan step sukses
    const successName = document.getElementById('successName');
    if (successName) successName.textContent = `Halo, ${firstName}! 👋`;

    goToStep(3);
    showToast(`Akun berhasil dibuat! Selamat datang, ${firstName} 🎉`, 'success');

    // Redirect ke home setelah 2.5 detik
    setTimeout(() => { window.location.href = 'azureairhome.html'; }, 2500);
});

// ===== GOOGLE REGISTER =====
function handleGoogleRegister() {
    const btn = document.getElementById('googleBtn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Menghubungkan Google...</span>';

    setTimeout(() => {
        const userData = {
            email   : 'googleuser@gmail.com',
            name    : 'Google User',
            loggedIn: true,
            provider: 'google',
        };
        localStorage.setItem('skyPassUser', JSON.stringify(userData));
        showToast('Login dengan Google berhasil! ✅', 'success');
        setTimeout(() => { window.location.href = 'azureairhome.html'; }, 1200);
    }, 1500);
}

// ===== INPUT LIVE VALIDATION =====
function initLiveValidation() {
    const emailInput = document.getElementById('regEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const val = emailInput.value.trim();
            if (val && !isValidEmail(val)) {
                showErr('regEmail', 'errEmail', 'Format email tidak valid');
            } else if (val && findUser(val)) {
                showErr('regEmail', 'errEmail', 'Email sudah terdaftar');
            } else {
                emailInput.classList.remove('error');
                const errEl = document.getElementById('errEmail');
                if (errEl) errEl.textContent = '';
            }
        });
    }

    // Hapus error saat mengetik
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                input.classList.remove('error');
                const errId = input.id + 'Error';
                // simple lookup
                const errEl = document.querySelector(`[id="err${input.id.replace(/^reg/, '')}"]`);
                if (errEl) errEl.textContent = '';
            }
        });
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Sudah login → redirect
    const stored = localStorage.getItem('skyPassUser');
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u.loggedIn) { window.location.href = 'azureairhome.html'; }
        } catch (_) {}
    }

    initLiveValidation();

    // Google button
    const googleBtn = document.getElementById('googleBtn');
    if (googleBtn) googleBtn.addEventListener('click', handleGoogleRegister);
});

// Expose
window.goToStep = goToStep;
/* ============================================================ */
/*           LOGIN PAGE JS START - LEVIATHAN STORE              */
/*              System Identification Protocol v1.0             */
/* ============================================================ */
'use strict';
/* ============================================================ */
/* SECTION 1: KONSTANTA & STATE                                 */
/* ============================================================ */
const STATE = {
  currentTab:   'login',   // 'login' | 'register'
  isLoading:    false,
  typingTimer:  null,
};

// ✏️ EDIT: Ganti nama file home kamu jika berbeda
const HOME_PAGE    = 'leviathan_store_home.html';
const OTHER_PAGE   = 'leviathan_store_other.html';

// Key localStorage
const LS_LOGGED_IN = 'isLoggedIn';
const LS_EMAIL     = 'userEmail';
const LS_NAME      = 'userName';
const LS_REMEMBER  = 'rememberHunter';

/* ============================================================ */
/* SECTION 2: INISIALISASI SAAT DOM READY                      */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Cek apakah sudah login — langsung redirect ke home
  if (localStorage.getItem(LS_LOGGED_IN) === 'true') {
    window.location.replace(HOME_PAGE);
    return;
  }

  // Cek remember me — isi email otomatis
  const savedEmail = localStorage.getItem(LS_REMEMBER);
  if (savedEmail) {
    const loginEmailEl = document.getElementById('loginEmail');
    if (loginEmailEl) {
      loginEmailEl.value = savedEmail;
      document.getElementById('rememberMe').checked = true;
    }
  }

  // Init semua event listener
  initLoginForm();
  initRegisterForm();
  initPasswordStrength();
  initTypingDetection();
  initContainerScroll();
});

/* ============================================================ */
/* SECTION 3: TAB SWITCHER LOGIN / REGISTER                    */
/* ============================================================ */

function switchTab(tab) {
  STATE.currentTab = tab;

  const panelLogin    = document.getElementById('panelLogin');
  const panelRegister = document.getElementById('panelRegister');
  const tabLogin      = document.getElementById('tabLogin');
  const tabRegister   = document.getElementById('tabRegister');

  if (tab === 'login') {
    panelLogin.classList.remove('hidden');
    panelRegister.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    panelRegister.classList.remove('hidden');
    panelLogin.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    // Cek apakah container perlu scroll
    checkContainerScroll();
  }

  // Reset semua error saat pindah tab
  clearAllErrors();
}

/* ============================================================ */
/* SECTION 4: FORM LOGIN                                       */
/* ============================================================ */

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (STATE.isLoading) return;

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    // Validasi
    let valid = true;
    if (!validateEmail(email)) {
      showError('loginEmailError', 'Invalid Hunter email format');
      markInvalid('loginEmail');
      valid = false;
    } else {
      clearError('loginEmailError');
      markValid('loginEmail');
    }

    if (password.length < 6) {
      showError('loginPasswordError', 'Secret Code too short (min. 6 chars)');
      markInvalid('loginPassword');
      valid = false;
    } else {
      clearError('loginPasswordError');
      markValid('loginPassword');
    }

    if (!valid) {
      showToast('Check your credentials, Hunter.', 'error');
      return;
    }

    // Set loading state
    setButtonLoading('loginBtn', true);

    // Simulasi auth (karena tidak ada backend)
    // ✏️ EDIT: Ganti bagian ini dengan fetch() ke API kamu jika sudah ada backend
    await fakeAuthDelay(800);

    // Simpan ke localStorage
    localStorage.setItem(LS_LOGGED_IN, 'true');
    localStorage.setItem(LS_EMAIL, email);
    localStorage.setItem(LS_NAME, email.split('@')[0]);

    // Remember me
    if (remember) {
      localStorage.setItem(LS_REMEMBER, email);
    } else {
      localStorage.removeItem(LS_REMEMBER);
    }

    showToast('Identity confirmed. Entering the Abyss...', 'success');

    // Mulai loading animasi lalu redirect
    setTimeout(() => startLoadingOverlay(HOME_PAGE), 600);
  });
}

/* ============================================================ */
/* SECTION 5: FORM REGISTER                                    */
/* ============================================================ */

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (STATE.isLoading) return;

    const name     = document.getElementById('registerName').value.trim();
    const email    = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm  = document.getElementById('registerConfirm').value;
    const agreed   = document.getElementById('agreeTerms').checked;

    let valid = true;

    // Validasi nama
    if (name.length < 2) {
      showError('registerNameError', 'Codename must be at least 2 characters');
      markInvalid('registerName');
      valid = false;
    } else {
      clearError('registerNameError');
      markValid('registerName');
    }

    // Validasi email
    if (!validateEmail(email)) {
      showError('registerEmailError', 'Invalid Hunter email format');
      markInvalid('registerEmail');
      valid = false;
    } else {
      clearError('registerEmailError');
      markValid('registerEmail');
    }

    // Validasi password
    if (password.length < 8) {
      showError('registerPasswordError', 'Secret Code must be at least 8 characters');
      markInvalid('registerPassword');
      valid = false;
    } else {
      clearError('registerPasswordError');
      markValid('registerPassword');
    }

    // Validasi konfirmasi password
    if (password !== confirm) {
      showError('registerConfirmError', 'Secret Codes do not match');
      markInvalid('registerConfirm');
      valid = false;
    } else if (confirm.length > 0) {
      clearError('registerConfirmError');
      markValid('registerConfirm');
    }

    // Validasi terms
    if (!agreed) {
      showError('termsError', 'You must accept the Hunter\'s Code');
      valid = false;
    } else {
      clearError('termsError');
    }

    if (!valid) {
      showToast('Complete all fields to deploy, Hunter.', 'error');
      return;
    }

    // Set loading
    setButtonLoading('registerBtn', true);

    // ✏️ EDIT: Ganti dengan fetch() ke API register kamu jika sudah ada backend
    await fakeAuthDelay(1000);

    // Simpan ke localStorage
    localStorage.setItem(LS_LOGGED_IN, 'true');
    localStorage.setItem(LS_EMAIL, email);
    localStorage.setItem(LS_NAME, name);

    showToast('Hunter registered. Welcome to the Abyss!', 'success');
    setTimeout(() => startLoadingOverlay(HOME_PAGE), 700);
  });
}

/* ============================================================ */
/* SECTION 6: GOOGLE LOGIN HANDLER                             */
/* ============================================================ */

function handleGoogleLogin() {
  if (STATE.isLoading) return;

  // ✏️ EDIT: Ganti dengan Google OAuth flow jika pakai backend
  // Untuk sekarang menggunakan placeholder Hunter email
  localStorage.setItem(LS_LOGGED_IN, 'true');
  localStorage.setItem(LS_EMAIL, 'Hunter.System@leviathan.com');
  localStorage.setItem(LS_NAME, 'Hunter System');

  showToast('Google identity linked. Entering the Abyss...', 'success');
  setTimeout(() => startLoadingOverlay(HOME_PAGE), 600);
}

/* ============================================================ */
/* SECTION 7: FORGOT PASSWORD MODAL                            */
/* ============================================================ */

function showForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  // Focus ke input email
  setTimeout(() => {
    const input = document.getElementById('forgotEmail');
    if (input) input.focus();
  }, 100);
}

function hideForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (!modal) return;
  modal.classList.add('hidden');
  // Reset field
  const input = document.getElementById('forgotEmail');
  if (input) input.value = '';
  clearError('forgotEmailError');
  const success = document.getElementById('forgotSuccess');
  if (success) success.textContent = '';
}

function handleForgotPassword() {
  const email   = document.getElementById('forgotEmail').value.trim();
  const success = document.getElementById('forgotSuccess');

  if (!validateEmail(email)) {
    showError('forgotEmailError', 'Enter a valid Hunter email');
    markInvalid('forgotEmail');
    return;
  }

  clearError('forgotEmailError');
  markValid('forgotEmail');

  // ✏️ EDIT: Ganti dengan fetch() ke API reset password jika ada backend
  // Simulasi pengiriman email
  if (success) {
    success.textContent = '✓ Recovery transmission sent to ' + email;
    success.style.color = '#00ff88';
  }

  showToast('Recovery link transmitted, Hunter.', 'success');

  // Tutup modal otomatis setelah 2.5 detik
  setTimeout(() => hideForgotModal(), 2500);
}

// Tutup modal saat klik di luar box
document.addEventListener('click', (e) => {
  const modal = document.getElementById('forgotModal');
  if (!modal || modal.classList.contains('hidden')) return;
  if (e.target === modal) hideForgotModal();
});

/* ============================================================ */
/* SECTION 8: TOGGLE SHOW / HIDE PASSWORD                      */
/* ============================================================ */

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    input.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

/* ============================================================ */
/* SECTION 9: PASSWORD STRENGTH CHECKER                        */
/* ============================================================ */

function initPasswordStrength() {
  const pwInput = document.getElementById('registerPassword');
  if (!pwInput) return;

  pwInput.addEventListener('input', () => {
    const val   = pwInput.value;
    const fill  = document.getElementById('pwStrengthFill');
    const label = document.getElementById('pwStrengthLabel');
    if (!fill || !label) return;

    const score = getPasswordScore(val);

    // Reset classes
    fill.className  = 'pw-strength-fill';
    label.className = 'pw-strength-label';

    if (val.length === 0) {
      fill.style.width = '0%';
      label.textContent = '';
      return;
    }

    if (score < 2) {
      fill.classList.add('weak');
      label.classList.add('weak');
      label.textContent = '⚠ WEAK — Easy to breach';
    } else if (score < 4) {
      fill.classList.add('medium');
      label.classList.add('medium');
      label.textContent = '◈ MEDIUM — Acceptable shield';
    } else {
      fill.classList.add('strong');
      label.classList.add('strong');
      label.textContent = '✓ STRONG — Abyss-grade encryption';
    }
  });
}

function getPasswordScore(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/* ============================================================ */
/* SECTION 10: LOADING OVERLAY & REDIRECT                      */
/* ============================================================ */

function startLoadingOverlay(target) {
  STATE.isLoading = true;

  const overlay = document.getElementById('loading-overlay');
  const bar     = document.getElementById('progress-bar');
  const percent = document.getElementById('loadingPercent');

  if (!overlay || !bar) return;

  overlay.style.display = 'flex';

  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      window.location.replace(target);
    } else {
      // Percepat di awal, perlambat di akhir
      const increment = width < 70 ? 4 : width < 90 ? 2 : 1;
      width = Math.min(width + increment, 100);
      bar.style.width = width + '%';
      if (percent) percent.textContent = width + '%';
    }
  }, 30);
}

/* ============================================================ */
/* SECTION 11: TYPING DETECTION                                */
/* Container glow saat user aktif mengetik                     */
/* ============================================================ */

function initTypingDetection() {
  const container = document.getElementById('loginContainer');
  if (!container) return;

  document.addEventListener('keydown', () => {
    container.classList.add('typing');
    clearTimeout(STATE.typingTimer);
    STATE.typingTimer = setTimeout(() => {
      container.classList.remove('typing');
    }, 2000);
  });
}

/* ============================================================ */
/* SECTION 12: CONTAINER SCROLL CHECK                          */
/* Auto-scroll jika register form lebih tinggi dari layar      */
/* ============================================================ */

function initContainerScroll() {
  checkContainerScroll();
  window.addEventListener('resize', checkContainerScroll);
}

function checkContainerScroll() {
  const container = document.getElementById('loginContainer');
  if (!container) return;
  const vh = window.innerHeight;
  const rect = container.getBoundingClientRect();
  if (rect.height > vh * 0.88) {
    container.classList.add('scrollable');
  } else {
    container.classList.remove('scrollable');
  }
}

/* ============================================================ */
/* SECTION 13: TOAST NOTIFICATION                              */
/* ============================================================ */

let toastTimer = null;

function showToast(message, type = 'info') {
  const toast   = document.getElementById('toastNotif');
  const msg     = document.getElementById('toastMsg');
  const iconEl  = toast ? toast.querySelector('.toast-icon i') : null;

  if (!toast || !msg) return;

  // Set pesan
  msg.textContent = message;

  // Set tipe & icon
  toast.className = 'toast show ' + type;

  if (iconEl) {
    iconEl.className = 'fas';
    if (type === 'success') iconEl.classList.add('fa-check-circle');
    else if (type === 'error') iconEl.classList.add('fa-times-circle');
    else if (type === 'warning') iconEl.classList.add('fa-exclamation-triangle');
    else iconEl.classList.add('fa-info-circle');
  }

  // Auto hide setelah 3 detik
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================================ */
/* SECTION 14: HELPER FUNCTIONS                                */
/* ============================================================ */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = '';
}

function clearAllErrors() {
  const errors = document.querySelectorAll('.input-error');
  errors.forEach(el => el.textContent = '');
  const inputs = document.querySelectorAll('.input-group input');
  inputs.forEach(input => {
    input.classList.remove('valid', 'invalid');
  });
}

function markValid(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.classList.remove('invalid');
    el.classList.add('valid');
  }
}

function markInvalid(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.classList.remove('valid');
    el.classList.add('invalid');
  }
}

function setButtonLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (isLoading) {
    btn.classList.add('loading');
  } else {
    btn.classList.remove('loading');
  }
}

function fakeAuthDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================================ */
/*           LOGIN PAGE JS END - LEVIATHAN STORE                */
/* ============================================================ */
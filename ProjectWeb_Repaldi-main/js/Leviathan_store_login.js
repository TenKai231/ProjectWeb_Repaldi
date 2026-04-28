/* ============================================================ */
/*   LOGIN & REGISTER JS - LEVIATHAN STORE (ALL IN ONE)         */
/* ============================================================ */
'use strict';

// ---------- DOM ELEMENTS ----------
const DOM = {
  overlay:         document.getElementById('loading-overlay'),
  progressBar:     document.getElementById('progress-bar'),
  percent:         document.getElementById('loadingPercent'),

  // Login
  loginForm:       document.getElementById('loginForm'),
  loginEmail:      document.getElementById('loginEmail'),
  loginPassword:   document.getElementById('loginPassword'),

  // Register
  registerForm:    document.getElementById('registerForm'),
  registerName:    document.getElementById('registerName'),
  registerEmail:   document.getElementById('registerEmail'),
  registerPass:    document.getElementById('registerPassword'),
  registerConfirm: document.getElementById('registerConfirm'),
  agreeTerms:      document.getElementById('agreeTerms'),
  pwStrengthFill:  document.getElementById('pwStrengthFill'),
  pwStrengthLabel: document.getElementById('pwStrengthLabel'),

  // UI
  panelLogin:      document.getElementById('panelLogin'),
  panelRegister:   document.getElementById('panelRegister'),
  tabLogin:        document.getElementById('tabLogin'),
  tabRegister:     document.getElementById('tabRegister'),
  forgotModal:     document.getElementById('forgotModal'),
  forgotEmail:     document.getElementById('forgotEmail'),
  forgotSuccess:   document.getElementById('forgotSuccess'),
  toast:           document.getElementById('toastNotif'),
  toastMsg:        document.getElementById('toastMsg')
};

let loadingInterval = null;
let toastTimeout = null;

// ---------- SWITCH TAB ----------
// Fungsi untuk pindah panel Login/Register di halaman login.
window.switchTab = function(tab) {
  if (!DOM.panelLogin || !DOM.panelRegister || !DOM.tabLogin || !DOM.tabRegister) return;

  if (tab === 'login') {
    DOM.panelLogin.classList.remove('hidden');
    DOM.panelRegister.classList.add('hidden');
    DOM.tabLogin.classList.add('active');
    DOM.tabRegister.classList.remove('active');
  } else {
    DOM.panelLogin.classList.add('hidden');
    DOM.panelRegister.classList.remove('hidden');
    DOM.tabLogin.classList.remove('active');
    DOM.tabRegister.classList.add('active');
  }

  if (typeof window.hideForgotModal === 'function') {
    window.hideForgotModal();
  }
};

// ---------- LOADING & REDIRECT ----------
// Menampilkan loading overlay lalu pindah halaman.
function startLoadingAndRedirect(targetUrl) {
  if (!DOM.overlay) {
    window.location.href = targetUrl;
    return;
  }

  DOM.overlay.style.display = 'flex';

  let width = 0;
  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    width += 2;

    if (width >= 100) {
      width = 100;
      clearInterval(loadingInterval);

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    }

    if (DOM.progressBar) DOM.progressBar.style.width = width + '%';
    if (DOM.percent) DOM.percent.textContent = width + '%';
  }, 20);
}

// ---------- TOAST ----------
// Menampilkan notifikasi kecil di pojok layar.
function showToast(message, type = 'info') {
  if (!DOM.toast || !DOM.toastMsg) return;

  DOM.toastMsg.textContent = message;
  DOM.toast.className = 'toast show ' + type;

  const icon = DOM.toast.querySelector('.toast-icon i');
  if (icon) {
    icon.className = 'fas';

    if (type === 'success') icon.classList.add('fa-check-circle');
    else if (type === 'error') icon.classList.add('fa-times-circle');
    else if (type === 'warning') icon.classList.add('fa-exclamation-triangle');
    else icon.classList.add('fa-info-circle');
  }

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 3500);
}

// ---------- USER SESSION STORAGE ----------
// Menyimpan status login user.
// sessionStorage = aktif selama tab browser masih terbuka.
// localStorage = bisa dibaca halaman lain seperti homepage.
function persistUserSession(userData) {
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('userEmail', userData.email);
  sessionStorage.setItem('userName', userData.name || userData.email);
  sessionStorage.setItem('userPicture', userData.picture || '');
  sessionStorage.setItem('loginProvider', userData.provider || 'email');
  sessionStorage.removeItem('isGuest');

  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userEmail', userData.email);
  localStorage.setItem('userName', userData.name || userData.email);
  localStorage.setItem('userPicture', userData.picture || '');
  localStorage.setItem('loginProvider', userData.provider || 'email');
  localStorage.setItem('lev_user', JSON.stringify(userData));
}

// ---------- GOOGLE LOGIN / REGISTER SIMULATION ----------
// Ini simulasi Google Login, bukan Google API asli.
window.handleGoogleLogin = function(e) {
  if (e) e.preventDefault();

  const dummyUser = {
    email: 'hunter@abyss.deep',
    name: 'Abyss Hunter',
    picture: '../assets/leviathan_store.png',
    provider: 'google-sim'
  };

  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

  if (!users.find(user => user.email.toLowerCase() === dummyUser.email.toLowerCase())) {
    users.push({
      name: dummyUser.name,
      email: dummyUser.email,
      password: 'google123',
      picture: dummyUser.picture,
      provider: dummyUser.provider,
      registeredAt: new Date().toISOString()
    });

    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }

  persistUserSession(dummyUser);
  showToast(`✅ Welcome, ${dummyUser.name}!`, 'success');
  startLoadingAndRedirect('leviathan_store_home.html');
};

// ---------- LOGIN MANUAL ----------
function handleManualLogin(e) {
  e.preventDefault();

  const email = DOM.loginEmail?.value.trim();
  const password = DOM.loginPassword?.value;

  if (!email || !password) {
    showToast('❌ Email and Secret Code required', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const user = users.find(item => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    showToast('❌ Hunter not registered', 'error');
    return;
  }

  if (user.password !== password) {
    showToast('❌ Invalid Secret Code', 'error');
    return;
  }

  const userData = {
    email: user.email,
    name: user.name || email,
    picture: user.picture || '',
    provider: user.provider || 'email'
  };

  persistUserSession(userData);
  showToast(`✅ Welcome, ${userData.name}!`, 'success');
  startLoadingAndRedirect('leviathan_store_home.html');
}

// ---------- REGISTER SYSTEM ----------
// Menyimpan user baru ke localStorage key: registeredUsers.
function handleRegister(e) {
  e.preventDefault();

  const name = DOM.registerName?.value.trim();
  const email = DOM.registerEmail?.value.trim();
  const pass = DOM.registerPass?.value;
  const confirm = DOM.registerConfirm?.value;
  const agree = DOM.agreeTerms?.checked;

  document.querySelectorAll('.input-error').forEach(el => {
    el.textContent = '';
  });

  let valid = true;

  if (!name) {
    document.getElementById('registerNameError').textContent = 'Codename required';
    valid = false;
  }

  if (!email) {
    document.getElementById('registerEmailError').textContent = 'Email required';
    valid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById('registerEmailError').textContent = 'Invalid email';
    valid = false;
  }

  if (!pass) {
    document.getElementById('registerPasswordError').textContent = 'Secret Code required';
    valid = false;
  } else if (pass.length < 8) {
    document.getElementById('registerPasswordError').textContent = 'Min. 8 characters';
    valid = false;
  }

  if (pass !== confirm) {
    document.getElementById('registerConfirmError').textContent = 'Codes do not match';
    valid = false;
  }

  if (!agree) {
    document.getElementById('termsError').textContent = 'You must accept the Code';
    valid = false;
  }

  if (!valid) {
    showToast('❌ Please fix the errors above', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

  if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    showToast('❌ Email already registered', 'error');
    return;
  }

  const newUser = {
    name,
    email,
    password: pass,
    provider: 'email',
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('registeredUsers', JSON.stringify(users));

  showToast('✅ Registration successful!', 'success');

  setTimeout(() => {
    if (DOM.panelLogin && DOM.panelRegister) {
      switchTab('login');
      if (DOM.loginEmail) DOM.loginEmail.value = email;
      if (DOM.loginPassword) DOM.loginPassword.value = '';
    } else {
      window.location.href = 'leviathan_store_login.html';
    }
  }, 1000);
}

// ---------- PASSWORD STRENGTH ----------
function updatePasswordStrength() {
  if (!DOM.registerPass || !DOM.pwStrengthFill || !DOM.pwStrengthLabel) return;

  const val = DOM.registerPass.value;
  let strength = 0;

  if (val.length >= 8) strength++;
  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++;
  if (/\d/.test(val)) strength++;
  if (/[^a-zA-Z0-9]/.test(val)) strength++;

  DOM.pwStrengthFill.className = 'pw-strength-fill';
  DOM.pwStrengthLabel.className = 'pw-strength-label';

  if (val.length === 0) {
    DOM.pwStrengthFill.style.width = '0%';
    DOM.pwStrengthLabel.textContent = '';
  } else if (strength <= 1) {
    DOM.pwStrengthFill.classList.add('weak');
    DOM.pwStrengthLabel.classList.add('weak');
    DOM.pwStrengthLabel.textContent = 'Weak';
  } else if (strength === 2) {
    DOM.pwStrengthFill.classList.add('medium');
    DOM.pwStrengthLabel.classList.add('medium');
    DOM.pwStrengthLabel.textContent = 'Medium';
  } else {
    DOM.pwStrengthFill.classList.add('strong');
    DOM.pwStrengthLabel.classList.add('strong');
    DOM.pwStrengthLabel.textContent = 'Strong';
  }
}

// ---------- FORGOT PASSWORD ----------
window.showForgotModal = function() {
  if (!DOM.forgotModal) return;

  DOM.forgotModal.classList.remove('hidden');

  if (DOM.forgotEmail) DOM.forgotEmail.value = '';
  if (DOM.forgotSuccess) DOM.forgotSuccess.textContent = '';
};

window.hideForgotModal = function() {
  if (!DOM.forgotModal) return;
  DOM.forgotModal.classList.add('hidden');
};

window.handleForgotPassword = function() {
  const email = DOM.forgotEmail?.value.trim();

  if (!email) {
    const forgotEmailError = document.getElementById('forgotEmailError');
    if (forgotEmailError) forgotEmailError.textContent = 'Email required';
    return;
  }

  showToast(`📧 Recovery link sent to ${email}`, 'success');
  hideForgotModal();
};

// ---------- TOGGLE PASSWORD ----------
window.togglePassword = function(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn?.querySelector('i');

  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
};

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Leviathan Auth JS loaded');

  if (DOM.loginForm) DOM.loginForm.addEventListener('submit', handleManualLogin);
  if (DOM.registerForm) DOM.registerForm.addEventListener('submit', handleRegister);
  if (DOM.registerPass) DOM.registerPass.addEventListener('input', updatePasswordStrength);

  if (DOM.forgotModal) {
    DOM.forgotModal.addEventListener('click', (e) => {
      if (e.target === DOM.forgotModal) hideForgotModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      DOM.forgotModal &&
      !DOM.forgotModal.classList.contains('hidden')
    ) {
      hideForgotModal();
    }
  });

  if (DOM.overlay) DOM.overlay.style.display = 'none';

  if (DOM.panelLogin && DOM.panelRegister) {
    switchTab('login');
  }
});
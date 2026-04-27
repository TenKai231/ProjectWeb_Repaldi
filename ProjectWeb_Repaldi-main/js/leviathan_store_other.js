'use strict';

/* ============================================================ */
/*     OTHER PAGE JS — LEVIATHAN STORE                          */
/*     Abyss Codex Interaction System                           */
/* ============================================================ */

const OTHER_STATE = {
  lastScrollY: window.scrollY,
  scrollThreshold: 8,
  searchIndex: [
    { title: 'About Leviathan Store', section: 'about', icon: 'fa-scroll' },
    { title: 'Lore / The Great Codex', section: 'lore', icon: 'fa-book-skull' },
    { title: 'FAQ / Pertanyaan Umum', section: 'faq', icon: 'fa-question-circle' },
    { title: 'Kebijakan Pengiriman', section: 'shipping', icon: 'fa-truck-fast' },
    { title: 'Kebijakan Pengembalian', section: 'return', icon: 'fa-rotate-left' },
    { title: 'Informasi Garansi', section: 'warranty', icon: 'fa-shield-halved' },
    { title: 'Kebijakan Privasi', section: 'privacy', icon: 'fa-user-shield' },
    { title: 'Syarat & Ketentuan', section: 'terms', icon: 'fa-file-contract' },
    { title: 'Kontak Leviathan Store', section: 'contact', icon: 'fa-satellite-dish' },
  ],
};

/* ============================================================ */
/* INIT                                                         */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initSidebarScrollSpy();
  initFAQAccordion();
  initSearchCodex();
  initCartBadge();
  initAuthDisplay();
  initRevealAnimation();
  initBackToTop();
});

/* ============================================================ */
/* HEADER AUTO HIDE + SCROLLED STATE                            */
/* ============================================================ */

function initHeaderScroll() {
  const header = document.getElementById('otherHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const diff = currentY - OTHER_STATE.lastScrollY;

    header.classList.toggle('scrolled', currentY > 20);

    if (Math.abs(diff) < OTHER_STATE.scrollThreshold) return;

    if (currentY <= 10) {
      header.classList.remove('header-hidden');
      OTHER_STATE.lastScrollY = currentY;
      return;
    }

    if (diff > 0 && currentY > 140) {
      header.classList.add('header-hidden');
    } else if (diff < 0) {
      header.classList.remove('header-hidden');
    }

    OTHER_STATE.lastScrollY = currentY;
  }, { passive: true });
}

/* ============================================================ */
/* SIDEBAR SCROLL SPY                                           */
/* ============================================================ */

function initSidebarScrollSpy() {
  const sections = document.querySelectorAll('.o-section[id]');
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
/* FAQ ACCORDION                                                */
/* ============================================================ */

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ============================================================ */
/* SEARCH CODEX                                                 */
/* ============================================================ */

function initSearchCodex() {
  const input = document.getElementById('globalSearch');
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

    const results = OTHER_STATE.searchIndex.filter(item => {
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
    const clickedInsideSearch =
      event.target.closest('.search-container') ||
      event.target.closest('#searchSuggestions');

    if (!clickedInsideSearch) {
      suggestions.classList.add('hidden');
    }
  });
}

function renderSearchSuggestions(results, container) {
  if (!results.length) {
    container.innerHTML = `
      <div class="suggestion-item">
        <i class="fas fa-circle-exclamation"></i>
        <span>No codex entry found</span>
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
      const targetId = btn.dataset.target;
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      container.classList.add('hidden');

      const input = document.getElementById('globalSearch');
      const clearBtn = document.getElementById('searchClear');

      if (input) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
    });
  });
}

/* ============================================================ */
/* CART BADGE                                                   */
/* Support dua kemungkinan key: lev_cart dan leviathanCart       */
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

      if (Array.isArray(data) && data.length) {
        return data;
      }
    } catch (error) {
      console.warn(`Cart data at ${key} is invalid`, error);
    }
  }

  return [];
}

/* ============================================================ */
/* AUTH DISPLAY                                                  */
/* Support key dari page login/home lama                         */
/* ============================================================ */

function initAuthDisplay() {
  const container = document.getElementById('authContainer');
  if (!container) return;

  const legacyLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const legacyEmail = localStorage.getItem('userEmail');
  const legacyName = localStorage.getItem('userName');

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('lev_user') || 'null');
  } catch (error) {
    user = null;
  }

  const isLoggedIn = user || (legacyLoggedIn && legacyEmail);

  if (!isLoggedIn) return;

  const displayName =
    user?.name ||
    legacyName ||
    legacyEmail?.split('@')[0] ||
    'Hunter';

  const initial = displayName.charAt(0).toUpperCase();

  container.innerHTML = `
    <button class="user-profile-pill" id="profilePill" type="button" title="Hunter Profile">
      <span class="user-initial">${initial}</span>
      <span class="user-name">${displayName}</span>
    </button>
  `;

  const profilePill = document.getElementById('profilePill');
  if (profilePill) {
    profilePill.addEventListener('click', () => {
      window.location.href = 'leviathan_store_user.html';
    });
  }
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
    const show = window.scrollY > 420;
    btn.classList.toggle('hidden', !show);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}
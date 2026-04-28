'use strict';

/* ============================================================ */
/* LEVIATHAN STORE — TRANSAKSI PAGE JS                          */
/* Connect: lev_cart, lev_address, lev_orders                    */
/* ============================================================ */

const TRX = {
  cart: [],
  promo: null,
  shippingName: 'JNE Regular',
  shippingCost: 20000,
  paymentName: 'BCA Virtual Account',
  toastTimer: null,

  promos: {
    LEVI10: { code: 'LEVI10', type: 'percent', value: 10, desc: 'Diskon 10%' },
    ABYSS15: { code: 'ABYSS15', type: 'percent', value: 15, desc: 'Diskon 15%' },
    HUNTER20: { code: 'HUNTER20', type: 'percent', value: 20, desc: 'Diskon 20%' },
    MONARCH25: { code: 'MONARCH25', type: 'percent', value: 25, desc: 'Diskon 25%' },
    SOVEREIGN50K: { code: 'SOVEREIGN50K', type: 'fixed', value: 50000, desc: 'Potongan Rp 50.000' },
  },
};

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderCart();
  loadAddressToCheckout();
  initPromo();
  initShipping();
  initPayment();
  initStepButtons();
  initPrintButton();
  updateTotals();
  initAuthDisplay();           // <-- fungsi baru untuk menampilkan avatar pengguna
});

/* ============================================================ */
/* AUTH DISPLAY (PROFILE PILL DI HEADER)                        */
/* ============================================================ */

function initAuthDisplay() {
  const container = document.getElementById('authContainer');
  if (!container) return;

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('lev_user') || 'null');
  } catch {
    user = null;
  }

  const isLoggedIn = user || localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) return;

  const displayName =
    user?.name ||
    localStorage.getItem('userName') ||
    localStorage.getItem('userEmail')?.split('@')[0] ||
    'Hunter';

  const avatarUrl = user?.avatar || localStorage.getItem('userPicture') || '';
  const initial = displayName.charAt(0).toUpperCase();

  container.innerHTML = `
    <a href="leviathan_store_user.html" title="Hunter Profile" style="display:flex; align-items:center; gap:6px; text-decoration:none; color:var(--monarch-blue);">
      ${
        avatarUrl
          ? `<img src="${avatarUrl}" style="width:30px; height:30px; border-radius:50%; border:1px solid var(--monarch-blue); object-fit:cover;">`
          : `<span style="width:30px; height:30px; background:var(--monarch-blue); color:#000; display:grid; place-items:center; border-radius:50%; font-weight:bold;">${initial}</span>`
      }
      <span style="font-family:var(--font-hud); font-size:0.7rem;">${displayName}</span>
    </a>
  `;
}

/* ============================================================ */
/* STORAGE                                                      */
/* ============================================================ */

function loadCart() {
  try {
    TRX.cart = JSON.parse(localStorage.getItem('lev_cart') || '[]');
  } catch {
    TRX.cart = [];
  }

  TRX.cart = TRX.cart.map(item => ({
    id: item.id || cryptoRandomId(),
    name: item.name || 'Unknown Product',
    price: item.price || 'Rp 0',
    img: item.img || item.image || '',
    qty: Number(item.qty || item.quantity || 1),
  }));
}

function saveCart() {
  localStorage.setItem('lev_cart', JSON.stringify(TRX.cart));
}

function getAddress() {
  try {
    return JSON.parse(localStorage.getItem('lev_address') || 'null');
  } catch {
    return null;
  }
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('lev_orders') || '[]');
  } catch {
    return [];
  }
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem('lev_orders', JSON.stringify(orders));
}

/* ============================================================ */
/* FORMAT                                                       */
/* ============================================================ */

function parseRupiah(value) {
  if (typeof value === 'number') return value;

  return Number(String(value || '').replace(/[^\d]/g, '') || 0);
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function cryptoRandomId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getSubtotal() {
  return TRX.cart.reduce((sum, item) => {
    return sum + parseRupiah(item.price) * Number(item.qty || 1);
  }, 0);
}

function getDiscount() {
  if (!TRX.promo) return 0;

  const subtotal = getSubtotal();

  if (TRX.promo.type === 'percent') {
    return Math.floor(subtotal * TRX.promo.value / 100);
  }

  if (TRX.promo.type === 'fixed') {
    return Math.min(TRX.promo.value, subtotal);
  }

  return 0;
}

function getGrandTotal() {
  return Math.max(getSubtotal() + TRX.shippingCost - getDiscount(), 0);
}

/* ============================================================ */
/* CART                                                         */
/* ============================================================ */

function renderCart() {
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartActions = document.getElementById('cartActions');
  const cartItemCount = document.getElementById('cartItemCount');

  if (!cartList || !cartEmpty || !cartActions) return;

  if (!TRX.cart.length) {
    cartList.innerHTML = '';
    cartEmpty.classList.remove('hidden');
    cartActions.classList.add('hidden');

    if (cartItemCount) cartItemCount.textContent = '0 ITEM';

    updateTotals();
    return;
  }

  cartEmpty.classList.add('hidden');
  cartActions.classList.remove('hidden');

  const totalItem = TRX.cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  if (cartItemCount) cartItemCount.textContent = `${totalItem} ITEM`;

  cartList.innerHTML = TRX.cart.map(item => {
    const price = parseRupiah(item.price);
    const subtotal = price * item.qty;

    return `
      <article class="cart-item" data-id="${escapeAttr(item.id)}">
        <div class="item-image">
          <img src="${escapeAttr(item.img)}" alt="${escapeAttr(item.name)}">
        </div>

        <div class="item-details">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${formatRupiah(price)}</p>
        </div>

        <div class="item-quantity">
          <button type="button" data-action="minus" data-id="${escapeAttr(item.id)}">−</button>
          <input type="number" min="1" value="${item.qty}" data-action="input" data-id="${escapeAttr(item.id)}">
          <button type="button" data-action="plus" data-id="${escapeAttr(item.id)}">+</button>
        </div>

        <div class="item-subtotal">
          <strong>${formatRupiah(subtotal)}</strong>
        </div>

        <button class="item-remove" type="button" data-action="remove" data-id="${escapeAttr(item.id)}">
          <i class="fas fa-trash"></i>
        </button>
      </article>
    `;
  }).join('');

  bindCartButtons();
  updateTotals();
}

function bindCartButtons() {
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const action = el.dataset.action;

      if (action === 'plus') changeQty(id, 1);
      if (action === 'minus') changeQty(id, -1);
      if (action === 'remove') removeCartItem(id);
    });

    if (el.dataset.action === 'input') {
      el.addEventListener('change', () => {
        setQty(el.dataset.id, el.value);
      });
    }
  });
}

function changeQty(id, change) {
  const item = TRX.cart.find(product => product.id === id);
  if (!item) return;

  item.qty = Math.max(1, Number(item.qty || 1) + change);

  saveCart();
  renderCart();
}

function setQty(id, value) {
  const item = TRX.cart.find(product => product.id === id);
  if (!item) return;

  item.qty = Math.max(1, Number(value || 1));

  saveCart();
  renderCart();
}

function removeCartItem(id) {
  TRX.cart = TRX.cart.filter(item => item.id !== id);

  saveCart();
  renderCart();
  showToast('Produk dihapus dari keranjang.');
}

/* ============================================================ */
/* PROMO                                                        */
/* ============================================================ */

function initPromo() {
  const input = document.getElementById('promoInput');
  const btn = document.getElementById('applyPromoBtn');

  if (!input || !btn) return;

  btn.addEventListener('click', applyPromo);

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyPromo();
    }
  });
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  const feedback = document.getElementById('promoFeedback');

  if (!input || !feedback) return;

  const code = input.value.trim().toUpperCase();

  if (!code) {
    TRX.promo = null;
    feedback.textContent = 'Masukkan kode promo terlebih dahulu.';
    feedback.classList.remove('success');
    feedback.classList.add('error');
    updateTotals();
    return;
  }

  const promo = TRX.promos[code];

  if (!promo) {
    TRX.promo = null;
    feedback.textContent = 'Kode promo tidak valid.';
    feedback.classList.remove('success');
    feedback.classList.add('error');
    updateTotals();
    return;
  }

  TRX.promo = promo;
  feedback.textContent = `${promo.code} aktif — ${promo.desc}`;
  feedback.classList.remove('error');
  feedback.classList.add('success');

  updateTotals();
  showToast('Kode promo berhasil digunakan.');
}

/* ============================================================ */
/* SHIPPING + PAYMENT                                           */
/* ============================================================ */

function initShipping() {
  const inputs = document.querySelectorAll('input[name="shipping"]');

  inputs.forEach(input => {
    input.addEventListener('change', () => {
      TRX.shippingName = input.value;
      TRX.shippingCost = Number(input.dataset.cost || 0);
      updateTotals();
    });
  });
}

function initPayment() {
  const inputs = document.querySelectorAll('input[name="payment"]');

  inputs.forEach(input => {
    input.addEventListener('change', () => {
      TRX.paymentName = input.value;
    });
  });
}

/* ============================================================ */
/* TOTAL                                                        */
/* ============================================================ */

function updateTotals() {
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const temporaryTotal = Math.max(subtotal - discount, 0);
  const grandTotal = getGrandTotal();

  setText('cartSubtotal', formatRupiah(subtotal));
  setText('cartDiscount', `- ${formatRupiah(discount)}`);
  setText('cartTotal', formatRupiah(temporaryTotal));

  setText('summarySubtotal', formatRupiah(subtotal));
  setText('summaryShipping', formatRupiah(TRX.shippingCost));
  setText('summaryDiscount', `- ${formatRupiah(discount)}`);
  setText('summaryGrandTotal', formatRupiah(grandTotal));

  toggleHidden('cartDiscountRow', discount <= 0);
  toggleHidden('summaryDiscountRow', discount <= 0);

  renderSummaryPreview();
}

function renderSummaryPreview() {
  const preview = document.getElementById('summaryPreview');
  if (!preview) return;

  if (!TRX.cart.length) {
    preview.innerHTML = `<p class="summary-empty">Belum ada item.</p>`;
    return;
  }

  preview.innerHTML = TRX.cart.map(item => {
    const subtotal = parseRupiah(item.price) * item.qty;

    return `
      <div class="summary-preview-item">
        <span>${escapeHTML(item.name)} × ${item.qty}</span>
        <strong>${formatRupiah(subtotal)}</strong>
      </div>
    `;
  }).join('');
}

/* ============================================================ */
/* CHECKOUT                                                     */
/* ============================================================ */

function loadAddressToCheckout() {
  const address = getAddress();

  if (!address) return;

  const name = document.getElementById('buyerName');
  const phone = document.getElementById('buyerPhone');
  const full = document.getElementById('buyerAddress');

  if (name) name.value = address.name || '';
  if (phone) phone.value = address.phone || '';
  if (full) full.value = address.full || '';
}

function getBuyerData() {
  return {
    name: document.getElementById('buyerName')?.value.trim() || '',
    phone: document.getElementById('buyerPhone')?.value.trim() || '',
    address: document.getElementById('buyerAddress')?.value.trim() || '',
    note: document.getElementById('buyerNote')?.value.trim() || '',
  };
}

function validateCheckout() {
  if (!TRX.cart.length) {
    showToast('Keranjang masih kosong.', 'error');
    showStep('cart');
    return false;
  }

  const buyer = getBuyerData();

  if (!buyer.name || !buyer.phone || !buyer.address) {
    showToast('Data penerima belum lengkap.', 'error');
    return false;
  }

  return true;
}

/* ============================================================ */
/* STEP CONTROL                                                 */
/* ============================================================ */

function initStepButtons() {
  const goCheckoutBtn = document.getElementById('goCheckoutBtn');
  const backToCartBtn = document.getElementById('backToCartBtn');
  const payNowBtn = document.getElementById('payNowBtn');

  if (goCheckoutBtn) {
    goCheckoutBtn.addEventListener('click', () => {
      if (!TRX.cart.length) {
        showToast('Keranjang masih kosong.', 'error');
        return;
      }

      showStep('checkout');
    });
  }

  if (backToCartBtn) {
    backToCartBtn.addEventListener('click', () => {
      showStep('cart');
    });
  }

  if (payNowBtn) {
    payNowBtn.addEventListener('click', processOrder);
  }
}

function showStep(step) {
  const sections = {
    cart: document.getElementById('cartSection'),
    checkout: document.getElementById('checkoutSection'),
    loading: document.getElementById('loadingSection'),
    receipt: document.getElementById('receiptSection'),
  };

  Object.values(sections).forEach(section => {
    if (section) section.classList.add('hidden');
  });

  if (sections[step]) {
    sections[step].classList.remove('hidden');
    sections[step].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateStepUI(step);
}

function updateStepUI(step) {
  const activeStep = step === 'cart'
    ? 'cart'
    : step === 'checkout' || step === 'loading'
      ? 'checkout'
      : 'receipt';

  document.querySelectorAll('.mini-step').forEach(item => {
    item.classList.toggle('active', item.dataset.stepMini === activeStep);
  });

  document.querySelectorAll('.step-node').forEach(node => {
    const nodeStep = node.dataset.stepNode;

    const active =
      nodeStep === 'cart' ||
      (nodeStep === 'checkout' && ['checkout', 'receipt'].includes(activeStep)) ||
      (nodeStep === 'receipt' && activeStep === 'receipt');

    node.classList.toggle('active', active);
  });
}

/* ============================================================ */
/* ORDER PROCESS                                                */
/* ============================================================ */

function processOrder() {
  if (!validateCheckout()) return;

  showStep('loading');

  setTimeout(() => {
    const order = createOrder();

    saveOrder(order);
    renderReceipt(order);
    clearCartAfterOrder();

    showStep('receipt');
    showToast('Pesanan berhasil dibuat.');
  }, 2200);
}

function createOrder() {
  const now = new Date();
  const buyer = getBuyerData();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getGrandTotal();

  return {
    id: generateOrderNumber(),
    createdAt: now.toISOString(),
    dateText: now.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }),
    status: 'Processing',
    buyer,
    items: TRX.cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      qty: item.qty,
      subtotal: parseRupiah(item.price) * item.qty,
    })),
    subtotal,
    shippingName: TRX.shippingName,
    shippingCost: TRX.shippingCost,
    paymentName: TRX.paymentName,
    promo: TRX.promo,
    discount,
    total,
  };
}

function generateOrderNumber() {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');

  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `LEV-${date}-${random}`;
}


function clearCartAfterOrder() {
  TRX.cart = [];
  saveCart();
}

/* ============================================================ */
/* RECEIPT                                                      */
/* ============================================================ */

function renderReceipt(order) {
  setText('receiptOrderNumber', order.id);
  setText('receiptDate', order.dateText);
  setText('receiptPayment', order.paymentName);
  setText('receiptShipping', order.shippingName);

  setText('receiptBuyerName', order.buyer.name);
  setText('receiptBuyerPhone', order.buyer.phone);
  setText('receiptBuyerAddress', order.buyer.address);

  setText('receiptSubtotal', formatRupiah(order.subtotal));
  setText('receiptShippingCost', formatRupiah(order.shippingCost));
  setText('receiptDiscount', `- ${formatRupiah(order.discount)}`);
  setText('receiptGrandTotal', formatRupiah(order.total));

  toggleHidden('receiptDiscountRow', order.discount <= 0);

  const receiptItems = document.getElementById('receiptItems');

  if (receiptItems) {
    receiptItems.innerHTML = order.items.map(item => `
      <div class="receipt-item">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <span>${formatRupiah(parseRupiah(item.price))} × ${item.qty}</span>
        </div>
        <p>${formatRupiah(item.subtotal)}</p>
      </div>
    `).join('');
  }

  setText('receiptPaymentInstruction', getPaymentInstruction(order));
  renderQrisCode(order);
  updateWhatsappLink(order);
}

function getPaymentInstruction(order) {
  if (order.paymentName.includes('Virtual Account')) {
    return `Silakan transfer sebesar ${formatRupiah(order.total)} melalui ${order.paymentName}. Nomor VA dummy: 8808 2026 0427.`;
  }

  if (['GoPay', 'OVO', 'DANA', 'ShopeePay'].includes(order.paymentName)) {
    return `Buka aplikasi ${order.paymentName}, lalu bayar sebesar ${formatRupiah(order.total)} ke merchant Leviathan Store.`;
  }

  if (order.paymentName === 'QRIS') {
    return `Scan QRIS Leviathan Store lalu bayar sebesar ${formatRupiah(order.total)}.`;
  }

  return `Bayar sebesar ${formatRupiah(order.total)} melalui ${order.paymentName}.`;
}

function renderQrisCode(order) {
  const qrisBox = document.getElementById('qrisBox');
  const qrisImage = document.getElementById('qrisImage');
  const qrisText = document.getElementById('qrisText');

  if (!qrisBox || !qrisImage) return;

  if (order.paymentName !== 'QRIS') {
    qrisBox.classList.add('hidden');
    qrisImage.src = '';
    return;
  }

  const qrisPayload = [
    'LEVIATHAN STORE QRIS PAYMENT',
    `Order: ${order.id}`,
    `Name: ${order.buyer.name}`,
    `Total: ${formatRupiah(order.total)}`,
    `Payment: ${order.paymentName}`,
    'Status: Waiting for payment'
  ].join('\n');

  qrisImage.src =
    'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' +
    encodeURIComponent(qrisPayload);

  if (qrisText) {
    qrisText.textContent = `Scan QRIS untuk membayar ${formatRupiah(order.total)}. Ini adalah QR simulasi untuk project tugas.`;
  }

  qrisBox.classList.remove('hidden');
}

function updateWhatsappLink(order) {
  const btn = document.getElementById('whatsappConfirmBtn');
  if (!btn) return;

  const message =
`Halo Leviathan Store, saya ingin konfirmasi pesanan.

No Pesanan: ${order.id}
Nama: ${order.buyer.name}
Total: ${formatRupiah(order.total)}
Metode Pembayaran: ${order.paymentName}`;

  btn.href = `https://wa.me/6282374176977?text=${encodeURIComponent(message)}`;
}

function initPrintButton() {
  const btn = document.getElementById('printReceiptBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.print();
  });
}

/* ============================================================ */
/* TOAST                                                        */
/* ============================================================ */

function showToast(message, type = 'success') {
  const toast = document.getElementById('trxToast');
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

  clearTimeout(TRX.toastTimer);

  TRX.toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('error');
  }, 2600);
}

/* ============================================================ */
/* HELPERS                                                      */
/* ============================================================ */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function toggleHidden(id, shouldHide) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', shouldHide);
}

function escapeHTML(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(text) {
  return escapeHTML(text);
}
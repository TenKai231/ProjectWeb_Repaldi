/* ============================================================ */
/* FAQ DATA & ACCORDION LOGIC                                   */
/* ============================================================ */

// Data FAQ — sesuaikan dengan kebutuhan Leviathan Store
const faqData = [
  {
    question: 'Bagaimana cara memesan produk di Leviathan Store?',
    answer: 'Pilih produk yang diinginkan dari katalog, tentukan jumlah, lalu klik "Tambah ke Keranjang". Setelah selesai memilih, buka halaman Keranjang, periksa pesanan, dan klik "Checkout". Ikuti langkah pengisian data pengiriman dan pembayaran. Pesanan akan diproses setelah pembayaran dikonfirmasi.'
  },
  {
    question: 'Apakah semua produk bergaransi resmi?',
    answer: 'Ya, seluruh produk yang kami jual adalah barang resmi dengan garansi pabrikan yang berlaku di Indonesia. Untuk produk rakitan (set PC), kami memberikan garansi toko selama 1 tahun untuk komponen tertentu. Detail garansi tercantum di setiap halaman produk.'
  },
  {
    question: 'Berapa lama waktu pengiriman?',
    answer: 'Estimasi pengiriman tergantung lokasi Anda. Untuk wilayah Sumatera: 1–3 hari kerja. Jawa, Bali, Kalimantan: 2–5 hari kerja. Indonesia Timur: 4–7 hari kerja. Nomor resi akan dikirimkan melalui email/WhatsApp maksimal 1x24 jam setelah barang dikirim.'
  },
  {
    question: 'Apakah saya bisa membatalkan pesanan?',
    answer: 'Pembatalan dapat dilakukan sebelum pesanan diproses/dikirim. Silakan hubungi admin melalui WhatsApp untuk konfirmasi. Jika barang sudah dikirim, pembatalan tidak dapat dilakukan, namun Anda dapat mengajukan pengembalian sesuai kebijakan retur.'
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima transfer bank (BCA, Mandiri, BRI, BNI), pembayaran via QRIS, serta dompet digital seperti GoPay, OVO, DANA, dan ShopeePay. Pembayaran dengan kartu kredit/debit juga tersedia melalui gateway Midtrans.'
  },
  {
    question: 'Apakah bisa membeli secara pre-order?',
    answer: 'Ya, produk dengan label "Pre-Order" dapat dipesan terlebih dahulu. Estimasi waktu tunggu tercantum di halaman produk. Kami akan mengabari Anda secara berkala mengenai status ketersediaan barang.'
  },
  {
    question: 'Bagaimana cara klaim garansi?',
    answer: 'Untuk klaim garansi resmi pabrikan, Anda dapat langsung mengunjungi service center resmi dengan membawa kartu garansi dan nota pembelian. Jika memerlukan bantuan, tim kami siap membantu proses klaim melalui kontak yang tersedia.'
  },
  {
    question: 'Apakah Leviathan Store memiliki toko fisik?',
    answer: 'Saat ini kami beroperasi secara online dengan pusat operasional di Palembang, Sumatera Selatan. Namun, Anda tetap dapat melakukan konsultasi atau janji temu untuk melihat produk secara langsung dengan menghubungi admin terlebih dahulu.'
  }
];

// Render FAQ ke dalam container
function renderFAQ() {
  const container = document.getElementById('faqContainer');
  if (!container) return;

  let html = '';
  faqData.forEach((item, index) => {
    html += `
      <div class="faq-item" data-faq-index="${index}">
        <div class="faq-question">
          <h4>${item.question}</h4>
          <div class="faq-icon">
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-content">
            <p>${item.answer}</p>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  attachFAQEvents();
}

// Attach event listener untuk accordion
function attachFAQEvents() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Tutup item lain jika ingin (accordion tunggal terbuka)
      // faqItems.forEach(other => {
      //   if (other !== item) other.classList.remove('active');
      // });
      
      // Toggle item saat ini
      item.classList.toggle('active');
    });
  });
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', renderFAQ);
/* ============================================================ */
/* FAQ DATA & ACCORDION LOGIC                                   */
/* ============================================================ */

/* ============================================================ */
/* RETURN POLICY — Static Content (No Interactive Logic)        */
/* ============================================================ */
// Bagian ini hanya berisi konten statis. Tidak ada event listener khusus.
console.log('Leviathan Store — Return Policy loaded.');
/* ============================================================ */
/* RETURN POLICY — Static Content (No Interactive Logic)        */
/* ============================================================ */

/* ============================================================ */
/* WARRANTY POLICY — Static Content (No Interactive Logic)      */
/* ============================================================ */
// Bagian ini hanya berisi konten statis. Tidak ada event listener khusus.
console.log('Leviathan Store — Warranty Policy loaded.');
/* ============================================================ */
/* WARRANTY POLICY — Static Content (No Interactive Logic)      */
/* ============================================================ */

/* ============================================================ */
/* PRIVACY POLICY — Static Content (No Interactive Logic)       */
/* ============================================================ */
// Bagian ini hanya berisi konten statis. Tidak ada event listener khusus.
console.log('Leviathan Store — Privacy Policy loaded.');
/* ============================================================ */
/* PRIVACY POLICY — Static Content (No Interactive Logic)       */
/* ============================================================ */

/* ============================================================ */
/* TERMS & CONDITIONS — Static Content (No Interactive Logic)   */
/* ============================================================ */
// Bagian ini hanya berisi konten statis. Tidak ada event listener khusus.
console.log('Leviathan Store — Terms & Conditions loaded.');
/* ============================================================ */
/* TERMS & CONDITIONS — Static Content (No Interactive Logic)   */
/* ============================================================ */

/* ============================================================ */
/* CONTACT SECTION — Static Content (No Interactive Logic)      */
/* ============================================================ */
// Bagian ini hanya berisi konten statis. Tidak ada event listener khusus.
console.log('Leviathan Store — Contact section loaded.');
/* ============================================================ */
/* CONTACT SECTION — Static Content (No Interactive Logic)      */
/* ============================================================ */
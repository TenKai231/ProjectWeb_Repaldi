'use strict';

// ==================== AUTH & UI ====================
let authUser = null;

function checkAuth() {
    const stored = localStorage.getItem('skyPassUser');
    if (stored) {
        try {
            const u = JSON.parse(stored);
            if (u.loggedIn) {
                authUser = { firstName: u.name, email: u.email };
                updateHeaderUI();
            }
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
    authUser = null;
    updateHeaderUI();
    showToast('Anda telah keluar dari akun 👋');
}

function toggleDropdown(e) {
    e.stopPropagation();
    document.getElementById('user-pill').classList.toggle('open');
}

function showToast(msg, isError = false) {
    const toast    = document.getElementById('toast');
    const msgSpan  = document.getElementById('toastMessage');
    const iconEl   = document.getElementById('toast-icon');
    if (!toast) return;
    msgSpan.textContent = msg;
    toast.classList.toggle('error', isError);
    iconEl.textContent  = isError ? '✕' : '✓';
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

function navigateTo(page) {
    const pages = {
        'home'        : 'azureairhome.html',
        'jadwal'      : 'jadwal.html',
        'cek-pesanan' : 'cek-pesanan.html',
        'promo'       : 'promo.html',
        'bantuan'     : 'azureairHelp.html',
    };
    if (pages[page]) window.location.href = pages[page];
    else showToast('Halaman sedang dalam pengembangan 🔧');
}

function openAuthModal() { window.location.href = 'azureairlogin.html'; }
function openProfilModal() { showToast('Fitur profil akan segera hadir! 👤'); }

// ==================== DATA JADWAL ====================
const airlines = [
    { name: 'Garuda Indonesia', code: 'GA' },
    { name: 'Lion Air', code: 'JT' },
    { name: 'Sriwijaya Air', code: 'SJ' }
];

const cities = [
    { name: 'Jakarta', code: 'CGK' },
    { name: 'Bali', code: 'DPS' },
    { name: 'Palembang', code: 'PLM' },
    { name: 'Riau', code: 'PKU' },
    { name: 'Makassar', code: 'UPG' }
];

// Harga dasar (dalam ribuan)
const priceMatrix = {
    'CGK-DPS': 750, 'CGK-PLM': 420, 'CGK-PKU': 680, 'CGK-UPG': 890,
    'DPS-CGK': 750, 'DPS-PLM': 560, 'DPS-PKU': 720, 'DPS-UPG': 380,
    'PLM-CGK': 420, 'PLM-DPS': 560, 'PLM-PKU': 310, 'PLM-UPG': 640,
    'PKU-CGK': 680, 'PKU-DPS': 720, 'PKU-PLM': 310, 'PKU-UPG': 590,
    'UPG-CGK': 890, 'UPG-DPS': 380, 'UPG-PLM': 640, 'UPG-PKU': 590
};

// Durasi (jam)
const durationMap = {
    'CGK-DPS': 1.8, 'CGK-PLM': 1.0, 'CGK-PKU': 1.5, 'CGK-UPG': 2.3,
    'DPS-CGK': 1.8, 'DPS-PLM': 1.4, 'DPS-PKU': 1.7, 'DPS-UPG': 1.0,
    'PLM-CGK': 1.0, 'PLM-DPS': 1.4, 'PLM-PKU': 0.8, 'PLM-UPG': 1.6,
    'PKU-CGK': 1.5, 'PKU-DPS': 1.7, 'PKU-PLM': 0.8, 'PKU-UPG': 1.4,
    'UPG-CGK': 2.3, 'UPG-DPS': 1.0, 'UPG-PLM': 1.6, 'UPG-PKU': 1.4
};

// Multiplier maskapai (Garuda +30%, Lion std, Sriwijaya -10%)
const airlineMultiplier = {
    'Garuda Indonesia': 1.30,
    'Lion Air': 1.0,
    'Sriwijaya Air': 0.90
};

// Multiplier kelas (Ekonomi 1x, Bisnis 2.5x, First 5x)
const classMultiplier = {
    'Ekonomi': 1.0,
    'Bisnis': 2.5,
    'First': 5.0
};

function generateAllSchedules() {
    const schedules = [];
    
    airlines.forEach(airline => {
        cities.forEach(fromCity => {
            cities.forEach(toCity => {
                if (fromCity.code === toCity.code) return;
                
                const routeKey = `${fromCity.code}-${toCity.code}`;
                const basePrice = priceMatrix[routeKey] * 1000;
                const durationHours = durationMap[routeKey];
                const durationMin = Math.round(durationHours * 60);
                
                const airlinePrice = Math.round(basePrice * airlineMultiplier[airline.name]);
                
                // Slot keberangkatan
                const slots = [
                    { depart: '06:00' },
                    { depart: '12:30' },
                    { depart: '18:15' }
                ];
                
                slots.forEach((slot, idx) => {
                    const departTime = slot.depart;
                    const arriveTime = addMinutes(departTime, durationMin);
                    
                    // Semua kelas untuk Garuda, hanya Ekonomi untuk Lion & Sriwijaya
                    const classes = airline.name === 'Garuda Indonesia' 
                        ? ['Ekonomi', 'Bisnis', 'First'] 
                        : ['Ekonomi'];
                    
                    classes.forEach(kelas => {
                        const finalPrice = Math.round(airlinePrice * classMultiplier[kelas]);
                        
                        schedules.push({
                            id: `${airline.code}-${fromCity.code}-${toCity.code}-${idx}-${kelas}`,
                            airlineName: airline.name,
                            airlineCode: airline.code,
                            flightNumber: `${airline.code} ${100 + Math.floor(Math.random() * 900)}`,
                            fromCode: fromCity.code,
                            fromName: fromCity.name,
                            toCode: toCity.code,
                            toName: toCity.name,
                            depart: departTime,
                            arrive: arriveTime,
                            duration: formatDuration(durationMin),
                            kelas: kelas,
                            price: finalPrice,
                            classes: classes
                        });
                    });
                });
            });
        });
    });
    return schedules;
}

function addMinutes(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutes);
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}j` : `${h}j ${m}m`;
}

let allSchedules = generateAllSchedules();
let filteredSchedules = [...allSchedules];
let currentFilter = {
    from: '',
    to: '',
    airline: 'all',
    sort: 'price-asc',
    date: new Date()
};

// ==================== DATE TABS ====================
function renderDateTabs() {
    const container = document.getElementById('date-tabs-container');
    const today = new Date();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    let html = '';
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = days[date.getDay()];
        const dateNum = date.getDate();
        const month = months[date.getMonth()];
        const isActive = i === 0;
        
        // Hitung harga terendah untuk tanggal ini
        const minPrice = getMinPriceForDate(date);
        const priceText = minPrice ? `Rp ${(minPrice/1000).toFixed(0)}rb` : '';
        
        html += `
            <div class="date-tab ${isActive ? 'active' : ''}" data-date-index="${i}" onclick="selectDateTab(${i})">
                <div class="day-name">${dayName}</div>
                <div class="date-num">${dateNum}</div>
                <div class="month">${month}</div>
                ${priceText ? `<div class="price-indicator">${priceText}</div>` : ''}
            </div>
        `;
    }
    container.innerHTML = html;
}

function getMinPriceForDate(date) {
    const fromFilter = document.getElementById('filter-from').value;
    const toFilter = document.getElementById('filter-to').value;
    const airlineFilter = currentFilter.airline;
    
    const relevant = allSchedules.filter(s => {
        if (fromFilter && s.fromCode !== fromFilter) return false;
        if (toFilter && s.toCode !== toFilter) return false;
        if (airlineFilter !== 'all' && s.airlineName !== airlineFilter) return false;
        return true;
    });
    
    if (relevant.length === 0) return null;
    return Math.min(...relevant.map(s => s.price));
}

function selectDateTab(index) {
    document.querySelectorAll('.date-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    const today = new Date();
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() + index);
    currentFilter.date = selectedDate;
    
    applyFilter();
    showToast(`Menampilkan jadwal ${selectedDate.toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})} ✈`);
}

// ==================== RENDER TABEL ====================
function renderTable(schedules) {
    const tbody = document.getElementById('jadwal-tbody');
    const countEl = document.getElementById('result-count');
    const tableWrapper = document.querySelector('.table-wrapper');
    const noResultEl = document.getElementById('no-result');
    
    if (schedules.length === 0) {
        tableWrapper.style.display = 'none';
        noResultEl.style.display = 'block';
        countEl.textContent = '0 penerbangan ditemukan';
        return;
    }
    
    tableWrapper.style.display = 'block';
    noResultEl.style.display = 'none';
    countEl.textContent = `${schedules.length} penerbangan ditemukan`;
    
    tbody.innerHTML = schedules.map(s => {
        const classTabsHtml = s.classes.map(cls => `
            <span class="class-tab ${s.kelas === cls ? 'active' : ''}" 
                  onclick="changeFlightClass('${s.id}', '${cls}')">
                ${cls}
            </span>
        `).join('');
        
        return `
        <tr id="row-${s.id}">
            <td>
                <div class="airline-badge">
                    <span style="font-weight:600">${s.airlineName}</span>
                    <span class="airline-code">${s.flightNumber}</span>
                </div>
            </td>
            <td><span class="airline-code">${s.flightNumber}</span></td>
            <td><strong>${s.fromCode}</strong> ${s.fromName}</td>
            <td><strong>${s.toCode}</strong> ${s.toName}</td>
            <td><span class="depart-time">${s.depart}</span></td>
            <td><span class="arrive-time">${s.arrive}</span></td>
            <td><span class="duration-badge">${s.duration}</span></td>
            <td>
                <div class="class-tabs">
                    ${classTabsHtml}
                </div>
            </td>
            <td><span class="price-amount" id="price-${s.id}">Rp ${s.price.toLocaleString('id-ID')}</span></td>
            <td>
                <button class="btn-pesan" onclick="pesanTiket('${s.id}')">
                    Pesan <i class="fas fa-arrow-right"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

// Ubah kelas penerbangan
function changeFlightClass(scheduleId, newClass) {
    const schedule = allSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    // Update data
    schedule.kelas = newClass;
    schedule.price = Math.round(
        priceMatrix[`${schedule.fromCode}-${schedule.toCode}`] * 1000 
        * airlineMultiplier[schedule.airlineName] 
        * classMultiplier[newClass]
    );
    
    // Update UI
    const row = document.getElementById(`row-${scheduleId}`);
    if (row) {
        // Update class tabs active state
        row.querySelectorAll('.class-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.trim() === newClass);
        });
        // Update price display
        const priceEl = document.getElementById(`price-${scheduleId}`);
        if (priceEl) {
            priceEl.textContent = `Rp ${schedule.price.toLocaleString('id-ID')}`;
        }
    }
    
    // Re-apply filter untuk update sorting
    applyFilter();
    showToast(`Kelas diubah ke ${newClass} ✈`);
}

// ==================== FILTER & SORT ====================
function applyFilter() {
    const fromFilter = document.getElementById('filter-from').value;
    const toFilter = document.getElementById('filter-to').value;
    const sortSelect = document.getElementById('sort-select').value;
    
    currentFilter.from = fromFilter;
    currentFilter.to = toFilter;
    currentFilter.sort = sortSelect;
    
    let filtered = allSchedules.filter(s => {
        if (fromFilter && s.fromCode !== fromFilter) return false;
        if (toFilter && s.toCode !== toFilter) return false;
        if (currentFilter.airline !== 'all' && s.airlineName !== currentFilter.airline) return false;
        return true;
    });
    
    // Sorting
    switch(sortSelect) {
        case 'price-asc':
            filtered.sort((a,b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a,b) => b.price - a.price);
            break;
        case 'depart-asc':
            filtered.sort((a,b) => a.depart.localeCompare(b.depart));
            break;
        case 'duration-asc':
            filtered.sort((a,b) => {
                const durA = a.duration.match(/\d+/g).map(Number);
                const durB = b.duration.match(/\d+/g).map(Number);
                const minA = (durA[0]||0)*60 + (durA[1]||0);
                const minB = (durB[0]||0)*60 + (durB[1]||0);
                return minA - minB;
            });
            break;
    }
    
    filteredSchedules = filtered;
    renderTable(filtered);
    renderDateTabs(); // Re-render date tabs untuk update harga
}

function resetFilter() {
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value = '';
    document.getElementById('sort-select').value = 'price-asc';
    
    // Reset airline tabs
    document.querySelectorAll('.airline-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.airline === 'all');
    });
    
    currentFilter = {
        from: '',
        to: '',
        airline: 'all',
        sort: 'price-asc',
        date: new Date()
    };
    
    filteredSchedules = [...allSchedules];
    renderTable(filteredSchedules);
    renderDateTabs();
    showToast('Filter direset ✈');
}

function pesanTiket(scheduleId) {
    const schedule = allSchedules.find(s => s.id === scheduleId);
    if (schedule) {
        const searchData = {
            from: schedule.fromCode,
            to: schedule.toCode,
            fromName: schedule.fromName,
            toName: schedule.toName,
            date: currentFilter.date.toISOString().split('T')[0],
            passengerCount: 1,
            kelas: schedule.kelas,
            tripType: 'sekali'
        };
        localStorage.setItem('skySearchData', JSON.stringify(searchData));
        showToast(`Mengarahkan ke pemesanan ${schedule.airlineName} ${schedule.kelas}... ✈`);
        setTimeout(() => { window.location.href = 'hasil-pencarian.html'; }, 800);
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Render date tabs
    renderDateTabs();
    
    // Render awal
    renderTable(filteredSchedules);
    
    // Airline filter tabs
    document.querySelectorAll('.airline-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.airline-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter.airline = this.dataset.airline;
            applyFilter();
        });
    });
    
    // Header scroll effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(43,143,232,.12)' : '';
    }, { passive: true });
    
    // Tutup dropdown
    document.addEventListener('click', () => {
        const pill = document.getElementById('user-pill');
        if (pill) pill.classList.remove('open');
    });
    
    // Event listeners untuk filter select
    document.getElementById('filter-from').addEventListener('change', applyFilter);
    document.getElementById('filter-to').addEventListener('change', applyFilter);
    document.getElementById('sort-select').addEventListener('change', applyFilter);
});

// Expose ke global
window.toggleDropdown = toggleDropdown;
window.navigateTo = navigateTo;
window.openAuthModal = openAuthModal;
window.openProfilModal = openProfilModal;
window.logout = logout;
window.applyFilter = applyFilter;
window.resetFilter = resetFilter;
window.pesanTiket = pesanTiket;
window.selectDateTab = selectDateTab;
window.changeFlightClass = changeFlightClass;
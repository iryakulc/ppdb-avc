// 1. Paksa halaman selalu scroll ke paling atas saat di-refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', function() {
  window.scrollTo(0, 0);
});

/* ================================================================
   KONFIGURASI PPDB — EDIT DI SINI sesuai brosur resmi sekolah
   ================================================================ */
const PPDB_CONFIG = {
  adminPassword: 'avicena2026', // ganti! (demo: tersimpan di sisi browser)
  tahun: 2026,
  gelombang: [
    { no: 1, tanggal: 'Segera diumumkan', catatan: 'Isi tanggal sesuai brosur' },
    { no: 2, tanggal: 'Segera diumumkan', catatan: 'Isi tanggal sesuai brosur' },
    { no: 3, tanggal: 'Segera diumumkan', catatan: 'Isi tanggal sesuai brosur' }
  ],
  jurusan: {
    Excellent: ['TKJ', 'MP', 'DKV'],
    Reguler: ['TKJ', 'MP', 'AKL', 'DKV', 'TKR', 'TBSM']
  },
  // Isi nominal dari brosur. Kosongkan ('') untuk menampilkan "Hubungi panitia".
  biaya: {
    Reguler: [
      { item: 'Pendaftaran', nominal: 'Gratis' },
      { item: 'Seragam', nominal: 'Gratis' },
      { item: 'Uang Pangkal / Gedung', nominal: '' },
      { item: 'SPP per bulan', nominal: '' }
    ],
    Excellent: [
      { item: 'Pendaftaran', nominal: 'Gratis' },
      { item: 'Seragam', nominal: 'Gratis' },
      { item: 'Uang Pangkal / Gedung', nominal: '' },
      { item: 'SPP per bulan', nominal: '' }
    ]
  },
  berkas: [
    'Fotokopi Kartu Keluarga',
    'Fotokopi Akta Kelahiran',
    'Fotokopi Ijazah / SKL SMP/MTs',
    'Pas foto terbaru',
    'Fotokopi KIP/PKH (jika ada)'
  ],
  // Warna map per jurusan: sesuaikan dengan brosur
  map: [
    { warna: 'Kuning', css: '#facc15', jurusan: '' },
    { warna: 'Biru', css: '#3b82f6', jurusan: '' },
    { warna: 'Merah', css: '#ef4444', jurusan: '' }
  ],
  statuses: ['Menunggu Verifikasi', 'Berkas Diverifikasi', 'Diterima', 'Tidak Diterima']
};
const STORE_KEY = 'ppdb_avicena_data';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; } };
const save = d => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {} };
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => k === 'class' ? n.className = v : k === 'text' ? n.textContent = v : n.setAttribute(k, v));
  kids.forEach(k => n.append(k));
  return n;
};
function toast(msg) { $('#toastMsg').textContent = msg; bootstrap.Toast.getOrCreateInstance($('#appToast'), { delay: 2600 }).show(); }

/* 2. Navbar: auto-hide, efek scroll, progress bar, back-to-top */
const navbar = document.getElementById('mainNavbar');
const progress = $('#scrollProgress'), toTop = $('#toTop');
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const menuOpen = $('#navMenu').classList.contains('show') || $('.navbar .dropdown-menu.show');
  if (scrollTop > lastScrollTop && scrollTop > 80 && !menuOpen) navbar.classList.add('navbar-hidden');
  else navbar.classList.remove('navbar-hidden');
  navbar.classList.toggle('navbar-scrolled', scrollTop > 40);
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? scrollTop / h * 100 : 0) + '%';
  toTop.classList.toggle('show', scrollTop > 500);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
// tutup menu mobile saat link diklik
$$('#navMenu a.dropdown-item, #navMenu .nav-link:not(.dropdown-toggle), #navMenu .btn').forEach(a => a.addEventListener('click', () => {
  const m = $('#navMenu'); if (m.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(m).hide();
}));
// penanda menu aktif
const spy = { 'visi-misi': 0, 'jurusan': 0, 'info-ppdb': 1, 'informasi-sekolah': 0 };
const spyObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { const links = $$('#navMenu .navbar-nav > .nav-item > .nav-link'); links.forEach(l => l.classList.remove('active-link')); const idx = spy[e.target.id]; if (links[idx]) links[idx].classList.add('active-link'); }
}), { rootMargin: '-45% 0px -50% 0px' });
Object.keys(spy).forEach(id => { const s = document.getElementById(id); if (s) spyObs.observe(s); });

/* 3. Reveal on scroll + stagger */
$$('.row').forEach(r => $$(':scope > [class*="col"] .reveal', r).forEach((n, i) => n.style.setProperty('--d', (i % 6) * 0.08 + 's')));
const revObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } }), { threshold: 0.12 });
const observeReveals = () => $$('.reveal:not(.in)').forEach(n => revObs.observe(n));

/* 4. Tilt 3D pada kartu jurusan */
if (matchMedia('(hover:hover)').matches) {
  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `translateY(-5px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`; });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
}

/* 5. Render konten PPDB dari konfigurasi */
function renderPPDB() {
  const gl = $('#gelombangList');
  PPDB_CONFIG.gelombang.forEach(g => {
    gl.append(el('div', { class: 'col-md-4' }, el('div', { class: 'gel-card reveal' },
      el('div', { class: 'd-flex justify-content-between align-items-start mb-2' }, el('div', { class: 'gel-no', text: g.no }), el('span', { class: 'badge-soft', text: 'Gelombang ' + g.no })),
      el('div', { class: 'fw-bold', text: g.tanggal }),
      el('div', { class: 'small text-muted', text: g.catatan || '' }))));
  });
  [['Reguler', '#tblReguler'], ['Excellent', '#tblExcellent']].forEach(([k, sel]) => {
    const t = el('table', { class: 'table table-hover align-middle' }, el('thead', {}, el('tr', {}, el('th', { text: 'Komponen' }), el('th', { class: 'text-end', text: 'Biaya' }))));
    const tb = el('tbody');
    PPDB_CONFIG.biaya[k].forEach(b => tb.append(el('tr', {}, el('td', { text: b.item }), el('td', { class: 'text-end fw-bold' + (b.nominal ? '' : ' text-muted'), text: b.nominal || 'Hubungi panitia' }))));
    t.append(tb); $(sel).append(t);
  });
  PPDB_CONFIG.berkas.forEach(b => $('#berkasList').append(el('li', { text: b })));
  PPDB_CONFIG.map.forEach(m => $('#mapList').append(el('div', { class: 'map-row' },
    el('span', { class: 'map-dot', style: 'background:' + m.css }),
    el('div', {}, el('div', { class: 'fw-bold', text: 'Map ' + m.warna }), el('div', { class: 'small text-muted', text: m.jurusan || 'Sesuai jurusan, tanyakan ke panitia' })))));
  const sg = $('#selGelombang');
  sg.append(el('option', { value: '', text: 'Pilih…' }));
  PPDB_CONFIG.gelombang.forEach(g => sg.append(el('option', { value: g.no, text: 'Gelombang ' + g.no })));
}
renderPPDB(); observeReveals();

/* 6. Formulir pendaftaran */
$('#selProgram').addEventListener('change', e => {
  const sj = $('#selJurusan'); sj.innerHTML = '';
  const list = PPDB_CONFIG.jurusan[e.target.value] || [];
  sj.append(el('option', { value: '', text: list.length ? 'Pilih jurusan…' : 'Pilih program dulu' }));
  list.forEach(j => sj.append(el('option', { value: j, text: j })));
  sj.disabled = !list.length;
});
function nextRegNo(data) {
  const n = data.reduce((m, d) => Math.max(m, parseInt(d.no.split('-').pop(), 10) || 0), 0) + 1;
  return `AVC-${PPDB_CONFIG.tahun}-${String(n).padStart(4, '0')}`;
}
$('#btnKirim').addEventListener('click', () => {
  const f = $('#formDaftar'), err = $('#formErr'); err.classList.add('d-none');
  let ok = true;
  $$('input,select,textarea', f).forEach(i => { const bad = !i.checkValidity() || !i.value.trim(); i.classList.toggle('is-invalid', bad); if (bad) ok = false; });
  if (!ok) { err.textContent = 'Mohon lengkapi semua kolom dengan benar (NISN harus 10 digit angka).'; err.classList.remove('d-none'); return; }
  const data = load(), v = Object.fromEntries(new FormData(f));
  if (data.some(d => d.nisn === v.nisn)) { err.textContent = 'NISN ini sudah terdaftar. Gunakan menu Cek Status.'; err.classList.remove('d-none'); return; }
  const rec = { ...v, no: nextRegNo(data), status: PPDB_CONFIG.statuses[0], tgldaftar: new Date().toISOString() };
  data.push(rec); save(data);
  f.reset(); $('#selJurusan').disabled = true;
  bootstrap.Modal.getInstance($('#modalDaftar')).hide();
  $('#regNumber').textContent = rec.no;
  bootstrap.Modal.getOrCreateInstance($('#modalSukses')).show();
});
$$('#formDaftar input, #formDaftar select, #formDaftar textarea').forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));
$('#btnCopy').addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText($('#regNumber').textContent).then(() => toast('Nomor pendaftaran disalin')); });

/* 7. Cek status */
const stClass = s => ['st-wait', 'st-ok', 'st-pass', 'st-fail'][PPDB_CONFIG.statuses.indexOf(s)] || 'st-wait';
function doCek() {
  const q = $('#inpStatus').value.trim().toUpperCase(), box = $('#statusResult'); box.innerHTML = '';
  if (!q) return;
  const d = load().find(x => x.nisn === q || x.no.toUpperCase() === q);
  if (!d) { box.append(el('div', { class: 'invalid-note', text: 'Data tidak ditemukan. Periksa kembali NISN / nomor pendaftaran Anda.' })); return; }
  const idx = PPDB_CONFIG.statuses.indexOf(d.status), prog = el('div', { class: 'progress-track' });
  [0, 1, 2].forEach(i => prog.append(el('span', { class: i <= Math.min(idx, 2) && idx !== 3 ? 'on' : '' })));
  box.append(el('div', { class: 'status-card' },
    el('div', { class: 'small text-muted', text: d.no }),
    el('div', { class: 'fw-bold fs-5', text: d.nama }),
    el('div', { class: 'small text-muted mb-2', text: `${d.program} • ${d.jurusan} • Gelombang ${d.gelombang}` }),
    el('span', { class: 'status-pill ' + stClass(d.status), text: d.status }), prog));
}
$('#btnCek').addEventListener('click', doCek);
$('#inpStatus').addEventListener('keydown', e => e.key === 'Enter' && doCek());
$('#modalStatus').addEventListener('hidden.bs.modal', () => { $('#statusResult').innerHTML = ''; $('#inpStatus').value = ''; });

/* 8. Admin */
function adminLogin() {
  if ($('#inpAdminPass').value === PPDB_CONFIG.adminPassword) {
    $('#adminErr').classList.add('d-none'); $('#inpAdminPass').value = '';
    bootstrap.Modal.getInstance($('#modalAdminLogin')).hide();
    renderAdmin(); bootstrap.Modal.getOrCreateInstance($('#modalAdmin')).show();
  } else $('#adminErr').classList.remove('d-none');
}
$('#btnAdminLogin').addEventListener('click', adminLogin);
$('#inpAdminPass').addEventListener('keydown', e => e.key === 'Enter' && adminLogin());
const fSel = $('#adminFilter'); PPDB_CONFIG.statuses.forEach(s => fSel.append(el('option', { value: s, text: s })));
function renderAdmin() {
  const all = load(), q = $('#adminSearch').value.toLowerCase(), fs = fSel.value;
  const rows = all.filter(d => (!fs || d.status === fs) && (!q || [d.nama, d.nisn, d.no].join(' ').toLowerCase().includes(q)));
  const st = $('#adminStats'); st.innerHTML = '';
  st.append(el('div', { class: 'col-6 col-md-3' }, el('div', { class: 'stat-box' }, el('b', { text: all.length }), 'Total pendaftar')));
  PPDB_CONFIG.statuses.slice(0, 3).forEach(s => st.append(el('div', { class: 'col-6 col-md-3' }, el('div', { class: 'stat-box' }, el('b', { text: all.filter(d => d.status === s).length }), s))));
  const tb = $('#adminBody'); tb.innerHTML = '';
  if (!rows.length) tb.append(el('tr', {}, el('td', { colspan: 7, class: 'text-center text-muted py-4', text: 'Belum ada data.' })));
  rows.forEach(d => {
    const sel = el('select', { class: 'form-select form-select-sm' });
    PPDB_CONFIG.statuses.forEach(s => { const o = el('option', { value: s, text: s }); if (s === d.status) o.selected = true; sel.append(o); });
    sel.addEventListener('change', () => { const a = load(); a.find(x => x.no === d.no).status = sel.value; save(a); renderAdmin(); toast('Status diperbarui'); });
    const del = el('button', { class: 'btn btn-sm btn-outline-danger', title: 'Hapus' }, el('i', { class: 'fa-solid fa-trash' }));
    del.addEventListener('click', () => { if (confirm('Hapus data ' + d.nama + '?')) { save(load().filter(x => x.no !== d.no)); renderAdmin(); } });
    tb.append(el('tr', {}, el('td', { text: d.no }), el('td', { text: d.nama }), el('td', { text: d.nisn }), el('td', { text: `${d.program} / ${d.jurusan}` }), el('td', { text: d.gelombang }), el('td', {}, sel), el('td', {}, del)));
  });
}
$('#adminSearch').addEventListener('input', renderAdmin); fSel.addEventListener('change', renderAdmin);
$('#btnExport').addEventListener('click', () => {
  const d = load(); if (!d.length) return toast('Belum ada data');
  const cols = ['no', 'nama', 'nisn', 'tempat', 'tgl', 'jk', 'asal', 'ortu', 'hp', 'alamat', 'program', 'jurusan', 'gelombang', 'status', 'tgldaftar'];
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = [cols.join(',')].concat(d.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
  const a = el('a', { href: URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })), download: 'pendaftar-ppdb-avicena.csv' }); a.click();
});

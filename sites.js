// ============================================================
//  DAFTAR TAUTAN — cukup edit file ini saja
//
//  Cara menambah kartu — salin satu baris objek, lalu ubah:
//
//    { nama:"Nama Website", url:"https://domain.com",
//      tipe:"blog", tag:"kata kunci pencarian" },
//
//  tipe: harus memakai id yang ada di TIPES bawah (huruf kecil).
//  tag:  kata yang cocok dengan pencarian, pisahkan dengan spasi.
//  url:  "#" jika belum punya — kartu tidak akan membuka apa pun.
//
//  Ikon kartu diambil otomatis dari favicon situsnya (ikon tab
//  Chrome). Kalau gagal/tidak ada, diganti huruf awal nama.
// ============================================================

const SITES = [
  { nama: "Blog",        url: "https://blog.example.com",       tipe: "blog",       tag: "tulisan artikel cerita harian" },
  { nama: "Portofolio",  url: "https://portofolio.example.com", tipe: "portofolio", tag: "karya project desain hasil" },
  { nama: "GitHub",      url: "https://github.com/yuliana-dev", tipe: "tools",      tag: "kode repositori open source" },
  { nama: "Instagram",   url: "https://instagram.com/yuliana",  tipe: "sosial",     tag: "media sosial foto keseharian" },
  { nama: "YouTube",     url: "https://youtube.com/@yuliana",   tipe: "sosial",     tag: "video konten media" },
];

//  Chip filter — ubah atau tambah sesuai kebutulan.
const TIPES = [
  { id: "semua",      label: "Semua" },
  { id: "blog",       label: "Blog" },
  { id: "portofolio", label: "Portofolio" },
  { id: "sosial",     label: "Sosial" },
  { id: "tools",      label: "Tools" },
  { id: "lainnya",    label: "Lainnya" },
];
# 📸 Photobooth Studio

Photobooth Studio adalah aplikasi web **photobooth berbasis browser** yang memungkinkan pengguna mengambil foto langsung dari kamera, menerapkan efek visual, memilih frame, dan mengunduh hasil photostrip secara otomatis.

Proyek ini dibuat dengan fokus pada **UI yang bersih, UX yang sederhana**, dan **tanpa dependensi framework** (pure HTML, CSS, dan JavaScript).

---

## ✨ Fitur Utama

* 🎥 **Live Camera Preview (1:1)**

  * Menggunakan kamera depan (user-facing)
  * Preview real-time berbasis `<canvas>` (bukan `<video>` langsung)

* 🎞️ **Frame Template**

  * Korean (minimal putih)
  * Kawaii (pink soft)
  * Neon (biru–ungu glow)

* 🎨 **Photo Effects**

  * None
  * Black & White
  * Vintage
  * Soft Glow
  * Film Grain
  * Cool Tone

* ⏱️ **Timer per Foto**

  * 0s, 2s, 3s, 5s
  * Countdown animasi di tengah kamera

* 📷 **Auto Capture (6x Shot)**

  * Mengambil foto otomatis satu per satu
  * Disertai efek flash & shutter sound

* 🔁 **Retake Last Photo**

  * Mengulang foto terakhir tanpa reset semua

* 🖼️ **Preview Grid**

  * Menampilkan hasil foto sebelum diunduh
  * Layout 2 × 3 (photostrip)

* ⬇️ **Download Photostrip**

  * Format PNG
  * Tidak gepeng (cover crop)
  * Watermark logo + teks
  * Timestamp otomatis (tanggal & waktu)

* 📱 **Responsive Design**

  * Optimal untuk desktop & mobile
  * Tombol shutter besar ala kamera

---

## 🧱 Struktur Proyek

```text
photobooth-studio/
├── 📁 assets
│   ├── 🖼️ logo.png
│   └── 🎨 style.css
├── 📝 README.md
├── 📄 favicon.ico
├── 🌐 index.html
└── 📄 script.js
```

---

## 🚀 Cara Menjalankan

> ⚠️ **PENTING:** Kamera hanya berfungsi jika dijalankan via server lokal.

### Opsi 1 – Live Server (Direkomendasikan)

1. Buka project di VS Code
2. Install ekstensi **Live Server**
3. Klik kanan `index.html` → **Open with Live Server**

### Opsi 2 – Localhost Manual

```bash
npx serve
# atau
python -m http.server
```

Lalu buka di browser:

```
http://localhost:3000
```

---

## 🧠 Teknologi yang Digunakan

* **HTML5** – Struktur aplikasi
* **CSS3** – Glassmorphism UI, animasi, responsive
* **Vanilla JavaScript**

  * `getUserMedia()`
  * `<canvas>` API
  * Image processing manual (pixel manipulation)

Tanpa framework. Tanpa library eksternal.

---

## 🎯 Tujuan Proyek

* Latihan **Web API (Camera & Canvas)**
* Eksplorasi **UI/UX aplikasi interaktif**
* Project portofolio frontend

---

## 👤 Author

**Riyan**
Frontend Developer

---

## 📄 Lisensi

Proyek ini bebas digunakan untuk pembelajaran dan pengembangan portofolio pribadi.

> Jika kamu suka project ini, ⭐️ star repo-nya ya ✨

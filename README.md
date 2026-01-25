## 📸 Photobooth Studio (HTML • CSS • JavaScript)

Photobooth Studio adalah web photobooth sederhana & aesthetic berbasis **HTML, CSS, dan JavaScript (Vanilla)** tanpa library tambahan.  
Bisa membuka kamera, auto capture 4 foto, tampil dalam grid 2x2, lalu **download hasilnya sebagai PNG** dengan watermark.

---

## ✨ Features

✅ Start Camera (WebCam)  
✅ Live camera 4 frame (2x2) seperti photobooth vibes  
✅ Mirror mode  
✅ Timer per foto (0s / 2s / 3s / 5s)  
✅ Auto capture 4 foto sekali klik  
✅ Frame Template:
- Korean Minimal  
- Kawaii Pink  
- Neon Cyber  

✅ Effects (simple & useful):
- None  
- B&W  
- Vintage  
- Soft Glow  
- Film Grain  
- Cool  

✅ Shutter sound saat capture  
✅ Retake last photo (ulang foto terakhir)  
✅ Download PNG **(anti gepeng / crop cover)**  
✅ Watermark otomatis **logo + “by Riyan”**  

---

## 🛠️ Tech Stack

- HTML
- CSS
- JavaScript (Vanilla)
- Canvas API
- WebCam API (`getUserMedia`)

---

## 📂 Project Structure

```bash
photobooth-studio/
├─ index.html
├─ script.js
├─ assets/
│  ├─ style.css
│  └─ logo.png
├─ favicon.ico
└─ README.md
```
## 🚀 How To Run (Recommended)

Karena akses kamera membutuhkan environment yang aman, jalankan project via localhost.

### ✅ Option 1: VSCode Live Server (Recommended)

- Buka folder project di VSCode

- Install extension Live Server

- Klik kanan index.html → Open with Live Server

- Izinkan permission kamera di browser

### ✅ Option 2: Laragon / XAMPP

- Pindahkan folder project ke:

- www (Laragon) atau

- htdocs (XAMPP)

- Jalankan server

- Buka: http://localhost/photobooth-studio/

- ⚠️ Catatan: file:///C:/... tidak disarankan karena fitur kamera/download bisa diblok oleh browser.

## 🎮 How To Use

- Klik Start

- Pilih Frame Template

- Pilih Effect

- Pilih Timer

- Klik Auto 4x Capture

- Kalau foto terakhir kurang cocok → klik Retake Last

- Klik Download untuk simpan hasil PNG

## 🔒 Notes (Important)

- Jika kamera tidak muncul:

- Pastikan menggunakan Live Server / localhost

- Pastikan izin kamera sudah di-allow

- Disarankan pakai Google Chrome / Microsoft Edge

## 🧩 Customization
- Ganti Logo

- Ganti file ini: assets/logo.png

- Logo otomatis dipakai untuk: Header logo & Watermark hasil download

## ✅ Roadmap (Next Upgrade)

### Fitur yang bisa kamu tambahin next:

- Retake per slot (klik kotak 1/2/3/4 untuk retake)

- Pilih format output (Grid 2x2 / Strip Vertikal)

- Custom watermark text (input nama user)

- Save hasil ke LocalStorage

- Share ke sosial media

## 👤 Author

Made with ❤️ by Riyan

## 📄 License
Project ini dibuat untuk kebutuhan edukasi dan portofolio pribadi.
Silakan digunakan sebagai referensi belajar dengan tetap mencantumkan kredit.

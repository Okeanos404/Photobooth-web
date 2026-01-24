## 📸 Photobooth Studio (HTML • CSS • JavaScript)

Photobooth Studio adalah web photobooth sederhana dan aesthetic berbasis HTML, CSS, dan JavaScript (tanpa library) yang bisa membuka kamera, mengambil foto otomatis 4x, menampilkan hasil dalam bentuk strip, lalu mengunduhnya sebagai gambar PNG.

Project ini dibuat dengan fokus pada UI yang simple untuk user tapi tetap punya fitur “photobooth vibes”.

### ✨ Features

✅ Start camera (WebCam)
✅ Live preview + mirror mode
✅ Timer per foto (0s / 2s / 3s / 5s)
✅ Auto capture 4 foto sekali klik
✅ Frame template:

Korean Minimal

Kawaii Pink

Cyber Neon

✅ Effects (simple & useful):

None

B&W

Vintage

Soft Glow

Film Grain

Cool

✅ Shutter sound saat capture
✅ Retake last photo (ulang foto terakhir)
✅ Download photostrip PNG

### 🛠️ Tech Stack

HTML

CSS

JavaScript (Vanilla)

Canvas API

WebCam API (getUserMedia)

### 📂 Project Structure
photobooth-studio/
├─ index.html
├─ assets/style.css
├─ assets/logo.png
├─ favicon.ico
├─ script.js
└─ README.md


### 🚀 How To Run

Karena akses kamera membutuhkan environment yang aman, jalankan project via localhost / Live Server.

✅ Option 1: VSCode Live Server (Recommended)

Buka folder project di VSCode

Install extension Live Server

Klik kanan index.html → Open with Live Server

Izinkan permission kamera

✅ Option 2: Localhost (Laragon / XAMPP)

Pindahkan folder project ke www (Laragon) atau htdocs (XAMPP)

Jalankan server

Buka:

http://localhost/photobooth-studio/

### 📌 How To Use

Klik Start

Pilih Frame Template

Pilih Effect

Pilih Timer per foto

Klik Auto 4x Capture

Jika foto terakhir kurang bagus → klik Retake Last

Klik Download untuk mengunduh hasil strip

### 🔒 Notes (Important)

Jika kamera tidak muncul:

Pastikan menggunakan Live Server / localhost

Pastikan permission kamera di browser sudah diizinkan

Browser yang disarankan:

Google Chrome / Microsoft Edge

### 🧩 Customization
Ganti Logo

Taruh file logo bernama logo.png di folder project, lalu sudah otomatis dipakai pada bagian header.

Kalau mau ukuran lebih kecil/besar bisa edit di style.css pada bagian .mark dan .logo-img.

✅ Roadmap (Next Upgrade)

Beberapa fitur yang bisa ditambahkan untuk versi berikutnya:

Retake per slot (klik slot foto untuk retake)

Pilihan strip mode (2 foto / 4 foto)

Tambah watermark nama user

Save hasil ke LocalStorage

Share ke sosial media

### 👤 Author

Made with ❤️ by Riyan
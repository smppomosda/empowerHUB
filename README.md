# EMPOWER HUB — PWA (Progressive Web App)

Repositori siap deploy ke **GitHub Pages**. Setelah di-deploy, aplikasi bisa **diinstal sebagai aplikasi native** di:

- Windows / macOS / Linux (Chrome, Edge, Brave)
- Android (Chrome, Edge, Samsung Internet, Firefox)
- iOS / iPadOS (Safari "Add to Home Screen")

---

## Struktur file

```
empower-hub-pwa/
├── index.html              # Halaman utama (iframe GAS + PWA meta tags)
├── manifest.json           # Manifest PWA (nama, ikon, display standalone)
├── sw.js                   # Service worker (offline shell)
├── README.md               # File ini
└── icons/
    ├── icon-192.png         # 192×192 (any)
    ├── icon-512.png         # 512×512 (any)
    ├── icon-maskable-512.png # 512×512 (maskable, ada padding)
    ├── apple-touch-icon.png # 180×180 (iOS)
    ├── favicon-32.png
    └── favicon.ico
```

---

## Langkah deploy ke GitHub Pages

### 1. Buat repository baru di GitHub
- Masuk ke https://github.com/new
- Nama repo: misal `empower-hub`
- Pilih **Public**
- Centang "Add a README file" (opsional)
- Klik **Create repository**

### 2. Upload semua file di folder ini ke repo
Anda bisa drag-and-drop lewat web GitHub, **atau** lewat git:

```bash
# di dalam folder empower-hub-pwa
git init
git add .
git commit -m "Initial PWA setup"
git branch -M main
git remote add origin https://github.com/USERNAME/empower-hub.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

### 3. Aktifkan GitHub Pages
- Buka repo → tab **Settings** → menu **Pages**
- Bagian **Build and deployment** → **Source**: pilih **Deploy from a branch**
- **Branch**: pilih `main` → folder: `/ (root)`
- Klik **Save**
- Tunggu 1–2 menit, lalu Anda akan dapat URL seperti:
  `https://USERNAME.github.io/empower-hub/`

URL inilah yang menjadi alamat aplikasi Anda.

---

## Cara install sebagai aplikasi native

### 📱 Android (Chrome / Edge / Samsung Internet)
1. Buka `https://USERNAME.github.io/empower-hub/`
2. Menu (⋮) → **Add to Home screen** / **Install app**
3. Icon muncul di launcher, bisa dibuka fullscreen seperti aplikasi biasa.

### 📱 iPhone / iPad (Safari wajib)
1. Buka URL di Safari
2. Tombol Share (▢↑) → **Add to Home Screen** → **Add**
3. Icon muncul di Home Screen. (Catatan: iOS tidak menampilkan prompt otomatis seperti Android — pengguna harus lakukan manual.)

### 💻 Windows / Mac / Linux (Chrome / Edge / Brave)
1. Buka URL
2. Tombol **Install** akan muncul di address bar (ikon ⬇⊕), **atau**
3. Menu (⋮) → **Cast, save, and share** → **Install page as app**
4. Aplikasi terbuka di window standalone, ada icon di Start Menu / Launchpad / dock.

---

## Verifikasi PWA sudah benar

1. Buka `https://USERNAME.github.io/empower-hub/`
2. Tekan **F12** → tab **Application** (Chrome/Edge) → **Manifest** → pastikan tidak ada error
3. Tab **Application** → **Service Workers** → pastikan status *Activated and is running*
4. Jalankan **Lighthouse** (tab Lighthouse → Generate report → PWA) untuk skor lengkap.

Kriteria minimum Chrome untuk "installable":
- ✅ HTTPS (GitHub Pages sudah HTTPS)
- ✅ Ada `manifest.json` valid dengan `name`, `icons` (192 & 512), `start_url`, `display: standalone`
- ✅ Service worker terdaftar & menangani fetch event
- ✅ Ikon 192px dan 512px (sudah tersedia)

---

## Catatan teknis penting

### Kenapa Service Worker **tidak** meng-cache Google Apps Script?
Halaman ini menampilkan GAS via **iframe cross-origin**. Request ke `script.google.com` memerlukan cookie sesi & dapat mengembalikan data dinamis. Jika di-cache, pengguna akan melihat data lama / error. Maka `sw.js` sengaja **melewati** (`passthrough`) seluruh request ke `*.google.com`.

### Cross-origin iframe & "installability"
Beberapa browser (terutama Chrome desktop lama) pernah menolak prompt install jika konten utama adalah iframe cross-origin. Saat ini Chrome/Edge modern tetap mengizinkan instalasi selama shell PWA memenuhi kriteria. Jika prompt tidak muncul:
- Pastikan `start_url` & `scope` benar (lihat `manifest.json`)
- Pastikan service worker aktif (cek Application → SW)
- Reload setelah pertama kali SW terdaftar

### Update ikon
Ikon saat ini diambil dari favicon Anda yang asli. Untuk ganti:
- Timpa file di folder `icons/` (192, 512, 180, 32)
- Re-generate `icon-maskable-512.png` dengan padding 10% di sekitar logo
- Commit & push ulang

### Update URL Google Apps Script
Jika URL `/exec` berubah, edit `src` iframe di `index.html`:
```html
<iframe id="app" src="https://script.google.com/macros/s/XXXX/exec" ... ></iframe>
```

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---|---|---|
| Prompt "Install" tidak muncul | SW belum aktif / icon kurang | Buka DevTools → Application → Manifest, perbaiki error yang ditampilkan |
| Tampil blank saat offline | SW tidak intercept navigasi | Pastikan `scope: './'` di manifest sama dengan lokasi `sw.js` |
| iOS: tetap tampil Safari | Belum "Add to Home Screen" | iOS hanya bisa install manual via Share → Add to Home Screen |
| Icon tidak muncul di Android | `purpose` icon salah | Pastikan ada icon `purpose: "any"` dan satu `purpose: "maskable"` |
| GitHub Pages 404 | Repo masih private / branch salah | Settings → Pages → pilih branch `main`, folder `/root` |
| GitHub Pages URL pakai subpath, SW error | Scope `/` di repo project | `manifest.json` sudah pakai `./` relatif, tidak perlu ubah |

---

## Lisensi
Bebas digunakan untuk keperluan pribadi/organisasi.

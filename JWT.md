# Implementasi Autentikasi Berbasis JSON Web Token (JWT) pada Aplikasi REST API dengan ExpressJS

## Pendahuluan

Dalam pengembangan aplikasi berbasis web, autentikasi adalah salah satu komponen penting untuk melindungi data pengguna dan memastikan hanya pengguna yang berhak yang dapat mengakses fitur tertentu. Salah satu metode autentikasi yang populer adalah menggunakan JSON Web Token (JWT). JWT memungkinkan pengembang untuk mengelola sesi pengguna dengan cara yang aman, ringan, dan independen terhadap server.

Pada praktik ini, kita akan membangun sistem autentikasi berbasis JWT menggunakan framework ExpressJS. Sistem ini mencakup dua fitur utama, yaitu registrasi dan login pengguna, serta mekanisme perlindungan rute menggunakan middleware. Semua data pengguna akan diproses dan disimpan secara aman menggunakan hashing password, dan token JWT digunakan untuk memverifikasi identitas pengguna.

## Alur Sistem

### 1. Registrasi Pengguna

• Pengguna mengisi formulir di `register.html`.

• Data dikirim ke endpoint `/auth/register`.

Password di-hash dan disimpan (di sini dalam array `users`).

### 2. Login Pengguna

• Pengguna mengisi formulir di `login.html`.

• Data dikirim ke endpoint `/auth/login`.

Password diverifikasi, jika cocok, token JWT dikembalikan.

### 3. Token Validasi:

• Middleware `authMiddleware.js` memverifikasi token pada setiap permintaan API yang membutuhkan autentikasi.

## Tahapan

### 1. Tambahkan Paket yang Dibutuhkan

• Instalasi dependensi yang diperlukan untuk autentikasi dan pengelolaan data:

```bash
npm install express jsonwebtoken bcryptjs dotenv mysql
```

Dependensi tambahan:

• dotenv: Mengelola variabel lingkungan.

• jsonwebtoken: Membuat dan memverifikasi token JWT.

• bcryptjs: Untuk hashing password.

• mysql: Untuk koneksi database MySQL.

### 2. Konfigurasi Variabel Lingkungan

Buat file .env di root project dan tambahkan konfigurasi:

```plaintext
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
DB_HOST=localhost
DB_USER=root
DB_NAME=nasira
```

• `JWT_SECRET`: Kunci rahasia JWT.

• `JWT_EXPIRES_IN`: Masa berlaku token JWT.

### 3. Middleware untuk Autentikasi

Buat file `authMiddleware.js` untuk memverifikasi token JWT:

```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token not provided!' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token!' });

        req.user = user; // Melampirkan data pengguna ke request
        next();
    });
};

module.exports = authenticateToken;
```

### 4. Buat Rute Login dan Register

Tambahkan file `authroutes.js` untuk menangani registrasi dan login pengguna:

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simulasi database (gunakan database sebenarnya di produksi)
const users = [];

// Preload pengguna default
(async () => {
    const hashedPassword = await bcrypt.hash("12345678", 10);
    users.push({ username: "nasyira", password: hashedPassword });
    console.log('Default user added: nasyira');
})();

// Rute Registrasi
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully!' });
});

// Rute Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ message: 'Invalid credentials!' });

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token });
});

module.exports = router;
```

### 5. Lindungi Rute dengan Middleware

Tambahkan middleware autentikasi untuk melindungi rute API:

```javascript
const express = require('express');
const authenticateToken = require('./authMiddleware');
const authRoutes = require('./authroutes');
const app = express();

app.use(express.json());

// Rute publik
app.get('/', (req, res) => {
    res.send('Public Route');
});

// Rute terlindungi
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username}, you have access!` });
});

// Rute autentikasi
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 6. Koneksi Database

Tambahkan file db.js untuk mengelola koneksi database menggunakan MySQL:

```javascript
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        process.exit(1);
    }
    console.log('Connected to database.');
});

module.exports = db;
```

7. Tahap 7: Uji Endpoint

• Register User

Endpoint: `POST /auth/register`

• Body (JSON)

```json
{
  "username": "user1",
  "password": "password123"
}
```

• Respons

```json
{
  "message": "User registered successfully!"
}
```

• Login User

Endpoint: `POST /auth/login`

• Body (JSON):

```json
{
  "username": "user1",
  "password": "password123"
}
```

• Respons:

```json
{
  "token": "your_generated_jwt_token"
}
```

• Akses Rute Terlindungi

• Endpoint: GET /protected Header:

```makefile
Authorization: Bearer your_generated_jwt_token
```

• Respons:
```json
{
  "message": "Hello user1, you have access!"
}
```

## Kesimpulan

Praktik di atas telah menunjukkan bagaimana mengimplementasikan sistem autentikasi berbasis JWT pada aplikasi berbasis ExpressJS. Dengan mengikuti langkah-langkah mulai dari instalasi dependensi, pembuatan middleware, hingga pengujian endpoint, kita telah membangun aplikasi yang dapat:

1. Mendaftarkan pengguna baru dengan hashing password yang aman.

2. Mengautentikasi pengguna dan menghasilkan token JWT.

3. Melindungi rute tertentu sehingga hanya pengguna yang memiliki token valid yang dapat mengaksesnya.

Keamanan data pengguna dijamin melalui penggunaan hashing password dengan bcryptjs dan verifikasi token dengan jsonwebtoken. Sistem ini dapat diintegrasikan dengan database untuk menyimpan data pengguna secara persisten dan dikembangkan lebih lanjut sesuai kebutuhan.

Melalui implementasi ini, kita dapat memahami dasar-dasar penggunaan JWT untuk autentikasi, yang merupakan salah satu praktik terbaik dalam pengembangan API modern. Untuk meningkatkan keamanan dan fleksibilitas, pengembang dapat menambahkan validasi input, log aktivitas pengguna, dan mekanisme logout untuk mencabut token yang tidak digunakan lagi.


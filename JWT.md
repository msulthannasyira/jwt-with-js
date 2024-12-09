Autentikasi dan otorisasi merupakan bagian yang sangat penting dalam pengembangan aplikasi web atau mobile. Salah satu metode yang sering digunakan untuk mengelola autentikasi adalah JSON Web Token (JWT). JWT adalah standar terbuka yang memungkinkan pertukaran data yang aman antar pihak, seperti server dan client, dalam format JSON. Dengan menggunakan JWT, server dapat mengirimkan token yang berisi informasi pengguna setelah proses login yang kemudian dapat digunakan untuk mengakses rute-rute yang dilindungi.

Pada artikel ini, kita akan membahas cara mengimplementasikan autentikasi berbasis JWT dalam aplikasi REST API menggunakan  Flask untuk Python. Kami akan menjelaskan langkah-langkah implementasi mulai dari instalasi paket yang dibutuhkan, pembuatan middleware autentikasi, hingga pengujian endpoint yang memanfaatkan JWT untuk otentikasi dan otorisasi pengguna.

Dengan menggunakan JWT, website dapat mengelola sesi pengguna dengan cara yang lebih efisien dan aman, tanpa harus menyimpan data pengguna di server, sehingga mengurangi overhead penyimpanan dan meningkatkan skalabilitas aplikasi.


### 1. Instalasi Paket yang Diperlukan

Untuk memulai implementasi autentikasi menggunakan JWT dan hashing password, Anda perlu menginstal beberapa paket seperti jsonwebtoken, bcryptjs, dan flask-mysqldb untuk mengelola autentikasi serta koneksi ke database MySQL. Berikut adalah perintah untuk menginstal paket-paket tersebut

```python
pip install Flask jwt flask-mysqldb bcrypt
```

### 2. Konfigurasi Kunci Rahasia dan Variabel Lingkungan

Setelah itu buat kunci rahasia untuk JWT dan session key dalam variabel JWT_SECRET_KEY. Ini digunakan untuk mengenkripsi dan mendekripsi token JWT.
Variabel JWT_SECRET_KEY berfungsi untuk memvalidasi token yang dikeluarkan dan memastikan bahwa token tersebut berasal dari server yang sah.

```cmd
app.secret_key = secrets.token_hex(16)  # Secret key for session
JWT_SECRET_KEY = 'your_jwt_secret_key'  # JWT secret key for encoding and decoding
```

### 3. Halaman Login

Pada halaman login, pengguna diminta untuk memasukkan username dan password. Proses autentikasi dilakukan dengan memeriksa kecocokan username dan password yang dimasukkan dengan data yang ada pada "database" (disimulasikan menggunakan dictionary users).

Jika login berhasil, sistem akan menghasilkan token JWT yang menyimpan informasi pengguna yang terautentikasi. Token ini kemudian digunakan untuk sesi pengguna.

```python
if request.method == 'POST':
    username = request.form['username']
    password = request.form['password']

    # Fetch user from mock database
    user = users.get(username)
    if user and user['password'] == password:
        # Generate JWT
        payload = {
            'user_id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
        return redirect(f"http://localhost:3000/callback?token={token}")
    return "Invalid credentials!", 401
```

### 4. Halaman Callback dan Validasi Token

Halaman callback menerima token JWT yang diberikan oleh server OAuth atau setelah login berhasil. Token ini digunakan untuk memverifikasi identitas pengguna. Validasi dilakukan menggunakan JWT decode, di mana payload dari token akan digunakan untuk mengakses data pengguna.

Jika token valid, pengguna akan diarahkan ke halaman utama, dan jika token tidak valid atau sudah kadaluarsa, pengguna akan menerima pesan error.

```python

@app.route('/callback', methods=['GET'])
def oauth_callback():
    token = request.args.get('token')
    if token:
        try:
            response = requests.get(f"{OAUTH_SERVER}/validate", params={"token": token})
            response.raise_for_status()
            user_info = response.json()

            session['loggedin'] = True
            session['id'] = user_info['id']
            session['username'] = user_info['username']
            return redirect(url_for('home'))
        except requests.exceptions.RequestException as e:
            flash(f"Error validating token: {e}", "danger")
    flash("Invalid token!", "danger")
    return redirect(url_for('login'))

```

### 5. Penyimpanan di Database

Meskipun menggunakan users dictionary untuk menyimpan data pengguna dalam contoh ini, kita harus menggantinya dengan penyimpanan di database yang lebih permanen (MySQL) untuk penggunaan produksi. Kode di bawah ini menyambungkan aplikasi ke MySQL dan memastikan pengambilan data pengguna menggunakan query SQL.

```python
cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
cursor.execute('SELECT * FROM accounts WHERE id = %s', (user_id,))
account = cursor.fetchone()
```

### 6. Pendaftaran Pengguna

Pada halaman pendaftaran (/pythonlogin/register), pengguna dapat mendaftar dengan memasukkan username, password, dan email. Password pengguna di-hash menggunakan werkzeug.security untuk memastikan bahwa password yang disimpan di database aman.

```python
hashed_password = generate_password_hash(password)
cursor.execute('INSERT INTO accounts (username, email, password) VALUES (%s, %s, %s)', 
               (username, email, hashed_password))
mysql.connection.commit()
```

7. Perlindungan Endpoint dengan JWT

Pastikan menggunakan token JWT untuk melindungi rute API. Hal ini dilakukan dengan memeriksa token yang ada pada header Authorization setiap kali pengguna mengakses rute yang dilindungi.

```python
def authenticate_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
```

8. Screenshot Tampilan

![image](https://github.com/user-attachments/assets/0a011867-363a-4c02-ad22-5d7d152ff4ce)

![image](https://github.com/user-attachments/assets/174514cb-fd5e-4036-938b-78eeb57c3026)


8. Kesimpulan
Secara keseluruhan, kode Anda mengimplementasikan autentikasi berbasis JWT yang cukup baik. Namun, Anda perlu memperhatikan validasi input yang lebih ketat dan memastikan penggunaan database yang tepat dalam sistem produksi. Pastikan untuk melakukan pengujian lebih lanjut agar aplikasi berjalan dengan aman dan stabil.

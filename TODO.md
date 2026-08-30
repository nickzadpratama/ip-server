# P2-Challenge-1 (Server Side)

- Tema Aplikasi: Rent Room

Struktur Folder: 

- server (PORT: 3000)

## **W1D1**

Target: Mampu membuat REST API dan dan mengimpementasikan proteksi REST API

### **REST API**

- [X] Membuat entitas utama (Create / POST)
  - [X] Endpoint ini akan menerima request body berdasar field-field di entitas utama sesuai [tema aplikasi](https://docs.google.com/document/d/1GZwh8OJGZZQVUuWE0Cr13iMA2lLNE9mMoHfrbmETEBs/edit#heading=h.mcqrsbt2auhv).
  - [X] Jika request  berhasil, kembalikan response dengan 201 status code dan response body berupa object yang berisikan data baru yang berhasil di-input.
  - [X] Jika request gagal karena validasi tidak terpenuhi, kembalikan response dengan 400 status code dan response body berupa object yang berisikan validation errors.
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Mengambil semua data entitas utama (Read / GET)
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa array of objects yang berisikan semua data entitas utama include User sebagai pemilik data (tanpa menampilkan passwordnya).
  - [X] Jika request gagal, kembalikan response dengan 500 status code.

- [X]  Mengambil detail entitas utama berdasar id (Read / GET)
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa object yang berisikan data todo.
  - [X] Jika request gagal karena todo tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found.

- [X] Mengupdate entitas utama (Update/ PUT)
  - [X] Endpoint ini akan menerima request body berdasar field-field di entitas utama.
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa object yang berisikan data yang diupdate.
  - [X] Jika request gagal karena data tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found.
  - [X] Jika request gagal karena validasi tidak terpenuhi, kembalikan response dengan 400 status code dan response body berupa object yang berisikan validation errors.
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Menghapus entitas utama (Delete / DELETE)
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response berupa object yang berisikan data yang berhasil di-delete atau bisa juga mengembalikan data message saja message: '[entity name] success to delete'
  - [X] Jika request gagal karena todo tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Membuat entitas kedua genres/categories/types (Create / POST)
  - [X] Endpoint ini akan menerima request body berdasar field-field di entitas kedua sesuai [tema aplikasi](https://docs.google.com/document/d/1GZwh8OJGZZQVUuWE0Cr13iMA2lLNE9mMoHfrbmETEBs/edit#heading=h.mcqrsbt2auhv).
  - [X] Jika request  berhasil, kembalikan response dengan 201 status code dan response body berupa object yang berisikan data baru yang berhasil di-input.
  - [X] Jika request gagal karena validasi tidak terpenuhi, kembalikan response dengan 400 status code dan response body berupa object yang berisikan validation errors.
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Mengambil semua data genres/categories/types (Read / GET)
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa array of objects yang berisikan semua data genres/categories/types.
  - [X] Jika request gagal, kembalikan response dengan 500 status code.

- [X] Mengupdate kedua genres/categories/types (Update/ PUT)
  - [X] Endpoint ini akan menerima request body berdasar field-field di entitas kedua genres/categories/types.
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa object yang berisikan data yang diupdate.
  - [X] Jika request gagal karena data tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found.
  - [X] Jika request gagal karena validasi tidak terpenuhi, kembalikan response dengan 400 status code dan response body berupa object yang berisikan validation errors.
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Menghapus entitas kedua genres/categories/types (Delete / DELETE)
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response berupa object yang berisikan data yang berhasil di-delete atau bisa juga mengembalikan data message saja message: '[entity name] success to delete'
  - [X] Jika request gagal karena todo tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan 500 status code.

- [X] Mengambil semua data entitas utama (Read / GET) untuk public site
  - [X] Tambahkan prefix /pub pada endpoint ini
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa array of objects yang berisikan semua data entitas utama.
  - [X] Jika request gagal, kembalikan response dengan 500 status code.

- [X] Mengambil detail entitas utama berdasar id (Read / GET) untuk public site
  - [X] Tambahkan prefix /pub pada endpoint kalian
  - [X] Id dikirimkan via request params
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa object yang berisikan data.
  - [X] Jika request gagal karena data tidak ditemukan, kembalikan response dengan 404 status code dan response body berupa object yang berisikan error not found.

### **API Documentation**

- [X] Route /path yang digunakan di aplikasi yang kamu buat
- [X] Informasi yang diperlukan oleh user saat ingin menggunakan route/path API (seperti body, header, parameter, dll)
- [X] Response serta status code yang akan didapatkan oleh pengguna (info, error, warning, dsb)

Lebih lanjut untuk contoh, bisa dilihat di:

- [Example API Documentation](https://gist.github.com/ziterz/56d2cd8b2d5f5d52101265c0182c2aff)

## **W1D2**

Target: Mampu mengimpelemtasikan middleware dan menggunakan 3rd party API pada server

### **Authentication + Authorization**

- [X] POST /add-user (khusus untuk staff, dilakukan oleh admin)
  - [X] Request Headers: { Authorization: "Bearer [your access token]" }
  - [X] Request body: { email, password }
  - [X] Response:
    - [X] 201: { id, email }
    - [X] 400: { errors }

  Note: Pastikan password telah terhash sebelum data user masuk ke dalam database.

- [X] POST /login (semua role, baik admin atau staff)
  - [X] Request body: { email, password }
  - [X] Response:
    - [X] 200: { access_token, email/username, role }
    - [X] 401: { error invalid username or email or password }

- [X] Menambahkan Authentication dan Authorization

| Role  | Create | Read  | Update                             | Delete                             |
| ----- | ------ | ----- | ---------------------------------- | ---------------------------------- |
| Admin | [ ] ✅  | [ ] ✅ | [ ] ✅                              | [ ] ✅                              |
| Staff | [ ]  ✅ | [ ] ✅ | [ ] Hanya bisa menghapus miliknya. | [ ] Hanya bisa menghapus miliknya. |

- [X] Error status code 401, apabila user yang belum login, atau yang mempunyai token yang salah mencoba mengakses endpoint CRD.
- [X] Error status code 403, apabila staff mengakses delete pada entitas yang bukan miliknya.

  Note: Untuk mengirim access_token, gunakan request header (diterima sebagai req.headers di Express).

### **Error Handler**

- [X] 401 - Error login user not found atau password not matched
- [X] 401 - Error authentication
- [X] 403 - Forbidden error di authorization
- [X] 400 - Error validation saat create.
- [X] 404 - Data not found.
- [X] 500 - Internal error server, dsb

### **Upload File**

- [X] Meng-update data imgUrl entitas utama (Update / PATCH)
  - [X] Endpoint ini akan menerima request body berupa ("multipart/form-data") untuk meng-update data imgUrl.
  - [X] Id dikirimkan via request params.
  - [X] Membuat fitur upload menggunakan [multer](https://www.npmjs.com/package/multer) dan [imageKit](https://imagekit.io/)/[Cloudinary](https://cloudinary.com) untuk menyimpan file tersebut.
  - [X] Jika request berhasil, kembalikan response dengan 200 status code dan response body berupa object message: 'Image [entity name] success to update'
  - [X] Jika request gagal karena data tidak ditemukan, kembalikan response dengan status code 404 dan response body berupa object yang berisikan error not found.
  - [X] Jika request gagal karena validasi tidak terpenuhi, kembalikan response dengan status code 400 dan response body berupa object yang berisikan validation errors.
  - [X] Jika request gagal karena kesalahan server, kembalikan response dengan status code 500.

## **W1D3**

Target: Mampu menimplementasikan Unit Testing (TDD) pada Test

### **TDD**

Mengimplementasikan testing terhadap endpoint yang sudah dibuat

- [X] Login (Admin), perlu melakukan pengecekan pada status dan response ketika:
  - [X] Email tidak diberikan / tidak diinput
  - [X] Password tidak diberikan / tidak diinput
  - [X] Email diberikan invalid / tidak terdaftar
  - [X] Password diberikan salah / tidak match
  - Pastikan untuk testing ini sediakan dulu data Admin

- [X] Add Staff, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil register
  - [X] Email tidak diberikan / tidak diinput
  - [X] Password tidak diberikan / tidak diinput
  - [X] Email diberikan string kosong
  - [X] Password diberikan string kosong
  - [X] Email sudah terdaftar
  - [X] Format Email salah / invalid
  - [X] Gagal register staff karena admin belum login
  - [X] Gagal register staff karena token yang diberikan tidak valid (random string)

- [X] Create, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil membuat entitas utama
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid  
  - [X] Gagal ketika request body tidak sesuai (validation required)
  - Buatlah testing untuk masing-masing fitur

- [X] Read, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mendapatkan data Entitas Utama
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid

- [X] Read Detail, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mendapatkan 1  Entitas Utama sesuai dengan params id yang diberikan
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid
  - [X] Gagal mendapatkan Entitas Utama karena params id yang diberikan tidak ada di database / invalid

- [X] Update PUT, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mengupdate data Entitas Utama berdasarkan params id yang diberikan
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid
  - [X] Gagal karena id entity yang dikirim tidak terdapat di database
  - [X] Gagal menjalankan fitur ketika Staff mengolah data entity yang bukan miliknya
  - [X] Gagal ketika request body yang diberikan tidak sesuai

- [X] Delete, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil menghapus data Entitas Utama berdasarkan params id yang diberikan
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid
  - [X] Gagal karena id entity yang dikirim tidak terdapat di database
  - [X] Gagal menjalankan fitur ketika Staff menghapus entity yang bukan miliknya

- [X] Update PATCH, perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mengupdate imgUrl Entitas Utama berdasarkan params id yang diberikan
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid
  - [X] Gaga menjalankan fiturl karena id entity yang dikirim tidak terdapat di database
  - [X] Gagal menjalankan fitur ketika Staff mengolah data entity yang bukan miliknya
  - [X] Gagal ketika request body yang diberikan tidak sesuai

- [X] Read  Entitas kedua data genres/categories/types  perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mendapatkan data entitas kedua
  - [X] Gagal menjalankan fitur karena belum login
  - [X] Gagal menjalankan fitur karena token yang diberikan tidak valid

- [X] Endpoint  List pada public site,  perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mendapatkan Entitas Utama tanpa menggunakan query filter parameter
  - [X] Berhasil mendapatkan Entitas Utama dengan 1 query filter parameter
  - [X] Berhasil mendapatkan  Entitas Utama serta panjang yang sesuai ketika memberikan page tertentu (cek pagination-nya)
  - Pastikan untuk testing ini sediakan dulu sekitar 20 data untuk diinput di beforeAll, sehingga kita bisa melakukan ekspektasi pada data dan jumlahnya yang kita dapat ketika filter dan pagination

- [X] Endpoint  Detail pada public site,  perlu melakukan pengecekan pada status dan response ketika:
  - [X] Berhasil mendapatkan 1  Entitas Utama sesuai dengan params id yang diberikan
  - [X] Gagal mendapatkan Entitas Utama karena params id yang diberikan tidak ada di database / invalid

### **Sorting and Pagination, Filter**

Mengimplementasikan sorting, pagination dan filter pada aplikasi server yang sudah dibuat

- [X] Get list entitas utama pada Public Site
  - [X] Search menggunakan title/name Entitas Utama
  - [X] Sorting berdasarkan data terbaru/terlama (ASC/DESC)
  - [X] Filter Entitas Utama berdasarkan Entitas Kedua (genres/categories/types)
  - [X] Pagination dengan limit data per page berjumlah 10

## **W1D4 & W1D6**

Target: Melakukan deployment menggunakan AWS EC2/GCP/Cloud Deployment lainnya untuk server yang telah dibuat

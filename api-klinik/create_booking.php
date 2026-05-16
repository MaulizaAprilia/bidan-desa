<?php
// 1. HEADER CORS (WAJIB)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. TANGANI PREFLIGHT (WAJIB)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -----------------------------------------------------------------
// 3. KODE ANDA
// -----------------------------------------------------------------

include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (is_null($data)) {
    echo json_encode(['status' => 'error', 'message' => 'Data JSON tidak diterima atau format salah.']);
    exit();
}

// Definisikan variabel statement di luar try agar bisa diakses di akhir
$stmt_pasien = null;
$stmt_booking = null;

try {
    // Ambil data (lebih aman memindahkannya ke dalam try)
    $nik = $koneksi->real_escape_string($data->nik);
    $nama = $koneksi->real_escape_string($data->nama);
    $tanggalLahir = $koneksi->real_escape_string($data->tanggalLahir);
    $telepon = $koneksi->real_escape_string($data->telepon);
    $email = $koneksi->real_escape_string($data->email);
    $alamat = $koneksi->real_escape_string($data->alamat);
    $layanan_id = (int)$data->layanan_id;
    $tanggalKunjungan = $koneksi->real_escape_string($data->tanggalKunjungan);
    $waktu = $koneksi->real_escape_string($data->waktu . ':00');
    $keluhan = $koneksi->real_escape_string($data->keluhan);
    $riwayatPenyakit = $koneksi->real_escape_string($data->riwayatPenyakit);
    $kode_booking = $koneksi->real_escape_string($data->kode_booking);

    // Mulai transaksi
    $koneksi->begin_transaction();

    // 1. Pasien
    $stmt_pasien = $koneksi->prepare(
        "INSERT INTO pasien (nik, nama_lengkap, tanggal_lahir, telepon, email, alamat) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         nama_lengkap = ?, tanggal_lahir = ?, telepon = ?, email = ?, alamat = ?"
    );
    $stmt_pasien->bind_param(
        "sssssssssss", 
        $nik, $nama, $tanggalLahir, $telepon, $email, $alamat,
        $nama, $tanggalLahir, $telepon, $email, $alamat
    );
    $stmt_pasien->execute();
    
    $pasien_id = $koneksi->insert_id;
    if ($pasien_id == 0) {
        $result_pasien = $koneksi->query("SELECT id FROM pasien WHERE nik = '$nik'");
        $pasien_id = $result_pasien->fetch_assoc()['id'];
    }

    // 2. Booking
    $stmt_booking = $koneksi->prepare(
        "INSERT INTO booking (kode_booking, pasien_id, layanan_id, tanggal_kunjungan, waktu, keluhan, riwayat_penyakit, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'menunggu')"
    );
    $stmt_booking->bind_param(
        "siissss", 
        $kode_booking, $pasien_id, $layanan_id, $tanggalKunjungan, $waktu, $keluhan, $riwayatPenyakit
    );
    $stmt_booking->execute();
    
    $koneksi->commit();
    echo json_encode(['status' => 'success', 'message' => 'Booking berhasil dibuat.']);

} catch (mysqli_sql_exception $exception) {
    $koneksi->rollback();
    // Kirim pesan error database yang asli, ini sangat membantu debugging
    echo json_encode(['status' => 'error', 'message' => 'Gagal membuat booking: ' . $exception->getMessage()]);
}

// --- INI PERBAIKANNYA ---
// Pastikan untuk menutup statement HANYA jika mereka berhasil dibuat (tidak null)
if ($stmt_pasien) {
    $stmt_pasien->close();
}
if ($stmt_booking) {
    $stmt_booking->close();
}
$koneksi->close();

?>
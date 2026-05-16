<?php
// File: update_booking.php

// Izinkan CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Koneksi ke database
$servername = "localhost";
$username = "root"; // Sesuaikan dengan username DB Anda
$password = ""; // Sesuaikan dengan password DB Anda
$dbname = "db_klinik_bidan"; // <-- PERBAIKAN 1: Nama database disesuaikan

$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $conn->connect_error]);
    exit();
}

// Ambil data JSON dari body request
$data = json_decode(file_get_contents("php://input"));

// Pastikan data yang dibutuhkan ada
if (!isset($data->id) || !isset($data->tanggal_kunjungan) || !isset($data->waktu)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap. ID, tanggal, dan waktu diperlukan.']);
    exit();
}

// Ambil data dari objek JSON
$id = $data->id;
$tanggal_kunjungan = $data->tanggal_kunjungan;
$waktu = $data->waktu;
$keluhan = $data->keluhan ?? ''; 
$hasil_pemeriksaan = $data->hasil_pemeriksaan ?? null;

// Gunakan prepared statement untuk keamanan
// PERBAIKAN 2: Nama tabel diubah dari 'bookings' menjadi 'booking'
$stmt = $conn->prepare("UPDATE booking SET tanggal_kunjungan = ?, waktu = ?, keluhan = ?, hasil_pemeriksaan = ? WHERE id = ?");

if ($stmt === false) {
    echo json_encode(['status' => 'error', 'message' => 'Gagal mempersiapkan statement: ' . $conn->error]);
    exit();
}

// Binding parameter ke statement (s = string, i = integer)
$stmt->bind_param("ssssi", $tanggal_kunjungan, $waktu, $keluhan, $hasil_pemeriksaan, $id);

// Eksekusi statement
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Data booking berhasil diperbarui.']);
    } else {
        // Ini bukan error, tapi info bahwa tidak ada baris yang berubah. Bisa jadi data yang dikirim sama persis.
        echo json_encode(['status' => 'success', 'message' => 'Tidak ada perubahan data yang dilakukan.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui data: ' . $stmt->error]);
}

// Tutup statement dan koneksi
$stmt->close();
$conn->close();
?>
<?php
// Izinkan akses dari React (http://localhost:3000)
header("Access-Control-Allow-Origin: http://localhost:3000");
// Izinkan metode HTTP yang akan kita gunakan
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// Izinkan header tertentu
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Atur tipe konten output sebagai JSON
header("Content-Type: application/json");

// Tangani request OPTIONS (preflight request) yang dikirim browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ---- KONEKSI KE DATABASE ----
$host = "localhost";
$user = "root"; // User default XAMPP
$pass = "";     // Password default XAMPP (kosong)
$db   = "db_klinik_bidan"; // Nama database Anda

$koneksi = new mysqli($host, $user, $pass, $db);

if ($koneksi->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $koneksi->connect_error]);
    exit();
}

// Set charset ke utf8mb4
$koneksi->set_charset("utf8mb4");
?>
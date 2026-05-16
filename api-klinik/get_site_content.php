<?php
include 'koneksi.php';

// Siapkan array output
$output = [
    'beranda' => [],
    'layanan' => [], // <-- Kunci 'layanan' untuk React
    'paket'   => [],
    'jadwal'  => []
];

// 1. Ambil data Beranda
$result_beranda = $koneksi->query("SELECT * FROM beranda ORDER BY id ASC");
if ($result_beranda) {
    while($row = $result_beranda->fetch_assoc()) {
        $output['beranda'][] = $row;
    }
}

// 2. Ambil data Layanan (dari tabel 'layanan_konten')
// INI ADALAH PERBAIKAN PENTING:
$result_layanan = $koneksi->query("SELECT * FROM layanan_konten ORDER BY id ASC"); 
if ($result_layanan) {
    while($row = $result_layanan->fetch_assoc()) {
        // Data dimasukkan ke kunci 'layanan' agar dibaca oleh React
        $output['layanan'][] = $row; 
    }
}

// 3. Ambil data Paket
$result_paket = $koneksi->query("SELECT * FROM paket ORDER BY id ASC");
if ($result_paket) {
    while($row = $result_paket->fetch_assoc()) {
        // Konversi 0/1 dari DB ke true/false untuk React
        $row['popular'] = (bool)$row['popular'];
        $output['paket'][] = $row;
    }
}

// 4. Ambil data Jadwal
$result_jadwal = $koneksi->query("SELECT * FROM jadwal ORDER BY id ASC");
if ($result_jadwal) {
    while($row = $result_jadwal->fetch_assoc()) {
        $output['jadwal'][] = $row;
    }
}

// Kembalikan semua data sebagai satu objek JSON
echo json_encode($output);

$koneksi->close();
?>
<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->nik)) {
    $nik = $koneksi->real_escape_string($data->nik);
    $nama = $koneksi->real_escape_string($data->nama);
    $tanggalLahir = $koneksi->real_escape_string($data->tanggal_lahir); // pastikan nama field konsisten
    $telepon = $koneksi->real_escape_string($data->telepon);
    $email = $koneksi->real_escape_string($data->email);
    $alamat = $koneksi->real_escape_string($data->alamat);

    $stmt = $koneksi->prepare(
        "UPDATE pasien 
         SET 
            nama_lengkap = ?, 
            tanggal_lahir = ?, 
            telepon = ?, 
            email = ?, 
            alamat = ? 
         WHERE 
            nik = ?"
    );
    $stmt->bind_param("ssssss", $nama, $tanggalLahir, $telepon, $email, $alamat, $nik);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Data pasien berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui data: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'NIK tidak ditemukan']);
}

$koneksi->close();
?>
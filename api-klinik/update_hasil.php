<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->hasilPemeriksaan)) {
    $id = (int)$data->id;
    $hasilPemeriksaan = $koneksi->real_escape_string($data->hasilPemeriksaan);
    $tanggalPemeriksaan = date('Y-m-d H:i:s'); // Waktu sekarang

    $stmt = $koneksi->prepare(
        "UPDATE booking 
         SET 
            hasil_pemeriksaan = ?, 
            status = 'selesai', 
            tanggal_pemeriksaan = ? 
         WHERE 
            id = ?"
    );
    $stmt->bind_param("ssi", $hasilPemeriksaan, $tanggalPemeriksaan, $id);

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success', 
            'message' => 'Hasil berhasil disimpan',
            'data' => [ // Kirim data update kembali ke React
                'id' => $id,
                'hasil_pemeriksaan' => $hasilPemeriksaan,
                'status' => 'selesai',
                'tanggal_pemeriksaan' => $tanggalPemeriksaan
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan hasil: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
}

$koneksi->close();
?>
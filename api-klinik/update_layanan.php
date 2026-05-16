<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->title)) {
    $id = (int)$data->id;
    $icon = $koneksi->real_escape_string($data->icon);
    $title = $koneksi->real_escape_string($data->title);
    $desc = $koneksi->real_escape_string($data->desc);
    $features = $koneksi->real_escape_string($data->features);
    $price = $koneksi->real_escape_string($data->price);
    $color = $koneksi->real_escape_string($data->color);

    // PASTIKAN NAMA TABEL DI SINI 'layanan_konten'
    $stmt = $koneksi->prepare("UPDATE layanan_konten SET icon = ?, title = ?, `desc` = ?, features = ?, price = ?, color = ? WHERE id = ?");
    $stmt->bind_param("ssssssi", $icon, $title, $desc, $features, $price, $color, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui layanan: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID atau data tidak ditemukan']);
}
$koneksi->close();
?>
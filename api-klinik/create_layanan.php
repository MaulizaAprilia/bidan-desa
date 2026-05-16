<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->title) && isset($data->icon)) {
    $icon = $koneksi->real_escape_string($data->icon);
    $title = $koneksi->real_escape_string($data->title);
    $desc = $koneksi->real_escape_string($data->desc);
    $features = $koneksi->real_escape_string($data->features);
    $price = $koneksi->real_escape_string($data->price);
    $color = $koneksi->real_escape_string($data->color);

    // PASTIKAN NAMA TABEL DI SINI 'layanan_konten'
    $stmt = $koneksi->prepare("INSERT INTO layanan_konten (icon, title, `desc`, features, price, color) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $icon, $title, $desc, $features, $price, $color);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Layanan berhasil ditambahkan']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menambahkan layanan: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
}
$koneksi->close();
?>
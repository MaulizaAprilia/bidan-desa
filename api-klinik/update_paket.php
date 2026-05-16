<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->name)) {
    $id = (int)$data->id;
    $name = $koneksi->real_escape_string($data->name);
    $price = $koneksi->real_escape_string($data->price);
    $period = $koneksi->real_escape_string($data->period);
    $features = $koneksi->real_escape_string($data->features);
    $popular = (int)$data->popular;

    $stmt = $koneksi->prepare("UPDATE paket SET name = ?, price = ?, period = ?, features = ?, popular = ? WHERE id = ?");
    $stmt->bind_param("ssssii", $name, $price, $period, $features, $popular, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Paket berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui paket: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID atau data tidak ditemukan']);
}
$koneksi->close();
?>
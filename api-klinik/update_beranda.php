<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->title)) {
    $id = (int)$data->id;
    $iconName = $koneksi->real_escape_string($data->iconName);
    $title = $koneksi->real_escape_string($data->title);
    $desc = $koneksi->real_escape_string($data->desc);
    $color = $koneksi->real_escape_string($data->color);

    $stmt = $koneksi->prepare("UPDATE beranda SET iconName = ?, title = ?, `desc` = ?, color = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $iconName, $title, $desc, $color, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Fitur beranda berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui fitur: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID atau data tidak ditemukan']);
}
$koneksi->close();
?>
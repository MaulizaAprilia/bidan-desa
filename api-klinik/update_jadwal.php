<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->id) && isset($data->days)) {
    $id = (int)$data->id;
    $days = $koneksi->real_escape_string($data->days);
    $slots = $koneksi->real_escape_string($data->slots);

    $stmt = $koneksi->prepare("UPDATE jadwal SET days = ?, slots = ? WHERE id = ?");
    $stmt->bind_param("ssi", $days, $slots, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Jadwal berhasil diperbarui']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui jadwal: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID atau data tidak ditemukan']);
}
$koneksi->close();
?>
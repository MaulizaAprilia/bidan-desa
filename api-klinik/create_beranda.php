<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->title) && isset($data->iconName)) {
    $iconName = $koneksi->real_escape_string($data->iconName);
    $title = $koneksi->real_escape_string($data->title);
    // Gunakan backtick (`) pada `desc` karena mungkin reserved keyword
    $desc = $koneksi->real_escape_string($data->desc);
    $color = $koneksi->real_escape_string($data->color);

    $stmt = $koneksi->prepare("INSERT INTO beranda (iconName, title, `desc`, color) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $iconName, $title, $desc, $color);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Fitur beranda berhasil ditambahkan']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menambahkan fitur: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
}
$koneksi->close();
?>
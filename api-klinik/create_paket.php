<?php
include 'koneksi.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->name) && isset($data->price)) {
    $name = $koneksi->real_escape_string($data->name);
    $price = $koneksi->real_escape_string($data->price);
    $period = $koneksi->real_escape_string($data->period);
    $features = $koneksi->real_escape_string($data->features);
    // Form React mengirim '1' atau '0' sebagai string, konversi ke integer
    $popular = (int)$data->popular;

    $stmt = $koneksi->prepare("INSERT INTO paket (name, price, period, features, popular) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $name, $price, $period, $features, $popular);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Paket berhasil ditambahkan']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menambahkan paket: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
}
$koneksi->close();
?>
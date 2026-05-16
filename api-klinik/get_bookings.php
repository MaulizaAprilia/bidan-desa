<?php
include 'koneksi.php';

$sql = "
    SELECT 
        b.id,
        b.kode_booking,
        p.nama_lengkap AS nama,
        p.nik,
        p.tanggal_lahir,
        p.telepon,
        p.email,
        p.alamat,
        l.nama_layanan AS layanan,
        b.tanggal_kunjungan,
        b.waktu,
        b.keluhan,
        b.riwayat_penyakit,
        b.status,
        b.hasil_pemeriksaan,
        b.tanggal_pemeriksaan
    FROM 
        booking AS b
    LEFT JOIN 
        pasien AS p ON b.pasien_id = p.id
    LEFT JOIN 
        layanan AS l ON b.layanan_id = l.id
    ORDER BY 
        b.tanggal_kunjungan DESC, b.waktu DESC;
";

$result = $koneksi->query($sql);

$data = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);

$koneksi->close();
?>
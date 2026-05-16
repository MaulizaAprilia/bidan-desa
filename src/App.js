import React, { useState, useEffect, useCallback } from 'react';
import {
  // Pastikan semua ikon yang Anda perlukan ada di sini
  Calendar, Mail, Phone, MapPin, Clock, CheckCircle, User, Heart, Baby, Syringe, Users,
  FileText, ClipboardList, LogOut, TrendingUp, Activity, Lock, Eye, EyeOff, Search,
  Edit2, Trash2, Save, X, Plus, AlertTriangle
} from 'lucide-react';
import logo from './kakla.png'; // <-- PASTIKAN LOGO ADA DI FOLDER YANG SAMA

// URL API Backend Anda di XAMPP
const API_URL = 'https://bidandesa.infinityfreeapp.com/api-klinik';

// --- BARU: Icon Helper ---
// Peta untuk memetakan nama string ke komponen ikon yang diimpor
// Ini PENTING untuk me-render ikon dinamis di Halaman Beranda
const IconMap = {
  Calendar, Mail, Phone, MapPin, Clock, CheckCircle, User, Heart, Baby, Syringe, Users,
  FileText, ClipboardList, LogOut, TrendingUp, Activity, Lock, Eye, EyeOff, Search,
  Edit2, Trash2, Save, X, Plus, AlertTriangle
};

/**
 * Komponen helper untuk me-render ikon lucide berdasarkan nama string.
 * @param {{iconName: string, [key: string]: any}} props
 */
const DynamicIcon = ({ iconName, ...props }) => {
  const IconComponent = IconMap[iconName];
  // Fallback ke ikon 'Heart' jika nama tidak ditemukan
  if (!IconComponent) {
    return <Heart {...props} />;
  }
  return <IconComponent {...props} />;
};
// --- AKHIR BARU ---


function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- KONEKSI KE DATABASE (BOOKING) ---
  const [bookingHistory, setBookingHistory] = useState([]);

  // --- BARU: STATE UNTUK KONTEN SITUS ---
  // Data ini adalah data 'default' jika API gagal mengambil data dinamis.
  const [berandaFeatures, setBerandaFeatures] = useState([
    { id: 1, iconName: 'Baby', title: 'Pemeriksaan Kehamilan', desc: 'Pemeriksaan rutin kehamilan dengan peralatan modern', color: 'from-emerald-400 to-green-500' },
    { id: 2, iconName: 'User', title: 'Konsultasi Ibu Hamil', desc: 'Konsultasi kesehatan dan nutrisi untuk ibu hamil', color: 'from-teal-400 to-cyan-500' },
    { id: 3, iconName: 'Users', title: 'KB & Keluarga Berencana', desc: 'Layanan KB dan konsultasi keluarga berencana', color: 'from-green-400 to-emerald-500' },
    { id: 4, iconName: 'Syringe', title: 'Imunisasi Bayi', desc: 'Layanan imunisasi lengkap untuk bayi dan balita', color: 'from-lime-400 to-green-500' },
    { id: 5, iconName: 'Calendar', title: 'Booking Online', desc: 'Sistem pemesanan jadwal online yang mudah', color: 'from-teal-400 to-emerald-500' },
    { id: 6, iconName: 'Mail', title: 'Notifikasi Email', desc: 'Konfirmasi dan pengingat jadwal via email', color: 'from-green-400 to-teal-500' }
  ]);

  const [layananServices, setLayananServices] = useState([
    { id: 1, icon: '🤰', title: 'Pemeriksaan Kehamilan (ANC)', desc: 'Pemeriksaan rutin untuk memantau kesehatan ibu dan janin...', features: 'Pemeriksaan tekanan darah & berat badan|Monitor detak jantung janin|Konsultasi perkembangan janin|Pemberian vitamin & suplemen', price: 'Hubungi untuk info', color: 'from-emerald-500 to-green-500' },
    { id: 2, icon: '👨‍👩‍👧', title: 'Pelayanan KB (Keluarga Berencana)', desc: 'Menyediakan berbagai metode kontrasepsi yang aman...', features: 'Suntik KB 1 & 3 bulan|Pil KB|Pemasangan & Pelepasan IUD/Implan|Konseling Keluarga Berencana', price: 'Mulai dari Rp 30.000', color: 'from-lime-500 to-green-500' },
    { id: 3, icon: '🩸', title: 'Pemeriksaan Kesehatan Dasar', desc: 'Layanan pemeriksaan dasar untuk mengetahui kondisi...', features: 'Cek Gula Darah|Cek Kolesterol|Cek Asam Urat|Pemeriksaan Hemoglobin (HB)|Pengecekan Golongan Darah', price: 'Mulai dari Rp 25.000', color: 'from-teal-500 to-cyan-500' },
    { id: 4, icon: '👶', title: 'Persalinan 24 Jam', desc: 'Siaga 24 jam untuk membantu proses persalinan...', features: 'Pendampingan persalinan normal|Perawatan pasca-persalinan|Inisiasi Menyusu Dini (IMD)|Perawatan bayi baru lahir', price: 'Hubungi untuk info', color: 'from-rose-400 to-red-500' }
  ]);
  const [layananPackages, setLayananPackages] = useState([
    { id: 1, name: 'Paket Pemeriksaan Kehamilan', price: 'Rp 850.000', period: 'Untuk 9 bulan kehamilan', features: '9x pemeriksaan ANC|2x USG kehamilan|Vitamin & suplemen|Senam hamil gratis|Konsultasi unlimited', popular: false },
    { id: 2, name: 'Paket Persalinan', price: 'Rp 3.500.000', period: 'Paket lengkap persalinan', features: 'Persalinan normal|Rawat inap 2 hari|Perawatan bayi|3x periksa nifas|Konsultasi laktasi|Imunisasi Hep B0', popular: true },
    { id: 3, name: 'Paket Imunisasi Dasar', price: 'Rp 500.000', period: 'Untuk 1 tahun pertama', features: 'Hep B, BCG, Polio|DPT-HB-Hib|Campak|Monitoring tumbuh kembang|Kartu imunisasi', popular: false }
  ]);

  const [jadwalData, setJadwalData] = useState([
    { id: 1, days: 'Senin - Rabu', slots: '08:00 - 12:00 (available)|13:00 - 16:00 (available)|16:00 - 18:00 (limited)' },
    { id: 2, days: 'Kamis - Jumat', slots: '08:00 - 12:00 (available)|13:00 - 15:00 (available)|15:00 - 17:00 (limited)' },
    { id: 3, days: 'Sabtu - Minggu', slots: 'Sabtu: 08:00 - 12:00 (available)|Minggu (closed)' }
  ]);
  // --- AKHIR STATE KONTEN ---


  // Fungsi untuk mengambil data booking
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_bookings.php`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data booking dari server');
      }
      const data = await response.json();
      const formattedData = data.map(item => ({
        ...item,
        id: parseInt(item.id, 10),
        waktu: item.waktu ? item.waktu.substring(0, 5) : '00:00'
      }));
      setBookingHistory(formattedData);
    } catch (error) {
      console.error("Gagal mengambil data booking:", error);
      setBookingHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- BARU: Fungsi untuk mengambil data konten ---
  const fetchSiteContent = useCallback(async () => {
    try {
      // ANDA HARUS MEMBUAT ENDPOINT INI DI BACKEND (get_site_content.php)
      // Endpoint ini harus mengembalikan JSON seperti:
      // { "beranda": [...], "layanan": [...], "paket": [...], "jadwal": [...] }
      const response = await fetch(`${API_URL}/get_site_content.php`);
      if (!response.ok) {
        console.warn("Gagal mengambil data konten dari API, menggunakan data default.");
        return; // Gagal fetch, state awal (statis) akan digunakan
      }
      const data = await response.json();

      // Memperbarui state HANYA jika data ada
      if (data.beranda) setBerandaFeatures(data.beranda);
      if (data.layanan) setLayananServices(data.layanan);
      if (data.paket) setLayananPackages(data.paket);
      if (data.jadwal) setJadwalData(data.jadwal);

    } catch (error) {
      console.error("Gagal mengambil data konten:", error);
      // Biarkan data default jika gagal
    }
  }, []);

  // Mengambil data saat aplikasi pertama kali dimuat
  useEffect(() => {
    fetchData();
    fetchSiteContent(); // Panggil fungsi baru
  }, [fetchData, fetchSiteContent]); // Tambahkan dependensi


  // Login/Logout (masih sama)
  const users = [
    { id: 1, username: 'bidan', password: 'bidan123', role: 'bidan', name: 'Bidan Alfera Azmmi' }
  ];

  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user && user.role === 'bidan') {
      setIsAuthenticated(true);
      setUserRole('bidan');
      setCurrentPage('dashboard');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('patient');
    setCurrentPage('home');
  };

  const renderPage = () => {
    // Tampilkan loading spinner
    if (isLoading && !isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Clock className="w-12 h-12 text-lime-600 animate-spin" />
            <h2 className="text-2xl font-bold text-lime-600">Memuat Data...</h2>
          </div>
        </div>
      );
    }

    if (userRole === 'bidan' && isAuthenticated) {
      // Bidan yang sudah login
      switch (currentPage) {
        case 'dashboard':
          return <DashboardBidan bookingHistory={bookingHistory} />;
        case 'pasien':
          return <DataPasienPage
            bookingHistory={bookingHistory}
            setBookingHistory={setBookingHistory}
            apiUrl={API_URL}
            refreshData={fetchData}
          />;
        case 'riwayat':
          return <RiwayatPage
            bookingHistory={bookingHistory}
            setBookingHistory={setBookingHistory}
            apiUrl={API_URL}
          />;
        // --- HALAMAN BARU ---
        case 'content':
          return <KelolaKontenPage
            currentData={{
              beranda: berandaFeatures,
              layanan: layananServices,
              paket: layananPackages,
              jadwal: jadwalData
            }}
            refreshContent={fetchSiteContent} // Fungsi untuk muat ulang data
            apiUrl={API_URL}
          />;
        // --- AKHIR HALAMAN BARU ---
        default:
          return <DashboardBidan bookingHistory={bookingHistory} />;
      }
    } else {
      // Pengunjung/Pasien
      switch (currentPage) {
        case 'home':
          // Pass data dinamis ke komponen
          return <HomePage setCurrentPage={setCurrentPage} features={berandaFeatures} />;
        case 'profil':
          return <ProfilPage />;
        case 'layanan':
          // Pass data dinamis ke komponen
          return <LayananPage setCurrentPage={setCurrentPage} services={layananServices} packages={layananPackages} />;
        case 'jadwal':
          // Pass data dinamis ke komponen
          return <JadwalPage setCurrentPage={setCurrentPage} schedule={jadwalData} />;
        case 'booking':
          return <BookingPage
            setShowModal={setShowModal}
            setBookingId={setBookingId}
            apiUrl={API_URL}
            onBookingSuccess={fetchData} // Refresh data setelah booking berhasil
          />;
        default:
          return <HomePage setCurrentPage={setCurrentPage} features={berandaFeatures} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        setShowLoginModal={setShowLoginModal}
        handleLogout={handleLogout}
      />
      <main>
        {renderPage()}
      </main>
      <Footer />
      {showModal && <SuccessModal bookingId={bookingId} setShowModal={setShowModal} setCurrentPage={setCurrentPage} />}
      {showLoginModal && <LoginModal setShowLoginModal={setShowLoginModal} handleLogin={handleLogin} />}
    </div>
  );
}

// ============== KOMPONEN LOGIN (Sama) ==============
function LoginModal({ setShowLoginModal, handleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = handleLogin(username, password);
    if (!success) {
      setError('Username atau password salah!');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Login Bidan</h2>
          <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4 animate-shake">
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="Masukkan username"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none pr-12 transition-colors"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {/* --- PERUBAHAN UI --- */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Login
          </button>
          {/* --- AKHIR PERUBAHAN UI --- */}
        </form>
      </div>
    </div>
  );
}

// ============== HEADER (DIMODIFIKASI) ==============
function Header({ currentPage, setCurrentPage, userRole, isAuthenticated, setShowLoginModal, handleLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const patientNavItems = [
    { id: 'home', label: 'Beranda', icon: <Heart className="w-4 h-4" /> },
    { id: 'profil', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'layanan', label: 'Layanan', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'jadwal', label: 'Jadwal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'booking', label: 'Booking', icon: <Phone className="w-4 h-4" /> }
  ];

  // --- NAVIGASI BIDAN DIMODIFIKASI ---
  const bidanNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'pasien', label: 'Data Pasien', icon: <Users className="w-4 h-4" /> },
    { id: 'riwayat', label: 'Riwayat', icon: <FileText className="w-4 h-4" /> },
    { id: 'content', label: 'Kelola Konten', icon: <Edit2 className="w-4 h-4" /> } // <-- ITEM BARU
  ];
  // --- AKHIR MODIFIKASI ---

  const navItems = (userRole === 'bidan' && isAuthenticated) ? bidanNavItems : patientNavItems;

  return (
    // --- PERUBAHAN UI ---
    <header className="bg-[#3c5926] text-white sticky top-0 z-40 shadow-2xl">
      {/* --- AKHIR PERUBAHAN UI --- */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">

          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setCurrentPage(userRole === 'bidan' && isAuthenticated ? 'dashboard' : 'home')}
          >
            <img
              src={logo}
              alt="Logo Klinik Bidan Desa"
              className="h-16 w-16 rounded-full object-cover border-2 border-white/50"
            />

            <h1 className="text-3xl font-bold text-white hidden md:block">
              Praktek Bidan Desa
            </h1>

          </div>

          {/* Navigasi dan Tombol Login/Logout (tetap di sebelah kanan) */}
          <nav className="hidden md:flex gap-2 items-center">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${currentPage === item.id
                    // --- PERUBAHAN UI (Warna teks aktif) ---
                    ? 'bg-white text-lime-600 shadow-lg transform scale-105 font-bold'
                    : 'hover:bg-white/20'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {userRole === 'bidan' && isAuthenticated ? (
              <button onClick={handleLogout} className="ml-4 bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              // --- PERUBAHAN UI ---
              <button onClick={() => setShowLoginModal(true)} className="ml-4 bg-yellow-500 text-gray-900 px-6 py-2 rounded-xl font-bold hover:bg-yellow-600 transition-all shadow-lg flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Login bidan
              </button>
              // --- AKHIR PERUBAHAN UI ---
            )}
          </nav>

          {/* Tombol Menu Mobile */}
          <button className="md:hidden bg-white/20 p-2 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className="w-6 h-0.5 bg-white mb-1 rounded"></div>
            <div className="w-6 h-0.5 bg-white mb-1 rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
          </button>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-2 bg-white/10 backdrop-blur-md rounded-xl p-4">
            {/* Judul ditambahkan di menu mobile juga */}
            <div className="flex items-center gap-3 p-4">
              <img
                src={logo}
                alt="Logo Klinik Bidan Desa"
                className="h-10 w-10 rounded-full object-cover border-2 border-white/50"
              />
              <h3 className="text-xl font-bold text-white">
                Praktek Bidan Desa
              </h3>
            </div>

            {navItems.map(item => (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 text-left py-3 px-4 rounded-lg transition-all ${currentPage === item.id
                    // --- PERUBAHAN UI (Warna teks aktif) ---
                    ? 'bg-white text-lime-600 font-bold' : 'hover:bg-white/20'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {userRole === 'bidan' && isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="bg-red-500 text-white px-4 py-3 rounded-lg font-bold text-center flex items-center gap-2 justify-center">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              // --- PERUBAHAN UI ---
              <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="bg-yellow-500 text-gray-900 px-4 py-3 rounded-lg font-bold text-center flex items-center gap-2 justify-center hover:bg-yellow-600">
                <Lock className="w-4 h-4" />
                Login Bidan
              </button>
              // --- AKHIR PERUBAHAN UI ---
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

// ============== FOOTER (Sama) ==============
function Footer() {
  const address = "Salambuku Dusun IV, Rt. 04";
  const phoneNumber = "0812-3456-7890";
  const emailAddress = "info@praktekbidandesa.com";

  return (
    // --- PERUBAHAN UI ---
    <footer className="bg-[#3c5926] text-white py-6 px-4">
      {/* --- AKHIR PERUBAHAN UI --- */}

      <div className="max-w-4xl mx-auto flex flex-col items-center">

        <div className="flex items-center gap-4 mb-4">
          <img
            src={logo}
            alt="Logo Klinik Bidan Desa"
            className="h-12 w-12 rounded-full object-cover border-2 border-white/50"
          />
          <h3 className="text-2xl font-bold">Praktek Bidan Desa</h3>
        </div>

        <div className="space-y-2 mb-4">
          <p className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors">
            <MapPin className="w-4 h-4 text-white flex-shrink-0" />
            <span>{address}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-white flex-shrink-0" />
            <span>{phoneNumber}</span>
          </p>
          <p className="flex items-center gap-3 text-sm text-gray-100 hover:text-white transition-colors">
            <Mail className="w-4 h-4 text-white flex-shrink-0" />
            <span>{emailAddress}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-white/30 w-full text-center">
          <p className="text-gray-200 text-sm">
            © 2025 Praktek Bidan Desa. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

// ============== SUCCESS MODAL (Sama) ==============
function SuccessModal({ bookingId, setShowModal, setCurrentPage }) {
  const handleClose = () => {
    setShowModal(false);
    setCurrentPage('home');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl animate-fade-in-up">
        {/* --- PERUBAHAN UI --- */}
        <div className="w-24 h-24 bg-lime-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          {/* --- AKHIR PERUBAHAN UI --- */}
          <CheckCircle className="w-14 h-14 text-white" />
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Booking Berhasil!</h2>
        <p className="text-gray-600 mb-6 text-lg">Terima kasih telah melakukan pemesanan jadwal konsultasi.</p>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl mb-6 border-2 border-emerald-200">
          <p className="text-sm text-gray-600 mb-2">ID Booking:</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{bookingId}</p>
        </div>
        <p className="text-gray-600 mb-2">📧 Konfirmasi booking (simulasi) telah dikirim ke email Anda.</p>
        <p className="text-gray-600 mb-8">💾 Simpan ID booking ini untuk keperluan konfirmasi.</p>
        {/* --- PERUBAHAN UI --- */}
        <button onClick={handleClose}
          className="w-full bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg transform hover:scale-105">
          Tutup
        </button>
        {/* --- AKHIR PERUBAHAN UI --- */}
      </div>
    </div>
  );
}


// ============== HALAMAN-HALAMAN UNTUK BIDAN (SETELAH LOGIN) ==============

// ============== DASHBOARD BIDAN (Sama) ==============
function DashboardBidan({ bookingHistory }) {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookingHistory.filter(b => b.status === 'menunggu' && b.tanggal_kunjungan === today);
  const completedToday = bookingHistory.filter(b => b.status === 'selesai' && b.tanggal_pemeriksaan === today).length;

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">Dashboard Bidan</h1>
          <p className="text-gray-600 text-lg">Selamat datang kembali, Bidan Alfera Azmi 👋</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* --- PERUBAHAN UI (KARTU STAT) --- */}
          <div className="bg-lime-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <TrendingUp className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-white/90 text-sm mb-2">Jadwal Hari Ini</p>
            <p className="text-5xl font-bold text-white">{todayBookings.length}</p>
          </div>

          <div className="bg-lime-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-white/90 text-sm mb-2">Selesai Hari Ini</p>
            <p className="text-5xl font-bold text-white">{completedToday}</p>
          </div>

          <div className="bg-lime-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Users className="w-10 h-10 text-white" />
              </div>
              <Heart className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-white/90 text-sm mb-2">Total Pasien Terdaftar</p>
            <p className="text-5xl font-bold text-white">{[...new Set(bookingHistory.map(p => p.nik))].length}</p>
          </div>
          {/* --- AKHIR PERUBAHAN UI --- */}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            {/* --- PERUBAHAN UI --- */}
            <div className="bg-lime-600 p-3 rounded-2xl">
              {/* --- AKHIR PERUBAHAN UI --- */}
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Jadwal Hari Ini ({today})</h2>
          </div>
          {todayBookings.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada jadwal untuk hari ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.map(booking => (
                <div key={booking.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-xl transition-all bg-gradient-to-r from-white to-emerald-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600 mb-1">{booking.nama}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        {booking.layanan}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                        🕐 {booking.waktu}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">ID: {booking.kode_booking}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-white/50 rounded-xl p-4">
                    <p><strong>📋 NIK:</strong> {booking.nik}</p>
                    <p><strong>📞 Telepon:</strong> {booking.telepon}</p>
                  </div>
                  <div className="mt-4 bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400">
                    <p className="text-sm"><strong className="text-amber-700">💬 Keluhan:</strong> <span className="text-gray-700">{booking.keluhan || '-'}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== DATA PASIEN (Sama) ==============
function DataPasienPage({ bookingHistory, setBookingHistory, apiUrl, refreshData }) {
  const [selectedPatient, setSelectedPatient] = useState(null); // Ini menampung *objek booking*
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState(null); // Ini menampung *ID booking*
  const [editForm, setEditForm] = useState({});

  // FUNGSI UPDATE HASIL
  const handleSaveHasil = async () => {
    if (!hasilPemeriksaan.trim()) {
      alert('Mohon isi hasil pemeriksaan');
      return;
    }

    const updateData = {
      id: selectedPatient.id, // ID booking
      hasilPemeriksaan: hasilPemeriksaan
    };

    try {
      const response = await fetch(`${apiUrl}/update_hasil.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();

      if (result.status === 'success') {
        // Panggil refreshData untuk mengambil data baru dari DB
        await refreshData();
        setSelectedPatient(null);
        setHasilPemeriksaan('');
        alert('✅ Hasil pemeriksaan berhasil disimpan');
      } else {
        alert('Gagal menyimpan hasil: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Gagal terhubung ke server.');
    }
  };

  // FUNGSI INI DIHAPUS KARENA MENYEBABKAN WARNING
  // const handleDeleteBooking = ...

  const handleEditPatient = (patient) => {
    setEditingPatient(patient.id);
    setEditForm({ ...patient });
  };

  // FUNGSI UPDATE PASIEN
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${apiUrl}/update_pasien.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm) // Mengirim seluruh data form
      });
      const result = await response.json();

      if (result.status === 'success') {
        // Panggil refreshData untuk data yang konsisten
        await refreshData();
        setEditingPatient(null);
        alert('✅ Data pasien berhasil diperbarui');
      } else {
        alert('Gagal update data: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Gagal terhubung ke server.');
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Logika untuk menampilkan pasien unik (berdasarkan NIK)
  const uniquePatients = [...new Map(bookingHistory.map(item => [item.nik, item])).values()];

  const filteredPatients = uniquePatients.filter(patient =>
    patient.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nik.includes(searchTerm)
  );

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 text-center">Data Pasien</h1>
          <p className="text-gray-600 text-lg text-center mb-6">Kelola data unik pasien</p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredPatients.map(patient => (
            <div key={patient.nik} className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all border border-gray-100">
              {editingPatient === patient.id ? (
                // FORM UPDATE
                <div>
                  <h2 className="text-2xl font-bold text-emerald-600 mb-6">Edit Data Pasien: {patient.nama}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                      <input type="text" name="nama" value={editForm.nama} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">NIK (Tidak bisa diubah)</label>
                      <input type="text" name="nik" value={editForm.nik} readOnly className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Telepon</label>
                      <input type="text" name="telepon" value={editForm.telepon} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input type="email" name="email" value={editForm.email} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Alamat</label>
                      <textarea name="alamat" value={editForm.alamat} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" rows="2"></textarea>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {/* --- PERUBAHAN UI --- */}
                    <button onClick={handleSaveEdit} className="flex-1 bg-lime-600 text-white py-3 rounded-xl font-bold hover:bg-lime-700 transition-all flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" /> Simpan
                    </button>
                    {/* --- AKHIR PERUBAHAN UI --- */}
                    <button onClick={() => setEditingPatient(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                // TAMPILAN READ
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">{patient.nama}</h2>
                      <p className="text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> NIK: <span className="font-mono font-semibold">{patient.nik}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => handleEditPatient(patient)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {/* Tombol hapus di sini bisa membingungkan, lebih baik hapus per riwayat di RiwayatPage */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-gray-700">
                    <p><strong>🎂 Tanggal Lahir:</strong> {patient.tanggal_lahir}</p>
                    <p><strong>📞 Telepon:</strong> {patient.telepon}</p>
                    <p><strong>📧 Email:</strong> {patient.email}</p>
                    <p><strong>📍 Alamat:</strong> {patient.alamat}</p>
                  </div>

                  {/* Menampilkan tombol input jika ada booking 'menunggu' untuk NIK ini */}
                  {bookingHistory.find(b => b.nik === patient.nik && b.status === 'menunggu') &&
                    // --- PERUBAHAN UI ---
                    <button
                      onClick={() => setSelectedPatient(bookingHistory.find(b => b.nik === patient.nik && b.status === 'menunggu'))}
                      className="w-full bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg transform hover:scale-105 mt-4">
                      📝 Input Hasil Pemeriksaan (Ada Jadwal Menunggu)
                    </button>
                    // --- AKHIR PERUBAHAN UI ---
                  }
                </>
              )}
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data pasien yang ditemukan</p>
          </div>
        )}
      </div>

      {/* MODAL UNTUK CREATE HASIL PEMERIKSAAN */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Input Hasil Pemeriksaan</h2>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl mb-6 border border-emerald-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><strong className="text-emerald-600">👤 Pasien:</strong> {selectedPatient.nama}</p>
                <p><strong className="text-emerald-600">🏥 Layanan:</strong> {selectedPatient.layanan}</p>
                <p className="col-span-2"><strong className="text-emerald-600">💬 Keluhan:</strong> {selectedPatient.keluhan}</p>
                <p className="col-span-2"><strong className="text-emerald-600">📋 Riwayat:</strong> {selectedPatient.riwayat_penyakit}</p>
              </div>
            </div>

            <textarea
              value={hasilPemeriksaan}
              onChange={(e) => setHasilPemeriksaan(e.target.value)}
              placeholder="Masukkan hasil pemeriksaan secara detail (tekanan darah, berat badan, diagnosis, anjuran, dll)..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none mb-6 min-h-[200px]"
              rows="8"
              required
            />

            <div className="flex gap-4">
              <button onClick={() => { setSelectedPatient(null); setHasilPemeriksaan(''); }}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition-all">
                ❌ Batal
              </button>
              {/* --- PERUBAHAN UI --- */}
              <button onClick={handleSaveHasil}
                className="flex-1 bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg">
                ✅ Simpan Hasil
              </button>
              {/* --- AKHIR PERUBAHAN UI --- */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== RIWAYAT PAGE (Sama) ==============
function RiwayatPage({ bookingHistory, setBookingHistory, apiUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State baru untuk fitur edit
  const [editingRecord, setEditingRecord] = useState(null); // Menyimpan data yang akan diedit
  const [editForm, setEditForm] = useState({}); // Menyimpan perubahan di form edit

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
      try {
        const response = await fetch(`${apiUrl}/delete_booking.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id }),
        });
        const result = await response.json();

        if (result.status === 'success') {
          setBookingHistory(bookingHistory.filter(b => b.id !== id));
          alert('✅ Riwayat berhasil dihapus');
        } else {
          alert('Gagal menghapus data: ' + result.message);
        }
      } catch (error) {
        console.error("Error saat menghapus:", error);
        alert('Terjadi kesalahan koneksi saat menghapus data.');
      }
    }
  };

  // Fungsi baru untuk membuka modal edit
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    // Format waktu agar sesuai dengan input type="time" (HH:mm)
    const formattedRecord = {
      ...record,
      waktu: record.waktu ? record.waktu.substring(0, 5) : '00:00'
    };
    setEditForm(formattedRecord); // Salin data ke form edit
  };

  // Fungsi baru untuk menyimpan perubahan
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${apiUrl}/update_booking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();

      if (result.status === 'success') {
        // Update data di UI secara lokal
        setBookingHistory(bookingHistory.map(b => b.id === editForm.id ? { ...b, ...editForm } : b));
        setEditingRecord(null); // Tutup modal
        alert('✅ Data riwayat berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data: ' + result.message);
      }
    } catch (error) {
      console.error("Error saat update:", error);
      alert('Terjadi kesalahan koneksi saat memperbarui data.');
    }
  };

  // Fungsi baru untuk meng-handle input di form edit
  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };


  const sortedHistory = [...bookingHistory].sort((a, b) => new Date(b.tanggal_kunjungan) - new Date(a.tanggal_kunjungan));

  const filteredBookings = sortedHistory.filter(booking => {
    const searchString = `${booking.nama} ${booking.nik} ${booking.kode_booking}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3 text-center">Riwayat Pemeriksaan</h1>
          <p className="text-gray-600 text-lg text-center mb-6">Lihat semua riwayat pemeriksaan pasien</p>

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari riwayat (nama, NIK, ID Booking)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-lg"
              />
            </div>

            <div className="flex gap-3 justify-center">
              {/* --- PERUBAHAN UI (Tombol Filter Aktif) --- */}
              <button onClick={() => setFilterStatus('all')} className={`px-6 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'all' ? 'bg-lime-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                Semua
              </button>
              <button onClick={() => setFilterStatus('menunggu')} className={`px-6 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'menunggu' ? 'bg-lime-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                Menunggu
              </button>
              <button onClick={() => setFilterStatus('selesai')} className={`px-6 py-2 rounded-xl font-semibold transition-all ${filterStatus === 'selesai' ? 'bg-lime-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                Selesai
              </button>
              {/* --- AKHIR PERUBAHAN UI --- */}
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Tidak Ada Data</h3>
            <p className="text-gray-500">Tidak ada riwayat yang ditemukan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">{booking.nama}</h2>
                    <p className="text-gray-500">ID: <span className="font-mono font-semibold">{booking.kode_booking}</span></p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* Badge status (dibiarkan) untuk pembeda makna */}
                    <span className={`px-6 py-3 rounded-full text-sm font-bold shadow-lg ${booking.status === 'selesai'
                      ? 'bg-gradient-to-r from-teal-400 to-green-500 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                      }`}>
                      {booking.status === 'selesai' ? '✅ Selesai' : '⏳ Menunggu'}
                    </span>
                    {/* --- TOMBOL EDIT BARU --- */}
                    <button onClick={() => handleEditRecord(booking)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteRecord(booking.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-lg mb-4 text-emerald-700">Detail Kunjungan</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Layanan:</strong> {booking.layanan}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Tanggal:</strong> {booking.tanggal_kunjungan} @ {booking.waktu}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-lg mb-4 text-amber-700">Keluhan & Riwayat</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Keluhan:</strong> {booking.keluhan || '-'}</p>
                    <p className="text-sm text-gray-600"><strong>Riwayat:</strong> {booking.riwayat_penyakit}</p>
                  </div>
                </div>

                {booking.hasil_pemeriksaan && (
                  <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-2xl border-l-4 border-teal-400">
                    <h3 className="font-bold text-lg mb-2 text-teal-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Hasil Pemeriksaan
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{booking.hasil_pemeriksaan}</p>
                    <p className="text-xs text-teal-600">Tanggal: {booking.tanggal_pemeriksaan}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL EDIT BARU --- */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Edit Riwayat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tanggal Kunjungan</label>
                <input type="date" name="tanggal_kunjungan" value={editForm.tanggal_kunjungan || ''} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Waktu Kunjungan</label>
                <input type="time" name="waktu" value={editForm.waktu || ''} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Keluhan</label>
                <textarea name="keluhan" value={editForm.keluhan || ''} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Hasil Pemeriksaan (Jika ada)</label>
                <textarea name="hasil_pemeriksaan" value={editForm.hasil_pemeriksaan || ''} onChange={handleInputChange} rows="4" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"></textarea>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setEditingRecord(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">Batal</button>
              {/* --- PERUBAHAN UI --- */}
              <button onClick={handleSaveEdit} className="flex-1 bg-lime-600 text-white py-3 rounded-xl font-bold hover:bg-lime-700 transition-all">Simpan Perubahan</button>
              {/* --- AKHIR PERUBAHAN UI --- */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============== BARU: HALAMAN KELOLA KONTEN ==============
/**
 * Halaman baru untuk Bidan mengelola konten situs.
 */
function KelolaKontenPage({ currentData, refreshContent, apiUrl }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi generik untuk menangani submit (Create/Update)
  const handleApiCall = async (endpoint, body, successMessage) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(successMessage);
        await refreshContent(); // Muat ulang semua data konten dari server
        setModalState({ isOpen: false, type: null, data: null });
      } else {
        alert('Gagal: ' + (result.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error("Error API call:", error);
      alert('Gagal terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk menangani HAPUS
  const handleDelete = async (type, id) => {
    let endpoint = '';
    let confirmMessage = 'Apakah Anda yakin ingin menghapus item ini?';

    switch (type) {
      case 'beranda': endpoint = 'delete_beranda.php'; break;
      case 'layanan': endpoint = 'delete_layanan.php'; break;
      case 'paket': endpoint = 'delete_paket.php'; break;
      // Jadwal biasanya di-update, bukan dihapus per item
      default: return;
    }

    if (window.confirm(confirmMessage)) {
      await handleApiCall(endpoint, { id: id }, '✅ Item berhasil dihapus');
    }
  };

  // Fungsi untuk menangani SIMPAN (Add/Edit)
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Sertakan ID jika ini adalah mode edit
    if (modalState.data?.id) {
      data.id = modalState.data.id;
    }

    let endpoint = '';
    let successMessage = '';

    switch (modalState.type) {
      case 'beranda':
        endpoint = data.id ? 'update_beranda.php' : 'create_beranda.php';
        successMessage = '✅ Fitur beranda berhasil disimpan';
        break;
      case 'layanan':
        endpoint = data.id ? 'update_layanan.php' : 'create_layanan.php';
        successMessage = '✅ Layanan berhasil disimpan';
        break;
      case 'paket':
        endpoint = data.id ? 'update_paket.php' : 'create_paket.php';
        successMessage = '✅ Paket berhasil disimpan';
        break;
      case 'jadwal':
        endpoint = 'update_jadwal.php'; // Jadwal hanya update
        successMessage = '✅ Jadwal berhasil disimpan';
        break;
      default: return;
    }

    await handleApiCall(endpoint, data, successMessage);
  };

  // Fungsi untuk membuka modal (Add/Edit)
  const openModal = (type, data = null) => {
    setModalState({ isOpen: true, type: type, data: data });
  };

  // Render Tabs
  const renderTabs = () => (
    <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
      {['beranda', 'layanan', 'paket', 'jadwal'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize px-6 py-3 font-bold text-lg transition-all ${activeTab === tab
            ? 'border-b-4 border-lime-500 text-lime-600' // --- PERUBAHAN UI ---
            : 'text-gray-500 hover:text-gray-800'
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  // Render Konten berdasarkan Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <RenderKelolaBeranda data={currentData.beranda} openModal={openModal} handleDelete={handleDelete} />;
      case 'layanan': return <RenderKelolaLayanan data={currentData.layanan} openModal={openModal} handleDelete={handleDelete} />;
      case 'paket': return <RenderKelolaPaket data={currentData.paket} openModal={openModal} handleDelete={handleDelete} />;
      case 'jadwal': return <RenderKelolaJadwal data={currentData.jadwal} openModal={openModal} />;
      default: return null;
    }
  };

  // Render Modal Form
  const renderModal = () => {
    if (!modalState.isOpen) return null;
    let formContent = null;
    let title = '';

    switch (modalState.type) {
      case 'beranda':
        title = modalState.data ? 'Edit Fitur Beranda' : 'Tambah Fitur Beranda';
        formContent = <FormBeranda data={modalState.data} />;
        break;
      case 'layanan':
        title = modalState.data ? 'Edit Layanan' : 'Tambah Layanan';
        formContent = <FormLayanan data={modalState.data} />;
        break;
      case 'paket':
        title = modalState.data ? 'Edit Paket' : 'Tambah Paket';
        formContent = <FormPaket data={modalState.data} />;
        break;
      case 'jadwal':
        title = 'Edit Slot Jadwal';
        formContent = <FormJadwal data={modalState.data} />;
        break;
      default: return null;
    }

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{title}</h2>
            <button onClick={() => setModalState({ isOpen: false, type: null, data: null })} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSave}>
            {formContent}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, type: null, data: null })}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                disabled={isSubmitting}
              >
                Batal
              </button>
              {/* --- PERUBAHAN UI --- */}
              <button
                type="submit"
                className="flex-1 bg-lime-600 text-white py-3 rounded-xl font-bold hover:bg-lime-700 transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              {/* --- AKHIR PERUBAHAN UI --- */}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 text-center">Kelola Konten Website</h1>
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {renderTabs()}
          {renderContent()}
        </div>
        {renderModal()}
      </div>
    </div>
  );
}

// --- Komponen Anak untuk KelolaKontenPage ---

// 1. BERANDA
function RenderKelolaBeranda({ data, openModal, handleDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Fitur Beranda</h3>
        {/* --- PERUBAHAN UI --- */}
        <button
          onClick={() => openModal('beranda')}
          className="bg-lime-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> Tambah Fitur
        </button>
        {/* --- AKHIR PERUBAHAN UI --- */}
      </div>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.id} className="bg-gray-50 rounded-2xl p-6 flex justify-between items-center border border-gray-200">
            <div className="flex items-center gap-4">
              {/* --- PERUBAHAN UI (Kartu) --- */}
              <div className="bg-lime-600 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                {/* --- AKHIR PERUBAHAN UI --- */}
                <DynamicIcon iconName={item.iconName} className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openModal('beranda', item)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
                <Edit2 className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete('beranda', item.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormBeranda({ data }) {
  // Daftar ikon yang bisa dipilih
  const iconOptions = Object.keys(IconMap);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Nama Ikon (dari Lucide)</label>
        <select
          name="iconName"
          defaultValue={data?.iconName || 'Heart'}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
        >
          {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-1">Pilih dari daftar ikon yang tersedia. Contoh: 'Baby', 'Syringe', 'User'.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Judul</label>
        <input type="text" name="title" defaultValue={data?.title || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Deskripsi</label>
        <textarea name="desc" defaultValue={data?.desc || ''} required rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"></textarea>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Warna Gradient (Tailwind)</label>
        <input type="text" name="color" defaultValue={data?.color || 'from-emerald-400 to-green-500'} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
        <p className="text-xs text-gray-500 mt-1">Contoh: 'from-emerald-400 to-green-500'</p>
      </div>
    </div>
  );
}

// 2. LAYANAN
function RenderKelolaLayanan({ data, openModal, handleDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Layanan</h3>
        {/* --- PERUBAHAN UI --- */}
        <button
          onClick={() => openModal('layanan')}
          className="bg-lime-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> Tambah Layanan
        </button>
        {/* --- AKHIR PERUBAHAN UI --- */}
      </div>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                {/* --- PERUBAHAN UI (Kartu) --- */}
                <div className="text-4xl w-12 h-12 flex items-center justify-center rounded-lg bg-lime-600 text-white">
                  {/* --- AKHIR PERUBAHAN UI --- */}
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                  <p className="text-sm text-gray-600"><strong>Fitur:</strong> {item.features?.split('|').join(', ')}</p>
                  <p className="text-sm text-gray-600"><strong>Harga:</strong> {item.price}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button onClick={() => openModal('layanan', item)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete('layanan', item.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormLayanan({ data }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Ikon (Emoji)</label>
        <input type="text" name="icon" defaultValue={data?.icon || '🤰'} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Judul</label>
        <input type="text" name="title" defaultValue={data?.title || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Deskripsi</label>
        <textarea name="desc" defaultValue={data?.desc || ''} required rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"></textarea>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Fitur (pisahkan dengan | )</label>
        <textarea name="features" defaultValue={data?.features || ''} required rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"></textarea>
        <p className="text-xs text-gray-500 mt-1">Contoh: Fitur A|Fitur B|Fitur C</p>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Harga</label>
        <input type="text" name="price" defaultValue={data?.price || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Warna Gradient (Tailwind)</label>
        <input type="text" name="color" defaultValue={data?.color || 'from-emerald-400 to-green-500'} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
    </div>
  );
}


// 3. PAKET
function RenderKelolaPaket({ data, openModal, handleDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Paket Layanan</h3>
        {/* --- PERUBAHAN UI --- */}
        <button
          onClick={() => openModal('paket')}
          className="bg-lime-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> Tambah Paket
        </button>
        {/* --- AKHIR PERUBAHAN UI --- */}
      </div>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.id} className={`bg-gray-50 rounded-2xl p-6 border ${item.popular ? 'border-lime-500 border-2' : 'border-gray-200'}`}> {/* --- PERUBAHAN UI --- */}
            <div className="flex justify-between items-start">
              <div>
                {/* --- PERUBAHAN UI --- */}
                <h4 className="text-lg font-bold text-gray-800">{item.name} {item.popular && <span className="text-xs bg-lime-600 text-white px-2 py-0.5 rounded-full ml-2">POPULER</span>}</h4>
                {/* --- AKHIR PERUBAHAN UI --- */}
                <p className="text-sm text-gray-600 mb-2">{item.price} ({item.period})</p>
                <p className="text-sm text-gray-600"><strong>Fitur:</strong> {item.features?.split('|').join(', ')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button onClick={() => openModal('paket', item)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete('paket', item.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormPaket({ data }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Nama Paket</label>
        <input type="text" name="name" defaultValue={data?.name || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Harga</label>
        <input type="text" name="price" defaultValue={data?.price || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Periode</label>
        <input type="text" name="period" defaultValue={data?.period || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Fitur (pisahkan dengan | )</label>
        <textarea name="features" defaultValue={data?.features || ''} required rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"></textarea>
        <p className="text-xs text-gray-500 mt-1">Contoh: Fitur A|Fitur B|Fitur C</p>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Populer?</label>
        <select
          name="popular"
          defaultValue={data?.popular ? '1' : '0'}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
        >
          <option value="1">Ya, Populer</option>
          <option value="0">Tidak</option>
        </select>
      </div>
    </div>
  );
}

// 4. JADWAL
function RenderKelolaJadwal({ data, openModal }) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Jadwal Praktik</h3>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{item.days}</h4>
                <p className="text-sm text-gray-600"><strong>Slots:</strong> {item.slots?.split('|').join(', ')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button onClick={() => openModal('jadwal', item)} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200">
                  <Edit2 className="w-5 h-5" />
                </button>
                {/* Biasanya jadwal tidak dihapus, hanya diubah */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormJadwal({ data }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Hari</label>
        <input type="text" name="days" defaultValue={data?.days || ''} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Slots (pisahkan dengan | )</label>
        <textarea name="slots" defaultValue={data?.slots || ''} required rows="3" className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"></textarea>
        <p className="text-xs text-gray-500 mt-1">Contoh: 08:00 - 12:00 (available)|13:00 - 16:00 (limited)|Minggu (closed)</p>
      </div>
    </div>
  );
}

// ============== HALAMAN-HALAMAN UNTUK PASIEN/PENGUNJUNG ==============

// ============== HOMEPAGE (DIMODIFIKASI) ==============
function HomePage({ setCurrentPage, features }) { // Terima 'features' sebagai prop
  // Hapus 'features' array statis dari sini

  return (
    <div>
      {/* --- PERUBAHAN UI (Hero) --- */}
      <section className="bg-[#3c5926] text-white py-24 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-6">
            <p className="text-sm font-semibold">✨ Layanan Kesehatan Terpercaya</p>
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">Selamat Datang di <span className="bg-white text-transparent bg-clip-text">Praktek Bidan Desa</span></h1>
          <p className="text-xl mb-10 text-white/90 leading-relaxed">Layanan kesehatan ibu dan anak yang profesional dan terpercaya. Pesan jadwal konsultasi Anda secara online dengan mudah.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {/* --- PERUBAHAN UI --- */}
            <button onClick={() => setCurrentPage('booking')}
              className="bg-lime-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-2xl transform hover:scale-105 flex items-center gap-2">
              📅 Pesan Sekarang
            </button>
            {/* --- AKHIR PERUBAHAN UI --- */}
            <button onClick={() => setCurrentPage('profil')}
              className="bg-white/10 backdrop-blur-md border-2 border-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-lime-600 transition-all flex items-center gap-2">
              👩‍⚕️ Lihat Profil Bidan
            </button>
          </div>
        </div>
      </section>
      {/* --- AKHIR PERUBAHAN UI --- */}

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">Layanan Kami</h1>
            <p className="text-gray-600 text-lg">Pelayanan kesehatan lengkap untuk ibu dan anak</p>
          </div>
          {/* --- MODIFIKASI: Gunakan 'features' prop --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.id || index} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-3 border border-gray-100">
                {/* --- PERUBAHAN UI (Kartu) --- */}
                <div className="bg-lime-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {/* --- AKHIR PERUBAHAN UI --- */}
                  {/* Gunakan DynamicIcon helper */}
                  <DynamicIcon iconName={feature.iconName} className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
          {/* --- AKHIR MODIFIKASI --- */}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-emerald-50 to-green-50">
        {/* ... (konten CTA sama) ... */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">Mengapa Memilih Kami?</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">Praktek Bidan Desa memberikan pelayanan kesehatan ibu dan anak dengan penuh kasih sayang dan profesional. Kami berkomitmen untuk memberikan yang terbaik bagi keluarga Indonesia.</p>
          {/* --- PERUBAHAN UI --- */}
          <button onClick={() => setCurrentPage('layanan')}
            className="bg-lime-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-xl transform hover:scale-105">
            🔍 Lihat Semua Layanan
          </button>
          {/* --- AKHIR PERUBAHAN UI --- */}
        </div>
      </section>
    </div>
  );
}

// ============== PROFIL PAGE (Sama, karena statis) ==============
function ProfilPage() {
  const specialties = [
    { title: 'Kehamilan & Persalinan', items: ['Pemeriksaan kehamilan rutin (ANC)', 'Konsultasi nutrisi ibu hamil', 'Pendampingan persalinan normal 24 Jam', 'Perawatan pasca-persalinan'], color: 'from-emerald-500 to-green-500' },
    { title: 'Kesehatan Umum & Dasar', items: ['Cek Gula Darah', 'Cek Kolesterol & Asam Urat', 'Pemeriksaan Hemoglobin (HB)', 'Pengecekan Golongan Darah'], color: 'from-teal-500 to-cyan-500' },
    { title: 'KB & Kesehatan Reproduksi', items: ['Konseling KB', 'Pemasangan IUD/Implan', 'Suntik KB & Pil KB', 'Konsultasi keluarga berencana'], color: 'from-green-500 to-emerald-500' },
    { title: 'Layanan Tambahan', items: ['Imunisasi Bayi', 'Home visit (sesuai perjanjian)', 'Konsultasi kesehatan umum', 'Perawatan bayi baru lahir'], color: 'from-lime-500 to-green-500' }
  ];

  return (
    <div>
      {/* --- PERUBAHAN UI --- */}
      <section className="bg-[#3c5926] text-white py-20 px-4">
        {/* --- AKHIR PERUBAHAN UI --- */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Profil Bidan</h1>
          <p className="text-xl text-white/90">Mengenal lebih dekat bidan profesional kami</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* --- PERUBAHAN UI --- */}
            <div className="w-56 h-56 bg-lime-600 rounded-full flex items-center justify-center text-8xl shadow-2xl flex-shrink-0 transform hover:scale-105 transition-transform">
              {/* --- AKHIR PERUBAHAN UI --- */}
              👩‍⚕️
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">Bidan Alfera Azmi, S.Keb</h2>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl">
                  <strong className="text-emerald-600 min-w-[140px] flex-shrink-0">📜 No. SIPB:</strong>
                  <span>162/SIPB/DPMPTSP-TK/IX/2021</span>
                </p>
                <p className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                  <strong className="text-green-600 min-w-[140px] flex-shrink-0">📍 Alamat:</strong>
                  <span>Salambuku II Dusun IV, RT. 04</span>
                </p>
                <p className="flex items-start gap-3 bg-teal-50 p-3 rounded-xl">
                  <strong className="text-teal-600 min-w-[140px] flex-shrink-0">⏰ Layanan Darurat:</strong>
                  <span>Persalinan 24 Jam</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-8">Tentang Bidan Alfera Azmi</h2>
          <div className="text-lg text-gray-700 space-y-6 bg-white p-10 rounded-3xl shadow-xl">
            <p className="leading-relaxed">
              Bidan Alfera Azmi, S.Keb adalah bidan profesional yang berdedikasi melayani kesehatan ibu dan anak di Desa Salam Buku II, Dusun IV.
            </p>
            <p className="leading-relaxed">Beliau lulusan D3 Kebidanan Politeknik Karya Husada Jakarta, kemudian menempuh S1 dan Profesi Bidan di Universitas Adiwangsa Jambi hingga lulus tahun 2025.
            </p>
            <p className="leading-relaxed">Berpengalaman lebih dari 5 tahun di RS Andimas Bangko, Bidan Alfera telah banyak menangani persalinan dan tindakan operasi. Sejak 2019, beliau mengabdi sebagai Bidan Desa Salam Buku II, memberikan layanan kehamilan, persalinan, KB, dan penyuluhan kesehatan.
            </p>
            <p className="leading-relaxed">Dengan sikap ramah, profesional, dan penuh empati, Bidan Alfera berkomitmen memberikan pelayanan yang aman, nyaman, dan berkualitas bagi masyarakat.
            </p>
            <p className="leading-relaxed">💬 “Menjadi bidan adalah panggilan hati membantu ibu melahirkan dengan selamat dan bahagia adalah kebanggaan terbesar bagi saya.” — Bidan Alfera Azmi, S.Keb</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-12">Keahlian & Layanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialties.map((specialty, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-gray-100">
                {/* --- PERUBAHAN UI --- */}
                <div className={`bg-lime-600 w-full h-2 rounded-full mb-6`}></div>
                {/* --- AKHIR PERUBAHAN UI --- */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{specialty.title}</h3>
                <ul className="space-y-3">
                  {specialty.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============== LAYANAN PAGE (DIMODIFIKASI) ==============
function LayananPage({ setCurrentPage, services, packages }) { // Terima props
  // Hapus array 'services' dan 'packages' statis dari sini

  return (
    <div>
      {/* --- PERUBAHAN UI --- */}
      <section className="bg-[#3c5926] text-white py-20 px-4">
        {/* --- AKHIR PERUBAHAN UI --- */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Layanan Kami</h1>
          <p className="text-xl text-white/90">Pelayanan kesehatan ibu dan anak yang lengkap dan profesional</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-12">Layanan Kesehatan</h2>
          {/* --- MODIFIKASI: Gunakan 'services' prop --- */}
          <div className="space-y-8">
            {services.map((service, index) => (
              <div key={service.id || index} className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all border border-gray-100">
                <div className="flex flex-col md:flex-row">
                  {/* --- PERUBAHAN UI (Kartu) --- */}
                  <div className="w-full md:w-48 bg-lime-600 flex items-center justify-center text-7xl p-12">
                    {/* --- AKHIR PERUBAHAN UI --- */}
                    {service.icon}
                  </div>
                  <div className="flex-1 p-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {/* Fitur sekarang disimpan sebagai string dipisah '|' */}
                      {(service.features || '').split('|').map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {/* --- PERUBAHAN UI --- */}
                    <span className="inline-block bg-lime-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">
                      {/* --- AKHIR PERUBAHAN UI --- */}
                      💰 {service.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* --- AKHIR MODIFIKASI --- */}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-12">Paket Layanan</h2>
          {/* --- MODIFIKASI: Gunakan 'packages' prop --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={pkg.id || index} className={`bg-white rounded-3xl shadow-xl p-8 relative transform transition-all hover:scale-105 ${pkg.popular ? 'border-4 border-lime-500 scale-105' : 'border border-gray-100'}`}> {/* --- PERUBAHAN UI --- */}
                {pkg.popular && (
                  // --- PERUBAHAN UI ---
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-lime-600 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg">
                    {/* --- AKHIR PERUBAHAN UI --- */}
                    ⭐ POPULER
                  </div>
                )}
                <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">{pkg.name}</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent text-center mb-2">{pkg.price}</div>
                <p className="text-gray-500 text-center text-sm mb-8">{pkg.period}</p>
                <ul className="space-y-4 mb-8">
                  {/* Fitur sekarang disimpan sebagai string dipisah '|' */}
                  {(pkg.features || '').split('|').map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {/* --- PERUBAHAN UI --- */}
                <button onClick={() => setCurrentPage('booking')} className="w-full bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg">
                  Pilih Paket
                </button>
                {/* --- AKHIR PERUBAHAN UI --- */}
              </div>
            ))}
          </div>
          {/* --- AKHIR MODIFIKASI --- */}
        </div>
      </section>
    </div>
  );
}

// ============== JADWAL PAGE (DIMODIFIKASI) ==============
function JadwalPage({ setCurrentPage, schedule }) { // Terima 'schedule' prop
  // Hapus array 'schedule' statis dari sini

  const getStatusBadge = (status) => {
    // Dibiarkan berwarna-warni untuk membedakan makna
    const badges = {
      available: { bg: 'bg-gradient-to-r from-emerald-400 to-green-500', text: 'text-white', label: '✅ Tersedia' },
      limited: { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'text-white', label: '⚠️ Terbatas' },
      closed: { bg: 'bg-gradient-to-r from-red-400 to-rose-500', text: 'text-white', label: '❌ Tutup' }
    };
    // Default badge jika status tidak dikenali
    const badge = badges[status] || badges['closed'];
    return <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  // Fungsi untuk mem-parsing string slot
  const parseSlots = (slotsString) => {
    return slotsString.split('|').map(slot => {
      // Regex untuk menangkap (Teks Waktu) (status)
      const match = slot.match(/(.+?)\s*\((.+)\)/);
      if (match) {
        return { time: match[1].trim(), status: match[2].trim() };
      }
      // Fallback jika format tidak cocok
      return { time: slot, status: 'closed' };
    });
  };

  return (
    <div>
      {/* --- PERUBAHAN UI --- */}
      <section className="bg-[#3c5926] text-white py-20 px-4">
        {/* --- AKHIR PERUBAHAN UI --- */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Jadwal Praktik</h1>
          <p className="text-xl text-white/90">Lihat jadwal praktik dan ketersediaan waktu konsultasi</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-12">Jadwal Praktik Mingguan</h2>
          {/* --- MODIFIKASI: Gunakan 'schedule' prop --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schedule.map((day, index) => (
              <div key={day.id || index} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all border border-gray-100">
                <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6 pb-4 border-b-2 border-emerald-200">{day.days}</h3>
                <div className="space-y-3">
                  {/* Gunakan 'parseSlots' untuk memproses string */}
                  {parseSlots(day.slots).map((slot, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl">
                      <span className="font-semibold text-gray-700">🕐 {slot.time}</span>
                      {getStatusBadge(slot.status)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* --- AKHIR MODIFIKASI --- */}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-12">Informasi Penting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center hover:shadow-2xl transition-all border border-gray-100">
              {/* --- PERUBAHAN UI --- */}
              <div className="bg-lime-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                {/* --- AKHIR PERUBAHAN UI --- */}
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Durasi Konsultasi</h3>
              <p className="text-gray-600 leading-relaxed">Setiap sesi konsultasi berlangsung sekitar 30-45 menit untuk memastikan pelayanan yang optimal</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center hover:shadow-2xl transition-all border border-gray-100">
              {/* --- PERUBAHAN UI --- */}
              <div className="bg-lime-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                {/* --- AKHIR PERUBAHAN UI --- */}
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Booking Online</h3>
              <p className="text-gray-600 leading-relaxed">Pemesanan dapat dilakukan secara online melalui website kami untuk kemudahan Anda</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center hover:shadow-2xl transition-all border border-gray-100">
              {/* --- PERUBAHAN UI --- */}
              <div className="bg-lime-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                {/* --- AKHIR PERUBAHAN UI --- */}
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Layanan Darurat</h3>
              <p className="text-gray-600 leading-relaxed">Untuk kasus darurat, kami menyediakan layanan on-call 24 jam. Hubungi: 0812-3456-7890</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PERUBAHAN UI --- */}
      <section className="py-20 px-4 bg-[#3c5926] text-white text-center">
        <h2 className="text-5xl font-bold mb-6">Siap Membuat Janji?</h2>
        <p className="text-xl mb-10 text-white/90">Pilih jadwal yang sesuai dan buat janji konsultasi Anda sekarang</p>
        <button onClick={() => setCurrentPage('booking')} className="bg-lime-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-lime-700 transition-all shadow-2xl transform hover:scale-105">
          📅 Buat Janji Sekarang
        </button>
      </section>
      {/* --- AKHIR PERUBAHAN UI --- */}
    </div>
  );
}

// ============== BOOKING PAGE (Sama) ==============
function BookingPage({ setShowModal, setBookingId, onBookingSuccess, apiUrl }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    nama: '', nik: '', tanggalLahir: '', telepon: '', email: '', alamat: '',
    layanan: '', tanggalKunjungan: '', keluhan: '', riwayatPenyakit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading

  const layananOptions = [
    { id: 1, nama: "Pemeriksaan Kehamilan" },
    { id: 2, nama: "Pelayanan KB" },
    { id: 3, nama: "Pemeriksaan Kesehatan Dasar" },
    { id: 4, nama: "Konsultasi Persalinan" },
    { id: 5, nama: "Lainnya" },
  ];

  // --- INI PERUBAHAN 1: FUNGSI handleInputChange ---
  const handleInputChange = (e) => {
    // 1. Validasi real-time saat tanggal diubah
    if (e.target.name === 'tanggalKunjungan') {
      const selectedValue = e.target.value;
      if (selectedValue) {
        const selectedDate = new Date(selectedValue);
        // Menyesuaikan dengan zona waktu lokal (masalah umum new Date('YYYY-MM-DD'))
        const userTimezoneOffset = selectedDate.getTimezoneOffset() * 60000;
        const localDate = new Date(selectedDate.getTime() + userTimezoneOffset);

        // getDay() 0 = Minggu
        if (localDate.getDay() === 0) {
          alert('Maaf, klinik tutup pada hari Minggu. Silakan pilih hari lain.');
          // Reset nilainya
          setFormData({ ...formData, [e.target.name]: '' });
          return; // Hentikan eksekusi
        }
      }
    }
    // 2. Jika bukan hari Minggu atau bukan input tanggal, update state
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // --- AKHIR PERUBAHAN 1 ---

  const validateStep1 = () => {
    const { nama, nik, tanggalLahir, telepon, email, alamat } = formData;
    if (!nama || !nik || !tanggalLahir || !telepon || !email || !alamat) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return false;
    }
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      alert('NIK harus terdiri dari 16 digit angka');
      return false;
    }
    return true;
  };

  // --- INI PERUBAHAN 2: FUNGSI validateStep2 ---
  const validateStep2 = () => {
    const { layanan, tanggalKunjungan, riwayatPenyakit } = formData;
    if (!layanan || !tanggalKunjungan || !riwayatPenyakit) {
      alert('Mohon lengkapi jenis layanan, tanggal kunjungan, dan riwayat penyakit');
      return false;
    }

    // 3. Validasi fallback (jika validasi real-time gagal)
    const selectedDate = new Date(tanggalKunjungan);
    const userTimezoneOffset = selectedDate.getTimezoneOffset() * 60000;
    const localDate = new Date(selectedDate.getTime() + userTimezoneOffset);

    if (localDate.getDay() === 0) {
      alert('Maaf, Anda memilih hari Minggu. Klinik tutup. Silakan pilih hari lain.');
      return false;
    }

    if (!selectedTime) {
      alert('Mohon pilih waktu kunjungan');
      return false;
    }
    return true;
  };
  // --- AKHIR PERUBAHAN 2 ---

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const generateBookingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'BKG';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // FUNGSI CREATE (BOOKING)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Mencegah double click
    setIsSubmitting(true);

    const newBookingId = generateBookingId();

    // Cari ID layanan berdasarkan nama
    const selectedLayanan = layananOptions.find(l => l.nama === formData.layanan);
    const layanan_id = selectedLayanan ? selectedLayanan.id : 6; // Default ke 'Lainnya'

    const newBookingData = {
      ...formData,
      kode_booking: newBookingId,
      waktu: selectedTime,
      layanan_id: layanan_id
    };

    // =================================================================
    // INI ADALAH BLOK YANG DIPERBAIKI (PERUBAHAN TERAKHIR)
    // =================================================================
    try {
      const response = await fetch(`${apiUrl}/create_booking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingData)
      });
      const result = await response.json();

      if (result.status === 'success') {
        await onBookingSuccess(); // Refresh data di App.js
        setBookingId(newBookingId);
        setShowModal(true);
      } else {
        // Cek apakah ini error duplikat email
        if (result.message && result.message.includes("Duplicate entry") && result.message.includes("pasien.email")) {
          alert('Booking Gagal!\n\nEmail yang Anda masukkan sudah terdaftar untuk pasien lain. Silakan gunakan email yang berbeda.');
        } else {
          // Error umum lainnya dari PHP
          alert('Gagal membuat booking: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Gagal terhubung ke server untuk membuat booking.');
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
    // =================================================================
    // AKHIR BLOK YANG DIPERBAIKI
    // =================================================================
  };

  const timeSlots = [
    { time: '08:00', available: true }, { time: '09:00', available: true },
    { time: '10:00', available: true }, { time: '11:00', available: true },
    { time: '13:00', available: true }, { time: '14:00', available: true },
    { time: '15:00', available: true }, { time: '16:00', available: false },
    { time: '17:00', available: false }
  ];

  return (
    <div>
      {/* --- PERUBAHAN UI --- */}
      <section className="bg-[#3c5926] text-white py-20 px-4">
        {/* --- AKHIR PERUBAHAN UI --- */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Booking Jadwal</h1>
          <p className="text-xl text-white/90">Lengkapi formulir untuk membuat janji konsultasi</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-1 bg-lime-600 transition-all duration-500" // --- PERUBAHAN UI ---
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all ${currentStep >= step
                  ? 'bg-lime-600 text-white scale-110' // --- PERUBAHAN UI ---
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step}
                </div>
                <span className={`text-sm mt-3 font-semibold ${currentStep === step ? 'text-lime-600' : 'text-gray-500'}`}> {/* --- PERUBAHAN UI --- */}
                  {step === 1 ? '📋 Data Diri' : step === 2 ? '📅 Jadwal' : '✅ Konfirmasi'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 pb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent border-b-2 border-emerald-200">Data Diri Pasien</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" name="nama" value={formData.nama} onChange={handleInputChange}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required
                      placeholder="Masukkan nama lengkap" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">NIK <span className="text-red-500">*</span></label>
                      <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} maxLength="16"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required
                        placeholder="16 digit NIK" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Tanggal Lahir <span className="text-red-500">*</span></label>
                      <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Nomor Telepon <span className="text-red-500">*</span></label>
                      <input type="tel" name="telepon" value={formData.telepon} onChange={handleInputChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required
                        placeholder="08xxxxxxxxxx" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required
                        placeholder="email@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Alamat Lengkap <span className="text-red-500">*</span></label>
                    <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows="3"
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required
                      placeholder="Salambuku II Dusun IV, Rt. 04"></textarea>
                  </div>
                </div>

                <div className="mt-10">
                  {/* --- PERUBAHAN UI --- */}
                  <button type="button" onClick={nextStep}
                    className="w-full bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg transform hover:scale-105">
                    Selanjutnya →
                  </button>
                  {/* --- AKHIR PERUBAHAN UI --- */}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 pb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent border-b-2 border-emerald-200">Pilih Jadwal Konsultasi</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Jenis Layanan <span className="text-red-500">*</span></label>
                    <select name="layanan" value={formData.layanan} onChange={handleInputChange}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required>
                      <option value="">Pilih Layanan</option>
                      {layananOptions.map(l => (
                        <option key={l.id} value={l.nama}>{l.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Tanggal Kunjungan <span className="text-red-500">*</span></label>
                    <input type="date" name="tanggalKunjungan" value={formData.tanggalKunjungan} onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required />
                  </div>

                  <div>
                    <label className="block font-semibold mb-3 text-gray-700">Pilih Waktu <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <button key={slot.time} type="button" onClick={() => slot.available && setSelectedTime(slot.time)} disabled={!slot.available}
                          // --- PERUBAHAN UI ---
                          className={`p-4 rounded-2xl font-semibold transition-all ${selectedTime === slot.time ? 'bg-lime-600 text-white shadow-lg scale-105' :
                            // --- AKHIR PERUBAHAN UI ---
                            slot.available ? 'bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:scale-105' :
                              'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            }`}>
                          🕐 {slot.time}
                          {!slot.available && <div className="text-xs mt-1">Penuh</div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Riwayat Penyakit <span className="text-red-500">*</span></label>
                    <textarea name="riwayatPenyakit" value={formData.riwayatPenyakit} onChange={handleInputChange} rows="4"
                      placeholder="Jelaskan riwayat penyakit atau kondisi kesehatan yang pernah/sedang dialami..."
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all" required></textarea>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Keluhan / Keterangan</label>
                    <textarea name="keluhan" value={formData.keluhan} onChange={handleInputChange} rows="4"
                      placeholder="Jelaskan keluhan atau keterangan tambahan..."
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all"></textarea>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button type="button" onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition-all">
                    ← Kembali
                  </button>
                  {/* --- PERUBAHAN UI --- */}
                  <button type="button" onClick={nextStep}
                    className="flex-1 bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg">
                    Selanjutnya →
                  </button>
                  {/* --- AKHIR PERUBAHAN UI --- */}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 pb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent border-b-2 border-emerald-200">Konfirmasi Data Booking</h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-xl mb-4 text-emerald-700 flex items-center gap-2">
                      <User className="w-6 h-6" /> Data Pasien
                    </h3>
                    <div className="space-y-3">
                      <p><strong>Nama:</strong> {formData.nama}</p>
                      <p><strong>NIK:</strong> {formData.nik}</p>
                      <p><strong>Telepon:</strong> {formData.telepon}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-100">
                    <h3 className="font-bold text-xl mb-4 text-teal-700 flex items-center gap-2">
                      <Calendar className="w-6 h-6" /> Detail Booking
                    </h3>
                    <div className="space-y-3">
                      <p><strong>Layanan:</strong> {formData.layanan}</p>
                      <p><strong>Tanggal:</strong> {formData.tanggalKunjungan}</p>
                      <p><strong>Waktu:</strong> {selectedTime}:00</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-xl mb-4 text-amber-700">Riwayat Penyakit</h3>
                    <p className="text-sm text-gray-700">{formData.riwayatPenyakit}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <h3 className="font-bold text-xl mb-4 text-green-700">Keluhan</h3>
                    <p className="text-sm text-gray-700">{formData.keluhan || 'Tidak ada keluhan tambahan'}</p>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button type="button" onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition-all"
                    disabled={isSubmitting}>
                    ← Kembali
                  </button>
                  {/* --- PERUBAHAN UI --- */}
                  <button type="submit"
                    className={`flex-1 bg-lime-600 text-white py-4 rounded-2xl font-bold hover:bg-lime-700 transition-all shadow-lg transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : '✅ Konfirmasi Booking'}
                  </button>
                  {/* --- AKHIR PERUBAHAN UI --- */}
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  PengaturanMap,
  PublicData,
  SchoolDatabase,
  SessionUser,
  TableName,
  UserRole,
} from '../types';

const DB_STORAGE_KEY = 'SMPN3_PAKUHAJI_WEB_DB_V2';
const SESSION_STORAGE_KEY = 'SMPN3_PAKUHAJI_SESSION_V2';

export const ALLOWED_UPLOAD_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const LOCAL_ASSETS = {
  banner1: '/src/assets/images/hero_school_campus_1795521194251.jpg',
  banner2: '/src/assets/images/hero_digital_learning_1795521194510.jpg',
  banner3: '/src/assets/images/hero_flag_ceremony_1795521194909.jpg',
  kepsek: '/src/assets/images/principal_portrait_1795521194936.jpg',
  pramuka: '/src/assets/images/news_pramuka_award_1795521194852.jpg',
  osis: '/src/assets/images/news_osis_leadership_1795521195350.jpg',
};

const ALL_TABLES: TableName[] = [
  'Pengguna',
  'Guru',
  'Siswa',
  'Kelas',
  'Berita',
  'Pengumuman',
  'Agenda',
  'Galeri',
  'Absensi',
  'Nilai',
  'Dokumen',
  'Jadwal',
  'Tugas',
  'Layanan',
  'Pengaturan',
  'LogAktivitas',
];

export const ROLE_PERMISSIONS: Record<
  UserRole,
  { read: TableName[]; write: TableName[]; delete: TableName[] }
> = {
  Administrator: {
    read: ALL_TABLES,
    write: ALL_TABLES,
    delete: ALL_TABLES,
  },
  'Kepala Sekolah': {
    read: ALL_TABLES,
    write: ['Pengumuman', 'Agenda'],
    delete: [],
  },
  'Operator Sekolah': {
    read: [
      'Guru',
      'Siswa',
      'Kelas',
      'Berita',
      'Pengumuman',
      'Agenda',
      'Galeri',
      'Dokumen',
      'Jadwal',
      'Layanan',
      'Pengaturan',
      'LogAktivitas',
    ],
    write: [
      'Guru',
      'Siswa',
      'Kelas',
      'Berita',
      'Pengumuman',
      'Agenda',
      'Galeri',
      'Dokumen',
      'Jadwal',
      'Layanan',
      'Pengaturan',
    ],
    delete: [
      'Guru',
      'Siswa',
      'Kelas',
      'Berita',
      'Pengumuman',
      'Agenda',
      'Galeri',
      'Dokumen',
      'Jadwal',
      'Layanan',
    ],
  },
  Guru: {
    read: [
      'Guru',
      'Siswa',
      'Kelas',
      'Berita',
      'Pengumuman',
      'Agenda',
      'Galeri',
      'Dokumen',
      'Jadwal',
      'Tugas',
      'Absensi',
      'Nilai',
      'Pengaturan',
    ],
    write: ['Absensi', 'Nilai', 'Dokumen', 'Tugas', 'Berita'],
    delete: ['Tugas', 'Dokumen'],
  },
  Siswa: {
    read: [
      'Siswa',
      'Guru',
      'Kelas',
      'Berita',
      'Pengumuman',
      'Agenda',
      'Galeri',
      'Dokumen',
      'Jadwal',
      'Tugas',
      'Absensi',
      'Nilai',
      'Layanan',
      'Pengaturan',
    ],
    write: ['Tugas', 'Layanan'],
    delete: [],
  },
};

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(String(text))
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function checkPermission(
  role: UserRole,
  action: 'read' | 'write' | 'delete',
  table: TableName
): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  return perm[action].includes(table);
}

async function createSeedDatabase(): Promise<SchoolDatabase> {
  const h = (p: string) => sha256Hex(p);
  return {
    Pengguna: [
      {
        id: 'USR-001',
        username: 'admin',
        passwordHash: await h('admin123'),
        nama: 'Administrator Sistem',
        role: 'Administrator',
        refId: '',
        status: 'Aktif',
        terakhirLogin: '-',
        isDemo: 'true',
      },
      {
        id: 'USR-002',
        username: 'kepsek',
        passwordHash: await h('kepsek123'),
        nama: 'H. Ahmad Fauzi, M.Pd.',
        role: 'Kepala Sekolah',
        refId: 'GRU-001',
        status: 'Aktif',
        terakhirLogin: '-',
        isDemo: 'true',
      },
      {
        id: 'USR-003',
        username: 'operator',
        passwordHash: await h('operator123'),
        nama: 'Dedi Kurniawan, S.Kom.',
        role: 'Operator Sekolah',
        refId: 'GRU-004',
        status: 'Aktif',
        terakhirLogin: '-',
        isDemo: 'true',
      },
      {
        id: 'USR-004',
        username: 'guru',
        passwordHash: await h('guru123'),
        nama: 'Siti Nurhaliza, S.Pd.',
        role: 'Guru',
        refId: 'GRU-002',
        status: 'Aktif',
        terakhirLogin: '-',
        isDemo: 'true',
      },
      {
        id: 'USR-005',
        username: 'siswa',
        passwordHash: await h('siswa123'),
        nama: 'Muhammad Rizky Pratama',
        role: 'Siswa',
        refId: 'SIS-001',
        status: 'Aktif',
        terakhirLogin: '-',
        isDemo: 'true',
      },
    ],
    Guru: [
      {
        id: 'GRU-001',
        nip: '197205141998021001',
        nama: 'H. Ahmad Fauzi, M.Pd.',
        jabatan: 'Kepala Sekolah',
        mapel: 'Manajemen Pendidikan',
        pendidikan: 'S2 Pendidikan',
        email: 'kepsek@smpn3pakuhaji.sch.id',
        telepon: '085782117980',
        foto: LOCAL_ASSETS.kepsek,
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'GRU-002',
        nip: '198603212010012004',
        nama: 'Siti Nurhaliza, S.Pd.',
        jabatan: 'Guru Madya / Wali Kelas 9A',
        mapel: 'Matematika',
        pendidikan: 'S1 Pendidikan Matematika',
        email: 'siti.math@smpn3pakuhaji.sch.id',
        telepon: '081280001122',
        foto: '',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'GRU-003',
        nip: '198911082014021002',
        nama: 'Budi Santoso, S.Pd.',
        jabatan: 'Wakasek Kurikulum',
        mapel: 'Bahasa Indonesia',
        pendidikan: 'S1 Pendidikan Bahasa Indonesia',
        email: 'budi.bindo@smpn3pakuhaji.sch.id',
        telepon: '081390002233',
        foto: '',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'GRU-004',
        nip: '199207152019031003',
        nama: 'Dedi Kurniawan, S.Kom.',
        jabatan: 'Operator & Guru Informatika',
        mapel: 'Informatika',
        pendidikan: 'S1 Teknik Informatika',
        email: 'dedi.it@smpn3pakuhaji.sch.id',
        telepon: '085670003344',
        foto: '',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'GRU-005',
        nip: '199004122015022001',
        nama: 'Rina Marlina, S.Pd.',
        jabatan: 'Guru BK & Pembina OSIS',
        mapel: 'Bimbingan Konseling / IPA',
        pendidikan: 'S1 Pendidikan IPA',
        email: 'rina.ipa@smpn3pakuhaji.sch.id',
        telepon: '081510004455',
        foto: '',
        status: 'Aktif',
        isDemo: 'true',
      },
    ],
    Kelas: [
      {
        id: 'KLS-7A',
        namaKelas: '7A',
        tingkat: '7',
        waliKelas: 'Rina Marlina, S.Pd.',
        tahunAjaran: '2026/2027',
        kapasitas: '34',
        ruang: 'Ruang 01',
        isDemo: 'true',
      },
      {
        id: 'KLS-8A',
        namaKelas: '8A',
        tingkat: '8',
        waliKelas: 'Budi Santoso, S.Pd.',
        tahunAjaran: '2026/2027',
        kapasitas: '34',
        ruang: 'Ruang 08',
        isDemo: 'true',
      },
      {
        id: 'KLS-9A',
        namaKelas: '9A',
        tingkat: '9',
        waliKelas: 'Siti Nurhaliza, S.Pd.',
        tahunAjaran: '2026/2027',
        kapasitas: '32',
        ruang: 'Ruang 15',
        isDemo: 'true',
      },
    ],
    Siswa: [
      {
        id: 'SIS-001',
        nisn: '0112345678',
        nama: 'Muhammad Rizky Pratama',
        kelas: '9A',
        jenisKelamin: 'Laki-laki',
        tahunAjaran: '2026/2027',
        alamat: 'Kp. Sugri, Ds. Surya Bahari, Pakuhaji',
        wali: 'Bpk. Hendra',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'SIS-002',
        nisn: '0112345679',
        nama: 'Nayla Putri Azzahra',
        kelas: '9A',
        jenisKelamin: 'Perempuan',
        tahunAjaran: '2026/2027',
        alamat: 'Ds. Kramat, Kec. Pakuhaji',
        wali: 'Ibu Sumarni',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'SIS-003',
        nisn: '0123456780',
        nama: 'Dimas Aditya Saputra',
        kelas: '8A',
        jenisKelamin: 'Laki-laki',
        tahunAjaran: '2026/2027',
        alamat: 'Ds. Kohod, Kec. Pakuhaji',
        wali: 'Bpk. Mulyadi',
        status: 'Aktif',
        isDemo: 'true',
      },
      {
        id: 'SIS-004',
        nisn: '0134567891',
        nama: 'Aulia Rahmawati',
        kelas: '7A',
        jenisKelamin: 'Perempuan',
        tahunAjaran: '2026/2027',
        alamat: 'Ds. Buaran Mangga, Pakuhaji',
        wali: 'Ibu Siti Aminah',
        status: 'Aktif',
        isDemo: 'true',
      },
    ],
    Berita: [
      {
        id: 'BRT-001',
        judul: 'SMP Negeri 3 Pakuhaji Luncurkan Portal Web Digital Terintegrasi',
        kategori: 'Teknologi & Sekolah',
        isi: 'Sebagai komitmen transformasi digital pendidikan di Kabupaten Tangerang, SMP Negeri 3 Pakuhaji resmi meluncurkan sistem informasi terpadu untuk memudahkan layanan akademik, absensi, E-Rapor, dan informasi publik bagi orang tua serta siswa.',
        penulis: 'Administrator Sistem',
        tanggal: '2026-11-20',
        foto: LOCAL_ASSETS.banner2,
        isDemo: 'true',
      },
      {
        id: 'BRT-002',
        judul: 'Siswa SMPN 3 Pakuhaji Raih Juara 1 Lomba Pramuka Tingkat Kecamatan',
        kategori: 'Prestasi',
        isi: 'Regu Pramuka Garuda SMP Negeri 3 Pakuhaji berhasil membawa pulang piala juara umum pada ajang Jambore Ranting Pakuhaji tahun 2026 dengan nilai kedisiplinan tertinggi.',
        penulis: 'Budi Santoso, S.Pd.',
        tanggal: '2026-11-12',
        foto: LOCAL_ASSETS.pramuka,
        isDemo: 'true',
      },
      {
        id: 'BRT-003',
        judul: 'Pelantikan Pengurus OSIS Periode 2026/2027 Berlangsung Khidmat',
        kategori: 'OSIS',
        isi: 'Kepala SMP Negeri 3 Pakuhaji melantik jajaran pengurus OSIS baru yang siap menggerakkan program literasi digital, penghijauan sekolah, dan kegiatan keagamaan.',
        penulis: 'Rina Marlina, S.Pd.',
        tanggal: '2026-11-02',
        foto: LOCAL_ASSETS.osis,
        isDemo: 'true',
      },
    ],
    Pengumuman: [
      {
        id: 'PGM-001',
        judul: 'Jadwal Penilaian Akhir Semester (PAS) Ganjil 2026/2027',
        isi: 'Pelaksanaan PAS Ganjil dimulai tanggal 1 Desember 2026. Seluruh siswa wajib melengkapi tugas harian dan membawa kartu peserta ujian.',
        target: 'Semua',
        tanggal: '2026-11-22',
        prioritas: 'Penting',
        penulis: 'Wakasek Kurikulum',
        isDemo: 'true',
      },
      {
        id: 'PGM-002',
        judul: 'Rapat Persiapan E-Rapor & Verifikasi Nilai Guru',
        isi: 'Seluruh Bapak/Ibu Guru dimohon mengunggah perangkat ajar dan menyelesaikan input nilai akhir paling lambat 12 Desember 2026.',
        target: 'Guru',
        tanggal: '2026-11-21',
        prioritas: 'Internal',
        penulis: 'Kepala Sekolah',
        isDemo: 'true',
      },
    ],
    Agenda: [
      {
        id: 'AGD-001',
        judul: 'Penilaian Akhir Semester (PAS) Ganjil',
        tanggalMulai: '2026-12-01',
        tanggalSelesai: '2026-12-08',
        lokasi: 'Ruang Kelas SMPN 3 Pakuhaji',
        kategori: 'Akademik',
        deskripsi:
          'Evaluasi hasil belajar semester ganjil seluruh jenjang kelas 7, 8, dan 9.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'AGD-002',
        judul: 'Class Meeting & Pentas Seni OSIS',
        tanggalMulai: '2026-12-14',
        tanggalSelesai: '2026-12-17',
        lokasi: 'Lapangan Utama Sekolah',
        kategori: 'OSIS',
        deskripsi:
          'Lomba olahraga, literasi, dan kreativitas antar kelas pasca ujian.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'AGD-003',
        judul: 'Pembagian E-Rapor Semester Ganjil',
        tanggalMulai: '2026-12-19',
        tanggalSelesai: '2026-12-19',
        lokasi: 'SMP Negeri 3 Pakuhaji',
        kategori: 'Akademik',
        deskripsi:
          'Pengambilan rapor oleh orang tua/wali murid dan akses cetak E-Rapor digital.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
    ],
    Galeri: [
      {
        id: 'GAL-001',
        judul: 'Upacara Bendera & Penguatan Karakter',
        tipe: 'Foto',
        url: LOCAL_ASSETS.banner3,
        kategori: 'Kegiatan Sekolah',
        tanggal: '2026-11-18',
        keterangan: 'Pembiasaan disiplin setiap Senin pagi.',
        isDemo: 'true',
      },
      {
        id: 'GAL-002',
        judul: 'Pembelajaran Kolaboratif & Literasi Digital',
        tipe: 'Foto',
        url: LOCAL_ASSETS.banner2,
        kategori: 'Akademik',
        tanggal: '2026-11-10',
        keterangan: 'Pembelajaran aktif berbasis proyek.',
        isDemo: 'true',
      },
      {
        id: 'GAL-003',
        judul: 'Lingkungan Kampus Hijau SMP Negeri 3 Pakuhaji',
        tipe: 'Foto',
        url: LOCAL_ASSETS.banner1,
        kategori: 'Profil',
        tanggal: '2026-11-01',
        keterangan: 'Suasana pagi halaman utama dan ruang belajar sekolah.',
        isDemo: 'true',
      },
    ],
    Jadwal: [
      {
        id: 'JDW-001',
        hari: 'Senin',
        jam: '07:30 - 09:00',
        kelas: '9A',
        mapel: 'Matematika',
        guru: 'Siti Nurhaliza, S.Pd.',
        ruang: 'Ruang 15',
        tipe: 'Pelajaran',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'JDW-002',
        hari: 'Senin',
        jam: '09:15 - 10:45',
        kelas: '9A',
        mapel: 'Bahasa Indonesia',
        guru: 'Budi Santoso, S.Pd.',
        ruang: 'Ruang 15',
        tipe: 'Pelajaran',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'JDW-003',
        hari: 'Selasa',
        jam: '07:30 - 09:00',
        kelas: '9A',
        mapel: 'Informatika',
        guru: 'Dedi Kurniawan, S.Kom.',
        ruang: 'Lab/Ruang 15',
        tipe: 'Pelajaran',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'JDW-004',
        hari: 'Rabu',
        jam: '07:30 - 09:00',
        kelas: '8A',
        mapel: 'IPA Terpadu',
        guru: 'Rina Marlina, S.Pd.',
        ruang: 'Ruang 08',
        tipe: 'Pelajaran',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'JDW-005',
        hari: 'Senin (1 Des)',
        jam: '07:30 - 09:30',
        kelas: '9A',
        mapel: 'PAS Bahasa Indonesia & Agama',
        guru: 'Panitia Ujian',
        ruang: 'Ruang 15',
        tipe: 'Ujian',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'JDW-006',
        hari: 'Selasa (2 Des)',
        jam: '07:30 - 09:30',
        kelas: '9A',
        mapel: 'PAS Matematika & IPA',
        guru: 'Panitia Ujian',
        ruang: 'Ruang 15',
        tipe: 'Ujian',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
    ],
    Dokumen: [
      {
        id: 'DOK-001',
        judul: 'Modul Ajar Matematika Kelas 9: Persamaan Kuadrat',
        kategori: 'Materi Ajar',
        mapel: 'Matematika',
        kelas: '9A',
        url: 'https://drive.google.com',
        namaFile: 'Modul_Matematika_9A.pdf',
        pengunggah: 'Siti Nurhaliza, S.Pd.',
        tanggal: '2026-11-15',
        akses: 'Publik',
        isDemo: 'true',
      },
      {
        id: 'DOK-002',
        judul: 'RPP & Perangkat Pembelajaran Kurikulum Merdeka',
        kategori: 'Perangkat Pembelajaran',
        mapel: 'Informatika',
        kelas: '9A',
        url: 'https://drive.google.com',
        namaFile: 'Perangkat_Informatika_2026.pdf',
        pengunggah: 'Dedi Kurniawan, S.Kom.',
        tanggal: '2026-11-14',
        akses: 'Internal',
        isDemo: 'true',
      },
      {
        id: 'DOK-003',
        judul: 'E-Book Literasi Digital Pelajar SMP',
        kategori: 'Perpustakaan Digital',
        mapel: 'Umum',
        kelas: 'Semua',
        url: 'https://buku.kemdikbud.go.id',
        namaFile: 'Literasi_Digital_SMP.pdf',
        pengunggah: 'Perpustakaan Sekolah',
        tanggal: '2026-11-10',
        akses: 'Publik',
        isDemo: 'true',
      },
    ],
    Tugas: [
      {
        id: 'TGS-001',
        judul: 'Latihan Soal Fungsi Kuadrat',
        mapel: 'Matematika',
        kelas: '9A',
        deskripsi:
          'Kerjakan 5 soal latihan pada modul halaman 14 dan tuliskan ringkasan jawaban.',
        tenggat: '2026-11-28',
        guru: 'Siti Nurhaliza, S.Pd.',
        lampiran: '',
        status: 'Aktif',
        jawabanSiswa: '',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'TGS-002',
        judul: 'Membuat Poster Keamanan Digital',
        mapel: 'Informatika',
        kelas: '9A',
        deskripsi:
          'Buat konsep poster bertema bijak bermedia sosial dan kirimkan tautan/ringkasannya.',
        tenggat: '2026-11-30',
        guru: 'Dedi Kurniawan, S.Kom.',
        lampiran: '',
        status: 'Aktif',
        jawabanSiswa: '',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
    ],
    Absensi: [
      {
        id: 'ABS-001',
        tanggal: '2026-11-23',
        kelas: '9A',
        siswaId: 'SIS-001',
        namaSiswa: 'Muhammad Rizky Pratama',
        status: 'Hadir',
        keterangan: 'Tepat waktu',
        guru: 'Siti Nurhaliza, S.Pd.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'ABS-002',
        tanggal: '2026-11-23',
        kelas: '9A',
        siswaId: 'SIS-002',
        namaSiswa: 'Nayla Putri Azzahra',
        status: 'Hadir',
        keterangan: 'Tepat waktu',
        guru: 'Siti Nurhaliza, S.Pd.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
      {
        id: 'ABS-003',
        tanggal: '2026-11-23',
        kelas: '8A',
        siswaId: 'SIS-003',
        namaSiswa: 'Dimas Aditya Saputra',
        status: 'Izin',
        keterangan: 'Surat izin orang tua',
        guru: 'Budi Santoso, S.Pd.',
        tahunAjaran: '2026/2027',
        isDemo: 'true',
      },
    ],
    Nilai: [
      {
        id: 'NIL-001',
        siswaId: 'SIS-001',
        namaSiswa: 'Muhammad Rizky Pratama',
        kelas: '9A',
        mapel: 'Matematika',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        tugas: '88',
        uts: '85',
        uas: '90',
        nilaiAkhir: '88',
        predikat: 'A',
        catatan: 'Sangat baik dalam pemecahan masalah.',
        guru: 'Siti Nurhaliza, S.Pd.',
        isDemo: 'true',
      },
      {
        id: 'NIL-002',
        siswaId: 'SIS-001',
        namaSiswa: 'Muhammad Rizky Pratama',
        kelas: '9A',
        mapel: 'Bahasa Indonesia',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        tugas: '86',
        uts: '84',
        uas: '88',
        nilaiAkhir: '86',
        predikat: 'B',
        catatan: 'Aktif dalam diskusi literasi.',
        guru: 'Budi Santoso, S.Pd.',
        isDemo: 'true',
      },
      {
        id: 'NIL-003',
        siswaId: 'SIS-001',
        namaSiswa: 'Muhammad Rizky Pratama',
        kelas: '9A',
        mapel: 'Informatika',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        tugas: '92',
        uts: '90',
        uas: '94',
        nilaiAkhir: '92',
        predikat: 'A',
        catatan: 'Menguasai praktik teknologi digital.',
        guru: 'Dedi Kurniawan, S.Kom.',
        isDemo: 'true',
      },
      {
        id: 'NIL-004',
        siswaId: 'SIS-002',
        namaSiswa: 'Nayla Putri Azzahra',
        kelas: '9A',
        mapel: 'Matematika',
        semester: 'Ganjil',
        tahunAjaran: '2026/2027',
        tugas: '90',
        uts: '89',
        uas: '92',
        nilaiAkhir: '90',
        predikat: 'A',
        catatan: 'Konsisten dan teliti.',
        guru: 'Siti Nurhaliza, S.Pd.',
        isDemo: 'true',
      },
    ],
    Layanan: [
      {
        id: 'LYN-001',
        jenis: 'SPMB',
        pemohon: 'Calon Siswa Demo (Fajar)',
        kontak: '081234567890',
        kelasAtauAsal: 'SDN Buaran Mangga',
        detail: 'Pendaftaran Jalur Zonasi Tahun Pelajaran 2026/2027.',
        tanggal: '2026-11-20',
        status: 'Diproses',
        tanggapan: 'Berkas awal diterima panitia SPMB.',
        isDemo: 'true',
      },
      {
        id: 'LYN-002',
        jenis: 'Surat Keterangan',
        pemohon: 'Muhammad Rizky Pratama',
        kontak: '085711112222',
        kelasAtauAsal: '9A',
        detail:
          'Permohonan Surat Keterangan Aktif Sekolah untuk keperluan lomba.',
        tanggal: '2026-11-21',
        status: 'Selesai',
        tanggapan: 'Surat telah diterbitkan TU.',
        isDemo: 'true',
      },
    ],
    Pengaturan: {
      namaSekolah: 'SMP NEGERI 3 PAKUHAJI',
      tagline: 'Sekolah Digital, Unggul dalam Prestasi, Berkarakter dalam Sikap.',
      npsn: '20613847',
      akreditasi: 'A',
      statusSekolah: 'Negeri',
      alamat:
        'Jl. Sugri, Desa Surya Bahari, Kec. Pakuhaji, Kab. Tangerang, Prov. Banten 15570',
      telepon: '085782117980',
      email: 'smpnegeri3pkh@gmail.com',
      website: 'https://smpn3pakuhaji.sch.id',
      tahunAjaran: '2026/2027',
      semester: 'Ganjil',
      kepalaSekolah: 'H. Ahmad Fauzi, M.Pd.',
      nipKepsek: '197205141998021001',
      sambutanKepsek:
        'Assalamu’alaikum Warahmatullahi Wabarakatuh. Puji syukur kita panjatkan ke hadirat Allah SWT. Kehadiran WEB DIGITAL SMP NEGERI 3 PAKUHAJI merupakan wujud komitmen kami menghadirkan layanan pendidikan yang transparan, adaptif teknologi, serta mendukung kolaborasi aktif antara guru, siswa, dan orang tua demi melahirkan generasi unggul dan berkarakter.',
      fotoKepsek: LOCAL_ASSETS.kepsek,
      logoUrl: '',
      banner1: LOCAL_ASSETS.banner1,
      banner2: LOCAL_ASSETS.banner2,
      banner3: LOCAL_ASSETS.banner3,
      sejarah:
        'SMP Negeri 3 Pakuhaji berdiri sebagai bagian dari perluasan akses pendidikan menengah pertama bermutu di wilayah pesisir utara Kabupaten Tangerang. Berlokasi di Jl. Sugri, Desa Surya Bahari, Kecamatan Pakuhaji, sekolah ini terus berkembang menjadi sekolah berakreditasi A yang memadukan penguatan karakter, prestasi akademik, dan literasi digital.',
      visi: 'Terwujudnya peserta didik SMP Negeri 3 Pakuhaji yang beriman, unggul dalam prestasi, berwawasan teknologi digital, dan berkarakter Profil Pelajar Pancasila.',
      misi: '1. Menanamkan nilai keimanan, ketakwaan, dan akhlak mulia dalam kehidupan sekolah.\n2. Menyelenggarakan pembelajaran aktif, kreatif, dan berbasis teknologi digital.\n3. Mengembangkan minat dan bakat siswa melalui prestasi akademik maupun non-akademik.\n4. Mewujudkan tata kelola administrasi sekolah yang transparan, cepat, dan akuntabel.',
      strukturOrganisasi:
        'Kepala Sekolah: H. Ahmad Fauzi, M.Pd. | Komite Sekolah: H. Sulaiman | Wakasek Kurikulum: Budi Santoso, S.Pd. | Wakasek Kesiswaan & OSIS: Rina Marlina, S.Pd. | Kepala Tata Usaha & Operator: Dedi Kurniawan, S.Kom. | Koordinator BK & Perpustakaan: Tim Guru SMPN 3 Pakuhaji',
      fasilitas:
        '21 Ruang Kelas Nyaman, Ruang Perpustakaan, Ruang Guru & Kepala Sekolah, Ruang Tata Usaha, Ruang OSIS & UKS, Lapangan Olahraga Serbaguna, Mushola Sekolah, Akses Internet Dedicated',
      prestasi:
        'Juara 1 Lomba Pramuka Tingkat Kecamatan Pakuhaji (2026) | Juara 2 Olimpiade Sains IPS Kabupaten Tangerang (2025) | Sekolah Adiwiyata & Literasi Aktif Kab. Tangerang',
      ekstrakurikuler:
        'Pramuka | OSIS | Paskibra | PMR | Futsal & Voli | Seni Tari & Marawis | Klub Literasi & Informatika',
      demoCleared: 'false',
    },
    LogAktivitas: [
      {
        id: 'LOG-001',
        waktu: new Date().toISOString(),
        pengguna: 'Sistem',
        role: 'Administrator',
        aksi: 'INISIALISASI',
        detail: 'Database 16 tabel dan data demonstrasi berhasil dimuat.',
      },
    ],
  };
}

async function getDb(): Promise<SchoolDatabase> {
  const raw = localStorage.getItem(DB_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as SchoolDatabase;
    } catch {
      // fall through to seed
    }
  }
  const seeded = await createSeedDatabase();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveDb(db: SchoolDatabase) {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

function appendLog(
  db: SchoolDatabase,
  pengguna: string,
  role: string,
  aksi: string,
  detail: string
) {
  db.LogAktivitas.unshift({
    id: 'LOG-' + Date.now().toString().slice(-6),
    waktu: new Date().toISOString(),
    pengguna,
    role,
    aksi,
    detail,
  });
  db.LogAktivitas = db.LogAktivitas.slice(0, 200);
}

export function getStoredSession(): { token: string; user: SessionUser } | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function fetchPublicData(): Promise<PublicData> {
  const db = await getDb();
  return {
    pengaturan: db.Pengaturan,
    berita: db.Berita,
    pengumuman: db.Pengumuman.filter(
      (p) => p.target === 'Semua' || p.target === 'Publik'
    ),
    agenda: db.Agenda,
    galeri: db.Galeri,
    guru: db.Guru,
    kelas: db.Kelas,
    jadwal: db.Jadwal,
    dokumen: db.Dokumen.filter((d) => d.akses === 'Publik'),
    stats: {
      totalGuru: db.Guru.length,
      totalSiswa: db.Siswa.length,
      totalKelas: db.Kelas.length,
    },
  };
}

export async function loginUser(
  username: string,
  passwordPlain: string
): Promise<{ ok: true; token: string; user: SessionUser } | { ok: false; error: string }> {
  const uname = username.trim().toLowerCase();
  if (!uname || !passwordPlain) {
    return { ok: false, error: 'Username dan kata sandi wajib diisi.' };
  }
  const db = await getDb();
  const passwordHash = await sha256Hex(passwordPlain);
  const found = db.Pengguna.find(
    (u) =>
      u.username.toLowerCase() === uname &&
      u.passwordHash === passwordHash &&
      u.status === 'Aktif'
  );
  if (!found) {
    appendLog(db, uname, 'Pengunjung', 'LOGIN_GAGAL', 'Percobaan login tidak valid.');
    saveDb(db);
    return {
      ok: false,
      error: 'Username atau kata sandi salah, atau akun tidak aktif.',
    };
  }
  found.terakhirLogin = new Date().toLocaleString('id-ID');
  appendLog(db, found.nama, found.role, 'LOGIN_BERHASIL', 'Masuk ke portal.');
  saveDb(db);

  const user: SessionUser = {
    id: found.id,
    username: found.username,
    nama: found.nama,
    role: found.role,
    refId: found.refId,
  };
  const token = 'SMPN3_' + Date.now().toString(36).toUpperCase();
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token, user }));
  return { ok: true, token, user };
}

export async function logoutUserSession(user: SessionUser | null) {
  if (user) {
    const db = await getDb();
    appendLog(db, user.nama, user.role, 'LOGOUT', 'Keluar dari sistem.');
    saveDb(db);
  }
  clearStoredSession();
}

export async function submitPublicService(payload: {
  jenis: string;
  pemohon: string;
  kontak: string;
  kelasAtauAsal: string;
  detail: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!payload.jenis || !payload.pemohon.trim() || !payload.detail.trim()) {
    return { ok: false, error: 'Mohon lengkapi seluruh data formulir layanan.' };
  }
  const db = await getDb();
  const newId = 'LYN-' + Date.now().toString().slice(-6);
  db.Layanan.unshift({
    id: newId,
    jenis: payload.jenis,
    pemohon: payload.pemohon.trim(),
    kontak: payload.kontak.trim(),
    kelasAtauAsal: payload.kelasAtauAsal.trim(),
    detail: payload.detail.trim(),
    tanggal: new Date().toISOString().slice(0, 10),
    status: 'Menunggu Verifikasi',
    tanggapan: '-',
    isDemo: 'false',
  });
  appendLog(
    db,
    payload.pemohon,
    'Pengunjung/Siswa',
    'KIRIM_LAYANAN',
    `${payload.jenis} oleh ${payload.pemohon}`
  );
  saveDb(db);
  return { ok: true, id: newId };
}

export async function checkServiceStatus(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const db = await getDb();
  return db.Layanan.filter(
    (l) => l.id.toLowerCase() === q || l.pemohon.toLowerCase().includes(q)
  );
}

export async function getERaporByNisn(nisn: string) {
  const q = nisn.trim();
  if (!q) return { ok: false as const, error: 'Masukkan NISN siswa terlebih dahulu.' };
  const db = await getDb();
  const siswa = db.Siswa.find((s) => s.nisn === q);
  if (!siswa) {
    return { ok: false as const, error: 'Data siswa dengan NISN tersebut tidak ditemukan.' };
  }
  return {
    ok: true as const,
    data: {
      siswa,
      nilai: db.Nilai.filter((n) => n.siswaId === siswa.id),
      absensi: db.Absensi.filter((a) => a.siswaId === siswa.id),
      pengaturan: db.Pengaturan,
    },
  };
}

export async function getTableRows<K extends Exclude<TableName, 'Pengaturan'>>(
  user: SessionUser,
  table: K
): Promise<SchoolDatabase[K]> {
  if (!checkPermission(user.role, 'read', table)) {
    throw new Error(`Akses ditolak untuk peran ${user.role}`);
  }
  const db = await getDb();
  if (table === 'Pengguna' && user.role !== 'Administrator') {
    return db.Pengguna.map((u) => ({ ...u, passwordHash: '***' })) as SchoolDatabase[K];
  }
  return db[table];
}

export async function saveTableRow<K extends Exclude<TableName, 'Pengaturan'>>(
  user: SessionUser,
  table: K,
  record: Record<string, string>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!checkPermission(user.role, 'write', table)) {
    return { ok: false, error: `Anda tidak memiliki hak menulis ke ${table}.` };
  }
  const db = await getDb();
  const list = db[table] as unknown as Array<Record<string, string>>;
  const copy = { ...record };

  if (table === 'Pengguna' && copy.newPassword) {
    copy.passwordHash = await sha256Hex(copy.newPassword);
    delete copy.newPassword;
  }

  const idx = copy.id ? list.findIndex((r) => r.id === copy.id) : -1;
  if (idx >= 0) {
    const existing = list[idx];
    if (table === 'Pengguna' && !copy.passwordHash) {
      copy.passwordHash = existing.passwordHash;
    }
    list[idx] = { ...existing, ...copy };
    appendLog(db, user.nama, user.role, `EDIT_${table.toUpperCase()}`, `ID: ${existing.id}`);
    saveDb(db);
    return { ok: true, id: existing.id };
  } else {
    const prefix = table.slice(0, 3).toUpperCase();
    copy.id = copy.id || `${prefix}-${Date.now().toString().slice(-6)}`;
    copy.isDemo = copy.isDemo || 'false';
    if (table === 'Pengguna' && !copy.passwordHash) {
      copy.passwordHash = await sha256Hex('123456');
    }
    if (table === 'Pengguna' && !copy.terakhirLogin) {
      copy.terakhirLogin = '-';
    }
    list.unshift(copy);
    appendLog(db, user.nama, user.role, `TAMBAH_${table.toUpperCase()}`, `ID: ${copy.id}`);
    saveDb(db);
    return { ok: true, id: copy.id };
  }
}

export async function deleteTableRow<K extends Exclude<TableName, 'Pengaturan'>>(
  user: SessionUser,
  table: K,
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!checkPermission(user.role, 'delete', table)) {
    return { ok: false, error: `Anda tidak memiliki hak menghapus pada ${table}.` };
  }
  if (table === 'Pengguna' && id === user.id) {
    return { ok: false, error: 'Tidak dapat menghapus akun yang sedang digunakan.' };
  }
  const db = await getDb();
  const list = db[table] as unknown as Array<Record<string, string>>;
  db[table] = list.filter((r) => r.id !== id) as unknown as SchoolDatabase[K];
  appendLog(db, user.nama, user.role, `HAPUS_${table.toUpperCase()}`, `ID: ${id}`);
  saveDb(db);
  return { ok: true };
}

export function extractGoogleDriveFileId(rawUrl: string): string | null {
  const url = String(rawUrl || '').trim();
  if (!url) return null;
  // Format: https://drive.google.com/file/d/<ID>/view...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  // Format: https://drive.google.com/open?id=<ID> or uc?id=<ID> or thumbnail?id=<ID>
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];
  }
  // Format: https://lh3.googleusercontent.com/d/<ID>
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) return lh3Match[1];
  return null;
}

export function normalizeImageUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }
  return trimmed;
}

export function getImageUrlCandidates(rawUrl?: string): string[] {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return [];
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    const candidates = [
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`,
      `https://lh3.googleusercontent.com/d/${driveId}=w1000`,
      `https://drive.google.com/uc?export=view&id=${driveId}`,
    ];
    if (!candidates.includes(trimmed)) candidates.push(trimmed);
    return candidates;
  }
  return [trimmed];
}

export type ProfilTabId = 'identitas' | 'visimisi' | 'struktur' | 'guru' | 'fasilitas';

export interface ProfilTabConfigItem {
  id: ProfilTabId;
  label: string;
  visible: boolean;
}

export const DEFAULT_PROFIL_TABS: ProfilTabConfigItem[] = [
  { id: 'identitas', label: 'Identitas & Sejarah', visible: true },
  { id: 'visimisi', label: 'Visi & Misi', visible: true },
  { id: 'struktur', label: 'Struktur & Kepala Sekolah', visible: true },
  { id: 'guru', label: 'Data Guru & Tendik', visible: true },
  { id: 'fasilitas', label: 'Fasilitas, Prestasi & Ekskul', visible: true },
];

export function getProfilTabs(pengaturan?: PengaturanMap): ProfilTabConfigItem[] {
  const raw = pengaturan?.profilTabsConfig;
  if (!raw) return DEFAULT_PROFIL_TABS;
  try {
    const parsed = JSON.parse(raw) as ProfilTabConfigItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROFIL_TABS;
    return DEFAULT_PROFIL_TABS.map((def) => {
      const match = parsed.find((item) => item.id === def.id);
      return match
        ? {
            id: def.id,
            label: (match.label || def.label).trim() || def.label,
            visible: match.visible !== false,
          }
        : def;
    });
  } catch {
    return DEFAULT_PROFIL_TABS;
  }
}

export async function savePengaturan(
  user: SessionUser,
  updates: Partial<PengaturanMap>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!checkPermission(user.role, 'write', 'Pengaturan')) {
    return { ok: false, error: 'Anda tidak memiliki izin mengubah pengaturan.' };
  }
  const db = await getDb();
  const imageKeys = new Set(['logoUrl', 'fotoKepsek', 'banner1', 'banner2', 'banner3']);
  const cleanUpdates: Record<string, string> = {};
  Object.entries(updates).forEach(([k, v]) => {
    if (typeof v === 'string') {
      cleanUpdates[k] = imageKeys.has(k) ? normalizeImageUrl(v) : v;
    }
  });
  db.Pengaturan = { ...db.Pengaturan, ...cleanUpdates };
  appendLog(db, user.nama, user.role, 'UPDATE_PENGATURAN', 'Memperbarui konfigurasi sekolah.');
  saveDb(db);
  return { ok: true };
}

export async function validateAndReadUpload(
  user: SessionUser,
  file: File
): Promise<{ ok: true; url: string; fileName: string } | { ok: false; error: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return { ok: false, error: 'Ekstensi file tidak diizinkan.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Ukuran file maksimal 5 MB.' };
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
  const db = await getDb();
  appendLog(db, user.nama, user.role, 'UPLOAD_FILE', file.name);
  saveDb(db);
  return { ok: true, url: dataUrl, fileName: file.name };
}

export async function clearAllDemoData(
  user: SessionUser
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (user.role !== 'Administrator') {
    return { ok: false, error: 'Hanya Administrator yang dapat menghapus data demo.' };
  }
  const db = await getDb();
  (Object.keys(db) as TableName[]).forEach((key) => {
    if (key === 'Pengaturan' || key === 'LogAktivitas') return;
    const arr = db[key] as unknown as Array<Record<string, string>>;
    db[key] = arr.filter(
      (r) => r.isDemo !== 'true' || (key === 'Pengguna' && r.id === user.id)
    ) as never;
  });
  db.Pengaturan.demoCleared = 'true';
  appendLog(
    db,
    user.nama,
    user.role,
    'HAPUS_DATA_DEMO',
    'Seluruh data demonstrasi telah dibersihkan.'
  );
  saveDb(db);
  return { ok: true };
}

export async function exportDatabaseBackup(user: SessionUser) {
  if (user.role !== 'Administrator') {
    throw new Error('Hanya Administrator yang dapat membuat backup.');
  }
  const db = await getDb();
  appendLog(db, user.nama, user.role, 'BACKUP_DATABASE', 'Ekspor seluruh database JSON.');
  saveDb(db);
  return db;
}

export function exportRowsToExcel(sheetName: string, rows: Array<Record<string, unknown>>) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(
    wb,
    `SMPN3_PAKUHAJI_${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

export function exportRowsToPDF(
  title: string,
  headers: string[],
  bodyRows: Array<Array<string | number>>
) {
  const doc = new jsPDF();
  doc.setFontSize(13);
  doc.text('SMP NEGERI 3 PAKUHAJI', 14, 15);
  doc.setFontSize(10);
  doc.text(title, 14, 22);
  autoTable(doc, { startY: 28, head: [headers], body: bodyRows });
  doc.save(`SMPN3_PAKUHAJI_${new Date().toISOString().slice(0, 10)}.pdf`);
}

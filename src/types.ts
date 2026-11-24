export type UserRole =
  | 'Administrator'
  | 'Kepala Sekolah'
  | 'Operator Sekolah'
  | 'Guru'
  | 'Siswa';

export type ViewId =
  | 'beranda'
  | 'profil'
  | 'akademik'
  | 'layanan'
  | 'berita'
  | 'dashboard_utama'
  | 'portal_guru'
  | 'portal_siswa'
  | 'manajemen_akademik'
  | 'manajemen_konten'
  | 'manajemen_layanan'
  | 'admin_pengaturan';

export interface SessionUser {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  refId: string;
}

export interface PenggunaRow {
  id: string;
  username: string;
  passwordHash: string;
  nama: string;
  role: UserRole;
  refId: string;
  status: string;
  terakhirLogin: string;
  isDemo: string;
  newPassword?: string;
}

export interface GuruRow {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  mapel: string;
  pendidikan: string;
  email: string;
  telepon: string;
  foto: string;
  status: string;
  isDemo: string;
}

export interface SiswaRow {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jenisKelamin: string;
  tahunAjaran: string;
  alamat: string;
  wali: string;
  status: string;
  isDemo: string;
}

export interface KelasRow {
  id: string;
  namaKelas: string;
  tingkat: string;
  waliKelas: string;
  tahunAjaran: string;
  kapasitas: string;
  ruang: string;
  isDemo: string;
}

export interface BeritaRow {
  id: string;
  judul: string;
  kategori: string;
  isi: string;
  penulis: string;
  tanggal: string;
  foto: string;
  isDemo: string;
}

export interface PengumumanRow {
  id: string;
  judul: string;
  isi: string;
  target: string;
  tanggal: string;
  prioritas: string;
  penulis: string;
  isDemo: string;
}

export interface AgendaRow {
  id: string;
  judul: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  kategori: string;
  deskripsi: string;
  tahunAjaran: string;
  isDemo: string;
}

export interface GaleriRow {
  id: string;
  judul: string;
  tipe: 'Foto' | 'Video' | string;
  url: string;
  kategori: string;
  tanggal: string;
  keterangan: string;
  isDemo: string;
}

export interface AbsensiRow {
  id: string;
  tanggal: string;
  kelas: string;
  siswaId: string;
  namaSiswa: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | string;
  keterangan: string;
  guru: string;
  tahunAjaran: string;
  isDemo: string;
}

export interface NilaiRow {
  id: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  mapel: string;
  semester: string;
  tahunAjaran: string;
  tugas: string;
  uts: string;
  uas: string;
  nilaiAkhir: string;
  predikat: string;
  catatan: string;
  guru: string;
  isDemo: string;
}

export interface DokumenRow {
  id: string;
  judul: string;
  kategori: string;
  mapel: string;
  kelas: string;
  url: string;
  namaFile: string;
  pengunggah: string;
  tanggal: string;
  akses: string;
  isDemo: string;
}

export interface JadwalRow {
  id: string;
  hari: string;
  jam: string;
  kelas: string;
  mapel: string;
  guru: string;
  ruang: string;
  tipe: string;
  tahunAjaran: string;
  isDemo: string;
}

export interface TugasRow {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  deskripsi: string;
  tenggat: string;
  guru: string;
  lampiran: string;
  status: string;
  jawabanSiswa: string;
  tahunAjaran: string;
  isDemo: string;
}

export interface LayananRow {
  id: string;
  jenis: string;
  pemohon: string;
  kontak: string;
  kelasAtauAsal: string;
  detail: string;
  tanggal: string;
  status: string;
  tanggapan: string;
  isDemo: string;
}

export interface LogAktivitasRow {
  id: string;
  waktu: string;
  pengguna: string;
  role: string;
  aksi: string;
  detail: string;
}

export interface PengaturanMap {
  namaSekolah: string;
  tagline: string;
  npsn: string;
  akreditasi: string;
  statusSekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  tahunAjaran: string;
  semester: string;
  kepalaSekolah: string;
  nipKepsek: string;
  sambutanKepsek: string;
  fotoKepsek: string;
  logoUrl: string;
  banner1: string;
  banner2: string;
  banner3: string;
  sejarah: string;
  visi: string;
  misi: string;
  strukturOrganisasi: string;
  fasilitas: string;
  prestasi: string;
  ekstrakurikuler: string;
  demoCleared: string;
  [key: string]: string;
}

export interface PublicData {
  pengaturan: PengaturanMap;
  berita: BeritaRow[];
  pengumuman: PengumumanRow[];
  agenda: AgendaRow[];
  galeri: GaleriRow[];
  guru: GuruRow[];
  kelas: KelasRow[];
  jadwal: JadwalRow[];
  dokumen: DokumenRow[];
  stats: {
    totalGuru: number;
    totalSiswa: number;
    totalKelas: number;
  };
}

export interface SchoolDatabase {
  Pengguna: PenggunaRow[];
  Guru: GuruRow[];
  Siswa: SiswaRow[];
  Kelas: KelasRow[];
  Berita: BeritaRow[];
  Pengumuman: PengumumanRow[];
  Agenda: AgendaRow[];
  Galeri: GaleriRow[];
  Absensi: AbsensiRow[];
  Nilai: NilaiRow[];
  Dokumen: DokumenRow[];
  Jadwal: JadwalRow[];
  Tugas: TugasRow[];
  Layanan: LayananRow[];
  Pengaturan: PengaturanMap;
  LogAktivitas: LogAktivitasRow[];
}

export type TableName = Exclude<keyof SchoolDatabase, 'Pengaturan'> | 'Pengaturan';

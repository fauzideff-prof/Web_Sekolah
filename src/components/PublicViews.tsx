import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Download,
  Lock,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Search,
  ChevronRight,
} from 'lucide-react';
import type {
  AbsensiRow,
  BeritaRow,
  NilaiRow,
  PengaturanMap,
  PublicData,
  SessionUser,
  SiswaRow,
  TugasRow,
  ViewId,
} from '../types';
import {
  checkServiceStatus,
  getERaporByNisn,
  getProfilTabs,
  getTableRows,
  ProfilTabId,
  saveTableRow,
  submitPublicService,
  validateAndReadUpload,
} from '../services/db';
import { ERaporCard, SafeImage } from './UiPrimitives';
import { ProfilContentEditor } from './ProfilEditor';

export function BerandaView({
  publicData,
  onNavigate,
  onOpenBerita,
}: {
  publicData: PublicData;
  onNavigate: (view: ViewId, subTab?: string) => void;
  onOpenBerita: (b: BeritaRow) => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const p = publicData.pengaturan;

  const slides = [
    {
      img: p.banner1,
      title: 'Selamat Datang di Web Digital SMP Negeri 3 Pakuhaji',
      sub: p.tagline,
    },
    {
      img: p.banner2,
      title: 'Pembelajaran Aktif & Berbasis Teknologi Digital',
      sub: 'Mendukung Kurikulum Merdeka dan Literasi Digital Siswa',
    },
    {
      img: p.banner3,
      title: 'Berkarakter, Disiplin, dan Berprestasi',
      sub: 'Bersama Mewujudkan Pendidikan Bermutu di Kecamatan Pakuhaji',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = slides[slideIdx];

  return (
    <div className="space-y-8">
      {/* Hero Slider */}
      <section className="relative rounded-2xl overflow-hidden bg-[#0f2942] h-72 sm:h-96 border border-slate-200">
        <SafeImage
          src={currentSlide.img}
          alt={currentSlide.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/20 flex flex-col justify-center p-6 sm:p-10">
          <div className="text-xs font-semibold text-amber-300 mb-2 tabular-nums">
            Akreditasi {p.akreditasi || 'A'} · NPSN {p.npsn || '20613847'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl leading-tight text-balance">
            {currentSlide.title}
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mt-2.5 max-w-xl leading-relaxed">
            {currentSlide.sub}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={() => onNavigate('layanan')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg whitespace-nowrap shrink-0 transition-colors"
            >
              Layanan Digital & SPMB
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profil')}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-lg backdrop-blur-xs whitespace-nowrap shrink-0 transition-colors"
            >
              Profil Sekolah
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 right-5 flex gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlideIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                slideIdx === i ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        {[
          {
            label: 'Guru & Tendik',
            val: publicData.stats.totalGuru,
            accent: 'bg-[#0f2942] text-white',
            subColor: 'text-sky-200',
          },
          {
            label: 'Peserta Didik Terdaftar',
            val: publicData.stats.totalSiswa,
            accent: 'bg-sky-700 text-white',
            subColor: 'text-sky-100',
          },
          {
            label: 'Rombongan Belajar',
            val: publicData.stats.totalKelas,
            accent: 'bg-white text-[#0f2942] border border-slate-200',
            subColor: 'text-slate-500',
          },
          {
            label: 'Tahun Pelajaran Aktif',
            val: p.tahunAjaran || '2026/2027',
            accent: 'bg-white text-[#0f2942] border border-slate-200',
            subColor: 'text-slate-500',
          },
        ].map((item) => (
          <div key={item.label} className={`${item.accent} rounded-2xl p-5`}>
            <div className={`text-xs font-medium ${item.subColor}`}>{item.label}</div>
            <div className="text-2xl font-extrabold mt-1">{item.val}</div>
          </div>
        ))}
      </section>

      {/* Principal's Welcome & Visi Misi */}
      <section className="grid lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row gap-6 items-start">
          <SafeImage
            src={p.fotoKepsek}
            alt={p.kepalaSekolah || 'Kepala Sekolah'}
            className="w-28 h-32 sm:w-32 sm:h-36 object-cover rounded-xl border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-700">
              Sambutan Kepala Sekolah
            </div>
            <h3 className="text-xl font-bold text-[#0f2942] mt-0.5">
              {p.kepalaSekolah}
            </h3>
            <div className="text-xs text-slate-500 mb-3 tabular-nums">
              NIP. {p.nipKepsek || '-'}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {p.sambutanKepsek}
            </p>
          </div>
        </div>

        <div className="bg-[#0f2942] text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-300">
              Visi & Misi Sekolah
            </div>
            <h4 className="font-bold text-sm mt-2.5 text-sky-200">Visi</h4>
            <p className="text-xs text-slate-100 leading-relaxed mt-1">{p.visi}</p>
            <h4 className="font-bold text-sm mt-4 text-sky-200">Misi</h4>
            <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed mt-1">
              {p.misi}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profil')}
            className="mt-5 w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-amber-300 inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Selengkapnya di Profil Sekolah</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Berita Terbaru + Pengumuman & Agenda */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0f2942]">
              Berita & Informasi Terbaru
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('berita')}
              className="text-xs font-semibold text-sky-700 hover:underline whitespace-nowrap shrink-0"
            >
              Lihat Semua
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {publicData.berita.slice(0, 4).map((b) => (
              <article
                key={b.id}
                onClick={() => onOpenBerita(b)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer flex flex-col"
              >
                <SafeImage
                  src={b.foto}
                  alt={b.judul}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-slate-500 mb-1.5 tabular-nums">
                    <span className="font-medium text-sky-700">{b.kategori}</span>
                    <span className="mx-1.5">·</span>
                    <span>{b.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0f2942] line-clamp-2 leading-snug">
                    {b.judul}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 flex-1">
                    {b.isi}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] text-base mb-3">
              Pengumuman Sekolah
            </h3>
            <div className="divide-y divide-slate-100">
              {publicData.pengumuman.slice(0, 3).map((pg) => (
                <div key={pg.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="text-[11px] font-semibold text-sky-700 tabular-nums">
                    {pg.prioritas} · {pg.tanggal}
                  </div>
                  <div className="font-bold text-xs text-[#0f2942] mt-1">
                    {pg.judul}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{pg.isi}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] text-base mb-3">
              Agenda Kegiatan
            </h3>
            <div className="divide-y divide-slate-100">
              {publicData.agenda.slice(0, 4).map((ag) => (
                <div
                  key={ag.id}
                  className="py-3 first:pt-0 last:pb-0 flex gap-3 items-start"
                >
                  <div className="bg-[#0f2942] text-white rounded-xl px-2.5 py-1.5 text-center shrink-0 tabular-nums">
                    <div className="text-[10px] text-amber-300 font-semibold">
                      {ag.tanggalMulai?.slice(0, 7)}
                    </div>
                    <div className="text-sm font-bold">
                      {ag.tanggalMulai?.slice(8, 10)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#0f2942]">
                      {ag.judul}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ag.lokasi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Foto & Video */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0f2942]">
            Galeri Foto & Video Sekolah
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicData.galeri.map((g) =>
            g.tipe === 'Video' ? (
              <div
                key={g.id}
                className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900"
              >
                <iframe
                  src={g.url}
                  title={g.judul}
                  className="w-full h-48"
                  allowFullScreen
                />
                <div className="p-3 bg-white">
                  <div className="font-bold text-xs text-[#0f2942]">
                    {g.judul}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {g.keterangan}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={g.id}
                className="rounded-xl overflow-hidden border border-slate-200 group"
              >
                <SafeImage
                  src={g.url}
                  alt={g.judul}
                  className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="p-3 bg-white">
                  <div className="font-bold text-xs text-[#0f2942]">
                    {g.judul}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {g.keterangan}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Profil Singkat & Kontak */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-[#0f2942] text-base mb-2.5">
            Profil Singkat
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{p.sejarah}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2.5 text-sm">
          <h3 className="font-bold text-[#0f2942] text-base mb-2.5">
            Informasi Kontak Sekolah
          </h3>
          <div className="flex items-start gap-2.5 text-slate-700">
            <MapPin className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
            <span>{p.alamat}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 tabular-nums">
            <Phone className="w-4 h-4 text-sky-700 shrink-0" />
            <span>{p.telepon}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <Mail className="w-4 h-4 text-sky-700 shrink-0" />
            <span>{p.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <Globe className="w-4 h-4 text-sky-700 shrink-0" />
            <span>{p.website}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProfilView({
  publicData,
  user,
  subTab,
  onChangeTab,
  onRefresh,
  onToast,
  onNavigate,
}: {
  publicData: PublicData;
  user: SessionUser | null;
  subTab: string;
  onChangeTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate: (view: ViewId, subTab?: string) => void;
}) {
  const [guruFilter, setGuruFilter] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const p = publicData.pengaturan;
  const allTabs = getProfilTabs(p);
  const visibleTabs = allTabs.filter((t) => t.visible);
  const activeTab = (
    visibleTabs.some((t) => t.id === subTab)
      ? subTab
      : visibleTabs[0]?.id || 'identitas'
  ) as ProfilTabId;

  const canManageProfil =
    !!user && ['Administrator', 'Operator Sekolah'].includes(user.role);

  const filteredGuru = publicData.guru.filter((g) =>
    `${g.nama} ${g.mapel} ${g.jabatan}`
      .toLowerCase()
      .includes(guruFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2942]">Profil Sekolah</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Informasi lengkap kelembagaan SMP Negeri 3 Pakuhaji
          </p>
        </div>
        {canManageProfil && (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Tab & Konten Profil</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === t.id
                ? 'bg-[#0f2942] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'identitas' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">Identitas Sekolah</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Nama Sekolah', p.namaSekolah],
                  ['NPSN', p.npsn],
                  ['Status / Akreditasi', `${p.statusSekolah} / Akreditasi ${p.akreditasi}`],
                  ['Alamat', p.alamat],
                  ['Telepon', p.telepon],
                  ['Email', p.email],
                  ['Website', p.website],
                  ['Tahun Pelajaran', `${p.tahunAjaran} · ${p.semester}`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2.5 text-slate-500 w-40">{k}</td>
                    <td className="py-2.5 font-semibold text-[#0f2942] tabular-nums">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-3">Sejarah Sekolah</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{p.sejarah}</p>
          </div>
        </div>
      )}

      {activeTab === 'visimisi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
          <div>
            <h3 className="font-bold text-[#0f2942] text-lg">
              Visi SMP Negeri 3 Pakuhaji
            </h3>
            <p className="text-sm text-slate-800 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium leading-relaxed">
              {p.visi}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[#0f2942] text-lg">Misi Sekolah</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line mt-2 leading-relaxed">
              {p.misi}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'struktur' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
            <SafeImage
              src={p.fotoKepsek}
              alt={p.kepalaSekolah}
              className="w-28 h-32 object-cover rounded-xl border border-slate-200 shrink-0"
            />
            <div>
              <div className="text-xs font-semibold text-sky-700">
                Kepala Sekolah
              </div>
              <h3 className="text-xl font-bold text-[#0f2942] mt-0.5">
                {p.kepalaSekolah}
              </h3>
              <div className="text-xs text-slate-500 tabular-nums">
                NIP. {p.nipKepsek}
              </div>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                {p.sambutanKepsek}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Struktur Organisasi Sekolah
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(p.strukturOrganisasi || '')
                .split('|')
                .map((x) => x.trim())
                .filter(Boolean)
                .map((item) => (
                  <div
                    key={item}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-[#0f2942]"
                  >
                    {item}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guru' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <h3 className="font-bold text-[#0f2942] tabular-nums">
              Data Guru & Tenaga Kependidikan ({filteredGuru.length})
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guruFilter}
                onChange={(e) => setGuruFilter(e.target.value)}
                placeholder="Cari nama atau mapel..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuru.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0f2942] text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                  {g.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#0f2942] truncate">
                    {g.nama}
                  </div>
                  <div className="text-xs text-sky-700 font-medium truncate">
                    {g.jabatan}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {g.mapel} · {g.pendidikan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fasilitas' && (
        <div className="grid md:grid-cols-3 gap-5">
          {[
            ['Fasilitas Sekolah', p.fasilitas, ','],
            ['Prestasi Sekolah', p.prestasi, '|'],
            ['Ekstrakurikuler', p.ekstrakurikuler, '|'],
          ].map(([title, raw, sep]) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-5 border border-slate-200"
            >
              <h3 className="font-bold text-[#0f2942] mb-3">{title}</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {(raw || '')
                  .split(sep)
                  .map((x) => x.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {editorOpen && user && canManageProfil && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0f2942] text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                Kelola Tab & Konten Profil Sekolah
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="text-white/70 hover:text-white"
                aria-label="Tutup editor profil"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <ProfilContentEditor
                user={user}
                publicData={publicData}
                initialTab={activeTab}
                onRefreshPublic={onRefresh}
                onToast={onToast}
                onNavigate={onNavigate}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AkademikView({
  publicData,
  user,
  subTab,
  onChangeTab,
  onOpenLogin,
  onNavigateLayananERapor,
}: {
  publicData: PublicData;
  user: SessionUser | null;
  subTab: string;
  onChangeTab: (tab: string) => void;
  onOpenLogin: () => void;
  onNavigateLayananERapor: () => void;
}) {
  const activeTab = subTab || 'kalender';
  const [kelasFilter, setKelasFilter] = useState('');
  const [siswaList, setSiswaList] = useState<SiswaRow[]>([]);
  const [nilaiList, setNilaiList] = useState<NilaiRow[]>([]);
  const [tugasList, setTugasList] = useState<TugasRow[]>([]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([
      getTableRows(user, 'Siswa').catch(() => []),
      getTableRows(user, 'Nilai').catch(() => []),
      getTableRows(user, 'Tugas').catch(() => []),
    ]).then(([s, n, t]) => {
      if (!mounted) return;
      setSiswaList(s);
      setNilaiList(n);
      setTugasList(t);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  const tabs = [
    ['kalender', 'Kalender Pendidikan'],
    ['jadwal', 'Jadwal Pelajaran & Ujian'],
    ['kelas', 'Data Kelas, Siswa & Guru'],
    ['materi', 'Materi & Tugas Siswa'],
    ['nilai', 'Penilaian & Hasil Belajar'],
  ];

  const kelasOpts = [...new Set(publicData.jadwal.map((j) => j.kelas))];
  const filteredJadwal = publicData.jadwal.filter(
    (j) => !kelasFilter || j.kelas === kelasFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2942]">Menu Akademik</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Kalender, Jadwal, Data Rombel, Materi Pembelajaran & Hasil Belajar
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeTab(id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === id
                ? 'bg-[#0f2942] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'kalender' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-[#0f2942] mb-4">
            Kalender Pendidikan & Agenda Akademik
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left tabular-nums">
              <thead className="bg-[#0f2942] text-white text-xs">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Kegiatan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3">Tahun Ajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {publicData.agenda.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium whitespace-nowrap">
                      {a.tanggalMulai} s/d {a.tanggalSelesai}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#0f2942]">{a.judul}</div>
                      <div className="text-xs text-slate-500">{a.deskripsi}</div>
                    </td>
                    <td className="p-3 font-medium text-sky-700">{a.kategori}</td>
                    <td className="p-3 text-slate-600">{a.lokasi}</td>
                    <td className="p-3 text-slate-600">{a.tahunAjaran}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-bold text-[#0f2942]">
              Jadwal Pelajaran & Jadwal Ujian
            </h3>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="">Semua Kelas</option>
              {kelasOpts.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left tabular-nums">
              <thead className="bg-[#0f2942] text-white text-xs">
                <tr>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Hari/Tanggal</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Jam</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Guru/Pengawas</th>
                  <th className="p-3">Ruang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJadwal.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-sky-700">{j.tipe}</td>
                    <td className="p-3 font-medium">{j.hari}</td>
                    <td className="p-3 font-bold">{j.kelas}</td>
                    <td className="p-3">{j.jam}</td>
                    <td className="p-3 font-bold text-[#0f2942]">{j.mapel}</td>
                    <td className="p-3 text-slate-700">{j.guru}</td>
                    <td className="p-3 text-slate-600">{j.ruang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'kelas' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Data Rombongan Belajar (Kelas)
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 tabular-nums">
              {publicData.kelas.map((k) => (
                <div
                  key={k.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="text-lg font-bold text-[#0f2942]">
                    Kelas {k.namaKelas}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Wali Kelas: <strong>{k.waliKelas}</strong>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {k.ruang} · TA {k.tahunAjaran}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-3">Data Siswa</h3>
            {user ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left tabular-nums">
                  <thead className="bg-[#0f2942] text-white text-xs">
                    <tr>
                      <th className="p-3">NISN</th>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">L/P</th>
                      <th className="p-3">Tahun Ajaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {siswaList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3">{s.nisn}</td>
                        <td className="p-3 font-semibold text-[#0f2942]">
                          {s.nama}
                        </td>
                        <td className="p-3">{s.kelas}</td>
                        <td className="p-3">{s.jenisKelamin}</td>
                        <td className="p-3">{s.tahunAjaran}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 flex flex-wrap justify-between items-center gap-3">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Demi perlindungan data pribadi peserta didik, daftar rinci siswa
                    tampil setelah Login. Total terdaftar:{' '}
                    <strong>{publicData.stats.totalSiswa} Siswa</strong>.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 bg-[#0f2942] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'materi' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Materi Pembelajaran
            </h3>
            <div className="space-y-3">
              {publicData.dokumen.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#0f2942] truncate">
                      {doc.judul}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {doc.mapel} · Kelas {doc.kelas}
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Daftar Tugas Siswa
            </h3>
            {user ? (
              <div className="space-y-3">
                {tugasList.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 border border-slate-200 rounded-xl"
                  >
                    <div className="text-xs font-semibold text-sky-700 tabular-nums">
                      {t.mapel} · Kelas {t.kelas} · Tenggat: {t.tenggat}
                    </div>
                    <div className="font-bold text-sm text-[#0f2942] mt-1">
                      {t.judul}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.deskripsi}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Silakan login sebagai Siswa atau Guru untuk melihat dan mengumpulkan
                tugas.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'nilai' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-[#0f2942] mb-4">
            Informasi Penilaian & Hasil Belajar
          </h3>
          {user ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left tabular-nums">
                <thead className="bg-[#0f2942] text-white text-xs">
                  <tr>
                    <th className="p-3">Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Mapel</th>
                    <th className="p-3 text-right">Tugas</th>
                    <th className="p-3 text-right">UTS</th>
                    <th className="p-3 text-right">UAS</th>
                    <th className="p-3 text-right">Nilai Akhir</th>
                    <th className="p-3 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nilaiList.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-[#0f2942]">
                        {n.namaSiswa}
                      </td>
                      <td className="p-3">{n.kelas}</td>
                      <td className="p-3">{n.mapel}</td>
                      <td className="p-3 text-right">{n.tugas}</td>
                      <td className="p-3 text-right">{n.uts}</td>
                      <td className="p-3 text-right">{n.uas}</td>
                      <td className="p-3 text-right font-bold text-[#0f2942]">
                        {n.nilaiAkhir}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-700">
                        {n.predikat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm flex flex-wrap justify-between items-center gap-3">
              <span>
                Untuk mengakses E-Rapor resmi siswa, gunakan menu{' '}
                <strong>Layanan Sekolah · E-Rapor</strong> atau login akun Siswa.
              </span>
              <button
                type="button"
                onClick={onNavigateLayananERapor}
                className="px-4 py-2 bg-[#0f2942] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Buka E-Rapor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LayananView({
  publicData,
  subTab,
  onChangeTab,
  onToast,
  onOpenBerita,
}: {
  publicData: PublicData;
  subTab: string;
  onChangeTab: (tab: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenBerita: (b: BeritaRow) => void;
}) {
  const activeTab = subTab || 'erapor';
  const [nisnInput, setNisnInput] = useState('');
  const [eraporResult, setEraporResult] = useState<{
    siswa: SiswaRow;
    nilai: NilaiRow[];
    absensi: AbsensiRow[];
    pengaturan: PengaturanMap;
  } | null>(null);
  const [eraporError, setEraporError] = useState('');

  const [pemohon, setPemohon] = useState('');
  const [kontak, setKontak] = useState('');
  const [asal, setAsal] = useState('');
  const [detail, setDetail] = useState('');

  const [statusQuery, setStatusQuery] = useState('');
  const [statusResults, setStatusResults] = useState<
    Awaited<ReturnType<typeof checkServiceStatus>> | null
  >(null);

  const tabs = [
    ['erapor', 'E-Rapor'],
    ['perpus', 'Perpustakaan Digital'],
    ['spmb', 'SPMB Online'],
    ['surat', 'Pengajuan Surat'],
    ['konsultasi', 'Konsultasi Siswa'],
    ['pengaduan', 'Pengaduan & Aspirasi'],
    ['osis', 'Kegiatan OSIS'],
  ];

  const handleCariERapor = async () => {
    setEraporError('');
    setEraporResult(null);
    const res = await getERaporByNisn(nisnInput);
    if (!res.ok) {
      setEraporError(res.error);
      return;
    }
    setEraporResult(res.data);
  };

  const handleSubmitLayanan = async (e: React.FormEvent, jenis: string) => {
    e.preventDefault();
    const res = await submitPublicService({
      jenis,
      pemohon,
      kontak,
      kelasAtauAsal: asal,
      detail,
    });
    if (res.ok) {
      onToast(`Permohonan terkirim! Nomor Tiket Anda: ${res.id}`);
      setPemohon('');
      setKontak('');
      setAsal('');
      setDetail('');
    } else {
      onToast(res.error, 'error');
    }
  };

  const handleCekStatus = async () => {
    const list = await checkServiceStatus(statusQuery);
    setStatusResults(list);
  };

  const serviceMetaMap: Record<
    string,
    { title: string; jenis: string; lblAsal: string; phDetail: string }
  > = {
    spmb: {
      title: 'Formulir SPMB (Sistem Penerimaan Murid Baru)',
      jenis: 'SPMB',
      lblAsal: 'Asal Sekolah (SD/MI)',
      phDetail: 'Jalur pendaftaran (Zonasi/Afirmasi/Prestasi), alamat lengkap...',
    },
    surat: {
      title: 'Pengajuan Surat Keterangan Sekolah',
      jenis: 'Surat Keterangan',
      lblAsal: 'Kelas / Alumni',
      phDetail: 'Jenis surat yang diajukan (Surat Aktif Sekolah, Kelakuan Baik)...',
    },
    konsultasi: {
      title: 'Layanan Konsultasi Siswa (Bimbingan Konseling)',
      jenis: 'Konsultasi Siswa',
      lblAsal: 'Kelas',
      phDetail: 'Topik konsultasi akademik, pribadi, sosial, atau rencana karier...',
    },
    pengaduan: {
      title: 'Layanan Pengaduan & Aspirasi Sekolah',
      jenis: 'Pengaduan & Aspirasi',
      lblAsal: 'Status (Siswa/Ortu/Umum)',
      phDetail: 'Sampaikan aspirasi, saran membangun, atau laporan pengaduan Anda...',
    },
  };

  const books = publicData.dokumen.filter(
    (d) =>
      d.kategori === 'Perpustakaan Digital' || d.kategori === 'Materi Ajar'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2942]">
          Layanan Digital Sekolah
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Akses cepat layanan administrasi, akademik, dan kesiswaan secara online
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeTab(id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === id
                ? 'bg-[#0f2942] text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'erapor' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <h3 className="font-bold text-[#0f2942] text-lg">
            Layanan E-Rapor Digital Siswa
          </h3>
          <p className="text-xs text-slate-500 tabular-nums">
            Masukkan NISN siswa untuk melihat dan mencetak transkrip E-Rapor
            (contoh NISN demo: <strong>0112345678</strong>).
          </p>
          <div className="flex flex-wrap gap-2 max-w-md">
            <input
              type="text"
              value={nisnInput}
              onChange={(e) => setNisnInput(e.target.value)}
              placeholder="Masukkan NISN..."
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm tabular-nums"
            />
            <button
              type="button"
              onClick={handleCariERapor}
              className="px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Cek E-Rapor
            </button>
          </div>
          {eraporError && (
            <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
              {eraporError}
            </div>
          )}
          {eraporResult && (
            <ERaporCard
              siswa={eraporResult.siswa}
              nilai={eraporResult.nilai}
              absensi={eraporResult.absensi}
              pengaturan={eraporResult.pengaturan}
            />
          )}
        </div>
      )}

      {activeTab === 'perpus' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-[#0f2942] text-lg mb-4">
            Perpustakaan Digital SMP Negeri 3 Pakuhaji
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-sky-700">
                    {b.kategori}
                  </div>
                  <h4 className="font-bold text-sm text-[#0f2942] mt-1.5">
                    {b.judul}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengunggah: {b.pengunggah}
                  </p>
                </div>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 py-2 px-4 text-center bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold"
                >
                  Baca / Unduh Dokumen
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {serviceMetaMap[activeTab] && (
        <div className="grid lg:grid-cols-2 gap-6">
          <form
            onSubmit={(e) =>
              handleSubmitLayanan(e, serviceMetaMap[activeTab].jenis)
            }
            className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4"
          >
            <h3 className="font-bold text-[#0f2942] text-lg">
              {serviceMetaMap[activeTab].title}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Pemohon
              </label>
              <input
                required
                value={pemohon}
                onChange={(e) => setPemohon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. HP / WhatsApp
                </label>
                <input
                  required
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {serviceMetaMap[activeTab].lblAsal}
                </label>
                <input
                  required
                  value={asal}
                  onChange={(e) => setAsal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detail Permohonan
              </label>
              <textarea
                required
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder={serviceMetaMap[activeTab].phDetail}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Kirim Permohonan Layanan
            </button>
          </form>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#0f2942] text-lg">
              Lacak Status Permohonan
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan Nomor Tiket (contoh: LYN-001) atau Nama Pemohon.
            </p>
            <div className="flex gap-2">
              <input
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                placeholder="Nomor Tiket / Nama..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={handleCekStatus}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Lacak
              </button>
            </div>
            {statusResults && (
              <div className="space-y-2.5">
                {statusResults.length > 0 ? (
                  statusResults.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold text-[#0f2942] tabular-nums">
                        <span>
                          {l.id} · {l.jenis}
                        </span>
                        <span className="text-sky-700">{l.status}</span>
                      </div>
                      <div className="tabular-nums">
                        Pemohon: <strong>{l.pemohon}</strong> ({l.tanggal})
                      </div>
                      <div className="text-slate-600">
                        Tanggapan: {l.tanggapan}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">
                    Data permohonan tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'osis' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
          <h3 className="font-bold text-[#0f2942] text-lg">
            Informasi Kegiatan OSIS SMP Negeri 3 Pakuhaji
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {publicData.agenda
              .filter((a) => a.kategori === 'OSIS')
              .map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="text-xs font-semibold text-sky-700 tabular-nums">
                    {a.tanggalMulai} · {a.lokasi}
                  </div>
                  <div className="font-bold text-[#0f2942] mt-1">{a.judul}</div>
                  <p className="text-xs text-slate-600 mt-1">{a.deskripsi}</p>
                </div>
              ))}
            {publicData.berita
              .filter((b) => b.kategori === 'OSIS')
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenBerita(b)}
                  className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="text-xs font-semibold text-amber-700 tabular-nums">
                    Berita OSIS · {b.tanggal}
                  </div>
                  <div className="font-bold text-[#0f2942] mt-1">{b.judul}</div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {b.isi}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BeritaView({
  publicData,
  user,
  onRefresh,
  onToast,
  onOpenBerita,
  onRequestDelete,
}: {
  publicData: PublicData;
  user: SessionUser | null;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenBerita: (b: BeritaRow) => void;
  onRequestDelete: (id: string, label: string) => void;
}) {
  const [catFilter, setCatFilter] = useState('Semua');
  const [editing, setEditing] = useState<Partial<BeritaRow> | null>(null);

  const canEdit =
    !!user &&
    ['Administrator', 'Operator Sekolah', 'Guru'].includes(user.role);
  const categories = ['Semua', ...new Set(publicData.berita.map((b) => b.kategori))];
  const filtered = publicData.berita.filter(
    (b) => catFilter === 'Semua' || b.kategori === catFilter
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editing) return;
    const res = await saveTableRow(user, 'Berita', {
      ...(editing.id ? { id: editing.id } : {}),
      judul: editing.judul || '',
      kategori: editing.kategori || 'Informasi Sekolah',
      tanggal: editing.tanggal || new Date().toISOString().slice(0, 10),
      foto: editing.foto || '',
      isi: editing.isi || '',
      penulis: user.nama,
    });
    if (res.ok) {
      setEditing(null);
      await onRefresh();
      onToast('Berita berhasil disimpan.');
    } else {
      onToast(res.error, 'error');
    }
  };

  const handleUploadFoto = async (file: File) => {
    if (!user) return;
    const res = await validateAndReadUpload(user, file);
    if (res.ok) {
      setEditing((prev) => (prev ? { ...prev, foto: res.url } : prev));
      onToast('Foto berhasil diunggah.');
    } else {
      onToast(res.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2942]">
            Berita & Informasi Sekolah
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kabar terkini kegiatan, prestasi, dan pengumuman resmi
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() =>
              setEditing({
                judul: '',
                kategori: 'Informasi Sekolah',
                tanggal: new Date().toISOString().slice(0, 10),
                foto: '',
                isi: '',
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Berita
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              catFilter === cat
                ? 'bg-[#0f2942] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((b) => (
          <article
            key={b.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col"
          >
            <div
              onClick={() => onOpenBerita(b)}
              className="cursor-pointer overflow-hidden"
            >
              <SafeImage
                src={b.foto}
                alt={b.judul}
                className="h-44 w-full object-cover hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs text-slate-500 mb-1.5 tabular-nums">
                <span className="font-semibold text-sky-700">{b.kategori}</span>
                <span className="mx-1.5">·</span>
                <span>{b.tanggal}</span>
              </div>
              <h3
                onClick={() => onOpenBerita(b)}
                className="font-bold text-[#0f2942] text-base cursor-pointer hover:text-sky-700 leading-snug"
              >
                {b.judul}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 flex-1">
                {b.isi}
              </p>
              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Oleh: {b.penulis}</span>
                {canEdit ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(b)}
                      className="inline-flex items-center gap-1 text-sky-700 font-semibold hover:underline"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(b.id, b.judul)}
                      className="inline-flex items-center gap-1 text-rose-600 font-semibold hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenBerita(b)}
                    className="text-sky-700 font-semibold hover:underline"
                  >
                    Baca
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0f2942] text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editing.id ? 'Edit Berita' : 'Tambah Berita Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSave}
              className="p-5 space-y-3 overflow-y-auto text-sm"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Judul Berita
                </label>
                <input
                  required
                  value={editing.judul || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, judul: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Kategori
                  </label>
                  <input
                    required
                    value={editing.kategori || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, kategori: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={editing.tanggal || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, tanggal: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Foto Berita (URL atau Upload Lokal)
                </label>
                <input
                  value={editing.foto || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, foto: e.target.value })
                  }
                  placeholder="/src/assets/images/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadFoto(f);
                  }}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Isi Berita
                </label>
                <textarea
                  required
                  rows={5}
                  value={editing.isi || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, isi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
              >
                Simpan Berita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function BeritaDetailModal({
  berita,
  onClose,
}: {
  berita: BeritaRow | null;
  onClose: () => void;
}) {
  if (!berita) return null;
  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-[#0f2942] text-white px-5 py-4 flex justify-between items-center">
          <h3 className="font-bold text-sm">{berita.kategori}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white"
            aria-label="Tutup berita"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <SafeImage
            src={berita.foto}
            alt={berita.judul}
            className="w-full h-60 object-cover rounded-xl"
          />
          <h2 className="text-xl font-bold text-[#0f2942] leading-snug">
            {berita.judul}
          </h2>
          <div className="text-xs text-slate-500 tabular-nums flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{berita.tanggal}</span>
            <span>·</span>
            <span>
              Penulis: <strong>{berita.penulis}</strong>
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {berita.isi}
          </p>
        </div>
      </div>
    </div>
  );
}

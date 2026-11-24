import React, { useCallback, useEffect, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import type {
  AbsensiRow,
  DokumenRow,
  GuruRow,
  JadwalRow,
  KelasRow,
  LayananRow,
  NilaiRow,
  PengumumanRow,
  PublicData,
  SessionUser,
  SiswaRow,
  TugasRow,
} from '../types';
import {
  exportRowsToExcel,
  exportRowsToPDF,
  getTableRows,
  saveTableRow,
  validateAndReadUpload,
} from '../services/db';
import { ERaporCard } from './UiPrimitives';

export function DashboardUtamaView({ user }: { user: SessionUser }) {
  const [siswa, setSiswa] = useState<SiswaRow[]>([]);
  const [guru, setGuru] = useState<GuruRow[]>([]);
  const [kelas, setKelas] = useState<KelasRow[]>([]);
  const [absensi, setAbsensi] = useState<AbsensiRow[]>([]);
  const [layanan, setLayanan] = useState<LayananRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getTableRows(user, 'Siswa'),
      getTableRows(user, 'Guru'),
      getTableRows(user, 'Kelas'),
      getTableRows(user, 'Absensi').catch(() => []),
      getTableRows(user, 'Layanan').catch(() => []),
    ])
      .then(([s, g, k, a, l]) => {
        if (!mounted) return;
        setSiswa(s);
        setGuru(g);
        setKelas(k);
        setAbsensi(a);
        setLayanan(l);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const classLabels = [...new Set(siswa.map((s) => s.kelas))];
  const classCounts = classLabels.map(
    (k) => siswa.filter((s) => s.kelas === k).length
  );
  const maxClassCount = Math.max(1, ...classCounts);

  const attendanceCategories = [
    { label: 'Hadir', color: '#0284c7' },
    { label: 'Izin', color: '#d97706' },
    { label: 'Sakit', color: '#16a34a' },
    { label: 'Alpa', color: '#dc2626' },
  ].map((c) => ({
    ...c,
    count: absensi.filter((a) => a.status === c.label).length,
  }));
  const totalAbsensi = attendanceCategories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2942]">
            Dashboard Statistik & Monitoring
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Selamat datang, {user.nama} ({user.role})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              exportRowsToExcel(
                'Siswa',
                siswa as unknown as Array<Record<string, unknown>>
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel Siswa</span>
          </button>
          <button
            type="button"
            onClick={() =>
              exportRowsToPDF(
                'Laporan Statistik Siswa SMPN 3 Pakuhaji',
                ['NISN', 'Nama', 'Kelas', 'Status'],
                siswa.map((x) => [x.nisn, x.nama, x.kelas, x.status])
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-24 rounded-2xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
            {[
              ['Total Siswa', siswa.length, 'bg-[#0f2942] text-white'],
              ['Total Guru & Tendik', guru.length, 'bg-sky-700 text-white'],
              [
                'Jumlah Kelas',
                kelas.length,
                'bg-white text-[#0f2942] border border-slate-200',
              ],
              [
                'Layanan Masuk',
                layanan.length,
                'bg-white text-[#0f2942] border border-slate-200',
              ],
            ].map(([label, val, cls]) => (
              <div key={String(label)} className={`${cls} p-5 rounded-2xl`}>
                <div className="text-xs opacity-80">{label}</div>
                <div className="text-2xl font-extrabold mt-1">{val}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar Chart: Siswa per Kelas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-[#0f2942] mb-4 text-sm">
                Distribusi Siswa per Kelas
              </h3>
              {classLabels.length > 0 ? (
                <div className="space-y-3 tabular-nums">
                  {classLabels.map((lbl, idx) => {
                    const count = classCounts[idx];
                    const pct = Math.round((count / maxClassCount) * 100);
                    return (
                      <div key={lbl} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Kelas {lbl}</span>
                          <span>{count} siswa</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-md overflow-hidden">
                          <div
                            className="h-full bg-[#0f2942] rounded-md transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Belum ada data kelas terdaftar.
                </p>
              )}
            </div>

            {/* Donut Breakdown: Statistik Kehadiran */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-[#0f2942] mb-4 text-sm">
                Statistik Kehadiran Tercatat
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <svg
                  viewBox="0 0 120 120"
                  className="w-36 h-36 shrink-0"
                  aria-label="Diagram Statistik Kehadiran"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="16"
                  />
                  {totalAbsensi > 0 &&
                    (() => {
                      const circumference = 2 * Math.PI * 44;
                      let offset = 0;
                      return attendanceCategories.map((cat) => {
                        const segLen = (cat.count / totalAbsensi) * circumference;
                        const el = (
                          <circle
                            key={cat.label}
                            cx="60"
                            cy="60"
                            r="44"
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="16"
                            strokeDasharray={`${segLen} ${circumference}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 60 60)"
                          />
                        );
                        offset += segLen;
                        return el;
                      });
                    })()}
                  <text
                    x="60"
                    y="64"
                    textAnchor="middle"
                    className="fill-[#0f2942] text-sm font-bold tabular-nums"
                  >
                    {totalAbsensi}
                  </text>
                </svg>

                <div className="flex-1 w-full space-y-2 tabular-nums">
                  {attendanceCategories.map((cat) => (
                    <div
                      key={cat.label}
                      className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0"
                    >
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span
                          className="w-3 h-3 rounded-xs inline-block"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </span>
                      <span className="font-bold text-[#0f2942]">
                        {cat.count} catatan
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PortalGuruView({
  user,
  publicData,
  subTab,
  onChangeTab,
  onRefreshPublic,
  onToast,
}: {
  user: SessionUser;
  publicData: PublicData;
  subTab: string;
  onChangeTab: (tab: string) => void;
  onRefreshPublic: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const activeTab = subTab || 'ringkasan';
  const [jadwal, setJadwal] = useState<JadwalRow[]>([]);
  const [siswa, setSiswa] = useState<SiswaRow[]>([]);
  const [absensi, setAbsensi] = useState<AbsensiRow[]>([]);
  const [nilai, setNilai] = useState<NilaiRow[]>([]);
  const [dokumen, setDokumen] = useState<DokumenRow[]>([]);
  const [pgm, setPgm] = useState<PengumumanRow[]>([]);

  const [absTgl, setAbsTgl] = useState(new Date().toISOString().slice(0, 10));
  const [absSiswaVal, setAbsSiswaVal] = useState('');
  const [absStatus, setAbsStatus] = useState('Hadir');
  const [absKet, setAbsKet] = useState('');

  const [nilSiswaVal, setNilSiswaVal] = useState('');
  const [nilMapel, setNilMapel] = useState('Matematika');
  const [nilTugas, setNilTugas] = useState('85');
  const [nilUts, setNilUts] = useState('85');
  const [nilUas, setNilUas] = useState('88');
  const [nilCat, setNilCat] = useState('');

  const [dokJudul, setDokJudul] = useState('');
  const [dokKat, setDokKat] = useState('Materi Ajar');
  const [dokKelas, setDokKelas] = useState('9A');
  const [dokMapel, setDokMapel] = useState('');
  const [dokUrl, setDokUrl] = useState('');

  const loadData = useCallback(async () => {
    const [rJ, rS, rA, rN, rD, rP] = await Promise.all([
      getTableRows(user, 'Jadwal'),
      getTableRows(user, 'Siswa'),
      getTableRows(user, 'Absensi'),
      getTableRows(user, 'Nilai'),
      getTableRows(user, 'Dokumen'),
      getTableRows(user, 'Pengumuman'),
    ]);
    setJadwal(rJ.filter((j) => j.tipe === 'Pelajaran'));
    setSiswa(rS);
    setAbsensi(rA);
    setNilai(rN);
    setDokumen(rD);
    setPgm(rP);
    if (rS.length > 0) {
      const firstVal = `${rS[0].id}|${rS[0].nama}|${rS[0].kelas}`;
      setAbsSiswaVal((prev) => prev || firstVal);
      setNilSiswaVal((prev) => prev || firstVal);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveAbsensi = async (e: React.FormEvent) => {
    e.preventDefault();
    const [siswaId, namaSiswa, kelas] = absSiswaVal.split('|');
    if (!siswaId) return;
    const res = await saveTableRow(user, 'Absensi', {
      tanggal: absTgl,
      siswaId,
      namaSiswa,
      kelas,
      status: absStatus,
      keterangan: absKet,
      guru: user.nama,
      tahunAjaran: publicData.pengaturan.tahunAjaran,
    });
    if (res.ok) {
      onToast('Kehadiran siswa tersimpan.');
      setAbsKet('');
      loadData();
    } else onToast(res.error, 'error');
  };

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    const [siswaId, namaSiswa, kelas] = nilSiswaVal.split('|');
    if (!siswaId) return;
    const t = Number(nilTugas);
    const u = Number(nilUts);
    const a = Number(nilUas);
    const akhir = Math.round(t * 0.3 + u * 0.3 + a * 0.4);
    const pred =
      akhir >= 88 ? 'A' : akhir >= 78 ? 'B' : akhir >= 68 ? 'C' : 'D';
    const res = await saveTableRow(user, 'Nilai', {
      siswaId,
      namaSiswa,
      kelas,
      mapel: nilMapel,
      semester: publicData.pengaturan.semester,
      tahunAjaran: publicData.pengaturan.tahunAjaran,
      tugas: String(t),
      uts: String(u),
      uas: String(a),
      nilaiAkhir: String(akhir),
      predikat: pred,
      catatan: nilCat,
      guru: user.nama,
    });
    if (res.ok) {
      onToast('Nilai siswa tersimpan.');
      setNilCat('');
      loadData();
    } else onToast(res.error, 'error');
  };

  const handleSaveDokumen = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveTableRow(user, 'Dokumen', {
      judul: dokJudul,
      kategori: dokKat,
      mapel: dokMapel,
      kelas: dokKelas,
      url: dokUrl || '#',
      namaFile: dokJudul,
      pengunggah: user.nama,
      tanggal: new Date().toISOString().slice(0, 10),
      akses: 'Publik',
    });
    if (res.ok) {
      onToast('Dokumen materi berhasil diunggah.');
      setDokJudul('');
      setDokMapel('');
      setDokUrl('');
      await onRefreshPublic();
      loadData();
    } else onToast(res.error, 'error');
  };

  const handleUploadFile = async (file: File) => {
    const res = await validateAndReadUpload(user, file);
    if (res.ok) {
      setDokUrl(res.url);
      onToast('File berhasil disiapkan untuk disimpan.');
    } else onToast(res.error, 'error');
  };

  const tabs = [
    ['ringkasan', 'Profil & Jadwal'],
    ['absensi', 'Input Kehadiran'],
    ['nilai', 'Input Nilai Siswa'],
    ['materi', 'Upload Perangkat & Materi'],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2942]">
          Dashboard Guru & Tenaga Kependidikan
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Halo, {user.nama}</p>
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
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'ringkasan' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Jadwal Mengajar & Kelas Diampu
            </h3>
            <div className="space-y-2.5 tabular-nums">
              {jadwal.map((j) => (
                <div
                  key={j.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between text-xs gap-3"
                >
                  <div>
                    <div className="font-bold text-[#0f2942]">
                      {j.mapel} (Kelas {j.kelas})
                    </div>
                    <div className="text-slate-500 mt-0.5">{j.guru}</div>
                  </div>
                  <div className="text-right font-semibold text-[#0f2942] shrink-0">
                    <div>{j.hari}</div>
                    <div className="text-sky-700">{j.jam}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-[#0f2942] mb-4">
              Pengumuman Internal Guru
            </h3>
            <div className="space-y-2.5">
              {pgm.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs"
                >
                  <div className="font-bold text-[#0f2942]">{p.judul}</div>
                  <p className="text-slate-600 mt-1">{p.isi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'absensi' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveAbsensi}
            className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-sm"
          >
            <h3 className="font-bold text-[#0f2942]">Input Kehadiran Siswa</h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={absTgl}
                onChange={(e) => setAbsTgl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Pilih Siswa
              </label>
              <select
                value={absSiswaVal}
                onChange={(e) => setAbsSiswaVal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {siswa.map((s) => (
                  <option
                    key={s.id}
                    value={`${s.id}|${s.nama}|${s.kelas}`}
                  >
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Status Kehadiran
              </label>
              <select
                value={absStatus}
                onChange={(e) => setAbsStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option>Hadir</option>
                <option>Izin</option>
                <option>Sakit</option>
                <option>Alpa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Keterangan
              </label>
              <input
                value={absKet}
                onChange={(e) => setAbsKet(e.target.value)}
                placeholder="Catatan opsional"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
            >
              Simpan Kehadiran
            </button>
          </form>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 overflow-x-auto">
            <h3 className="font-bold text-[#0f2942] mb-3">
              Rekap Input Kehadiran Terbaru
            </h3>
            <table className="w-full text-xs text-left tabular-nums">
              <thead className="bg-[#0f2942] text-white">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Siswa</th>
                  <th className="p-2.5">Kelas</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absensi.slice(0, 15).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-2.5">{a.tanggal}</td>
                    <td className="p-2.5 font-semibold text-[#0f2942]">
                      {a.namaSiswa}
                    </td>
                    <td className="p-2.5">{a.kelas}</td>
                    <td className="p-2.5 font-semibold text-sky-700">
                      {a.status}
                    </td>
                    <td className="p-2.5 text-slate-600">{a.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'nilai' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveNilai}
            className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-sm"
          >
            <h3 className="font-bold text-[#0f2942]">Input Nilai Siswa</h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Siswa</label>
              <select
                value={nilSiswaVal}
                onChange={(e) => setNilSiswaVal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {siswa.map((s) => (
                  <option
                    key={s.id}
                    value={`${s.id}|${s.nama}|${s.kelas}`}
                  >
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Mata Pelajaran
              </label>
              <input
                required
                value={nilMapel}
                onChange={(e) => setNilMapel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 tabular-nums">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Tugas
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={nilTugas}
                  onChange={(e) => setNilTugas(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">UTS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={nilUts}
                  onChange={(e) => setNilUts(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">UAS</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={nilUas}
                  onChange={(e) => setNilUas(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Catatan Guru
              </label>
              <input
                value={nilCat}
                onChange={(e) => setNilCat(e.target.value)}
                placeholder="Capaian kompetensi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
            >
              Simpan Nilai
            </button>
          </form>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 overflow-x-auto">
            <h3 className="font-bold text-[#0f2942] mb-3">
              Daftar Nilai Tersimpan
            </h3>
            <table className="w-full text-xs text-left tabular-nums">
              <thead className="bg-[#0f2942] text-white">
                <tr>
                  <th className="p-2.5">Siswa</th>
                  <th className="p-2.5">Mapel</th>
                  <th className="p-2.5 text-right">Akhir</th>
                  <th className="p-2.5 text-center">Predikat</th>
                  <th className="p-2.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nilai.slice(0, 15).map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-[#0f2942]">
                      {n.namaSiswa} ({n.kelas})
                    </td>
                    <td className="p-2.5">{n.mapel}</td>
                    <td className="p-2.5 text-right font-bold">
                      {n.nilaiAkhir}
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      {n.predikat}
                    </td>
                    <td className="p-2.5 text-slate-600">{n.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'materi' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveDokumen}
            className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-sm"
          >
            <h3 className="font-bold text-[#0f2942]">
              Upload Perangkat / Materi Ajar
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Judul Dokumen
              </label>
              <input
                required
                value={dokJudul}
                onChange={(e) => setDokJudul(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kategori
                </label>
                <select
                  value={dokKat}
                  onChange={(e) => setDokKat(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                >
                  <option>Materi Ajar</option>
                  <option>Perangkat Pembelajaran</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kelas
                </label>
                <input
                  value={dokKelas}
                  onChange={(e) => setDokKelas(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Mata Pelajaran
              </label>
              <input
                required
                value={dokMapel}
                onChange={(e) => setDokMapel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Link atau Upload File
              </label>
              <input
                value={dokUrl}
                onChange={(e) => setDokUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
              />
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadFile(f);
                }}
                className="text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
            >
              Simpan Dokumen
            </button>
          </form>

          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <h3 className="font-bold text-[#0f2942] mb-3">
              Arsip Materi & Perangkat Pembelajaran
            </h3>
            {dokumen.map((d) => (
              <div
                key={d.id}
                className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-center text-xs gap-3"
              >
                <div>
                  <div className="font-bold text-[#0f2942]">{d.judul}</div>
                  <div className="text-slate-500 mt-0.5">
                    {d.kategori} · {d.mapel} (Kelas {d.kelas})
                  </div>
                </div>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                >
                  Buka
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PortalSiswaView({
  user,
  publicData,
  onToast,
}: {
  user: SessionUser;
  publicData: PublicData;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [mySiswa, setMySiswa] = useState<Partial<SiswaRow>>({});
  const [jadwal, setJadwal] = useState<JadwalRow[]>([]);
  const [tugas, setTugas] = useState<TugasRow[]>([]);
  const [nilai, setNilai] = useState<NilaiRow[]>([]);
  const [absensi, setAbsensi] = useState<AbsensiRow[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getTableRows(user, 'Siswa'),
      getTableRows(user, 'Jadwal'),
      getTableRows(user, 'Tugas'),
      getTableRows(user, 'Nilai'),
      getTableRows(user, 'Absensi'),
    ]).then(([rS, rJ, rT, rN, rA]) => {
      if (!mounted) return;
      const found = rS.find((s) => s.id === user.refId) || rS[0] || {};
      setMySiswa(found);
      setJadwal(rJ.filter((j) => !found.kelas || j.kelas === found.kelas));
      const tFiltered = rT.filter(
        (t) => !found.kelas || t.kelas === found.kelas
      );
      setTugas(tFiltered);
      const ansMap: Record<string, string> = {};
      tFiltered.forEach((t) => {
        ansMap[t.id] = t.jawabanSiswa || '';
      });
      setAnswers(ansMap);
      setNilai(rN.filter((n) => !found.id || n.siswaId === found.id));
      setAbsensi(rA.filter((a) => !found.id || a.siswaId === found.id));
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleKumpulTugas = async (tId: string) => {
    const res = await saveTableRow(user, 'Tugas', {
      id: tId,
      jawabanSiswa: answers[tId] || '',
      status: 'Dikumpulkan',
    });
    if (res.ok) {
      onToast('Jawaban tugas berhasil dikirim.');
      setTugas((prev) =>
        prev.map((t) =>
          t.id === tId
            ? { ...t, jawabanSiswa: answers[tId] || '', status: 'Dikumpulkan' }
            : t
        )
      );
    } else onToast(res.error, 'error');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f2942] text-white p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="text-xs text-amber-300 font-semibold">
            Portal Siswa Digital
          </div>
          <h2 className="text-2xl font-bold mt-0.5">
            {mySiswa.nama || user.nama}
          </h2>
          <p className="text-xs text-sky-200 mt-1 tabular-nums">
            NISN: {mySiswa.nisn || '-'} · Kelas {mySiswa.kelas || '-'}
          </p>
        </div>
        <div className="text-right text-xs tabular-nums">
          <div>Tahun Ajaran {publicData.pengaturan.tahunAjaran}</div>
          <div className="text-amber-300 font-semibold mt-0.5">
            Status: {mySiswa.status || 'Aktif'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-[#0f2942] mb-4">
            Jadwal Pelajaran & Ujian Kelas {mySiswa.kelas || ''}
          </h3>
          <div className="space-y-2.5 tabular-nums">
            {jadwal.map((j) => (
              <div
                key={j.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between gap-3"
              >
                <span>
                  <strong className="text-[#0f2942]">{j.mapel}</strong> ·{' '}
                  {j.tipe}
                </span>
                <span className="font-medium text-slate-600 shrink-0">
                  {j.hari}, {j.jam}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-[#0f2942] mb-4">Tugas Sekolah</h3>
          <div className="space-y-3">
            {tugas.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 text-xs space-y-2.5"
              >
                <div className="flex justify-between font-bold text-[#0f2942] tabular-nums">
                  <span>
                    {t.judul} ({t.mapel})
                  </span>
                  <span className="text-rose-700">Tenggat: {t.tenggat}</span>
                </div>
                <p className="text-slate-600">{t.deskripsi}</p>
                <div className="flex gap-2">
                  <input
                    value={answers[t.id] || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    placeholder="Tulis jawaban / link tugas..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleKumpulTugas(t.id)}
                    className="px-3.5 py-1.5 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ERaporCard
        siswa={mySiswa}
        nilai={nilai}
        absensi={absensi}
        pengaturan={publicData.pengaturan}
      />
    </div>
  );
}

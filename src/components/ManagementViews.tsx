import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit3,
  Search,
  X,
} from 'lucide-react';
import type {
  LayananRow,
  LogAktivitasRow,
  PengaturanMap,
  PenggunaRow,
  PublicData,
  SessionUser,
  TableName,
  UserRole,
  ViewId,
} from '../types';
import {
  clearAllDemoData,
  deleteTableRow,
  exportDatabaseBackup,
  exportRowsToExcel,
  getTableRows,
  normalizeImageUrl,
  savePengaturan,
  saveTableRow,
  validateAndReadUpload,
} from '../services/db';
import { SafeImage, SchoolShieldLogo } from './UiPrimitives';
import { ProfilContentEditor } from './ProfilEditor';

const TABLE_META: Record<
  string,
  { title: string; cols: string[] }
> = {
  Siswa: {
    title: 'Data Siswa',
    cols: [
      'nisn',
      'nama',
      'kelas',
      'jenisKelamin',
      'tahunAjaran',
      'wali',
      'status',
    ],
  },
  Guru: {
    title: 'Data Guru & Tendik',
    cols: ['nip', 'nama', 'jabatan', 'mapel', 'pendidikan', 'telepon', 'status'],
  },
  Kelas: {
    title: 'Data Kelas',
    cols: [
      'namaKelas',
      'tingkat',
      'waliKelas',
      'tahunAjaran',
      'kapasitas',
      'ruang',
    ],
  },
  Jadwal: {
    title: 'Jadwal Pelajaran & Ujian',
    cols: [
      'tipe',
      'hari',
      'jam',
      'kelas',
      'mapel',
      'guru',
      'ruang',
      'tahunAjaran',
    ],
  },
  Berita: {
    title: 'Manajemen Berita',
    cols: ['judul', 'kategori', 'tanggal', 'penulis', 'foto', 'isi'],
  },
  Pengumuman: {
    title: 'Manajemen Pengumuman',
    cols: ['judul', 'target', 'prioritas', 'tanggal', 'penulis', 'isi'],
  },
  Agenda: {
    title: 'Manajemen Agenda Sekolah',
    cols: [
      'judul',
      'tanggalMulai',
      'tanggalSelesai',
      'lokasi',
      'kategori',
      'tahunAjaran',
      'deskripsi',
    ],
  },
  Galeri: {
    title: 'Manajemen Galeri',
    cols: ['judul', 'tipe', 'kategori', 'tanggal', 'url', 'keterangan'],
  },
  Dokumen: {
    title: 'Manajemen Dokumen',
    cols: [
      'judul',
      'kategori',
      'mapel',
      'kelas',
      'akses',
      'url',
      'pengunggah',
      'tanggal',
    ],
  },
  Pengguna: {
    title: 'Manajemen Akun & Hak Akses',
    cols: ['username', 'nama', 'role', 'refId', 'status', 'newPassword'],
  },
};

export function CrudManagerView({
  heading,
  tables,
  activeTable,
  user,
  onChangeTable,
  onRefreshPublic,
  onToast,
  onRequestConfirm,
}: {
  heading: string;
  tables: Array<Exclude<TableName, 'Pengaturan'>>;
  activeTable: Exclude<TableName, 'Pengaturan'>;
  user: SessionUser;
  onChangeTable: (tbl: string) => void;
  onRefreshPublic: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => void;
}) {
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [search, setSearch] = useState('');
  const [modalRow, setModalRow] = useState<Record<string, string> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const meta = TABLE_META[activeTable];

  const loadRows = useCallback(async () => {
    const data = await getTableRows(user, activeTable);
    setRows(data as unknown as Array<Record<string, string>>);
  }, [user, activeTable]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filtered = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    const blank: Record<string, string> = {};
    meta.cols.forEach((c) => {
      blank[c] = '';
    });
    setIsNew(true);
    setModalRow(blank);
  };

  const openEdit = (row: Record<string, string>) => {
    setIsNew(false);
    setModalRow({ ...row, newPassword: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRow) return;
    const res = await saveTableRow(user, activeTable, modalRow);
    if (res.ok) {
      setModalRow(null);
      await onRefreshPublic();
      await loadRows();
      onToast('Data berhasil disimpan.');
    } else {
      onToast(res.error, 'error');
    }
  };

  const handleDelete = (row: Record<string, string>) => {
    onRequestConfirm(
      `Hapus Data ${activeTable}`,
      `Data dengan ID ${row.id} akan dihapus secara permanen. Lanjutkan?`,
      async () => {
        const res = await deleteTableRow(user, activeTable, row.id);
        if (res.ok) {
          await onRefreshPublic();
          await loadRows();
          onToast('Data berhasil dihapus.');
        } else {
          onToast(res.error, 'error');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-[#0f2942]">{heading}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah {activeTable}</span>
          </button>
          <button
            type="button"
            onClick={() => exportRowsToExcel(activeTable, rows)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tables.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChangeTable(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTable === t
                ? 'bg-[#0f2942] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {TABLE_META[t].title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari data..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left tabular-nums">
            <thead className="bg-[#0f2942] text-white">
              <tr>
                {meta.cols
                  .filter((c) => c !== 'newPassword')
                  .map((c) => (
                    <th key={c} className="p-2.5 font-semibold capitalize">
                      {c}
                    </th>
                  ))}
                <th className="p-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    {meta.cols
                      .filter((c) => c !== 'newPassword')
                      .map((c) => (
                        <td key={c} className="p-2.5 max-w-[200px] truncate">
                          {r[c]}
                        </td>
                      ))}
                    <td className="p-2.5 flex gap-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-1 text-sky-700 font-semibold hover:underline"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="inline-flex items-center gap-1 text-rose-600 font-semibold hover:underline"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={meta.cols.length + 1}
                    className="p-6 text-center text-slate-500"
                  >
                    Belum ada data yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalRow && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0f2942] text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {isNew ? 'Tambah ' : 'Edit '}
                {meta.title}
              </h3>
              <button
                type="button"
                onClick={() => setModalRow(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSave}
              className="p-5 space-y-3 overflow-y-auto text-sm"
            >
              {meta.cols.map((c) => {
                if (c === 'role') {
                  return (
                    <div key={c}>
                      <label className="block text-xs font-semibold mb-1">
                        Role Hak Akses
                      </label>
                      <select
                        value={modalRow[c] || 'Siswa'}
                        onChange={(e) =>
                          setModalRow({ ...modalRow, [c]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        {(
                          [
                            'Administrator',
                            'Kepala Sekolah',
                            'Operator Sekolah',
                            'Guru',
                            'Siswa',
                          ] as UserRole[]
                        ).map((rl) => (
                          <option key={rl} value={rl}>
                            {rl}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (c === 'isi' || c === 'deskripsi') {
                  return (
                    <div key={c}>
                      <label className="block text-xs font-semibold mb-1 capitalize">
                        {c}
                      </label>
                      <textarea
                        rows={4}
                        value={modalRow[c] || ''}
                        onChange={(e) =>
                          setModalRow({ ...modalRow, [c]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  );
                }
                return (
                  <div key={c}>
                    <label className="block text-xs font-semibold mb-1 capitalize">
                      {c === 'newPassword'
                        ? 'Kata Sandi Baru (Opsional saat edit)'
                        : c}
                    </label>
                    <input
                      type={c === 'newPassword' ? 'password' : 'text'}
                      value={modalRow[c] || ''}
                      onChange={(e) =>
                        setModalRow({ ...modalRow, [c]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                );
              })}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
              >
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ManajemenLayananView({
  user,
  onToast,
}: {
  user: SessionUser;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [rows, setRows] = useState<LayananRow[]>([]);
  const [edits, setEdits] = useState<
    Record<string, { status: string; tanggapan: string }>
  >({});

  const loadLayanan = useCallback(async () => {
    const data = await getTableRows(user, 'Layanan');
    setRows(data);
    const map: Record<string, { status: string; tanggapan: string }> = {};
    data.forEach((l) => {
      map[l.id] = { status: l.status, tanggapan: l.tanggapan };
    });
    setEdits(map);
  }, [user]);

  useEffect(() => {
    loadLayanan();
  }, [loadLayanan]);

  const handleUpdate = async (id: string) => {
    const item = edits[id];
    if (!item) return;
    const res = await saveTableRow(user, 'Layanan', {
      id,
      status: item.status,
      tanggapan: item.tanggapan,
    });
    if (res.ok) {
      onToast('Status layanan diperbarui.');
      loadLayanan();
    } else onToast(res.error, 'error');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0f2942]">
        Verifikasi Layanan, SPMB, Surat & Aspirasi
      </h2>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
        {rows.map((l) => (
          <div
            key={l.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs"
          >
            <div className="flex flex-wrap justify-between font-bold text-[#0f2942] tabular-nums">
              <span>
                {l.id} · {l.jenis} ({l.pemohon})
              </span>
              <span className="text-sky-700">
                {l.tanggal} · {l.status}
              </span>
            </div>
            <div className="text-slate-600 tabular-nums">
              Kontak: {l.kontak} · Asal/Kelas: {l.kelasAtauAsal}
            </div>
            <p className="text-slate-800">{l.detail}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <select
                value={edits[l.id]?.status || l.status}
                onChange={(e) =>
                  setEdits((prev) => ({
                    ...prev,
                    [l.id]: {
                      ...(prev[l.id] || { tanggapan: l.tanggapan }),
                      status: e.target.value,
                    },
                  }))
                }
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option>Menunggu Verifikasi</option>
                <option>Diproses</option>
                <option>Selesai</option>
                <option>Ditolak</option>
              </select>
              <input
                value={edits[l.id]?.tanggapan ?? l.tanggapan}
                onChange={(e) =>
                  setEdits((prev) => ({
                    ...prev,
                    [l.id]: {
                      ...(prev[l.id] || { status: l.status }),
                      tanggapan: e.target.value,
                    },
                  }))
                }
                placeholder="Tanggapan petugas..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => handleUpdate(l.id)}
                className="px-4 py-1.5 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg font-semibold whitespace-nowrap shrink-0"
              >
                Simpan Respon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPengaturanView({
  user,
  publicData,
  onRefreshPublic,
  onToast,
  onRequestConfirm,
  onNavigate,
}: {
  user: SessionUser;
  publicData: PublicData;
  onRefreshPublic: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => void;
  onNavigate: (view: ViewId, subTab?: string) => void;
}) {
  const [sectionTab, setSectionTab] = useState<'umum' | 'profil'>('umum');
  const [formState, setFormState] = useState<PengaturanMap>(
    publicData.pengaturan
  );
  const [logs, setLogs] = useState<LogAktivitasRow[]>([]);
  const [users, setUsers] = useState<PenggunaRow[]>([]);
  const [userModal, setUserModal] = useState<Record<string, string> | null>(
    null
  );

  const isAdmin = user.role === 'Administrator';

  const loadAdminData = useCallback(async () => {
    const l = await getTableRows(user, 'LogAktivitas');
    setLogs(l);
    if (isAdmin) {
      const u = await getTableRows(user, 'Pengguna');
      setUsers(u);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    setFormState(publicData.pengaturan);
    loadAdminData();
  }, [publicData.pengaturan, loadAdminData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await savePengaturan(user, formState);
    if (res.ok) {
      await onRefreshPublic();
      await loadAdminData();
      onToast('Pengaturan sekolah disimpan.');
    } else onToast(res.error, 'error');
  };

  const handleBackup = async () => {
    try {
      const dump = await exportDatabaseBackup(user);
      const blob = new Blob([JSON.stringify(dump, null, 2)], {
        type: 'application/json',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `BACKUP_SMPN3_PAKUHAJI_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      onToast('Backup database JSON berhasil diunduh.');
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : 'Gagal membuat backup.',
        'error'
      );
    }
  };

  const handleClearDemo = () => {
    onRequestConfirm(
      'Hapus Seluruh Data Demo',
      'Seluruh data demonstrasi (kecuali akun Administrator yang sedang login) akan dihapus permanen. Lanjutkan?',
      async () => {
        const res = await clearAllDemoData(user);
        if (res.ok) {
          await onRefreshPublic();
          await loadAdminData();
          onToast('Seluruh data demonstrasi telah dihapus.');
        } else {
          onToast(res.error, 'error');
        }
      }
    );
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal) return;
    const res = await saveTableRow(user, 'Pengguna', userModal);
    if (res.ok) {
      setUserModal(null);
      await loadAdminData();
      onToast('Akun pengguna berhasil disimpan.');
    } else onToast(res.error, 'error');
  };

  const handleDeleteUser = (u: PenggunaRow) => {
    onRequestConfirm(
      'Hapus Akun Pengguna',
      `Akun "${u.nama}" (${u.username}) akan dihapus permanen. Lanjutkan?`,
      async () => {
        const res = await deleteTableRow(user, 'Pengguna', u.id);
        if (res.ok) {
          await loadAdminData();
          onToast('Akun pengguna dihapus.');
        } else {
          onToast(res.error, 'error');
        }
      }
    );
  };

  const settingFields: Array<[keyof PengaturanMap, string]> = [
    ['namaSekolah', 'Nama Resmi Sekolah'],
    ['tagline', 'Tagline'],
    ['npsn', 'NPSN'],
    ['alamat', 'Alamat Lengkap'],
    ['telepon', 'Telepon'],
    ['email', 'Email'],
    ['tahunAjaran', 'Tahun Pelajaran Aktif'],
    ['semester', 'Semester Aktif'],
    ['kepalaSekolah', 'Nama Kepala Sekolah'],
    ['logoUrl', 'URL Logo Sekolah (Kosongkan untuk emblem default)'],
    ['banner1', 'URL Banner Slide 1'],
    ['banner2', 'URL Banner Slide 2'],
    ['banner3', 'URL Banner Slide 3'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-[#0f2942]">
          Pengaturan Sekolah, Hak Akses, Backup & Log Aktivitas
        </h2>
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setSectionTab('umum')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              sectionTab === 'umum'
                ? 'bg-white text-[#0f2942] shadow-xs'
                : 'text-slate-600 hover:text-[#0f2942]'
            }`}
          >
            Identitas, Logo & Banner
          </button>
          <button
            type="button"
            onClick={() => setSectionTab('profil')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              sectionTab === 'profil'
                ? 'bg-white text-[#0f2942] shadow-xs'
                : 'text-slate-600 hover:text-[#0f2942]'
            }`}
          >
            Konten & Tab Profil Sekolah
          </button>
        </div>
      </div>

      {sectionTab === 'profil' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-[#0f2942] text-base mb-4">
            Kelola Tab Profil Sekolah & Isi di Dalamnya
          </h3>
          <ProfilContentEditor
            user={user}
            publicData={publicData}
            onRefreshPublic={onRefreshPublic}
            onToast={onToast}
            onNavigate={onNavigate}
          />
        </div>
      ) : (
      <div className="grid lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSaveSettings}
          className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-sm"
        >
          <h3 className="font-bold text-[#0f2942] text-base">
            Identitas, Logo, Banner & Tahun Pelajaran
          </h3>
          {settingFields.map(([k, lbl]) => {
            if (k === 'logoUrl') {
              return (
                <div
                  key="logoUrl"
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    {lbl}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-slate-300 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      <SchoolShieldLogo
                        logoUrl={formState.logoUrl}
                        className="w-11 h-11"
                      />
                    </div>
                    <input
                      value={formState.logoUrl || ''}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          logoUrl: e.target.value,
                        })
                      }
                      onBlur={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          logoUrl: normalizeImageUrl(e.target.value),
                        }))
                      }
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>
                      Jika pakai Google Drive, pastikan akses file disetel ke{' '}
                      <strong>Siapa saja yang memiliki link</strong>.
                    </span>
                    <label className="cursor-pointer font-semibold text-sky-700 hover:underline">
                      <span>Atau unggah gambar dari perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const up = await validateAndReadUpload(user, file);
                          if (up.ok) {
                            setFormState((prev) => ({
                              ...prev,
                              logoUrl: up.url,
                            }));
                            onToast('Logo diunggah. Klik Simpan Pengaturan untuk menerapkan.');
                          } else {
                            onToast(up.error, 'error');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }
            if (k === 'banner1' || k === 'banner2' || k === 'banner3') {
              return (
                <div
                  key={String(k)}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    {lbl}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg border border-slate-300 bg-slate-900 shrink-0 overflow-hidden">
                      <SafeImage
                        src={formState[k]}
                        alt={lbl}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input
                      value={formState[k] || ''}
                      onChange={(e) =>
                        setFormState({ ...formState, [k]: e.target.value })
                      }
                      onBlur={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [k]: normalizeImageUrl(e.target.value),
                        }))
                      }
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                  <div className="flex justify-end text-[11px]">
                    <label className="cursor-pointer font-semibold text-sky-700 hover:underline">
                      <span>Atau unggah gambar dari perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const up = await validateAndReadUpload(user, file);
                          if (up.ok) {
                            setFormState((prev) => ({
                              ...prev,
                              [k]: up.url,
                            }));
                            onToast(`${lbl} diunggah. Klik Simpan Pengaturan untuk menerapkan.`);
                          } else {
                            onToast(up.error, 'error');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }
            return (
              <div key={String(k)}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {lbl}
                </label>
                <input
                  value={formState[k] || ''}
                  onChange={(e) =>
                    setFormState({ ...formState, [k]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            );
          })}
          <button
            type="submit"
            className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
          >
            Simpan Pengaturan Sekolah
          </button>
        </form>

        <div className="space-y-6">
          {isAdmin && (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-[#0f2942] text-base">
                  Backup Database & Data Demonstrasi
                </h3>
                <p className="text-xs text-slate-600">
                  Unduh seluruh data dalam format JSON atau bersihkan data
                  demonstrasi sebelum operasional penuh.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleBackup}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup JSON Lengkap</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDemo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Seluruh Data Demo</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#0f2942] text-base">
                    Manajemen Akun Pengguna
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setUserModal({
                        username: '',
                        nama: '',
                        role: 'Guru',
                        refId: '',
                        status: 'Aktif',
                        newPassword: '',
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f2942] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Akun
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 border border-slate-200 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#0f2942]">
                          {u.nama} ({u.username})
                        </div>
                        <div className="text-sky-700 font-medium mt-0.5">
                          {u.role} · {u.status}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setUserModal({
                              id: u.id,
                              username: u.username,
                              nama: u.nama,
                              role: u.role,
                              refId: u.refId,
                              status: u.status,
                              newPassword: '',
                            })
                          }
                          className="text-sky-700 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-[#0f2942] text-base mb-3">
              Riwayat Aktivitas Pengguna (Audit Log)
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2 text-xs tabular-nums">
              {logs.slice(0, 25).map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex justify-between font-bold text-[#0f2942]">
                    <span>{l.aksi}</span>
                    <span className="text-slate-400 font-normal">
                      {l.waktu?.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {l.pengguna} ({l.role}) — {l.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {userModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0f2942] text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">
                {userModal.id ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna'}
              </h3>
              <button
                type="button"
                onClick={() => setUserModal(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUserModal} className="p-5 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Username
                </label>
                <input
                  required
                  value={userModal.username || ''}
                  onChange={(e) =>
                    setUserModal({ ...userModal, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nama Lengkap
                </label>
                <input
                  required
                  value={userModal.nama || ''}
                  onChange={(e) =>
                    setUserModal({ ...userModal, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Role Hak Akses
                  </label>
                  <select
                    value={userModal.role || 'Guru'}
                    onChange={(e) =>
                      setUserModal({ ...userModal, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {(
                      [
                        'Administrator',
                        'Kepala Sekolah',
                        'Operator Sekolah',
                        'Guru',
                        'Siswa',
                      ] as UserRole[]
                    ).map((rl) => (
                      <option key={rl} value={rl}>
                        {rl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={userModal.status || 'Aktif'}
                    onChange={(e) =>
                      setUserModal({ ...userModal, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  ID Referensi (Opsional, misal SIS-001)
                </label>
                <input
                  value={userModal.refId || ''}
                  onChange={(e) =>
                    setUserModal({ ...userModal, refId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kata Sandi Baru (Kosongkan jika tidak mengubah)
                </label>
                <input
                  type="password"
                  value={userModal.newPassword || ''}
                  onChange={(e) =>
                    setUserModal({ ...userModal, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-lg"
              >
                Simpan Akun
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

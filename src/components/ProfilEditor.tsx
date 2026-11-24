import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import type {
  PengaturanMap,
  PublicData,
  SessionUser,
  ViewId,
} from '../types';
import {
  getProfilTabs,
  normalizeImageUrl,
  ProfilTabConfigItem,
  ProfilTabId,
  savePengaturan,
  validateAndReadUpload,
} from '../services/db';
import { SafeImage } from './UiPrimitives';

function StringListEditor({
  label,
  helper,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  helper?: string;
  items: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const val = draft.trim();
    if (!val) return;
    onChange([...items, val]);
    setDraft('');
  };

  const updateAt = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };

  const moveAt = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const removeAt = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div>
        <div className="text-xs font-bold text-[#0f2942]">{label}</div>
        {helper && <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>}
      </div>

      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateAt(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              />
              <button
                type="button"
                onClick={() => moveAt(idx, -1)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                title="Pindah ke atas"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveAt(idx, 1)}
                disabled={idx === items.length - 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                title="Pindah ke bawah"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                title="Hapus item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 py-1">Belum ada item.</div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah
        </button>
      </div>
    </div>
  );
}

function splitList(raw: string | undefined, sep: string): string[] {
  return (raw || '')
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function ProfilContentEditor({
  user,
  publicData,
  initialTab = 'identitas',
  onRefreshPublic,
  onToast,
  onNavigate,
  onClose,
}: {
  user: SessionUser;
  publicData: PublicData;
  initialTab?: ProfilTabId;
  onRefreshPublic: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: ViewId, subTab?: string) => void;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ProfilTabId | 'kelola_tab'>(initialTab);
  const [form, setForm] = useState<PengaturanMap>(publicData.pengaturan);
  const [tabConfigs, setTabConfigs] = useState<ProfilTabConfigItem[]>(() =>
    getProfilTabs(publicData.pengaturan)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(publicData.pengaturan);
    setTabConfigs(getProfilTabs(publicData.pengaturan));
  }, [publicData.pengaturan]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const visibleCount = tabConfigs.filter((t) => t.visible).length;
    if (visibleCount === 0) {
      onToast('Minimal harus ada 1 tab Profil Sekolah yang ditampilkan.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<PengaturanMap> = {
        ...form,
        profilTabsConfig: JSON.stringify(tabConfigs),
      };
      const res = await savePengaturan(user, payload);
      if (res.ok) {
        await onRefreshPublic();
        onToast('Konten & pengaturan tab Profil Sekolah berhasil disimpan.');
        if (onClose) onClose();
      } else {
        onToast(res.error, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const editorTabs: Array<[ProfilTabId | 'kelola_tab', string]> = [
    ['identitas', 'Identitas & Sejarah'],
    ['visimisi', 'Visi & Misi'],
    ['struktur', 'Struktur & Kepala Sekolah'],
    ['guru', 'Data Guru & Tendik'],
    ['fasilitas', 'Fasilitas, Prestasi & Ekskul'],
    ['kelola_tab', 'Label & Tampilan Tab'],
  ];

  const strukturItems = splitList(form.strukturOrganisasi, '|');
  const fasilitasItems = splitList(form.fasilitas, ',');
  const prestasiItems = splitList(form.prestasi, '|');
  const ekskulItems = splitList(form.ekstrakurikuler, '|');

  return (
    <form onSubmit={handleSave} className="space-y-5 text-sm">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
        {editorTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              activeTab === id
                ? 'bg-white text-[#0f2942] shadow-xs'
                : 'text-slate-600 hover:text-[#0f2942]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'identitas' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Sekolah
              </label>
              <input
                required
                value={form.namaSekolah || ''}
                onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NPSN
              </label>
              <input
                value={form.npsn || ''}
                onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Sekolah
              </label>
              <select
                value={form.statusSekolah || 'Negeri'}
                onChange={(e) =>
                  setForm({ ...form, statusSekolah: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Negeri">Negeri</option>
                <option value="Swasta">Swasta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Akreditasi
              </label>
              <select
                value={form.akreditasi || 'A'}
                onChange={(e) => setForm({ ...form, akreditasi: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="Belum Terakreditasi">Belum Terakreditasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Telepon
              </label>
              <input
                value={form.telepon || ''}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Resmi
              </label>
              <input
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Website
              </label>
              <input
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  value={form.tahunAjaran || ''}
                  onChange={(e) =>
                    setForm({ ...form, tahunAjaran: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Semester
                </label>
                <select
                  value={form.semester || 'Ganjil'}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              value={form.alamat || ''}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sejarah Sekolah
            </label>
            <textarea
              rows={5}
              value={form.sejarah || ''}
              onChange={(e) => setForm({ ...form, sejarah: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {activeTab === 'visimisi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Visi Sekolah
            </label>
            <textarea
              rows={3}
              value={form.visi || ''}
              onChange={(e) => setForm({ ...form, visi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Misi Sekolah (1 poin per baris)
            </label>
            <textarea
              rows={7}
              value={form.misi || ''}
              onChange={(e) => setForm({ ...form, misi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {activeTab === 'struktur' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                value={form.kepalaSekolah || ''}
                onChange={(e) =>
                  setForm({ ...form, kepalaSekolah: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                value={form.nipKepsek || ''}
                onChange={(e) => setForm({ ...form, nipKepsek: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Foto Kepala Sekolah (URL / Google Drive / Unggah File)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-16 rounded-lg border border-slate-300 bg-white overflow-hidden shrink-0">
                <SafeImage
                  src={form.fotoKepsek}
                  alt={form.kepalaSekolah || 'Foto Kepala Sekolah'}
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                value={form.fotoKepsek || ''}
                onChange={(e) => setForm({ ...form, fotoKepsek: e.target.value })}
                onBlur={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fotoKepsek: normalizeImageUrl(e.target.value),
                  }))
                }
                placeholder="https://drive.google.com/file/d/.../view"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>
            <div className="flex justify-end text-[11px]">
              <label className="cursor-pointer font-semibold text-sky-700 hover:underline">
                <span>Atau unggah foto dari perangkat</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const up = await validateAndReadUpload(user, file);
                    if (up.ok) {
                      setForm((prev) => ({ ...prev, fotoKepsek: up.url }));
                      onToast('Foto Kepala Sekolah siap disimpan.');
                    } else {
                      onToast(up.error, 'error');
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sambutan Kepala Sekolah
            </label>
            <textarea
              rows={4}
              value={form.sambutanKepsek || ''}
              onChange={(e) =>
                setForm({ ...form, sambutanKepsek: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
            />
          </div>

          <StringListEditor
            label="Struktur Organisasi Sekolah"
            helper="Setiap baris tampil sebagai satu kartu jabatan di halaman Profil Sekolah."
            items={strukturItems}
            placeholder="Contoh: Wakasek Kesiswaan: Nama Guru, S.Pd."
            onChange={(next) =>
              setForm({ ...form, strukturOrganisasi: next.join(' | ') })
            }
          />
        </div>
      )}

      {activeTab === 'guru' && (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#0f2942] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#0f2942]">
                Data Guru & Tenaga Kependidikan ({publicData.guru.length} orang)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftar Guru & Tendik yang tampil di tab Profil Sekolah diambil
                secara otomatis dari tabel master <strong>Data Guru & Tendik</strong>.
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                onNavigate('manajemen_akademik', 'Guru');
              }}
              className="px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold"
            >
              Kelola Data Guru & Tendik
            </button>
          )}
        </div>
      )}

      {activeTab === 'fasilitas' && (
        <div className="space-y-4">
          <StringListEditor
            label="Fasilitas Sekolah"
            items={fasilitasItems}
            placeholder="Contoh: Laboratorium Komputer"
            onChange={(next) => setForm({ ...form, fasilitas: next.join(', ') })}
          />
          <StringListEditor
            label="Prestasi Sekolah"
            items={prestasiItems}
            placeholder="Contoh: Juara 1 OSN Matematika Tingkat Kabupaten (2026)"
            onChange={(next) => setForm({ ...form, prestasi: next.join(' | ') })}
          />
          <StringListEditor
            label="Ekstrakurikuler"
            items={ekskulItems}
            placeholder="Contoh: Palang Merah Remaja (PMR)"
            onChange={(next) =>
              setForm({ ...form, ekstrakurikuler: next.join(' | ') })
            }
          />
        </div>
      )}

      {activeTab === 'kelola_tab' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Ubah nama label tab atau atur tampil/sembunyi tab pada halaman{' '}
            <strong>Profil Sekolah</strong>.
          </p>
          <div className="space-y-2">
            {tabConfigs.map((tc, idx) => (
              <div
                key={tc.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3"
              >
                <span className="text-[11px] font-mono text-slate-500 w-20 shrink-0">
                  {tc.id}
                </span>
                <input
                  value={tc.label}
                  onChange={(e) => {
                    const next = [...tabConfigs];
                    next[idx] = { ...tc, label: e.target.value };
                    setTabConfigs(next);
                  }}
                  className="flex-1 min-w-[180px] px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = [...tabConfigs];
                    next[idx] = { ...tc, visible: !tc.visible };
                    setTabConfigs(next);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border ${
                    tc.visible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-200 border-slate-300 text-slate-600'
                  }`}
                >
                  {tc.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Tampil
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Disembunyikan
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Profil Sekolah'}</span>
        </button>
      </div>
    </form>
  );
}

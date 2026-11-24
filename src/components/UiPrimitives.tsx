import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Image as ImageIcon,
  Printer,
  X,
} from 'lucide-react';
import type {
  AbsensiRow,
  NilaiRow,
  PengaturanMap,
  SiswaRow,
} from '../types';
import { getImageUrlCandidates } from '../services/db';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function SchoolShieldLogo({
  logoUrl,
  className = 'w-10 h-10',
}: {
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl && logoUrl.trim()) {
    return (
      <SafeImage
        src={logoUrl}
        alt="Logo SMP Negeri 3 Pakuhaji"
        className={`${className} object-contain rounded-lg bg-white/95 p-0.5`}
      />
    );
  }
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} p-1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Emblem SMP Negeri 3 Pakuhaji"
    >
      <path
        d="M32 4L8 14V30C8 45.5 18.2 57.4 32 61C45.8 57.4 56 45.5 56 30V14L32 4Z"
        fill="#0f2942"
        stroke="#d4af37"
        strokeWidth="3"
      />
      <path d="M20 26L32 20L44 26L32 32L20 26Z" fill="#38bdf8" />
      <path
        d="M23 30V39C23 39 27 42 32 42C37 42 41 39 41 39V30"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="14" r="3" fill="#d4af37" />
    </svg>
  );
}

export function SafeImage({
  src,
  alt,
  className = '',
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const candidates = useMemo(() => getImageUrlCandidates(src), [src]);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttemptIdx(0);
    setFailed(false);
  }, [src]);

  const activeSrc = candidates[attemptIdx];

  if (!activeSrc || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 p-2 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-5 h-5 text-amber-400/80" />
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (attemptIdx + 1 < candidates.length) {
          setAttemptIdx((prev) => prev + 1);
        } else {
          setFailed(true);
        }
      }}
      className={className}
    />
  );
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="no-print fixed bottom-5 right-5 z-[70] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const style =
          t.type === 'error'
            ? 'bg-rose-700 text-white'
            : t.type === 'info'
              ? 'bg-[#0f2942] text-white'
              : 'bg-emerald-700 text-white';
        const Icon =
          t.type === 'error'
            ? AlertCircle
            : t.type === 'info'
              ? Info
              : CheckCircle2;
        return (
          <div
            key={t.id}
            className={`${style} px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 transition-all`}
            role="status"
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-[65] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-base text-[#0f2942]">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 text-sm text-slate-600 leading-relaxed">{message}</div>
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white whitespace-nowrap shrink-0"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap shrink-0 ${
              destructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#0f2942] hover:bg-[#163a5f]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ERaporCard({
  siswa,
  nilai,
  absensi,
  pengaturan,
}: {
  siswa: Partial<SiswaRow>;
  nilai: NilaiRow[];
  absensi: AbsensiRow[];
  pengaturan: PengaturanMap;
}) {
  const hadir = absensi.filter((a) => a.status === 'Hadir').length;
  const izin = absensi.filter((a) => a.status === 'Izin').length;
  const sakit = absensi.filter((a) => a.status === 'Sakit').length;
  const alpa = absensi.filter((a) => a.status === 'Alpa').length;

  return (
    <div
      id="printArea"
      className="mt-4 p-6 border border-slate-300 rounded-2xl bg-white space-y-5"
    >
      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-sky-700">
            Laporan Hasil Belajar (E-Rapor)
          </div>
          <h4 className="text-lg font-bold text-[#0f2942] mt-0.5">
            {pengaturan.namaSekolah}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">{pengaturan.alamat}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 px-4 py-2 bg-[#0f2942] hover:bg-[#163a5f] text-white rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Cetak Rapor
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          Nama Siswa:{' '}
          <span className="font-bold text-[#0f2942]">{siswa.nama || '-'}</span>
        </div>
        <div className="tabular-nums">
          NISN: <span className="font-bold text-[#0f2942]">{siswa.nisn || '-'}</span>
        </div>
        <div>
          Kelas: <span className="font-bold text-[#0f2942]">{siswa.kelas || '-'}</span>
        </div>
        <div className="tabular-nums">
          Tahun Ajaran / Semester:{' '}
          <span className="font-bold text-[#0f2942]">
            {pengaturan.tahunAjaran} · {pengaturan.semester}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-slate-200 tabular-nums">
          <thead className="bg-[#0f2942] text-white">
            <tr>
              <th className="p-2.5 border border-slate-300 text-left">
                Mata Pelajaran
              </th>
              <th className="p-2.5 border border-slate-300 text-right">Tugas</th>
              <th className="p-2.5 border border-slate-300 text-right">UTS</th>
              <th className="p-2.5 border border-slate-300 text-right">UAS</th>
              <th className="p-2.5 border border-slate-300 text-right">
                Nilai Akhir
              </th>
              <th className="p-2.5 border border-slate-300 text-center">
                Predikat
              </th>
              <th className="p-2.5 border border-slate-300 text-left">
                Catatan Guru
              </th>
            </tr>
          </thead>
          <tbody>
            {nilai.length > 0 ? (
              nilai.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="p-2.5 border border-slate-200 font-semibold text-[#0f2942]">
                    {n.mapel}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-right">
                    {n.tugas}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-right">
                    {n.uts}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-right">
                    {n.uas}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-right font-bold text-[#0f2942]">
                    {n.nilaiAkhir}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-center font-bold">
                    {n.predikat}
                  </td>
                  <td className="p-2.5 border border-slate-200 text-slate-600">
                    {n.catatan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-slate-500 border border-slate-200"
                >
                  Belum ada data nilai tersimpan untuk siswa ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-6 text-xs bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 tabular-nums">
        <span>
          Hadir: <strong className="text-emerald-700">{hadir}</strong>
        </span>
        <span>
          Izin: <strong className="text-amber-700">{izin}</strong>
        </span>
        <span>
          Sakit: <strong className="text-sky-700">{sakit}</strong>
        </span>
        <span>
          Alpa: <strong className="text-rose-700">{alpa}</strong>
        </span>
      </div>
    </div>
  );
}

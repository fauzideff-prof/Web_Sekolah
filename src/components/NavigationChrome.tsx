import React, { useMemo, useState } from 'react';
import {
  Home,
  School,
  GraduationCap,
  HeartHandshake,
  Newspaper,
  PieChart,
  UserCheck,
  BookOpenCheck,
  Users,
  Images,
  Inbox,
  SlidersHorizontal,
  Search,
  Bell,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import type { PublicData, SessionUser, UserRole, ViewId } from '../types';
import { SchoolShieldLogo } from './UiPrimitives';

interface MenuItem {
  id?: ViewId;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: 'ALL' | UserRole[];
  divider?: boolean;
}

export const MENU_CONFIG: MenuItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home, roles: 'ALL' },
  { id: 'profil', label: 'Profil Sekolah', icon: School, roles: 'ALL' },
  { id: 'akademik', label: 'Akademik', icon: GraduationCap, roles: 'ALL' },
  { id: 'layanan', label: 'Layanan Sekolah', icon: HeartHandshake, roles: 'ALL' },
  { id: 'berita', label: 'Berita & Informasi', icon: Newspaper, roles: 'ALL' },
  {
    divider: true,
    label: 'Portal Pengguna',
    roles: [
      'Administrator',
      'Kepala Sekolah',
      'Operator Sekolah',
      'Guru',
      'Siswa',
    ],
  },
  {
    id: 'dashboard_utama',
    label: 'Dashboard Statistik',
    icon: PieChart,
    roles: ['Administrator', 'Kepala Sekolah', 'Operator Sekolah'],
  },
  {
    id: 'portal_guru',
    label: 'Dashboard Guru',
    icon: UserCheck,
    roles: ['Guru', 'Administrator'],
  },
  {
    id: 'portal_siswa',
    label: 'Dashboard Siswa',
    icon: BookOpenCheck,
    roles: ['Siswa', 'Administrator'],
  },
  {
    divider: true,
    label: 'Administrasi',
    roles: ['Administrator', 'Operator Sekolah', 'Kepala Sekolah', 'Guru'],
  },
  {
    id: 'manajemen_akademik',
    label: 'Siswa, Guru & Kelas',
    icon: Users,
    roles: ['Administrator', 'Operator Sekolah'],
  },
  {
    id: 'manajemen_konten',
    label: 'Berita, Agenda & Galeri',
    icon: Images,
    roles: ['Administrator', 'Operator Sekolah', 'Guru'],
  },
  {
    id: 'manajemen_layanan',
    label: 'Verifikasi Layanan & SPMB',
    icon: Inbox,
    roles: ['Administrator', 'Operator Sekolah'],
  },
  {
    id: 'admin_pengaturan',
    label: 'Pengaturan & Backup',
    icon: SlidersHorizontal,
    roles: ['Administrator', 'Operator Sekolah', 'Kepala Sekolah'],
  },
];

export function Sidebar({
  user,
  currentView,
  publicData,
  mobileOpen,
  onCloseMobile,
  onNavigate,
}: {
  user: SessionUser | null;
  currentView: ViewId;
  publicData: PublicData;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (view: ViewId, subTab?: string) => void;
}) {
  const role: UserRole | 'Pengunjung' = user ? user.role : 'Pengunjung';
  const pengaturan = publicData.pengaturan;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="no-print fixed inset-0 bg-slate-950/50 z-30 lg:hidden"
        />
      )}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-40 h-screen w-68 bg-[#0f2942] text-white flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-amber-400/40 flex items-center justify-center shrink-0 overflow-hidden">
            <SchoolShieldLogo logoUrl={pengaturan.logoUrl} className="w-9 h-9" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-amber-300">
              Web Digital Sekolah
            </div>
            <div className="font-bold text-sm leading-tight truncate">
              {pengaturan.namaSekolah || 'SMP NEGERI 3 PAKUHAJI'}
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-white/70 hover:text-white"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MENU_CONFIG.map((item, idx) => {
            const allowed =
              item.roles === 'ALL' ||
              (role !== 'Pengunjung' && item.roles.includes(role));
            if (!allowed) return null;
            if (item.divider) {
              return (
                <div
                  key={`div-${idx}`}
                  className="pt-4 pb-1 px-3 text-[11px] font-semibold text-sky-300/80"
                >
                  {item.label}
                </div>
              );
            }
            if (!item.id) return null;
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id!)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-amber-300' : 'text-sky-300'
                    }`}
                  />
                )}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs bg-[#081726]/60 space-y-1 tabular-nums">
          <div className="text-sky-200 font-medium">
            NPSN {pengaturan.npsn || '20613847'} · Akreditasi{' '}
            {pengaturan.akreditasi || 'A'}
          </div>
          <div className="text-white/60">
            TA {pengaturan.tahunAjaran} ({pengaturan.semester})
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({
  user,
  publicData,
  onOpenMobileMenu,
  onOpenLogin,
  onLogout,
  onNavigate,
  onSelectBerita,
}: {
  user: SessionUser | null;
  publicData: PublicData;
  onOpenMobileMenu: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigate: (view: ViewId, subTab?: string) => void;
  onSelectBerita: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const searchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: Array<{ type: string; label: string; action: () => void }> = [];
    publicData.berita.forEach((b) => {
      if (`${b.judul} ${b.kategori}`.toLowerCase().includes(q)) {
        hits.push({
          type: 'Berita',
          label: b.judul,
          action: () => onSelectBerita(b.id),
        });
      }
    });
    publicData.guru.forEach((g) => {
      if (`${g.nama} ${g.mapel} ${g.jabatan}`.toLowerCase().includes(q)) {
        hits.push({
          type: 'Guru',
          label: `${g.nama} (${g.mapel})`,
          action: () => onNavigate('profil', 'guru'),
        });
      }
    });
    publicData.agenda.forEach((a) => {
      if (a.judul.toLowerCase().includes(q)) {
        hits.push({
          type: 'Agenda',
          label: `${a.judul} · ${a.tanggalMulai}`,
          action: () => onNavigate('akademik', 'kalender'),
        });
      }
    });
    publicData.dokumen.forEach((doc) => {
      if (doc.judul.toLowerCase().includes(q)) {
        hits.push({
          type: 'Dokumen',
          label: doc.judul,
          action: () => onNavigate('akademik', 'materi'),
        });
      }
    });
    return hits.slice(0, 8);
  }, [searchQuery, publicData, onNavigate, onSelectBerita]);

  return (
    <header className="no-print sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
      {/* Zone 1: Single-line brand mark */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#0f2942] text-white"
          aria-label="Buka navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('beranda')}
          className="inline-flex items-center gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-[#0f2942] whitespace-nowrap shrink-0 text-left"
        >
          <SchoolShieldLogo
            logoUrl={publicData.pengaturan.logoUrl}
            className="w-8 h-8 shrink-0"
          />
          <span>
            {publicData.pengaturan.namaSekolah || 'SMP NEGERI 3 PAKUHAJI'}
          </span>
        </button>
      </div>

      {/* Zone 2: Search & Announcements */}
      <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
        <div className="relative flex-1 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berita, guru, jadwal, dokumen..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
          {searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto z-50 p-1.5">
              {searchHits.length > 0 ? (
                searchHits.map((hit, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      hit.action();
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-sky-700 shrink-0">
                      {hit.type}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="truncate text-slate-800 font-medium">
                      {hit.label}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-500 text-center">
                  Tidak ada hasil yang cocok.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f2942] transition-colors"
            aria-label="Pengumuman terbaru"
          >
            <Bell className="w-4 h-4" />
            {publicData.pengumuman.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-[#081726] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {publicData.pengumuman.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#0f2942] text-white font-semibold text-xs flex justify-between items-center">
                <span>Pengumuman Terbaru</span>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="text-white/70 hover:text-white"
                  aria-label="Tutup pengumuman"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {publicData.pengumuman.length > 0 ? (
                  publicData.pengumuman.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('berita');
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-[11px] font-medium text-sky-700 tabular-nums">
                        {p.prioritas} · {p.tanggal}
                      </div>
                      <div className="font-semibold text-xs text-[#0f2942] mt-0.5">
                        {p.judul}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {p.isi}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-xs text-slate-500 text-center">
                    Belum ada pengumuman.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Single Primary Action */}
      <div className="shrink-0 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-[#0f2942] leading-tight">
                {user.nama}
              </div>
              <div className="text-[11px] text-slate-500">{user.role}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f2942] hover:bg-[#163a5f] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
}

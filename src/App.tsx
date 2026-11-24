import React, { useCallback, useEffect, useState } from 'react';
import type {
  BeritaRow,
  PublicData,
  SessionUser,
  TableName,
  UserRole,
  ViewId,
} from './types';
import {
  deleteTableRow,
  fetchPublicData,
  getStoredSession,
  logoutUserSession,
} from './services/db';
import { MENU_CONFIG, Sidebar, TopBar } from './components/NavigationChrome';
import { LoginModal } from './components/LoginModal';
import {
  ConfirmModal,
  ToastItem,
  ToastStack,
} from './components/UiPrimitives';
import {
  AkademikView,
  BerandaView,
  BeritaDetailModal,
  BeritaView,
  LayananView,
  ProfilView,
} from './components/PublicViews';
import {
  DashboardUtamaView,
  PortalGuruView,
  PortalSiswaView,
} from './components/DashboardViews';
import {
  AdminPengaturanView,
  CrudManagerView,
  ManajemenLayananView,
} from './components/ManagementViews';

function getDefaultRoute(role: UserRole): ViewId {
  if (role === 'Guru') return 'portal_guru';
  if (role === 'Siswa') return 'portal_siswa';
  if (
    role === 'Administrator' ||
    role === 'Kepala Sekolah' ||
    role === 'Operator Sekolah'
  ) {
    return 'dashboard_utama';
  }
  return 'beranda';
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const sess = getStoredSession();
    return sess ? sess.user : null;
  });
  const [publicData, setPublicData] = useState<PublicData | null>(null);
  const [currentView, setCurrentView] = useState<ViewId>(() => {
    const sess = getStoredSession();
    return sess ? getDefaultRoute(sess.user.role) : 'beranda';
  });
  const [subTab, setSubTab] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<BeritaRow | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const pushToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const refreshPublic = useCallback(async () => {
    const data = await fetchPublicData();
    setPublicData(data);
  }, []);

  useEffect(() => {
    refreshPublic();
  }, [refreshPublic]);

  const navigate = useCallback(
    (viewId: ViewId, nextSubTab = '') => {
      const cfg = MENU_CONFIG.find((m) => m.id === viewId);
      const role: UserRole | 'Pengunjung' = user ? user.role : 'Pengunjung';
      if (
        cfg &&
        cfg.roles !== 'ALL' &&
        (role === 'Pengunjung' || !cfg.roles.includes(role))
      ) {
        pushToast(
          'Silakan login dengan hak akses yang sesuai untuk membuka halaman ini.',
          'error'
        );
        setLoginOpen(true);
        return;
      }
      setCurrentView(viewId);
      setSubTab(nextSubTab);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [user, pushToast]
  );

  const handleLoginSuccess = (loggedUser: SessionUser) => {
    setUser(loggedUser);
    setLoginOpen(false);
    pushToast(`Selamat datang, ${loggedUser.nama} (${loggedUser.role})`);
    const target = getDefaultRoute(loggedUser.role);
    setCurrentView(target);
    setSubTab('');
  };

  const handleLogout = async () => {
    await logoutUserSession(user);
    setUser(null);
    pushToast('Anda telah keluar dari sesi.');
    setCurrentView('beranda');
    setSubTab('');
  };

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => {
    setConfirmState({ open: true, title, message, onConfirm });
  };

  if (!publicData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#0f2942] text-sm font-medium">
        Memuat portal sekolah...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-[#0f2942]">
      <Sidebar
        user={user}
        currentView={currentView}
        publicData={publicData}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          publicData={publicData}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenLogin={() => setLoginOpen(true)}
          onLogout={handleLogout}
          onNavigate={navigate}
          onSelectBerita={(id) => {
            const found = publicData.berita.find((b) => b.id === id);
            if (found) setSelectedBerita(found);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'beranda' && (
            <BerandaView
              publicData={publicData}
              onNavigate={navigate}
              onOpenBerita={(b) => setSelectedBerita(b)}
            />
          )}

          {currentView === 'profil' && (
            <ProfilView
              publicData={publicData}
              user={user}
              subTab={subTab}
              onChangeTab={(t) => setSubTab(t)}
              onRefresh={refreshPublic}
              onToast={pushToast}
              onNavigate={navigate}
            />
          )}

          {currentView === 'akademik' && (
            <AkademikView
              publicData={publicData}
              user={user}
              subTab={subTab}
              onChangeTab={(t) => setSubTab(t)}
              onOpenLogin={() => setLoginOpen(true)}
              onNavigateLayananERapor={() => navigate('layanan', 'erapor')}
            />
          )}

          {currentView === 'layanan' && (
            <LayananView
              publicData={publicData}
              subTab={subTab}
              onChangeTab={(t) => setSubTab(t)}
              onToast={pushToast}
              onOpenBerita={(b) => setSelectedBerita(b)}
            />
          )}

          {currentView === 'berita' && (
            <BeritaView
              publicData={publicData}
              user={user}
              onRefresh={refreshPublic}
              onToast={pushToast}
              onOpenBerita={(b) => setSelectedBerita(b)}
              onRequestDelete={(id, judul) => {
                if (!user) return;
                requestConfirm(
                  'Hapus Berita',
                  `Apakah Anda yakin ingin menghapus berita "${judul}"?`,
                  async () => {
                    const res = await deleteTableRow(user, 'Berita', id);
                    if (res.ok) {
                      await refreshPublic();
                      pushToast('Berita berhasil dihapus.');
                    } else pushToast(res.error, 'error');
                  }
                );
              }}
            />
          )}

          {currentView === 'dashboard_utama' && user && (
            <DashboardUtamaView user={user} />
          )}

          {currentView === 'portal_guru' && user && (
            <PortalGuruView
              user={user}
              publicData={publicData}
              subTab={subTab}
              onChangeTab={(t) => setSubTab(t)}
              onRefreshPublic={refreshPublic}
              onToast={pushToast}
            />
          )}

          {currentView === 'portal_siswa' && user && (
            <PortalSiswaView
              user={user}
              publicData={publicData}
              onToast={pushToast}
            />
          )}

          {currentView === 'manajemen_akademik' && user && (
            <CrudManagerView
              heading="Manajemen Siswa, Guru & Kelas"
              tables={['Siswa', 'Guru', 'Kelas', 'Jadwal']}
              activeTable={
                (['Siswa', 'Guru', 'Kelas', 'Jadwal'].includes(subTab)
                  ? subTab
                  : 'Siswa') as Exclude<TableName, 'Pengaturan'>
              }
              user={user}
              onChangeTable={(t) => setSubTab(t)}
              onRefreshPublic={refreshPublic}
              onToast={pushToast}
              onRequestConfirm={requestConfirm}
            />
          )}

          {currentView === 'manajemen_konten' && user && (
            <CrudManagerView
              heading="Manajemen Berita, Agenda & Galeri"
              tables={['Berita', 'Pengumuman', 'Agenda', 'Galeri', 'Dokumen']}
              activeTable={
                ([
                  'Berita',
                  'Pengumuman',
                  'Agenda',
                  'Galeri',
                  'Dokumen',
                ].includes(subTab)
                  ? subTab
                  : 'Berita') as Exclude<TableName, 'Pengaturan'>
              }
              user={user}
              onChangeTable={(t) => setSubTab(t)}
              onRefreshPublic={refreshPublic}
              onToast={pushToast}
              onRequestConfirm={requestConfirm}
            />
          )}

          {currentView === 'manajemen_layanan' && user && (
            <ManajemenLayananView user={user} onToast={pushToast} />
          )}

          {currentView === 'admin_pengaturan' && user && (
            <AdminPengaturanView
              user={user}
              publicData={publicData}
              onRefreshPublic={refreshPublic}
              onToast={pushToast}
              onRequestConfirm={requestConfirm}
              onNavigate={navigate}
            />
          )}
        </main>

        <footer className="no-print bg-[#0f2942] text-slate-300 text-xs py-5 px-6 mt-12 border-t border-amber-500/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <span className="font-bold text-white">
                {publicData.pengaturan.namaSekolah}
              </span>{' '}
              · {publicData.pengaturan.alamat}
            </div>
            <div className="text-amber-300 font-medium">
              {publicData.pengaturan.tagline}
            </div>
          </div>
        </footer>
      </div>

      <LoginModal
        open={loginOpen}
        demoCleared={publicData.pengaturan.demoCleared === 'true'}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <BeritaDetailModal
        berita={selectedBerita}
        onClose={() => setSelectedBerita(null)}
      />

      <ConfirmModal
        open={!!confirmState?.open}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        destructive
        onCancel={() => setConfirmState(null)}
        onConfirm={async () => {
          const fn = confirmState?.onConfirm;
          setConfirmState(null);
          if (fn) await fn();
        }}
      />

      <ToastStack toasts={toasts} />
    </div>
  );
}

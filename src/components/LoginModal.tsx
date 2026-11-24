import React, { useState } from 'react';
import { LogIn, X, Info } from 'lucide-react';
import { loginUser } from '../services/db';
import type { SessionUser } from '../types';

export function LoginModal({
  open,
  demoCleared,
  onClose,
  onSuccess,
}: {
  open: boolean;
  demoCleared: boolean;
  onClose: () => void;
  onSuccess: (user: SessionUser) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(username, password);
      if (res.ok) {
        onSuccess(res.user);
      } else {
        setError(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    ['Admin', 'admin', 'admin123'],
    ['Kepsek', 'kepsek', 'kepsek123'],
    ['Operator', 'operator', 'operator123'],
    ['Guru', 'guru', 'guru123'],
    ['Siswa', 'siswa', 'siswa123'],
  ];

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0f2942] px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Login Pengguna</h3>
            <p className="text-xs text-sky-200 mt-0.5">
              Portal Web Digital SMP Negeri 3 Pakuhaji
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white"
            aria-label="Tutup modal login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {error && (
            <div className="text-xs bg-rose-50 text-rose-700 px-3.5 py-2.5 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0f2942] hover:bg-[#163a5f] text-white font-semibold rounded-xl text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
          </button>

          {!demoCleared && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-[#0f2942] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Akun Demonstrasi (Klik untuk mengisi)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {demoAccounts.map(([lbl, u, p]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      setUsername(u);
                      setPassword(p);
                    }}
                    className="text-left px-2 py-1 rounded-lg hover:bg-sky-50 text-[11px] text-slate-700 font-medium"
                  >
                    <span className="font-bold text-[#0f2942]">{lbl}:</span> {u}{' '}
                    / {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

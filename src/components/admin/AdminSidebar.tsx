import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiImage, FiFilm, FiSliders, FiHome, FiAward } from 'react-icons/fi';

export type AdminTab = 'dashboard' | 'logos' | 'movies' | 'settings';

export interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  logoCount: number;
  movieCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  logoCount,
  movieCount,
}) => {
  const navigate = useNavigate();

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'logos', label: 'Logo Manager', icon: <FiImage className="w-5 h-5" />, badge: logoCount },
    { id: 'movies', label: 'Movie Manager', icon: <FiFilm className="w-5 h-5" />, badge: movieCount },
    { id: 'settings', label: 'Settings', icon: <FiSliders className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <FiAward className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider text-slate-100 uppercase">HOST ADMIN</h2>
            <p className="text-[11px] font-mono text-cyan-400">Freshers Arena v1.0</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Return to Arena Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => navigate('/home')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
        >
          <FiHome className="w-4 h-4" />
          <span>Exit to Arena</span>
        </button>
      </div>
    </aside>
  );
};

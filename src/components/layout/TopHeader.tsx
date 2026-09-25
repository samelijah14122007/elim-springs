import React, { useState } from 'react';
import { useTranslation, getLanguageDefinition } from '../../i18n';
import { LanguageSelectorModal } from '../common';
import {
  Bell,
  Globe,
  UserCheck,
  Layers,
  PhoneCall,
  Camera,
  Bot,
  MapPin,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { WatershedCatchment, LanguageCode } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { bhuvanService } from '../../services/bhuvanService';
import { useTheme } from '../../contexts/ThemeContext';

interface TopHeaderProps {
  catchments: WatershedCatchment[];
  selectedCatchment: WatershedCatchment;
  onSelectCatchment: (catchment: WatershedCatchment) => void;
  activeLanguage: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  userRole: string;
  onChangeUserRole: (role: string) => void;
  onQuickReportPhoto: () => void;
  onQuickSimulateIvr: () => void;
  onOpenAgent?: () => void;
  onOpenLogin?: () => void;
  isLoggedIn?: boolean;
  currentUser?: { name: string; role: string; email: string } | null;
  onLogout?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  catchments,
  selectedCatchment,
  onSelectCatchment,
  activeLanguage,
  onChangeLanguage,
  userRole,
  onChangeUserRole,
  onQuickReportPhoto,
  onQuickSimulateIvr,
  onOpenAgent,
  onOpenLogin,
  isLoggedIn = false,
  currentUser = null,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const availableRoles = [
    { name: 'Junior Engineer (WDT)', badge: 'Technical' },
    { name: 'Gram Rozgar Sevak', badge: 'Field Scout' },
    { name: 'Panchayat Sarpanch', badge: 'Authority' },
    { name: 'State Commissioner (WDC)', badge: 'Executive' },
  ];

  return (
    <header className="sticky top-0 z-20 flex flex-col border-b border-[#DCE3DD] bg-white/95 backdrop-blur-md">
      {/* Editorial Top Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 min-w-0">
        {/* Left: CURRENT WATERSHED Hierarchy Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono font-bold tracking-[0.16em] text-[#075B45] uppercase">
              CURRENT WATERSHED
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <select
                value={selectedCatchment.id}
                onChange={(e) => {
                  const found = catchments.find((c) => c.id === e.target.value);
                  if (found) onSelectCatchment(found);
                }}
                className="bg-transparent text-sm sm:text-base font-bold text-[#17211D] tracking-tight focus:outline-none cursor-pointer pr-2 hover:text-[#075B45] transition-colors truncate max-w-[200px] sm:max-w-none"
              >
                {catchments.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-[#17211D]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-[#66736C] border-l border-[#DCE3DD] pl-3 shrink-0">
            <span className="text-[#66736C]">CODE:</span>
            <span className="text-[#075B45] font-semibold">{selectedCatchment.code}</span>
            <span className="text-[#DCE3DD]">•</span>
            <span className="text-[#66736C]">AREA:</span>
            <span className="text-[#17211D] font-medium">{selectedCatchment.areaHa.toLocaleString()} ha</span>
          </div>
        </div>

        {/* Right: Geographic Context + Prototype Badge + Ask Agent + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Location Context */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-[#66736C]">
            <MapPin className="w-3.5 h-3.5 text-[#075B45]" />
            <span>{selectedCatchment.district}, {selectedCatchment.state}</span>
          </div>

          {/* Prototype Data Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-800 font-semibold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Prototype Data</span>
          </div>

          {/* ASK ELIM GEO AGENT Button */}
          {onOpenAgent && (
            <button
              onClick={onOpenAgent}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold font-mono uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>ASK AGENT</span>
            </button>
          )}

          {/* Quick Geo-Photo upload button */}
          <button
            onClick={onQuickReportPhoto}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#075B45] border border-emerald-200 text-xs font-semibold transition-all cursor-pointer"
            title="Upload Real Geo-Photo Evidence"
          >
            <Camera className="w-3.5 h-3.5 text-[#075B45]" />
            <span>+ Photo</span>
          </button>

          {/* 23-Indian-Language Switcher */}
          <button
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-1.5 bg-[#F0F3EE] hover:bg-[#E3E8E1] px-2.5 py-1.5 rounded-xl border border-[#DCE3DD] text-xs text-[#17211D] transition-colors cursor-pointer"
            title="23 Indian Languages UI"
          >
            <Globe className="w-3.5 h-3.5 text-[#075B45] flex-shrink-0" />
            <span className="font-semibold text-xs hidden sm:inline">
              {getLanguageDefinition(activeLanguage).nativeName}
            </span>
            <span className="font-mono text-[10px] text-[#66736C] uppercase font-bold">
              {activeLanguage}
            </span>
          </button>

          {/* User Persona Switcher */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F0F3EE] px-2.5 py-1.5 rounded-xl border border-[#DCE3DD] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#075B45] flex-shrink-0" />
            <select
              value={userRole}
              onChange={(e) => onChangeUserRole(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#17211D] focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              {availableRoles.map((r) => (
                <option key={r.name} value={r.name} className="bg-white text-[#17211D]">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#E3E8E1] text-[#17211D] border border-[#DCE3DD] transition-colors cursor-pointer shadow-xs"
            title={isDark ? 'Switch to Institutional Light Theme' : 'Switch to Dark Geospatial Theme'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#075B45]" />
            )}
          </button>

          {/* User Account / Sign In */}
          {onOpenLogin && (
            <button
              onClick={isLoggedIn && onLogout ? onLogout : onOpenLogin}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isLoggedIn
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-[#075B45] border-emerald-200'
                  : 'bg-[#075B45] hover:bg-[#0E8065] text-white border-transparent'
              }`}
              title={isLoggedIn ? `Logged in as ${currentUser?.name || 'User'} (Click to Logout)` : 'Sign In to Watershed Workspace'}
            >
              {isLoggedIn ? (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                  <LogOut className="w-3 h-3 ml-0.5 opacity-70" />
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          )}

          {/* Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#F0F3EE] hover:bg-[#E3E8E1] text-[#66736C] hover:text-[#17211D] transition-colors border border-[#DCE3DD] relative cursor-pointer"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#DCE3DD] shadow-xl p-4 text-xs z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DD] font-semibold text-[#17211D]">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#66736C]">
                    PRIORITY ALERTS
                  </span>
                  <button onClick={() => setShowNotifications(false)} className="text-[#66736C] hover:text-[#17211D] cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-2">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                    <div className="font-bold flex items-center justify-between">
                      <span>Rui East Check Dam #4</span>
                      <span className="text-[9px] font-mono text-rose-700">2h ago</span>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-1">
                      78% silt deposition. Marathi IVR report logged via Bhashini.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <div className="font-bold flex items-center justify-between">
                      <span>Sentinel-2 L2A Pass</span>
                      <span className="text-[9px] font-mono text-[#075B45]">10m</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      NDVI & NDWI surface indices updated.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </header>
  );
};

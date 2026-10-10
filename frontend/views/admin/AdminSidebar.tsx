import React, { useState, useEffect, useMemo } from 'react';
import { Language, AdminRole, PermissionKey } from '../../types';
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import {
  buildAuthorizedNavigation,
  AdminNavTabId,
  NavItem,
  NavGroup
} from './adminNavigationRegistry';

export type { AdminNavTabId, NavItem, NavGroup };

interface AdminSidebarProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername: string;
  activeTab: AdminNavTabId;
  onSelectTab: (tabId: AdminNavTabId) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  unreadMessagesCount?: number;
  noticesCount?: number;
  can?: (perm: PermissionKey) => boolean;
  onLockConsole?: () => void;
  badgeCounts?: {
    notices?: number;
    documents?: number;
    curriculum?: number;
    staff?: number;
    messages?: number;
    admins?: number;
    vacancies?: number;
    career?: number;
    gallery?: number;
    apiErrors?: number;
  };
}

const STORAGE_ACTIVE_TAB_KEY = 'ishwari_admin_active_tab';
const STORAGE_EXPANDED_GROUPS_KEY = 'ishwari_admin_sidebar_expanded_groups';

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  lang,
  currentRole,
  currentUsername,
  activeTab,
  onSelectTab,
  onLogout,
  onNavigateHome,
  isOpenMobile = false,
  onCloseMobile = () => {},
  unreadMessagesCount,
  noticesCount,
  can,
  badgeCounts = {}
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const effectiveBadges = useMemo(() => ({
    ...badgeCounts,
    messages: unreadMessagesCount !== undefined ? unreadMessagesCount : badgeCounts.messages,
    notices: noticesCount !== undefined ? noticesCount : badgeCounts.notices
  }), [badgeCounts, unreadMessagesCount, noticesCount]);

  // Build the sidebar navigation tree strictly using effective permissions BEFORE rendering.
  // Modules and actions for which the admin lacks permissions are NEVER instantiated.
  const navGroups = useMemo(() => {
    return buildAuthorizedNavigation(can || (() => true), isSuperAdmin, effectiveBadges);
  }, [can, isSuperAdmin, effectiveBadges]);

  // Helper to find which group a tab belongs to
  const findGroupByTab = (tab: AdminNavTabId | string): string | null => {
    if (tab === 'dashboard') return null;
    for (const g of navGroups) {
      if (g.id === tab || g.items.some(item => item.id === tab)) {
        return g.id;
      }
    }
    if (tab === 'account_profile' || tab === 'account' || tab === 'profile') {
      return 'account';
    }
    if (tab === 'gov_chairman' || tab === 'gov_leadership') {
      return 'governance';
    }
    if (tab === 'sys_security' || tab === 'sys_backup' || tab === 'system') {
      return 'system';
    }
    return null;
  };

  // Persistent collapsible groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPANDED_GROUPS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      website: true,
      content: true,
      governance: true,
      media: true,
      communication: true,
      system: true,
      account: true
    };
  });

  // Save expanded groups to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPANDED_GROUPS_KEY, JSON.stringify(expandedGroups));
    } catch {}
  }, [expandedGroups]);

  // Ensure the group containing the active tab is expanded and remembered
  useEffect(() => {
    const parentGroup = findGroupByTab(activeTab);
    if (parentGroup && !expandedGroups[parentGroup]) {
      setExpandedGroups(prev => ({ ...prev, [parentGroup]: true }));
    }
    try {
      localStorage.setItem(STORAGE_ACTIVE_TAB_KEY, activeTab);
    } catch {}
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleItemClick = (id: AdminNavTabId) => {
    onSelectTab(id);
    try {
      localStorage.setItem(STORAGE_ACTIVE_TAB_KEY, id);
    } catch {}
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none text-xs">
      {/* Header: School Identity */}
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-800 dark:border-slate-700">
            ई
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {isNp ? 'ईश्वरी मा.वि. प्रशासन' : 'Ishwari Admin'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                @{currentUsername}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded font-mono font-medium uppercase border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {isSuperAdmin ? 'Super' : 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 custom-scrollbar">
        {/* 1. Dashboard top item */}
        <button
          type="button"
          onClick={() => handleItemClick('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
              strokeWidth={activeTab === 'dashboard' ? 2.2 : 1.8}
            />
            <span>{t('Dashboard', 'ड्यासबोर्ड')}</span>
          </div>
        </button>

        {/* 2. Collapsible Groups */}
        {navGroups.map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some(it => it.id === activeTab);

          return (
            <div key={group.id} className="pt-1">
              {/* Group Header Toggle */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold tracking-wider text-left transition cursor-pointer rounded-md ${
                    isGroupActive
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GroupIcon
                    className={`w-3.5 h-3.5 shrink-0 ${isGroupActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                    strokeWidth={1.8}
                  />
                  <span>{t(group.titleEn, group.titleNp)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                  aria-label={`Toggle ${group.titleEn}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
                  )}
                </button>
              </div>

              {/* Group Sub-Items */}
              {isExpanded && (
                <div className="mt-0.5 space-y-0.5 pl-2 ml-2.5 border-l border-slate-200 dark:border-slate-800">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    // Support active highlighting for SMC aliases
                    const activeStr = String(activeTab);
                    const isActive =
                      activeTab === item.id ||
                      (item.id === 'gov_smc' && (activeStr === 'gov_chairman' || activeStr === 'gov_leadership')) ||
                      (item.id === 'account_profile' && (activeStr === 'profile' || activeStr === 'account')) ||
                      (item.id === 'sys_settings' && (activeStr === 'sys_security' || activeStr === 'sys_backup' || activeStr === 'system'));

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon
                            className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                          <span className="truncate">{t(item.labelEn, item.labelNp)}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Account group includes Logout action */}
                  {group.id === 'account' && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
                      <span>{t('Logout', 'लगआउट')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Public Website Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium shadow-2xs transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
          <span>{t('Public Website', 'सार्वजनिक पोर्टल')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

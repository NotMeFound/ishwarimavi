import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { IconActionButton } from '../../components/IconActionButton';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

interface AdminActionMenuProps {
  actions: ActionMenuItem[];
  align?: 'right' | 'left';
}

export const AdminActionMenu: React.FC<AdminActionMenuProps> = ({
  actions,
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter(a => !a.hidden);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (visibleActions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <IconActionButton
        action="custom"
        appearance="ghost"
        size="sm"
        icon={MoreVertical}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        tooltip="Actions menu"
        aria-label="Actions menu"
        aria-expanded={isOpen}
      />

      {isOpen && (
        <div
          className={`absolute z-30 mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100 text-xs ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  action.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  action.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                role="menuitem"
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />}
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

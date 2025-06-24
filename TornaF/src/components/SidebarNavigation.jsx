// SidebarNavigation.jsx
import React, { useCallback, useMemo } from "react";
import {
  ChartBarIcon,
  FolderOpenIcon,
  TrophyIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { Button, Icon } from './SharedUI'; // Ensure this path is correct

const SidebarNavigation = React.memo(({ current, onNav, user, onLogout }) => {
  const navItems = useMemo(() => [
    { name: "Dashboard", key: "dashboard", icon: ChartBarIcon },
    { name: "My Projects", key: "projects", icon: FolderOpenIcon },
    { name: "Achievements", key: "achievements", icon: TrophyIcon },
    {
      name: "Notifications",
      key: "notifications",
      icon: BellIcon,
      count: user?.notifications?.filter(n => !n.read).length || 0,
    },
    { name: "Settings", key: "settings", icon: Cog6ToothIcon },
  ], [user]);

  const handleNavItemClick = useCallback((key) => {
    if (onNav) {
      onNav(key);
    }
  }, [onNav]);

  return (
    <aside className="bg-gradient-to-b from-zinc-950 to-black text-zinc-200 w-60 flex flex-col border-r border-zinc-900 shadow-xl shadow-black/50 sticky top-0 left-0 overflow-y-auto z-40 h-screen">
      
      {/* User Profile */}
      <div className="text-center p-3 bg-zinc-900 rounded-lg shadow-xl shadow-black/60 mx-3 mt-4">
        {user ? (
          <>
            <p className="font-bold text-2xl text-transparent bg-clip-text
                         bg-gradient-to-br from-gray-50 to-gray-500
                         drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]
                         leading-tight mb-1">
              {user.fullName}
            </p>
            <p className="text-xs font-light text-gray-400 tracking-tight">
              @{user.username}
            </p>
          </>
        ) : (
          <>
            <div className="h-6 bg-zinc-700 rounded w-3/4 mx-auto mb-1 animate-pulse" />
            <div className="h-3 bg-zinc-700 rounded w-1/2 mx-auto animate-pulse" />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.key}
            href="#"
            onClick={() => handleNavItemClick(item.key)}
            className={`
              group flex items-center p-3 rounded-md text-sm font-medium
              transition-colors duration-200 ease-in-out
              ${current === item.key
                ? 'bg-indigo-800/40 text-indigo-200 shadow-inner shadow-indigo-900/10 border border-indigo-800/60'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}
            `}
          >
            <Icon
              component={item.icon}
              className={`w-5 h-5 mr-3 ${current === item.key ? 'text-indigo-300' : 'text-zinc-600 group-hover:text-zinc-400'}`}
            />
            <span>{item.name}</span>
            {item.count > 0 && item.key === 'notifications' && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-zinc-900">
        {user && (
          <Button onClick={onLogout} primary={false} className="w-full group" icon={ArrowRightIcon}>
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
});

export default SidebarNavigation;

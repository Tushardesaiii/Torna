import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios"; // Import axios for API calls
import { useAuth } from "../components/AuthContext.jsx"; // Import useAuth hook

import {
  PlusIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  SparklesIcon,
  TrophyIcon,
  ShareIcon,
  CreditCardIcon,
  LightBulbIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  BookOpenIcon,
  FireIcon,
  AcademicCapIcon, // For achievements
  RocketLaunchIcon, // For "First Project Created"
  ScaleIcon, // For "10,000 Words Milestone" (representing balance/significance)
  ClipboardDocumentCheckIcon, // For "First Draft Complete"
  ForwardIcon, // For streak - represents moving forward
  SquaresPlusIcon, // New icon for 'New Project' button
} from "@heroicons/react/24/outline";

// --- Utility Functions (Untouched) ---
const formatDate = (dateStr, includeTime = false) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit", hour12: false }),
  });
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)}w ago`;

  return formatDate(dateStr);
};

const pluralize = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

const calculateProgress = (current, total) => (total > 0 ? (current / total) * 100 : 0);

const getDueDateStatus = (dueDateStr) => {
  if (!dueDateStr) return null;
  const now = new Date();
  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) return null;

  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", color: "text-red-400", icon: XCircleIcon };
  if (diffDays === 0) return { text: "Due Today", color: "text-amber-400", icon: ClockIcon };
  if (diffDays <= 7) return { text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, color: "text-orange-400", icon: CalendarIcon };
  return { text: `Due ${formatDate(dueDateStr)}`, color: "text-gray-500", icon: CalendarIcon };
};

// --- Core UI Components (Untouched, Copied for context) ---

const Card = React.memo(({ children, className = "", noPadding = false, ...props }) => (
  <div
    className={`
      bg-zinc-950/70 backdrop-blur-md
      rounded-lg border border-zinc-900
      shadow-lg shadow-black/30
      transition-all duration-200 ease-in-out
      hover:shadow-indigo-900/10 hover:border-indigo-700/50
      ${noPadding ? "" : "p-5"}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

const SectionHeader = React.memo(({ title, actionButton, description, className = "" }) => (
  <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-3 border-b border-zinc-900 ${className}`}>
    <div>
      <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight leading-snug">{title}</h2>
      {description && <p className="mt-1 text-zinc-500 text-sm">{description}</p>}
    </div>
    {actionButton && <div className="mt-4 sm:mt-0 flex-shrink-0">{actionButton}</div>}
  </div>
));

const ProgressBar = React.memo(({ progress, label, className = "", barColor = "bg-indigo-500" }) => (
  <div
    className={`w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden ${className}`}
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label={label || `Progress: ${progress.toFixed(0)}%`}
  >
    <div
      className={`${barColor} h-full rounded-full transition-all duration-700 ease-out`}
      style={{ width: `${progress}%`, boxShadow: `0 0 5px ${barColor.includes('indigo') ? 'rgba(99,102,241,0.5)' : barColor.includes('amber') ? 'rgba(251,191,36,0.5)' : 'rgba(0,0,0,0)'}` }}
    ></div>
  </div>
));

const Icon = React.memo(({ component: IconComponent, className = "w-4 h-4", ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent className={`text-zinc-400 ${className}`} {...props} />;
});

const Button = React.memo(({ children, onClick, className = "", primary = true, icon: IconComponent, disabled = false, type = "button", small = false, ...props }) => (
  <button
    onClick={onClick}
    className={`
      rounded-md font-medium shadow-sm
      transition-all duration-200 ease-in-out
      flex items-center justify-center whitespace-nowrap
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
      ${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'}
      ${primary
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500'
        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 focus:ring-zinc-500 border border-zinc-700'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
    disabled={disabled}
    type={type}
    {...props}
  >
    {IconComponent && <Icon component={IconComponent} className={`w-4 h-4 mr-1 ${small ? '-ml-0.5' : '-ml-1'} text-white/90 ${primary ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-100'}`} />}
    {children}
  </button>
));

const InputField = React.memo(({ id, label, type = "text", value, onChange, placeholder, disabled = false, rows = 1, multiline = false, className = "", required = false, error = null }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-zinc-400 text-sm font-medium mb-1.5">{label}</label>
    {multiline ? (
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 rounded-md border ${error ? 'border-red-500' : 'border-zinc-700'} bg-zinc-900 text-zinc-200 placeholder-zinc-500 text-sm font-light
          focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${error ? 'focus:border-red-500' : 'focus:border-indigo-500'}
          disabled:opacity-60 disabled:cursor-not-allowed resize-y ${className}`}
      />
    ) : (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 rounded-md border ${error ? 'border-red-500' : 'border-zinc-700'} bg-zinc-900 text-zinc-200 placeholder-zinc-500 text-sm font-light
          focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${error ? 'focus:border-red-500' : 'focus:border-indigo-500'}
          disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      />
    )}
    {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
  </div>
));

const ToggleSwitch = React.memo(({ id, label, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-1.5">
    <label htmlFor={id} className={`text-zinc-400 text-sm font-medium ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      {label}
    </label>
    <div className="relative inline-block w-9 mr-1 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name={id}
        id={id}
        className={`appearance-none cursor-pointer block w-5 h-5 rounded-full border-2 border-zinc-600 bg-white absolute
          ${checked ? 'right-0 bg-indigo-500 border-indigo-500' : 'bg-zinc-400'}
          transition-colors duration-200 ease-in-out
          ${disabled ? 'opacity-60' : ''}`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      />
      <label
        htmlFor={id}
        className={`block h-5 rounded-full ${checked ? 'bg-indigo-600' : 'bg-zinc-700'} cursor-pointer`}
      ></label>
    </div>
  </div>
));

const Tooltip = React.memo(({ children, text, className = "", position = "top" }) => {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => setShow(true), 500); // Delay tooltip appearance
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  const positionClasses = useMemo(() => ({
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }), []);

  const arrowClasses = useMemo(() => ({
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-zinc-700',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-zinc-700',
  }), []);

  return (
    <div className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div className={`absolute z-20 p-2 text-xs text-white bg-zinc-700 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]} ${className}`}>
          {text}
          <div className={`absolute ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
});

const Modal = React.memo(({ isOpen, onClose, title, children, className = "", disableBackgroundDismiss = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && !disableBackgroundDismiss) {
      onClose();
    }
  }, [onClose, disableBackgroundDismiss]);

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className={`
        bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl shadow-black/80
        w-full max-w-lg max-h-[90vh] overflow-y-auto
        transform transition-all scale-95 opacity-0 animate-scale-in-and-fade
        ${className}
      `}
      onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
          <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
          <Button onClick={onClose} primary={false} small className="!p-1.5 !rounded-full !bg-transparent !border-none hover:bg-zinc-800">
            <XCircleIcon className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
});

const Pill = React.memo(({ text, className = "", icon: IconComponent }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/20 text-indigo-300 border border-indigo-800/50 ${className}`}>
    {IconComponent && <Icon component={IconComponent} className="w-3 h-3 mr-1 text-indigo-400" />}
    {text}
  </span>
));

const UserAvatar = React.memo(({ src, alt, size = "md", ring = false, className = "" }) => {
  const sizeClasses = useMemo(() => ({
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }), []);
  const ringClasses = ring ? "border-2 border-indigo-600 ring-1 ring-indigo-500 ring-offset-1 ring-offset-black" : ""; // Ring offset is pure black

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${ringClasses} ${className}`}
    />
  );
});

const MetricCard = React.memo(({ title, value, icon: IconComponent, color = "text-indigo-400", description, className = "" }) => (
  <Card className={`flex flex-col items-start ${className}`}>
    <div className="flex items-center mb-3">
      {IconComponent && <Icon component={IconComponent} className={`w-6 h-6 mr-3 ${color}`} />}
      <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
    </div>
    <p className="text-3xl font-extrabold text-zinc-50">{value}</p>
    {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
  </Card>
));

const DropdownMenu = React.memo(({ children, trigger, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={toggleOpen} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 border border-zinc-700 ring-1 ring-black/50 focus:outline-none z-30 animate-fade-in-up">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

const DropdownMenuItem = React.memo(({ onClick, children, icon: IconComponent, className = "" }) => (
  <button
    onClick={onClick}
    className={`group flex items-center w-full px-4 py-2 text-sm text-zinc-200 hover:bg-indigo-700 hover:text-white transition-colors duration-150 ease-in-out ${className}`}
    role="menuitem"
  >
    {IconComponent && <Icon component={IconComponent} className="mr-3 w-5 h-5 text-zinc-400 group-hover:text-white" />}
    {children}
  </button>
));

const EmptyState = React.memo(({ icon: IconComponent, title, description, actionButton }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
    <Icon component={IconComponent} className="w-16 h-16 mb-4 text-zinc-700" />
    <h3 className="text-xl font-semibold text-zinc-200 mb-2">{title}</h3>
    <p className="max-w-md text-zinc-500 mb-6">{description}</p>
    {actionButton && <div className="mt-4">{actionButton}</div>}
  </div>
));


// --- Dashboard Specific Components ---

const SidebarNavigation = React.memo(({ current, onNav, user, onLogout }) => {
  const navItems = useMemo(() => [
    { name: "Dashboard", key: "dashboard", icon: ChartBarIcon },
    { name: "My Projects", key: "projects", icon: FolderOpenIcon },
    { name: "Achievements", key: "achievements", icon: TrophyIcon },
    { name: "Notifications", key: "notifications", icon: BellIcon, count: user?.notifications?.filter(n => !n.read).length || 0 },
    { name: "Settings", key: "settings", icon: Cog6ToothIcon },
  ], [user]); // Depend on user for notification count

  return (
    <aside className="bg-gradient-to-b from-zinc-950 to-black text-zinc-200 w-60 flex flex-col border-r border-zinc-900 shadow-xl shadow-black/50 sticky top-0 left-0 overflow-y-auto z-40 h-screen">
      {/* User Profile - assuming user prop has all details */}
      

<div className="text-center p-3 bg-zinc-900 rounded-lg shadow-xl shadow-black/60">
  {/* User Full Name - Optimized Liquid Metal */}
  <p className="font-bold text-2xl text-transparent bg-clip-text
                bg-gradient-to-br from-gray-50 to-gray-500                     /* Lighter start, darker end for deep reflection */
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]                        /* Clear, single shadow for lift */
                leading-tight mb-1">
    {user?.fullName || "Guest User"}
  </p>
  {/* Username - Subtle, Muted Metallic */}
  <p className="text-xs font-light text-gray-400 tracking-tight">
    @{user?.username || "guest"}
  </p>
</div>




      

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.key}
            href="#"
            onClick={useCallback(() => onNav(item.key), [onNav, item.key])}
            className={`
              flex items-center p-3 rounded-md text-sm font-medium
              transition-colors duration-200 ease-in-out
              ${current === item.key
                ? 'bg-indigo-800/40 text-indigo-200 shadow-inner shadow-indigo-900/10 border border-indigo-800/60'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}
            `}
          >
            <Icon component={item.icon} className={`w-5 h-5 mr-3 ${current === item.key ? 'text-indigo-300' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
            <span>{item.name}</span>
            {item.count > 0 && item.key === 'notifications' && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="p-5 border-t border-zinc-900">
        <Button onClick={onLogout} primary={false} className="w-full group" icon={ArrowRightIcon}>
          Sign Out
        </Button>
      </div>
    </aside>
  );
});

const DashboardContent = React.memo(({ user, onCreateProject, onCreateDocument }) => {
    // Ensure user and its nested properties exist before accessing them
    const latestDailyWordCount = user?.wordCountHistory?.[user.wordCountHistory.length - 1] || { words: 0, goalAchieved: false };
    const dailyWordGoal = user?.dailyWordGoal || 0;
    const goalProgress = calculateProgress(latestDailyWordCount.words, dailyWordGoal);

    const totalWordsWrittenFormatted = (user?.totalWordsWritten || 0).toLocaleString();
    const writingStreakFormatted = pluralize(user?.writingStreak || 0, "day");

    const recentProjects = useMemo(() =>
        [...(user?.projects || [])].sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited)).slice(0, 3),
        [user?.projects]
    );

    const currentDayGoalAchieved = latestDailyWordCount.goalAchieved;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Writer'}!`}
        description="Here's a snapshot of your writing journey."
      />

      {/* Hero Metrics & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Words"
          value={totalWordsWrittenFormatted}
          icon={BookOpenIcon}
          color="text-emerald-400"
          description="Across all your work"
        />
        <MetricCard
          title="Writing Streak"
          value={writingStreakFormatted}
          icon={FireIcon}
          color="text-amber-400"
          description="Consecutive days writing"
        />
        <MetricCard
          title="Daily Goal"
          value={`${latestDailyWordCount.words}/${dailyWordGoal} words`}
          icon={CalendarIcon}
          color={currentDayGoalAchieved ? "text-indigo-400" : "text-amber-400"}
          description={currentDayGoalAchieved ? "Goal achieved for today!" : "Keep writing!"}
        />
        <Card className="flex flex-col justify-center items-center p-4 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-200 mb-3">Quick Actions</h3>
          <div className="flex flex-col space-y-3 w-full">
            <Button onClick={onCreateDocument} icon={DocumentTextIcon} primary={false} className="w-full group">
              New Document
            </Button>
            <Button onClick={onCreateProject} icon={SquaresPlusIcon} primary={true} className="w-full group">
              New Project
            </Button>
          </div>
        </Card>
      </div>

      {/* Daily Goal Progress */}
      <Card className="mb-8 bg-zinc-900/50 border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-zinc-200">Today's Writing Goal</h3>
          <span className="text-indigo-300 font-bold">{goalProgress.toFixed(0)}%</span>
        </div>
        <ProgressBar progress={goalProgress} label="Daily Goal Progress" barColor={currentDayGoalAchieved ? "bg-indigo-600" : "bg-amber-500"} />
        <p className="text-sm text-zinc-500 mt-2">
          {currentDayGoalAchieved ? "You've crushed your goal today! Keep up the excellent work." : `Write ${dailyWordGoal - latestDailyWordCount.words} more words to hit your goal.`}
        </p>
      </Card>


      {/* Recent Projects */}
      <SectionHeader
        title="Recent Projects"
        description="Jump back into your latest creations."
        actionButton={<Button primary={false} small icon={FolderOpenIcon} className="group">View All Projects</Button>}
      />
      {(user?.projects?.length || 0) > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recentProjects.map((project) => (
            <Card key={project._id} className="relative group flex flex-col justify-between bg-zinc-900/50 border-zinc-800 shadow-lg">
              <div>
                <h4 className="text-lg font-semibold text-zinc-100 mb-2 truncate group-hover:text-indigo-400 transition-colors duration-200">
                  {project.title}
                </h4>
                <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center text-zinc-400 text-xs space-x-4 mb-3">
                  <span className="flex items-center">
                    <Icon component={DocumentTextIcon} className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                    {pluralize(project.totalDocuments, "document")}
                  </span>
                  <span className="flex items-center">
                    <Icon component={BookOpenIcon} className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                    {(project.wordCount || 0).toLocaleString()} words
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/70">
                <Pill text={project.status} className={`${project.status === 'In Progress' ? 'bg-indigo-900/20 text-indigo-300 border-indigo-800/50' : project.status === 'Planning' ? 'bg-gray-800/30 text-gray-400 border-gray-700/50' : 'bg-emerald-900/20 text-emerald-300 border-emerald-800/50'}`} />
                {project.dueDate && (
                  <span className={`flex items-center text-xs font-medium ${getDueDateStatus(project.dueDate)?.color}`}>
                    <Icon component={getDueDateStatus(project.dueDate)?.icon} className="w-3.5 h-3.5 mr-1" />
                    {getDueDateStatus(project.dueDate)?.text}
                  </span>
                )}
                <Button small primary={false} icon={ChevronRightIcon} className="!px-2 !py-1 group">
                  Open
                </Button>
              </div>
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="absolute top-4 right-4 flex -space-x-1 overflow-hidden">
                  {project.collaborators.slice(0, 2).map((collab) => (
                    <Tooltip key={collab.id} text={collab.name} position="bottom">
                      <UserAvatar src={collab.avatar} alt={collab.name} size="sm" className="ring-1 ring-black" />
                    </Tooltip>
                  ))}
                  {project.collaborators.length > 2 && (
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-black">
                      +{project.collaborators.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpenIcon}
          title="No Projects Yet"
          description="Start your writing journey by creating your first project."
          actionButton={<Button onClick={onCreateProject} icon={PlusIcon}>Create New Project</Button>}
        />
      )}

      {/* Achievements */}
      <SectionHeader
        title="Your Achievements"
        description="Celebrate your milestones and progress."
        actionButton={<Button primary={false} small icon={TrophyIcon} className="group">View All</Button>}
      />
      {(user?.achievements?.length || 0) > 0 ? (
        <Card className="mb-8 p-4 bg-zinc-900/50 border-zinc-800 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.achievements.slice(-6).reverse().map((ach) => (
              <div key={ach.id} className="flex items-center p-3 rounded-md bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors duration-200">
                {ach.icon && <Icon component={ach.icon} className="w-6 h-6 text-emerald-400 mr-3" />}
                <div>
                  <p className="font-semibold text-zinc-100 text-sm">{ach.name}</p>
                  <p className="text-zinc-500 text-xs">Unlocked {formatRelativeTime(ach.unlockedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={TrophyIcon}
          title="No Achievements Unlocked"
          description="Keep writing and unlock new milestones!"
        />
      )}

      {/* Notifications - continue from here if more UI exists */}
      <SectionHeader
        title="Notifications"
        description="Stay updated on your projects and system alerts."
        // Assuming a "View All" button is also desired for notifications
        actionButton={<Button primary={false} small icon={BellIcon} className="group">View All</Button>}
      />
      {(user?.notifications?.length || 0) > 0 ? (
        <Card className="mb-8 p-4 bg-zinc-900/50 border-zinc-800 shadow-lg">
          <div className="divide-y divide-zinc-800">
            {user.notifications.slice(0, 5).map((notification) => ( // Show last 5 notifications
              <div key={notification.id} className={`flex items-center p-3 ${!notification.read ? 'bg-indigo-900/10' : 'bg-zinc-900/50'} hover:bg-zinc-800/50 transition-colors duration-200`}>
                <div className="flex-shrink-0 mr-3">
                  {notification.type === 'system' && <Icon component={Cog6ToothIcon} className="w-5 h-5 text-zinc-500" />}
                  {notification.type === 'collaboration' && <Icon component={UserGroupIcon} className="w-5 h-5 text-sky-400" />}
                  {notification.type === 'achievement' && <Icon component={TrophyIcon} className="w-5 h-5 text-emerald-400" />}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${!notification.read ? 'text-zinc-100' : 'text-zinc-300'} text-sm`}>{notification.message}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{formatRelativeTime(notification.timestamp)}</p>
                </div>
                {!notification.read && (
                  <Button small primary={false} className="ml-auto !px-2 !py-1 text-zinc-400 hover:text-zinc-100">Mark as Read</Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={BellIcon}
          title="No New Notifications"
          description="You're all caught up! We'll let you know when new updates or collaborations happen."
        />
      )}
    </div>
  );
});


// --- Main Dashboard Page Component ---
export default function Dashboard() {
  const { currentUser, authLoading, refreshUser, logout } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard"); // For sidebar navigation
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState(null);

  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentContent, setNewDocumentContent] = useState(""); // Or initial content
  const [newDocumentProjectId, setNewDocumentProjectId] = useState(""); // For associating with a project
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  const handleLogout = useCallback(() => {
    logout();
    // Redirect to login page is typically handled in App.jsx or router config
  }, [logout]);

  const handleCreateProject = useCallback(async () => {
    setProjectError(null);
    if (!newProjectTitle.trim()) {
      setProjectError("Project title cannot be empty.");
      return;
    }

    setIsCreatingProject(true);
    try {
      // API call to create a new project
      await axios.post(
        "http://localhost:8000/api/v1/projects", // Your backend project creation endpoint
        {
          title: newProjectTitle,
          description: newProjectDescription,
          // Add any other default fields needed by your backend
        },
        { withCredentials: true }
      );
      console.log("Project created successfully!");
      setIsCreateProjectModalOpen(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
      await refreshUser(); // Refresh user data to get the newly created project
    } catch (error) {
      console.error("Error creating project:", error.response?.data || error.message);
      setProjectError(error.response?.data?.message || "Failed to create project.");
    } finally {
      setIsCreatingProject(false);
    }
  }, [newProjectTitle, newProjectDescription, refreshUser]);

  const handleCreateDocument = useCallback(async () => {
    setDocumentError(null);
    if (!newDocumentTitle.trim()) {
      setDocumentError("Document title cannot be empty.");
      return;
    }
    // You might want to enforce newDocumentProjectId if all documents must belong to a project
    if (!newDocumentProjectId) {
        setDocumentError("Please select a project for the document.");
        return;
    }

    setIsCreatingDocument(true);
    try {
      // API call to create a new document
      await axios.post(
        "http://localhost:8000/api/v1/documents", // Your backend document creation endpoint
        {
          title: newDocumentTitle,
          content: newDocumentContent, // Initial content, can be empty string
          projectId: newDocumentProjectId,
          // Add any other default fields needed by your backend
        },
        { withCredentials: true }
      );
      console.log("Document created successfully!");
      setIsCreateDocumentModalOpen(false);
      setNewDocumentTitle("");
      setNewDocumentContent("");
      setNewDocumentProjectId(""); // Reset selected project
      await refreshUser(); // Refresh user data to get the newly created document within the project
    } catch (error) {
      console.error("Error creating document:", error.response?.data || error.message);
      setDocumentError(error.response?.data?.message || "Failed to create document.");
    } finally {
      setIsCreatingDocument(false);
    }
  }, [newDocumentTitle, newDocumentContent, newDocumentProjectId, refreshUser]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-zinc-400">
        <BoltIcon className="w-10 h-10 animate-spin text-indigo-500 mr-3" /> Loading Dashboard...
      </div>
    );
  }

  // If currentUser is null after authLoading, redirect to login (handled by App.jsx usually)
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        You are not logged in. Redirecting...
      </div>
    );
  }

  // Filter projects for the document creation modal dropdown
  const availableProjectsForDocuments = useMemo(() => {
    return currentUser.projects || [];
  }, [currentUser.projects]);

  return (
    <div className="flex min-h-screen">
      <SidebarNavigation
        current={currentView}
        onNav={setCurrentView}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col">
        {currentView === "dashboard" && (
          <DashboardContent
            user={currentUser}
            onCreateProject={() => setIsCreateProjectModalOpen(true)}
            onCreateDocument={() => setIsCreateDocumentModalOpen(true)}
          />
        )}
        {/* Add other views here based on `currentView` state */}
        {currentView === "projects" && (
          <div className="flex-1 p-8 bg-black text-zinc-100">
            <SectionHeader title="All My Projects" description="Manage all your writing endeavors here." />
            {/* You'd render a dedicated ProjectsList component here, perhaps iterating through currentUser.projects */}
            <EmptyState icon={FolderOpenIcon} title="Coming Soon" description="A dedicated projects management page is in the works!" />
          </div>
        )}
        {currentView === "achievements" && (
          <div className="flex-1 p-8 bg-black text-zinc-100">
            <SectionHeader title="Your Full Achievements" description="A complete list of your accomplishments." />
             {/* You'd render a dedicated AchievementsList component here */}
            <EmptyState icon={TrophyIcon} title="Coming Soon" description="Your full achievement gallery will be here!" />
          </div>
        )}
        {currentView === "notifications" && (
          <div className="flex-1 p-8 bg-black text-zinc-100">
            <SectionHeader title="All Notifications" description="Review all your notifications." />
             {/* You'd render a dedicated NotificationsList component here */}
            <EmptyState icon={BellIcon} title="Coming Soon" description="Your notification center is under development!" />
          </div>
        )}
        {currentView === "settings" && (
          <div className="flex-1 p-8 bg-black text-zinc-100">
            <SectionHeader title="User Settings" description="Manage your profile and preferences." />
             {/* You'd render a dedicated SettingsForm component here */}
            <EmptyState icon={Cog6ToothIcon} title="Coming Soon" description="Customize your experience with detailed settings!" />
          </div>
        )}
      </main>

      {/* --- Create New Project Modal --- */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => {
          setIsCreateProjectModalOpen(false);
          setNewProjectTitle("");
          setNewProjectDescription("");
          setProjectError(null);
        }}
        title="Create New Project"
      >
        <InputField
          id="projectTitle"
          label="Project Title"
          placeholder="e.g., My Epic Fantasy Novel"
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          required
          error={projectError}
        />
        <InputField
          id="projectDescription"
          label="Description (Optional)"
          placeholder="A brief overview of your project..."
          value={newProjectDescription}
          onChange={(e) => setNewProjectDescription(e.target.value)}
          multiline
          rows={3}
        />
        <Button
          onClick={handleCreateProject}
          icon={SquaresPlusIcon}
          className="w-full mt-4"
          disabled={isCreatingProject}
        >
          {isCreatingProject ? "Creating Project..." : "Create Project"}
        </Button>
      </Modal>

      {/* --- Create New Document Modal --- */}
      <Modal
        isOpen={isCreateDocumentModalOpen}
        onClose={() => {
          setIsCreateDocumentModalOpen(false);
          setNewDocumentTitle("");
          setNewDocumentContent("");
          setNewDocumentProjectId("");
          setDocumentError(null);
        }}
        title="Create New Document"
      >
        <InputField
          id="documentTitle"
          label="Document Title"
          placeholder="e.g., Chapter 1: The Beginning"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          required
          error={documentError}
        />
        <div className="mb-4">
          <label htmlFor="documentProject" className="block text-zinc-400 text-sm font-medium mb-1.5">
            Select Project
          </label>
          <select
            id="documentProject"
            value={newDocumentProjectId}
            onChange={(e) => setNewDocumentProjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm font-light
              focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">-- Select a Project --</option>
            {availableProjectsForDocuments.map(project => (
                <option key={project._id} value={project._id}>
                    {project.title}
                </option>
            ))}
          </select>
            {documentError && newDocumentProjectId === "" && <p className="mt-1 text-red-400 text-xs">{documentError}</p>}
        </div>
        <InputField
          id="documentContent"
          label="Initial Content (Optional)"
          placeholder="Start writing here..."
          value={newDocumentContent}
          onChange={(e) => setNewDocumentContent(e.target.value)}
          multiline
          rows={5}
        />
        <Button
          onClick={handleCreateDocument}
          icon={DocumentTextIcon}
          className="w-full mt-4"
          disabled={isCreatingDocument}
        >
          {isCreatingDocument ? "Creating Document..." : "Create Document"}
        </Button>
      </Modal>
    </div>
  );
}
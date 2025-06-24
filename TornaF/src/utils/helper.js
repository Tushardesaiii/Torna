// Copy all your utility functions here
export const formatDate = (dateStr, includeTime = false) => {
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

export const formatRelativeTime = (dateStr) => {
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

export const pluralize = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export const calculateProgress = (current, total) => (total > 0 ? (current / total) * 100 : 0);

export const getDueDateStatus = (dueDateStr) => {
    if (!dueDateStr) return null;
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) return null;

    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", color: "text-red-400", icon: XCircleIcon }; // Need XCircleIcon here
    if (diffDays === 0) return { text: "Due Today", color: "text-amber-400", icon: ClockIcon }; // Need ClockIcon here
    if (diffDays <= 7) return { text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, color: "text-orange-400", icon: CalendarIcon }; // Need CalendarIcon here
    return { text: `Due ${formatDate(dueDateStr)}`, color: "text-gray-500", icon: CalendarIcon };
};

// IMPORTANT: Make sure to import the necessary icons used in getDueDateStatus
// e.g., import { XCircleIcon, ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";
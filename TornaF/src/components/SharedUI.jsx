// This file will contain all the shared components you provided (Card, SectionHeader, etc.)
// Just copy and paste all the untouched UI components from your original code here.
// Make sure to export each of them: `export const Card = React.memo(...)`

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline"; // Make sure to import necessary icons
import CreateDocumentModal from './CreateDocumentModal.jsx';



export const Card = React.memo(({ children, className = "", noPadding = false, ...props }) => (
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

export const SectionHeader = React.memo(({ title, actionButton, description, className = "" }) => (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-3 border-b border-zinc-900 ${className}`}>
        <div>
            <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight leading-snug">{title}</h2>
            {description && <p className="mt-1 text-zinc-500 text-sm">{description}</p>}
        </div>
        {actionButton && <div className="mt-4 sm:mt-0 flex-shrink-0">{actionButton}</div>}
    </div>
));

export const ProgressBar = React.memo(({ progress, label, className = "", barColor = "bg-indigo-500" }) => (
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

export const Icon = React.memo(({ component: IconComponent, className = "w-4 h-4", ...props }) => {
    if (!IconComponent) return null;
    return <IconComponent className={`text-zinc-400 ${className}`} {...props} />;
});

export const Button = React.memo(({ children, onClick, className = "", primary = true, icon: IconComponent, disabled = false, type = "button", small = false, ...props }) => (
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

export const InputField = React.memo(({ id, label, type = "text", value, onChange, placeholder, disabled = false, rows = 1, multiline = false, className = "", required = false, error = null }) => (
    <div className="mb-4">
        {label && <label htmlFor={id} className="block text-zinc-400 text-sm font-medium mb-1.5">{label}</label>}
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

export const ToggleSwitch = React.memo(({ id, label, checked, onChange, disabled = false }) => (
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

export const Tooltip = React.memo(({ children, text, className = "", position = "top" }) => {
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

export const Modal = React.memo(
  ({
    isOpen,
    onClose,
    title,
    children,
    className = "",
    disableBackgroundDismiss = false,
  }) => {
    if (!isOpen) return null;

    const modalContentRef = useRef(null);

    const handleContentClick = useCallback((e) => {
      e.stopPropagation();
    }, []);

    const handleOverlayClick = useCallback(
      (e) => {
        if (e.target === e.currentTarget && !disableBackgroundDismiss) {
          onClose();
        }
      },
      [onClose, disableBackgroundDismiss]
    );

    return (
      <div
        className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalContentRef}
          className={`
            bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl shadow-black/80
            w-full max-w-lg max-h-[90vh] overflow-y-auto
            transform transition-all animate-scale-in-and-fade
            ${className}
          `}
          onClick={handleContentClick}
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
            <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
            {/* If you have a custom Button component, use it here.
                Otherwise, use a plain button as below: */}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full bg-transparent border-none hover:bg-zinc-800"
              style={{ outline: "none", border: "none" }}
              aria-label="Close modal"
            >
              <XCircleIcon className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

export default CreateDocumentModal;

export const Pill = React.memo(({ text, className = "", icon: IconComponent }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/20 text-indigo-300 border border-indigo-800/50 ${className}`}>
        {IconComponent && <Icon component={IconComponent} className="w-3 h-3 mr-1 text-indigo-400" />}
        {text}
    </span>
));

export const UserAvatar = React.memo(({ src, alt, size = "md", ring = false, className = "" }) => {
    const sizeClasses = useMemo(() => ({
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    }), []);
    const ringClasses = ring ? "border-2 border-indigo-600 ring-1 ring-indigo-500 ring-offset-1 ring-offset-black" : "";

    return (
        <img
            src={src}
            alt={alt}
            className={`rounded-full object-cover ${sizeClasses[size]} ${ringClasses} ${className}`}
        />
    );
});

export const MetricCard = React.memo(({ title, value, icon: IconComponent, color = "text-indigo-400", description, className = "" }) => (
    <Card className={`flex flex-col items-start ${className}`}>
        <div className="flex items-center mb-3">
            {IconComponent && <Icon component={IconComponent} className={`w-6 h-6 mr-3 ${color}`} />}
            <h3 className="text-lg font-semibold text-zinc-200">{title}</h3>
        </div>
        <p className="text-3xl font-extrabold text-zinc-50">{value}</p>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
    </Card>
));

export const DropdownMenu = React.memo(({ children, trigger, className = "" }) => {
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

export const DropdownMenuItem = React.memo(({ onClick, children, icon: IconComponent, className = "" }) => (
    <button
        onClick={onClick}
        className={`group flex items-center w-full px-4 py-2 text-sm text-zinc-200 hover:bg-indigo-700 hover:text-white transition-colors duration-150 ease-in-out ${className}`}
        role="menuitem"
    >
        {IconComponent && <Icon component={IconComponent} className="mr-3 w-5 h-5 text-zinc-400 group-hover:text-white" />}
        {children}
    </button>
));

export const EmptyState = React.memo(({ icon: IconComponent, title, description, actionButton }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
        <Icon component={IconComponent} className="w-16 h-16 mb-4 text-zinc-700" />
        <h3 className="text-xl font-semibold text-zinc-200 mb-2">{title}</h3>
        <p className="max-w-md text-zinc-500 mb-6">{description}</p>
        {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
));
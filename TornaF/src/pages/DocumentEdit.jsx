import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext.jsx";

import {
  ArrowLeftIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  CubeTransparentIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// --- START: Common UI Components (Ideally, these should be in a shared components folder) ---
// For the purpose of providing a self-contained, runnable file, these are included here.
// In a real project, you would import these from a central location.

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

// --- END: Common UI Components ---


export default function DocumentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimeoutRef = useRef(null);

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  // --- Fetch Document Data ---
  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true, state: { from: window.location.pathname } });
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/documents/${id}`,
          { withCredentials: true }
        );
        const fetchedDocument = response.data.data;
        setDocument(fetchedDocument);
        setTitle(fetchedDocument.title || "");
        setContent(fetchedDocument.content || "");
      } catch (err) {
        console.error("Error fetching document:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, currentUser, navigate]);

  // --- Autosave / Save Functionality ---
  const saveDocument = useCallback(async () => {
    // Only save if content or title has changed and a document is loaded and not already saving
    if (!document || isSaving || (title === document.title && content === document.content)) {
        return;
    }

    setIsSaving(true);
    setSaveStatus("Saving...");
    try {
      const response = await axios.put(
        `http://localhost:8000/api/v1/documents/${id}`,
        {
          title: title,
          content: content,
        },
        { withCredentials: true }
      );
      // Update the document state with the new title/content to prevent re-saving immediately
      setDocument(prev => ({ ...prev, title: title, content: content }));

      setSaveStatus("Saved!");
      console.log("Document saved successfully!", response.data);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (err) {
      console.error("Error saving document:", err.response?.data || err.message);
      setSaveStatus("Save Failed!");
      setError(err.response?.data?.message || "Failed to save document.");
    } finally {
      setIsSaving(false);
    }
  }, [id, document, title, content, isSaving]);

  // Autosave with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (document) { // Only autosave if a document is loaded
        saveDocument();
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => {
      clearTimeout(handler);
    };
  }, [title, content, saveDocument, document]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-zinc-400 text-lg">
          {authLoading ? "Authenticating..." : "Loading document..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8">
        <p className="text-red-400 text-xl mb-4">Error: {error}</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8">
        <p className="text-zinc-400 text-xl mb-4">Document not found or access denied.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-100">
      {/* Top Bar / Header */}
      <div className="bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900 shadow-lg shadow-black/30 p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate("/dashboard")} primary={false} small icon={ArrowLeftIcon}>
            Back to Dashboard
          </Button>
          <Tooltip text={saveStatus || (isSaving ? "Saving..." : "Idle")} position="bottom">
            <span className={`text-sm font-medium transition-colors duration-200 ${
              saveStatus === "Saved!" ? "text-emerald-400" :
              saveStatus === "Save Failed!" ? "text-red-400" :
              isSaving ? "text-amber-400" : "text-zinc-500"
            }`}>
              <Icon component={ArrowPathIcon} className={`inline-block mr-1 w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {saveStatus || (isSaving ? "Saving..." : "Ready")}
            </span>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-zinc-500 text-sm">Words: <span className="font-semibold text-zinc-300">{wordCount}</span></span>
          <span className="text-zinc-500 text-sm">Characters: <span className="font-semibold text-zinc-300">{charCount}</span></span>
          <Button onClick={saveDocument} disabled={isSaving} icon={BookmarkIcon}>
            {isSaving ? "Saving..." : "Save Now"}
          </Button>
        </div>
      </div>

      {/* Main Content Area - Similar padding/width to dashboard sections */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Title */}
        <InputField
          id="documentTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Document"
          className="text-4xl font-extrabold bg-transparent border-none focus:ring-0 focus:border-none mb-6 p-0 text-zinc-100 placeholder-zinc-700"
          label={null} // Hide label for the main title
          error={null}
        />

        {/* Document Content - This will be your rich text editor later */}
        <textarea
          className="w-full min-h-[calc(100vh-200px)] h-auto p-4 text-lg bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-serif leading-relaxed"
          placeholder="Start writing your masterpiece here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
}
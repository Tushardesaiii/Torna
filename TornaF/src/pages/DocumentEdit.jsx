import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext.jsx"; // Assuming AuthContext is correctly implemented

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from '@tiptap/extension-underline'; // Added for more formatting options
import Link from '@tiptap/extension-link'; // Added for links
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

// Heroicons for a clean UI
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  CubeTransparentIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  MapIcon,
  PencilSquareIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  XMarkIcon,
  Bars3BottomLeftIcon, // For opening left sidebar
  Bars3BottomRightIcon, // For opening right sidebar
  PaintBrushIcon, // For text color
  LinkIcon, // For adding links
  ArrowUturnLeftIcon, // Undo
  ArrowUturnRightIcon, // Redo
} from "@heroicons/react/24/outline";

// --- START: Common UI Components ---
// These components are self-contained for easy review, but should ideally be in a shared folder.

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

// Tiptap Editor Component
const TiptapEditor = React.memo(({ initialContent, onUpdate, placeholderText }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true, // Enable undo/redo
      }),
      Placeholder.configure({
        placeholder: placeholderText,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      Color,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert lg:prose-lg xl:prose-xl focus:outline-none min-h-[calc(100vh-350px)] sm:min-h-[calc(100vh-250px)] mx-auto p-6 text-zinc-200 font-serif leading-relaxed selection:bg-indigo-700 selection:text-white overflow-y-auto',
      },
    },
  });

  // Sync external content changes to editor
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  // Handle adding links
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Tiptap Toolbar
  const Toolbar = () => {
    if (!editor) {
      return null;
    }

    const isActive = (type, opts) => editor.isActive(type, opts) ? 'bg-indigo-700 text-white' : 'hover:bg-zinc-700';

    return (
      <div className="flex flex-wrap items-center justify-center p-2 border-b border-zinc-800 bg-zinc-950 rounded-t-lg sticky top-0 z-10 -mt-px w-full">
        <Tooltip text="Bold">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('bold')}`}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            Bold
          </button>
        </Tooltip>
        <Tooltip text="Italic">
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('italic')}`}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
        </Tooltip>
        <Tooltip text="Underline">
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('underline')}`}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
          >
            Underline
          </button>
        </Tooltip>
        <Tooltip text="Bullet List">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('bulletList')}`}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
          >
            List
          </button>
        </Tooltip>
        <Tooltip text="Heading 2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('heading', { level: 2 })}`}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
        </Tooltip>
        <Tooltip text="Add Link">
          <button
            onClick={setLink}
            className={`ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 ${isActive('link')}`}
          >
            <Icon component={LinkIcon} className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip text="Set Text Color">
          <input
            type="color"
            onInput={event => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#F4F4F5'} // Default to zinc-200 (tailwind)
            className="ml-2 w-6 h-6 rounded-full overflow-hidden border border-zinc-700 cursor-pointer"
          />
        </Tooltip>
        <Tooltip text="Unset Color">
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 hover:bg-zinc-700"
          >
            <Icon component={PaintBrushIcon} className="w-4 h-4 text-zinc-400" />
          </button>
        </Tooltip>
        <Tooltip text="Undo">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 hover:bg-zinc-700"
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Icon component={ArrowUturnLeftIcon} className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip text="Redo">
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="ml-2 px-3 py-1 text-sm font-medium rounded-md text-zinc-300 hover:bg-zinc-700"
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Icon component={ArrowUturnRightIcon} className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="flex flex-col border border-zinc-800 rounded-lg overflow-hidden h-full">
      <Toolbar />
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
});

// Collapsible Sidebar Section
const CollapsibleSidebarSection = React.memo(({ title, icon: IconComponent, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        className="flex items-center justify-between w-full p-4 text-zinc-300 hover:bg-zinc-800/50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {IconComponent && <Icon component={IconComponent} className="w-5 h-5 mr-3 text-indigo-400" />}
          <span className="font-medium text-base">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      {isOpen && <div className="p-4 pt-0 text-zinc-400 text-sm">{children}</div>}
    </div>
  );
});

// --- END: Common UI Components ---


export default function DocumentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth(); // Assuming AuthContext provides currentUser and authLoading

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Tiptap content will be HTML
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimeoutRef = useRef(null);

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Calculate word count from plain text content safely
  const plainTextContent = useMemo(() => {
    if (typeof content !== 'string' || content.trim() === '') {
      return '';
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      // Ensure doc and doc.body exist before accessing textContent
      if (doc && doc.body) {
        return doc.body.textContent || '';
      }
    } catch (e) {
      console.error("Error parsing HTML for word count:", e);
    }
    return ''; // Return empty string on error or if body is null
  }, [content]);

  const wordCount = plainTextContent.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = plainTextContent.length;

  const motivationalQuotes = useMemo(() => [
    "Every word is a step forward.",
    "The first draft is just you telling yourself the story.",
    "Write. Rewrite. Repeat.",
    "Don't tell me the moon is shining; show me the glint of light on broken glass.",
    "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better.",
  ], []);
  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [motivationalQuotes]);

  // --- Fetch Document Data ---
  useEffect(() => {
    if (!currentUser && !authLoading) {
      navigate("/login", { replace: true, state: { from: window.location.pathname } });
      return;
    }
    if (!currentUser) return; // Wait for currentUser to be loaded if still authenticating

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
        // Initialize Tiptap with HTML content, default to <p></p> for a valid empty state
        setContent(fetchedDocument.content || "<p></p>");
      } catch (err) {
        console.error("Error fetching document:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, currentUser, navigate, authLoading]);

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
          content: content, // Tiptap content is HTML
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

  // Handle focus mode changes
  useEffect(() => {
  if (typeof window !== "undefined" && document?.body) {
    if (isFocusMode) {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
      document.body.classList.add('overflow-hidden');
    } else {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(false);
      document.body.classList.remove('overflow-hidden');
    }
  }
}, [isFocusMode]);


  // Loading/Error states
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
    <div className={`flex flex-col min-h-screen bg-black text-zinc-100 transition-all duration-300 ease-in-out`}>
      {/* Top Bar / Header */}
      {!isFocusMode && (
        <div className="bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-900 shadow-lg shadow-black/30 p-4 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate("/dashboard")} primary={false} small icon={ArrowLeftIcon}>
              Back to Dashboard
            </Button>
            <Tooltip text={saveStatus || (isSaving ? "Saving..." : "Idle")} position="bottom">
              <span className={`text-sm font-medium transition-colors duration-200 flex items-center ${
                saveStatus === "Saved!" ? "text-emerald-400" :
                saveStatus === "Save Failed!" ? "text-red-400" :
                isSaving ? "text-amber-400 animate-pulse" : "text-zinc-500"
              }`}>
                <Icon component={ArrowPathIcon} className={`inline-block mr-1 w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                {saveStatus || (isSaving ? "Saving..." : "Ready")}
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-zinc-400 text-sm font-semibold truncate max-w-[200px]">{document.title || "Untitled"}</span>
            <span className="text-zinc-600 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800">{document.type || "Novel"}</span>

            {/* Word Goal Progress Bar */}
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-zinc-700 rounded-full">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (wordCount / (document.wordGoal || 1)) * 100)}%` }}></div>
              </div>
              <span className="text-zinc-500 text-xs">{wordCount}/{document.wordGoal || 'N/A'} words</span>
            </div>

            {/* Session Timer (Placeholder) */}
            <span className="text-zinc-500 text-sm">Timer: <span className="font-semibold text-zinc-300">00:00</span></span>

            <Tooltip text={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}>
              <Button onClick={() => setIsFocusMode(!isFocusMode)} primary={false} small icon={LightBulbIcon}>
                {isFocusMode ? "Exit Focus" : "Focus Mode"}
              </Button>
            </Tooltip>
            <Tooltip text="Save Document Now">
              <Button onClick={saveDocument} disabled={isSaving} icon={BookmarkIcon}>
                Save
              </Button>
            </Tooltip>
            <Tooltip text="Export Options">
              <Button primary={false} small icon={ClipboardDocumentListIcon}>
                  Export
              </Button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className={`flex flex-1 overflow-hidden transition-all duration-300 ease-in-out ${isFocusMode ? 'min-h-screen' : 'min-h-[calc(100vh-70px)]'}`}>

        {/* Left Sidebar */}
        {!isFocusMode && (
          <aside className={`flex-shrink-0 w-72 bg-zinc-950/80 backdrop-blur-sm border-r border-zinc-900 shadow-xl shadow-black/40 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute left-0 top-0 h-full'} z-10`}>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-100">Project Navigator</h3>
              <Tooltip text="Close Sidebar">
                <Button onClick={() => setIsLeftSidebarOpen(false)} primary={false} small icon={XMarkIcon} className="lg:hidden">
                  <span className="sr-only">Close Sidebar</span>
                </Button>
              </Tooltip>
            </div>
            <div className="p-4">
              <Button primary={false} small className="w-full mb-3" icon={PlusIcon}>Add New Scene</Button>
              <ul className="space-y-2">
                {/* Example Scene Items - Replace with dynamic data */}
                <li className="flex items-center justify-between text-zinc-300 text-sm p-2 rounded-md hover:bg-zinc-800/50 cursor-pointer">
                  Chapter 1: The Beginning
                  <Icon component={PencilSquareIcon} className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                </li>
                <li className="flex items-center justify-between text-zinc-300 text-sm p-2 rounded-md bg-indigo-700/30 hover:bg-indigo-700/40 cursor-pointer">
                  Chapter 2: A New Path (Current)
                  <Icon component={PencilSquareIcon} className="w-3 h-3 text-zinc-300" />
                </li>
                <li className="flex items-center justify-between text-zinc-300 text-sm p-2 rounded-md hover:bg-zinc-800/50 cursor-pointer">
                  Chapter 3: Rising Conflict
                  <Icon component={PencilSquareIcon} className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                </li>
              </ul>
            </div>

            <CollapsibleSidebarSection title="Notes & To-Dos" icon={ClipboardDocumentListIcon}>
              <ul className="space-y-2">
                <li>- Research ancient runes.</li>
                <li>- Outline character arc for Elara.</li>
                <li>- Check continuity of magic system.</li>
              </ul>
            </CollapsibleSidebarSection>

            <CollapsibleSidebarSection title="World-Building" icon={CubeTransparentIcon}>
              <ul className="space-y-2">
                <li className="hover:text-indigo-400 cursor-pointer flex items-center"><Icon component={MapIcon} className="w-4 h-4 mr-2" /> Locations</li>
                <li className="hover:text-indigo-400 cursor-pointer flex items-center"><Icon component={UserGroupIcon} className="w-4 h-4 mr-2" /> Characters</li>
                <li className="hover:text-indigo-400 cursor-pointer flex items-center"><Icon component={BookOpenIcon} className="w-4 h-4 mr-2" /> Lore Wiki</li>
                {/* Add more world-building categories here */}
              </ul>
            </CollapsibleSidebarSection>

            <CollapsibleSidebarSection title="AI Companion" icon={SparklesIcon}>
              <div className="space-y-2">
                <Button primary={false} small className="w-full" icon={SparklesIcon}>Brainstorm Ideas</Button>
                <Button primary={false} small className="w-full" icon={SparklesIcon}>Suggest Rewrite</Button>
              </div>
            </CollapsibleSidebarSection>
          </aside>
        )}

        {/* Toggle button for left sidebar (visible when sidebar is closed) */}
        {!isFocusMode && !isLeftSidebarOpen && (
            <Tooltip text="Open Project Navigator" position="right">
                <Button
                    onClick={() => setIsLeftSidebarOpen(true)}
                    className="absolute top-20 left-0 z-30 p-2 rounded-r-md bg-zinc-800 hover:bg-zinc-700 border border-l-0 border-zinc-700 shadow-lg text-zinc-300"
                    small
                    primary={false}
                    icon={Bars3BottomLeftIcon} // More suitable icon for opening a menu
                >
                    <span className="sr-only">Open Project Navigator</span>
                </Button>
            </Tooltip>
        )}

        {/* Main Editor Area */}
        <main className={`flex-1 flex flex-col items-center overflow-y-auto px-4 py-8 relative ${isFocusMode ? 'max-w-full' : 'max-w-4xl'} mx-auto w-full transition-all duration-300 ease-in-out`}>
          <InputField
            id="documentTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Document"
            className={`text-4xl font-extrabold bg-transparent border-none focus:ring-0 focus:border-none mb-6 p-0 text-zinc-100 placeholder-zinc-700 text-center ${isFocusMode ? 'text-5xl my-8' : ''}`}
            label={null}
            error={null}
          />

          <div className={`relative w-full ${isFocusMode ? 'flex-1 flex flex-col' : ''}`}>
            <TiptapEditor
              initialContent={content}
              onUpdate={setContent}
              placeholderText="Start writing your masterpiece here..."
            />

            {/* Inline AI suggestions (placeholder - you'd likely make this dynamic based on selection/context) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-zinc-800 rounded-md shadow-lg text-zinc-400 text-xs flex items-center space-x-2 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <Icon component={SparklesIcon} className="w-3 h-3 text-indigo-400" />
              <span>AI Suggestion: "Try adding more sensory details here."</span>
              <Button small primary={true}>Apply</Button>
            </div>
          </div>

          {/* Motivational Quote at the bottom */}
          {!isFocusMode && (
            <p className="mt-8 text-zinc-600 text-sm italic max-w-xl text-center">
              "{currentQuote}"
            </p>
          )}

          {/* Autosave animation/status */}
          {isSaving && (
            <div className="absolute bottom-4 right-4 flex items-center text-amber-400 text-sm animate-pulse">
              <Icon component={ArrowPathIcon} className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === "Saved!" && (
            <div className="absolute bottom-4 right-4 flex items-center text-emerald-400 text-sm">
              <Icon component={BookmarkIcon} className="w-4 h-4 mr-1" />
              Saved!
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        {!isFocusMode && (
          <aside className={`flex-shrink-0 w-72 bg-zinc-950/80 backdrop-blur-sm border-l border-zinc-900 shadow-xl shadow-black/40 overflow-y-auto transform transition-transform duration-300 ease-in-out ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 h-full'} z-10`}>
             <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-100">Insights & Goals</h3>
              <Tooltip text="Close Sidebar">
                <Button onClick={() => setIsRightSidebarOpen(false)} primary={false} small icon={XMarkIcon} className="lg:hidden">
                  <span className="sr-only">Close Sidebar</span>
                </Button>
              </Tooltip>
            </div>

            <CollapsibleSidebarSection title="Analytics" icon={ChartBarIcon}>
              <div className="space-y-3">
                <p>Word Count: <span className="font-semibold text-zinc-200">{wordCount}</span></p>
                <p>Character Count: <span className="font-semibold text-zinc-200">{charCount}</span></p>
                <p>Writing Streak: <span className="font-semibold text-zinc-200">7 Days</span></p>
                <p>Words this week: <span className="font-semibold text-zinc-200">5,432</span></p>
                <div className="h-20 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-600 text-xs">Graph Placeholder</div>
              </div>
            </CollapsibleSidebarSection>

            <CollapsibleSidebarSection title="Writing Goals" icon={AdjustmentsHorizontalIcon}>
              <div className="space-y-3">
                <p>Daily Goal: 1000 words</p>
                <div className="w-full h-2 bg-zinc-700 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (wordCount / 1000) * 100)}%` }}></div>
                </div>
                <p>Weekly Goal: 7000 words</p>
                <div className="w-full h-2 bg-zinc-700 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `50%` }}></div>
                </div>
                <Button primary={true} small className="w-full mt-3">Celebrate Milestone!</Button>
              </div>
            </CollapsibleSidebarSection>
          </aside>
        )}

        {/* Toggle button for right sidebar (visible when sidebar is closed) */}
        {!isFocusMode && !isRightSidebarOpen && (
            <Tooltip text="Open Insights & Goals" position="left">
                <Button
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="absolute top-20 right-0 z-30 p-2 rounded-l-md bg-zinc-800 hover:bg-zinc-700 border border-r-0 border-zinc-700 shadow-lg text-zinc-300"
                    small
                    primary={false}
                    icon={Bars3BottomRightIcon} // More suitable icon for opening a menu
                >
                    <span className="sr-only">Open Insights & Goals</span>
                </Button>
            </Tooltip>
        )}

      </div>
    </div>
  );
}
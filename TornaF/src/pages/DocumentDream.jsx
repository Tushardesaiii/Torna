import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ 1. Replaced mock useAuth() with your actual authentication context
// Adjust path if needed based on your project structure
import { useAuth } from "../components/AuthContext.jsx";

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import CharacterCount from '@tiptap/extension-character-count';

// Heroicons
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UserGroupIcon,
  MapIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon, // For "Strict Mode" toggle (Strict Mode OFF)
  EyeSlashIcon, // For "Strict Mode" toggle (Strict Mode ON)
  PaintBrushIcon,
  LinkIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  AcademicCapIcon, // For insights/readability
  DocumentTextIcon, // For document titles in navigation
  TrashIcon, // For deleting items
  PencilIcon, // For editing items
  ChevronLeftIcon, // For page navigation
  ChevronRightIcon, // For page navigation
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

// --- START: Common UI Components (Sharp & Modern Black Theme) ---

const Card = React.memo(({ children, className = "", noPadding = false, ...props }) => (
  <div
    className={`
      bg-gray-900 rounded-xl border border-gray-700
      shadow-xl shadow-black/60
      transition-all duration-200 ease-in-out
      hover:shadow-black/70 hover:border-gray-600
      ${noPadding ? "" : "p-6"}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

const Icon = React.memo(({ component: IconComponent, className = "w-4 h-4", ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent className={`text-gray-400 ${className}`} {...props} />; // Muted icon color
});

const Button = React.memo(({ children, onClick, className = "", primary = true, icon: IconComponent, disabled = false, type = "button", small = false, ...props }) => (
  <button
    onClick={onClick}
    className={`
      rounded-lg font-medium shadow-sm
      transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-98
      flex items-center justify-center whitespace-nowrap
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
      ${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'}
      ${primary
        ? 'bg-blue-700 text-white hover:bg-blue-600 active:bg-blue-800 focus:ring-blue-500' // Electric blue primary
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-900 focus:ring-gray-600'} // Dark gray secondary
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
    disabled={disabled}
    type={type}
    {...props}
  >
    {IconComponent && <Icon component={IconComponent} className={`w-4 h-4 mr-1 ${small ? '-ml-0.5' : '-ml-1'} ${primary ? 'text-white/90' : 'text-gray-400 group-hover:text-gray-100'}`} />}
    {children}
  </button>
));

const InputField = React.memo(({ id, label, type = "text", value, onChange, placeholder, disabled = false, rows = 1, multiline = false, className = "", required = false, error = null }) => (
  <div className="mb-4">
    {label && <label htmlFor={id} className="block text-gray-400 text-sm font-medium mb-1.5">{label}</label>}
    {multiline ? (
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-600'} bg-gray-800 text-gray-100 placeholder-gray-500 text-sm font-light
          focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} ${error ? 'focus:border-red-500' : 'focus:border-blue-500'}
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
        className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-600'} bg-gray-800 text-gray-100 placeholder-gray-500 text-sm font-light
          focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} ${error ? 'focus:border-red-500' : 'focus:border-blue-500'}
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
    timeoutRef.current = setTimeout(() => setShow(true), 500);
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
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-700',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-700',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-700',
  }), []);

  return (
    <div className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <div className={`absolute z-20 p-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]} ${className}`}>
          {text}
          <div className={`absolute ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
});

const Modal = React.memo(({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className={`w-full max-w-lg animate-scale-in ${className}`}>
        <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-100">{title}</h3>
          <Button onClick={onClose} primary={false} small icon={XMarkIcon} className="text-gray-400 hover:text-gray-100 bg-transparent border-none shadow-none">
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div>
          {children}
        </div>
      </Card>
    </div>
  );
});

// Tiptap Editor Component (Re-themed for Sharp & Modern Black)
const TiptapEditor = React.memo(({ initialContent, onUpdate, placeholderText }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
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
      CharacterCount,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      if (typeof onUpdate === 'function') {
        onUpdate(htmlContent);
      }
    },
    editorProps: {
      attributes: {
        // Larger font, more luxurious prose, maximizes vertical writing space, sharp selection color
        class: 'prose prose-invert lg:prose-xl xl:prose-2xl 2xl:prose-2xl focus:outline-none min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] mx-auto p-8 text-gray-100 font-sans leading-relaxed selection:bg-blue-800 selection:text-white overflow-y-auto',
      },
    },
  }, [initialContent]);

  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent || '', false);
    }
  }, [editor, initialContent]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const Toolbar = () => {
    if (!editor) {
      return null;
    }
    // Active state: electric blue background, white text
    // Inactive state: dark gray background, light gray text
    const isActive = (type, opts) => editor.isActive(type, opts) ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700';

    return (
      <div className="flex flex-wrap items-center justify-center p-3 border-b border-gray-800 bg-gray-950 rounded-t-xl sticky top-0 z-10 w-full shadow-lg">
        <Tooltip text="Bold">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 ${isActive('bold')}`}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            Bold
          </button>
        </Tooltip>
        <Tooltip text="Italic">
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 ${isActive('italic')}`}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
        </Tooltip>
        <Tooltip text="Underline">
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 ${isActive('underline')}`}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
          >
            Underline
          </button>
        </Tooltip>
        <Tooltip text="Bullet List">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 ${isActive('bulletList')}`}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
          >
            List
          </button>
        </Tooltip>
        <Tooltip text="Heading 2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 ${isActive('heading', { level: 2 })}`}
            disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
        </Tooltip>
        <Tooltip text="Add Link">
          <button
            onClick={setLink}
            className={`px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 bg-gray-800 text-gray-300 hover:bg-gray-700 ${isActive('link')}`}
          >
            <Icon component={LinkIcon} className="w-4 h-4 text-gray-400" />
          </button>
        </Tooltip>
        <Tooltip text="Set Text Color">
          <input
            type="color"
            onInput={event => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#F3F4F6'} // Default to a light gray
            className="ml-2 w-6 h-6 rounded-full overflow-hidden border border-gray-600 cursor-pointer"
          />
        </Tooltip>
        <Tooltip text="Unset Color">
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            <Icon component={PaintBrushIcon} className="w-4 h-4 text-gray-400" />
          </button>
        </Tooltip>
        <Tooltip text="Undo">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 bg-gray-800 text-gray-300 hover:bg-gray-700"
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Icon component={ArrowUturnLeftIcon} className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip text="Redo">
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="px-3 py-1.5 text-sm font-medium rounded-md mx-0.5 bg-gray-800 text-gray-300 hover:bg-gray-700"
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Icon component={ArrowUturnRightIcon} className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="flex flex-col border border-gray-800 rounded-lg overflow-hidden h-full shadow-2xl">
      <Toolbar />
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
});

// Collapsible Sidebar Section (Re-themed for Sharp & Modern Black)
const CollapsibleSidebarSection = React.memo(({ title, icon: IconComponent, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-gray-800 last:border-b-0">
      <button
        className="flex items-center justify-between w-full p-3 text-gray-300 hover:bg-gray-800 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {IconComponent && <Icon component={IconComponent} className="w-4 h-4 mr-2 text-gray-500" />}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} text-gray-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      {isOpen && <div className="p-3 pt-0 text-gray-400 text-xs">{children}</div>}
    </div>
  );
});

// --- END: Common UI Components ---


export default function DocumentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading } = useAuth(); // Using the real useAuth from context

  const [documentData, setDocumentData] = useState(null);
  const [title, setTitle] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const saveTimeoutRef = useRef(null);

  const [isStrictMode, setIsStrictMode] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // --- Dynamic Content States (Client-Side Managed) ---
  const [notes, setNotes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loreWiki, setLoreWiki] = useState([]);

  // --- Modal States ---
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [editPageIndex, setEditPageIndex] = useState(null);

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [editNoteIndex, setEditNoteIndex] = useState(null);

  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [editLocationIndex, setEditLocationIndex] = useState(null);

  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [editCharacterIndex, setEditCharacterIndex] = useState(null);

  const [isAddLoreModalOpen, setIsAddLoreModalOpen] = useState(false);
  const [newLoreEntry, setNewLoreEntry] = useState("");
  const [editLoreIndex, setEditLoreIndex] = useState(null);

  // Current page content for the Tiptap editor
  const currentPageContent = useMemo(() => {
    return documentData?.pages?.[currentPageIndex]?.content || '';
  }, [documentData, currentPageIndex]);

  // Overall Word Count for the entire document
  const totalWordCount = useMemo(() => {
    if (!documentData?.pages) return 0;
    let count = 0;
    documentData.pages.forEach(page => {
      if (typeof page.content === 'string' && page.content.trim() !== '') {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(page.content, 'text/html');
          if (doc && doc.body) {
            count += doc.body.textContent.split(/\s+/).filter(word => word.length > 0).length;
          }
        } catch (e) {
          console.error("Error parsing HTML for word count:", e);
        }
      }
    });
    return count;
  }, [documentData]);

  // Word count for the current page
  const currentPageWordCount = useMemo(() => {
    const content = documentData?.pages?.[currentPageIndex]?.content || '';
    if (typeof content !== 'string' || content.trim() === '') {
      return 0;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      if (doc && doc.body) {
        return doc.body.textContent.split(/\s+/).filter(word => word.length > 0).length;
      }
    } catch (e) {
      console.error("Error parsing HTML for current page word count:", e);
    }
    return 0;
  }, [documentData, currentPageIndex]);

  // Character count for the current page
  const currentPageCharCount = useMemo(() => {
    const content = documentData?.pages?.[currentPageIndex]?.content || '';
    if (typeof content !== 'string') return 0;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      return (doc.body.textContent || '').length;
    } catch (e) {
      console.error("Error parsing HTML for current page char count:", e);
    }
    return 0;
  }, [documentData, currentPageIndex]);


  const motivationalQuotes = useMemo(() => [
    "Every word is a step forward.",
    "The first draft is just you telling yourself the story.",
    "Write. Rewrite. Repeat.",
    "Don't tell me the moon is shining; show me the glint of light on broken glass.",
    "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better.",
    "The secret of getting ahead is getting started.",
    "You can't use up creativity. The more you use, the more you have.",
    "A writer is someone who can make a riddle out of an answer.",
    "Words are like tools. If you use them poorly, you mess up your work.",
    "In writing, you must kill all your darlings.",
  ], []);
  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [motivationalQuotes]);

  // ✅ 3. Ensure no mock data is used anywhere - Initial GET request
  // --- Fetch Document Data (Actual API Call) ---
  useEffect(() => {
    const fetchInitialDocumentData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        // ✅ 2. Ensure Axios requests are fully secure - GET request with headers
        // Endpoint: GET http://localhost:8000/api/v1/documents/:documentId
        const response = await axios.get(
          `http://localhost:8000/api/v1/documents/${id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`, // ✅ Authorization header
              "Content-Type": "application/json", // Included for consistency, though often not strictly needed for GET
            },
            withCredentials: true, // ✅ withCredentials
          }
        );

        const fetchedData = response.data;
        console.log("Document fetched successfully:", fetchedData);

        // Handle case where backend returns document but pages array is empty/null
        // This is not mock data; it's initializing structure for a new document.
        if (!Array.isArray(fetchedData.pages) || fetchedData.pages.length === 0) {
          fetchedData.pages = [{ id: `page-${Date.now()}-0`, title: "Page 1", content: "" }];
        }

        setDocumentData(fetchedData);
        setTitle(fetchedData.title || ""); // Use fetched title
        setCurrentPageIndex(0); // Always start on the first page
        setNotes(fetchedData.notes || []);
        // Ensure worldBuilding and its properties are initialized
        setLocations(fetchedData.worldBuilding?.locations || []);
        setCharacters(fetchedData.worldBuilding?.characters || []);
        setLoreWiki(fetchedData.worldBuilding?.loreWiki || []);

      } catch (err) {
        console.error("Error fetching document:", err); // ✅ Log errors
        // ✅ 4. Handle API errors gracefully - Display clear message
        let errorMessage = "Failed to load document. ";
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage += "Unauthorized or Forbidden. Please ensure you are logged in and have access.";
          } else if (err.response.status === 404) {
            errorMessage += "Document not found. It might have been deleted or never existed.";
          } else {
            errorMessage += `Server Error (${err.response.status}): ${err.response.data?.message || err.message}`;
          }
        } else if (err.request) {
          errorMessage += "No response from server. Please check your network connection and backend server status.";
        } else {
          errorMessage += `Request setup error: ${err.message}`;
        }
        setError(errorMessage);
        // ✅ 3. Ensure no mock data is used anywhere - No silent fallback
        setDocumentData(null); // Explicitly set to null to trigger error UI
        setTitle("");
        setCurrentPageIndex(0);
        setNotes([]);
        setLocations([]);
        setCharacters([]);
        setLoreWiki([]);

      } finally {
        setLoading(false);
      }
    };

    // ✅ Fix 1 & 4: Ensure fetch only runs when auth is loaded and token is present
    if (authLoading) {
      // Auth is still loading, keep loading state true for the document
      setLoading(true);
      setError(null); // Clear any previous error while waiting for auth
      return;
    }

    // Auth is done loading (authLoading is false)
    if (!currentUser || !currentUser.token) {
      // Auth is done, but user is not logged in or token is missing.
      // Set an error state and prevent fetching.
      setLoading(false); // Stop document loading, as it failed due to auth
      setError("Authentication token is missing or user not logged in. Cannot load document.");
      return;
    }

    // Auth is loaded and token is available, proceed to fetch the document
    fetchInitialDocumentData();

  }, [id, currentUser, authLoading]); // Dependencies correctly include currentUser and authLoading


  // This useEffect ensures that if documentData becomes null (e.g., due to an error),
  // it doesn't try to auto-add a page, which would conflict with the error state.
  // It's also covered by the more robust check in fetchInitialDocumentData.
  useEffect(() => {
    if (documentData && (!Array.isArray(documentData.pages) || documentData.pages.length === 0)) {
      const newId = `page-${Date.now()}`;
      setDocumentData(prevDoc => ({
        ...prevDoc,
        pages: [...(prevDoc?.pages || []), { id: newId, title: "Page 1", content: "" }]
      }));
      setCurrentPageIndex(newId); // Ensure currentPageIndex is set to the new page's ID if needed
    }
  }, [documentData]);

  // --- Debounced Tiptap Content Update ---
  const debouncedSetPageContent = useRef(
    useCallback(
      (newContent) => {
        if (!documentData) return;

        setDocumentData(prevDoc => {
          const newPages = [...(prevDoc?.pages || [])];
          if (newPages[currentPageIndex]) {
            newPages[currentPageIndex] = {
              ...newPages[currentPageIndex],
              content: newContent,
            };
          } else {
            // Fallback if current page somehow doesn't exist (shouldn't happen with proper init)
            console.warn("Attempted to update non-existent page. Adding new page.");
            const newId = `page-${Date.now()}`;
            newPages.push({ id: newId, title: `Page ${newPages.length + 1}`, content: newContent });
            setCurrentPageIndex(newPages.length - 1);
          }
          return { ...prevDoc, pages: newPages };
        });
      },
      [documentData, currentPageIndex]
    )
  ).current;

  // Manual debounce implementation for editor content updates
  const editorUpdateTimer = useRef(null);
  const handleEditorUpdate = useCallback((newContent) => {
    if (editorUpdateTimer.current) {
      clearTimeout(editorUpdateTimer.current);
    }
    editorUpdateTimer.current = setTimeout(() => {
      debouncedSetPageContent(newContent);
    }, 300); // Debounce time (300ms)
  }, [debouncedSetPageContent]);

  // ✅ PUT /documents/:id (autosave) working - Adhering to Backend Logic
  const saveDocument = useCallback(async () => {
    if (!documentData || isSaving || !currentUser || !currentUser.token) {
      // Prevent saving if no document, already saving, or no user/token
      if (!currentUser || !currentUser.token) {
        console.error("Save prevented: Authentication token is missing or user not logged in.");
        setSaveStatus("Save Failed: Not Authenticated!");
      }
      return;
    }

    setIsSaving(true);
    setSaveStatus("Saving...");

    try {
      const dataToSave = {
        id: documentData.id, // Ensure ID is sent in the body as well, if backend expects it
        title: title,
        type: documentData.type,
        wordGoal: documentData.wordGoal,
        pages: documentData.pages,
        notes: notes,
        worldBuilding: { locations: locations, characters: characters, loreWiki: loreWiki },
        // owner and other backend-managed fields are not sent from frontend
      };

      console.log("Saving document with ID:", documentData.id);
      console.log("Current user _id:", currentUser?._id);
      console.log("Token present:", !!currentUser?.token);
      console.log("Data to save:", dataToSave); // ✅ All state flows (title, pages, worldBuilding) are syncing with backend

      // Endpoint: PUT http://localhost:8000/api/v1/documents/:documentId
      const response = await axios.put(
        `http://localhost:8000/api/v1/documents/${documentData.id}`,
        dataToSave,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // ✅ Authorization header
            "Content-Type": "application/json",            // ✅ Content-Type
          },
          withCredentials: true, // ✅ withCredentials
        }
      );

      console.log("Document updated successfully:", response.data);

      // Update local state with the response data (assuming backend returns updated doc)
      setDocumentData(response.data);
      setTitle(response.data.title || "");
      setNotes(response.data.notes || []);
      setLocations(response.data.worldBuilding?.locations || []);
      setCharacters(response.data.worldBuilding?.characters || []);
      setLoreWiki(response.data.worldBuilding?.loreWiki || []);

      setSaveStatus("Saved!");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error("Error saving document:", err); // ✅ Log errors
      // ✅ 4. Handle API errors gracefully - Display clear message
      let errorMessage = "Failed to save document. ";
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage += "Unauthorized or Forbidden. Please ensure you are logged in and have access.";
        } else if (err.response.status === 404) {
          errorMessage += "Document not found. It might have been deleted or never existed.";
        } else {
          errorMessage += `Server Error (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        errorMessage += "No response from server. Please check your network connection and backend server status.";
      } else {
        errorMessage += `Request setup error: ${err.message}`;
      }
      setSaveStatus("Save Failed!"); // Update save status visually
      setError(errorMessage); // Fixed: changed 'e' to 'errorMessage'
    } finally {
      setIsSaving(false);
    }
  }, [documentData, isSaving, title, notes, locations, characters, loreWiki, currentUser]);


  // Effect to trigger autosave when documentData (content, title, world-building) changes
  useEffect(() => {
    // Only autosave if documentData is actually loaded and not null, and not currently saving
    if (documentData && !isSaving && currentUser?.token) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument();
      }, 2000); // Autosave after 2 seconds of no changes
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [documentData, isSaving, saveDocument, currentUser]); // Added currentUser to dependencies for token check


  // --- Page Navigation Handlers ---
  const handlePageChange = useCallback((index) => {
    if (documentData?.pages && index >= 0 && index < documentData.pages.length) {
      setCurrentPageIndex(index);
    }
  }, [documentData]);

  const handleNextPage = useCallback(() => {
    if (documentData?.pages && currentPageIndex < documentData.pages.length - 1) {
      handlePageChange(currentPageIndex + 1);
    }
  }, [currentPageIndex, documentData, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      handlePageChange(currentPageIndex - 1);
    }
  }, [currentPageIndex, handlePageChange]);

  // --- Page CRUD Modals ---
  const handleAddPage = useCallback(() => {
    setIsAddPageModalOpen(true);
    setNewPageTitle(`Page ${documentData.pages.length + 1}`);
    setEditPageIndex(null);
  }, [documentData]);

  const handleEditPage = useCallback((index) => {
    setIsAddPageModalOpen(true);
    setNewPageTitle(documentData.pages[index].title);
    setEditPageIndex(index);
  }, [documentData]);

  const handleSavePage = useCallback(() => {
    if (!newPageTitle.trim()) {
      alert("Page title cannot be empty.");
      return;
    }

    setDocumentData(prevDoc => {
      const updatedPages = [...(prevDoc?.pages || [])];
      if (editPageIndex !== null) {
        // Edit existing page
        updatedPages[editPageIndex] = {
          ...updatedPages[editPageIndex],
          title: newPageTitle.trim(),
        };
      } else {
        // Add new page
        const newId = `page-${Date.now()}-${updatedPages.length}`;
        updatedPages.push({ id: newId, title: newPageTitle.trim(), content: "" });
        setCurrentPageIndex(updatedPages.length - 1); // Switch to new page
      }
      return { ...prevDoc, pages: updatedPages };
    });
    setIsAddPageModalOpen(false);
    setNewPageTitle("");
    setEditPageIndex(null);
  }, [newPageTitle, editPageIndex, documentData]);

  const handleDeletePage = useCallback((indexToDelete) => {
    if (documentData.pages.length <= 1) {
      alert("Cannot delete the last page of the document.");
      return;
    }

    setDocumentData(prevDoc => {
      const updatedPages = prevDoc.pages.filter((_, idx) => idx !== indexToDelete);
      // Adjust currentPageIndex if the current page is deleted
      if (currentPageIndex === indexToDelete) {
        setCurrentPageIndex(Math.max(0, indexToDelete - 1));
      } else if (currentPageIndex > indexToDelete) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
      return { ...prevDoc, pages: updatedPages };
    });
  }, [documentData, currentPageIndex]);


  // --- Notes Modals ---
  const handleAddNote = useCallback(() => {
    setIsAddNoteModalOpen(true);
    setNewNoteText("");
    setEditNoteIndex(null);
  }, []);

  const handleEditNote = useCallback((index) => {
    setIsAddNoteModalOpen(true);
    setNewNoteText(notes[index]);
    setEditNoteIndex(index);
  }, [notes]);

  const handleSaveNote = useCallback(() => {
    if (!newNoteText.trim()) {
      alert("Note cannot be empty.");
      return;
    }
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes];
      if (editNoteIndex !== null) {
        updatedNotes[editNoteIndex] = newNoteText.trim();
      } else {
        updatedNotes.push(newNoteText.trim());
      }
      return updatedNotes;
    });
    setIsAddNoteModalOpen(false);
    setNewNoteText("");
    setEditNoteIndex(null);
  }, [newNoteText, editNoteIndex]);

  const handleDeleteNote = useCallback((indexToDelete) => {
    setNotes(prevNotes => prevNotes.filter((_, idx) => idx !== indexToDelete));
  }, []);

  // --- Locations Modals ---
  const handleAddLocation = useCallback(() => {
    setIsAddLocationModalOpen(true);
    setNewLocationName("");
    setEditLocationIndex(null);
  }, []);

  const handleEditLocation = useCallback((index) => {
    setIsAddLocationModalOpen(true);
    setNewLocationName(locations[index]);
    setEditLocationIndex(index);
  }, [locations]);

  const handleSaveLocation = useCallback(() => {
    if (!newLocationName.trim()) {
      alert("Location name cannot be empty.");
      return;
    }
    setLocations(prevLocs => {
      const updatedLocs = [...prevLocs];
      if (editLocationIndex !== null) {
        updatedLocs[editLocationIndex] = newLocationName.trim();
      } else {
        updatedLocs.push(newLocationName.trim());
      }
      return updatedLocs;
    });
    setIsAddLocationModalOpen(false);
    setNewLocationName("");
    setEditLocationIndex(null);
  }, [newLocationName, editLocationIndex]);

  const handleDeleteLocation = useCallback((indexToDelete) => {
    setLocations(prevLocs => prevLocs.filter((_, idx) => idx !== indexToDelete));
  }, []);

  // --- Characters Modals ---
  const handleAddCharacter = useCallback(() => {
    setIsAddCharacterModalOpen(true);
    setNewCharacterName("");
    setEditCharacterIndex(null);
  }, []);

  const handleEditCharacter = useCallback((index) => {
    setIsAddCharacterModalOpen(true);
    setNewCharacterName(characters[index]);
    setEditCharacterIndex(index);
  }, [characters]);

  const handleSaveCharacter = useCallback(() => {
    if (!newCharacterName.trim()) {
      alert("Character name cannot be empty.");
      return;
    }
    setCharacters(prevChars => {
      const updatedChars = [...prevChars];
      if (editCharacterIndex !== null) {
        updatedChars[editCharacterIndex] = newCharacterName.trim();
      } else {
        updatedChars.push(newCharacterName.trim());
      }
      return updatedChars;
    });
    setIsAddCharacterModalOpen(false);
    setNewCharacterName("");
    setEditCharacterIndex(null);
  }, [newCharacterName, editCharacterIndex]);

  const handleDeleteCharacter = useCallback((indexToDelete) => {
    setCharacters(prevChars => prevChars.filter((_, idx) => idx !== indexToDelete));
  }, []);

  // --- Lore Wiki Modals ---
  const handleAddLore = useCallback(() => {
    setIsAddLoreModalOpen(true);
    setNewLoreEntry("");
    setEditLoreIndex(null);
  }, []);

  const handleEditLore = useCallback((index) => {
    setIsAddLoreModalOpen(true);
    setNewLoreEntry(loreWiki[index]);
    setEditLoreIndex(index);
  }, [loreWiki]);

  const handleSaveLore = useCallback(() => {
    if (!newLoreEntry.trim()) {
      alert("Lore entry cannot be empty.");
      return;
    }
    setLoreWiki(prevLore => {
      const updatedLore = [...prevLore];
      if (editLoreIndex !== null) {
        updatedLore[editLoreIndex] = newLoreEntry.trim();
      } else {
        updatedLore.push(newLoreEntry.trim());
      }
      return updatedLore;
    });
    setIsAddLoreModalOpen(false);
    setNewLoreEntry("");
    setEditLoreIndex(null);
  }, [newLoreEntry, editLoreIndex]);

  const handleDeleteLore = useCallback((indexToDelete) => {
    setLoreWiki(prevLore => prevLore.filter((_, idx) => idx !== indexToDelete));
  }, []);


  // --- UI Layout and Loading States ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-red-400">
        <div className="text-center p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')} primary={false} icon={ArrowLeftIcon}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-200">
        <div className="text-center p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Document Not Found</h2>
          <p className="mb-6">The document you are trying to access does not exist or you do not have permission.</p>
          <Button onClick={() => navigate('/dashboard')} primary={false} icon={ArrowLeftIcon}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200 font-sans">
      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out
          ${isLeftSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
          flex flex-col shadow-2xl shadow-black/50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-100 flex items-center">
            <Icon component={ClipboardDocumentListIcon} className="w-5 h-5 mr-2 text-blue-500" />
            Workspace
          </h2>
          <Button onClick={() => setIsLeftSidebarOpen(false)} primary={false} small icon={ChevronLeftIcon} className="text-gray-400 hover:text-gray-100 bg-transparent border-none shadow-none">
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          <CollapsibleSidebarSection title="Document Pages" icon={BookOpenIcon}>
            <ul className="text-gray-400 space-y-1 mt-2">
              {documentData.pages.map((page, index) => (
                <li key={page.id || index} className="flex items-center justify-between group">
                  <button
                    onClick={() => handlePageChange(index)}
                    className={`block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors duration-200
                      ${currentPageIndex === index ? 'bg-blue-700 text-white' : 'hover:bg-gray-800 text-gray-300'}
                      truncate`}
                  >
                    <Icon component={DocumentTextIcon} className="w-4 h-4 mr-1.5 inline-block" />
                    {page.title}
                  </button>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Tooltip text="Edit Page">
                      <Button onClick={() => handleEditPage(index)} primary={false} small icon={PencilIcon} className="p-1 !text-xs !py-0.5 !px-1.5 bg-gray-700 hover:bg-blue-600 text-gray-300" />
                    </Tooltip>
                    <Tooltip text="Delete Page">
                      <Button onClick={() => handleDeletePage(index)} primary={false} small icon={TrashIcon} className="p-1 !text-xs !py-0.5 !px-1.5 bg-gray-700 hover:bg-red-600 text-gray-300" />
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
            <Button onClick={handleAddPage} primary icon={PlusIcon} small className="w-full mt-3">Add New Page</Button>
          </CollapsibleSidebarSection>

          <CollapsibleSidebarSection title="Notes" icon={BookmarkIcon}>
            <ul className="text-gray-400 space-y-1 mt-2">
              {notes.length === 0 ? <p className="text-gray-500 italic">No notes added yet.</p> : notes.map((note, index) => (
                <li key={index} className="flex items-center justify-between group">
                  <span className="text-sm py-1.5 px-2 truncate w-full">{note}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Tooltip text="Edit Note">
                      <Button onClick={() => handleEditNote(index)} primary={false} small icon={PencilIcon} className="p-1 !text-xs !py-0.5 !px-1.5 bg-gray-700 hover:bg-blue-600 text-gray-300" />
                    </Tooltip>
                    <Tooltip text="Delete Note">
                      <Button onClick={() => handleDeleteNote(index)} primary={false} small icon={TrashIcon} className="p-1 !text-xs !py-0.5 !px-1.5 bg-gray-700 hover:bg-red-600 text-gray-300" />
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
            <Button onClick={handleAddNote} primary icon={PlusIcon} small className="w-full mt-3">Add New Note</Button>
          </CollapsibleSidebarSection>

          <CollapsibleSidebarSection title="World Building" icon={MapIcon}>
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-1">Locations</h4>
                <ul className="text-gray-400 space-y-1">
                  {locations.length === 0 ? <p className="text-gray-500 italic text-xs">No locations added.</p> : locations.map((loc, index) => (
                    <li key={index} className="flex items-center justify-between group">
                      <span className="text-xs py-1 px-1.5 truncate w-full">{loc}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Tooltip text="Edit Location">
                          <Button onClick={() => handleEditLocation(index)} primary={false} small icon={PencilIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-blue-600 text-gray-300" />
                        </Tooltip>
                        <Tooltip text="Delete Location">
                          <Button onClick={() => handleDeleteLocation(index)} primary={false} small icon={TrashIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-red-600 text-gray-300" />
                        </Tooltip>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleAddLocation} primary icon={PlusIcon} small className="w-full mt-2">Add Location</Button>
              </div>

              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-1">Characters</h4>
                <ul className="text-gray-400 space-y-1">
                  {characters.length === 0 ? <p className="text-gray-500 italic text-xs">No characters added.</p> : characters.map((char, index) => (
                    <li key={index} className="flex items-center justify-between group">
                      <span className="text-xs py-1 px-1.5 truncate w-full">{char}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Tooltip text="Edit Character">
                          <Button onClick={() => handleEditCharacter(index)} primary={false} small icon={PencilIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-blue-600 text-gray-300" />
                        </Tooltip>
                        <Tooltip text="Delete Character">
                          <Button onClick={() => handleDeleteCharacter(index)} primary={false} small icon={TrashIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-red-600 text-gray-300" />
                        </Tooltip>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleAddCharacter} primary icon={PlusIcon} small className="w-full mt-2">Add Character</Button>
              </div>

              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-1">Lore Wiki</h4>
                <ul className="text-gray-400 space-y-1">
                  {loreWiki.length === 0 ? <p className="text-gray-500 italic text-xs">No lore entries added.</p> : loreWiki.map((lore, index) => (
                    <li key={index} className="flex items-center justify-between group">
                      <span className="text-xs py-1 px-1.5 truncate w-full">{lore}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Tooltip text="Edit Lore">
                          <Button onClick={() => handleEditLore(index)} primary={false} small icon={PencilIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-blue-600 text-gray-300" />
                        </Tooltip>
                        <Tooltip text="Delete Lore">
                          <Button onClick={() => handleDeleteLore(index)} primary={false} small icon={TrashIcon} className="p-0.5 !text-xs !py-0 !px-0.5 bg-gray-700 hover:bg-red-600 text-gray-300" />
                        </Tooltip>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleAddLore} primary icon={PlusIcon} small className="w-full mt-2">Add Lore Entry</Button>
              </div>
            </div>
          </CollapsibleSidebarSection>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isLeftSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar / Document Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between shadow-lg flex-shrink-0">
          <div className="flex items-center">
            {!isLeftSidebarOpen && (
              <Button onClick={() => setIsLeftSidebarOpen(true)} primary={false} small icon={ClipboardDocumentListIcon} className="mr-3">
                <span className="sr-only">Open Sidebar</span>
              </Button>
            )}
            <Button onClick={() => navigate('/dashboard')} primary={false} icon={ArrowLeftIcon} className="mr-3">
              Back to Dashboard
            </Button>
            <InputField
              id="documentTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className="!mb-0 text-xl font-bold bg-transparent border-none focus:ring-0 focus:border-0 p-0 text-gray-100"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Total Words: {totalWordCount}</span>
            <span className="text-sm text-gray-400">{saveStatus}</span>
            <Tooltip text={isStrictMode ? "Strict Mode ON (Minimal UI)" : "Strict Mode OFF (Full UI)"}>
              <Button
                onClick={() => setIsStrictMode(!isStrictMode)}
                primary={false}
                small
                icon={isStrictMode ? EyeSlashIcon : EyeIcon}
                className="text-gray-400 hover:text-gray-100 bg-transparent border-none shadow-none"
              >
                Strict Mode
              </Button>
            </Tooltip>
            <Tooltip text="Open Right Sidebar">
              <Button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} primary={false} small icon={AdjustmentsHorizontalIcon} className="text-gray-400 hover:text-gray-100 bg-transparent border-none shadow-none" />
            </Tooltip>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 p-4 bg-gray-950 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto min-h-full">
            <TiptapEditor
              initialContent={currentPageContent}
              onUpdate={handleEditorUpdate}
              placeholderText="Start writing your masterpiece..."
            />
            {/* Page navigation controls */}
            <div className="flex justify-between items-center mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
              <Button onClick={handlePrevPage} disabled={currentPageIndex === 0} primary={false} icon={ChevronLeftIcon}>
                Previous Page
              </Button>
              <span className="text-sm text-gray-400">
                Page {currentPageIndex + 1} of {documentData.pages.length}
                <span className="ml-2">({currentPageWordCount} words, {currentPageCharCount} chars)</span>
              </span>
              <Button onClick={handleNextPage} disabled={currentPageIndex === documentData.pages.length - 1} primary={false} icon={ChevronRightIcon}>
                Next Page
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 bg-gray-900 border-l border-gray-800 transition-all duration-300 ease-in-out
          ${isRightSidebarOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full'}
          flex flex-col shadow-2xl shadow-black/50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-100 flex items-center">
            <Icon component={AcademicCapIcon} className="w-5 h-5 mr-2 text-purple-500" />
            Insights & Tools
          </h2>
          <Button onClick={() => setIsRightSidebarOpen(false)} primary={false} small icon={XMarkIcon} className="text-gray-400 hover:text-gray-100 bg-transparent border-none shadow-none">
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          <Card>
            <h3 className="text-md font-semibold text-gray-100 mb-2">Daily Motivation</h3>
            <p className="text-gray-400 text-sm italic">{currentQuote}</p>
          </Card>

          <Card>
            <h3 className="text-md font-semibold text-gray-100 mb-2">Document Stats</h3>
            <div className="text-gray-400 text-sm space-y-1">
              <p>Total Pages: {documentData.pages.length}</p>
              <p>Total Words: {totalWordCount}</p>
              <p>Current Page Words: {currentPageWordCount}</p>
              <p>Current Page Characters: {currentPageCharCount}</p>
              <p>Word Goal: {documentData.wordGoal || 'Not set'}</p>
              {documentData.wordGoal && (
                <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, (totalWordCount / documentData.wordGoal) * 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </Card>
          {/* Add more insight cards here later */}
        </div>
      </aside>

      {/* Modals (placed at the root of the component) */}
      <Modal
        isOpen={isAddPageModalOpen}
        onClose={() => setIsAddPageModalOpen(false)}
        title={editPageIndex !== null ? "Edit Page Title" : "Add New Page"}
      >
        <InputField
          id="pageTitle"
          label="Page Title"
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          placeholder="Enter page title"
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setIsAddPageModalOpen(false)} primary={false}>Cancel</Button>
          <Button onClick={handleSavePage}>Save Page</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title={editNoteIndex !== null ? "Edit Note" : "Add New Note"}
      >
        <InputField
          id="noteText"
          label="Note Content"
          multiline
          rows={4}
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Write your note here..."
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setIsAddNoteModalOpen(false)} primary={false}>Cancel</Button>
          <Button onClick={handleSaveNote}>Save Note</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        title={editLocationIndex !== null ? "Edit Location" : "Add New Location"}
      >
        <InputField
          id="locationName"
          label="Location Name"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder="Enter location name"
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setIsAddLocationModalOpen(false)} primary={false}>Cancel</Button>
          <Button onClick={handleSaveLocation}>Save Location</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddCharacterModalOpen}
        onClose={() => setIsAddCharacterModalOpen(false)}
        title={editCharacterIndex !== null ? "Edit Character" : "Add New Character"}
      >
        <InputField
          id="characterName"
          label="Character Name"
          value={newCharacterName}
          onChange={(e) => setNewCharacterName(e.target.value)}
          placeholder="Enter character name"
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setIsAddCharacterModalOpen(false)} primary={false}>Cancel</Button>
          <Button onClick={handleSaveCharacter}>Save Character</Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddLoreModalOpen}
        onClose={() => setIsAddLoreModalOpen(false)}
        title={editLoreIndex !== null ? "Edit Lore Entry" : "Add New Lore Entry"}
      >
        <InputField
          id="loreEntry"
          label="Lore Entry"
          multiline
          rows={4}
          value={newLoreEntry}
          onChange={(e) => setNewLoreEntry(e.target.value)}
          placeholder="Write your lore entry here..."
          required
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setIsAddLoreModalOpen(false)} primary={false}>Cancel</Button>
          <Button onClick={handleSaveLore}>Save Lore Entry</Button>
        </div>
      </Modal>

    </div>
  );
}

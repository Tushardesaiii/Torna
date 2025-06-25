// Fully Fixed DocumentEdit.jsx with debug and safe updates
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../components/AuthContext";

function DocumentEdit() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [locations, setLocations] = useState("");
  const [characters, setCharacters] = useState("");
  const [loreWiki, setLoreWiki] = useState("");
  const [title, setTitle] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log("🔍 Fetching document by ID:", id);
        const res = await axios.get(`http://localhost:8000/api/v1/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
          withCredentials: true,
        });
        const data = res.data.data;
        console.log("✅ Document fetched:", data);
        setDocumentData(data);
        setNotes(data.notes?.join("\n") || "");
        setLocations(data.worldBuilding?.locations?.join("\n") || "");
        setCharacters(data.worldBuilding?.characters?.join("\n") || "");
        setLoreWiki(data.worldBuilding?.loreWiki?.join("\n") || "");
        setTitle(data.title || "");
        updateMetrics(data.title + " " + data.notes?.join(" "));
      } catch (err) {
        setError("Failed to fetch document.");
        console.error("❌ Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, currentUser.token]);

  const updateMetrics = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    updateMetrics(value + " " + notes);
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    updateMetrics(title + " " + value);
  };

  const saveDocument = useCallback(async () => {
    if (!documentData) return;

    const updatePayload = {
      title,
      notes: notes.split("\n").filter(Boolean),
      pages: documentData.pages || [],
      worldBuilding: {
        locations: locations.split("\n").filter(Boolean),
        characters: characters.split("\n").filter(Boolean),
        loreWiki: loreWiki.split("\n").filter(Boolean),
      },
    };

    if (documentData.type) updatePayload.type = documentData.type;
    if (documentData.wordGoal) updatePayload.wordGoal = documentData.wordGoal;

    console.log("📤 Sending update payload:", updatePayload);

    try {
      setIsSaving(true);
      await axios.put(
        `http://localhost:8000/api/v1/documents/${documentData._id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Document saved successfully!");
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error(
        `Failed to save document. Server Error (${
          err?.response?.status || "Unknown"
        }): ${err?.response?.data?.message || err.message}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [documentData, title, notes, locations, characters, loreWiki, currentUser.token]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Toaster />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Editing: {title || "Untitled"}</h1>
        <button
          onClick={saveDocument}
          disabled={isSaving}
          className="bg-orange-500 text-white px-5 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Document"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          rows={8}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Start writing here..."
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Locations</label>
          <textarea
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Characters</label>
          <textarea
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lore Wiki</label>
          <textarea
            value={loreWiki}
            onChange={(e) => setLoreWiki(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end text-sm text-gray-600">
        Words: {wordCount} | Characters: {charCount}
      </div>
    </div>
  );
}

export default DocumentEdit;

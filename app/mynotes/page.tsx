"use client";

import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Note {
  _id: string;
  tenantId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [role, setRole] = useState("");
  const [notesCount, setNotesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [subscription, setSubscription] = useState("free");
  const [adminLoading, setAdminLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mynotes", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data.notes || (data.note ? [data.note] : []));
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetail = async () => {
    try {
      const res = await fetch("/api/auth/check", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setRole(data.user.role);

      // fetch admin data if role is admin
      if (data.user.role === "admin") fetchAdminData();
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const tenantRes = await fetch("/api/tenants", { credentials: "include" });
      const tenantData = await tenantRes.json();
      setSubscription(tenantData.tenant.subscription);

      const notesRes = await fetch("/api/notes", { credentials: "include" });
      const notesData = await notesRes.json();
      setNotesCount(notesData.total || 0);
      setUsersCount(notesData.totalUsers || 0);


      // setSubscription(tenantData.tenant?.subscription || "free");
    } catch (err: any) {
      console.log(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/tenants", {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubscription("pro");
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchNotes();
    getUserDetail();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(notes.filter((note) => note._id !== id));
      setMessage("Note deleted successfully!");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNoteId(note._id);
    setEditForm({ title: note.title, content: note.content });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.title || !editForm.content) {
      setMessage("Please fill in title and content");
      return;
    }
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update note");
      setNotes(
        notes.map((note) =>
          note._id === id ? { ...note, ...editForm, updatedAt: new Date().toISOString() } : note
        )
      );
      setEditingNoteId(null);
      setMessage("Note updated successfully!");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Notes</h1>

        {/* Admin Section */}
        {role === "admin" && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            {adminLoading ? (
              <p className="text-gray-500">Loading admin data...</p>
            ) : (
              <div className="space-y-3">
                <p>
                  <strong>Current Plan:</strong> {subscription.toUpperCase()}
                </p>
                <p>
                  <strong>Number of Notes:</strong> {notesCount}
                </p>
                <p>
                  <strong>Number of Users:</strong> {usersCount}
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={subscription === "pro"}
                  className={`px-4 py-2 rounded text-white ${
                    subscription === "pro"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Upgrade to PRO
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <p className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {loading && <p className="text-gray-500">Loading notes...</p>}
        {!loading && !notes.length && <p className="text-gray-500">No notes found.</p>}

        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note._id} className="bg-white p-4 rounded-lg shadow-md border relative">
              {editingNoteId === note._id ? (
                <>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={4}
                    className="w-full mb-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(note._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-semibold text-lg mb-2">{note.title}</h2>
                  <p className="text-gray-700">{note.content}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Created at: {note.createdAt ? new Date(note.createdAt).toLocaleString() : "N/A"}
                  </p>

                  <div className="absolute top-2 right-2 flex gap-2">
                    <PencilIcon
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                      onClick={() => startEdit(note)}
                    />
                    <TrashIcon
                      className="w-5 h-5 text-red-600 cursor-pointer"
                      onClick={() => handleDelete(note._id)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

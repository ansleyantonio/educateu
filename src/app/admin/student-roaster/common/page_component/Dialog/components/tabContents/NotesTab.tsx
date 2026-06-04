"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, StickyNote } from "lucide-react";
import NoteDialog from "./NoteDialog/NoteDialog";
import { Card } from "@/components/ui/card";

// --- API Interfaces ---
interface ApiNote {
  id: string;
  applicationId: string;
  noteId: string;
  type: string; // GENERAL, etc.
  visibility: "PUBLIC" | "PRIVATE";
  createdById: string;
  createdAt: string;
  updatedAt: string;
  note: {
    id: string;
    data: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface NotesTabProps {
  notes?: ApiNote[] | null;
  isLoading?: boolean;
  error?: string | null;
}

const NotesTab = ({
  notes = [],
  isLoading = false,
  error = null,
}: NotesTabProps) => {
  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  const processedNotes = (notes || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Error state
  if (error) {
    return (
      <div className="p-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">All Notes</h3>
          <NoteDialog />
        </div>
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Error Loading Notes
          </h3>
          <p className="text-sm text-gray-600">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">All Notes</h3>
          <NoteDialog />
        </div>
        <Card className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading notes...</p>
        </Card>
      </div>
    );
  }

  // No notes
  if (processedNotes.length === 0) {
    return (
      <div className="p-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">All Notes</h3>
          <NoteDialog />
        </div>
        <Card className="p-6 text-center">
          <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Notes Available
          </h3>
          <p className="text-sm text-gray-500">
            No notes have been created yet. Click the &quot;Add Note&quot; button
            above to create your first note.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">All Notes ({processedNotes.length})</h3>
        <NoteDialog />
      </div>

      <div className="space-y-6">
        {processedNotes.map((note) => (
          <div
            key={note.id}
            className="flex flex-col border-b border-gray-200 pb-6 last:border-b-0"
          >
            {/* Note Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {note.type}
                </Badge>
                {note.visibility === "PUBLIC" ? (
                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                    Public
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border border-red-300">
                    Private
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(note.createdAt)}
              </span>
            </div>

            {/* Note Content */}
            <div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.note.data}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesTab;

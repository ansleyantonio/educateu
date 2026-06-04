"use client";

import { Button } from "@/components/ui/button"; 
import Image from "next/image";
import avatar from "/public/assets/logo/dashboard_management/image.png";
import { FileText, Download } from "lucide-react";
import NoteDialog from "./NoteDialog/NoteDialog";

const NotesTab = () => {

  return (
    <div className="p-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">All Notes</h3>
        <NoteDialog /> 
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Image src={avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
            <p className="font-medium text-gray-600">John Doe</p>
          </div>
          <span className="text-xs text-gray-400">Thu Aug 15, 2024 09:27 AM</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          Easily create, edit, and delete courses with a modular structure...
        </p>

        <div className="w-full p-5 border rounded-xl bg-white shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="flex items-center">
              <FileText />
              <div className="flex flex-col ml-2">
                <p className="text-sm font-medium cursor-pointer hover:underline">
                  Business Administration
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded: 1/15/2024 | Size: 2.1 MB
                </p>
              </div>
            </div>
            <div className="ml-auto text-right flex gap-3">
              <Button variant="outline" size="lg">
                <Download className="h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesTab;
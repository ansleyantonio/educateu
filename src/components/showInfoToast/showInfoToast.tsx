import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ReactNode } from 'react';

export function showInfoToast(message: string): void {
  const toastContent: ReactNode = (
    <div className="flex items-center gap-3">
      <Info className="w-10 h-10 text-blue-600" />
      <span className="text-sm">{message}</span>
    </div>
  );

  toast(toastContent, {
    className: "bg-white text-gray-900 shadow-md rounded-md p-4",
  });
}
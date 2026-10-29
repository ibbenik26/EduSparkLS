import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trash2, ShieldAlert } from 'lucide-react';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  // Keep the latest removeToast in a ref so re-renders of the app (e.g. the quiz countdown
  // ticking every second) don't restart the 4s dismiss timer forever.
  const removeRef = useRef(removeToast);
  removeRef.current = removeToast;

  useEffect(() => {
    const timer = setTimeout(() => removeRef.current(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
    info: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  return (
    <div className={`pointer-events-auto border backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-start space-x-3 transition-all duration-300 transform translate-y-0 ${typeStyles[toast.type] || typeStyles.info}`}>
      {icons[toast.type] || icons.info}
      <div className="flex-1 text-xs leading-relaxed whitespace-pre-line font-medium pt-0.5">
        {toast.message}
      </div>
      <button onClick={() => removeToast(toast.id)} className="p-1 text-slate-400 hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm Delete', danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-100 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${danger ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="font-black text-slate-900 text-base">{title || 'Confirm Action'}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onCancel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'} text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1`}
          >
            {danger && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Toast = { id: number; title?: string; message: string; timeout?: number };
const ToastCtx = createContext<{ push: (t: Omit<Toast,'id'>) => void } | null>(null);

export function ToastHost({ children }: { children?: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  function push(t: Omit<Toast,'id'>) {
    const id = Date.now() + Math.random();
    const toast = { id, timeout: 2200, ...t };
    setItems((arr)=>[...arr, toast]);
    setTimeout(()=> setItems((arr)=>arr.filter(x=>x.id!==id)), toast.timeout!);
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-3 right-3 z-50 space-y-2">
        {items.map(t=>(
          <div 
            key={t.id} 
            className="card shadow-md border bg-white p-3 rounded-lg"
          >
            {t.title && <div className="font-semibold text-gray-900 mb-1">{t.title}</div>}
            <div className="text-gray-700">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(){
  const ctx = useContext(ToastCtx);
  if(!ctx) throw new Error('useToast must be used inside <ToastHost>');
  return ctx;
}

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

import { useEffect, useState } from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#111113] text-slate-200 antialiased relative overflow-hidden">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <div className="relative z-10">
        <Toaster />
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

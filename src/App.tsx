'use client';

import { useState } from 'react';
import { Layers, Cpu, Scan, Box, FileText, Monitor, Download, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0c0e] text-[#f4f4f5] font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#0c0c0e] shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#6366f1] rounded flex items-center justify-center shadow-lg shadow-[#6366f1]/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Visions3D <span className="text-[#71717a] font-normal text-sm ml-2">v2.5.0 Enterprise</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#18181b] px-3 py-1.5 rounded-md border border-[#27272a]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
              Visions3D Motoru Aktif
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Visions" alt="User" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Simplified Left Sidebar */}
        <aside className="w-72 bg-[#0c0c0e] border-r border-[#27272a] flex flex-col p-6 space-y-8 shrink-0">
          <div>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Workspace</h2>
            <div className="space-y-1">
              <SidebarItem icon={<FileText className="w-4 h-4" />} label="2D Blueprint" active />
              <SidebarItem icon={<Box className="w-4 h-4" />} label="3D Viewport" />
              <SidebarItem icon={<Scan className="w-4 h-4" />} label="AI Scan History" />
            </div>
          </div>

          <div className="pt-4">
             <button 
               onClick={() => setIsScanning(true)}
               className="w-full py-4 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl flex flex-col items-center gap-2 hover:bg-[#6366f1]/20 transition-all group"
             >
                <Cpu className="w-6 h-6 text-[#6366f1] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Trigger AI Scan</span>
             </button>
          </div>
        </aside>

        {/* Center: Test Stage */}
        <div className="flex-1 relative bg-[#09090b] flex items-center justify-center overflow-hidden">
          {/* Radial Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          {/* Minimal Test Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 p-12 bg-[#161618]/60 backdrop-blur-xl border border-[#27272a] rounded-[32px] shadow-2xl flex flex-col items-center text-center max-w-md"
          >
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 mb-8">
               <Monitor className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">System Initialization</h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">Visions3D Enterprise rendering engine is verified and active. Geometry buffers and PBR pipelines are ready for deployment.</p>
            
            <div className="flex gap-3 w-full">
               <button className="flex-1 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#6366f1]/20">
                  Open Project
               </button>
               <button className="px-4 py-3 bg-[#18181b] border border-[#27272a] text-zinc-400 rounded-xl hover:text-white transition-all">
                  <Maximize2 className="w-5 h-5" />
               </button>
            </div>
          </motion.div>

          {/* Floating HUD Labels */}
          <div className="absolute bottom-8 right-8 flex gap-4">
             <HUDCard label="Vertices" value="124.5k" />
             <HUDCard label="Memory" value="2.4 GB" />
             <HUDCard label="Latency" value="12ms" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between px-6 text-[10px] text-[#52525b] uppercase tracking-wider shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5"><Scan className="w-3 h-3 text-emerald-500" /> System Check: OK</span>
          <span className="text-[#27272a]">|</span>
          <span>Buffer Status: Primed</span>
        </div>
        <div>
          Visions3D Enterprise Edition © 2026
        </div>
      </footer>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${active ? 'bg-[#18181b] text-indigo-400 border border-[#27272a]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function HUDCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="px-4 py-2 bg-[#18181b]/80 border border-[#27272a] rounded-lg shadow-xl backdrop-blur-md">
       <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{label}</div>
       <div className="text-xs font-mono font-bold text-white">{value}</div>
    </div>
  );
}




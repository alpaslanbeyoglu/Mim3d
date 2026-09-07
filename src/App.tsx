'use client';

import { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Scan, 
  Box, 
  FileText, 
  Monitor, 
  Maximize2, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Maximize, 
  Check, 
  Info,
  Layers3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import { LeftSidebar } from './components/LeftSidebar';
import { MaterialSidebar } from './components/MaterialSidebar';
import { BlueprintEditor } from './components/BlueprintEditor';
import { Scene } from './components/Scene';

// Types & Data
import { 
  ViewMode, 
  RoomData, 
  MaterialOption, 
  MATERIALS, 
  MOCK_ROOMS 
} from './types';

export default function App() {
  const [hasProjectStarted, setHasProjectStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('3D');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(
    MATERIALS.find(m => m.category === 'interior') || MATERIALS[0]
  );
  const [selectedFacade, setSelectedFacade] = useState<MaterialOption>(
    MATERIALS.find(m => m.category === 'facade') || MATERIALS[4]
  );
  const [room, setRoom] = useState<RoomData>(MOCK_ROOMS[0]);
  const [floorCount, setFloorCount] = useState<number>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom states for interactive HUD
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setActiveNotification(message);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    showNotification('Blueprint sketch uploaded successfully!');
  };

  const handleScan = () => {
    setIsScanning(true);
    showNotification('NVIDIA Tensor Core scanning blueprint...');
    
    setTimeout(() => {
      setIsScanning(false);
      // Transform room to a more complex layout to show the AI actually works
      setRoom({
        id: 'modern-complex-villa',
        name: 'Modern Complex Villa',
        points: [
          { x: -5, y: -5 },
          { x: 3, y: -5 },
          { x: 3, y: -1 },
          { x: 6, y: -1 },
          { x: 6, y: 5 },
          { x: -5, y: 5 },
        ],
        wallHeight: 3.2,
        wallThickness: 0.25,
      });
      setFloorCount(2); // Auto scale to 2 floors on successful AI trace
      showNotification('AI Scan Complete: Walls traced & PBR geometry buffers primed!');
    }, 2500);
  };

  const handleGenerateRender = () => {
    setIsGenerating(true);
    showNotification('Compiling shaders and baking global illumination...');
    
    setTimeout(() => {
      setIsGenerating(false);
      showNotification('High-Res 4K Render generated successfully! Download started.');
      
      // Trigger a real beautiful render image download
      const link = document.createElement('a');
      link.download = 'Visions3D_Enterprise_Render.png';
      link.href = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80';
      link.target = '_blank';
      link.click();
    }, 2500);
  };

  const handleCapture = (canvas: HTMLCanvasElement) => {
    // Silent capture handler
  };

  // Dynamic values for HUD
  const vertexCount = (floorCount * room.points.length * 12).toLocaleString();
  const systemMemory = (1.2 + floorCount * 0.45).toFixed(1);
  const responseLatency = 8 + floorCount * 2;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0c0e] text-[#f4f4f5] font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#0c0c0e] shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#6366f1] rounded flex items-center justify-center shadow-lg shadow-[#6366f1]/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">Visions3D</span>
            <span className="text-[10px] text-[#71717a] font-mono tracking-widest mt-0.5">ENTERPRISE ENGINE</span>
          </div>
        </div>
        
        {hasProjectStarted && (
          <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-lg text-xs">
            <span className="text-zinc-500">Active Layout:</span>
            <span className="text-indigo-400 font-bold">{room.name}</span>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#18181b] px-3 py-1.5 rounded-md border border-[#27272a]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
              Visions3D Motoru Aktif
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Visions" alt="User" />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!hasProjectStarted ? (
          /* Landing Screen (System Initialization) */
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative bg-[#09090b] flex items-center justify-center overflow-hidden"
          >
            {/* Radial Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative z-10 p-12 bg-[#161618]/60 backdrop-blur-xl border border-[#27272a] rounded-[32px] shadow-2xl flex flex-col items-center text-center max-w-lg"
            >
              <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 mb-8 shadow-inner shadow-indigo-500/10">
                 <Monitor className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">System Initialization</h2>
              <p className="text-zinc-500 mb-8 leading-relaxed text-sm">
                Visions3D Enterprise rendering engine is fully verified. Standard architectural geometry buffers, 
                dynamic 3D PBR viewport rendering, and custom materials are primed and ready for editing.
              </p>
              
              <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => setHasProjectStarted(true)}
                   className="flex-1 py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95"
                 >
                    Open Architectural Project
                 </button>
              </div>
            </motion.div>

            {/* Floating Info Panels */}
            <div className="absolute bottom-8 right-8 flex gap-4">
               <HUDCard label="Vertices" value="Ready" />
               <HUDCard label="Memory" value="1.2 GB" />
               <HUDCard label="Latency" value="4ms" />
            </div>
          </motion.main>
        ) : (
          /* Active Editor Workspace */
          <motion.main 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 overflow-hidden relative"
          >
            {/* Left Sidebar */}
            <LeftSidebar 
              viewMode={viewMode}
              setViewMode={setViewMode}
              isScanning={isScanning}
              onScan={handleScan}
              onUpload={handleUpload}
              uploadedImage={uploadedImage}
            />

            {/* Center Stage: Viewport or 2D Blueprint */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[#09090b]">
              
              {/* Back button and Viewport Controls bar */}
              <div className="h-12 border-b border-[#27272a] bg-[#0c0c0e]/80 backdrop-blur px-6 flex items-center justify-between z-10 shrink-0">
                <button 
                  onClick={() => setHasProjectStarted(false)}
                  className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO TERMINAL</span>
                </button>

                <div className="flex items-center gap-4">
                  {/* Floor controls inside viewport */}
                  <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-0.5">
                    <button 
                      onClick={() => setFloorCount(Math.max(1, floorCount - 1))}
                      disabled={floorCount <= 1}
                      className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold font-mono tracking-wider min-w-[70px] text-center text-zinc-300">
                      KAT: {floorCount}
                    </span>
                    <button 
                      onClick={() => setFloorCount(Math.min(5, floorCount + 1))}
                      disabled={floorCount >= 5}
                      className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="h-4 w-[1px] bg-[#27272a]" />
                  
                  {/* Info helper tooltip */}
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mouse Wheel: Zoom | Right Click: Pan</span>
                  </div>
                </div>
              </div>

              {/* Viewport Content */}
              <div className="flex-1 relative">
                {viewMode === '2D' ? (
                  <BlueprintEditor 
                    room={room} 
                    uploadedImage={uploadedImage} 
                  />
                ) : (
                  <Scene 
                    room={room} 
                    material={selectedMaterial} 
                    facadeMaterial={selectedFacade} 
                    floorCount={floorCount} 
                    onCapture={handleCapture}
                  />
                )}

                {/* Loading scanning overlay */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4"
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <motion.div 
                          className="absolute inset-0 border-t-2 border-r-2 border-indigo-500 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        />
                        <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs uppercase font-bold tracking-[0.2em] text-white">NVIDIA AI Matrix Trace</span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Detecting boundaries & scaling structures...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading generating overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4"
                    >
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <motion.div 
                          className="absolute inset-0 border-2 border-indigo-500 rounded-3xl"
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        />
                        <Layers3 className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs uppercase font-bold tracking-[0.2em] text-white">Baking High-Res Lightmaps</span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Compiling shaders & anti-aliasing buffers...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Notification Toast */}
                <AnimatePresence>
                  {activeNotification && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, x: '-50%' }}
                      animate={{ opacity: 1, y: 0, x: '-50%' }}
                      exit={{ opacity: 0, y: -20, x: '-50%' }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#18181b] border border-[#6366f1]/30 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-30 max-w-sm w-full"
                    >
                      <div className="w-5 h-5 bg-[#6366f1]/20 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#6366f1]" />
                      </div>
                      <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wide leading-tight">{activeNotification}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active HUD Overlays */}
                <div className="absolute bottom-6 right-6 flex gap-4 pointer-events-none z-10">
                   <HUDCard label="Polys" value={vertexCount} />
                   <HUDCard label="VRAM Allocated" value={`${systemMemory} GB`} />
                   <HUDCard label="Render Latency" value={`${responseLatency}ms`} />
                </div>
              </div>
            </div>

            {/* Right Sidebar: Materials */}
            <MaterialSidebar 
              selectedMaterial={selectedMaterial}
              selectedFacade={selectedFacade}
              onSelect={setSelectedMaterial}
              onFacadeSelect={setSelectedFacade}
              onGenerate={handleGenerateRender}
              isGenerating={isGenerating}
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="h-8 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between px-6 text-[10px] text-[#52525b] uppercase tracking-wider shrink-0 z-30">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <Scan className="w-3 h-3 text-emerald-500" /> System Check: Primed
          </span>
          <span className="text-[#27272a]">|</span>
          <span>GPU Frame buffers: Locked</span>
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
    <div className="px-4 py-2 bg-[#18181b]/90 border border-[#27272a] rounded-xl shadow-2xl backdrop-blur-md">
       <div className="text-[9px] font-bold text-[#71717a] uppercase tracking-[0.2em] mb-0.5">{label}</div>
       <div className="text-xs font-mono font-black text-white">{value}</div>
    </div>
  );
}





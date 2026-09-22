import { motion } from 'motion/react';
import { Upload, Cpu, FileText, Box, Layers, ShieldCheck, Compass, Ruler, Sparkles } from 'lucide-react';
import { ViewMode } from '../types';

interface LeftSidebarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isScanning: boolean;
  onScan: () => void;
  onUpload: (file: File) => void;
  uploadedImage: string | null;
}

export const LeftSidebar = ({ 
  viewMode, 
  setViewMode, 
  isScanning, 
  onScan, 
  onUpload,
  uploadedImage 
}: LeftSidebarProps) => {
  return (
    <aside className="w-[320px] bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-full shrink-0 z-20 shadow-xl font-mono text-xs">
      {/* View Switcher */}
      <div className="p-4 border-b border-slate-800">
        <div className="bg-slate-950 p-1 rounded-lg flex gap-1 border border-slate-800">
          <button
            onClick={() => setViewMode('2D')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[11px] font-bold transition-all ${
              viewMode === '2D' 
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2D CAD MODU</span>
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[11px] font-bold transition-all ${
              viewMode === '3D' 
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D VIEWPORT</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* CAD Layer Visibility Controls */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Çizim Katmanları (CAD Layers)</span>
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
             <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Dış/İç Duvarlar</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">KİLİTLİ</span>
             </div>
             <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Kapı & Pencere Doğramaları</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">AKTİF</span>
             </div>
             <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Çıkma / Balkon Katmanı</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">AKTİF</span>
             </div>
             <div className="flex items-center justify-between py-1 text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Ölçü & Aks Çizgileri</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">GÖRÜNÜR</span>
             </div>
          </div>
        </div>

        {/* Upload Blueprint Sketch */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Kat Planı Taslak Altlığı</span>
          <div 
            className={`relative aspect-video rounded-xl border-2 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${uploadedImage ? 'border-indigo-500/50' : ''}`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploadedImage ? (
              <img src={uploadedImage} className="w-full h-full object-cover opacity-80" alt="Blueprint Sketch" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taslak / Kroki Yükle</span>
              </>
            )}
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </div>
        </div>

        {/* AI Blueprint Vectorizer */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Yapay Zeka Mimari Vektörleştirme</span>
          <button
            onClick={onScan}
            disabled={!uploadedImage || isScanning}
            className={`w-full py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 border transition-all ${
              isScanning 
              ? 'bg-slate-950 border-slate-700'
              : 'bg-indigo-950/60 border-indigo-500/40 hover:bg-indigo-900/80 text-indigo-300'
            } disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
          >
            <div className="relative">
              <Cpu className={`w-6 h-6 ${isScanning ? 'text-indigo-400 animate-pulse' : 'text-indigo-400'}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">GEMINI MİMARİ SCAN AI</span>
          </button>
        </div>

        {/* CAD Precision Settings */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-[10px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Hassasiyet Toleransı:</span>
            <span className="text-indigo-400 font-bold">±0.01m (1cm)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Standart Duvar Kalınlığı:</span>
            <span className="text-indigo-400 font-bold">25cm (Dış)</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
           <span className="font-bold uppercase tracking-wider text-slate-400">CAD MOTORU: SÜRÜM 2026 PRO</span>
        </div>
      </div>
    </aside>
  );
};

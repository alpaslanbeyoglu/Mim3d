import { motion } from 'motion/react';
import { Upload, Cpu, Eye, Box, FileText, Image as ImageIcon } from 'lucide-react';
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
    <aside className="w-[320px] bg-[#0c0c0e] border-r border-[#27272a] flex flex-col h-full shrink-0 z-20">
      {/* View Switcher */}
      <div className="p-4 border-b border-[#27272a]">
        <div className="bg-[#18181b] p-1 rounded-lg flex gap-1 border border-[#27272a]">
          <button
            onClick={() => setViewMode('2D')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === '2D' 
              ? 'bg-[#27272a] text-indigo-400 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2D BLUEPRINT</span>
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === '3D' 
              ? 'bg-[#27272a] text-indigo-400 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D VIEWPORT</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Upload Zone */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717a] mb-4">Sketch & Blueprint</h2>
          <div 
            className={`relative aspect-video rounded-xl border-2 border-dashed border-[#27272a] bg-[#18181b]/50 hover:bg-[#18181b] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${uploadedImage ? 'border-indigo-500/30' : ''}`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploadedImage ? (
              <img src={uploadedImage} className="w-full h-full object-cover opacity-60" alt="Sketch" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-600 group-hover:text-indigo-400 mb-2 transition-colors" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Upload Sketch</span>
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

        {/* AI Control */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717a] mb-4">Intelligence</h2>
          <button
            onClick={onScan}
            disabled={!uploadedImage || isScanning}
            className={`w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all ${
              isScanning 
              ? 'bg-[#27272a] border-zinc-700' 
              : 'bg-[#6366f1]/10 border-[#6366f1]/30 hover:bg-[#6366f1]/20 hover:border-[#6366f1]/50'
            } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
          >
            <div className="relative">
              <Cpu className={`w-8 h-8 ${isScanning ? 'text-indigo-400 animate-pulse' : 'text-indigo-500'}`} />
              {isScanning && (
                <motion.div 
                  className="absolute -inset-2 border-2 border-indigo-500/50 rounded-lg"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-[0.2em]">NVIDIA AI SCAN</span>
          </button>
          <p className="text-[10px] text-center text-[#71717a] mt-3 uppercase tracking-wider">Auto-detecting walls & boundaries</p>
        </div>

        {/* Active Stats */}
        <div className="p-4 bg-[#18181b]/50 border border-[#27272a] rounded-xl space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
            <span className="text-zinc-500">Scan Precision</span>
            <span className="text-indigo-400">98.4%</span>
          </div>
          <div className="h-1 bg-[#27272a] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: isScanning ? '60%' : '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#27272a]">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
           <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
           <span className="font-medium uppercase tracking-widest">NVIDIA Tensor Core Ready</span>
        </div>
      </div>
    </aside>
  );
};

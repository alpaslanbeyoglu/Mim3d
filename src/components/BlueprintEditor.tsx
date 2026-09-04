import { motion } from 'motion/react';
import { MousePointer2, Pencil, Ruler, Square } from 'lucide-react';
import { RoomData } from '../types';

interface BlueprintEditorProps {
  room: RoomData;
  uploadedImage: string | null;
}

export const BlueprintEditor = ({ room, uploadedImage }: BlueprintEditorProps) => {
  return (
    <div className="w-full h-full relative bg-[#09090b] flex items-center justify-center overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Blueprint Stage */}
      <div className="relative w-[80%] aspect-video bg-[#111114] border-2 border-[#27272a] rounded-2xl shadow-2xl flex items-center justify-center">
        {uploadedImage ? (
          <div className="relative w-full h-full p-8 opacity-40">
             <img src={uploadedImage} className="w-full h-full object-contain mix-blend-screen grayscale" alt="Blueprint" />
          </div>
        ) : (
          <div className="text-zinc-700 flex flex-col items-center">
            <Ruler className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xs uppercase tracking-[0.2em] font-bold">No active blueprint</p>
          </div>
        )}

        {/* Mock Vector Lines Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <g transform="translate(400, 300) scale(40)">
            <path 
              d="M-4 -4 L4 -4 L4 4 L-4 4 Z" 
              fill="rgba(99, 102, 241, 0.05)" 
              stroke="#6366f1" 
              strokeWidth="0.1" 
              strokeDasharray="0.2"
            />
            {room.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="0.15" fill="#6366f1" />
            ))}
          </g>
        </svg>

        {/* Toolbar */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
           <ToolbarButton icon={<MousePointer2 className="w-4 h-4" />} active />
           <ToolbarButton icon={<Pencil className="w-4 h-4" />} />
           <ToolbarButton icon={<Square className="w-4 h-4" />} />
           <div className="h-[1px] bg-[#27272a] mx-2 my-1" />
           <ToolbarButton icon={<Ruler className="w-4 h-4" />} />
        </div>

        {/* Scaling Indicator */}
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-[#18181b]/80 border border-[#27272a] rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
           Scale: 1:50 | Metric: CM
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <button className={`p-2.5 rounded-lg border transition-all ${active ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'bg-[#18181b] border-[#27272a] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
    {icon}
  </button>
);

import { motion } from 'motion/react';
import { Palette, Box, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { MATERIALS, MaterialOption } from '../types';

interface MaterialSidebarProps {
  selectedMaterial: MaterialOption;
  selectedFacade: MaterialOption;
  onSelect: (material: MaterialOption) => void;
  onFacadeSelect: (material: MaterialOption) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const MaterialSidebar = ({ 
  selectedMaterial, 
  selectedFacade, 
  onSelect, 
  onFacadeSelect, 
  onGenerate, 
  isGenerating 
}: MaterialSidebarProps) => {
  const interiorMaterials = MATERIALS.filter(m => m.category === 'interior');
  const facadeMaterials = MATERIALS.filter(m => m.category === 'facade');

  return (
    <aside className="w-[320px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 z-20 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Material Library</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Category: Flooring */}
        <div>
          <p className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">Flooring & Ground</p>
          <div className="grid grid-cols-2 gap-3">
            {interiorMaterials.map((material) => (
              <MaterialCard 
                key={material.id}
                material={material}
                isSelected={selectedMaterial.id === material.id}
                onClick={() => onSelect(material)}
              />
            ))}
          </div>
        </div>

        {/* Category: Facade Finishes */}
        <div>
          <p className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">Facade Finish</p>
          <div className="grid grid-cols-2 gap-3">
            {facadeMaterials.map((material) => (
              <MaterialCard 
                key={material.id}
                material={material}
                isSelected={selectedFacade.id === material.id}
                onClick={() => onFacadeSelect(material)}
              />
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full bg-slate-50 border border-slate-200 py-2.5 rounded text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-wider">
            Load Custom Texture...
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/80">
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-4 rounded-lg text-xs font-bold shadow-[0_10px_20px_rgba(99,102,241,0.15)] flex items-center justify-center space-x-2 group transition-all transform active:scale-95 uppercase tracking-[0.1em] ${
            isGenerating
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-[#6366f1] hover:bg-[#4f46e5] text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isGenerating ? 'Processing...' : 'Generate High-Res Render'}</span>
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-[0.2em]">Output: 3840 x 2160 PNG</p>
      </div>
    </aside>
  );
};

interface MaterialCardProps {
  material: MaterialOption;
  isSelected: boolean;
  onClick: () => void;
}

const MaterialCard = ({ material, isSelected, onClick }: MaterialCardProps) => (
  <div 
    onClick={onClick}
    className={`group cursor-pointer transition-all ${isSelected ? '' : 'opacity-80 hover:opacity-100'}`}
  >
    <div className={`aspect-square rounded-lg bg-slate-100 border-2 overflow-hidden mb-2 relative transition-all duration-300 ${
      isSelected 
      ? 'border-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
      : 'border-slate-200'
    }`}>
      <img 
        src={material.previewUrl} 
        alt={material.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {isSelected && (
        <div className="absolute bottom-1.5 right-1.5 bg-[#6366f1] rounded-full p-0.5 shadow-lg">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
    <p className="text-[11px] font-bold text-slate-800 tracking-tight">{material.name}</p>
    <p className="text-[10px] text-slate-400 font-medium">PBR 4K Texture</p>
  </div>
);


import { useRef, useState } from 'react';
import { 
  MousePointer2, 
  Ruler, 
  LayoutTemplate, 
  Trash2, 
  Grid, 
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { RoomData } from '../types';

interface BlueprintEditorProps {
  room: RoomData;
  setRoom: React.Dispatch<React.SetStateAction<RoomData>>;
  uploadedImage: string | null;
}

export const BlueprintEditor = ({ room, setRoom, uploadedImage }: BlueprintEditorProps) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Translate client coordinate to SVG viewBox [-10, 10] coordinate
  const getSVGCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    // SVG viewBox coordinates mapping
    const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
    const y = ((e.clientY - rect.top) / rect.height) * 20 - 10;
    
    if (snapToGrid) {
      // Snaps to nearest 0.5m for perfect CAD alignment
      return {
        x: Math.round(x * 2) / 2,
        y: Math.round(y * 2) / 2,
      };
    }
    // Snaps to nearest 10cm when grid snap is off for smooth custom shapes
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  };

  const handlePointerDownPoint = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    setDraggingIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIndex === null) return;
    const coords = getSVGCoords(e);
    if (!coords) return;

    // Prevent making collinear/overlapping identical points
    setRoom(prev => {
      const newPoints = [...prev.points];
      newPoints[draggingIndex] = coords;
      return {
        ...prev,
        points: newPoints
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIndex !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDraggingIndex(null);
    }
  };

  // Splitting wall by clicking on a wall segment
  const handleSplitWall = (e: React.PointerEvent<SVGLineElement>, wallIndex: number) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
    const y = ((e.clientY - rect.top) / rect.height) * 20 - 10;
    
    const snap = snapToGrid ? 0.5 : 0.1;
    const clickCoords = {
      x: Math.round(x / snap) * snap,
      y: Math.round(y / snap) * snap
    };

    setRoom(prev => {
      const newPoints = [...prev.points];
      // Insert new point right after the clicked wall index
      newPoints.splice(wallIndex + 1, 0, clickCoords);
      return {
        ...prev,
        points: newPoints
      };
    });

    // Start dragging immediately for intuitive CAD flow
    setDraggingIndex(wallIndex + 1);
  };

  // Delete vertex (requires maintaining at least 3 points)
  const handleDeletePoint = (index: number) => {
    if (room.points.length <= 3) return;
    setRoom(prev => {
      const newPoints = prev.points.filter((_, idx) => idx !== index);
      return {
        ...prev,
        points: newPoints
      };
    });
    setHoveredPointIndex(null);
  };

  // Preset Layout Applications
  const applyPreset = (type: 'square' | 'l-shape' | 'u-shape') => {
    let points = [];
    let name = '';
    
    if (type === 'square') {
      points = [
        { x: -4, y: -4 },
        { x: 4, y: -4 },
        { x: 4, y: 4 },
        { x: -4, y: 4 },
      ];
      name = 'Standard Square Room';
    } else if (type === 'l-shape') {
      points = [
        { x: -4, y: -4 },
        { x: 4, y: -4 },
        { x: 4, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 4 },
        { x: -4, y: 4 },
      ];
      name = 'Modern L-Shape Lounge';
    } else {
      points = [
        { x: -4, y: -4 },
        { x: 4, y: -4 },
        { x: 4, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: -1 },
        { x: -2, y: -1 },
        { x: -2, y: 4 },
        { x: -4, y: 4 },
      ];
      name = 'Executive U-Shape Office';
    }

    setRoom(prev => ({
      ...prev,
      name,
      points
    }));
  };

  return (
    <div className="w-full h-full relative bg-slate-100/60 flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Dynamic Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none transition-all duration-300" 
        style={{ 
          backgroundImage: snapToGrid 
            ? 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)' 
            : 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-full max-w-5xl aspect-video bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
        
        {/* Sketch Background Upload */}
        {uploadedImage && (
          <div className="absolute inset-0 p-12 opacity-[0.15] pointer-events-none select-none">
             <img src={uploadedImage} className="w-full h-full object-contain grayscale" alt="Blueprint Background" />
          </div>
        )}

        {/* Vector SVG Editor Stage */}
        <svg 
          ref={svgRef}
          viewBox="-10 -10 20 20" 
          className="w-full h-full absolute inset-0 touch-none cursor-crosshair z-10"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Centered Axis Indicators */}
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#e2e8f0" strokeWidth="0.02" strokeDasharray="0.1 0.1" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#e2e8f0" strokeWidth="0.02" strokeDasharray="0.1 0.1" />

          {/* Polygon Filled Room Area */}
          <polygon 
            points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(99, 102, 241, 0.05)"
            stroke="none"
          />

          {/* Draggable Wall Segments (Lines) */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            return (
              <g key={`wall-segment-${i}`}>
                {/* Thick Invisible Line for easy touch target & splitting */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke="transparent"
                  strokeWidth="0.8"
                  className="cursor-cell"
                  onPointerDown={(e) => handleSplitWall(e, i)}
                />
                {/* Visual architectural blueprint wall line */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke="#4f46e5" 
                  strokeWidth="0.12" 
                  strokeLinecap="round"
                  className="pointer-events-none opacity-90"
                />
              </g>
            );
          })}

          {/* Segment Midpoint Measurement Badges */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            const mx = (p.x + nextP.x) / 2;
            const my = (p.y + nextP.y) / 2;
            const length = Math.sqrt((nextP.x - p.x) ** 2 + (nextP.y - p.y) ** 2);
            
            return (
              <g key={`measurement-${i}`} className="pointer-events-none select-none">
                <rect 
                  x={mx - 0.7} 
                  y={my - 0.25} 
                  width="1.4" 
                  height="0.5" 
                  rx="0.10" 
                  fill="#ffffff" 
                  stroke="#6366f1" 
                  strokeWidth="0.03"
                  className="shadow-sm"
                />
                <text 
                  x={mx} 
                  y={my + 0.12} 
                  textAnchor="middle" 
                  fill="#1e1b4b" 
                  fontSize="0.32" 
                  fontWeight="bold"
                  className="font-mono tracking-tight"
                >
                  {length.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Draggable Point Handles (Corner Nodes) */}
          {room.points.map((p, i) => {
            const isHovered = hoveredPointIndex === i;
            const isDragging = draggingIndex === i;

            return (
              <g key={`corner-${i}`}>
                {/* Touch targets */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="0.6" 
                  fill="transparent"
                  className="cursor-move"
                  onPointerDown={(e) => handlePointerDownPoint(e, i)}
                  onPointerOver={() => setHoveredPointIndex(i)}
                  onPointerOut={() => setHoveredPointIndex(null)}
                />
                {/* Styled point dot */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isDragging ? "0.32" : isHovered ? "0.28" : "0.20"} 
                  fill={isDragging ? "#312e81" : isHovered ? "#4f46e5" : "#6366f1"} 
                  stroke="#ffffff" 
                  strokeWidth="0.05"
                  className="transition-all duration-150 pointer-events-none shadow-md"
                />
              </g>
            );
          })}
        </svg>

        {/* Toolbar Left Side */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white/95 border border-slate-200 p-2 rounded-xl backdrop-blur shadow-lg">
           <button 
             onClick={() => setSnapToGrid(!snapToGrid)}
             title="Grid Snapping"
             className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all text-xs font-bold ${snapToGrid ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'}`}
           >
              <Grid className="w-4 h-4" />
              <span>SNAP: {snapToGrid ? "0.5m" : "FREE"}</span>
           </button>
           
           <div className="h-[1px] bg-slate-100 mx-1 my-1" />
           
           <div className="flex flex-col gap-1">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Presets</span>
             <button 
               onClick={() => applyPreset('square')}
               className="p-2 text-left hover:bg-slate-50 rounded text-xs font-semibold text-slate-600 flex items-center gap-2 transition-all"
             >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <span>Square Plan</span>
             </button>
             <button 
               onClick={() => applyPreset('l-shape')}
               className="p-2 text-left hover:bg-slate-50 rounded text-xs font-semibold text-slate-600 flex items-center gap-2 transition-all"
             >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <span>L-Shape Plan</span>
             </button>
             <button 
               onClick={() => applyPreset('u-shape')}
               className="p-2 text-left hover:bg-slate-50 rounded text-xs font-semibold text-slate-600 flex items-center gap-2 transition-all"
             >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <span>U-Shape Plan</span>
             </button>
           </div>
        </div>

        {/* Informative Instructions Help Box */}
        <div className="absolute bottom-4 left-4 z-20 max-w-xs bg-white/95 border border-slate-200 p-3 rounded-xl backdrop-blur shadow-lg flex gap-2.5 items-start">
           <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
           <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">How to Edit:</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                • Drag any corner <b className="text-indigo-600 font-semibold">Node</b> to adjust wall shapes.
                <br />
                • Click on a wall line segment to <b className="text-indigo-600 font-semibold">Add a corner node</b>.
                <br />
                • Presets let you instantly load standard architectural layouts.
              </p>
           </div>
        </div>

        {/* Selected Vertex HUD Details */}
        {hoveredPointIndex !== null && room.points.length > 3 && (
          <div className="absolute top-4 right-4 z-20 bg-white/95 border border-red-200 p-3 rounded-xl backdrop-blur shadow-lg flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">CORNER INDEX {hoveredPointIndex + 1}</span>
              <span className="text-xs font-mono font-bold text-slate-800">X: {room.points[hoveredPointIndex].x.toFixed(1)}m | Y: {room.points[hoveredPointIndex].y.toFixed(1)}m</span>
            </div>
            <button 
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDeletePoint(hoveredPointIndex);
              }}
              title="Delete Corner Node"
              className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Scale indicator */}
        <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none select-none font-mono shadow-sm">
           Metric Grid: Metres (m) | 1 unit = 1m
        </div>
      </div>
    </div>
  );
};

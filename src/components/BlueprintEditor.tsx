import React, { useRef, useState } from 'react';
import { 
  MousePointer2, 
  Ruler, 
  LayoutTemplate, 
  Trash2, 
  Grid, 
  HelpCircle,
  Plus,
  DoorOpen,
  AppWindow,
  Scaling,
  Maximize2,
  Check,
  Edit2
} from 'lucide-react';
import { RoomData, Opening, OpeningType, BalconyProjection, RoomCategory } from '../types';
import { calculatePolygonArea } from '../utils/zoningEngine';

interface BlueprintEditorProps {
  room: RoomData;
  setRoom: React.Dispatch<React.SetStateAction<RoomData>>;
  uploadedImage: string | null;
}

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({
  room,
  setRoom,
  uploadedImage
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);

  // Custom length input state for selected wall length editing
  const [editingWallIndex, setEditingWallIndex] = useState<number | null>(null);
  const [customWallLength, setCustomWallLength] = useState<string>('');

  const svgRef = useRef<SVGSVGElement>(null);

  // Translate client coordinate to SVG viewBox [-10, 10] coordinate
  const getSVGCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    // SVG viewBox coordinates mapping
    const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
    const y = ((e.clientY - rect.top) / rect.height) * 20 - 10;
    
    if (snapToGrid) {
      // Snaps to nearest 0.5m for CAD alignment
      return {
        x: Math.round(x * 2) / 2,
        y: Math.round(y * 2) / 2,
      };
    }
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
    
    setSelectedWallIndex(wallIndex);

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
      newPoints.splice(wallIndex + 1, 0, clickCoords);
      return {
        ...prev,
        points: newPoints
      };
    });

    setDraggingIndex(wallIndex + 1);
  };

  // Add Opening (Door or Window) to Selected Wall
  const handleAddOpening = (type: OpeningType) => {
    if (selectedWallIndex === null) return;
    const wallIdx = selectedWallIndex;

    const p1 = room.points[wallIdx];
    const p2 = room.points[(wallIdx + 1) % room.points.length];
    const wallLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

    const defaultWidth = type === 'door' ? 0.9 : type === 'double_door' ? 1.5 : 1.4;
    const defaultHeight = type === 'door' || type === 'double_door' ? 2.1 : type === 'french_window' ? 2.2 : 1.4;
    const defaultSill = type === 'window' ? 0.9 : 0;

    const newOpening: Opening = {
      id: `op-${Date.now()}`,
      type,
      wallIndex: wallIdx,
      distanceFromStart: Math.max(0.2, wallLen / 2 - defaultWidth / 2),
      width: defaultWidth,
      height: defaultHeight,
      sillHeight: defaultSill
    };

    setRoom(prev => ({
      ...prev,
      openings: [...prev.openings, newOpening]
    }));
  };

  // Add Balcony Projection
  const handleAddBalcony = (isClosed: boolean) => {
    if (selectedWallIndex === null) return;
    const newProj: BalconyProjection = {
      id: `proj-${Date.now()}`,
      wallIndex: selectedWallIndex,
      depth: 1.2, // 1.2m default
      isClosed
    };

    setRoom(prev => ({
      ...prev,
      projections: [...prev.projections, newProj]
    }));
  };

  // Delete opening
  const handleDeleteOpening = (id: string) => {
    setRoom(prev => ({
      ...prev,
      openings: prev.openings.filter(o => o.id !== id)
    }));
  };

  // Delete vertex (requires maintaining at least 3 points)
  const handleDeletePoint = (index: number) => {
    if (room.points.length <= 3) return;
    setRoom(prev => {
      const newPoints = prev.points.filter((_, idx) => idx !== index);
      // Clean openings on invalid wall indices
      const updatedOpenings = prev.openings.filter(o => o.wallIndex < newPoints.length);
      return {
        ...prev,
        points: newPoints,
        openings: updatedOpenings
      };
    });
    setHoveredPointIndex(null);
  };

  // Custom wall length direct numerical edit
  const handleApplyWallLength = (wallIdx: number) => {
    const targetLength = parseFloat(customWallLength);
    if (isNaN(targetLength) || targetLength <= 0) return;

    setRoom(prev => {
      const p1 = prev.points[wallIdx];
      const p2 = prev.points[(wallIdx + 1) % prev.points.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const currentLen = Math.sqrt(dx * dx + dy * dy);
      if (currentLen === 0) return prev;

      const scale = targetLength / currentLen;
      const newP2 = {
        x: p1.x + dx * scale,
        y: p1.y + dy * scale
      };

      const newPoints = [...prev.points];
      newPoints[(wallIdx + 1) % prev.points.length] = newP2;

      return {
        ...prev,
        points: newPoints
      };
    });

    setEditingWallIndex(null);
  };

  // Preset Layout Applications
  const applyPreset = (type: 'square' | 'l-shape' | 'u-shape') => {
    let points = [];
    let name = '';
    
    if (type === 'square') {
      points = [
        { x: -5, y: -4 },
        { x: 5, y: -4 },
        { x: 5, y: 4 },
        { x: -5, y: 4 },
      ];
      name = 'Standart Tip Kat Planı';
    } else if (type === 'l-shape') {
      points = [
        { x: -5, y: -4 },
        { x: 5, y: -4 },
        { x: 5, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 4 },
        { x: -5, y: 4 },
      ];
      name = 'L-Tipi Mimari Kat Planı';
    } else {
      points = [
        { x: -5, y: -4 },
        { x: 5, y: -4 },
        { x: 5, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: -1 },
        { x: -2, y: -1 },
        { x: -2, y: 4 },
        { x: -5, y: 4 },
      ];
      name = 'Gelişmiş U-Tipi Mimari Plan';
    }

    setRoom(prev => ({
      ...prev,
      name,
      points,
      openings: [],
      projections: []
    }));
  };

  const totalArea = calculatePolygonArea(room.points);

  return (
    <div className="w-full h-full relative bg-slate-100/60 flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none transition-all duration-300" 
        style={{ 
          backgroundImage: snapToGrid 
            ? 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)' 
            : 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      />

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
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#cbd5e1" strokeWidth="0.02" strokeDasharray="0.1 0.1" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#cbd5e1" strokeWidth="0.02" strokeDasharray="0.1 0.1" />

          {/* Polygon Filled Room Area */}
          <polygon 
            points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(99, 102, 241, 0.06)"
            stroke="none"
          />

          {/* Wall Segments */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            const isSelected = selectedWallIndex === i;

            return (
              <g key={`wall-segment-${i}`}>
                {/* Thick Invisible Target for touch/click */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke="transparent"
                  strokeWidth="0.8"
                  className="cursor-pointer"
                  onPointerDown={(e) => {
                    setSelectedWallIndex(i);
                    handleSplitWall(e, i);
                  }}
                />
                {/* Visual Wall Line */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke={isSelected ? "#4338ca" : "#6366f1"}
                  strokeWidth={isSelected ? "0.22" : "0.14"}
                  strokeLinecap="round"
                  className="pointer-events-none transition-all"
                />
              </g>
            );
          })}

          {/* Render Balcony Projections in 2D */}
          {room.projections.map((proj) => {
            const p1 = room.points[proj.wallIndex];
            const p2 = room.points[(proj.wallIndex + 1) % room.points.length];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;

            // Normal vector pointing outwards
            const nx = -dy / len;
            const ny = dx / len;

            const bP1 = { x: p1.x + nx * proj.depth, y: p1.y + ny * proj.depth };
            const bP2 = { x: p2.x + nx * proj.depth, y: p2.y + ny * proj.depth };

            return (
              <g key={proj.id} className="pointer-events-none">
                <polygon
                  points={`${p1.x},${p1.y} ${bP1.x},${bP1.y} ${bP2.x},${bP2.y} ${p2.x},${p2.y}`}
                  fill={proj.isClosed ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"}
                  stroke={proj.isClosed ? "#f59e0b" : "#10b981"}
                  strokeWidth="0.08"
                  strokeDasharray={proj.isClosed ? "0.1 0.1" : "none"}
                />
                <text
                  x={(p1.x + bP1.x) / 2}
                  y={(p1.y + bP1.y) / 2}
                  fontSize="0.25"
                  fill="#78350f"
                  fontWeight="bold"
                >
                  {proj.isClosed ? 'Kapalı Çıkma' : 'Açık Balkon'} ({proj.depth}m)
                </text>
              </g>
            );
          })}

          {/* Render Openings (Doors & Windows) on Walls */}
          {room.openings.map((op) => {
            const p1 = room.points[op.wallIndex];
            const p2 = room.points[(op.wallIndex + 1) % room.points.length];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const wallLen = Math.sqrt(dx * dx + dy * dy);
            if (wallLen === 0) return null;

            const ux = dx / wallLen;
            const uy = dy / wallLen;

            const opStartX = p1.x + ux * op.distanceFromStart;
            const opStartY = p1.y + uy * op.distanceFromStart;
            const opEndX = opStartX + ux * op.width;
            const opEndY = opStartY + uy * op.width;

            const isDoor = op.type === 'door' || op.type === 'double_door';

            return (
              <g key={op.id} className="cursor-pointer" onClick={() => handleDeleteOpening(op.id)}>
                {/* Opening Cutout Line */}
                <line
                  x1={opStartX}
                  y1={opStartY}
                  x2={opEndX}
                  y2={opEndY}
                  stroke="#ffffff"
                  strokeWidth="0.28"
                />
                {/* Opening Frame Graphic */}
                <line
                  x1={opStartX}
                  y1={opStartY}
                  x2={opEndX}
                  y2={opEndY}
                  stroke={isDoor ? "#dc2626" : "#2563eb"}
                  strokeWidth="0.08"
                  strokeDasharray={isDoor ? "none" : "0.05 0.05"}
                />
                <circle cx={opStartX} cy={opStartY} r="0.12" fill={isDoor ? "#dc2626" : "#2563eb"} />
                <circle cx={opEndX} cy={opEndY} r="0.12" fill={isDoor ? "#dc2626" : "#2563eb"} />
              </g>
            );
          })}

          {/* Wall Length Badges & Dimension Lines */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            const mx = (p.x + nextP.x) / 2;
            const my = (p.y + nextP.y) / 2;
            const length = Math.sqrt((nextP.x - p.x) ** 2 + (nextP.y - p.y) ** 2);
            
            return (
              <g key={`measurement-${i}`} className="select-none">
                <rect 
                  x={mx - 0.75}
                  y={my - 0.28}
                  width="1.5"
                  height="0.56"
                  rx="0.12"
                  fill="#ffffff" 
                  stroke={selectedWallIndex === i ? "#4f46e5" : "#cbd5e1"}
                  strokeWidth="0.04"
                  className="shadow-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWallIndex(i);
                    setEditingWallIndex(i);
                    setCustomWallLength(length.toFixed(2));
                  }}
                />
                <text 
                  x={mx} 
                  y={my + 0.12} 
                  textAnchor="middle" 
                  fill="#0f172a"
                  fontSize="0.32" 
                  fontWeight="bold"
                  className="font-mono tracking-tight pointer-events-none"
                >
                  {length.toFixed(2)}m
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
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isDragging ? "0.34" : isHovered ? "0.28" : "0.22"}
                  fill={isDragging ? "#312e81" : isHovered ? "#4f46e5" : "#6366f1"} 
                  stroke="#ffffff" 
                  strokeWidth="0.06"
                  className="transition-all duration-150 pointer-events-none shadow-md"
                />
              </g>
            );
          })}
        </svg>

        {/* Top-Left Control Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-white/95 border border-slate-200 p-2.5 rounded-xl backdrop-blur shadow-lg">
           <button 
             onClick={() => setSnapToGrid(!snapToGrid)}
             title="Grid Snapping"
             className={`p-2.5 rounded-lg border flex items-center gap-2 transition-all text-xs font-bold ${snapToGrid ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
           >
              <Grid className="w-4 h-4" />
              <span>IZGARA HİZALAMA: {snapToGrid ? "0.5m" : "SERBEST"}</span>
           </button>
           
           <div className="h-[1px] bg-slate-100 my-1" />
           
           {/* Architectural Wall Elements Insertion */}
           <div className="flex flex-col gap-1.5">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Seçili Duvara Eleman Ekle</span>

             <div className="grid grid-cols-2 gap-1">
               <button
                 onClick={() => handleAddOpening('door')}
                 disabled={selectedWallIndex === null}
                 className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded text-[11px] font-bold text-slate-700 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 <DoorOpen className="w-3.5 h-3.5 text-red-500" />
                 <span>Kapı</span>
               </button>
               <button
                 onClick={() => handleAddOpening('window')}
                 disabled={selectedWallIndex === null}
                 className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded text-[11px] font-bold text-slate-700 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 <AppWindow className="w-3.5 h-3.5 text-blue-500" />
                 <span>Pencere</span>
               </button>
             </div>

             <div className="grid grid-cols-2 gap-1 mt-0.5">
               <button
                 onClick={() => handleAddBalcony(false)}
                 disabled={selectedWallIndex === null}
                 className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold text-emerald-800 flex items-center gap-1 disabled:opacity-40"
               >
                 <Plus className="w-3 h-3 text-emerald-600" />
                 <span>Açık Balkon</span>
               </button>
               <button
                 onClick={() => handleAddBalcony(true)}
                 disabled={selectedWallIndex === null}
                 className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-bold text-amber-800 flex items-center gap-1 disabled:opacity-40"
               >
                 <Plus className="w-3 h-3 text-amber-600" />
                 <span>Kapalı Çıkma</span>
               </button>
             </div>
           </div>

           <div className="h-[1px] bg-slate-100 my-1" />

           {/* Presets */}
           <div className="flex flex-col gap-1">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Tip Şablonlar</span>
             <button 
               onClick={() => applyPreset('square')}
               className="p-1.5 hover:bg-slate-50 rounded text-xs font-semibold text-slate-600 flex items-center gap-2"
             >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <span>Kare / Dikdörtgen Plan</span>
             </button>
             <button 
               onClick={() => applyPreset('l-shape')}
               className="p-1.5 hover:bg-slate-50 rounded text-xs font-semibold text-slate-600 flex items-center gap-2"
             >
                <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                <span>L-Tipi Mimari Plan</span>
             </button>
           </div>
        </div>

        {/* Modal for Wall Length Editing */}
        {editingWallIndex !== null && (
          <div className="absolute top-4 right-4 z-30 bg-white border border-indigo-200 p-3 rounded-xl shadow-xl flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Duvar Uzunluğu (m):</span>
            <input
              type="number"
              step="0.1"
              value={customWallLength}
              onChange={(e) => setCustomWallLength(e.target.value)}
              className="w-20 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
            />
            <button
              onClick={() => handleApplyWallLength(editingWallIndex)}
              className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 text-xs font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uygula</span>
            </button>
          </div>
        )}

        {/* Selected Point Delete HUD */}
        {hoveredPointIndex !== null && room.points.length > 3 && (
          <div className="absolute bottom-4 left-4 z-20 bg-white border border-red-200 p-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">KÖŞE NODE #{hoveredPointIndex + 1}</span>
              <span className="text-xs font-mono font-bold text-slate-800">X: {room.points[hoveredPointIndex].x.toFixed(2)}m | Y: {room.points[hoveredPointIndex].y.toFixed(2)}m</span>
            </div>
            <button 
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDeletePoint(hoveredPointIndex);
              }}
              className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Area Stats Badge */}
        <div className="absolute bottom-4 right-4 px-4 py-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl text-xs font-bold font-mono shadow-xl flex items-center gap-3">
           <span className="text-indigo-400 uppercase tracking-wider">Brüt Taban Alanı:</span>
           <span className="text-base text-emerald-400 font-extrabold">{totalArea.toFixed(1)} m²</span>
        </div>
      </div>
    </div>
  );
};

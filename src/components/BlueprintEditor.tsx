import React, { useRef, useState } from 'react';
import { 
  Plus,
  DoorOpen,
  AppWindow,
  Square,
  Check,
  MousePointer,
  Crosshair
} from 'lucide-react';
import { RoomData, Opening, OpeningType, BalconyProjection } from '../types';
import { calculatePolygonArea } from '../utils/zoningEngine';

interface BlueprintEditorProps {
  room: RoomData;
  setRoom: React.Dispatch<React.SetStateAction<RoomData>>;
  uploadedImage: string | null;
}

export type CADTool = 'select' | 'wall' | 'rect_wall' | 'door' | 'window' | 'balcony' | 'measure';

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({
  room,
  setRoom,
  uploadedImage
}) => {
  const [activeTool, setActiveTool] = useState<CADTool>('select');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [orthoMode, setOrthoMode] = useState(true); // Orthogonal snapping (0°, 90°)
  const [gridSize] = useState<number>(0.5); // 0.5m default grid

  // Hover & Active selection states
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);

  // Live mouse crosshair coordinates
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Custom numerical input popups
  const [editingWallIndex, setEditingWallIndex] = useState<number | null>(null);
  const [wallLengthInput, setWallLengthInput] = useState<string>('');

  const svgRef = useRef<SVGSVGElement>(null);

  // Map mouse event to CAD world coordinate [-12, 12] meters
  const getCADCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - rect.left) / rect.width) * 24 - 12;
    let y = ((e.clientY - rect.top) / rect.height) * 24 - 12;

    if (snapToGrid) {
      const snap = gridSize;
      x = Math.round(x / snap) * snap;
      y = Math.round(y / snap) * snap;
    }

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getCADCoords(e);
    setCursorPos(coords);

    if (draggingPointIndex !== null) {
      setRoom(prev => {
        const newPoints = [...prev.points];

        let finalX = coords.x;
        let finalY = coords.y;

        if (orthoMode && newPoints.length > 1) {
          const prevP = newPoints[(draggingPointIndex - 1 + newPoints.length) % newPoints.length];
          const dx = Math.abs(coords.x - prevP.x);
          const dy = Math.abs(coords.y - prevP.y);
          if (dx > dy) {
            finalY = prevP.y;
          } else {
            finalX = prevP.x;
          }
        }

        newPoints[draggingPointIndex] = { x: finalX, y: finalY };
        return { ...prev, points: newPoints };
      });
    }
  };

  const handlePointerDownPoint = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    setDraggingPointIndex(index);
    setSelectedWallIndex(null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPointIndex !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDraggingPointIndex(null);
    }
  };

  // Add Wall Segment (Split clicked wall)
  const handleWallClick = (e: React.PointerEvent<SVGGElement>, wallIdx: number) => {
    e.stopPropagation();
    setSelectedWallIndex(wallIdx);

    if (activeTool === 'wall') {
      const coords = getCADCoords(e as unknown as React.PointerEvent<SVGSVGElement>);
      setRoom(prev => {
        const newPoints = [...prev.points];
        newPoints.splice(wallIdx + 1, 0, coords);
        return { ...prev, points: newPoints };
      });
      setDraggingPointIndex(wallIdx + 1);
    }
  };

  // Add Opening (Door / Window) to Selected Wall
  const handleAddOpening = (type: OpeningType) => {
    if (selectedWallIndex === null) return;
    const wallIdx = selectedWallIndex;

    const p1 = room.points[wallIdx];
    const p2 = room.points[(wallIdx + 1) % room.points.length];
    const wallLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

    const width = type === 'door' ? 0.9 : type === 'double_door' ? 1.5 : 1.4;
    const height = type === 'door' || type === 'double_door' ? 2.1 : 1.4;
    const sillHeight = type === 'window' ? 0.9 : 0;

    const newOp: Opening = {
      id: `op-${Date.now()}`,
      type,
      wallIndex: wallIdx,
      distanceFromStart: Math.max(0.2, wallLen / 2 - width / 2),
      width,
      height,
      sillHeight
    };

    setRoom(prev => ({
      ...prev,
      openings: [...prev.openings, newOp]
    }));
  };

  // Add Balcony Projection
  const handleAddBalcony = (isClosed: boolean) => {
    if (selectedWallIndex === null) return;
    const newProj: BalconyProjection = {
      id: `proj-${Date.now()}`,
      wallIndex: selectedWallIndex,
      depth: 1.2,
      isClosed
    };

    setRoom(prev => ({
      ...prev,
      projections: [...prev.projections, newProj]
    }));
  };

  // Apply Numerical Wall Length
  const handleApplyWallLength = (wallIdx: number) => {
    const targetLen = parseFloat(wallLengthInput);
    if (isNaN(targetLen) || targetLen <= 0) return;

    setRoom(prev => {
      const p1 = prev.points[wallIdx];
      const p2 = prev.points[(wallIdx + 1) % prev.points.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const currentLen = Math.sqrt(dx * dx + dy * dy);
      if (currentLen === 0) return prev;

      const scale = targetLen / currentLen;
      const newP2 = {
        x: Number((p1.x + dx * scale).toFixed(2)),
        y: Number((p1.y + dy * scale).toFixed(2))
      };

      const newPoints = [...prev.points];
      newPoints[(wallIdx + 1) % prev.points.length] = newP2;

      return { ...prev, points: newPoints };
    });

    setEditingWallIndex(null);
  };

  const totalArea = calculatePolygonArea(room.points);

  return (
    <div className="w-full h-full relative bg-[#0f172a] text-slate-100 flex flex-col overflow-hidden select-none font-mono">
      {/* CAD Top Action Ribbon */}
      <div className="h-11 bg-[#1e293b] border-b border-slate-700/80 px-4 flex items-center justify-between shrink-0 z-20 text-xs">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTool('select')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all ${
              activeTool === 'select' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>SEÇ/TAŞI (SELECT)</span>
          </button>

          <button
            onClick={() => setActiveTool('wall')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition-all ${
              activeTool === 'wall' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>DUVAR BÖL / KÖŞE EKLE</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-1" />

          {/* Quick Openings */}
          <button
            onClick={() => handleAddOpening('door')}
            disabled={selectedWallIndex === null}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-red-400 flex items-center gap-1 font-bold"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>KAPISI (DOOR)</span>
          </button>

          <button
            onClick={() => handleAddOpening('window')}
            disabled={selectedWallIndex === null}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-cyan-400 flex items-center gap-1 font-bold"
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>PENCERE (WIN)</span>
          </button>

          <button
            onClick={() => handleAddBalcony(false)}
            disabled={selectedWallIndex === null}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-emerald-400 flex items-center gap-1 font-bold"
          >
            <Square className="w-3.5 h-3.5" />
            <span>BALKON (1.50M MAX)</span>
          </button>
        </div>

        {/* CAD Snapping Status Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold ${
              snapToGrid ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            GRID SNAP: {snapToGrid ? `${gridSize}M` : 'OFF'}
          </button>

          <button
            onClick={() => setOrthoMode(!orthoMode)}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold ${
              orthoMode ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            ORTHO (90°): {orthoMode ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Crosshair className="w-3 h-3 text-indigo-400" />
            <span>X: {cursorPos.x.toFixed(2)}m | Y: {cursorPos.y.toFixed(2)}m</span>
          </div>
        </div>
      </div>

      {/* Main Professional CAD Canvas Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0f1d] flex items-center justify-center">
        {/* Precise Technical CAD Grid Layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Blueprint Sketch Image Overlay */}
        {uploadedImage && (
          <div className="absolute inset-0 p-12 opacity-20 pointer-events-none select-none">
             <img src={uploadedImage} className="w-full h-full object-contain filter invert" alt="CAD Blueprint Background" />
          </div>
        )}

        {/* SVG Professional Vector Technical Drawing Canvas */}
        <svg 
          ref={svgRef}
          viewBox="-12 -12 24 24"
          className="w-full h-full absolute inset-0 touch-none cursor-crosshair z-10"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Axis Guidelines */}
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#1e293b" strokeWidth="0.04" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#1e293b" strokeWidth="0.04" />

          {/* Hatching / Shading Interior Floor Polygon */}
          <polygon 
            points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(99, 102, 241, 0.08)"
            stroke="none"
          />

          {/* Wall Layer Rendering with Double Parallel Wall Lines (Standard Architectural CAD Standard) */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            const isSelected = selectedWallIndex === i;

            const dx = nextP.x - p.x;
            const dy = nextP.y - p.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;

            // Wall Normal Offset Vectors (25cm wall thickness representation)
            const wallThick = room.wallThickness || 0.25;
            const nx = (-dy / len) * (wallThick / 2);
            const ny = (dx / len) * (wallThick / 2);

            return (
              <g key={`cad-wall-${i}`} onPointerDown={(e) => handleWallClick(e, i)}>
                {/* Touch / Click Sensor Line */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke="transparent"
                  strokeWidth="0.8"
                  className="cursor-pointer"
                />

                {/* Inner Parallel Line */}
                <line
                  x1={p.x - nx}
                  y1={p.y - ny}
                  x2={nextP.x - nx}
                  y2={nextP.y - ny}
                  stroke={isSelected ? "#818cf8" : "#38bdf8"}
                  strokeWidth="0.06"
                />

                {/* Outer Parallel Line */}
                <line
                  x1={p.x + nx}
                  y1={p.y + ny}
                  x2={nextP.x + nx}
                  y2={nextP.y + ny}
                  stroke={isSelected ? "#818cf8" : "#38bdf8"}
                  strokeWidth="0.06"
                />

                {/* Center Core Solid Line */}
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke={isSelected ? "#a5b4fc" : "#6366f1"}
                  strokeWidth={isSelected ? "0.20" : "0.12"}
                />
              </g>
            );
          })}

          {/* Render 2D Balcony Projections */}
          {room.projections.map((proj) => {
            const p1 = room.points[proj.wallIndex];
            const p2 = room.points[(proj.wallIndex + 1) % room.points.length];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;

            const nx = -dy / len;
            const ny = dx / len;

            const bP1 = { x: p1.x + nx * proj.depth, y: p1.y + ny * proj.depth };
            const bP2 = { x: p2.x + nx * proj.depth, y: p2.y + ny * proj.depth };

            return (
              <g key={proj.id} className="pointer-events-none">
                <polygon
                  points={`${p1.x},${p1.y} ${bP1.x},${bP1.y} ${bP2.x},${bP2.y} ${p2.x},${p2.y}`}
                  fill={proj.isClosed ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)"}
                  stroke={proj.isClosed ? "#f59e0b" : "#10b981"}
                  strokeWidth="0.08"
                  strokeDasharray={proj.isClosed ? "0.1 0.1" : "none"}
                />
                <text
                  x={(p1.x + bP1.x) / 2}
                  y={(p1.y + bP1.y) / 2}
                  fontSize="0.25"
                  fill="#10b981"
                  fontWeight="bold"
                >
                  {proj.isClosed ? 'KAPALI ÇIKMA' : 'BALKON'} ({proj.depth}m)
                </text>
              </g>
            );
          })}

          {/* Render Architectural Door Swing Arc & Window Graphics */}
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

            // Normal vector
            const nx = -uy;
            const ny = ux;

            const opStartX = p1.x + ux * op.distanceFromStart;
            const opStartY = p1.y + uy * op.distanceFromStart;
            const opEndX = opStartX + ux * op.width;
            const opEndY = opStartY + uy * op.width;

            const isDoor = op.type === 'door' || op.type === 'double_door';
            const doorLeafEndX = opStartX + nx * op.width;
            const doorLeafEndY = opStartY + ny * op.width;

            return (
              <g
                key={op.id}
                className="cursor-pointer"
                onClick={() => {
                  setRoom(prev => ({ ...prev, openings: prev.openings.filter(o => o.id !== op.id) }));
                }}
              >
                {/* Wall Opening Cutout Gap */}
                <line
                  x1={opStartX}
                  y1={opStartY}
                  x2={opEndX}
                  y2={opEndY}
                  stroke="#0a0f1d"
                  strokeWidth="0.32"
                />

                {isDoor ? (
                  <g key={`door-graphics-${op.id}`}>
                    {/* Door Panel Leaf */}
                    <line
                      x1={opStartX}
                      y1={opStartY}
                      x2={doorLeafEndX}
                      y2={doorLeafEndY}
                      stroke="#ef4444"
                      strokeWidth="0.08"
                    />
                    {/* Door Swing Quarter Circle Arc */}
                    <path
                      d={`M ${opEndX} ${opEndY} A ${op.width} ${op.width} 0 0 1 ${doorLeafEndX} ${doorLeafEndY}`}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="0.05"
                      strokeDasharray="0.08 0.08"
                    />
                  </g>
                ) : (
                  <g key={`win-graphics-${op.id}`}>
                    <line x1={opStartX} y1={opStartY} x2={opEndX} y2={opEndY} stroke="#38bdf8" strokeWidth="0.10" />
                    <line
                      x1={opStartX + nx * 0.1}
                      y1={opStartY + ny * 0.1}
                      x2={opEndX + nx * 0.1}
                      y2={opEndY + ny * 0.1}
                      stroke="#0ea5e9"
                      strokeWidth="0.04"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Architectural Extension & Dimension Lines (Cote Lines with Ticks) */}
          {room.points.map((p, i) => {
            const nextP = room.points[(i + 1) % room.points.length];
            const mx = (p.x + nextP.x) / 2;
            const my = (p.y + nextP.y) / 2;
            const length = Math.sqrt((nextP.x - p.x) ** 2 + (nextP.y - p.y) ** 2);
            const isSelected = selectedWallIndex === i;

            return (
              <g key={`cote-${i}`} className="select-none">
                {/* Cote Badge Box */}
                <rect 
                  x={mx - 0.8}
                  y={my - 0.3}
                  width="1.6"
                  height="0.6"
                  rx="0.1"
                  fill="#0f172a"
                  stroke={isSelected ? "#818cf8" : "#334155"}
                  strokeWidth="0.04"
                  className="shadow cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWallIndex(i);
                    setEditingWallIndex(i);
                    setWallLengthInput(length.toFixed(2));
                  }}
                />
                <text 
                  x={mx} 
                  y={my + 0.12} 
                  textAnchor="middle" 
                  fill={isSelected ? "#a5b4fc" : "#cbd5e1"}
                  fontSize="0.32" 
                  fontWeight="bold"
                  className="pointer-events-none font-mono"
                >
                  {length.toFixed(2)}m
                </text>
              </g>
            );
          })}

          {/* Corner Node Handles */}
          {room.points.map((p, i) => {
            const isHovered = hoveredPointIndex === i;
            const isDragging = draggingPointIndex === i;

            return (
              <g key={`corner-node-${i}`}>
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
                  r={isDragging ? "0.32" : isHovered ? "0.26" : "0.20"}
                  fill={isDragging ? "#6366f1" : isHovered ? "#38bdf8" : "#818cf8"}
                  stroke="#ffffff" 
                  strokeWidth="0.06"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Wall Edit Length Modal */}
        {editingWallIndex !== null && (
          <div className="absolute top-4 right-4 z-30 bg-slate-900 border border-indigo-500 p-3 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">SAYISAL UZUNLUK (M):</span>
            <input
              type="number"
              step="0.05"
              value={wallLengthInput}
              onChange={(e) => setWallLengthInput(e.target.value)}
              className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-indigo-300"
            />
            <button
              onClick={() => handleApplyWallLength(editingWallIndex)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>GÜNCELLE</span>
            </button>
          </div>
        )}

        {/* CAD Bottom Status Bar */}
        <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-4 text-slate-300 shadow-2xl">
           <span className="text-indigo-400">BRÜT TABAN ALANI:</span>
           <span className="text-emerald-400 font-extrabold text-sm">{totalArea.toFixed(2)} m²</span>
        </div>
      </div>
    </div>
  );
};

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { RoomMesh } from './RoomMesh';
import { RoomData, MaterialOption, RoofType } from '../types';
import { Suspense, useState } from 'react';
import { Sun, Moon, Eye, Maximize, Compass } from 'lucide-react';

interface SceneProps {
  room: RoomData;
  material: MaterialOption;
  facadeMaterial: MaterialOption;
  floorCount: number;
}

const SceneContent = ({
  room,
  material,
  facadeMaterial,
  floorCount,
  isNightMode,
  cameraPreset
}: SceneProps & { isNightMode: boolean; cameraPreset: 'iso' | 'top' | 'eye' }) => {

  // Dynamic Camera Position based on preset
  const cameraPos: [number, number, number] =
    cameraPreset === 'top'
      ? [0, 25, 0.1]
      : cameraPreset === 'eye'
      ? [8, 1.8, 8]
      : [14, 14, 14];

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPos} fov={cameraPreset === 'top' ? 35 : 45} />
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* Lighting Rig - Dynamic Day / Night Mode */}
      <ambientLight intensity={isNightMode ? 0.05 : 0.3} />
      <hemisphereLight
        intensity={isNightMode ? 0.2 : 0.6}
        color={isNightMode ? "#1e1b4b" : "#ffffff"}
        groundColor={isNightMode ? "#09090b" : "#18181b"}
      />
      
      {/* Sun / Moon Directional Light */}
      <directionalLight 
        position={isNightMode ? [-10, 15, -10] : [12, 18, 12]}
        intensity={isNightMode ? 0.4 : 1.3}
        color={isNightMode ? "#818cf8" : "#fef08a"}
        castShadow 
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {isNightMode && (
        <pointLight position={[0, 4, 0]} intensity={2.0} color="#f59e0b" distance={15} />
      )}

      <Suspense fallback={null}>
        <RoomMesh 
          room={room} 
          material={material} 
          facadeMaterial={facadeMaterial} 
          floorCount={floorCount} 
        />
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={isNightMode ? 0.2 : 0.4}
          scale={25}
          blur={2} 
          far={5}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Suspense>

      <gridHelper args={[40, 40, '#cbd5e1', '#e2e8f0']} position={[0, -0.01, 0]} rotation={[0, 0, 0]} />
    </>
  );
};

interface SceneWrapperProps extends SceneProps {
  onCapture: (canvas: HTMLCanvasElement) => void;
  setRoom: React.Dispatch<React.SetStateAction<RoomData>>;
}

export const Scene = ({ room, material, facadeMaterial, floorCount, onCapture, setRoom }: SceneWrapperProps) => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'eye'>('iso');

  return (
    <div id="threejs-viewport-canvas-container" className="w-full h-full bg-slate-900 relative overflow-hidden">
      {/* HUD Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 p-2 rounded-xl backdrop-blur shadow-xl text-white">
        {/* Day / Night Toggle */}
        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isNightMode
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-amber-500 border-amber-400 text-slate-900'
          }`}
        >
          {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          <span>{isNightMode ? 'GECE AYDINLATMASI' : 'GÜN IŞIĞI MODU'}</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Camera Views */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              cameraPreset === 'iso' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            İzometrik
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              cameraPreset === 'top' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kuşbakışı
          </button>
          <button
            onClick={() => setCameraPreset('eye')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
              cameraPreset === 'eye' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Göz Seviyesi
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Roof Options */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Çatı:</span>
          {(['flat', 'hip', 'gable'] as RoofType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoom(prev => ({ ...prev, roofType: r }))}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                room.roofType === r ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'flat' ? 'Düz/Teras' : r === 'hip' ? 'Kırma' : 'Beşik'}
            </button>
          ))}
        </div>
      </div>

      <Canvas 
        shadows 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <SceneContent 
          room={room} 
          material={material} 
          facadeMaterial={facadeMaterial} 
          floorCount={floorCount} 
          isNightMode={isNightMode}
          cameraPreset={cameraPreset}
        />
      </Canvas>
    </div>
  );
};

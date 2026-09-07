import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Float } from '@react-three/drei';
import { RoomMesh } from './RoomMesh';
import { RoomData, MaterialOption } from '../types';
import { Suspense, useCallback } from 'react';

interface SceneProps {
  room: RoomData;
  material: MaterialOption;
  facadeMaterial: MaterialOption;
  floorCount: number;
}

const SceneContent = ({ room, material, facadeMaterial, floorCount }: SceneProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={45} />
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} 
        enableDamping
        dampingFactor={0.05}
      />
      
      {/* High-Fidelity Studio Lighting Rig (Eliminates External HDR / CDN dependencies) */}
      <ambientLight intensity={0.2} />
      
      {/* Soft natural ambient hemisphere */}
      <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#18181b" />
      
      {/* Enterprise Indigo Accent/Rim Light for premium visual depth */}
      <directionalLight position={[-15, 12, -15]} intensity={0.7} color="#818cf8" />
      
      {/* Bright warm sunlight to define shapes */}
      <directionalLight 
        position={[12, 18, 12]} 
        intensity={1.3} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      
      {/* Main Spot Light */}
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} castShadow intensity={1.5} />

      <Suspense fallback={null}>
        <RoomMesh 
          room={room} 
          material={material} 
          facadeMaterial={facadeMaterial} 
          floorCount={floorCount} 
        />
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={4.5} 
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Suspense>

      <gridHelper args={[40, 40, '#cbd5e1', '#e2e8f0']} position={[0, -0.01, 0]} rotation={[0, 0, 0]} />
    </>
  );
};

interface SceneWrapperProps extends SceneProps {
  onCapture: (canvas: HTMLCanvasElement) => void;
}

export const Scene = ({ room, material, facadeMaterial, floorCount, onCapture }: SceneWrapperProps) => {
  return (
    <div id="threejs-viewport-canvas-container" className="w-full h-full bg-slate-50 relative overflow-hidden">
      <Canvas 
        shadows 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <SceneContent 
          room={room} 
          material={material} 
          facadeMaterial={facadeMaterial} 
          floorCount={floorCount} 
        />
      </Canvas>
    </div>
  );
};


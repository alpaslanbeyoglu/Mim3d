import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from '@react-three/drei';
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
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow intensity={2} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />

      <Suspense fallback={null}>
        <RoomMesh 
          room={room} 
          material={material} 
          facadeMaterial={facadeMaterial} 
          floorCount={floorCount} 
        />
        <Environment preset="city" />
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={4.5} 
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Suspense>

      <gridHelper args={[40, 40, '#27272a', '#161618']} position={[0, -0.01, 0]} rotation={[0, 0, 0]} />
    </>
  );
};

interface SceneWrapperProps extends SceneProps {
  onCapture: (canvas: HTMLCanvasElement) => void;
}

export const Scene = ({ room, material, facadeMaterial, floorCount, onCapture }: SceneWrapperProps) => {
  return (
    <div className="w-full h-full bg-[#09090b] relative overflow-hidden">
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


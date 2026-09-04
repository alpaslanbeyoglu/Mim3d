import { useMemo } from 'react';
import * as THREE from 'three';
import { RoomData, MaterialOption } from '../types';

interface RoomMeshProps {
  room: RoomData;
  material: MaterialOption;
  facadeMaterial: MaterialOption;
  floorCount: number;
}

export const RoomMesh = ({ room, material, facadeMaterial, floorCount }: RoomMeshProps) => {
  const { points, wallHeight, wallThickness } = room;

  // Create Floor Geometry
  const floorGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    });
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: floorCount }).map((_, floorIndex) => {
        const zOffset = floorIndex * wallHeight;

        return (
          <group key={floorIndex} position={[0, 0, zOffset]}>
            {/* Floor */}
            <mesh geometry={floorGeometry} receiveShadow position={[0, 0, -0.01]}>
              <meshStandardMaterial 
                color={material.color} 
                roughness={material.roughness} 
                metalness={material.metalness} 
              />
            </mesh>

            {/* Ceiling (for all but the top floor) or just a top cap */}
            {floorIndex < floorCount - 1 && (
               <mesh geometry={floorGeometry} position={[0, 0, wallHeight - 0.01]}>
                 <meshStandardMaterial color="#27272a" roughness={0.8} />
               </mesh>
            )}

            {/* Exterior Facade Walls */}
            {points.map((p, i) => {
              const nextP = points[(i + 1) % points.length];
              const dx = nextP.x - p.x;
              const dy = nextP.y - p.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);

              return (
                <mesh 
                  key={i} 
                  position={[p.x + dx / 2, p.y + dy / 2, wallHeight / 2]} 
                  rotation={[0, 0, angle]}
                  castShadow
                >
                  <boxGeometry args={[length, wallThickness, wallHeight]} />
                  <meshStandardMaterial 
                    color={facadeMaterial.color} 
                    roughness={facadeMaterial.roughness} 
                    metalness={facadeMaterial.metalness} 
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};


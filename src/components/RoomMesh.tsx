import { useMemo } from 'react';
import * as THREE from 'three';
import { RoomData, MaterialOption, Opening, BalconyProjection } from '../types';

interface RoomMeshProps {
  room: RoomData;
  material: MaterialOption;
  facadeMaterial: MaterialOption;
  floorCount: number;
}

export const RoomMesh = ({ room, material, facadeMaterial, floorCount }: RoomMeshProps) => {
  const { points, wallHeight, wallThickness, openings = [], projections = [], roofType = 'flat' } = room;

  // 1. Create Base Floor Polygon Geometry
  const floorGeometry = useMemo(() => {
    if (!points || points.length < 3) return new THREE.BufferGeometry();
    const shape = new THREE.Shape();
    points.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    });
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  // 2. Create Roof Geometry (Hip / Gable Roof)
  const roofGeometry = useMemo(() => {
    if (!points || points.length < 3 || roofType === 'flat') return null;

    const shape = new THREE.Shape();
    points.forEach((p, i) => {
      if (i === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    });

    const extrudeSettings = {
      steps: 1,
      depth: 1.2, // Roof pitch height
      bevelEnabled: true,
      bevelThickness: 1.0,
      bevelSize: 0.8,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [points, roofType]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: floorCount }).map((_, floorIndex) => {
        const zOffset = floorIndex * wallHeight;

        return (
          <group key={floorIndex} position={[0, 0, zOffset]}>
            {/* Interior Floor Slab */}
            <mesh geometry={floorGeometry} receiveShadow position={[0, 0, -0.01]}>
              <meshStandardMaterial 
                color={material.color} 
                roughness={material.roughness} 
                metalness={material.metalness} 
              />
            </mesh>

            {/* Ceiling Slab (for all lower floors) */}
            {floorIndex < floorCount - 1 && (
              <mesh geometry={floorGeometry} position={[0, 0, wallHeight - 0.01]}>
                <meshStandardMaterial color="#334155" roughness={0.8} />
              </mesh>
            )}

            {/* Exterior Facade Walls with Openings Cutouts */}
            {points.map((p, i) => {
              const nextP = points[(i + 1) % points.length];
              const dx = nextP.x - p.x;
              const dy = nextP.y - p.y;
              const wallLength = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);

              // Filter openings belonging to this wall segment
              const wallOpenings = openings.filter(op => op.wallIndex === i);

              return (
                <group
                  key={`wall-${i}`}
                  position={[p.x + dx / 2, p.y + dy / 2, wallHeight / 2]} 
                  rotation={[0, 0, angle]}
                >
                  {/* Main Solid Wall Mesh */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[wallLength, wallThickness, wallHeight]} />
                    <meshStandardMaterial
                      color={facadeMaterial.color}
                      roughness={facadeMaterial.roughness}
                      metalness={facadeMaterial.metalness}
                    />
                  </mesh>

                  {/* Openings (Doors / Windows / French Windows) Overlays */}
                  {wallOpenings.map((op) => {
                    const localX = op.distanceFromStart + op.width / 2 - wallLength / 2;
                    const localZ = op.sillHeight + op.height / 2 - wallHeight / 2;
                    const isDoor = op.type === 'door' || op.type === 'double_door';

                    return (
                      <group key={op.id} position={[localX, 0, localZ]}>
                        {/* Cutout Frame Frame Accent */}
                        <mesh position={[0, 0, 0]}>
                          <boxGeometry args={[op.width, wallThickness + 0.06, op.height]} />
                          <meshStandardMaterial
                            color={isDoor ? '#1e293b' : '#38bdf8'}
                            roughness={0.1}
                            metalness={0.8}
                            transparent={!isDoor}
                            opacity={isDoor ? 1.0 : 0.6}
                          />
                        </mesh>
                      </group>
                    );
                  })}
                </group>
              );
            })}

            {/* Render Balcony & Closed Projections */}
            {projections.map((proj) => {
              const p1 = points[proj.wallIndex];
              const p2 = points[(proj.wallIndex + 1) % points.length];
              if (!p1 || !p2) return null;

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);

              // Normal vector pointing outwards
              const nx = -dy / len;
              const ny = dx / len;

              const midX = (p1.x + p2.x) / 2 + (nx * proj.depth) / 2;
              const midY = (p1.y + p2.y) / 2 + (ny * proj.depth) / 2;

              return (
                <group
                  key={proj.id}
                  position={[midX, midY, proj.isClosed ? wallHeight / 2 : 0.15]}
                  rotation={[0, 0, angle]}
                >
                  <mesh castShadow receiveShadow>
                    <boxGeometry
                      args={[
                        len,
                        proj.depth,
                        proj.isClosed ? wallHeight : 0.2
                      ]}
                    />
                    <meshStandardMaterial
                      color={proj.isClosed ? facadeMaterial.color : '#94a3b8'}
                      roughness={0.4}
                    />
                  </mesh>

                  {/* Open Balcony Glass / Metal Railing */}
                  {!proj.isClosed && (
                    <mesh position={[0, proj.depth / 2, 0.5]} castShadow>
                      <boxGeometry args={[len, 0.05, 1.0]} />
                      <meshStandardMaterial color="#64748b" transparent opacity={0.7} />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Roof Structure on top floor */}
      {roofGeometry && roofType !== 'flat' && (
        <mesh
          geometry={roofGeometry}
          position={[0, 0, floorCount * wallHeight]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#881337" roughness={0.6} />
        </mesh>
      )}
    </group>
  );
};

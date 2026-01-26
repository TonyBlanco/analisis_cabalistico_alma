'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BodyAnatomy, RegionIntensity, HeatmapConfig, EmotionType } from './types';
import { anatomicalRegions } from './data/anatomicalRegions';
import { getColorForEmotion } from './heatmap-colors';

// ============================================
// TYPES
// ============================================

interface BodyVisualization3DProps {
  anatomy: BodyAnatomy;
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled?: boolean;
  heatmapData?: RegionIntensity[];
  heatmapConfig?: HeatmapConfig;
  cameraPosition?: [number, number, number];
  allowOrbit?: boolean;
  autoRotate?: boolean;
}

interface Region3DConfig {
  id: string;
  label: string;
  position: [number, number, number];
  scale: [number, number, number];
  geometry: 'sphere' | 'cylinder' | 'box' | 'capsule';
  rotation?: [number, number, number];
}

// ============================================
// 3D REGION CONFIGURATIONS
// Mapped to existing anatomicalRegions IDs
// ============================================

const region3DConfigs: Region3DConfig[] = [
  // Head
  { id: 'head', label: 'Cabeza', position: [0, 1.7, 0], scale: [0.12, 0.14, 0.12], geometry: 'sphere' },
  // Throat
  { id: 'throat', label: 'Garganta', position: [0, 1.5, 0], scale: [0.05, 0.08, 0.05], geometry: 'cylinder' },
  // Chest
  { id: 'chest', label: 'Pecho', position: [0, 1.25, 0], scale: [0.18, 0.2, 0.1], geometry: 'box' },
  // Solar Plexus
  { id: 'solar-plexus', label: 'Plexo Solar', position: [0, 1.0, 0.02], scale: [0.12, 0.1, 0.08], geometry: 'sphere' },
  // Abdomen
  { id: 'abdomen', label: 'Abdomen', position: [0, 0.8, 0], scale: [0.15, 0.15, 0.1], geometry: 'box' },
  // Pelvis
  { id: 'pelvis', label: 'Pelvis', position: [0, 0.55, 0], scale: [0.18, 0.12, 0.1], geometry: 'box' },
  // Shoulders
  { id: 'left-shoulder', label: 'Hombro Izq', position: [-0.22, 1.35, 0], scale: [0.08, 0.08, 0.07], geometry: 'sphere' },
  { id: 'right-shoulder', label: 'Hombro Der', position: [0.22, 1.35, 0], scale: [0.08, 0.08, 0.07], geometry: 'sphere' },
  // Arms
  { id: 'left-arm', label: 'Brazo Izq', position: [-0.3, 1.1, 0], scale: [0.04, 0.2, 0.04], geometry: 'cylinder' },
  { id: 'right-arm', label: 'Brazo Der', position: [0.3, 1.1, 0], scale: [0.04, 0.2, 0.04], geometry: 'cylinder' },
  // Hips
  { id: 'left-hip', label: 'Cadera Izq', position: [-0.1, 0.45, 0], scale: [0.08, 0.08, 0.07], geometry: 'sphere' },
  { id: 'right-hip', label: 'Cadera Der', position: [0.1, 0.45, 0], scale: [0.08, 0.08, 0.07], geometry: 'sphere' },
  // Legs
  { id: 'left-leg', label: 'Pierna Izq', position: [-0.08, 0.15, 0], scale: [0.05, 0.25, 0.05], geometry: 'cylinder' },
  { id: 'right-leg', label: 'Pierna Der', position: [0.08, 0.15, 0], scale: [0.05, 0.25, 0.05], geometry: 'cylinder' },
];

// ============================================
// REGION MESH COMPONENT
// ============================================

interface RegionMeshProps {
  config: Region3DConfig;
  isSelected: boolean;
  isHovered: boolean;
  intensity: number;
  emotionType: EmotionType;
  disabled: boolean;
  showLabels: boolean;
  opacity: number;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

function RegionMesh({
  config,
  isSelected,
  isHovered,
  intensity,
  emotionType,
  disabled,
  showLabels,
  opacity,
  onSelect,
  onHover,
}: RegionMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate on hover/select
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isHovered || isSelected ? 1.1 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(
        config.scale[0] * targetScale,
        config.scale[1] * targetScale,
        config.scale[2] * targetScale
      ),
      0.1
    );
  });

  // Calculate color based on intensity and emotion
  const color = useMemo(() => {
    if (intensity === 0) {
      // Base color when no intensity
      if (isSelected) return '#3B82F6'; // Blue for selected
      if (isHovered) return '#9CA3AF'; // Gray for hovered
      return '#E5E7EB'; // Light gray default
    }
    // Use emotion color with intensity
    return getColorForEmotion(emotionType, intensity);
  }, [intensity, emotionType, isSelected, isHovered]);

  // Calculate opacity
  const materialOpacity = useMemo(() => {
    if (intensity > 0) return opacity * (0.3 + (intensity / 100) * 0.7);
    if (isSelected) return 0.7;
    if (isHovered) return 0.5;
    return 0.3;
  }, [intensity, opacity, isSelected, isHovered]);

  // Geometry selection
  const geometry = useMemo(() => {
    switch (config.geometry) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[1, 1, 1, 32]} />;
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'capsule':
        return <capsuleGeometry args={[0.5, 1, 16, 32]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  }, [config.geometry]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!disabled) onSelect();
    },
    [disabled, onSelect]
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!disabled) {
        onHover(true);
        document.body.style.cursor = 'pointer';
      }
    },
    [disabled, onHover]
  );

  const handlePointerOut = useCallback(() => {
    onHover(false);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  return (
    <group position={config.position}>
      <mesh
        ref={meshRef}
        scale={config.scale}
        rotation={config.rotation ? config.rotation.map((r) => (r * Math.PI) / 180) as [number, number, number] : undefined}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={materialOpacity}
          roughness={0.5}
          metalness={0.1}
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Label on hover */}
      {(isHovered || (showLabels && intensity > 0)) && (
        <Html
          position={[0, config.scale[1] + 0.1, 0]}
          center
          distanceFactor={2}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-gray-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {config.label}
            {intensity > 0 && <span className="ml-1 text-amber-300">{intensity}%</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================
// BODY WIREFRAME (Outline)
// ============================================

function BodyWireframe() {
  return (
    <group>
      {/* Torso outline */}
      <mesh position={[0, 1.0, 0]}>
        <capsuleGeometry args={[0.15, 0.7, 8, 16]} />
        <meshBasicMaterial color="#9CA3AF" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.1, 16]} />
        <meshBasicMaterial color="#9CA3AF" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ============================================
// AUTO ROTATE
// ============================================

function AutoRotate({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (!enabled) return;
    angleRef.current += delta * 0.2;
    const radius = 3;
    camera.position.x = Math.sin(angleRef.current) * radius;
    camera.position.z = Math.cos(angleRef.current) * radius;
    camera.lookAt(0, 1, 0);
  });

  return null;
}

// ============================================
// SCENE CONTENT
// ============================================

interface SceneContentProps {
  selectedRegionId: string | null;
  onRegionSelect: (regionId: string | null) => void;
  disabled: boolean;
  heatmapData: RegionIntensity[];
  heatmapConfig: HeatmapConfig;
  autoRotate: boolean;
  allowOrbit: boolean;
}

function SceneContent({
  selectedRegionId,
  onRegionSelect,
  disabled,
  heatmapData,
  heatmapConfig,
  autoRotate,
  allowOrbit,
}: SceneContentProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Create heatmap lookup
  const heatmapLookup = useMemo(() => {
    return new Map(heatmapData.map((d) => [d.regionId, d]));
  }, [heatmapData]);

  const handleSelect = useCallback(
    (regionId: string) => {
      onRegionSelect(selectedRegionId === regionId ? null : regionId);
    },
    [selectedRegionId, onRegionSelect]
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />

      {/* Environment */}
      {/* <Environment preset="studio" /> */}

      {/* Body wireframe */}
      <BodyWireframe />

      {/* Anatomical regions */}
      {region3DConfigs.map((config) => {
        const intensityData = heatmapLookup.get(config.id);
        const intensity = intensityData?.intensity ?? 0;
        const emotionType = intensityData?.emotionType ?? 'neutral';

        return (
          <RegionMesh
            key={config.id}
            config={config}
            isSelected={selectedRegionId === config.id}
            isHovered={hoveredRegionId === config.id}
            intensity={heatmapConfig.enabled ? intensity : 0}
            emotionType={emotionType}
            disabled={disabled}
            showLabels={heatmapConfig.showLabels}
            opacity={heatmapConfig.opacity}
            onSelect={() => handleSelect(config.id)}
            onHover={(hovered) => setHoveredRegionId(hovered ? config.id : null)}
          />
        );
      })}

      {/* Controls */}
      {allowOrbit && !autoRotate && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          target={[0, 1, 0]}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      )}

      {/* Auto rotation */}
      <AutoRotate enabled={autoRotate && !allowOrbit} />
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const anatomyLabel: Record<BodyAnatomy, string> = {
  male: 'Anatomía masculina',
  female: 'Anatomía femenina',
  intersex: 'Anatomía intersexual',
  unknown: 'Anatomía neutral',
};

export default function BodyVisualization3D({
  anatomy,
  selectedRegionId,
  onRegionSelect,
  disabled = false,
  heatmapData = [],
  heatmapConfig = { enabled: false, showLabels: false, opacity: 0.7, colorScheme: 'default' },
  cameraPosition = [0, 1, 3],
  allowOrbit = true,
  autoRotate = false,
}: BodyVisualization3DProps) {
  // Find selected region info
  const selectedRegion = useMemo(() => {
    return anatomicalRegions.find((r) => r.id === selectedRegionId);
  }, [selectedRegionId]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Canvas */}
      <div className="relative w-full" style={{ height: '480px' }}>
        <Canvas
          camera={{ position: cameraPosition, fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneContent
            selectedRegionId={selectedRegionId}
            onRegionSelect={onRegionSelect}
            disabled={disabled}
            heatmapData={heatmapData}
            heatmapConfig={heatmapConfig}
            autoRotate={autoRotate}
            allowOrbit={allowOrbit}
          />
        </Canvas>

        {/* Orbit hint */}
        {allowOrbit && !autoRotate && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            🖱️ Arrastra para rotar • Scroll para zoom
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-800">{anatomyLabel[anatomy]}</p>
        <p className="text-xs text-gray-500">
          Vista 3D consultiva • Seleccione una región para observar
        </p>
        {disabled && (
          <p className="text-xs text-amber-600 font-medium">
            Selección deshabilitada en este estado
          </p>
        )}
        {selectedRegion && (
          <p className="text-xs text-indigo-600 font-medium">
            Región seleccionada: {selectedRegion.label}
          </p>
        )}
      </div>
    </div>
  );
}

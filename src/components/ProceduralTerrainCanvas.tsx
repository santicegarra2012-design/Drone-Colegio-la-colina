import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  MAP_PRESETS, 
  MapPresetId, 
  TimeOfDay, 
  setupDaylightSkyAndAtmosphere,
  buildLaColinaCampusEnvironment,
  buildMedellinDowntownEnvironment,
  buildLasPalmasHighwayEnvironment,
  buildEnvigadoFoothillsEnvironment,
  buildSantaElenaForestEnvironment,
} from '../utils/map3DGenerator.ts';

interface ProceduralTerrainCanvasProps {
  initialPreset?: MapPresetId;
  initialDaylight?: TimeOfDay;
  showHudControls?: boolean;
}

export const ProceduralTerrainCanvas: React.FC<ProceduralTerrainCanvasProps> = ({
  initialPreset = 'LA_COLINA_CAMPUS',
  initialDaylight = 'DAY_SUNNY',
  showHudControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [activePreset, setActivePreset] = useState<MapPresetId>(initialPreset);
  const [activeDaylight, setActiveDaylight] = useState<TimeOfDay>(initialDaylight);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    setActivePreset(initialPreset);
  }, [initialPreset]);

  useEffect(() => {
    setActiveDaylight(initialDaylight);
  }, [initialDaylight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 2500);
    const presetData = MAP_PRESETS[activePreset] || MAP_PRESETS['LA_COLINA_CAMPUS'];
    camera.position.set(
      presetData.defaultCameraPos[0],
      presetData.defaultCameraPos[1],
      presetData.defaultCameraPos[2]
    );
    camera.lookAt(
      presetData.defaultCameraLookAt[0],
      presetData.defaultCameraLookAt[1],
      presetData.defaultCameraLookAt[2]
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Setup sky & lighting
    setupDaylightSkyAndAtmosphere(scene, activeDaylight);

    // Build specific terrain
    if (activePreset === 'LA_COLINA_CAMPUS') {
      buildLaColinaCampusEnvironment(scene);
    } else if (activePreset === 'MEDELLIN_DOWNTOWN') {
      buildMedellinDowntownEnvironment(scene);
    } else if (activePreset === 'LAS_PALMAS_HIGHWAY') {
      buildLasPalmasHighwayEnvironment(scene);
    } else if (activePreset === 'ENVIGADO_FOOTHILLS') {
      buildEnvigadoFoothillsEnvironment(scene);
    } else if (activePreset === 'SANTA_ELENA_FOREST') {
      buildSantaElenaForestEnvironment(scene);
    }

    // Grid helper overlay
    if (activePreset !== 'LA_COLINA_CAMPUS') {
      const gridHelper = new THREE.GridHelper(400, 40, 0x06b6d4, 0x1e293b);
      gridHelper.position.y = 0.05;
      scene.add(gridHelper);
    }

    // Mouse drag orbital rotation controls
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 4;
    let sphericalRadius = 150;
    const orbitTarget = new THREE.Vector3(...presetData.defaultCameraLookAt);

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.008;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI / 2.2, sphericalPhi - deltaY * 0.008));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRadius = Math.max(30, Math.min(400, sphericalRadius + e.deltaY * 0.15));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isRotating && !isMouseDown) {
        angle += 0.002;
        camera.position.x = orbitTarget.x + Math.sin(angle) * sphericalRadius;
        camera.position.z = orbitTarget.z + Math.cos(angle) * sphericalRadius;
        camera.position.y = orbitTarget.y + Math.sin(sphericalPhi) * sphericalRadius;
      } else if (isMouseDown) {
        camera.position.x = orbitTarget.x + sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
        camera.position.y = orbitTarget.y + sphericalRadius * Math.cos(sphericalPhi);
        camera.position.z = orbitTarget.z + sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      }

      camera.lookAt(
        presetData.defaultCameraLookAt[0],
        presetData.defaultCameraLookAt[1],
        presetData.defaultCameraLookAt[2]
      );

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [activePreset, activeDaylight, isRotating]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-slate-950">
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
      />

      {showHudControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-300 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>3D CAMPUS MODEL: {MAP_PRESETS[activePreset]?.name || activePreset}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                isRotating 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              {isRotating ? 'Auto-Orbit: ON' : 'Auto-Orbit: OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProceduralTerrainCanvas;

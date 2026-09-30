import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Compass, 
  Eye, 
  AlertTriangle, 
  Wind, 
  Sparkles, 
  Check, 
  Activity,
  Maximize2,
  Dumbbell as DumbbellIcon,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { getExerciseBiomechanics } from '../data/exerciseBiomechanicsData';
import { createGymEquipment } from './ExerciseViewer/EquipmentFactory';
import { 
  createLaserAngleSystem, 
  updateLaserSegment, 
  createMotionTrajectorySystem, 
  createMuscleTargetSystem 
} from './ExerciseViewer/BiomechanicsRenderer';

// Helper to determine exact default equipment mode from exercise metadata
export const getEquipmentMode = (exercise) => {
  if (!exercise) return 'barbell';
  const eq = (exercise.equipment || '').toLowerCase();
  const name = (exercise.name || '').toLowerCase();
  const id = (exercise.id || '').toLowerCase();

  if (eq.includes('dumbbell') || name.includes('dumbbell') || id.includes('dumbbell') || id === 'romanian-deadlift' || id === 'one-arm-dumbbell-row' || id === 'incline-dumbbell-press' || id === 'overhead-dumbbell-press' || id === 'dumbbell-lateral-raise' || id === 'incline-dumbbell-curl' || id === 'hammer-curl' || exercise?.kinematicType === 'hammer-curl' || exercise?.kinematicType === 'romanian-deadlift') {
    return 'dumbbell';
  }
  if (eq.includes('barbell') || name.includes('barbell') || id.includes('barbell') || id === 'barbell-bench-press' || id === 'barbell-back-squat' || id === 'barbell-deadlift') {
    return 'barbell'; // Rod Weight
  }
  if (eq.includes('cable') || name.includes('cable') || id.includes('cable') || id === 'lat-pulldown' || id === 'face-pull' || id.includes('tricep-pushdown') || id === 'cable-chest-fly' || id === 'seated-cable-row' || id === 'cable-woodchopper') {
    return 'cable';
  }
  if (eq.includes('machine') || name.includes('machine') || id.includes('machine') || id === 'leg-press' || id === 'leg-extension' || id === 'seated-leg-curl' || id === 'standing-calf-raise') {
    return 'machine';
  }
  if (eq.includes('bodyweight') || name.includes('hanging') || id.includes('hanging')) {
    return 'bodyweight';
  }
  return 'barbell';
};

// Pre-allocated static rotation quaternions for seated overhead press (zero GC overhead)
const _qPressBottomL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.40))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.70))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.60));

const _qPressTopL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.10))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 2.60));

const _qPressBottomR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.40))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.70))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.60));

const _qPressTopR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.10))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -2.60));

const _qPressMistakeBottomL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 1.40));

const _qPressMistakeTopL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 2.80));

const _qPressMistakeBottomR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.40));

const _qPressMistakeTopR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -2.80));

// Pre-allocated static rotation quaternions for lat pulldown (zero GC overhead)
const _qLatTopL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.00))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.60))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 1.95));

const _qLatTopR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.00))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.60))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.95));

const _qLatMidL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 1.50));

const _qLatMidR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.50));

const _qLatBottomL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.75));

const _qLatBottomR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.20))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.75));

const _qLatMistakeTopL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.00))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.60))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 1.95));

const _qLatMistakeTopR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.00))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.60))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.95));

const _qLatMistakeBottomL = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.10))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 1.10));

const _qLatMistakeBottomR = new THREE.Quaternion()
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.30))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.10))
  .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.10));

const _tempQuatA = new THREE.Quaternion();
const _tempQuatB = new THREE.Quaternion();
const _qHammerOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

export default function Workout3DVisualizerModal({ isOpen, exercise, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Biomechanics metadata for this exercise
  const bioData = useMemo(() => getExerciseBiomechanics(exercise?.id), [exercise?.id]);

  // Mode States: Correct Form vs Common Mistake
  const [formMode, setFormMode] = useState('correct'); // 'correct' | 'mistake'
  const [showBiomechanics, setShowBiomechanics] = useState(true);
  const [selectedAiTip, setSelectedAiTip] = useState(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.5, 0.75, 1.0, 1.25
  const [currentPhase, setCurrentPhase] = useState('concentric');
  const [repCount, setRepCount] = useState(1);
  const [activeAngle, setActiveAngle] = useState(bioData.defaultCamera || 'side');
  const [modelLoading, setModelLoading] = useState(true);
  const [liveJointAngle, setLiveJointAngle] = useState(90);

  // Floating 3D Badge Screen Coordinates (Projected from Three.js World Space)
  const [projectedBadges, setProjectedBadges] = useState([]);

  // Equipment Mode State: 'dumbbell' vs 'barbell' (Rod Weight) vs 'cable' vs 'machine' vs 'bodyweight'
  const initialMode = getEquipmentMode(exercise);
  const [equipmentMode, setEquipmentMode] = useState(initialMode);
  const equipmentModeRef = useRef(initialMode);
  const formModeRef = useRef('correct');
  formModeRef.current = formMode;

  // Three.js State Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameId = useRef(null);
  const animTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  
  // Camera angles (Tightly framed for 65–80% hero mannequin scale)
  const cameraAngleRef = useRef({
    theta: bioData.cameraConfig?.theta ?? Math.PI / 2,
    phi: bioData.cameraConfig?.phi ?? Math.PI / 2.3,
    radius: bioData.cameraConfig?.radius ?? 2.15,
    targetY: bioData.cameraConfig?.targetY ?? 0.88
  });
  const repTriggeredRef = useRef(false);

  // Trajectory history points for motion ribbon
  const trajectoryPointsRef = useRef([]);

  // Loaded bones, mesh & equipment references
  const bonesRef = useRef({});
  const initialQuatsRef = useRef({});
  const initialPositionsRef = useRef({});
  const modelRootRef = useRef(null);
  const equipmentRefs = useRef({});
  const laserAngleRefs = useRef({});
  const trajectorySystemRef = useRef(null);
  const muscleTargetRef = useRef(null);

  // Immediate equipment mode switch handler
  const handleEquipmentModeChange = (mode) => {
    equipmentModeRef.current = mode;
    setEquipmentMode(mode);
  };

  // Reset Playback
  const handleResetPlayback = () => {
    animTimeRef.current = 0;
    setRepCount(1);
    setIsPlaying(true);
  };

  // Synchronize exercise transitions
  useEffect(() => {
    if (isOpen && exercise) {
      setIsPlaying(true);
      setRepCount(1);
      animTimeRef.current = 0;
      repTriggeredRef.current = false;
      trajectoryPointsRef.current = [];
      const mode = getEquipmentMode(exercise);
      equipmentModeRef.current = mode;
      setEquipmentMode(mode);
      setFormMode('correct');
      setSelectedAiTip(null);

      // Apply intelligent camera default for this exercise
      const cam = bioData.cameraConfig || { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: 0.88 };
      cameraAngleRef.current = { ...cam };
      setActiveAngle(bioData.defaultCamera || 'side');
    }
  }, [isOpen, exercise?.id, bioData]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    if (!isOpen || !exercise || !canvasRef.current) return;

    setModelLoading(true);

    const container = containerRef.current;
    const width = container ? container.clientWidth : 640;
    const height = container ? container.clientHeight : 540;

    // 1. SCENE & CAMERA (Dark Charcoal Studio Slate Backdrop)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161922);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 3. CINEMATIC STUDIO LIGHTING (Electric Blue Silhouette Rim Light + Key Light)
    const ambientLight = new THREE.AmbientLight(0x28303d, 1.25);
    scene.add(ambientLight);

    // Key Light (Sculpted anatomical shadows defining deltoids, lats, and legs)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    keyLight.position.set(3.5, 4.5, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Silhouette Rim Light (Electric cool blue glancing off skull, neck, shoulders, and spine)
    const silhouetteRimLight = new THREE.DirectionalLight(0x8ab4f8, 2.1);
    silhouetteRimLight.position.set(0, 5, -3.5);
    scene.add(silhouetteRimLight);

    // Front/Fill Light (Soft cool cyan)
    const fillLight = new THREE.DirectionalLight(0x54acbf, 0.65);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // 4. SEAMLESS STUDIO GROUND & SOFT CONTACT SHADOW PEDESTAL
    const floorPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.7, 0.04, 48),
      new THREE.MeshStandardMaterial({ color: 0x12151c, roughness: 0.6, metalness: 0.1 })
    );
    floorPedestal.position.y = -0.02;
    floorPedestal.receiveShadow = true;
    scene.add(floorPedestal);

    const contactShadow = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 2.3, 32),
      new THREE.MeshBasicMaterial({ color: 0x090b0f, transparent: true, opacity: 0.70, side: THREE.DoubleSide })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.002;
    scene.add(contactShadow);

    // 5. GYM EQUIPMENT (Created with immediate strict visibility enforcement)
    const activeEqMode = equipmentModeRef.current || getEquipmentMode(exercise);
    const equipment = createGymEquipment(scene, exercise, activeEqMode);
    equipmentRefs.current = equipment;

    // 6. NEON BIOMECHANICAL LASER VECTOR ANGLE (Signature Reference Feature)
    const laserAngle = createLaserAngleSystem(scene);
    laserAngleRefs.current = laserAngle;

    // 7. 3D MOTION TRAJECTORY SYSTEM (Glowing Path Curves)
    const trajectorySystem = createMotionTrajectorySystem(scene);
    trajectorySystemRef.current = trajectorySystem;

    // 8. PRIMARY & SECONDARY TARGET MUSCLE ILLUMINATION
    const muscleTarget = createMuscleTargetSystem(scene);
    muscleTargetRef.current = muscleTarget;

    // 9. LOAD ATHLETIC MALE BASE MESH & APPLY WHITE PORCELAIN SKIN + BLACK COMPRESSION SHORTS
    const loader = new GLTFLoader();
    loader.load(
      '/models/male_base_mesh.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRootRef.current = model;

        model.rotation.set(0, -Math.PI / 2, 0);
        model.position.set(0, 0.95, 0);

        const bones = {};
        const initialQuats = {};
        const initialPositions = {};

        model.traverse((child) => {
          if (child.isBone) {
            bones[child.name] = child;
            const strippedName = child.name.replace('.', '');
            bones[strippedName] = child;
            initialQuats[child.name] = child.quaternion.clone();
            initialQuats[strippedName] = child.quaternion.clone();
            initialPositions[child.name] = child.position.clone();
            initialPositions[strippedName] = child.position.clone();
          }
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply Porcelain White Skin + Black Athletic Compression Shorts
            const geom = child.geometry;
            const posAttr = geom.attributes.position;
            const count = posAttr.count;
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
              const y = posAttr.getY(i);
              const z = posAttr.getZ(i);

              // Pelvis and upper athletic thighs
              const isShorts = y >= -0.30 && y <= 0.08 && Math.abs(z) <= 0.22;

              if (isShorts) {
                // Dark athletic gym compression shorts (#14171f)
                colors[i * 3 + 0] = 0.09;
                colors[i * 3 + 1] = 0.11;
                colors[i * 3 + 2] = 0.14;
              } else {
                // Pristine matte white porcelain anatomical skin (#edf1f5)
                colors[i * 3 + 0] = 0.94;
                colors[i * 3 + 1] = 0.96;
                colors[i * 3 + 2] = 0.98;
              }
            }

            geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            child.material = new THREE.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.32,
              metalness: 0.04,
              flatShading: false
            });
            child.material.needsUpdate = true;
          }
        });

        bonesRef.current = bones;
        initialQuatsRef.current = initialQuats;
        initialPositionsRef.current = initialPositions;

        scene.add(model);
        setModelLoading(false);
      },
      undefined,
      (err) => {
        console.warn('Error loading GLTF male base mesh:', err);
        setModelLoading(false);
      }
    );

    // 10. RESIZE OBSERVER (Zero aspect-ratio distortion on any screen)
    let resizeObserver = null;
    if (container) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          }
        }
      });
      resizeObserver.observe(container);
    }

    // 11. HIGH-PRECISION KINEMATICS & LASER VECTOR LOOP
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && modelRootRef.current) {
        const speed = 1.9 * playbackSpeed;
        animTimeRef.current += delta * speed;

        // Smooth cosine turnaround (0 = bottom / stretch, 1 = top / peak squeeze)
        const t = (1 - Math.cos(animTimeRef.current)) / 2;
        const isDriving = Math.sin(animTimeRef.current) > 0;

        setCurrentPhase(isDriving ? 'concentric' : 'eccentric');

        if (t < 0.04) {
          if (!repTriggeredRef.current) {
            setRepCount(prev => (prev >= 12 ? 1 : prev + 1));
            repTriggeredRef.current = true;
          }
        } else {
          repTriggeredRef.current = false;
        }

        // Apply biomechanical posture & equipment tracking
        applyHighPrecisionKinematics(exercise.kinematicType || 'squat', t, isDriving, formModeRef.current);
      }

      renderer.render(scene, camera);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (resizeObserver) resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen, exercise?.id, isPlaying, playbackSpeed, bioData]);

  // UPDATE CAMERA FROM SPHERICAL ORBIT COORDINATES
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, targetY } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi) + (targetY ? targetY * 0.4 : 0);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, targetY || 0.88, 0);
  };

  // HIGH-PRECISION BIOMECHANICAL KINEMATICS & LASER VECTOR TRACKING FOR ALL EXERCISES
  const applyHighPrecisionKinematics = (type, t, isDriving, activeFormMode) => {
    const bones = bonesRef.current;
    const initialQuats = initialQuatsRef.current;
    const initialPos = initialPositionsRef.current;
    const model = modelRootRef.current;
    const eq = equipmentRefs.current;
    const laser = laserAngleRefs.current;
    const trajectory = trajectorySystemRef.current;
    const muscles = muscleTargetRef.current;
    const camera = cameraRef.current;

    if (!model || !bones.spine) return;

    const isMistake = activeFormMode === 'mistake';

    // 1. Reset root orientation and height
    model.rotation.set(0, -Math.PI / 2, 0);
    model.position.set(0, 0.95, 0);

    // 2. Reset all bones to exact bind rest quaternions
    Object.keys(bones).forEach(name => {
      if (initialQuats[name]) bones[name].quaternion.copy(initialQuats[name]);
      if (initialPos[name]) bones[name].position.copy(initialPos[name]);
    });

    const b = (name) => bones[name] || bones[name.replace('.', '')];

    // Reset bench transform & pad angle
    if (eq.benchGroup) {
      eq.benchGroup.position.set(0, 0, 0);
      eq.benchGroup.rotation.set(0, 0, 0);
      if (eq.pad) eq.pad.rotation.x = 0; // default flat
      if (eq.strut) eq.strut.visible = false;
    }

    // Kinematic joint movements across all 16 exercise types
    switch (type) {
      // 1. ONE-ARM DUMBBELL ROW
      case 'one-arm-row': {
        model.position.set(0, 0.82, -0.1);
        
        if (isMistake) {
          // COMMON MISTAKE: Severe torso twist & flared elbow
          if (b('spine001')) {
            b('spine001').rotateX(0.55);
            b('spine001').rotateZ(t * 0.42);
          }
          if (b('upper_armR')) b('upper_armR').rotateX(1.1);
          if (b('forearmR')) b('forearmR').rotateX(0.25);
          if (b('upper_armL')) {
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.35, -0.15, t));
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.15, -0.65, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.2, 1.1, t));
        } else {
          // CORRECT FORM: 42° forward incline, rigid neutral spine, tight J-curve
          if (b('spine001')) b('spine001').rotateX(0.72);
          if (b('thighL')) b('thighL').rotateX(0.15);
          if (b('shinL')) b('shinL').rotateX(0.25);
          if (b('thighR')) b('thighR').rotateX(-0.55);
          if (b('shinR')) b('shinR').rotateX(0.5);

          if (b('upper_armR')) b('upper_armR').rotateX(1.3);
          if (b('forearmR')) b('forearmR').rotateX(0.25);

          if (b('upper_armL')) {
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.50, -0.38, t));
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.10, -0.22, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.15, 1.55, t));
        }

        if (eq.benchGroup) {
          eq.benchGroup.position.set(-0.25, 0, 0.20);
          if (eq.pad) eq.pad.rotation.x = 0;
          if (eq.strut) eq.strut.visible = false;
        }
        break;
      }

      // 2. CABLE ROPE TRICEP PUSHDOWN
      case 'tricep-pushdown': {
        model.position.set(0, 0.90, 0);
        model.rotation.set(0, -Math.PI / 2, 0);

        // Athletic Lower Body: Soft knees & slight hip hinge for stable ground base
        if (b('thighL')) {
          b('thighL').rotateX(-0.25);
          b('thighL').rotateZ(-0.08);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-0.25);
          b('thighR').rotateZ(0.08);
        }
        if (b('shinL')) b('shinL').rotateX(0.35);
        if (b('shinR')) b('shinR').rotateX(0.35);
        if (b('footL')) b('footL').rotateX(-0.10);
        if (b('footR')) b('footR').rotateX(-0.10);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Torso swinging forward & backward (using bodyweight momentum to cheat)
          // 2. Elbows flaring wide out to sides and drifting back & forth
          // 3. Incomplete lockout (stopping short without tricep peak contraction)
          // 4. Broken, collapsed wrists
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.08, 0.42, t));
          if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(0.02, 0.20, t));
          if (b('spine004')) b('spine004').rotateX(-0.15); // neck straining forward

          const uX = THREE.MathUtils.lerp(0.10, 0.55, t);
          const uZ = THREE.MathUtils.lerp(-0.15, -0.65, t); // flared outward
          const fX = THREE.MathUtils.lerp(1.50, 0.60, t); // incomplete lockout

          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateZ(-uZ);
          }
          if (b('forearmL')) b('forearmL').rotateX(fX);
          if (b('forearmR')) b('forearmR').rotateX(fX);

          if (b('handL')) b('handL').rotateX(-0.30);
          if (b('handR')) b('handR').rotateX(-0.30);
        } else {
          // CORRECT FORM:
          // 1. Anchored athletic forward torso hinge (~15°-20°), core braced, zero torso swing
          // 2. Elbows GLUED tight to flanks/ribcage (zero forward/backward shoulder drift)
          // 3. Forearms extend from 90° stretch down to 180° full tricep lockout
          // 4. Forceful rope spread at bottom (hands flare apart beside hips for peak lateral head squeeze)
          if (b('spine001')) b('spine001').rotateX(0.22); // stable athletic hinge
          if (b('spine002')) b('spine002').rotateX(0.08);
          if (b('spine004')) b('spine004').rotateX(0.02);

          const uX = THREE.MathUtils.lerp(0.20, 0.45, t);
          const uY = THREE.MathUtils.lerp(0.10, 0.35, t);
          const uZ = THREE.MathUtils.lerp(-0.55, -0.50, t);
          const fX = THREE.MathUtils.lerp(1.75, 0.05, t);

          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateY(uY);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateY(-uY);
            b('upper_armR').rotateZ(-uZ);
          }
          if (b('forearmL')) b('forearmL').rotateX(fX);
          if (b('forearmR')) b('forearmR').rotateX(fX);

          // Neutral grip that flares outward at the bottom as the ropes spread
          const hZ = THREE.MathUtils.lerp(0.05, 0.25, t);
          const hY = THREE.MathUtils.lerp(-0.10, -0.35, t);
          if (b('handL')) {
            b('handL').rotateZ(hZ);
            b('handL').rotateY(hY);
          }
          if (b('handR')) {
            b('handR').rotateZ(-hZ);
            b('handR').rotateY(-hY);
          }
        }
        break;
      }

      // 3. BARBELL BENCH PRESS (FLAT)
      case 'bench-press': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        model.position.set(0, 0.48, 0.12);

        if (b('thighL')) b('thighL').rotateX(0.85);
        if (b('thighR')) b('thighR').rotateX(0.85);
        if (b('shinL')) b('shinL').rotateX(1.35);
        if (b('shinR')) b('shinR').rotateX(1.35);

        if (isMistake) {
          // Dangerous 90° elbow flare
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(1.45, 0.85, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.3, 1.2, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-1.45, -0.85, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.3, 1.2, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.3, 0.2, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.3, 0.2, t));
        } else {
          // 45° Elbow tuck
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.7, 0.2, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.6, 1.45, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.7, -0.2, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.6, 1.45, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.2, 0.15, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.2, 0.15, t));
        }

        if (eq.benchGroup) {
          eq.benchGroup.position.set(0, 0, 0);
          if (eq.pad) eq.pad.rotation.x = 0; // flat
          if (eq.strut) eq.strut.visible = false;
        }
        break;
      }

      // 4. INCLINE DUMBBELL PRESS (30° INCLINE)
      case 'incline-press': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 3);
        model.position.set(0, 0.48, 0.08);

        // Athletic base: Thighs rest naturally on seat pad, angled slightly out
        if (b('thighL')) {
          b('thighL').rotateX(1.30);
          b('thighL').rotateZ(-0.20);
        }
        if (b('thighR')) {
          b('thighR').rotateX(1.30);
          b('thighR').rotateZ(0.20);
        }

        // Shins drop vertically to the floor (90° knee angle)
        if (b('shinL')) b('shinL').rotateX(0.85);
        if (b('shinR')) b('shinR').rotateX(0.85);

        // Feet planted flat on gym floor with solid heel drive
        if (b('footL')) b('footL').rotateX(-0.45);
        if (b('footR')) b('footR').rotateX(-0.45);

        // Scapular retraction & proud chest arched against the 30° incline pad
        if (b('spine001')) b('spine001').rotateX(-0.04);
        if (b('spine002')) b('spine002').rotateX(-0.04);
        if (b('neck')) b('neck').rotateX(0.10);
        if (b('head')) b('head').rotateX(0.06);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Dangerous 90° flared elbows (severe rotator cuff & shoulder impingement)
          // 2. Dumbbells drop excessively deep at the bottom
          // 3. Wrists cocked back
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(1.45, 0.85, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.30, 1.25, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-1.45, -0.85, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.30, 1.25, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.40, 0.20, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.40, 0.20, t));
          if (b('handL')) b('handL').rotateX(-0.30);
          if (b('handR')) b('handR').rotateX(-0.30);
        } else {
          // CORRECT FORM:
          // 1. 45° Elbow tuck in the scapular plane (protects anterior shoulder)
          // 2. Controlled stretch to upper chest / collarbone level
          // 3. Smooth upward press arc converging slightly over clavicular pecs
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.68, 0.20, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.62, 1.48, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.68, -0.20, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.62, 1.48, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.15, 0.14, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.15, 0.14, t));
          if (b('handL')) {
            b('handL').rotateZ(0.12);
            b('handL').rotateY(-0.08);
          }
          if (b('handR')) {
            b('handR').rotateZ(-0.12);
            b('handR').rotateY(0.08);
          }
        }

        if (eq.benchGroup) {
          eq.benchGroup.position.set(0, 0, 0);
          if (eq.pad) eq.pad.rotation.x = Math.PI / 6; // +30° incline!
          if (eq.strut) eq.strut.visible = true;
        }
        break;
      }

      // 5. CABLE CHEST FLY & WOODCHOPPER
      case 'chest-fly': {
        model.position.set(0, 0.95, 0);
        if (b('spine001')) b('spine001').rotateX(0.25); // staggered lean
        if (b('thighL')) b('thighL').rotateX(-0.35);   // front foot
        if (b('shinL')) b('shinL').rotateX(0.35);
        if (b('thighR')) b('thighR').rotateX(0.20);    // rear foot

        if (isMistake) {
          // Bending elbows into a press & torso rocking
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.15, 0.45, t));
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.3, 0.2, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.3, 0.2, t));
        } else {
          // Frozen 15° elbow bend, hugging barrel arc to midline
          if (b('forearmL')) b('forearmL').rotateX(0.25);
          if (b('forearmR')) b('forearmR').rotateX(0.25);
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(1.40, 0.10, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(-0.10, 0.40, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-1.40, -0.10, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(-0.10, 0.40, t));
          }
        }
        break;
      }

      // 6. LAT PULLDOWN (WIDE GRIP)
      case 'lat-pulldown': {
        // Seated at the commercial Lat Pulldown machine station
        model.position.set(0, 0.58, 0);
        model.rotation.set(0, -Math.PI / 2, 0);

        // Athletic Seated Base: Thighs horizontal resting on seat pad and locked under thigh roller pads
        if (b('thighL')) {
          b('thighL').rotateX(-1.45);
          b('thighL').rotateZ(-0.12);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-1.45);
          b('thighR').rotateZ(0.12);
        }
        // Shins bent at 90° at knees, dropping vertically to the gym floor
        if (b('shinL')) b('shinL').rotateX(1.45);
        if (b('shinR')) b('shinR').rotateX(1.45);
        // Feet planted firmly flat on the floor pedestal
        if (b('footL')) b('footL').rotateX(-0.10);
        if (b('footR')) b('footR').rotateX(-0.10);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Severe 45° Torso Recline & Momentum Heave (turning pulldown into a sloppy row)
          // 2. Flared horizontal elbows dragging back instead of driving down into back pockets
          // 3. Yanking with biceps and collapsing/broken wrists
          // 4. Head wrenched forward
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.20, -0.75, t));
          if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(-0.08, -0.25, t));
          if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(0.05, 0.40, t));

          if (initialQuats['upper_armL'] && initialQuats['upper_armR']) {
            _tempQuatA.copy(initialQuats['upper_armL']).multiply(_qLatMistakeTopL);
            _tempQuatB.copy(initialQuats['upper_armL']).multiply(_qLatMistakeBottomL);
            if (b('upper_armL')) b('upper_armL').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);

            _tempQuatA.copy(initialQuats['upper_armR']).multiply(_qLatMistakeTopR);
            _tempQuatB.copy(initialQuats['upper_armR']).multiply(_qLatMistakeBottomR);
            if (b('upper_armR')) b('upper_armR').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);
          }

          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.15, 1.45, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.15, 1.45, t));

          // Broken, cocked wrists
          if (b('handL')) b('handL').rotateX(-0.35);
          if (b('handR')) b('handR').rotateX(-0.35);
        } else {
          // CORRECT FORM:
          // 1. Stable, proud thoracic posture: 12°-18° slight lean back with chest puffed to the ceiling
          // 2. Dynamic scapular depression initiating the pull, driving elbows down and back into back pockets
          // 3. Constant wide grip separation matching the lat bar with locked overhand grip
          // 4. Monotonic downward bar stroke directly to the upper clavicles
          const spine1X = THREE.MathUtils.lerp(-0.15, -0.22, t);
          const spine2X = THREE.MathUtils.lerp(-0.05, -0.08, t);
          if (b('spine001')) b('spine001').rotateX(spine1X);
          if (b('spine002')) b('spine002').rotateX(spine2X);
          if (b('spine004')) b('spine004').rotateX(0.12); // looking up along the cable line of pull

          // Scapular depression: shoulder elevates slightly at top stretch, depresses tightly at peak
          const sZ = t <= 0.5
            ? THREE.MathUtils.lerp(0.00, 0.05, t / 0.5)
            : THREE.MathUtils.lerp(0.05, -0.05, (t - 0.5) / 0.5);
          if (b('shoulderL')) b('shoulderL').rotateZ(sZ);
          if (b('shoulderR')) b('shoulderR').rotateZ(-sZ);

          let fX;
          if (initialQuats['upper_armL'] && initialQuats['upper_armR']) {
            if (t <= 0.5) {
              const u = t / 0.5;
              _tempQuatA.copy(initialQuats['upper_armL']).multiply(_qLatTopL);
              _tempQuatB.copy(initialQuats['upper_armL']).multiply(_qLatMidL);
              if (b('upper_armL')) b('upper_armL').quaternion.copy(_tempQuatA).slerp(_tempQuatB, u);

              _tempQuatA.copy(initialQuats['upper_armR']).multiply(_qLatTopR);
              _tempQuatB.copy(initialQuats['upper_armR']).multiply(_qLatMidR);
              if (b('upper_armR')) b('upper_armR').quaternion.copy(_tempQuatA).slerp(_tempQuatB, u);

              fX = THREE.MathUtils.lerp(0.02, 1.35, u);
            } else {
              const u = (t - 0.5) / 0.5;
              _tempQuatA.copy(initialQuats['upper_armL']).multiply(_qLatMidL);
              _tempQuatB.copy(initialQuats['upper_armL']).multiply(_qLatBottomL);
              if (b('upper_armL')) b('upper_armL').quaternion.copy(_tempQuatA).slerp(_tempQuatB, u);

              _tempQuatA.copy(initialQuats['upper_armR']).multiply(_qLatMidR);
              _tempQuatB.copy(initialQuats['upper_armR']).multiply(_qLatBottomR);
              if (b('upper_armR')) b('upper_armR').quaternion.copy(_tempQuatA).slerp(_tempQuatB, u);

              fX = THREE.MathUtils.lerp(1.35, 1.80, u);
            }
          }

          if (b('forearmL')) b('forearmL').rotateX(fX);
          if (b('forearmR')) b('forearmR').rotateX(fX);

          // Strong overhand hook grip wrapping around the wide angled bar handles
          if (b('handL')) {
            b('handL').rotateX(-0.15);
            b('handL').rotateZ(0.20);
          }
          if (b('handR')) {
            b('handR').rotateX(-0.15);
            b('handR').rotateZ(-0.20);
          }
        }
        break;
      }

      // 7. SEATED CABLE ROW
      case 'seated-row': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.position.set(0, 0.40, 0);

        // Lower body: seated comfortably on commercial bench pad at y = 0.35m, soft athletic 25° knee bend
        // Feet solidly braced flat against angled footplates at z = 0.82m, y = 0.15m
        if (b('thighL')) {
          b('thighL').rotateX(-1.40);
          b('thighL').rotateZ(-0.08);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-1.40);
          b('thighR').rotateZ(0.08);
        }
        if (b('shinL')) b('shinL').rotateX(0.48);
        if (b('shinR')) b('shinR').rotateX(0.48);
        if (b('footL')) b('footL').rotateX(-0.35);
        if (b('footR')) b('footR').rotateX(-0.35);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Rocking-boat momentum: excessive lumbar swing (hinging far forward 0.45 rad then violently heaving back -0.50 rad)
          // 2. Shrugged shoulders up to ears (hyper-elevated upper traps, zero scapular depression)
          // 3. Flared elbows wide out to sides instead of skimming ribs
          // 4. Broken, collapsed wrists
          const spine1X = THREE.MathUtils.lerp(0.45, -0.50, t);
          const spine2X = THREE.MathUtils.lerp(0.20, -0.20, t);
          if (b('spine001')) b('spine001').rotateX(spine1X);
          if (b('spine002')) b('spine002').rotateX(spine2X);
          if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(-0.15, 0.35, t));

          // Shrugged shoulders
          if (b('shoulderL')) b('shoulderL').rotateZ(0.18);
          if (b('shoulderR')) b('shoulderR').rotateZ(-0.18);

          const uX = THREE.MathUtils.lerp(0.70, -0.30, t);
          const uZ = THREE.MathUtils.lerp(-0.10, -0.45, t); // flared outward
          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateZ(-uZ);
          }

          const fX = THREE.MathUtils.lerp(0.15, 1.45, t);
          if (b('forearmL')) b('forearmL').rotateX(fX);
          if (b('forearmR')) b('forearmR').rotateX(fX);

          if (b('handL')) b('handL').rotateX(-0.30);
          if (b('handR')) b('handR').rotateX(-0.30);
        } else {
          // CORRECT FORM:
          // 1. Stable, upright stationary torso with proud chest (spine001 @ 0.06 rad, spine002 @ -0.04 rad)
          // 2. Dynamic scapular retraction: natural forward protraction at full stretch (sZ = 0.06), deep lat/rhomboid retraction pinch at finish (sZ = -0.15)
          // 3. Elbows pinned close to the ribcage driving straight back past the flanks
          // 4. V-bar trajectory pulling cleanly to lower abdomen/navel level
          // 5. Solid neutral grip with palms facing inward, wrists rigid and aligned
          if (b('spine001')) b('spine001').rotateX(0.06);
          if (b('spine002')) b('spine002').rotateX(-0.04);
          if (b('spine004')) b('spine004').rotateX(0.02);

          const sZ = THREE.MathUtils.lerp(0.06, -0.15, t);
          if (b('shoulderL')) b('shoulderL').rotateZ(sZ);
          if (b('shoulderR')) b('shoulderR').rotateZ(-sZ);

          const uX = THREE.MathUtils.lerp(0.95, -0.15, t);
          const uY = THREE.MathUtils.lerp(-0.45, -0.15, t);
          const uZ = THREE.MathUtils.lerp(-0.45, -0.30, t);

          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateY(uY);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateY(-uY);
            b('upper_armR').rotateZ(-uZ);
          }

          const fX = THREE.MathUtils.lerp(0.12, 1.55, t);
          const fZ = THREE.MathUtils.lerp(-0.10, -0.65, t);

          if (b('forearmL')) {
            b('forearmL').rotateX(fX);
            b('forearmL').rotateZ(fZ);
          }
          if (b('forearmR')) {
            b('forearmR').rotateX(fX);
            b('forearmR').rotateZ(-fZ);
          }

          if (b('handL')) {
            b('handL').rotateX(-0.15);
            b('handL').rotateZ(0.65);
          }
          if (b('handR')) {
            b('handR').rotateX(-0.15);
            b('handR').rotateZ(-0.65);
          }
        }
        break;
      }

      // 8. ROMANIAN DEADLIFT (RDL) & CONVENTIONAL DEADLIFT
      case 'romanian-deadlift':
      case 'deadlift': {
        const isRDL = type === 'romanian-deadlift' || exercise?.id === 'romanian-deadlift';
        if (isRDL) {
          if (isMistake) {
            // COMMON MISTAKES:
            // 1. Lumbar Flexion / Cat-Back Rounding: Bending spine instead of hinging hips (excessive shear on L4/L5 discs)
            // 2. Excessive Knee Bend (Squatting the Weight): Shins pitch forward 65°, turning the hinge into an awkward squat
            // 3. Weights Drifting Forward: Lats disengage, dumbbells/barbell swing 25cm away from shins
            // 4. Weight Shifting to Toes: Heels lifting off the ground
            const mY = THREE.MathUtils.lerp(0.70, 0.95, t);
            const mZ = THREE.MathUtils.lerp(-0.06, 0.00, t);
            model.position.set(0, mY, mZ);

            // Dangerous spinal flexion / cat-back hunch
            const s1X = THREE.MathUtils.lerp(1.38, 0.04, t);
            const s2X = THREE.MathUtils.lerp(0.35, -0.02, t);
            if (b('spine001')) b('spine001').rotateX(s1X);
            if (b('spine002')) b('spine002').rotateX(s2X);
            if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(-0.25, 0.02, t)); // head straining down

            // Excessive knee flexion (squatting down)
            const tX = THREE.MathUtils.lerp(-0.95, -0.08, t);
            if (b('thighL')) b('thighL').rotateX(tX);
            if (b('thighR')) b('thighR').rotateX(tX);

            const sX = THREE.MathUtils.lerp(1.15, 0.16, t);
            if (b('shinL')) b('shinL').rotateX(sX);
            if (b('shinR')) b('shinR').rotateX(sX);

            // Heels lift off ground (instability onto toes)
            if (b('footL')) b('footL').rotateX(THREE.MathUtils.lerp(0.20, -0.08, t));
            if (b('footR')) b('footR').rotateX(THREE.MathUtils.lerp(0.20, -0.08, t));

            // Weights drift forward away from legs (lats disengaged)
            const uX = THREE.MathUtils.lerp(0.35, -0.05, t);
            const uZ = THREE.MathUtils.lerp(-0.25, -0.45, t);
            if (b('upper_armL')) {
              b('upper_armL').rotateX(uX);
              b('upper_armL').rotateZ(uZ);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(uX);
              b('upper_armR').rotateZ(-uZ);
            }

            if (b('forearmL')) b('forearmL').rotateX(0.15);
            if (b('forearmR')) b('forearmR').rotateX(0.15);
            if (b('handL')) b('handL').rotateX(-0.35);
            if (b('handR')) b('handR').rotateX(-0.35);
          } else {
            // CORRECT BIOMECHANICAL FORM:
            // 1. Pure Posterior Hip Hinge: Glutes push horizontally backward in Z (32cm displacement to wall behind)
            // 2. Rigid Neutral Lumbar Spine: Flat back hinged 65°-70° forward (spine001 @ 1.24 rad), zero lower back rounding
            // 3. Vertical Shin Lock: Knees maintain soft fixed 15°-20° unlock, shins remain perpendicular (~85°-89° to floor)
            // 4. Grounded Flat Feet: Soles remain glued to gym floor pedestal with < 9mm variance
            // 5. Weights Grazing Shins: Arms hang vertically straight under gravity (lats locked), weights scraping thighs and shins within 2-4cm
            const mY = THREE.MathUtils.lerp(0.84, 0.95, t);
            const mZ = THREE.MathUtils.lerp(-0.32, 0.00, t);
            model.position.set(0, mY, mZ);

            // Neutral flat spine
            const s1X = THREE.MathUtils.lerp(1.24, 0.04, t);
            if (b('spine001')) b('spine001').rotateX(s1X);
            if (b('spine002')) b('spine002').rotateX(-0.02);
            if (b('spine004')) b('spine004').rotateX(0.02);

            // Femurs hinging backward relative to pelvis
            const tX = THREE.MathUtils.lerp(-0.79, -0.08, t);
            if (b('thighL')) {
              b('thighL').rotateX(tX);
              b('thighL').rotateZ(-0.06);
            }
            if (b('thighR')) {
              b('thighR').rotateX(tX);
              b('thighR').rotateZ(0.06);
            }

            // Shins near-vertical (soft 15° unlock)
            const sX = THREE.MathUtils.lerp(0.74, 0.16, t);
            if (b('shinL')) b('shinL').rotateX(sX);
            if (b('shinR')) b('shinR').rotateX(sX);

            // Feet grounded flat on floor
            const fX = THREE.MathUtils.lerp(-0.85, -0.08, t);
            if (b('footL')) b('footL').rotateX(fX);
            if (b('footR')) b('footR').rotateX(fX);

            // Upper arms: vertical plumb line under gravity, pulling weights into shins
            const uX = THREE.MathUtils.lerp(0.84, -0.05, t);
            const uZ = THREE.MathUtils.lerp(-0.45, -0.45, t);
            if (b('upper_armL')) {
              b('upper_armL').rotateX(uX);
              b('upper_armL').rotateZ(uZ);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(uX);
              b('upper_armR').rotateZ(-uZ);
            }

            // Forearms & wrists: firm pronated grip
            const faX = THREE.MathUtils.lerp(0.06, 0.08, t);
            if (b('forearmL')) b('forearmL').rotateX(faX);
            if (b('forearmR')) b('forearmR').rotateX(faX);

            if (b('handL')) {
              b('handL').rotateX(THREE.MathUtils.lerp(-0.15, -0.08, t));
              b('handL').rotateZ(0.08);
            }
            if (b('handR')) {
              b('handR').rotateX(THREE.MathUtils.lerp(-0.15, -0.08, t));
              b('handR').rotateZ(-0.08);
            }
          }
        } else {
          // Conventional Floor Deadlift
          const hinge = (1 - t) * 0.85;
          model.position.set(0, THREE.MathUtils.lerp(0.78, 0.95, t), THREE.MathUtils.lerp(-0.05, 0, t));

          if (isMistake) {
            // Cat-back lumbar rounding & bar drift
            if (b('spine001')) b('spine001').rotateX(hinge * 1.35);
            if (b('thighL')) b('thighL').rotateX(-hinge * 0.4);
            if (b('thighR')) b('thighR').rotateX(-hinge * 0.4);
            if (b('upper_armL')) b('upper_armL').rotateX((1 - t) * 0.65); // bar drifts away
            if (b('upper_armR')) b('upper_armR').rotateX((1 - t) * 0.65);
          } else {
            // Flat neutral spine, bar sliding down shins
            if (b('spine001')) b('spine001').rotateX(hinge);
            if (b('thighL')) b('thighL').rotateX(-hinge * 0.7);
            if (b('thighR')) b('thighR').rotateX(-hinge * 0.7);
            if (b('shinL')) b('shinL').rotateX((1 - t) * 0.25);
            if (b('shinR')) b('shinR').rotateX((1 - t) * 0.25);
            if (b('upper_armL')) {
              b('upper_armL').rotateX((1 - t) * 0.35);
              b('upper_armL').rotateZ(-0.20);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX((1 - t) * 0.35);
              b('upper_armR').rotateZ(0.20);
            }
          }
        }
        break;
      }

      // 9. BARBELL BACK SQUAT
      case 'squat': {
        if (isMistake) {
          // COMMON MISTAKES:
          // 1. Knee Valgus Collapse: Knees cave sharply inward on ascent (severe ACL/meniscus shear)
          // 2. "Good Morning" Squat: Hips shoot up, torso collapses forward (excessive lumbar shear)
          // 3. Heels Lifting Off Ground: Shifting weight entirely onto toes
          // 4. Cutting Depth Short: Quarter-squat stopping well above parallel
          const mY = THREE.MathUtils.lerp(0.93, 0.74, t);
          const mZ = THREE.MathUtils.lerp(0.00, -0.08, t);
          model.position.set(0, mY, mZ);

          // Torso collapses forward into dangerous spinal lean
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.04, 0.72, t));
          if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(-0.02, 0.15, t));

          // Severe knee valgus collapse (knees knock together)
          const tX = THREE.MathUtils.lerp(-0.06, -0.85, t);
          if (b('thighL')) {
            b('thighL').rotateX(tX);
            b('thighL').rotateZ(THREE.MathUtils.lerp(-0.20, 0.25, t)); // caves inward
          }
          if (b('thighR')) {
            b('thighR').rotateX(tX);
            b('thighR').rotateZ(THREE.MathUtils.lerp(0.20, -0.25, t)); // caves inward
          }

          if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(0.10, 1.10, t));
          if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(0.10, 1.10, t));

          // Heels lift off ground (weight on toes)
          if (b('footL')) b('footL').rotateX(THREE.MathUtils.lerp(-0.04, 0.25, t));
          if (b('footR')) b('footR').rotateX(THREE.MathUtils.lerp(-0.04, 0.25, t));
        } else {
          // CORRECT BIOMECHANICAL FORM:
          // 1. Grounded Shoulder-Width Base: Feet planted flat at y=0 throughout whole rep (zero sliding)
          // 2. Pure Vertical Bar Path: Barbell stays strictly over midfoot throughout descent
          // 3. True Parallel Depth: Hip crease descends level with top of patella (knee angle drops from 175° to 88°)
          // 4. Knees Tracking Over Toes: Hip abduction and external rotation tracking over flared toes
          // 5. 360° Intra-Abdominal Brace: Neutral spine with 30°-35° natural torso pitch, zero butt-wink
          const mY = THREE.MathUtils.lerp(0.93, 0.63, t);
          const mZ = THREE.MathUtils.lerp(0.00, -0.25, t);
          model.position.set(0, mY, mZ);

          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.04, 0.48, t));
          if (b('spine002')) b('spine002').rotateX(-0.02);

          const tX = THREE.MathUtils.lerp(-0.06, -1.34, t);
          if (b('thighL')) {
            b('thighL').rotateX(tX);
            b('thighL').rotateZ(-0.20);
          }
          if (b('thighR')) {
            b('thighR').rotateX(tX);
            b('thighR').rotateZ(0.20);
          }

          const sX = THREE.MathUtils.lerp(0.10, 1.62, t);
          if (b('shinL')) b('shinL').rotateX(sX);
          if (b('shinR')) b('shinR').rotateX(sX);

          // Ankle dorsiflexion maintaining flat grounded foot contact
          const fX = THREE.MathUtils.lerp(-0.04, -0.76, t);
          if (b('footL')) {
            b('footL').rotateX(fX);
            b('footL').rotateZ(0.20); // 15°-20° outward toe flare
          }
          if (b('footR')) {
            b('footR').rotateX(fX);
            b('footR').rotateZ(-0.20);
          }
        }

        // Upper Arms & Forearms gripping the barbell securely across upper traps
        if (b('upper_armL')) {
          b('upper_armL').rotateX(-0.75);
          b('upper_armL').rotateY(-0.60);
          b('upper_armL').rotateZ(1.35);
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateX(-0.75);
          b('upper_armR').rotateY(0.60);
          b('upper_armR').rotateZ(-1.35);
        }
        if (b('forearmL')) b('forearmL').rotateX(1.90);
        if (b('forearmR')) b('forearmR').rotateX(1.90);
        break;
      }

      // 10. LEG EXTENSION
      case 'leg-extension': {
        model.position.set(0, 0.55, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('spine001')) b('spine001').rotateX(0.05);

        if (isMistake) {
          if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(1.55, 0.45, t));
          if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(1.55, 0.45, t));
        } else {
          if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(1.55, 0.05, t));
          if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(1.55, 0.05, t));
        }
        break;
      }

      // 11. SEATED HAMSTRING CURL
      case 'leg-curl': {
        model.position.set(0, 0.55, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('spine001')) b('spine001').rotateX(0.20); // 15° forward hinge

        if (isMistake) {
          if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(0.15, 0.95, t));
          if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(0.15, 0.95, t));
        } else {
          if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(0.10, 1.65, t));
          if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(0.10, 1.65, t));
        }
        break;
      }

      // 12. STANDING CALF RAISE
      case 'calf-raise': {
        const rise = t * (isMistake ? 0.04 : 0.12);
        model.position.set(0, 0.95 + rise, 0);

        if (isMistake) {
          // Bending knees into a squat instead of flexing ankles
          if (b('thighL')) b('thighL').rotateX(-t * 0.35);
          if (b('thighR')) b('thighR').rotateX(-t * 0.35);
          if (b('shinL')) b('shinL').rotateX(t * 0.35);
          if (b('shinR')) b('shinR').rotateX(t * 0.35);
        } else {
          // Plantarflexion of ankles
          if (b('footL')) b('footL').rotateX(THREE.MathUtils.lerp(-0.25, 0.55, t));
          if (b('footR')) b('footR').rotateX(THREE.MathUtils.lerp(-0.25, 0.55, t));
        }
        break;
      }

      // 13. SEATED OVERHEAD DUMBBELL PRESS
      case 'overhead-press': {
        // Seated on the 80° upright commercial utility bench
        model.position.set(0, 0.52, 0.16);
        model.rotation.set(0, -Math.PI / 2, 0);

        // Athletic Seated Base: Thighs horizontal on seat pad, knees bent 90°, feet planted flat on floor
        if (b('thighL')) {
          b('thighL').rotateX(-1.45);
          b('thighL').rotateZ(-0.15);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-1.45);
          b('thighR').rotateZ(0.15);
        }

        // Shins bent at 90° at knees, dropping vertically to the gym floor
        if (b('shinL')) b('shinL').rotateX(1.45);
        if (b('shinR')) b('shinR').rotateX(1.45);

        // Feet planted firmly flat on the floor pedestal
        if (b('footL')) b('footL').rotateX(0.0);
        if (b('footR')) b('footR').rotateX(0.0);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Severe Lumbar Hyperextension (cheating weight like an incline chest press)
          // 2. Harsh 180° Elbow Flare in coronal plane (rotator cuff impingement)
          // 3. Clanking dumbbells overhead at apex / severe over-convergence
          // 4. Cocked/broken wrists collapsing backward
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.35, -0.48, t));
          if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(-0.15, -0.25, t));
          if (b('spine004')) b('spine004').rotateX(0.20); // head straining forward

          if (initialQuats['upper_armL'] && initialQuats['upper_armR']) {
            _tempQuatA.copy(initialQuats['upper_armL']).multiply(_qPressMistakeBottomL);
            _tempQuatB.copy(initialQuats['upper_armL']).multiply(_qPressMistakeTopL);
            if (b('upper_armL')) b('upper_armL').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);

            _tempQuatA.copy(initialQuats['upper_armR']).multiply(_qPressMistakeBottomR);
            _tempQuatB.copy(initialQuats['upper_armR']).multiply(_qPressMistakeTopR);
            if (b('upper_armR')) b('upper_armR').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);
          }

          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.45, 0.05, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.45, 0.05, t));

          // Cocked, collapsed wrists
          if (b('handL')) b('handL').rotateX(-0.35);
          if (b('handR')) b('handR').rotateX(-0.35);
        } else {
          // CORRECT FORM:
          // 1. Tall upright posture against the 80° back pad, ribs pulled down, core braced
          // 2. Elbows tucked in the scapular plane (~30° forward of torso line)
          // 3. Forearms vertically stacked under dumbbells at ear height (NEVER dropping or flaring like lateral raises)
          // 4. Smooth, powerful upward vertical press directly overhead to soft lockout without clanking
          if (b('spine001')) b('spine001').rotateX(-0.06); // natural upright bracing
          if (b('spine002')) b('spine002').rotateX(-0.04);
          if (b('spine004')) b('spine004').rotateX(0.02);

          if (initialQuats['upper_armL'] && initialQuats['upper_armR']) {
            _tempQuatA.copy(initialQuats['upper_armL']).multiply(_qPressBottomL);
            _tempQuatB.copy(initialQuats['upper_armL']).multiply(_qPressTopL);
            if (b('upper_armL')) b('upper_armL').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);

            _tempQuatA.copy(initialQuats['upper_armR']).multiply(_qPressBottomR);
            _tempQuatB.copy(initialQuats['upper_armR']).multiply(_qPressTopR);
            if (b('upper_armR')) b('upper_armR').quaternion.copy(_tempQuatA).slerp(_tempQuatB, t);
          }

          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.50, 0.08, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.50, 0.08, t));

          // Semi-pronated strong neutral grip (~30° inward palms in scapular plane)
          if (b('handL')) {
            b('handL').rotateZ(0.15);
            b('handL').rotateY(-0.35);
          }
          if (b('handR')) {
            b('handR').rotateZ(-0.15);
            b('handR').rotateY(0.35);
          }
        }

        if (eq.benchGroup) {
          eq.benchGroup.position.set(0, 0, 0);
          if (eq.pad) eq.pad.rotation.x = 1.40; // 80° upright utility bench
          if (eq.strut) eq.strut.visible = true;
        }
        break;
      }

      // 14. DUMBBELL LATERAL RAISE
      case 'lateral-raise': {
        if (b('spine001')) b('spine001').rotateX(0.15);

        if (isMistake) {
          if (b('shoulderL')) b('shoulderL').rotateZ(0.35); // shrugging
          if (b('shoulderR')) b('shoulderR').rotateZ(-0.35);
          if (b('upper_armL')) b('upper_armL').rotateZ(t * 1.6);
          if (b('upper_armR')) b('upper_armR').rotateZ(-t * 1.6);
        } else {
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.15, 1.45, t));
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.05, 0.20, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.15, -1.45, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.05, 0.20, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(0.20);
          if (b('forearmR')) b('forearmR').rotateX(0.20);
        }
        break;
      }

      // 15. ROPE FACE PULL
      case 'face-pull': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.position.set(0, 0.93, -0.05);

        // Athletic grounded base: soft athletic 20° knee bend, core solidly braced against forward cable tension
        if (b('thighL')) {
          b('thighL').rotateX(-0.25);
          b('thighL').rotateZ(-0.06);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-0.25);
          b('thighR').rotateZ(0.06);
        }
        if (b('shinL')) b('shinL').rotateX(0.35);
        if (b('shinR')) b('shinR').rotateX(0.35);
        if (b('footL')) b('footL').rotateX(-0.10);
        if (b('footR')) b('footR').rotateX(-0.10);

        if (isMistake) {
          // COMMON MISTAKE:
          // 1. Violent torso swing: lifter swings forward then heaves back into an exaggerated 35° recline
          // 2. Low elbow row: elbows drop low to ribcage instead of driving high and wide to ears
          // 3. Zero external rotation: hands stay in front of chest/sternum, forearms pointing down
          // 4. Head cranes forward like a turtle; collapsed/broken wrists
          const spine1X = THREE.MathUtils.lerp(0.05, -0.45, t);
          if (b('spine001')) b('spine001').rotateX(spine1X);
          if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(-0.05, 0.35, t));

          // Low elbows dropping into a low chest row
          const uX = THREE.MathUtils.lerp(0.85, 0.10, t);
          const uY = THREE.MathUtils.lerp(-0.20, -0.10, t);
          const uZ = THREE.MathUtils.lerp(-0.20, -0.35, t);
          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateY(uY);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateY(-uY);
            b('upper_armR').rotateZ(-uZ);
          }

          const fX = THREE.MathUtils.lerp(0.30, 1.45, t);
          if (b('forearmL')) b('forearmL').rotateX(fX);
          if (b('forearmR')) b('forearmR').rotateX(fX);

          if (b('handL')) b('handL').rotateX(-0.35);
          if (b('handR')) b('handR').rotateX(-0.35);
        } else {
          // CORRECT FORM:
          // 1. Solid upright torso with proud chest, slight 5° athletic backward counter-brace
          // 2. Dynamic scapular retraction: protraction on reach (sZ = 0.05), deep rear-delt & rhomboid pin on finish (sZ = -0.10)
          // 3. High, wide elbows level with shoulders/ears throughout the pull (abducted ~85°-90°)
          // 4. Active external rotation: hands flay rope ends apart beside ears, thumbs pointing backwards
          // 5. Line of pull straight toward the bridge of the nose / eye level
          if (b('spine001')) b('spine001').rotateX(-0.06);
          if (b('spine002')) b('spine002').rotateX(0.04);
          if (b('spine004')) b('spine004').rotateX(-0.02);

          const sZ = THREE.MathUtils.lerp(0.05, -0.10, t);
          if (b('shoulderL')) b('shoulderL').rotateZ(sZ);
          if (b('shoulderR')) b('shoulderR').rotateZ(-sZ);

          const uX = THREE.MathUtils.lerp(1.55, 0.35, t);
          const uY = THREE.MathUtils.lerp(-0.45, 0.10, t);
          const uZ = THREE.MathUtils.lerp(-0.25, 1.00, t * t);

          if (b('upper_armL')) {
            b('upper_armL').rotateX(uX);
            b('upper_armL').rotateY(uY);
            b('upper_armL').rotateZ(uZ);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(uX);
            b('upper_armR').rotateY(-uY);
            b('upper_armR').rotateZ(-uZ);
          }

          const fX = THREE.MathUtils.lerp(0.08, 1.80, t);
          const fZ = THREE.MathUtils.lerp(0.00, 0.40, t);

          if (b('forearmL')) {
            b('forearmL').rotateX(fX);
            b('forearmL').rotateZ(fZ);
          }
          if (b('forearmR')) {
            b('forearmR').rotateX(fX);
            b('forearmR').rotateZ(-fZ);
          }

          const hX = THREE.MathUtils.lerp(0.00, -0.25, t);
          const hY = THREE.MathUtils.lerp(0.00, 0.35, t);
          const hZ = THREE.MathUtils.lerp(0.10, 0.45, t);

          if (b('handL')) {
            b('handL').rotateX(hX);
            b('handL').rotateY(hY);
            b('handL').rotateZ(hZ);
          }
          if (b('handR')) {
            b('handR').rotateX(hX);
            b('handR').rotateY(-hY);
            b('handR').rotateZ(-hZ);
          }
        }
        break;
      }

      // 16. DUMBBELL HAMMER CURL (Strict Neutral Grip & Brachialis Isolation)
      case 'hammer-curl': {
        model.position.set(0, 0.93, 0);
        model.rotation.set(0, -Math.PI / 2, 0);

        // Grounded Athletic Stance: Soft knees, stable hip base, feet flat on gym floor
        if (b('thighL')) {
          b('thighL').rotateX(-0.08);
          b('thighL').rotateZ(-0.05);
        }
        if (b('thighR')) {
          b('thighR').rotateX(-0.08);
          b('thighR').rotateZ(0.05);
        }
        if (b('shinL')) b('shinL').rotateX(0.14);
        if (b('shinR')) b('shinR').rotateX(0.14);
        if (b('footL')) b('footL').rotateX(-0.06);
        if (b('footR')) b('footR').rotateX(-0.06);

        if (isMistake) {
          // COMMON MISTAKES:
          // 1. Torso Momentum Swing: Heaving backward into hyperextension to swing heavy weights up
          // 2. Elbow Drift & Flare: Elbows flaring out sideways and swinging forward into shoulder flexion
          // 3. Accidental Supination: Wrists turning palms upward (losing neutral hammer grip and brachialis isolation)
          // 4. Half-Rep Bottom Cut: Never unlocking to full stretch at bottom, bouncing reps
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.15, -0.35, t));
          if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(0.08, -0.15, t));
          if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(0.05, 0.25, t));

          if (b('upper_armL')) {
            b('upper_armL').rotateX(THREE.MathUtils.lerp(-0.05, 0.45, t));
            b('upper_armL').rotateY(0.10);
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.55, -0.25, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(THREE.MathUtils.lerp(-0.05, 0.45, t));
            b('upper_armR').rotateY(-0.10);
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(0.55, 0.25, t));
          }

          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.05, 2.10, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.05, 2.10, t));

          if (b('handL')) b('handL').rotateZ(THREE.MathUtils.lerp(0.0, 0.65, t));
          if (b('handR')) b('handR').rotateZ(THREE.MathUtils.lerp(0.0, -0.65, t));
        } else {
          // CORRECT BIOMECHANICAL FORM:
          // 1. Rigid Core & Neutral Spine: Solid upright posture, shoulders depressed, ribs down
          // 2. Elbows Pinned Directly Under Shoulders: Upper arms vertical along torso with ZERO forward drift
          // 3. Full Extension Stretch: Complete 169° elbow extension at the bottom
          // 4. Strict Forearm Flexion: Smooth arc up to 54° peak contraction in front of chest/shoulder
          // 5. Strict Neutral Palms-Facing Grip: Thumbs leading up, zero twisting throughout entire rep
          if (b('spine001')) b('spine001').rotateX(0.04);
          if (b('spine002')) b('spine002').rotateX(-0.02);

          if (b('upper_armL')) {
            b('upper_armL').rotateX(-0.05);
            b('upper_armL').rotateY(0.10);
            b('upper_armL').rotateZ(-0.55);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateX(-0.05);
            b('upper_armR').rotateY(-0.10);
            b('upper_armR').rotateZ(0.55);
          }

          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.08, 2.10, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.08, 2.10, t));

          if (b('handL')) {
            b('handL').rotateX(0.0);
            b('handL').rotateY(0.0);
            b('handL').rotateZ(0.0);
          }
          if (b('handR')) {
            b('handR').rotateX(0.0);
            b('handR').rotateY(0.0);
            b('handR').rotateZ(0.0);
          }
        }
        break;
      }

      // 17. INCLINE DUMBBELL BICEP CURL
      case 'bicep-curl': {
        const isHammer = exercise?.id === 'hammer-curl';

        if (isHammer) {
          model.position.set(0, 0.93, 0);
          model.rotation.set(0, -Math.PI / 2, 0);

          if (b('thighL')) {
            b('thighL').rotateX(-0.08);
            b('thighL').rotateZ(-0.05);
          }
          if (b('thighR')) {
            b('thighR').rotateX(-0.08);
            b('thighR').rotateZ(0.05);
          }
          if (b('shinL')) b('shinL').rotateX(0.14);
          if (b('shinR')) b('shinR').rotateX(0.14);
          if (b('footL')) b('footL').rotateX(-0.06);
          if (b('footR')) b('footR').rotateX(-0.06);

          if (isMistake) {
            if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.15, -0.35, t));
            if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(0.08, -0.15, t));
            if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(0.05, 0.25, t));

            if (b('upper_armL')) {
              b('upper_armL').rotateX(THREE.MathUtils.lerp(-0.05, 0.45, t));
              b('upper_armL').rotateY(0.10);
              b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.55, -0.25, t));
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(THREE.MathUtils.lerp(-0.05, 0.45, t));
              b('upper_armR').rotateY(-0.10);
              b('upper_armR').rotateZ(THREE.MathUtils.lerp(0.55, 0.25, t));
            }

            if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.05, 2.10, t));
            if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.05, 2.10, t));

            if (b('handL')) b('handL').rotateZ(THREE.MathUtils.lerp(0.0, 0.65, t));
            if (b('handR')) b('handR').rotateZ(THREE.MathUtils.lerp(0.0, -0.65, t));
          } else {
            if (b('spine001')) b('spine001').rotateX(0.04);
            if (b('spine002')) b('spine002').rotateX(-0.02);

            if (b('upper_armL')) {
              b('upper_armL').rotateX(-0.05);
              b('upper_armL').rotateY(0.10);
              b('upper_armL').rotateZ(-0.55);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(-0.05);
              b('upper_armR').rotateY(-0.10);
              b('upper_armR').rotateZ(0.55);
            }

            if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.08, 2.10, t));
            if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.08, 2.10, t));

            if (b('handL')) {
              b('handL').rotateX(0.0);
              b('handL').rotateY(0.0);
              b('handL').rotateZ(0.0);
            }
            if (b('handR')) {
              b('handR').rotateX(0.0);
              b('handR').rotateY(0.0);
              b('handR').rotateZ(0.0);
            }
          }
        } else {
          // Seated Incline Dumbbell Bicep Curl on 55° Commercial Incline Bench
          model.position.set(0, 0.52, 0.16);
          model.rotation.set(0, -Math.PI / 2, 0);

          // Athletic Seated Base: Thighs horizontal on seat pad, knees bent 90°, feet planted flat on floor
          if (b('thighL')) {
            b('thighL').rotateX(-1.45);
            b('thighL').rotateZ(-0.15);
          }
          if (b('thighR')) {
            b('thighR').rotateX(-1.45);
            b('thighR').rotateZ(0.15);
          }

          // Shins dropping vertically to gym floor
          if (b('shinL')) b('shinL').rotateX(1.45);
          if (b('shinR')) b('shinR').rotateX(1.45);

          // Feet planted firmly flat on floor
          if (b('footL')) b('footL').rotateX(0.0);
          if (b('footR')) b('footR').rotateX(0.0);

          if (isMistake) {
            // COMMON MISTAKES:
            // 1. Elbow Forward Drift: upper arms swing forward (+35° shoulder flexion), engaging anterior deltoids
            // 2. Torso Lurching: swinging torso forward off the 55° incline bench pad
            // 3. Half-Rep Bottom Cut: cutting eccentric stretch short, stopping at ~90°
            // 4. Cocked/hyperextended wrists without proper supination
            if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.55, 0.10, t));
            if (b('spine002')) b('spine002').rotateX(THREE.MathUtils.lerp(-0.25, 0.05, t));
            if (b('spine004')) b('spine004').rotateX(THREE.MathUtils.lerp(0.15, 0.35, t)); // head straining forward

            // Upper arms drift forward by swinging anterior delts
            if (b('upper_armL')) {
              b('upper_armL').rotateX(THREE.MathUtils.lerp(-0.80, 0.15, t));
              b('upper_armL').rotateY(0.70);
              b('upper_armL').rotateZ(-0.30);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(THREE.MathUtils.lerp(-0.80, 0.15, t));
              b('upper_armR').rotateY(-0.70);
              b('upper_armR').rotateZ(0.30);
            }

            // Half-rep bottom cut (starting at ~90°)
            if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.05, 2.05, t));
            if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.05, 2.05, t));

            // Broken, cocked wrists
            if (b('handL')) b('handL').rotateX(-0.30);
            if (b('handR')) b('handR').rotateX(-0.30);
          } else {
            // CORRECT BIOMECHANICAL FORM:
            // 1. Back and head resting flush against the 55° commercial incline bench pad
            // 2. Upper arms locked vertically perpendicular to the floor behind torso throughout entire rep (ZERO elbow drift!)
            // 3. Full deep passive stretch on the long head of the biceps brachii at bottom extension (~151° elbow angle)
            // 4. Pure forearm elbow flexion curling up into peak squeeze (~35° elbow angle)
            // 5. Active wrist supination rotating pinkies upward toward outer shoulders at peak
            if (b('spine001')) b('spine001').rotateX(-0.55);
            if (b('spine002')) b('spine002').rotateX(-0.25);
            if (b('spine004')) b('spine004').rotateX(0.15); // head resting naturally back on pad

            // Upper arms strictly perpendicular to the ground behind the torso
            if (b('upper_armL')) {
              b('upper_armL').rotateX(-0.80);
              b('upper_armL').rotateY(0.70);
              b('upper_armL').rotateZ(-0.30);
            }
            if (b('upper_armR')) {
              b('upper_armR').rotateX(-0.80);
              b('upper_armR').rotateY(-0.70);
              b('upper_armR').rotateZ(0.30);
            }

            // Pure forearm flexion: full stretch (0.08 rad / 151°) to peak contraction (2.20 rad / 35°)
            if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.08, 2.20, t));
            if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.08, 2.20, t));

            // Powerful wrist supination: pinkies curl upward towards outer shoulders at the apex
            if (b('handL')) {
              b('handL').rotateZ(THREE.MathUtils.lerp(0.00, 0.45, t));
              b('handL').rotateY(THREE.MathUtils.lerp(0.00, -0.30, t));
            }
            if (b('handR')) {
              b('handR').rotateZ(THREE.MathUtils.lerp(0.00, -0.45, t));
              b('handR').rotateY(THREE.MathUtils.lerp(0.00, 0.30, t));
            }
          }

          // Incline Bench Configuration
          if (eq.benchGroup) {
            eq.benchGroup.position.set(0, 0, 0);
            if (eq.pad) eq.pad.rotation.x = 0.60; // 55° incline commercial bench
            if (eq.strut) eq.strut.visible = true;
          }
        }
        break;
      }

      // 17. HANGING LEG / KNEE RAISE
      case 'hanging-leg-raise': {
        model.position.set(0, 1.05, 0);
        // Arms overhead holding bar
        if (b('upper_armL')) b('upper_armL').rotateZ(3.05);
        if (b('upper_armR')) b('upper_armR').rotateZ(-3.05);
        if (b('forearmL')) b('forearmL').rotateX(0.1);
        if (b('forearmR')) b('forearmR').rotateX(0.1);

        if (isMistake) {
          // Pendulum swing with straight thighs
          if (b('spine001')) b('spine001').rotateX(Math.sin(t * Math.PI) * 0.45);
        } else {
          // Pelvic curl with knee tuck
          if (b('spine001')) b('spine001').rotateX(t * 0.35);
          if (b('thighL')) b('thighL').rotateX(lerp(0, -1.65, t));
          if (b('thighR')) b('thighR').rotateX(lerp(0, -1.65, t));
          if (b('shinL')) b('shinL').rotateX(lerp(0, 1.5, t));
          if (b('shinR')) b('shinR').rotateX(lerp(0, 1.5, t));
        }
        break;
      }

      default: {
        const breath = Math.sin(t * Math.PI) * 0.02;
        if (b('spine001')) b('spine001').rotateX(breath);
      }
    }

    // UPDATE MATRICES TO GET ACCURATE WORLD COORDINATES
    model.updateMatrixWorld(true);

    const handLPos = new THREE.Vector3();
    const handRPos = new THREE.Vector3();
    const elbowLPos = new THREE.Vector3();
    const shoulderLPos = new THREE.Vector3();
    const trapsPos = new THREE.Vector3();
    const latPos = new THREE.Vector3();
    const hipLPos = new THREE.Vector3();
    const kneeLPos = new THREE.Vector3();
    const ankleLPos = new THREE.Vector3();
    const toeLPos = new THREE.Vector3();

    if (b('handL')) b('handL').getWorldPosition(handLPos);
    if (b('handR')) b('handR').getWorldPosition(handRPos);
    if (b('forearmL')) b('forearmL').getWorldPosition(elbowLPos);
    if (b('shoulderL')) b('shoulderL').getWorldPosition(shoulderLPos);
    if (b('spine004')) b('spine004').getWorldPosition(trapsPos);
    if (b('spine002')) b('spine002').getWorldPosition(latPos);
    if (b('thighL')) b('thighL').getWorldPosition(hipLPos);
    if (b('shinL')) b('shinL').getWorldPosition(kneeLPos);
    if (b('footL')) b('footL').getWorldPosition(ankleLPos);
    if (b('toeL')) b('toeL').getWorldPosition(toeLPos);

    // -------------------------------------------------------------
    // DYNAMIC BIOMECHANICAL LASER VECTOR ANGLE TRACKING
    // -------------------------------------------------------------
    if (laser && laser.laserGroup) {
      laser.laserGroup.visible = showBiomechanics;

      const isRDL = type === 'romanian-deadlift' || exercise?.id === 'romanian-deadlift';
      const isLegExercise = ['squat', 'deadlift', 'leg-curl', 'leg-extension', 'romanian-deadlift'].includes(type);
      const isCalfExercise = type === 'calf-raise';
      const isAbsExercise = type === 'hanging-leg-raise';

      let pA = shoulderLPos;
      let pB = elbowLPos;
      let pC = handLPos;

      if (isCalfExercise) {
        pA = kneeLPos;
        pB = ankleLPos;
        pC = toeLPos;
      } else if (isAbsExercise) {
        pA = shoulderLPos;
        pB = hipLPos;
        pC = kneeLPos;
      } else if (isRDL) {
        // Romanian Deadlift: True Hip Hinge Angle (Shoulder/Torso -> Hip Pivot -> Knee/Femur)
        pA = shoulderLPos;
        pB = hipLPos;
        pC = kneeLPos;
      } else if (isLegExercise) {
        pA = hipLPos;
        pB = kneeLPos;
        pC = ankleLPos;
      }

      updateLaserSegment(laser.seg1, pA, pB);
      updateLaserSegment(laser.seg2, pB, pC);

      laser.nodeA.position.copy(pA);
      laser.nodePivot.position.copy(pB);
      laser.nodeB.position.copy(pC);

      // Real joint angle calculation
      const v1 = new THREE.Vector3().subVectors(pA, pB).normalize();
      const v2 = new THREE.Vector3().subVectors(pC, pB).normalize();
      const angleDeg = Math.round(v1.angleTo(v2) * 180 / Math.PI);
      if (!isNaN(angleDeg)) setLiveJointAngle(angleDeg);

      // Dynamic Color: Green for correct stretch, Hot Orange for squeeze, Crimson Red for mistake
      let coreMat = isMistake ? laser.coreMatRed : (t > 0.55 ? laser.coreMatOrange : laser.coreMatGreen);
      let haloMat = isMistake ? laser.haloMatRed : (t > 0.55 ? laser.haloMatOrange : laser.haloMatGreen);

      laser.seg1Core.material = coreMat;
      laser.seg1Halo.material = haloMat;
      laser.seg2Core.material = coreMat;
      laser.seg2Halo.material = haloMat;
      laser.nodeA.material = coreMat;
      laser.nodePivot.material = coreMat;
      laser.nodeB.material = coreMat;
    }

    // -------------------------------------------------------------
    // 3D MOTION TRAJECTORY CURVE RECORDING
    // -------------------------------------------------------------
    if (trajectory) {
      trajectory.setVisible(showBiomechanics);

      const trackingPoint = ['squat', 'leg-extension', 'leg-curl', 'calf-raise', 'hanging-leg-raise'].includes(type)
        ? (type === 'squat' ? hipLPos : ankleLPos)
        : handLPos;

      if (trajectoryPointsRef.current.length < 30) {
        trajectoryPointsRef.current.push(trackingPoint.clone());
      } else {
        trajectoryPointsRef.current.shift();
        trajectoryPointsRef.current.push(trackingPoint.clone());
      }

      if (trajectoryPointsRef.current.length >= 6) {
        trajectory.updateTrajectory(trajectoryPointsRef.current, isMistake);
      }
    }

    // -------------------------------------------------------------
    // PRIMARY & SECONDARY TARGET MUSCLE ILLUMINATION
    // -------------------------------------------------------------
    if (muscles) {
      if (type === 'tricep-pushdown') {
        const tricepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.45);
        muscles.primaryPatch.position.set(tricepPos.x + 0.04, tricepPos.y, tricepPos.z - 0.05);
        muscles.primaryPatch.scale.set(0.06, 0.12, 0.06);

        muscles.secondaryPatch.position.set(shoulderLPos.x + 0.03, shoulderLPos.y - 0.02, shoulderLPos.z - 0.04);
        muscles.secondaryPatch.scale.set(0.05, 0.07, 0.05);
      } else if (type === 'bicep-curl' || type === 'hammer-curl') {
        const isHammer = type === 'hammer-curl' || exercise?.id === 'hammer-curl';
        const bicepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.5);
        if (isHammer) {
          // Primary: Brachialis & Brachioradialis (outer forearm & deep upper arm thickness)
          muscles.primaryPatch.position.set(elbowLPos.x + 0.03, elbowLPos.y - 0.06, elbowLPos.z + 0.04);
          muscles.primaryPatch.scale.set(0.06, 0.12, 0.06);

          // Secondary: Biceps Brachii
          muscles.secondaryPatch.position.set(bicepPos.x + 0.03, bicepPos.y, bicepPos.z + 0.04);
          muscles.secondaryPatch.scale.set(0.05, 0.09, 0.05);
        } else {
          muscles.primaryPatch.position.set(bicepPos.x + 0.03, bicepPos.y, bicepPos.z + 0.05);
          muscles.primaryPatch.scale.set(0.06, 0.10, 0.06);

          muscles.secondaryPatch.position.set(elbowLPos.x + 0.02, elbowLPos.y - 0.08, elbowLPos.z + 0.03);
          muscles.secondaryPatch.scale.set(0.05, 0.08, 0.05);
        }
      } else if (type === 'one-arm-row' || type === 'lat-pulldown' || type === 'seated-row') {
        muscles.primaryPatch.position.set(latPos.x + 0.12, latPos.y - 0.02, latPos.z - 0.06);
        muscles.primaryPatch.scale.set(0.09, 0.14, 0.07);

        muscles.secondaryPatch.position.set(shoulderLPos.x + 0.05, shoulderLPos.y - 0.03, shoulderLPos.z - 0.06);
        muscles.secondaryPatch.scale.set(0.06, 0.08, 0.06);
      } else if (type === 'incline-press') {
        // Upper Chest (Clavicular Pectoralis) & Anterior Deltoid
        muscles.primaryPatch.position.set(latPos.x + 0.08, latPos.y + 0.09, latPos.z + 0.12);
        muscles.primaryPatch.scale.set(0.11, 0.09, 0.06);

        const deltPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.25);
        muscles.secondaryPatch.position.set(deltPos.x + 0.04, deltPos.y + 0.02, deltPos.z + 0.05);
        muscles.secondaryPatch.scale.set(0.06, 0.08, 0.05);
      } else if (type === 'bench-press' || type === 'chest-fly') {
        muscles.primaryPatch.position.set(latPos.x + 0.08, latPos.y + 0.05, latPos.z + 0.14);
        muscles.primaryPatch.scale.set(0.12, 0.10, 0.06);

        const tricepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.5);
        muscles.secondaryPatch.position.set(tricepPos.x + 0.05, tricepPos.y, tricepPos.z - 0.04);
        muscles.secondaryPatch.scale.set(0.05, 0.09, 0.05);
      } else if (type === 'squat' || type === 'leg-extension') {
        const quadPos = new THREE.Vector3().lerpVectors(hipLPos, kneeLPos, 0.5);
        muscles.primaryPatch.position.set(quadPos.x + 0.06, quadPos.y, quadPos.z + 0.06);
        muscles.primaryPatch.scale.set(0.09, 0.14, 0.08);

        muscles.secondaryPatch.position.set(hipLPos.x + 0.08, hipLPos.y - 0.04, hipLPos.z - 0.08);
        muscles.secondaryPatch.scale.set(0.08, 0.10, 0.08);
      } else if (type === 'deadlift' || type === 'romanian-deadlift' || type === 'leg-curl') {
        const hamPos = new THREE.Vector3().lerpVectors(hipLPos, kneeLPos, 0.5);
        muscles.primaryPatch.position.set(hamPos.x + 0.06, hamPos.y, hamPos.z - 0.06);
        muscles.primaryPatch.scale.set(0.09, 0.14, 0.08);

        muscles.secondaryPatch.position.set(hipLPos.x + 0.08, hipLPos.y, hipLPos.z - 0.08);
        muscles.secondaryPatch.scale.set(0.08, 0.10, 0.08);
      } else if (type === 'calf-raise') {
        const calfPos = new THREE.Vector3().lerpVectors(kneeLPos, ankleLPos, 0.4);
        muscles.primaryPatch.position.set(calfPos.x + 0.04, calfPos.y, calfPos.z - 0.05);
        muscles.primaryPatch.scale.set(0.06, 0.12, 0.06);

        muscles.secondaryPatch.position.set(kneeLPos.x, kneeLPos.y, kneeLPos.z);
        muscles.secondaryPatch.scale.set(0.05, 0.05, 0.05);
      } else if (type === 'face-pull') {
        // Primary: Posterior Deltoid & Infraspinatus (rear shoulder head)
        muscles.primaryPatch.position.set(shoulderLPos.x + 0.05, shoulderLPos.y - 0.02, shoulderLPos.z - 0.07);
        muscles.primaryPatch.scale.set(0.07, 0.09, 0.07);

        // Secondary: Rhomboids & Middle Trapezius (mid-upper back retraction)
        muscles.secondaryPatch.position.set(latPos.x + 0.06, latPos.y + 0.08, latPos.z - 0.06);
        muscles.secondaryPatch.scale.set(0.08, 0.11, 0.06);
      } else if (type === 'overhead-press' || type === 'lateral-raise') {
        muscles.primaryPatch.position.set(shoulderLPos.x + 0.06, shoulderLPos.y, shoulderLPos.z);
        muscles.primaryPatch.scale.set(0.08, 0.10, 0.08);

        const tricepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.4);
        muscles.secondaryPatch.position.set(tricepPos.x + 0.04, tricepPos.y, tricepPos.z - 0.04);
        muscles.secondaryPatch.scale.set(0.05, 0.08, 0.05);
      } else if (type === 'hanging-leg-raise') {
        muscles.primaryPatch.position.set(latPos.x + 0.02, latPos.y - 0.12, latPos.z + 0.10);
        muscles.primaryPatch.scale.set(0.08, 0.14, 0.06);

        muscles.secondaryPatch.position.set(hipLPos.x, hipLPos.y + 0.05, hipLPos.z + 0.08);
        muscles.secondaryPatch.scale.set(0.06, 0.08, 0.06);
      } else {
        muscles.primaryPatch.position.set(latPos.x + 0.10, latPos.y, latPos.z);
        muscles.primaryPatch.scale.set(0.08, 0.12, 0.07);
        muscles.secondaryPatch.position.set(shoulderLPos.x, shoulderLPos.y, shoulderLPos.z);
      }

      muscles.primaryMat.emissiveIntensity = THREE.MathUtils.lerp(0.40, 1.6, t);
      muscles.secondaryMat.emissiveIntensity = THREE.MathUtils.lerp(0.25, 0.75, t);
    }

    // -------------------------------------------------------------
    // FLOATING 3D ANATOMICAL CONTEXTUAL BADGES PROJECTION
    // -------------------------------------------------------------
    if (camera && containerRef.current && showBiomechanics) {
      const badgesConfig = isMistake ? bioData.commonMistake.badges : bioData.correctForm.badges;

      const projected = badgesConfig.map((badge, idx) => {
        const boneObj = b(badge.bone);
        if (!boneObj) return null;

        const worldPos = new THREE.Vector3();
        boneObj.getWorldPosition(worldPos);

        // Offset tag slightly so it hovers beside the joint
        worldPos.y += 0.08;
        worldPos.x += 0.05;

        // Project to normalized device coordinates (-1 to +1)
        const screenPos = worldPos.clone().project(camera);

        // Convert to percentage within canvas
        const x = (screenPos.x * 0.5 + 0.5) * 100;
        const y = (-(screenPos.y * 0.5) + 0.5) * 100;

        // Keep badges safely within visible body zone (avoiding top pills & bottom dock)
        const isVisible = screenPos.z < 1.0 && x >= 10 && x <= 90 && y >= 18 && y <= 82;

        return {
          id: idx,
          text: badge.text,
          color: badge.color,
          x,
          y,
          isVisible
        };
      }).filter(Boolean);

      setProjectedBadges(projected);
    }

    // -------------------------------------------------------------
    // ABSOLUTE STRICT EQUIPMENT VISIBILITY & TRACKING ENFORCEMENT
    // -------------------------------------------------------------
    const activeMode = equipmentModeRef.current;

    // Reset ALL equipment to invisible first on every single frame
    if (eq.barbell) eq.barbell.visible = false;
    if (eq.dumbbellL) eq.dumbbellL.visible = false;
    if (eq.dumbbellR) eq.dumbbellR.visible = false;
    if (eq.latBar) eq.latBar.visible = false;
    if (eq.latStation) eq.latStation.visible = false;
    if (eq.cableRope) eq.cableRope.visible = false;
    if (eq.rowStation) eq.rowStation.visible = false;
    if (eq.vBarHandle) eq.vBarHandle.visible = false;
    if (eq.rowCableWire) eq.rowCableWire.visible = false;
    if (eq.cableColumn) eq.cableColumn.visible = false;
    if (eq.faceCableWire) eq.faceCableWire.visible = false;
    if (eq.pullUpBar) eq.pullUpBar.visible = false;

    // Bench visibility
    const isInclineCurl = type === 'bicep-curl' && exercise?.id !== 'hammer-curl';
    const isBenchEx = ['bench-press', 'incline-press', 'one-arm-row', 'overhead-press'].includes(type) || isInclineCurl;
    if (eq.benchGroup) eq.benchGroup.visible = isBenchEx;

    if (activeMode === 'dumbbell') {
      if (type === 'one-arm-row') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          eq.dumbbellL.rotation.set(0, 0, 0);
        }
      } else if (type === 'incline-press') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          // Angle dumbbells to align with the 30° incline pressing plane & semi-pronated inward grip
          eq.dumbbellL.rotation.set(-Math.PI / 6, 0.20, 0);
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          eq.dumbbellR.rotation.set(-Math.PI / 6, -0.20, 0);
        }
      } else if (type === 'overhead-press') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          if (isMistake) {
            eq.dumbbellL.rotation.set(-0.25, 0.10, 0.25);
          } else {
            // Angle dumbbells to match 30° scapular plane semi-pronated inward grip
            eq.dumbbellL.rotation.set(0.12, 0.35, 0.10);
          }
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          if (isMistake) {
            eq.dumbbellR.rotation.set(-0.25, -0.10, -0.25);
          } else {
            eq.dumbbellR.rotation.set(0.12, -0.35, -0.10);
          }
        }
      } else if (type === 'hammer-curl' || (type === 'bicep-curl' && exercise?.id === 'hammer-curl')) {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          const qHand = new THREE.Quaternion();
          if (b('handL')) {
            b('handL').getWorldQuaternion(qHand);
            eq.dumbbellL.quaternion.copy(qHand).multiply(_qHammerOffset);
          }
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          const qHand = new THREE.Quaternion();
          if (b('handR')) {
            b('handR').getWorldQuaternion(qHand);
            eq.dumbbellR.quaternion.copy(qHand).multiply(_qHammerOffset);
          }
        }
      } else if (type === 'bicep-curl') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          if (isMistake) {
            eq.dumbbellL.rotation.set(-0.30, 0.10, THREE.MathUtils.lerp(0.0, 0.20, t));
          } else {
            eq.dumbbellL.rotation.set(
              THREE.MathUtils.lerp(0.08, -0.45, t),
              THREE.MathUtils.lerp(0.12, 0.35, t),
              THREE.MathUtils.lerp(0.00, 0.40, t)
            );
          }
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          if (isMistake) {
            eq.dumbbellR.rotation.set(-0.30, -0.10, THREE.MathUtils.lerp(0.0, -0.20, t));
          } else {
            eq.dumbbellR.rotation.set(
              THREE.MathUtils.lerp(0.08, -0.45, t),
              THREE.MathUtils.lerp(-0.12, -0.35, t),
              THREE.MathUtils.lerp(0.00, -0.40, t)
            );
          }
        }
      } else if (type === 'romanian-deadlift' || exercise?.id === 'romanian-deadlift') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          if (isMistake) {
            eq.dumbbellL.rotation.set(-0.25, 0.10, 0.15);
          } else {
            // Align dumbbells horizontally in front of thighs/shins with slight pronated pitch
            eq.dumbbellL.rotation.set(THREE.MathUtils.lerp(0.12, -0.40, t), 0.12, 0.08);
          }
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          if (isMistake) {
            eq.dumbbellR.rotation.set(-0.25, -0.10, -0.15);
          } else {
            eq.dumbbellR.rotation.set(THREE.MathUtils.lerp(0.12, -0.40, t), -0.12, -0.08);
          }
        }
      } else {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
          eq.dumbbellL.rotation.set(0, 0, 0);
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
          eq.dumbbellR.rotation.set(0, 0, 0);
        }
      }
    } else if (activeMode === 'barbell') {
      if (eq.barbell) {
        eq.barbell.visible = true;
        if (type === 'squat' || type === 'calf-raise') {
          eq.barbell.position.set(0, trapsPos.y + 0.01, trapsPos.z - 0.05);
          eq.barbell.rotation.set(0, 0, 0);
        } else {
          const barCenterY = (handLPos.y + handRPos.y) / 2;
          const barCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.barbell.position.set(0, barCenterY, barCenterZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
      }
    } else if (activeMode === 'cable') {
      if (type === 'lat-pulldown') {
        if (eq.latStation) eq.latStation.visible = true;
        if (eq.latBar) {
          eq.latBar.visible = true;
          const barCenterY = (handLPos.y + handRPos.y) / 2;
          const barCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.latBar.position.set(0, barCenterY, barCenterZ);

          if (eq.latCableWire) {
            const wireHeight = Math.max(0.1, 2.25 - barCenterY);
            eq.latCableWire.position.set(0, wireHeight / 2, (0.057 - barCenterZ) * 0.5);
            eq.latCableWire.scale.set(1, wireHeight / 1.5, 1);
          }
        }
      } else if (type === 'seated-row') {
        if (eq.rowStation) eq.rowStation.visible = true;
        if (eq.vBarHandle) {
          eq.vBarHandle.visible = true;
          const handleY = (handLPos.y + handRPos.y) / 2;
          const handleZ = (handLPos.z + handRPos.z) / 2;
          eq.vBarHandle.position.set(0, handleY, handleZ);
          eq.vBarHandle.rotation.set(0, 0, 0);

          if (eq.rowCableWire) {
            eq.rowCableWire.visible = true;
            const pulleyPos = new THREE.Vector3(0, 0.42, 1.15);
            const handlePos = new THREE.Vector3(0, handleY, handleZ);
            const mid = new THREE.Vector3().addVectors(pulleyPos, handlePos).multiplyScalar(0.5);
            const delta = new THREE.Vector3().subVectors(handlePos, pulleyPos);
            const dist = delta.length();
            const dir = delta.clone().normalize();

            eq.rowCableWire.position.copy(mid);
            eq.rowCableWire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            eq.rowCableWire.scale.set(1, dist, 1);
          }
        }
      } else if (type === 'face-pull') {
        if (eq.cableColumn) eq.cableColumn.visible = true;
        if (eq.cableRope) {
          eq.cableRope.visible = true;
          if (eq.cableWire) eq.cableWire.visible = false; // Hide overhead vertical wire

          const avgY = (handLPos.y + handRPos.y) / 2;
          const avgZ = (handLPos.z + handRPos.z) / 2;
          const handMid = new THREE.Vector3(0, avgY, avgZ);
          const pulleyPos = new THREE.Vector3(0, 1.60, 1.25);

          const forwardDir = new THREE.Vector3().subVectors(pulleyPos, handMid).normalize();
          const halfSep = Math.abs(handLPos.x - handRPos.x) / 2;
          const ropeCordLen = 0.36;
          const forwardDist = Math.sqrt(Math.max(0.04, ropeCordLen * ropeCordLen - halfSep * halfSep));
          const clampPos = handMid.clone().add(forwardDir.clone().multiplyScalar(forwardDist));

          eq.cableRope.position.copy(clampPos);

          if (eq.ropeBallL && eq.ropeBallR && eq.ropeCordL && eq.ropeCordR) {
            const localHandL = handLPos.clone().sub(clampPos);
            const localHandR = handRPos.clone().sub(clampPos);

            eq.ropeBallL.position.copy(localHandL);
            eq.ropeBallR.position.copy(localHandR);

            const dirL = localHandL.clone().normalize();
            eq.ropeCordL.position.set(localHandL.x / 2, localHandL.y / 2, localHandL.z / 2);
            eq.ropeCordL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirL);
            eq.ropeCordL.scale.set(1, Math.max(0.1, localHandL.length() / 0.32), 1);

            const dirR = localHandR.clone().normalize();
            eq.ropeCordR.position.set(localHandR.x / 2, localHandR.y / 2, localHandR.z / 2);
            eq.ropeCordR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirR);
            eq.ropeCordR.scale.set(1, Math.max(0.1, localHandR.length() / 0.32), 1);
          }

          if (eq.faceCableWire) {
            eq.faceCableWire.visible = true;
            const delta = new THREE.Vector3().subVectors(clampPos, pulleyPos);
            const dist = delta.length();
            const mid = new THREE.Vector3().addVectors(pulleyPos, clampPos).multiplyScalar(0.5);
            const dir = delta.clone().normalize();

            eq.faceCableWire.position.copy(mid);
            eq.faceCableWire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            eq.faceCableWire.scale.set(1, dist, 1);
          }
        }
      } else {
        if (eq.cableRope) {
          eq.cableRope.visible = true;
          if (eq.cableWire) eq.cableWire.visible = true;
          const clampY = (handLPos.y + handRPos.y) / 2 + 0.18;
          const clampZ = (handLPos.z + handRPos.z) / 2 - 0.04;
          eq.cableRope.position.set(0, clampY, clampZ);

          if (eq.ropeBallL && eq.ropeBallR && eq.ropeCordL && eq.ropeCordR) {
            const clampPos = new THREE.Vector3(0, clampY, clampZ);
            const localHandL = handLPos.clone().sub(clampPos);
            const localHandR = handRPos.clone().sub(clampPos);

            eq.ropeBallL.position.copy(localHandL);
            eq.ropeBallR.position.copy(localHandR);

            const dirL = localHandL.clone().normalize();
            eq.ropeCordL.position.set(localHandL.x / 2, localHandL.y / 2, localHandL.z / 2);
            eq.ropeCordL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirL);
            eq.ropeCordL.scale.set(1, Math.max(0.1, localHandL.length() / 0.32), 1);

            const dirR = localHandR.clone().normalize();
            eq.ropeCordR.position.set(localHandR.x / 2, localHandR.y / 2, localHandR.z / 2);
            eq.ropeCordR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirR);
            eq.ropeCordR.scale.set(1, Math.max(0.1, localHandR.length() / 0.32), 1);

            if (eq.cableWire) {
              const wireHeight = Math.max(0.1, 2.25 - clampY);
              eq.cableWire.position.set(0, wireHeight / 2, 0);
              eq.cableWire.scale.set(1, wireHeight / 1.5, 1);
            }
          }
        }
      }
    } else if (activeMode === 'bodyweight') {
      if (eq.pullUpBar) {
        eq.pullUpBar.visible = (type === 'hanging-leg-raise');
      }
    }
  };

  // MOUSE & TOUCH 360 ORBIT CONTROLS
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta += deltaX * 0.01;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.01));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // TOUCH CONTROLS FOR MOBILE PHONES
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    cameraAngleRef.current.theta += deltaX * 0.012;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.012));
    updateCameraPosition();
  };

  // CAMERA ANGLE PRESETS (Tightly scaled to 65–80% viewport height)
  const setCameraAnglePreset = (preset) => {
    setActiveAngle(preset);
    if (preset === 'side') {
      cameraAngleRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 2.15, targetY: bioData.cameraConfig?.targetY || 0.88 };
    } else if (preset === 'front') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 2.15, targetY: bioData.cameraConfig?.targetY || 0.88 };
    } else {
      // 3/4 Isometric
      cameraAngleRef.current = { theta: Math.PI / 3.2, phi: Math.PI / 2.6, radius: 2.25, targetY: bioData.cameraConfig?.targetY || 0.88 };
    }
    updateCameraPosition();
  };

  if (!isOpen || !exercise) return null;

  const defaultMode = getEquipmentMode(exercise);
  const isMistake = formMode === 'mistake';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 md:p-6 bg-[#011C40]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="ios-glass rounded-2xl sm:rounded-[32px] max-w-5xl w-full max-h-[96vh] sm:max-h-[94vh] overflow-y-auto shadow-2xl border border-[#54ACBF]/50 bg-white/95 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-[#54ACBF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#023859] text-white flex items-center justify-center shadow-md shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#A7EBF2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-black text-[#011C40] tracking-tight truncate">{exercise.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#A7EBF2]/60 text-[#023859] text-[9px] sm:text-[10px] font-black uppercase shrink-0">
                  {exercise.equipment}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold uppercase shrink-0 border border-emerald-300">
                  US Standard 🇺🇸
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#26658C] font-medium truncate">
                Primary: <strong className="text-[#011C40]">{exercise.primaryMuscle}</strong> 
                {bioData.secondaryMuscles?.length > 0 && (
                  <span className="text-slate-500 font-normal"> • Secondary: {bioData.secondaryMuscles.join(', ')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
            {/* Real-Time Equipment Mode Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-full border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleEquipmentModeChange('dumbbell')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  equipmentMode === 'dumbbell'
                    ? 'bg-[#023859] text-white shadow-xs'
                    : 'text-[#26658C] hover:text-[#011C40]'
                }`}
                title="View with Dumbbells in hands"
              >
                <DumbbellIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Dumbbell</span>
              </button>

              <button
                type="button"
                onClick={() => handleEquipmentModeChange('barbell')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  equipmentMode === 'barbell'
                    ? 'bg-[#023859] text-white shadow-xs'
                    : 'text-[#26658C] hover:text-[#011C40]'
                }`}
                title="View with Rod Weight (Barbell with Olympic plates)"
              >
                <span>🏋️ Rod<span className="hidden xs:inline"> (Barbell)</span></span>
              </button>

              {['cable', 'machine', 'bodyweight'].includes(defaultMode) && (
                <button
                  type="button"
                  onClick={() => handleEquipmentModeChange(defaultMode)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                    equipmentMode === defaultMode
                      ? 'bg-[#023859] text-white shadow-xs'
                      : 'text-[#26658C] hover:text-[#011C40]'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span className="capitalize">{defaultMode}</span>
                </button>
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#011C40] flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (3D Viewport Hero on Left, Personal Trainer Guide on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 p-3 sm:p-6">
          
          {/* 3D WebGL Viewport Container — THE HERO (Generously sized for mobile & desktop) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full h-[380px] xs:h-[420px] sm:h-auto sm:aspect-16/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#161922] border border-[#54ACBF]/50 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
            >
              {/* Three.js Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block touch-none" />

              {/* Loading Indicator */}
              {modelLoading && (
                <div className="absolute inset-0 bg-[#161922]/95 flex flex-col items-center justify-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full border-2 border-[#54ACBF] border-t-transparent animate-spin" />
                  <span className="text-xs font-extrabold text-[#A7EBF2]">Calibrating Anatomical Engine...</span>
                </div>
              )}

              {/* Top-Left: Form Mode Toggle Pill (Correct Form vs Common Mistake) */}
              <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex items-center gap-1 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-[#12151c]/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
                <button
                  type="button"
                  onClick={() => setFormMode('correct')}
                  className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    !isMistake 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[3]" />
                  <span>Correct<span className="hidden xs:inline"> Form</span></span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormMode('mistake')}
                  className={`px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    isMistake 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                  <span>Mistake<span className="hidden xs:inline"> (Avoid)</span></span>
                </button>
              </div>

              {/* Live Biomechanical Laser Joint Angle Readout */}
              {showBiomechanics && (
                <div className="absolute top-11 sm:top-14 left-2.5 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#12151c]/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono font-extrabold flex items-center gap-1.5 sm:gap-2 border border-slate-700 pointer-events-none shadow-lg z-10">
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                    isMistake 
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                      : (currentPhase === 'concentric' ? 'bg-[#ff5722] shadow-[0_0_8px_#ff5722]' : 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]')
                  }`} />
                  <span className="text-slate-300">{bioData.jointAngle?.name || 'Joint Angle'}:</span>
                  <span className={`font-black ${
                    isMistake 
                      ? 'text-rose-400' 
                      : (currentPhase === 'concentric' ? 'text-[#ff7828]' : 'text-[#4ade80]')
                  }`}>
                    {liveJointAngle}°
                  </span>
                  <span className="hidden sm:inline text-[9px] uppercase tracking-wider text-slate-400">
                    ({isMistake ? 'FAULTY PATH' : (currentPhase === 'concentric' ? 'PEAK SQUEEZE' : 'OPTIMAL STRETCH')})
                  </span>
                </div>
              )}

              {/* Top-Right Rep Counter & Phase Badge */}
              <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1 sm:gap-2 pointer-events-none z-10">
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#12151c]/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono font-extrabold border border-slate-700">
                  Rep #{repCount}
                </span>
                <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  isMistake
                    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                    : (currentPhase === 'concentric' 
                        ? 'bg-[#ff5722] text-white shadow-[0_0_12px_rgba(255,87,34,0.6)]' 
                        : 'bg-[#22c55e] text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.4)]')
                }`}>
                  <span className="xs:hidden">
                    {isMistake ? 'Mistake ⚠️' : (currentPhase === 'concentric' ? 'Drive ⚡' : '3s 🛡️')}
                  </span>
                  <span className="hidden xs:inline">
                    {isMistake ? '⚠️ Mistake Active' : (currentPhase === 'concentric' ? 'Drive Up ⚡' : 'Controlled 3s 🛡️')}
                  </span>
                </span>
              </div>

              {/* Floating 3D Anatomical Contextual Badges (Directly Anchored to Bones) */}
              {projectedBadges.map((badge, idx) => (
                badge.isVisible && (
                  <div
                    key={badge.id}
                    style={{ left: `${badge.x}%`, top: `${badge.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold whitespace-nowrap shadow-xl pointer-events-none backdrop-blur-md transition-all duration-75 flex items-center gap-1 sm:gap-1.5 max-w-[160px] sm:max-w-none ${
                      idx > 0 ? 'hidden sm:flex' : 'flex'
                    } ${
                      badge.color === 'emerald'
                        ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-rose-950/90 text-rose-200 border border-rose-500/80 shadow-[0_0_14px_rgba(244,63,94,0.4)] animate-bounce'
                    }`}
                  >
                    <span className="truncate">{badge.text}</span>
                  </div>
                )
              ))}

              {/* Bottom Dock: Controls Bar */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#12151c]/90 backdrop-blur-md border border-slate-700 text-xs z-10">
                
                {/* Camera View Switcher */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-[10px] font-bold text-slate-400 hidden sm:inline mr-1">View:</span>
                  <button
                    onClick={() => setCameraAnglePreset('side')}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'side' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Side
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('threeQuarter')}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'threeQuarter' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    3/4
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('front')}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'front' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Front
                  </button>
                </div>

                {/* Biomechanics Toggle */}
                <button
                  type="button"
                  onClick={() => setShowBiomechanics(!showBiomechanics)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    showBiomechanics 
                      ? 'bg-slate-700 text-emerald-400 border border-emerald-500/50' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Toggle Biomechanical Trajectories & Angle Vectors"
                >
                  <Activity className="w-3 h-3" />
                  <span className="hidden md:inline">Biomechanics</span>
                  <span className="inline md:hidden text-[9px]">Bio</span>
                </button>

                {/* Playback Controls & Speed */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* Speed Selector */}
                  <div className="flex items-center bg-slate-800 rounded-lg sm:rounded-xl p-0.5 border border-slate-700">
                    {[0.5, 1.0, 1.25].map(s => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-extrabold transition-all cursor-pointer ${
                          playbackSpeed === s ? 'bg-[#54ACBF] text-[#011C40]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleResetPlayback}
                    className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Reset Rep Counter"
                  >
                    <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-[#54ACBF] text-[#011C40] hover:bg-white transition-all cursor-pointer shadow-sm"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-[#011C40]" /> : <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-[#011C40]" />}
                  </button>
                </div>

              </div>

            </div>

            {/* AI Real-Time Feedback Strip Directly Below 3D Viewport */}
            <div className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-2.5 sm:gap-3 ${
              isMistake
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isMistake ? 'bg-rose-600 text-white' : 'bg-[#023859] text-[#A7EBF2]'
              }`}>
                {isMistake ? <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isMistake ? 'text-rose-700' : 'text-[#023859]'}`}>
                    {isMistake ? 'Form Error Detected' : 'Nouriq AI Biomechanical Cue'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Tempo: {bioData.correctForm.tempo || '2s-1s-3s'}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed mt-0.5">
                  {isMistake ? bioData.commonMistake.aiCoaching : bioData.correctForm.aiCoaching}
                </p>
              </div>
            </div>

          </div>

          {/* Masterclass Form Coaching & Sports Science Guide on Right Column */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Interactive Mind-Muscle Connection Cues (Click to Highlight Anatomy) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-black text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#023859]" /> AI Mind-Muscle Focus
              </span>
              <div className="space-y-1.5">
                {(bioData.aiPrompts || []).map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => setSelectedAiTip(selectedAiTip === prompt.id ? null : prompt.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                      selectedAiTip === prompt.id
                        ? 'bg-[#023859] text-white border-[#023859] shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-[#011C40] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span>{prompt.text}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedAiTip === prompt.id ? 'rotate-90 text-[#A7EBF2]' : 'text-slate-400'}`} />
                    </div>
                    {selectedAiTip === prompt.id && (
                      <p className="text-[11px] text-[#A7EBF2] font-medium mt-1 leading-normal">
                        {prompt.cue}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Breathing & Intra-Abdominal Pressure Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#A7EBF2]/40 to-[#E0F7FA]/70 border border-[#54ACBF]/50 space-y-1.5">
              <span className="text-[11px] font-black text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#023859]" /> Breathing & Core Bracing
              </span>
              <p className="text-xs text-[#26658C] font-semibold leading-relaxed">
                {exercise.breathingCue || 'Inhale into belly & brace core at stretch; exhale past sticking point on concentric drive.'}
              </p>
            </div>

            {/* US-Standard Setup Rules */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-extrabold text-[#011C40] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> US-Standard Setup Rules
              </h4>
              <ul className="space-y-1.5 text-[11px] text-[#26658C] font-medium">
                {(exercise.setupSteps || [
                  'Establish a rock-solid athletic base with feet planted firmly.',
                  'Lock scapulae and brace abdominal wall 360 degrees.',
                  'Control the eccentric lowering phase for 2 to 3 seconds.'
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#023859]/10 text-[#023859] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close / Ready to Lift Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Got It — Ready to Lift</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

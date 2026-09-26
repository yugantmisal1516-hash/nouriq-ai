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

  if (eq.includes('dumbbell') || name.includes('dumbbell') || id.includes('dumbbell') || id === 'romanian-deadlift' || id === 'one-arm-dumbbell-row') {
    return 'dumbbell';
  }
  if (eq.includes('barbell') || name.includes('barbell') || id.includes('barbell') || id === 'barbell-bench-press' || id === 'barbell-back-squat' || id === 'barbell-deadlift') {
    return 'barbell'; // Rod Weight
  }
  if (eq.includes('cable') || name.includes('cable') || id.includes('cable') || id === 'lat-pulldown' || id === 'face-pull' || id.includes('tricep-pushdown') || id === 'cable-chest-fly') {
    return 'cable';
  }
  if (eq.includes('machine') || name.includes('machine') || id.includes('machine') || id === 'leg-press' || id === 'leg-extension' || id === 'seated-leg-curl') {
    return 'machine';
  }
  if (eq.includes('bodyweight') || name.includes('hanging') || id.includes('hanging')) {
    return 'bodyweight';
  }
  return 'barbell';
};

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

  // HIGH-PRECISION BIOMECHANICAL KINEMATICS & LASER VECTOR TRACKING
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

    // Reset bench transform
    if (eq.benchGroup) {
      eq.benchGroup.position.set(0, 0, 0);
      eq.benchGroup.rotation.set(0, 0, 0);
    }

    // Kinematic joint movements
    switch (type) {
      // 1. ONE-ARM DUMBBELL ROW
      case 'one-arm-row': {
        model.position.set(0, 0.82, -0.1);
        
        if (isMistake) {
          // COMMON MISTAKE: Severe torso twist & jerking momentum
          if (b('spine001')) {
            b('spine001').rotateX(0.55);
            b('spine001').rotateZ(t * 0.42); // Over-rotates upward to heave weight
          }
          if (b('upper_armR')) b('upper_armR').rotateX(1.1);
          if (b('forearmR')) b('forearmR').rotateX(0.25);

          // Working arm flares out, cutting range of motion
          if (b('upper_armL')) {
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.35, -0.15, t));
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.15, -0.65, t)); // Flared elbow
          }
          if (b('forearmL')) {
            b('forearmL').rotateX(THREE.MathUtils.lerp(0.2, 1.1, t)); // Cut ROM
          }
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
          if (b('forearmL')) {
            b('forearmL').rotateX(THREE.MathUtils.lerp(0.15, 1.55, t));
          }
        }

        if (eq.benchGroup) eq.benchGroup.position.set(-0.25, 0.05, 0.45);
        break;
      }

      // 2. CABLE ROPE TRICEP PUSHDOWN
      case 'tricep-pushdown': {
        model.position.set(0, 0.95, 0);

        if (isMistake) {
          // Torso swings forward & back, elbows flare wide
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(0.1, 0.45, t)); // Bouncing
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.2, -0.6, t)); // Flaring
            b('upper_armL').rotateX(THREE.MathUtils.lerp(0.1, 0.45, t));
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(0.2, 0.6, t));
            b('upper_armR').rotateX(THREE.MathUtils.lerp(0.1, 0.45, t));
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.4, 0.55, t)); // Incomplete lockout
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.4, 0.55, t));
        } else {
          if (b('spine001')) b('spine001').rotateX(0.20); // 10° athletic lean
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(-0.20);
            b('upper_armL').rotateX(0.15);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(0.20);
            b('upper_armR').rotateX(0.15);
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.65, 0.12, t)); // Full lockout
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.65, 0.12, t));
        }
        break;
      }

      // 3. BARBELL BENCH PRESS
      case 'bench-press': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        model.position.set(0, 0.49, 0.2);

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

        if (eq.benchGroup) eq.benchGroup.position.set(0, -0.15, 0);
        break;
      }

      // 4. SQUAT
      case 'squat': {
        const squatDepth = t * (isMistake ? 0.22 : 0.40);
        model.position.set(0, 0.95 - squatDepth, -t * (isMistake ? 0.35 : 0.20));

        if (isMistake) {
          // Knees cave inward (valgus collapse), excessive forward torso pitch
          if (b('spine001')) b('spine001').rotateX(t * 0.75); // Excessive torso lean
          if (b('thighL')) {
            b('thighL').rotateX(-t * 0.9);
            b('thighL').rotateZ(-t * 0.35); // Knee cave in
          }
          if (b('thighR')) {
            b('thighR').rotateX(-t * 0.9);
            b('thighR').rotateZ(t * 0.35); // Knee cave in
          }
        } else {
          // Full parallel depth, knees track over toes
          if (b('spine001')) b('spine001').rotateX(t * 0.32);
          if (b('thighL')) {
            b('thighL').rotateX(-t * 1.3);
            b('thighL').rotateZ(t * 0.12); // Pushing knees out
          }
          if (b('thighR')) {
            b('thighR').rotateX(-t * 1.3);
            b('thighR').rotateZ(-t * 0.12);
          }
          if (b('shinL')) b('shinL').rotateX(t * 1.3);
          if (b('shinR')) b('shinR').rotateX(t * 1.3);
        }

        if (b('upper_armL')) {
          b('upper_armL').rotateZ(0.9);
          b('upper_armL').rotateX(-0.35);
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(-0.9);
          b('upper_armR').rotateX(-0.35);
        }
        if (b('forearmL')) b('forearmL').rotateX(1.3);
        if (b('forearmR')) b('forearmR').rotateX(1.3);
        break;
      }

      // 5. INCLINE BICEP CURL
      case 'bicep-curl': {
        if (isMistake) {
          // Elbows swing forward to cheat
          if (b('upper_armL')) b('upper_armL').rotateX(t * 0.55);
          if (b('upper_armR')) b('upper_armR').rotateX(t * 0.55);
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.3, 1.4, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.3, 1.4, t));
        } else {
          if (b('upper_armL')) b('upper_armL').rotateZ(-0.25);
          if (b('upper_armR')) b('upper_armR').rotateZ(0.25);
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));
        }
        break;
      }

      // 6. LAT PULLDOWN
      case 'lat-pulldown': {
        model.position.set(0, 0.55, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('shinL')) b('shinL').rotateX(1.5);
        if (b('shinR')) b('shinR').rotateX(1.5);

        if (isMistake) {
          // 45° torso recline
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.2, -0.75, t));
          if (b('upper_armL')) b('upper_armL').rotateZ(THREE.MathUtils.lerp(2.2, 0.8, t));
          if (b('upper_armR')) b('upper_armR').rotateZ(THREE.MathUtils.lerp(-2.2, -0.8, t));
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.2, 1.2, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.2, 1.2, t));
        } else {
          if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.12, -0.22, t));
          if (b('upper_armL')) {
            b('upper_armL').rotateZ(THREE.MathUtils.lerp(2.5, 0.5, t));
            b('upper_armL').rotateX(t * 0.3);
          }
          if (b('upper_armR')) {
            b('upper_armR').rotateZ(THREE.MathUtils.lerp(-2.5, -0.5, t));
            b('upper_armR').rotateX(t * 0.3);
          }
          if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.1, 1.6, t));
          if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.1, 1.6, t));
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

    if (b('handL')) b('handL').getWorldPosition(handLPos);
    if (b('handR')) b('handR').getWorldPosition(handRPos);
    if (b('forearmL')) b('forearmL').getWorldPosition(elbowLPos);
    if (b('shoulderL')) b('shoulderL').getWorldPosition(shoulderLPos);
    if (b('spine004')) b('spine004').getWorldPosition(trapsPos);
    if (b('spine002')) b('spine002').getWorldPosition(latPos);
    if (b('thighL')) b('thighL').getWorldPosition(hipLPos);
    if (b('shinL')) b('shinL').getWorldPosition(kneeLPos);
    if (b('footL')) b('footL').getWorldPosition(ankleLPos);

    // -------------------------------------------------------------
    // DYNAMIC BIOMECHANICAL LASER VECTOR ANGLE TRACKING
    // -------------------------------------------------------------
    if (laser && laser.laserGroup) {
      laser.laserGroup.visible = showBiomechanics;

      const isLegExercise = ['squat', 'deadlift', 'leg-curl', 'calf-raise'].includes(type);
      const pA = isLegExercise ? hipLPos : shoulderLPos;
      const pB = isLegExercise ? kneeLPos : elbowLPos;
      const pC = isLegExercise ? ankleLPos : handLPos;

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

      // Color Transition: Green for correct stretch, Hot Orange for squeeze, Crimson Red for mistake
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

      if (trajectoryPointsRef.current.length < 30) {
        trajectoryPointsRef.current.push(handLPos.clone());
      } else {
        trajectoryPointsRef.current.shift();
        trajectoryPointsRef.current.push(handLPos.clone());
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

        // Secondary: rear deltoid
        muscles.secondaryPatch.position.set(shoulderLPos.x + 0.03, shoulderLPos.y - 0.02, shoulderLPos.z - 0.04);
        muscles.secondaryPatch.scale.set(0.05, 0.07, 0.05);
      } else if (type === 'bicep-curl') {
        const bicepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.5);
        muscles.primaryPatch.position.set(bicepPos.x + 0.03, bicepPos.y, bicepPos.z + 0.05);
        muscles.primaryPatch.scale.set(0.06, 0.10, 0.06);

        // Secondary: brachioradialis / forearm
        muscles.secondaryPatch.position.set(elbowLPos.x + 0.02, elbowLPos.y - 0.08, elbowLPos.z + 0.03);
        muscles.secondaryPatch.scale.set(0.05, 0.08, 0.05);
      } else if (type === 'one-arm-row' || type === 'lat-pulldown') {
        muscles.primaryPatch.position.set(latPos.x + 0.12, latPos.y - 0.02, latPos.z - 0.06);
        muscles.primaryPatch.scale.set(0.09, 0.14, 0.07);

        // Secondary: biceps & rear delt
        muscles.secondaryPatch.position.set(shoulderLPos.x + 0.05, shoulderLPos.y - 0.03, shoulderLPos.z - 0.06);
        muscles.secondaryPatch.scale.set(0.06, 0.08, 0.06);
      } else if (type === 'bench-press') {
        muscles.primaryPatch.position.set(latPos.x + 0.08, latPos.y + 0.05, latPos.z + 0.14);
        muscles.primaryPatch.scale.set(0.12, 0.10, 0.06);

        // Secondary: triceps
        const tricepPos = new THREE.Vector3().lerpVectors(shoulderLPos, elbowLPos, 0.5);
        muscles.secondaryPatch.position.set(tricepPos.x + 0.05, tricepPos.y, tricepPos.z - 0.04);
        muscles.secondaryPatch.scale.set(0.05, 0.09, 0.05);
      } else if (type === 'squat') {
        const quadPos = new THREE.Vector3().lerpVectors(hipLPos, kneeLPos, 0.5);
        muscles.primaryPatch.position.set(quadPos.x + 0.06, quadPos.y, quadPos.z + 0.06);
        muscles.primaryPatch.scale.set(0.09, 0.14, 0.08);

        // Secondary: glutes
        muscles.secondaryPatch.position.set(hipLPos.x + 0.08, hipLPos.y - 0.04, hipLPos.z - 0.08);
        muscles.secondaryPatch.scale.set(0.08, 0.10, 0.08);
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
      const rect = containerRef.current.getBoundingClientRect();

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

        const isVisible = screenPos.z < 1.0 && x >= 5 && x <= 95 && y >= 5 && y <= 95;

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
    if (eq.cableRope) eq.cableRope.visible = false;
    if (eq.pullUpBar) eq.pullUpBar.visible = false;

    // Bench visibility
    const isBenchEx = ['bench-press', 'incline-press', 'one-arm-row'].includes(type);
    if (eq.benchGroup) eq.benchGroup.visible = isBenchEx;

    if (activeMode === 'dumbbell') {
      if (type === 'one-arm-row') {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
        }
      } else {
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.visible = true;
          eq.dumbbellR.position.copy(handRPos);
        }
      }
    } else if (activeMode === 'barbell') {
      if (eq.barbell) {
        eq.barbell.visible = true;
        if (type === 'squat' || type === 'calf-raise') {
          eq.barbell.position.set(0, trapsPos.y, trapsPos.z - 0.08);
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
        if (eq.latBar) {
          eq.latBar.visible = true;
          const barCenterY = (handLPos.y + handRPos.y) / 2;
          const barCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.latBar.position.set(0, barCenterY, barCenterZ);
        }
      } else {
        if (eq.cableRope) {
          eq.cableRope.visible = true;
          const ropeCenterY = (handLPos.y + handRPos.y) / 2 + 0.15;
          const ropeCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.cableRope.position.set(0, ropeCenterY, ropeCenterZ);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#011C40]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="ios-glass rounded-[32px] max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-[#54ACBF]/50 bg-white/95 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#54ACBF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#023859] text-white flex items-center justify-center shadow-md shrink-0">
              <Eye className="w-5 h-5 text-[#A7EBF2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#011C40] tracking-tight truncate">{exercise.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A7EBF2]/60 text-[#023859] text-[10px] font-black uppercase shrink-0">
                  {exercise.equipment}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0 border border-emerald-300">
                  US Standard 🇺🇸
                </span>
              </div>
              <p className="text-xs text-[#26658C] font-medium truncate">
                Primary: <strong className="text-[#011C40]">{exercise.primaryMuscle}</strong> 
                {bioData.secondaryMuscles?.length > 0 && (
                  <span className="text-slate-500 font-normal"> • Secondary: {bioData.secondaryMuscles.join(', ')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Real-Time Equipment Mode Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleEquipmentModeChange('dumbbell')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  equipmentMode === 'dumbbell'
                    ? 'bg-[#023859] text-white shadow-xs'
                    : 'text-[#26658C] hover:text-[#011C40]'
                }`}
                title="View with Dumbbells in hands"
              >
                <DumbbellIcon className="w-3.5 h-3.5" />
                <span>Dumbbell</span>
              </button>

              <button
                type="button"
                onClick={() => handleEquipmentModeChange('barbell')}
                className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  equipmentMode === 'barbell'
                    ? 'bg-[#023859] text-white shadow-xs'
                    : 'text-[#26658C] hover:text-[#011C40]'
                }`}
                title="View with Rod Weight (Barbell with Olympic plates)"
              >
                <span>🏋️ Rod (Barbell)</span>
              </button>

              {['cable', 'machine', 'bodyweight'].includes(defaultMode) && (
                <button
                  type="button"
                  onClick={() => handleEquipmentModeChange(defaultMode)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
          
          {/* 3D WebGL Viewport Container — THE HERO (Fills 65-80% with Large Mannequin) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden shadow-2xl bg-[#161922] border border-[#54ACBF]/50 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
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
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 p-1 rounded-2xl bg-[#12151c]/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
                <button
                  type="button"
                  onClick={() => setFormMode('correct')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    !isMistake 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Correct Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormMode('mistake')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    isMistake 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Common Mistake</span>
                </button>
              </div>

              {/* Live Biomechanical Laser Joint Angle Readout */}
              {showBiomechanics && (
                <div className="absolute top-14 left-3 px-3 py-1 rounded-full bg-[#12151c]/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold flex items-center gap-2 border border-slate-700 pointer-events-none shadow-lg">
                  <span className={`w-2.5 h-2.5 rounded-full ${
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
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">
                    ({isMistake ? 'FAULTY PATH' : (currentPhase === 'concentric' ? 'PEAK SQUEEZE' : 'OPTIMAL STRETCH')})
                  </span>
                </div>
              )}

              {/* Top-Right Rep Counter & Phase Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-[#12151c]/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold border border-slate-700">
                  Rep #{repCount}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  isMistake
                    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                    : (currentPhase === 'concentric' 
                        ? 'bg-[#ff5722] text-white shadow-[0_0_12px_rgba(255,87,34,0.6)]' 
                        : 'bg-[#22c55e] text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.4)]')
                }`}>
                  {isMistake ? '⚠️ Mistake Active' : (currentPhase === 'concentric' ? 'Drive Up ⚡' : 'Controlled 3s 🛡️')}
                </span>
              </div>

              {/* Floating 3D Anatomical Contextual Badges (Directly Anchored to Bones) */}
              {projectedBadges.map((badge) => (
                badge.isVisible && (
                  <div
                    key={badge.id}
                    style={{ left: `${badge.x}%`, top: `${badge.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-xl pointer-events-none backdrop-blur-md transition-all duration-75 flex items-center gap-1.5 ${
                      badge.color === 'emerald'
                        ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-rose-950/90 text-rose-200 border border-rose-500/80 shadow-[0_0_14px_rgba(244,63,94,0.4)] animate-bounce'
                    }`}
                  >
                    <span>{badge.text}</span>
                  </div>
                )
              ))}

              {/* Bottom Dock: Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-2xl bg-[#12151c]/90 backdrop-blur-md border border-slate-700 text-xs">
                
                {/* Camera View Switcher */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 hidden sm:inline mr-1">View:</span>
                  <button
                    onClick={() => setCameraAnglePreset('side')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'side' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Side
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('threeQuarter')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'threeQuarter' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    3/4
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('front')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    showBiomechanics 
                      ? 'bg-slate-700 text-emerald-400 border border-emerald-500/50' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Toggle Biomechanical Trajectories & Angle Vectors"
                >
                  <Activity className="w-3 h-3" />
                  <span className="hidden sm:inline">Biomechanics</span>
                </button>

                {/* Playback Controls & Speed */}
                <div className="flex items-center gap-1.5">
                  {/* Speed Selector */}
                  <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                    {[0.5, 1.0, 1.25].map(s => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-1.5 py-0.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                          playbackSpeed === s ? 'bg-[#54ACBF] text-[#011C40]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleResetPlayback}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="Reset Rep Counter"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-xl bg-[#54ACBF] text-[#011C40] hover:bg-white transition-all cursor-pointer shadow-sm"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-[#011C40]" /> : <Play className="w-3.5 h-3.5 fill-[#011C40]" />}
                  </button>
                </div>

              </div>

            </div>

            {/* AI Real-Time Feedback Strip Directly Below 3D Viewport */}
            <div className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
              isMistake
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isMistake ? 'bg-rose-600 text-white' : 'bg-[#023859] text-[#A7EBF2]'
              }`}>
                {isMistake ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isMistake ? 'text-rose-700' : 'text-[#023859]'}`}>
                    {isMistake ? 'Form Error Detected' : 'Nouriq AI Biomechanical Cue'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">• Tempo: {bioData.correctForm.tempo || '2s-1s-3s'}</span>
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

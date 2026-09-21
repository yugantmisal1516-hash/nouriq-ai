import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  X, 
  Play, 
  Pause, 
  Compass, 
  Eye, 
  AlertTriangle, 
  Wind, 
  Sparkles, 
  Check, 
  Activity,
  Maximize2
} from 'lucide-react';

export default function Workout3DVisualizerModal({ isOpen, exercise, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('concentric');
  const [repCount, setRepCount] = useState(1);
  const [activeAngle, setActiveAngle] = useState('iso'); // 'iso', 'front', 'side', 'top'
  const [modelLoading, setModelLoading] = useState(true);

  // Three.js State Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameId = useRef(null);
  const animTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 2.8, radius: 3.2 });
  const repTriggeredRef = useRef(false);

  // Loaded bones & equipment mesh references
  const bonesRef = useRef({});
  const initialQuatsRef = useRef({});
  const initialPositionsRef = useRef({});
  const modelRootRef = useRef(null);
  const equipmentRefs = useRef({});

  // Reset playback when exercise opens or changes
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setRepCount(1);
      animTimeRef.current = 0;
      repTriggeredRef.current = false;
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 2.8, radius: 3.2 };
      setActiveAngle('iso');
    }
  }, [isOpen, exercise?.id]);

  // Main Three.js Scene Setup & Lifecyle
  useEffect(() => {
    if (!isOpen || !exercise || !canvasRef.current) return;

    setModelLoading(true);

    const container = containerRef.current;
    const width = container ? container.clientWidth : 480;
    const height = container ? container.clientHeight : 440;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x011124); // Studio Dark Navy Background
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

    // 3. THREE-POINT STUDIO LIGHTING
    const ambientLight = new THREE.AmbientLight(0xdcf8fa, 0.85);
    scene.add(ambientLight);

    // Key Light (Sculpted anatomical shadows for pectorals, deltoids, and abs)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill Light (Soft cool cyan from left)
    const fillLight = new THREE.DirectionalLight(0xa7ebf2, 0.95);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // Back / Rim Light (Edge rim lighting for lats, deltoids, and spine)
    const rimLight = new THREE.DirectionalLight(0x54acbf, 1.4);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. STUDIO GYM FLOOR & PEDESTAL
    const floorPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.5, 0.06, 40),
      new THREE.MeshStandardMaterial({ color: 0x011c40, roughness: 0.45, metalness: 0.25 })
    );
    floorPedestal.position.y = -0.03;
    floorPedestal.receiveShadow = true;
    scene.add(floorPedestal);

    const gridHelper = new THREE.GridHelper(5.2, 16, 0x54acbf, 0x023859);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // 5. GYM EQUIPMENT: BARBELL, DUMBBELLS, OLYMPIC BENCH
    const equipment = createGymEquipment(scene, exercise);
    equipmentRefs.current = equipment;

    // 6. LOAD GLTF ATHLETIC MALE BASE MESH
    const loader = new GLTFLoader();
    loader.load(
      '/models/male_base_mesh.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRootRef.current = model;

        // Model orientation: rotate to face +Z (towards default camera) and place feet on floor
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
            // Studio gray clay shading matching reference image
            if (child.material) {
              child.material.color.set(0x9fb0c2);
              child.material.roughness = 0.35;
              child.material.metalness = 0.15;
              child.material.needsUpdate = true;
            }
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

    // 7. RESIZE OBSERVER (Ensures crisp rendering on mobile & desktop)
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

    // 8. HIGH-PRECISION KINEMATICS ANIMATION LOOP
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && modelRootRef.current) {
        const speed = isSlowMo ? 1.0 : 1.9;
        animTimeRef.current += delta * speed;

        // Smooth cosine ease-in-out cycle (0 to 1 to 0)
        const t = (1 - Math.cos(animTimeRef.current)) / 2;
        const isDriving = Math.sin(animTimeRef.current) > 0;

        setCurrentPhase(isDriving ? 'concentric' : 'eccentric');

        // Rep counter: increment once when cycle completes turnaround at t ~ 0
        if (t < 0.04) {
          if (!repTriggeredRef.current) {
            setRepCount(prev => (prev >= 12 ? 1 : prev + 1));
            repTriggeredRef.current = true;
          }
        } else {
          repTriggeredRef.current = false;
        }

        // Apply high-precision biomechanics
        applyHighPrecisionKinematics(exercise.kinematicType || 'squat', t, isDriving);
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
  }, [isOpen, exercise?.id, isPlaying, isSlowMo]);

  // UPDATE CAMERA FROM SPHERICAL ORBIT COORDINATES
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0.95, 0);
  };

  // CREATE GYM EQUIPMENT
  const createGymEquipment = (scene, ex) => {
    const eq = (ex.equipment || '').toLowerCase();
    const type = ex.kinematicType || 'squat';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x2b3748, roughness: 0.35, metalness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x02253d, roughness: 0.55, metalness: 0.1 });

    // 1. Olympic Barbell (2.2m with knurled shaft and standard 450mm 20kg bumper plates)
    const barbell = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.1, 16), chromeMat);
    shaft.rotation.z = Math.PI / 2;
    barbell.add(shaft);

    const plateL = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.05, 32), steelMat);
    plateL.rotation.z = Math.PI / 2;
    plateL.position.x = 0.75;
    barbell.add(plateL);

    const collarL = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), chromeMat);
    collarL.rotation.z = Math.PI / 2;
    collarL.position.x = 0.68;
    barbell.add(collarL);

    const plateR = plateL.clone();
    plateR.position.x = -0.75;
    barbell.add(plateR);

    const collarR = collarL.clone();
    collarR.position.x = -0.68;
    barbell.add(collarR);

    barbell.castShadow = true;
    scene.add(barbell);

    // 2. Commercial Hex Dumbbells
    const dumbbellL = new THREE.Group();
    const dbHandleL = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 14), chromeMat);
    dbHandleL.rotation.z = Math.PI / 2;
    dumbbellL.add(dbHandleL);
    const dbHeadL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), steelMat);
    dbHeadL1.rotation.z = Math.PI / 2;
    dbHeadL1.position.x = 0.1;
    dumbbellL.add(dbHeadL1);
    const dbHeadL2 = dbHeadL1.clone();
    dbHeadL2.position.x = -0.1;
    dumbbellL.add(dbHeadL2);

    const dumbbellR = dumbbellL.clone();
    scene.add(dumbbellL);
    scene.add(dumbbellR);

    // 3. Olympic Flat / Incline Bench
    const benchGroup = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 1.25), leatherMat);
    pad.position.set(0, 0.45, 0);
    pad.receiveShadow = true;
    benchGroup.add(pad);
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), steelMat);
    leg1.position.set(0, 0.22, 0.5);
    benchGroup.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.set(0, 0.22, -0.5);
    benchGroup.add(leg2);

    scene.add(benchGroup);

    // Visibility configuration
    const isBench = type === 'bench-press' || type === 'incline-press';
    const isBarbell = type === 'squat' || type === 'bench-press' || type === 'deadlift' || type === 'lat-pulldown' || type === 'overhead-press' || type === 'calf-raise' || type === 'hanging-leg-raise';
    const isDumbbell = type === 'incline-press' || type === 'chest-fly' || type === 'lateral-raise' || type === 'face-pull' || type === 'bicep-curl' || type === 'tricep-pushdown' || type === 'seated-row';

    barbell.visible = isBarbell;
    dumbbellL.visible = isDumbbell;
    dumbbellR.visible = isDumbbell;
    benchGroup.visible = isBench;

    return { barbell, dumbbellL, dumbbellR, benchGroup };
  };

  // HIGH PRECISION BIOMECHANICAL KINEMATICS FOR ALL 16 EXERCISE TYPES
  const applyHighPrecisionKinematics = (type, t, isDriving) => {
    const bones = bonesRef.current;
    const initialQuats = initialQuatsRef.current;
    const initialPos = initialPositionsRef.current;
    const model = modelRootRef.current;
    const eq = equipmentRefs.current;

    if (!model || !bones.spine) return;

    // 1. Reset root orientation and height
    model.rotation.set(0, -Math.PI / 2, 0);
    model.position.set(0, 0.95, 0);

    // 2. Reset all bones to exact bind rest quaternions
    Object.keys(bones).forEach(name => {
      if (initialQuats[name]) {
        bones[name].quaternion.copy(initialQuats[name]);
      }
      if (initialPos[name]) {
        bones[name].position.copy(initialPos[name]);
      }
    });

    const b = (name) => bones[name] || bones[name.replace('.', '')];

    switch (type) {
      // 1. BARBELL SQUAT (NSCA Crease Below Knee, Mid-Foot Bar Path, Torso Brace)
      case 'squat': {
        const squatDepth = t * 0.38;
        model.position.set(0, 0.95 - squatDepth, -t * 0.20); // Sit back into hips
        if (b('spine001')) b('spine001').rotateX(t * 0.32);   // 18° rigid torso brace

        // Hips flex forward & knees flex backward
        if (b('thighL')) b('thighL').rotateX(-t * 1.25);
        if (b('thighR')) b('thighR').rotateX(-t * 1.25);
        if (b('shinL')) b('shinL').rotateX(t * 1.25);
        if (b('shinR')) b('shinR').rotateX(t * 1.25);

        // Hands grip barbell behind traps
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

        // Barbell locked across upper traps
        if (eq.barbell) {
          eq.barbell.position.set(0, 1.58 - squatDepth, -0.08 - t * 0.20);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 2. BARBELL FLAT BENCH PRESS (5-Point Contact, 45° Elbow Angle, Sternum-to-Eyes J-Curve)
      case 'bench-press': {
        // Lying horizontal on back on Olympic bench
        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        model.position.set(0, 0.49, 0.2);

        // Feet planted flat on floor for leg drive
        if (b('thighL')) b('thighL').rotateX(0.8);
        if (b('thighR')) b('thighR').rotateX(0.8);
        if (b('shinL')) b('shinL').rotateX(1.4);
        if (b('shinR')) b('shinR').rotateX(1.4);

        // Arm press motion: t=0 touches lower sternum, t=1 locks out over shoulder
        const pressProgress = t; // 0 = chest, 1 = lockout
        if (b('upper_armL')) {
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.7, 0.2, pressProgress));
          b('upper_armL').rotateX(THREE.MathUtils.lerp(0.6, 1.45, pressProgress));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.7, -0.2, pressProgress));
          b('upper_armR').rotateX(THREE.MathUtils.lerp(0.6, 1.45, pressProgress));
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.2, 0.15, pressProgress));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.2, 0.15, pressProgress));

        // J-curve bar path: from lower sternum to shoulder lockout
        if (eq.barbell) {
          const barY = THREE.MathUtils.lerp(0.87, 1.02, pressProgress);
          const barZ = THREE.MathUtils.lerp(-0.33, -0.44, pressProgress);
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 3. INCLINE DUMBBELL / BARBELL PRESS (30° Angle, Clavicular Head Focus)
      case 'incline-press': {
        if (eq.benchGroup) {
          eq.benchGroup.rotation.x = -Math.PI / 6;
          eq.benchGroup.position.set(0, 0.05, 0.1);
        }

        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 3);
        model.position.set(0, 0.55, 0.1);

        if (b('thighL')) b('thighL').rotateX(0.8);
        if (b('thighR')) b('thighR').rotateX(0.8);
        if (b('shinL')) b('shinL').rotateX(1.4);
        if (b('shinR')) b('shinR').rotateX(1.4);

        if (b('upper_armL')) {
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.65, 0.2, t));
          b('upper_armL').rotateX(THREE.MathUtils.lerp(0.6, 1.45, t));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.65, -0.2, t));
          b('upper_armR').rotateX(THREE.MathUtils.lerp(0.6, 1.45, t));
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.1, 0.15, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.1, 0.15, t));

        if (eq.dumbbellL) {
          eq.dumbbellL.position.set(THREE.MathUtils.lerp(0.32, 0.18, t), THREE.MathUtils.lerp(0.95, 1.25, t), THREE.MathUtils.lerp(-0.15, -0.35, t));
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.position.set(THREE.MathUtils.lerp(-0.32, -0.18, t), THREE.MathUtils.lerp(0.95, 1.25, t), THREE.MathUtils.lerp(-0.15, -0.35, t));
        }
        break;
      }

      // 4. CHEST FLY (Cable / Pec Deck - Horizontal Adduction Hugging Arc)
      case 'chest-fly': {
        if (b('forearmL')) b('forearmL').rotateX(0.3); // Fixed 15° elbow bend
        if (b('forearmR')) b('forearmR').rotateX(0.3);
        if (b('upper_armL')) {
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(1.1, 0.25, t));
          b('upper_armL').rotateX(THREE.MathUtils.lerp(-0.1, 1.1, t));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(-1.1, -0.25, t));
          b('upper_armR').rotateX(THREE.MathUtils.lerp(-0.1, 1.1, t));
        }

        if (eq.dumbbellL) {
          eq.dumbbellL.position.set(THREE.MathUtils.lerp(0.68, 0.15, t), 1.35, THREE.MathUtils.lerp(0.05, 0.42, t));
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.position.set(THREE.MathUtils.lerp(-0.68, -0.15, t), 1.35, THREE.MathUtils.lerp(0.05, 0.42, t));
        }
        break;
      }

      // 5. DEADLIFT / RDL (Posterior Chain Hinge, Bar Scraping Shins, Neutral Spine)
      case 'deadlift': {
        const hinge = (1 - t) * 0.85; // 0 = standing lockout, 1 = bottom shin position
        model.position.set(0, THREE.MathUtils.lerp(0.78, 0.95, t), THREE.MathUtils.lerp(-0.05, 0, t));

        if (b('spine001')) b('spine001').rotateX(hinge);
        if (b('thighL')) b('thighL').rotateX(-hinge * 0.7);
        if (b('thighR')) b('thighR').rotateX(-hinge * 0.7);
        if (b('shinL')) b('shinL').rotateX((1 - t) * 0.25);
        if (b('shinR')) b('shinR').rotateX((1 - t) * 0.25);

        // Arms hang vertical directly in front of shins
        if (b('upper_armL')) {
          b('upper_armL').rotateX((1 - t) * 0.40);
          b('upper_armL').rotateZ(-0.25);
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateX((1 - t) * 0.40);
          b('upper_armR').rotateZ(0.25);
        }

        // Barbell slides vertically along shins to hips
        if (eq.barbell) {
          const barY = THREE.MathUtils.lerp(0.48, 0.95, t);
          const barZ = THREE.MathUtils.lerp(0.17, 0.08, t);
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 6. LAT PULLDOWN (10° Thoracic Arch, Scapular Depression, Elbows Driven to Ribs)
      case 'lat-pulldown': {
        model.position.set(0, 0.55, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('shinL')) b('shinL').rotateX(1.5);
        if (b('shinR')) b('shinR').rotateX(1.5);

        // Thoracic arch
        if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.15, -0.25, t));

        // Pulling down: t=0 overhead, t=1 collarbone squeeze
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

        if (eq.barbell) {
          const barY = THREE.MathUtils.lerp(1.68, 1.08, t);
          const barZ = THREE.MathUtils.lerp(-0.20, 0.18, t);
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 7. SEATED CABLE / CHEST SUPPORTED ROW (Retraction & Elbow Drive into Lats)
      case 'seated-row': {
        model.position.set(0, 0.55, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('shinL')) b('shinL').rotateX(1.5);
        if (b('shinR')) b('shinR').rotateX(1.5);
        if (b('spine001')) b('spine001').rotateX(0.1);

        if (b('upper_armL')) {
          b('upper_armL').rotateX(THREE.MathUtils.lerp(1.1, -0.3, t));
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.2, -0.15, t));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateX(THREE.MathUtils.lerp(1.1, -0.3, t));
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(0.2, 0.15, t));
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.2, 1.5, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.2, 1.5, t));

        if (eq.dumbbellL) eq.dumbbellL.position.set(0.18, 0.95, THREE.MathUtils.lerp(0.55, 0.15, t));
        if (eq.dumbbellR) eq.dumbbellR.position.set(-0.18, 0.95, THREE.MathUtils.lerp(0.55, 0.15, t));
        break;
      }

      // 8. OVERHEAD SHOULDER PRESS (Scapular Plane, Head Through Window Lockout)
      case 'overhead-press': {
        if (b('upper_armL')) {
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.6, 2.5, t));
          b('upper_armL').rotateX(THREE.MathUtils.lerp(0.4, 0.05, t));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.6, -2.5, t));
          b('upper_armR').rotateX(THREE.MathUtils.lerp(0.4, 0.05, t));
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.6, 0.2, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.6, 0.2, t));

        if (eq.barbell) {
          const barY = THREE.MathUtils.lerp(1.45, 2.09, t);
          const barZ = THREE.MathUtils.lerp(0.12, 0.01, t);
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 9. DUMBBELL LATERAL RAISE (Scapular Plane 15°, Soft Elbows, Parallel Height)
      case 'lateral-raise': {
        if (b('upper_armL')) b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.1, 1.35, t));
        if (b('upper_armR')) b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.1, -1.35, t));
        if (b('forearmL')) b('forearmL').rotateX(0.2); // Soft 15° bend
        if (b('forearmR')) b('forearmR').rotateX(0.2);

        if (eq.dumbbellL) {
          eq.dumbbellL.position.set(THREE.MathUtils.lerp(0.32, 0.72, t), THREE.MathUtils.lerp(0.95, 1.73, t), 0);
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.position.set(THREE.MathUtils.lerp(-0.32, -0.72, t), THREE.MathUtils.lerp(0.95, 1.73, t), 0);
        }
        break;
      }

      // 10. FACE PULL (External Rotation, Rear Deltoids & Rhomboids)
      case 'face-pull': {
        if (b('upper_armL')) {
          b('upper_armL').rotateX(THREE.MathUtils.lerp(1.1, 0.2, t));
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.2, 1.35, t));
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateX(THREE.MathUtils.lerp(1.1, 0.2, t));
          b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.2, -1.35, t));
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.2, 1.7, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.2, 1.7, t));

        if (eq.dumbbellL) eq.dumbbellL.position.set(THREE.MathUtils.lerp(0.15, 0.38, t), THREE.MathUtils.lerp(1.45, 1.62, t), THREE.MathUtils.lerp(0.50, 0.10, t));
        if (eq.dumbbellR) eq.dumbbellR.position.set(THREE.MathUtils.lerp(-0.15, -0.38, t), THREE.MathUtils.lerp(1.45, 1.62, t), THREE.MathUtils.lerp(0.50, 0.10, t));
        break;
      }

      // 11. BICEP CURL (Upper Arms Pinned, Supinated Full Forearm Curl)
      case 'bicep-curl': {
        if (b('upper_armL')) b('upper_armL').rotateZ(-0.25);
        if (b('upper_armR')) b('upper_armR').rotateZ(0.25);
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));

        if (eq.dumbbellL) {
          eq.dumbbellL.position.set(THREE.MathUtils.lerp(0.35, 0.28, t), THREE.MathUtils.lerp(0.95, 1.30, t), THREE.MathUtils.lerp(0.05, 0.22, t));
        }
        if (eq.dumbbellR) {
          eq.dumbbellR.position.set(THREE.MathUtils.lerp(-0.35, -0.28, t), THREE.MathUtils.lerp(0.95, 1.30, t), THREE.MathUtils.lerp(0.05, 0.22, t));
        }
        break;
      }

      // 12. TRICEP PUSHDOWN (Elbows Fixed at Ribs, Full Forearm Lockout)
      case 'tricep-pushdown': {
        if (b('spine001')) b('spine001').rotateX(0.18);
        if (b('upper_armL')) {
          b('upper_armL').rotateZ(-0.25);
          b('upper_armL').rotateX(0.1);
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateZ(0.25);
          b('upper_armR').rotateX(0.1);
        }
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(1.6, 0.1, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(1.6, 0.1, t));

        if (eq.dumbbellL) eq.dumbbellL.position.set(0.18, THREE.MathUtils.lerp(1.25, 0.98, t), THREE.MathUtils.lerp(0.28, 0.12, t));
        if (eq.dumbbellR) eq.dumbbellR.position.set(-0.18, THREE.MathUtils.lerp(1.25, 0.98, t), THREE.MathUtils.lerp(0.28, 0.12, t));
        break;
      }

      // 13. LEG EXTENSION (Seated, Quad Isolation Extension)
      case 'leg-extension': {
        model.position.set(0, 0.65, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(1.5, 0.05, t));
        if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(1.5, 0.05, t));
        break;
      }

      // 14. LEG CURL (Seated / Lying Hamstring Curl)
      case 'leg-curl': {
        model.position.set(0, 0.65, 0);
        if (b('thighL')) b('thighL').rotateX(-1.5);
        if (b('thighR')) b('thighR').rotateX(-1.5);
        if (b('shinL')) b('shinL').rotateX(THREE.MathUtils.lerp(0.1, 1.6, t));
        if (b('shinR')) b('shinR').rotateX(THREE.MathUtils.lerp(0.1, 1.6, t));
        break;
      }

      // 15. STANDING CALF RAISE (Full Ankle Plantarflexion onto Metatarsals)
      case 'calf-raise': {
        model.position.set(0, 0.95 + t * 0.12, 0);
        if (b('footL')) b('footL').rotateX(t * 0.45);
        if (b('footR')) b('footR').rotateX(t * 0.45);
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

        if (eq.barbell) {
          eq.barbell.position.set(0, 1.58 + t * 0.12, -0.08);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 16. HANGING LEG RAISE (Core & Hip Flexor Elevation)
      case 'hanging-leg-raise': {
        model.position.set(0, 1.25, 0);
        if (b('upper_armL')) b('upper_armL').rotateZ(2.7);
        if (b('upper_armR')) b('upper_armR').rotateZ(-2.7);
        if (b('thighL')) b('thighL').rotateX(-t * 1.55);
        if (b('thighR')) b('thighR').rotateX(-t * 1.55);
        if (b('spine')) b('spine').rotateX(t * 0.35);

        if (eq.barbell) {
          eq.barbell.position.set(0, 2.15, 0);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      default: {
        // Fallback smooth athletic posture
        const breath = Math.sin(t * Math.PI) * 0.02;
        if (b('spine001')) b('spine001').rotateX(breath);
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

  // CAMERA ANGLE PRESETS
  const setCameraAnglePreset = (preset) => {
    setActiveAngle(preset);
    if (preset === 'front') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 3.1 };
    } else if (preset === 'side') {
      cameraAngleRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 3.1 };
    } else if (preset === 'top') {
      cameraAngleRef.current = { theta: 0, phi: 0.25, radius: 3.6 };
    } else {
      // 45° Isometric
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 2.8, radius: 3.2 };
    }
    updateCameraPosition();
  };

  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#011C40]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="ios-glass rounded-[32px] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#54ACBF]/50 bg-white/95 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#54ACBF]/30 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#023859] text-white flex items-center justify-center shadow-md shrink-0">
              <Eye className="w-5 h-5 text-[#A7EBF2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#011C40] truncate">{exercise.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A7EBF2]/60 text-[#023859] text-[10px] font-black uppercase shrink-0">
                  {exercise.equipment}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0 border border-emerald-300">
                  US Standard 🇺🇸
                </span>
              </div>
              <p className="text-xs text-[#26658C] font-medium truncate">
                Target: <strong className="text-[#011C40]">{exercise.primaryMuscle}</strong> • Athletic Male Base Mesh
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#011C40] flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body (3D Viewport on Left, Personal Trainer Guide on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
          
          {/* 3D WebGL Viewport Container */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden shadow-inner bg-[#011124] border border-[#54ACBF]/40 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
            >
              {/* Three.js Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block touch-none" />

              {/* Loading Indicator */}
              {modelLoading && (
                <div className="absolute inset-0 bg-[#011124]/90 flex flex-col items-center justify-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full border-2 border-[#54ACBF] border-t-transparent animate-spin" />
                  <span className="text-xs font-extrabold text-[#A7EBF2]">Calibrating Anatomical Model...</span>
                </div>
              )}

              {/* Drag Prompt Hint Overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#011C40]/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-[#54ACBF]/40 pointer-events-none">
                <Compass className="w-3 h-3 text-[#A7EBF2] animate-spin" style={{ animationDuration: '6s' }} />
                <span>360° Drag Orbit</span>
              </div>

              {/* Live Rep & Phase Counter */}
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-[#023859]/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold border border-[#54ACBF]/50">
                  Rep #{repCount}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  currentPhase === 'concentric' 
                    ? 'bg-emerald-400 text-slate-950 animate-pulse' 
                    : 'bg-[#54ACBF] text-slate-950'
                }`}>
                  {currentPhase === 'concentric' ? 'Drive Up ⚡' : 'Controlled 3s 🛡️'}
                </span>
              </div>

              {/* Camera Angle Presets Floating Dock */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2 py-1.5 rounded-2xl bg-[#011C40]/85 backdrop-blur-md border border-[#54ACBF]/40 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-cyan-200 hidden sm:inline mr-1">Angle:</span>
                  <button
                    onClick={() => setCameraAnglePreset('iso')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'iso' ? 'bg-[#54ACBF] text-[#011C40]' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    45° Iso
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('front')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'front' ? 'bg-[#54ACBF] text-[#011C40]' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('side')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'side' ? 'bg-[#54ACBF] text-[#011C40]' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Side Profile
                  </button>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSlowMo(!isSlowMo)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isSlowMo ? 'bg-amber-400 text-slate-950 font-black' : 'text-white/80 hover:bg-white/10'
                    }`}
                    title="Toggle Slow Motion"
                  >
                    {isSlowMo ? '0.5x Slow' : '1.0x Normal'}
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-xl bg-[#54ACBF] text-[#011C40] hover:bg-white transition-all cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-[#011C40]" /> : <Play className="w-3.5 h-3.5 fill-[#011C40]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quality & Interaction Hint */}
            <div className="flex items-center justify-between text-[11px] px-2 text-[#26658C]">
              <span className="flex items-center gap-1.5 font-bold text-[#011C40]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#54ACBF] animate-ping" />
                Anatomical Male Base Mesh • Smooth Studio Shading
              </span>
              <span className="font-semibold text-slate-500">
                Pinch/Scroll to Zoom
              </span>
            </div>
          </div>

          {/* Masterclass Form Coaching Guide */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Breathing & Bracing Cadence Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#A7EBF2]/40 to-[#E0F7FA]/70 border border-[#54ACBF]/50 space-y-1.5">
              <span className="text-[11px] font-black text-[#011C40] uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#023859]" /> Breathing & Intra-Abdominal Pressure
              </span>
              <p className="text-xs text-[#26658C] font-semibold leading-relaxed">
                {exercise.breathingCue || 'Inhale on the eccentric descent; hold core brace; exhale past the sticking point on the drive.'}
              </p>
            </div>

            {/* 3 Golden Setup Steps */}
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

            {/* Injury Prevention / Mistakes to Avoid */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2 text-xs">
              <h4 className="font-extrabold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Injury Prevention (Don'ts)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-rose-800 font-medium">
                {(exercise.keyMistakes || [
                  'Never sacrifice technique or range of motion just to lift heavier weights.',
                  'Avoid hyperextending or flexing the lumbar spine under load.'
                ]).map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close / Return Button */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full liquid-glass-btn liquid-glass-btn-active text-white text-xs font-extrabold shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Got It — Ready to Lift</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

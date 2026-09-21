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
  const [currentPhase, setCurrentPhase] = useState('concentric'); // 'concentric' or 'eccentric'
  const [repCount, setRepCount] = useState(1);
  const [activeAngle, setActiveAngle] = useState('iso'); // 'iso', 'front', 'side', 'top'
  const [modelLoading, setModelLoading] = useState(true);

  // Refs for Three.js state
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameId = useRef(null);
  const animTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 2.8, radius: 3.2 });

  // Loaded bones & equipment mesh references
  const bonesRef = useRef({});
  const initialQuatsRef = useRef({});
  const initialPositionsRef = useRef({});
  const modelRootRef = useRef(null);
  const equipmentRefs = useRef({});
  const skinnedMeshRef = useRef(null);

  // Reset states when exercise changes or opens
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setRepCount(1);
      animTimeRef.current = 0;
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 2.8, radius: 3.2 };
      setActiveAngle('iso');
    }
  }, [isOpen, exercise?.id]);

  // Three.js Scene Setup & GLTF Male Base Mesh Loader
  useEffect(() => {
    if (!isOpen || !exercise || !canvasRef.current) return;

    setModelLoading(true);

    const width = containerRef.current ? containerRef.current.clientWidth : 480;
    const height = containerRef.current ? containerRef.current.clientHeight : 440;

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

    // 3. THREE-POINT STUDIO LIGHTING (Highlights Muscular Contours of Male Base Mesh)
    const ambientLight = new THREE.AmbientLight(0xdcf8fa, 0.75);
    scene.add(ambientLight);

    // Key Light (Angled front-top-right for sculpted muscle definition)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (Soft cool cyan from left)
    const fillLight = new THREE.DirectionalLight(0x54acbf, 0.9);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // Back / Rim Light (Edge rim lighting for deltoids, lats, and spine)
    const rimLight = new THREE.DirectionalLight(0xa7ebf2, 1.3);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. STUDIO GYM FLOOR & PEDESTAL
    const floorPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.3, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: 0x011c40, roughness: 0.4, metalness: 0.3 })
    );
    floorPedestal.position.y = -0.03;
    floorPedestal.receiveShadow = true;
    scene.add(floorPedestal);

    const gridHelper = new THREE.GridHelper(5, 14, 0x54acbf, 0x023859);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // 5. GYM EQUIPMENT: BARBELL, DUMBBELLS, OLYMPIC BENCH
    const equipment = createGymEquipment(scene, exercise);
    equipmentRefs.current = equipment;

    // 6. ATHLETIC MALE BASE MESH MATERIAL (Matching User's Reference Model: media_1789975315254.png)
    const athleticSkinMat = new THREE.MeshStandardMaterial({
      color: 0x9fb0c2,      // Sculpted studio clay/gray matching user reference image
      roughness: 0.35,      // Smooth specular sheen showing anatomical muscle contours
      metalness: 0.15,
      flatShading: false
    });

    // Active Muscle Glowing Overlay Material
    const muscleGlowMat = new THREE.MeshStandardMaterial({
      color: 0x54acbf,
      emissive: 0x26658c,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.4
    });

    // 7. LOAD GLTF MALE BASE MESH
    const loader = new GLTFLoader();
    loader.load(
      '/models/male_base_mesh.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRootRef.current = model;

        // Model orientation: rotate to face camera and place feet on floor
        model.rotation.y = -Math.PI / 2;
        model.position.set(0, 0.95, 0);

        const bones = {};
        const initialQuats = {};
        const initialPositions = {};

        model.traverse((child) => {
          if (child.isBone) {
            bones[child.name] = child;
            initialQuats[child.name] = child.quaternion.clone();
            initialPositions[child.name] = child.position.clone();
          }
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = athleticSkinMat;
            skinnedMeshRef.current = child;
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

    // 8. KINEMATICS ANIMATION LOOP
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        const speed = isSlowMo ? 1.0 : 2.0;
        animTimeRef.current += delta * speed;

        // Oscillate cycle between 0 and 1
        const cycleProgress = (Math.sin(animTimeRef.current) + 1) / 2;
        const isConcentric = Math.cos(animTimeRef.current) > 0;

        setCurrentPhase(isConcentric ? 'concentric' : 'eccentric');

        // Increment rep counter when cycle resets
        if (Math.abs(Math.sin(animTimeRef.current)) < 0.04 && Math.cos(animTimeRef.current) > 0.98) {
          setRepCount(prev => (prev >= 12 ? 1 : prev + 1));
        }

        // Apply US-standard workout kinematics
        applyUSStandardKinematics(exercise.kinematicType || 'squat', cycleProgress, isConcentric);
      }

      renderer.render(scene, camera);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen, exercise?.id, isPlaying, isSlowMo]);

  // UPDATE CAMERA FROM ORBIT COORDINATES
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0.95, 0);
  };

  // CREATE REALISTIC GYM EQUIPMENT
  const createGymEquipment = (scene, ex) => {
    const eq = (ex.equipment || '').toLowerCase();
    const type = ex.kinematicType || 'squat';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x2b3748, roughness: 0.3, metalness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x02253d, roughness: 0.5, metalness: 0.1 });

    // 1. Olympic Barbell (2.2m with knurling and 20kg Olympic bumper plates)
    const barbell = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.1, 16), chromeMat);
    shaft.rotation.z = Math.PI / 2;
    barbell.add(shaft);

    // Left Plates
    const plateL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.05, 32), steelMat);
    plateL1.rotation.z = Math.PI / 2;
    plateL1.position.x = 0.75;
    barbell.add(plateL1);
    const collarL = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), chromeMat);
    collarL.rotation.z = Math.PI / 2;
    collarL.position.x = 0.68;
    barbell.add(collarL);

    // Right Plates
    const plateR1 = plateL1.clone();
    plateR1.position.x = -0.75;
    barbell.add(plateR1);
    const collarR = collarL.clone();
    collarR.position.x = -0.68;
    barbell.add(collarR);

    barbell.castShadow = true;
    scene.add(barbell);

    // 2. Commercial Dumbbells
    const dumbbellL = new THREE.Group();
    const dbHandleL = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 14), chromeMat);
    dbHandleL.rotation.z = Math.PI / 2;
    dumbbellL.add(dbHandleL);
    const dbHeadL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 18), steelMat);
    dbHeadL1.rotation.z = Math.PI / 2;
    dbHeadL1.position.x = 0.1;
    dumbbellL.add(dbHeadL1);
    const dbHeadL2 = dbHeadL1.clone();
    dbHeadL2.position.x = -0.1;
    dumbbellL.add(dbHeadL2);

    const dumbbellR = dumbbellL.clone();
    scene.add(dumbbellL);
    scene.add(dumbbellR);

    // 3. Olympic Flat Bench
    const benchGroup = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 1.25), leatherMat);
    pad.position.set(0, 0.45, 0);
    benchGroup.add(pad);
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), steelMat);
    leg1.position.set(0, 0.22, 0.5);
    benchGroup.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.set(0, 0.22, -0.5);
    benchGroup.add(leg2);

    scene.add(benchGroup);

    // Visibility configuration
    const isBarbellEx = eq.includes('barbell') || type === 'squat' || type === 'deadlift';
    const isDumbbellEx = eq.includes('dumbbell') || type === 'lateral-raise' || type === 'bicep-curl';
    const isBenchEx = type === 'bench-press' || type === 'incline-press';

    barbell.visible = isBarbellEx;
    dumbbellL.visible = isDumbbellEx;
    dumbbellR.visible = isDumbbellEx;
    benchGroup.visible = isBenchEx;

    return { barbell, dumbbellL, dumbbellR, benchGroup };
  };

  // US STANDARD BIOMECHANICAL KINEMATIC FORM EQUATIONS
  const applyUSStandardKinematics = (type, t, isConcentric) => {
    const bones = bonesRef.current;
    const initialQuats = initialQuatsRef.current;
    const initialPos = initialPositionsRef.current;
    const model = modelRootRef.current;
    const eq = equipmentRefs.current;

    if (!model || !bones.spine) return;

    // Reset all bones to initial A-pose quaternion
    Object.keys(bones).forEach(name => {
      if (initialQuats[name]) {
        bones[name].quaternion.copy(initialQuats[name]);
      }
      if (initialPos[name]) {
        bones[name].position.copy(initialPos[name]);
      }
    });

    // Reset root orientation
    model.rotation.set(0, -Math.PI / 2, 0);
    model.position.set(0, 0.95, 0);

    switch (type) {
      // 1. US STANDARD BARBELL BENCH PRESS (5-Point Contact, 45° Elbow Tuck, J-Curve Bar Path)
      case 'bench-press': {
        // Lay horizontal on Olympic bench
        model.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
        model.position.set(0, 0.52, 0);

        // Legs drape down with feet planted flat on floor (Leg Drive)
        if (bones.thighL) bones.thighL.rotation.z = Math.PI / 4;
        if (bones.thighR) bones.thighR.rotation.z = -Math.PI / 4;
        if (bones.shinL) bones.shinL.rotation.z = -Math.PI / 2.5;
        if (bones.shinR) bones.shinR.rotation.z = Math.PI / 2.5;

        // Scapular retraction on chest (shoulders pulled back into bench)
        if (bones.shoulderL) bones.shoulderL.rotation.y = 0.2;
        if (bones.shoulderR) bones.shoulderR.rotation.y = -0.2;

        // US standard 45° elbow angle (prevents rotator cuff impingement)
        const elbowFlexion = THREE.MathUtils.lerp(Math.PI / 2.2, 0.05, t);
        const upperArmAngle = THREE.MathUtils.lerp(Math.PI / 4, 0.1, t);

        if (bones.upper_armL) {
          bones.upper_armL.rotation.x = upperArmAngle;
          bones.upper_armL.rotation.z = elbowFlexion;
        }
        if (bones.upper_armR) {
          bones.upper_armR.rotation.x = upperArmAngle;
          bones.upper_armR.rotation.z = -elbowFlexion;
        }

        // Barbell J-curve path: touches lower sternum at bottom, locks out over shoulders at top
        const barY = THREE.MathUtils.lerp(0.72, 1.15, t);
        const barZ = THREE.MathUtils.lerp(0.08, 0.0, t);
        if (eq.barbell) {
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 2. US STANDARD BARBELL SQUAT (Crease of Hip Below Knee, Neutral Lumbar, Mid-Foot Bar Path)
      case 'squat': {
        // Barbell rests firmly across upper trapezius shelf
        const squatDepth = THREE.MathUtils.lerp(0, 0.48, 1 - t);
        model.position.y = 0.95 - squatDepth;

        // Torso rigid 20° incline maintaining 360° intra-abdominal brace
        const spineIncline = THREE.MathUtils.lerp(0, Math.PI / 9, 1 - t);
        if (bones.spine001) bones.spine001.rotation.y = spineIncline;
        if (bones.spine002) bones.spine002.rotation.y = spineIncline * 0.5;

        // Hips break backward, thighs reach full parallel / below parallel (US standard)
        const hipFlexion = THREE.MathUtils.lerp(0, Math.PI / 2.1, 1 - t);
        const kneeFlexion = THREE.MathUtils.lerp(0, Math.PI / 1.9, 1 - t);

        if (bones.thighL) bones.thighL.rotation.x = hipFlexion;
        if (bones.thighR) bones.thighR.rotation.x = -hipFlexion;
        if (bones.shinL) bones.shinL.rotation.x = -kneeFlexion;
        if (bones.shinR) bones.shinR.rotation.x = kneeFlexion;

        // Arms reach back and grip barbell
        if (bones.upper_armL) bones.upper_armL.rotation.set(-Math.PI / 3, 0, Math.PI / 3);
        if (bones.upper_armR) bones.upper_armR.rotation.set(-Math.PI / 3, 0, -Math.PI / 3);
        if (bones.forearmL) bones.forearmL.rotation.z = Math.PI / 3;
        if (bones.forearmR) bones.forearmR.rotation.z = -Math.PI / 3;

        // Barbell stays locked over mid-foot vertical axis
        if (eq.barbell) {
          eq.barbell.position.set(0, 1.48 - squatDepth, -0.04);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 3. US STANDARD DEADLIFT / RDL (Posterior Chain Hinge, Bar Scraping Shins, Neutral Spine)
      case 'deadlift': {
        const hingeAngle = THREE.MathUtils.lerp(Math.PI / 3.4, 0, t);
        model.position.y = THREE.MathUtils.lerp(0.82, 0.95, t);

        // Hips push back horizontally, spine stays completely flat
        if (bones.spine001) bones.spine001.rotation.y = hingeAngle;
        if (bones.spine002) bones.spine002.rotation.y = hingeAngle * 0.4;

        // Soft knees locked at 15°
        if (bones.thighL) bones.thighL.rotation.x = hingeAngle * 0.7;
        if (bones.thighR) bones.thighR.rotation.x = -hingeAngle * 0.7;
        if (bones.shinL) bones.shinL.rotation.x = -(1 - t) * 0.3;
        if (bones.shinR) bones.shinR.rotation.x = (1 - t) * 0.3;

        // Arms hang vertical with engaged lats ("squeeze oranges in armpits")
        if (bones.upper_armL) bones.upper_armL.rotation.set(0, 0, 0.1);
        if (bones.upper_armR) bones.upper_armR.rotation.set(0, 0, -0.1);

        // Barbell slides vertically along shins to hips
        const barY = THREE.MathUtils.lerp(0.32, 0.88, t);
        const barZ = THREE.MathUtils.lerp(0.24, 0.12, t);
        if (eq.barbell) {
          eq.barbell.position.set(0, barY, barZ);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 4. US STANDARD LAT PULLDOWN (Scapular Depression, 10° Chest Arch, Elbows to Ribs)
      case 'lat-pulldown': {
        // Seated under thigh pads
        model.position.set(0, 0.65, 0);
        if (bones.spine001) bones.spine001.rotation.y = -0.15; // 10° chest tilt

        // Knees at 90° under thigh pads
        if (bones.thighL) bones.thighL.rotation.x = Math.PI / 2.2;
        if (bones.thighR) bones.thighR.rotation.x = -Math.PI / 2.2;
        if (bones.shinL) bones.shinL.rotation.x = -Math.PI / 2.2;
        if (bones.shinR) bones.shinR.rotation.x = Math.PI / 2.2;

        // Arms pull down, driving elbows down and back toward lats
        const armPull = THREE.MathUtils.lerp(Math.PI * 0.85, Math.PI * 0.28, t);
        if (bones.upper_armL) bones.upper_armL.rotation.z = armPull;
        if (bones.upper_armR) bones.upper_armR.rotation.z = -armPull;
        if (bones.forearmL) bones.forearmL.rotation.z = THREE.MathUtils.lerp(0.15, Math.PI / 2.2, t);
        if (bones.forearmR) bones.forearmR.rotation.z = THREE.MathUtils.lerp(-0.15, -Math.PI / 2.2, t);

        // Lat bar pulls from overhead down to collarbone
        const barY = THREE.MathUtils.lerp(2.15, 1.48, t);
        if (eq.barbell) {
          eq.barbell.position.set(0, barY, 0.1);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 5. US STANDARD OVERHEAD SHOULDER PRESS (Scapular Plane, Head Through Window Lockout)
      case 'overhead-press': {
        // Standing press from collarbone to overhead lockout
        const pressUp = THREE.MathUtils.lerp(0.2, Math.PI * 0.82, t);
        if (bones.upper_armL) bones.upper_armL.rotation.z = pressUp;
        if (bones.upper_armR) bones.upper_armR.rotation.z = -pressUp;
        if (bones.forearmL) bones.forearmL.rotation.z = THREE.MathUtils.lerp(Math.PI / 2.2, 0.1, t);
        if (bones.forearmR) bones.forearmR.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2.2, -0.1, t);

        const barY = THREE.MathUtils.lerp(1.38, 2.05, t);
        if (eq.barbell) {
          eq.barbell.position.set(0, barY, 0.08);
          eq.barbell.rotation.set(0, 0, 0);
        }
        break;
      }

      // 6. DUMBBELL LATERAL RAISE (Scapular Plane 15°, Soft Elbows, Parallel Height)
      case 'lateral-raise': {
        const raiseAngle = THREE.MathUtils.lerp(0.12, Math.PI / 2.1, t);
        if (bones.upper_armL) bones.upper_armL.rotation.z = raiseAngle;
        if (bones.upper_armR) bones.upper_armR.rotation.z = -raiseAngle;
        if (bones.forearmL) bones.forearmL.rotation.z = 0.2; // soft 15° elbow bend
        if (bones.forearmR) bones.forearmR.rotation.z = -0.2;

        if (eq.dumbbellL) {
          const dbY = THREE.MathUtils.lerp(0.65, 1.35, t);
          const dbX = THREE.MathUtils.lerp(0.28, 0.72, t);
          eq.dumbbellL.position.set(dbX, dbY, 0);
        }
        if (eq.dumbbellR) {
          const dbY = THREE.MathUtils.lerp(0.65, 1.35, t);
          const dbX = THREE.MathUtils.lerp(-0.28, -0.72, t);
          eq.dumbbellR.position.set(dbX, dbY, 0);
        }
        break;
      }

      // 7. INCLINE BICEP CURL (Upper Arm Pinned, Supinated Forearm Squeeze)
      case 'bicep-curl': {
        if (bones.upper_armL) bones.upper_armL.rotation.set(0, 0, 0.08);
        if (bones.upper_armR) bones.upper_armR.rotation.set(0, 0, -0.08);

        const curlAngle = THREE.MathUtils.lerp(0.1, Math.PI * 0.75, t);
        if (bones.forearmL) bones.forearmL.rotation.x = curlAngle;
        if (bones.forearmR) bones.forearmR.rotation.x = curlAngle;

        if (eq.dumbbellL) {
          const dbY = THREE.MathUtils.lerp(0.65, 1.15, t);
          const dbZ = THREE.MathUtils.lerp(0.05, 0.32, t);
          eq.dumbbellL.position.set(0.26, dbY, dbZ);
        }
        if (eq.dumbbellR) {
          const dbY = THREE.MathUtils.lerp(0.65, 1.15, t);
          const dbZ = THREE.MathUtils.lerp(0.05, 0.32, t);
          eq.dumbbellR.position.set(-0.26, dbY, dbZ);
        }
        break;
      }

      // 8. TRICEP PUSHDOWN (Elbows Pinned, Forearm Full Extension)
      case 'tricep-pushdown': {
        if (bones.spine001) bones.spine001.rotation.y = 0.12; // slight 10° torso lean
        if (bones.upper_armL) bones.upper_armL.rotation.set(-0.15, 0, 0.08);
        if (bones.upper_armR) bones.upper_armR.rotation.set(-0.15, 0, -0.08);

        const pushdownAngle = THREE.MathUtils.lerp(Math.PI * 0.65, 0.05, t);
        if (bones.forearmL) bones.forearmL.rotation.x = pushdownAngle;
        if (bones.forearmR) bones.forearmR.rotation.x = pushdownAngle;
        break;
      }

      default: {
        const float = Math.sin(t * Math.PI) * 0.03;
        model.position.y = 0.95 + float;
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
      cameraAngleRef.current = { theta: 0, phi: 0.2, radius: 3.6 };
    } else {
      // Isometric 45
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
                    ? 'bg-emerald-500 text-slate-950 animate-pulse' 
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

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  Sparkles, 
  Check, 
  Activity,
  Layers,
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

  // Refs for Three.js state
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameId = useRef(null);
  const animTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 3.5 });

  // References to mannequin parts for animation
  const mannequinRefs = useRef({});

  // Reset states when exercise changes or opens
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setRepCount(1);
      animTimeRef.current = 0;
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 3.5 };
      setActiveAngle('iso');
    }
  }, [isOpen, exercise?.id]);

  // Three.js Scene Setup & Kinematic Engine
  useEffect(() => {
    if (!isOpen || !exercise || !canvasRef.current) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 480;
    const height = containerRef.current ? containerRef.current.clientHeight : 440;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x011328); // Deep Navy Studio
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

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xdcf8fa, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x54acbf, 0.8);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa7ebf2, 1.2, 10);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 4. STUDIO GYM FLOOR GRID
    const gridHelper = new THREE.GridHelper(6, 16, 0x54acbf, 0x0a3055);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.CircleGeometry(3.5, 32);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x011c40, transparent: true, opacity: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // 5. MATERIALS FOR ATHLETIC MANNEQUIN & ACTIVE MUSCLE GLOW
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xddeef8,
      roughness: 0.35,
      metalness: 0.2
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x26658c,
      roughness: 0.2,
      metalness: 0.6
    });

    // Dynamic Muscle Glowing Material (illuminates during contraction)
    const activeMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x54acbf,
      emissive: 0x26658c,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.4
    });

    const weightIronMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8
    });

    const barbellShaftMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.95
    });

    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x023859,
      roughness: 0.5,
      metalness: 0.1
    });

    // 6. BUILD PROCEDURAL ARTICULATED MANNEQUIN
    const mannequin = new THREE.Group();
    mannequin.position.y = 0;
    scene.add(mannequin);

    // Pelvis (Root Joint)
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.95, 0);
    mannequin.add(pelvis);

    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.18, 16), jointMat);
    pelvis.add(pelvisMesh);

    // Spine & Torso
    const spine = new THREE.Group();
    pelvis.add(spine);

    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.38, 16), skinMat);
    torsoMesh.position.y = 0.24;
    spine.add(torsoMesh);

    // Pectoral / Chest Plates (Active Muscle indicator)
    const chestPlateGeo = new THREE.BoxGeometry(0.36, 0.18, 0.12);
    const chestPlate = new THREE.Mesh(chestPlateGeo, activeMuscleMat);
    chestPlate.position.set(0, 0.3, 0.12);
    spine.add(chestPlate);

    // Lat Plates (Back Active Muscle indicator)
    const latPlateGeo = new THREE.BoxGeometry(0.38, 0.22, 0.1);
    const latPlate = new THREE.Mesh(latPlateGeo, activeMuscleMat);
    latPlate.position.set(0, 0.26, -0.11);
    spine.add(latPlate);

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.set(0, 0.46, 0);
    spine.add(neck);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), skinMat);
    headMesh.position.y = 0.12;
    neck.add(headMesh);

    // Visor / Athletic Face Feature
    const visorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.05, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xa7ebf2 })
    );
    visorMesh.position.set(0, 0.13, 0.08);
    neck.add(visorMesh);

    // LEFT ARM HIERARCHY
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(0.25, 0.38, 0);
    spine.add(leftShoulder);

    const leftShoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), activeMuscleMat);
    leftShoulder.add(leftShoulderMesh);

    const leftUpperArm = new THREE.Group();
    leftShoulder.add(leftUpperArm);
    const leftUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.28, 12), activeMuscleMat);
    leftUpperArmMesh.position.y = -0.14;
    leftUpperArm.add(leftUpperArmMesh);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.28, 0);
    leftUpperArm.add(leftElbow);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.26, 12), skinMat);
    leftForearm.position.y = -0.13;
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.26, 0);
    leftElbow.add(leftHand);

    // RIGHT ARM HIERARCHY
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(-0.25, 0.38, 0);
    spine.add(rightShoulder);

    const rightShoulderMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), activeMuscleMat);
    rightShoulder.add(rightShoulderMesh);

    const rightUpperArm = new THREE.Group();
    rightShoulder.add(rightUpperArm);
    const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.28, 12), activeMuscleMat);
    rightUpperArmMesh.position.y = -0.14;
    rightUpperArm.add(rightUpperArmMesh);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.28, 0);
    rightUpperArm.add(rightElbow);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.26, 12), skinMat);
    rightForearm.position.y = -0.13;
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.26, 0);
    rightElbow.add(rightHand);

    // LEFT LEG HIERARCHY
    const leftHip = new THREE.Group();
    leftHip.position.set(0.12, -0.05, 0);
    pelvis.add(leftHip);

    const leftThigh = new THREE.Group();
    leftHip.add(leftThigh);
    const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.42, 14), activeMuscleMat);
    leftThighMesh.position.y = -0.21;
    leftThigh.add(leftThighMesh);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.42, 0);
    leftThigh.add(leftKnee);

    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 12), skinMat);
    leftShin.position.y = -0.21;
    leftKnee.add(leftShin);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), jointMat);
    leftFoot.position.set(0, -0.43, 0.05);
    leftKnee.add(leftFoot);

    // RIGHT LEG HIERARCHY
    const rightHip = new THREE.Group();
    rightHip.position.set(-0.12, -0.05, 0);
    pelvis.add(rightHip);

    const rightThigh = new THREE.Group();
    rightHip.add(rightThigh);
    const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.42, 14), activeMuscleMat);
    rightThighMesh.position.y = -0.21;
    rightThigh.add(rightThighMesh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.42, 0);
    rightThigh.add(rightKnee);

    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 12), skinMat);
    rightShin.position.y = -0.21;
    rightKnee.add(rightShin);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), jointMat);
    rightFoot.position.set(0, -0.43, 0.05);
    rightKnee.add(rightFoot);

    // 7. GYM EQUIPMENT: BARBELL / DUMBBELLS / BENCH
    const barbell = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 16), barbellShaftMat);
    shaft.rotation.z = Math.PI / 2;
    barbell.add(shaft);

    const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), weightIronMat);
    plate1.rotation.z = Math.PI / 2;
    plate1.position.x = 0.65;
    barbell.add(plate1);

    const plate2 = plate1.clone();
    plate2.position.x = -0.65;
    barbell.add(plate2);

    scene.add(barbell);

    // Dumbbell pair
    const leftDumbbell = new THREE.Group();
    const dbShaft1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 12), barbellShaftMat);
    dbShaft1.rotation.z = Math.PI / 2;
    leftDumbbell.add(dbShaft1);
    const dbPlate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), weightIronMat);
    dbPlate1.rotation.z = Math.PI / 2;
    dbPlate1.position.x = 0.1;
    leftDumbbell.add(dbPlate1);
    const dbPlate2 = dbPlate1.clone();
    dbPlate2.position.x = -0.1;
    leftDumbbell.add(dbPlate2);
    leftHand.add(leftDumbbell);

    const rightDumbbell = leftDumbbell.clone();
    rightHand.add(rightDumbbell);

    // Flat Gym Bench
    const benchGroup = new THREE.Group();
    const benchPad = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 1.3), benchMat);
    benchPad.position.set(0, 0.45, 0);
    benchGroup.add(benchPad);

    const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), weightIronMat);
    benchLeg1.position.set(0, 0.22, 0.5);
    benchGroup.add(benchLeg1);
    const benchLeg2 = benchLeg1.clone();
    benchLeg2.position.set(0, 0.22, -0.5);
    benchGroup.add(benchLeg2);

    scene.add(benchGroup);

    // Save refs for animation loop
    mannequinRefs.current = {
      mannequin,
      pelvis,
      spine,
      neck,
      leftShoulder,
      leftUpperArm,
      leftElbow,
      leftHand,
      rightShoulder,
      rightUpperArm,
      rightElbow,
      rightHand,
      leftHip,
      leftThigh,
      leftKnee,
      rightHip,
      rightThigh,
      rightKnee,
      barbell,
      leftDumbbell,
      rightDumbbell,
      benchGroup,
      activeMuscleMat,
      chestPlate,
      latPlate,
      leftShoulderMesh,
      rightShoulderMesh,
      leftUpperArmMesh,
      rightUpperArmMesh,
      leftThighMesh,
      rightThighMesh
    };

    // Configure visibility of equipment based on exercise
    const eq = (exercise.equipment || '').toLowerCase();
    const isBarbell = eq.includes('barbell');
    const isDumbbell = eq.includes('dumbbell');
    const isBench = exercise.kinematicType === 'bench-press' || exercise.kinematicType === 'incline-press';

    barbell.visible = isBarbell;
    leftDumbbell.visible = isDumbbell;
    rightDumbbell.visible = isDumbbell;
    benchGroup.visible = isBench;

    // 8. RENDER & KINEMATICS ANIMATION LOOP
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        const speed = isSlowMo ? 1.1 : 2.2;
        animTimeRef.current += delta * speed;

        // Oscillate cycle between 0 and 1
        const cycleProgress = (Math.sin(animTimeRef.current) + 1) / 2;
        const isConcentric = Math.cos(animTimeRef.current) > 0;

        setCurrentPhase(isConcentric ? 'concentric' : 'eccentric');

        // Increment rep counter when cycle loops
        if (Math.abs(Math.sin(animTimeRef.current)) < 0.04 && Math.cos(animTimeRef.current) > 0.98) {
          setRepCount(prev => (prev >= 12 ? 1 : prev + 1));
        }

        // Pulse active muscle glow during concentric contraction
        const pulse = 0.5 + 0.5 * cycleProgress;
        activeMuscleMat.emissiveIntensity = 0.4 + 0.6 * cycleProgress;
        activeMuscleMat.emissive.setHex(isConcentric ? 0x54acbf : 0x26658c);

        // Apply kinematics based on exercise type
        applyKinematics(exercise.kinematicType || 'squat', cycleProgress, isConcentric);
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
    cameraRef.current.lookAt(0, 1.0, 0);
  };

  // KINEMATIC FORM EQUATIONS PER EXERCISE
  const applyKinematics = (type, t, isConcentric) => {
    const refs = mannequinRefs.current;
    if (!refs.mannequin) return;

    // Reset base orientations
    refs.mannequin.rotation.set(0, 0, 0);
    refs.mannequin.position.set(0, 0, 0);
    refs.pelvis.position.set(0, 0.95, 0);
    refs.spine.rotation.set(0, 0, 0);

    switch (type) {
      case 'bench-press': {
        // Lie flat on bench
        refs.mannequin.rotation.x = -Math.PI / 2;
        refs.mannequin.position.set(0, 0.55, 0);
        refs.pelvis.position.set(0, 0, 0);

        // Legs hanging down off bench
        refs.leftHip.rotation.x = -Math.PI / 4;
        refs.rightHip.rotation.x = -Math.PI / 4;
        refs.leftKnee.rotation.x = Math.PI / 2.5;
        refs.rightKnee.rotation.x = Math.PI / 2.5;

        // Elbow tuck & Pressing Arc (45 degree elbow angle)
        const armAngle = THREE.MathUtils.lerp(Math.PI / 2.4, 0.15, t);
        refs.leftUpperArm.rotation.set(Math.PI / 4, 0, armAngle);
        refs.rightUpperArm.rotation.set(Math.PI / 4, 0, -armAngle);

        refs.leftElbow.rotation.z = THREE.MathUtils.lerp(Math.PI / 2, 0.1, t);
        refs.rightElbow.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, -0.1, t);

        // Barbell tracking vertically over mid-sternum
        const barY = THREE.MathUtils.lerp(0.68, 1.08, t);
        refs.barbell.position.set(0, barY, 0.15);
        break;
      }

      case 'incline-press': {
        // 30 degree incline on bench
        refs.mannequin.rotation.x = -Math.PI / 3;
        refs.mannequin.position.set(0, 0.6, -0.1);

        const armAngle = THREE.MathUtils.lerp(Math.PI / 2.2, 0.2, t);
        refs.leftUpperArm.rotation.set(Math.PI / 4, 0, armAngle);
        refs.rightUpperArm.rotation.set(Math.PI / 4, 0, -armAngle);

        refs.leftElbow.rotation.z = THREE.MathUtils.lerp(Math.PI / 2.2, 0.1, t);
        refs.rightElbow.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2.2, -0.1, t);
        break;
      }

      case 'squat': {
        // Bar on upper traps
        const depth = THREE.MathUtils.lerp(0, 0.45, 1 - t);
        refs.pelvis.position.y = 0.95 - depth;

        // Hip hinge & knee flexion
        const hipFlex = THREE.MathUtils.lerp(0, Math.PI / 2.2, 1 - t);
        const kneeFlex = THREE.MathUtils.lerp(0, Math.PI / 2.0, 1 - t);

        refs.spine.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 8, 1 - t); // slight torso forward lean
        refs.leftHip.rotation.x = -hipFlex;
        refs.rightHip.rotation.x = -hipFlex;
        refs.leftKnee.rotation.x = kneeFlex;
        refs.rightKnee.rotation.x = kneeFlex;

        // Arms holding barbell behind neck
        refs.leftUpperArm.rotation.set(-Math.PI / 4, 0, Math.PI / 3);
        refs.rightUpperArm.rotation.set(-Math.PI / 4, 0, -Math.PI / 3);
        refs.leftElbow.rotation.z = Math.PI / 2.5;
        refs.rightElbow.rotation.z = -Math.PI / 2.5;

        // Barbell stays locked across traps
        refs.barbell.position.set(0, 1.48 - depth, -0.05);
        break;
      }

      case 'deadlift': {
        // Hip hinge with bar scraping shins
        const hinge = THREE.MathUtils.lerp(Math.PI / 3.2, 0, t);
        refs.pelvis.position.y = THREE.MathUtils.lerp(0.8, 0.95, t);
        refs.spine.rotation.x = hinge;

        refs.leftHip.rotation.x = -hinge * 0.8;
        refs.rightHip.rotation.x = -hinge * 0.8;
        refs.leftKnee.rotation.x = (1 - t) * 0.35;
        refs.rightKnee.rotation.x = (1 - t) * 0.35;

        // Arms hang vertical holding bar
        refs.leftUpperArm.rotation.set(hinge, 0, 0.1);
        refs.rightUpperArm.rotation.set(hinge, 0, -0.1);
        refs.leftElbow.rotation.set(0, 0, 0);
        refs.rightElbow.rotation.set(0, 0, 0);

        // Barbell tracks along shins to hips
        const barY = THREE.MathUtils.lerp(0.28, 0.82, t);
        const barZ = THREE.MathUtils.lerp(0.25, 0.15, t);
        refs.barbell.position.set(0, barY, barZ);
        break;
      }

      case 'lat-pulldown': {
        // Seated, arms pull bar from overhead to upper chest
        refs.pelvis.position.set(0, 0.65, 0);
        refs.spine.rotation.x = -0.15; // 10 degree chest tilt
        refs.leftHip.rotation.x = -Math.PI / 2.2;
        refs.rightHip.rotation.x = -Math.PI / 2.2;
        refs.leftKnee.rotation.x = Math.PI / 2.2;
        refs.rightKnee.rotation.x = Math.PI / 2.2;

        // Arms pull down and elbows drive to ribs
        const armPull = THREE.MathUtils.lerp(Math.PI * 0.9, Math.PI * 0.25, t);
        refs.leftUpperArm.rotation.set(0, 0, armPull);
        refs.rightUpperArm.rotation.set(0, 0, -armPull);

        refs.leftElbow.rotation.z = THREE.MathUtils.lerp(0.2, Math.PI / 2, t);
        refs.rightElbow.rotation.z = THREE.MathUtils.lerp(-0.2, -Math.PI / 2, t);

        // Barbell represents the cable lat bar
        const barY = THREE.MathUtils.lerp(2.1, 1.45, t);
        refs.barbell.position.set(0, barY, 0.1);
        break;
      }

      case 'overhead-press': {
        // Standing overhead press
        const pressProgress = THREE.MathUtils.lerp(0.2, Math.PI * 0.85, t);
        refs.leftUpperArm.rotation.set(0, 0, pressProgress);
        refs.rightUpperArm.rotation.set(0, 0, -pressProgress);

        refs.leftElbow.rotation.z = THREE.MathUtils.lerp(Math.PI / 2, 0.1, t);
        refs.rightElbow.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, -0.1, t);

        const barY = THREE.MathUtils.lerp(1.35, 2.05, t);
        refs.barbell.position.set(0, barY, 0.08);
        break;
      }

      case 'lateral-raise': {
        // Dumbbell lateral raises: arms abduct to parallel
        const raiseAngle = THREE.MathUtils.lerp(0.1, Math.PI / 2.1, t);
        refs.leftUpperArm.rotation.set(0, 0, raiseAngle);
        refs.rightUpperArm.rotation.set(0, 0, -raiseAngle);
        refs.leftElbow.rotation.z = 0.2; // soft 15 degree elbow bend
        refs.rightElbow.rotation.z = -0.2;
        break;
      }

      case 'bicep-curl': {
        // Upper arm pinned vertical, forearms curl up
        refs.leftUpperArm.rotation.set(0, 0, 0.1);
        refs.rightUpperArm.rotation.set(0, 0, -0.1);

        const curlAngle = THREE.MathUtils.lerp(0.1, Math.PI * 0.75, t);
        refs.leftElbow.rotation.x = curlAngle;
        refs.rightElbow.rotation.x = curlAngle;
        break;
      }

      case 'tricep-pushdown': {
        // Pinned elbows, forearms extend downwards
        refs.spine.rotation.x = 0.15; // slight torso lean
        refs.leftUpperArm.rotation.set(-0.2, 0, 0.1);
        refs.rightUpperArm.rotation.set(-0.2, 0, -0.1);

        const extendAngle = THREE.MathUtils.lerp(Math.PI * 0.65, 0.05, t);
        refs.leftElbow.rotation.x = extendAngle;
        refs.rightElbow.rotation.x = extendAngle;
        break;
      }

      default: {
        // Generic smooth full-body breathing cadence
        const float = Math.sin(t * Math.PI) * 0.05;
        refs.pelvis.position.y = 0.95 + float;
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
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 3.4 };
    } else if (preset === 'side') {
      cameraAngleRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 3.4 };
    } else if (preset === 'top') {
      cameraAngleRef.current = { theta: 0, phi: 0.2, radius: 3.8 };
    } else {
      // Isometric 45
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 3.5 };
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
              </div>
              <p className="text-xs text-[#26658C] font-medium truncate">
                Target: <strong className="text-[#011C40]">{exercise.primaryMuscle}</strong> • 3D Biomechanical Visualizer
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
              className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden shadow-inner bg-[#011328] border border-[#54ACBF]/40 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
            >
              {/* Three.js Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block touch-none" />

              {/* Drag Prompt Hint Overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#011C40]/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-[#54ACBF]/40 pointer-events-none">
                <Compass className="w-3 h-3 text-[#A7EBF2] animate-spin" style={{ animationDuration: '6s' }} />
                <span>Drag to Rotate 360°</span>
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

            {/* Active Muscle Glow Legend */}
            <div className="flex items-center justify-between text-[11px] px-2 text-[#26658C]">
              <span className="flex items-center gap-1.5 font-bold text-[#011C40]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#54ACBF] animate-ping" />
                Cyan Glow = Primary Contracting Muscle
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
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> 3 Golden Setup Rules
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

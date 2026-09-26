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
  Maximize2,
  Dumbbell as DumbbellIcon,
  Layers
} from 'lucide-react';

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
  if (eq.includes('cable') || name.includes('cable') || id.includes('cable') || id === 'lat-pulldown' || id === 'face-pull') {
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

  // Playback States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('concentric');
  const [repCount, setRepCount] = useState(1);
  const [activeAngle, setActiveAngle] = useState('side'); // Default to side profile like reference image
  const [modelLoading, setModelLoading] = useState(true);
  const [liveJointAngle, setLiveJointAngle] = useState(90);

  // Equipment Mode State: 'dumbbell' vs 'barbell' (Rod Weight) vs 'cable' vs 'machine' vs 'bodyweight'
  const [equipmentMode, setEquipmentMode] = useState(() => getEquipmentMode(exercise));

  // Three.js State Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameId = useRef(null);
  const animTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 3.2 }); // Side profile default
  const repTriggeredRef = useRef(false);

  // Loaded bones, mesh & equipment references
  const bonesRef = useRef({});
  const initialQuatsRef = useRef({});
  const initialPositionsRef = useRef({});
  const modelRootRef = useRef(null);
  const equipmentRefs = useRef({});
  const laserAngleRefs = useRef({});
  const muscleGlowRef = useRef(null);

  // Synchronize equipment mode when exercise opens or changes
  useEffect(() => {
    if (isOpen && exercise) {
      setIsPlaying(true);
      setRepCount(1);
      animTimeRef.current = 0;
      repTriggeredRef.current = false;
      // Start in clean side profile view matching reference image
      cameraAngleRef.current = { theta: Math.PI / 2, phi: Math.PI / 2.3, radius: 3.2 };
      setActiveAngle('side');
      setEquipmentMode(getEquipmentMode(exercise));
    }
  }, [isOpen, exercise?.id]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    if (!isOpen || !exercise || !canvasRef.current) return;

    setModelLoading(true);

    const container = containerRef.current;
    const width = container ? container.clientWidth : 480;
    const height = container ? container.clientHeight : 440;

    // 1. SCENE & CAMERA (Dark Studio Charcoal Backdrop matching Reference Image)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181c24); // Deep studio charcoal
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

    // 3. CINEMATIC STUDIO LIGHTING (Matching Reference Image)
    const ambientLight = new THREE.AmbientLight(0x28303d, 1.0);
    scene.add(ambientLight);

    // Key Light (Sculpted anatomical shadows defining deltoids, lats, and legs)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(3.5, 4.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Silhouette Rim Light (Electric cool blue glancing off top skull, neck, and shoulders)
    const silhouetteRimLight = new THREE.DirectionalLight(0x8ab4f8, 1.8);
    silhouetteRimLight.position.set(0, 5, -3.5);
    scene.add(silhouetteRimLight);

    // Front/Fill Light (Soft cool cyan)
    const fillLight = new THREE.DirectionalLight(0x54acbf, 0.7);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    // 4. SEAMLESS STUDIO GROUND & SOFT CONTACT SHADOW PEDESTAL
    const floorPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.7, 0.04, 48),
      new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.6, metalness: 0.1 })
    );
    floorPedestal.position.y = -0.02;
    floorPedestal.receiveShadow = true;
    scene.add(floorPedestal);

    // Subtle contact ground circle
    const contactShadow = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 2.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a0c10, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.002;
    scene.add(contactShadow);

    // 5. GYM EQUIPMENT (Olympic Barbell Rod, Round Cast-Iron Dumbbells, Commercial Bench)
    const equipment = createGymEquipment(scene, exercise);
    equipmentRefs.current = equipment;

    // 6. NEON BIOMECHANICAL LASER VECTOR ANGLE (The Signature Reference Feature)
    const laserAngle = createLaserAngleSystem(scene);
    laserAngleRefs.current = laserAngle;

    // 7. ACTIVE CONTRACTING MUSCLE HIGHLIGHT (Glows in warm amber during contraction)
    const muscleGlow = createMuscleGlowPatch(scene, exercise);
    muscleGlowRef.current = muscleGlow;

    // 8. LOAD ATHLETIC MALE BASE MESH & APPLY WHITE PORCELAIN SKIN + BLACK COMPRESSION SHORTS
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

              // In model space: y between -0.22 and 0.06, and |z| < 0.18 (pelvis & upper thighs)
              const isShorts = y > -0.22 && y < 0.06 && Math.abs(z) < 0.18;

              if (isShorts) {
                // Dark athletic gym compression shorts (#14171f)
                colors[i * 3 + 0] = 0.10;
                colors[i * 3 + 1] = 0.12;
                colors[i * 3 + 2] = 0.15;
              } else {
                // Pristine matte white porcelain anatomical skin (#edf1f5)
                colors[i * 3 + 0] = 0.93;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 0.98;
              }
            }

            geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            child.material = new THREE.MeshStandardMaterial({
              vertexColors: true,
              roughness: 0.32,
              metalness: 0.06,
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

    // 9. RESIZE OBSERVER (Zero aspect-ratio distortion on any screen)
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

    // 10. HIGH-PRECISION KINEMATICS & LASER VECTOR LOOP
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && modelRootRef.current) {
        const speed = isSlowMo ? 1.0 : 1.9;
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

  // CREATE NEON LASER VECTOR ANGLE SYSTEM (Exactly like Reference Image)
  const createLaserAngleSystem = (scene) => {
    const laserGroup = new THREE.Group();

    // Emissive glowing materials (Green for stretch, Hot Orange for contraction)
    const coreMatGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const haloMatGreen = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.45 });

    const coreMatOrange = new THREE.MeshBasicMaterial({ color: 0xff5722 });
    const haloMatOrange = new THREE.MeshBasicMaterial({ color: 0xff8533, transparent: true, opacity: 0.5 });

    // Segment 1 (Upper Arm: Shoulder to Elbow)
    const seg1Core = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 1, 16), coreMatGreen);
    const seg1Halo = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 16), haloMatGreen);
    const seg1 = new THREE.Group();
    seg1.add(seg1Core);
    seg1.add(seg1Halo);
    laserGroup.add(seg1);

    // Segment 2 (Forearm: Elbow to Wrist)
    const seg2Core = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 1, 16), coreMatGreen);
    const seg2Halo = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 16), haloMatGreen);
    const seg2 = new THREE.Group();
    seg2.add(seg2Core);
    seg2.add(seg2Halo);
    laserGroup.add(seg2);

    // Joint Nodes (Luminous glowing spheres at Shoulder, Elbow, Wrist)
    const nodeShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), coreMatGreen);
    const nodeElbow = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 16), coreMatGreen);
    const nodeWrist = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), coreMatGreen);

    laserGroup.add(nodeShoulder);
    laserGroup.add(nodeElbow);
    laserGroup.add(nodeWrist);

    scene.add(laserGroup);

    return { 
      laserGroup, 
      seg1, 
      seg2, 
      seg1Core, 
      seg1Halo, 
      seg2Core, 
      seg2Halo, 
      nodeShoulder, 
      nodeElbow, 
      nodeWrist,
      coreMatGreen,
      haloMatGreen,
      coreMatOrange,
      haloMatOrange
    };
  };

  // UPDATE 3D CYLINDER SEGMENT TO CONNECT TWO WORLD POINTS
  const updateLaserSegment = (group, pA, pB) => {
    const dir = new THREE.Vector3().subVectors(pB, pA);
    const len = dir.length();
    if (len < 0.001) {
      group.visible = false;
      return;
    }
    group.visible = true;
    group.scale.set(1, len, 1);
    group.position.copy(pA).addScaledVector(dir, 0.5);

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
    group.quaternion.copy(quat);
  };

  // CREATE ACTIVE TARGET MUSCLE GLOW PATCH (Pulsing Mind-Muscle Connection)
  const createMuscleGlowPatch = (scene, ex) => {
    const muscleMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 0.6,
      roughness: 0.35,
      transparent: true,
      opacity: 0.8
    });

    // Anatomical convex curved patch (representing contracting Lat / Delt / Pec)
    const patch = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16, 0, Math.PI, 0, Math.PI / 1.5),
      muscleMat
    );
    scene.add(patch);
    return patch;
  };

  // CREATE REALISTIC COMMERCIAL GYM EQUIPMENT
  const createGymEquipment = (scene, ex) => {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x16191f, roughness: 0.4, metalness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
    const plateCastMat = new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.6, metalness: 0.5 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.65, metalness: 0.1 });

    // 1. OLYMPIC BARBELL ROD (Knurled 2.15m chrome shaft with dual 20kg bumper plates)
    const barbell = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.15, 16), chromeMat);
    shaft.rotation.z = Math.PI / 2;
    barbell.add(shaft);

    for (let i = 0; i < 2; i++) {
      const plateL = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.045, 32), plateCastMat);
      plateL.rotation.z = Math.PI / 2;
      plateL.position.x = 0.72 + i * 0.055;
      barbell.add(plateL);
    }
    const collarL = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), chromeMat);
    collarL.rotation.z = Math.PI / 2;
    collarL.position.x = 0.67;
    barbell.add(collarL);

    for (let i = 0; i < 2; i++) {
      const plateR = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.045, 32), plateCastMat);
      plateR.rotation.z = Math.PI / 2;
      plateR.position.x = -(0.72 + i * 0.055);
      barbell.add(plateR);
    }
    const collarR = collarL.clone();
    collarR.position.x = -0.67;
    barbell.add(collarR);

    barbell.castShadow = true;
    scene.add(barbell);

    // 2. COMMERCIAL PRO ROUND DUMBBELLS (Dual handheld dumbbells matching Reference Image)
    function createProDumbbell() {
      const db = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 14), chromeMat);
      handle.rotation.z = Math.PI / 2;
      db.add(handle);

      // Cast iron round weight plates (outer smaller, inner larger)
      const plateInnerL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.028, 24), plateCastMat);
      plateInnerL.rotation.z = Math.PI / 2;
      plateInnerL.position.x = 0.095;
      db.add(plateInnerL);

      const plateOuterL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.024, 24), plateCastMat);
      plateOuterL.rotation.z = Math.PI / 2;
      plateOuterL.position.x = 0.125;
      db.add(plateOuterL);

      const starCollarL = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 12), chromeMat);
      starCollarL.rotation.z = Math.PI / 2;
      starCollarL.position.x = 0.145;
      db.add(starCollarL);

      const plateInnerR = plateInnerL.clone();
      plateInnerR.position.x = -0.095;
      db.add(plateInnerR);

      const plateOuterR = plateOuterL.clone();
      plateOuterR.position.x = -0.125;
      db.add(plateOuterR);

      const starCollarR = starCollarL.clone();
      starCollarR.position.x = -0.145;
      db.add(starCollarR);

      db.castShadow = true;
      return db;
    }

    const dumbbellL = createProDumbbell();
    const dumbbellR = createProDumbbell();
    scene.add(dumbbellL);
    scene.add(dumbbellR);

    // 3. WIDE LAT PULLDOWN CABLE BAR
    const latBar = new THREE.Group();
    const latShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.25, 16), chromeMat);
    latShaft.rotation.z = Math.PI / 2;
    latBar.add(latShaft);
    const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 14), steelMat);
    gripL.position.set(0.62, -0.06, 0);
    gripL.rotation.z = Math.PI / 3;
    latBar.add(gripL);
    const gripR = gripL.clone();
    gripR.position.set(-0.62, -0.06, 0);
    gripR.rotation.z = -Math.PI / 3;
    latBar.add(gripR);
    scene.add(latBar);

    // 4. CABLE ROPE ATTACHMENT
    const cableRope = new THREE.Group();
    const ropeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), steelMat);
    cableRope.add(ropeTop);
    const ropeBallL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 14), steelMat);
    ropeBallL.position.set(0.22, -0.28, 0);
    cableRope.add(ropeBallL);
    const ropeBallR = ropeBallL.clone();
    ropeBallR.position.set(-0.22, -0.28, 0);
    cableRope.add(ropeBallR);
    scene.add(cableRope);

    // 5. OVERHEAD PULL-UP BAR
    const pullUpBar = new THREE.Group();
    const puShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.3, 16), steelMat);
    puShaft.rotation.z = Math.PI / 2;
    puShaft.position.set(0, 2.15, 0);
    pullUpBar.add(puShaft);
    scene.add(pullUpBar);

    // 6. COMMERCIAL INCLINE / FLAT GYM BENCH (Matching Reference Image)
    const benchGroup = new THREE.Group();
    // Incline backrest pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.95), leatherMat);
    pad.position.set(0, 0.55, 0.1);
    pad.rotation.x = -Math.PI / 6; // 30° incline
    pad.receiveShadow = true;
    benchGroup.add(pad);

    // Heavy tubular steel frame
    const baseBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 16), steelMat);
    baseBar.rotation.z = Math.PI / 2;
    baseBar.position.set(0, 0.03, -0.35);
    benchGroup.add(baseBar);

    const baseBarFront = baseBar.clone();
    baseBarFront.position.set(0, 0.03, 0.55);
    benchGroup.add(baseBarFront);

    const spineBeam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.95), steelMat);
    spineBeam.position.set(0, 0.32, 0.1);
    spineBeam.rotation.x = -Math.PI / 6;
    benchGroup.add(spineBeam);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), steelMat);
    pillar.position.set(0, 0.18, 0.35);
    benchGroup.add(pillar);

    scene.add(benchGroup);

    return { barbell, dumbbellL, dumbbellR, latBar, cableRope, pullUpBar, benchGroup, pad };
  };

  // HIGH-PRECISION BIOMECHANICAL KINEMATICS & LASER VECTOR TRACKING
  const applyHighPrecisionKinematics = (type, t, isDriving) => {
    const bones = bonesRef.current;
    const initialQuats = initialQuatsRef.current;
    const initialPos = initialPositionsRef.current;
    const model = modelRootRef.current;
    const eq = equipmentRefs.current;
    const laser = laserAngleRefs.current;
    const muscleGlow = muscleGlowRef.current;

    if (!model || !bones.spine) return;

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
      // 1. ONE-ARM DUMBBELL ROW (Exact Match to Reference Image media_1790406851426.png)
      case 'one-arm-row': {
        model.position.set(0, 0.82, -0.1);
        if (b('spine001')) b('spine001').rotateX(0.72); // 42° forward torso incline
        if (b('thighL')) b('thighL').rotateX(0.15);     // Rear leg back on ball of foot
        if (b('shinL')) b('shinL').rotateX(0.25);
        if (b('thighR')) b('thighR').rotateX(-0.55);    // Front leg forward
        if (b('shinR')) b('shinR').rotateX(0.5);

        // Right arm planted on top lip of incline bench for support
        if (b('upper_armR')) b('upper_armR').rotateX(1.3);
        if (b('forearmR')) b('forearmR').rotateX(0.25);

        // Left working arm rowing dumbbell up to hip
        const rowProgress = t; // 0 = stretch bottom, 1 = peak contraction
        if (b('upper_armL')) {
          b('upper_armL').rotateX(THREE.MathUtils.lerp(0.50, -0.35, rowProgress));
          b('upper_armL').rotateZ(THREE.MathUtils.lerp(-0.10, -0.25, rowProgress));
        }
        if (b('forearmL')) {
          b('forearmL').rotateX(THREE.MathUtils.lerp(0.15, 1.55, rowProgress));
        }

        // Bench position right beneath resting hand
        if (eq.benchGroup) {
          eq.benchGroup.position.set(-0.25, 0.05, 0.45);
        }
        break;
      }

      // 2. SQUAT (NSCA Crease Below Knee, Torso Brace)
      case 'squat': {
        const squatDepth = t * 0.38;
        model.position.set(0, 0.95 - squatDepth, -t * 0.20);
        if (b('spine001')) b('spine001').rotateX(t * 0.32);

        if (b('thighL')) b('thighL').rotateX(-t * 1.25);
        if (b('thighR')) b('thighR').rotateX(-t * 1.25);
        if (b('shinL')) b('shinL').rotateX(t * 1.25);
        if (b('shinR')) b('shinR').rotateX(t * 1.25);

        if (equipmentMode === 'dumbbell') {
          if (b('upper_armL')) b('upper_armL').rotateZ(-0.2);
          if (b('upper_armR')) b('upper_armR').rotateZ(0.2);
          if (b('forearmL')) b('forearmL').rotateX(0.1);
          if (b('forearmR')) b('forearmR').rotateX(0.1);
        } else {
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
        }
        break;
      }

      // 3. FLAT BENCH PRESS (45° Elbow Angle, Sternum-to-Eyes Path)
      case 'bench-press': {
        model.rotation.set(0, -Math.PI / 2, 0);
        model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        model.position.set(0, 0.49, 0.2);

        if (b('thighL')) b('thighL').rotateX(0.8);
        if (b('thighR')) b('thighR').rotateX(0.8);
        if (b('shinL')) b('shinL').rotateX(1.4);
        if (b('shinR')) b('shinR').rotateX(1.4);

        const pressProgress = t;
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

        if (eq.benchGroup) {
          eq.benchGroup.position.set(0, -0.15, 0);
        }
        break;
      }

      // 4. INCLINE PRESS (30° Angle)
      case 'incline-press': {
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
        break;
      }

      // 5. DEADLIFT / RDL
      case 'deadlift': {
        const hinge = (1 - t) * 0.85;
        model.position.set(0, THREE.MathUtils.lerp(0.78, 0.95, t), THREE.MathUtils.lerp(-0.05, 0, t));

        if (b('spine001')) b('spine001').rotateX(hinge);
        if (b('thighL')) b('thighL').rotateX(-hinge * 0.7);
        if (b('thighR')) b('thighR').rotateX(-hinge * 0.7);
        if (b('shinL')) b('shinL').rotateX((1 - t) * 0.25);
        if (b('shinR')) b('shinR').rotateX((1 - t) * 0.25);

        if (b('upper_armL')) {
          b('upper_armL').rotateX((1 - t) * 0.40);
          b('upper_armL').rotateZ(-0.25);
        }
        if (b('upper_armR')) {
          b('upper_armR').rotateX((1 - t) * 0.40);
          b('upper_armR').rotateZ(0.25);
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

        if (b('spine001')) b('spine001').rotateX(THREE.MathUtils.lerp(-0.15, -0.25, t));

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
        break;
      }

      // 7. OVERHEAD PRESS
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
        break;
      }

      // 8. LATERAL RAISE
      case 'lateral-raise': {
        if (b('upper_armL')) b('upper_armL').rotateZ(THREE.MathUtils.lerp(0.1, 1.35, t));
        if (b('upper_armR')) b('upper_armR').rotateZ(THREE.MathUtils.lerp(-0.1, -1.35, t));
        if (b('forearmL')) b('forearmL').rotateX(0.2);
        if (b('forearmR')) b('forearmR').rotateX(0.2);
        break;
      }

      // 9. BICEP CURL
      case 'bicep-curl': {
        if (b('upper_armL')) b('upper_armL').rotateZ(-0.25);
        if (b('upper_armR')) b('upper_armR').rotateZ(0.25);
        if (b('forearmL')) b('forearmL').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));
        if (b('forearmR')) b('forearmR').rotateX(THREE.MathUtils.lerp(0.1, 1.85, t));
        break;
      }

      // 10. TRICEP PUSHDOWN
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

    if (b('handL')) b('handL').getWorldPosition(handLPos);
    if (b('handR')) b('handR').getWorldPosition(handRPos);
    if (b('forearmL')) b('forearmL').getWorldPosition(elbowLPos);
    if (b('shoulderL')) b('shoulderL').getWorldPosition(shoulderLPos);
    if (b('spine004')) b('spine004').getWorldPosition(trapsPos);
    if (b('spine002')) b('spine002').getWorldPosition(latPos);

    // -------------------------------------------------------------
    // DYNAMIC BIOMECHANICAL LASER VECTOR ANGLE TRACKING
    // -------------------------------------------------------------
    if (laser && laser.laserGroup) {
      // Connect Segment 1: Shoulder -> Elbow
      updateLaserSegment(laser.seg1, shoulderLPos, elbowLPos);
      // Connect Segment 2: Elbow -> Wrist/Hand
      updateLaserSegment(laser.seg2, elbowLPos, handLPos);

      // Position Joint Nodes
      laser.nodeShoulder.position.copy(shoulderLPos);
      laser.nodeElbow.position.copy(elbowLPos);
      laser.nodeWrist.position.copy(handLPos);

      // Calculate Real-Time Joint Angle
      const v1 = new THREE.Vector3().subVectors(shoulderLPos, elbowLPos).normalize();
      const v2 = new THREE.Vector3().subVectors(handLPos, elbowLPos).normalize();
      const angleDeg = Math.round(v1.angleTo(v2) * 180 / Math.PI);
      if (!isNaN(angleDeg)) setLiveJointAngle(angleDeg);

      // Color Transition: Green during stretch/eccentric, Hot Orange during contraction
      const isContracted = t > 0.65;
      const coreMat = isContracted ? laser.coreMatOrange : laser.coreMatGreen;
      const haloMat = isContracted ? laser.haloMatOrange : laser.haloMatGreen;

      laser.seg1Core.material = coreMat;
      laser.seg1Halo.material = haloMat;
      laser.seg2Core.material = coreMat;
      laser.seg2Halo.material = haloMat;
      laser.nodeShoulder.material = coreMat;
      laser.nodeElbow.material = coreMat;
      laser.nodeWrist.material = coreMat;
    }

    // -------------------------------------------------------------
    // ACTIVE TARGET MUSCLE GLOW PATCH
    // -------------------------------------------------------------
    if (muscleGlow) {
      // Position on the active muscle (e.g. Left Lat / Upper Back for Rows)
      if (type === 'one-arm-row' || type === 'lat-pulldown') {
        muscleGlow.position.set(latPos.x + 0.12, latPos.y - 0.02, latPos.z - 0.04);
        muscleGlow.rotation.set(0, 0, Math.PI / 4);
      } else if (type === 'bench-press' || type === 'incline-press') {
        muscleGlow.position.set(latPos.x + 0.08, latPos.y + 0.05, latPos.z + 0.12);
      } else {
        muscleGlow.position.set(latPos.x + 0.10, latPos.y, latPos.z);
      }

      // Pulse intensity with contraction: 0.3 at stretch up to 1.3 at peak squeeze
      muscleGlow.material.emissiveIntensity = THREE.MathUtils.lerp(0.35, 1.35, t);
    }

    // BENCH VISIBILITY
    const isBenchEx = type === 'bench-press' || type === 'incline-press' || type === 'one-arm-row';
    if (eq.benchGroup) eq.benchGroup.visible = isBenchEx;

    // -------------------------------------------------------------
    // PRECISE EQUIPMENT TRACKING BASED ON SELECTED EQUIPMENT MODE
    // -------------------------------------------------------------
    if (equipmentMode === 'dumbbell') {
      if (eq.barbell) eq.barbell.visible = false;
      if (eq.latBar) eq.latBar.visible = false;
      if (eq.cableRope) eq.cableRope.visible = false;
      if (eq.pullUpBar) eq.pullUpBar.visible = false;

      if (type === 'one-arm-row') {
        // Working hand holds dumbbell, resting hand empty on bench
        if (eq.dumbbellL) {
          eq.dumbbellL.visible = true;
          eq.dumbbellL.position.copy(handLPos);
        }
        if (eq.dumbbellR) eq.dumbbellR.visible = false;
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
    } else if (equipmentMode === 'barbell') {
      if (eq.dumbbellL) eq.dumbbellL.visible = false;
      if (eq.dumbbellR) eq.dumbbellR.visible = false;
      if (eq.latBar) eq.latBar.visible = false;
      if (eq.cableRope) eq.cableRope.visible = false;
      if (eq.pullUpBar) eq.pullUpBar.visible = false;

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
    } else if (equipmentMode === 'cable') {
      if (eq.barbell) eq.barbell.visible = false;
      if (eq.dumbbellL) eq.dumbbellL.visible = false;
      if (eq.dumbbellR) eq.dumbbellR.visible = false;
      if (eq.pullUpBar) eq.pullUpBar.visible = false;

      if (type === 'lat-pulldown') {
        if (eq.latBar) {
          eq.latBar.visible = true;
          const barCenterY = (handLPos.y + handRPos.y) / 2;
          const barCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.latBar.position.set(0, barCenterY, barCenterZ);
        }
        if (eq.cableRope) eq.cableRope.visible = false;
      } else if (type === 'tricep-pushdown' || type === 'face-pull') {
        if (eq.cableRope) {
          eq.cableRope.visible = true;
          const ropeCenterY = (handLPos.y + handRPos.y) / 2 + 0.12;
          const ropeCenterZ = (handLPos.z + handRPos.z) / 2;
          eq.cableRope.position.set(0, ropeCenterY, ropeCenterZ);
        }
        if (eq.latBar) eq.latBar.visible = false;
      }
    } else if (equipmentMode === 'bodyweight') {
      if (eq.barbell) eq.barbell.visible = false;
      if (eq.dumbbellL) eq.dumbbellL.visible = false;
      if (eq.dumbbellR) eq.dumbbellR.visible = false;
      if (eq.latBar) eq.latBar.visible = false;
      if (eq.cableRope) eq.cableRope.visible = false;
      if (eq.pullUpBar) eq.pullUpBar.visible = type === 'hanging-leg-raise';
    } else {
      if (eq.barbell) eq.barbell.visible = false;
      if (eq.dumbbellL) eq.dumbbellL.visible = false;
      if (eq.dumbbellR) eq.dumbbellR.visible = false;
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

  const defaultMode = getEquipmentMode(exercise);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#011C40]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="ios-glass rounded-[32px] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#54ACBF]/50 bg-white/95 flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#54ACBF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#023859] text-white flex items-center justify-center shadow-md shrink-0">
              <Eye className="w-5 h-5 text-[#A7EBF2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#011C40] truncate">{exercise.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A7EBF2]/60 text-[#023859] text-[10px] font-black uppercase shrink-0">
                  {exercise.equipment}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0 border border-emerald-300">
                  US Standard 🇺🇸
                </span>
              </div>
              <p className="text-xs text-[#26658C] font-medium truncate">
                Target: <strong className="text-[#011C40]">{exercise.primaryMuscle}</strong> • Biomechanical Form Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Real-Time Equipment Mode Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setEquipmentMode('dumbbell')}
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
                onClick={() => setEquipmentMode('barbell')}
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
                  onClick={() => setEquipmentMode(defaultMode)}
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

        {/* Modal Main Body (3D Viewport on Left, Personal Trainer Guide on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
          
          {/* 3D WebGL Viewport Container (Studio Charcoal Slate matching Reference Image) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden shadow-inner bg-[#181c24] border border-[#54ACBF]/40 cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
            >
              {/* Three.js Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block touch-none" />

              {/* Loading Indicator */}
              {modelLoading && (
                <div className="absolute inset-0 bg-[#181c24]/95 flex flex-col items-center justify-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full border-2 border-[#54ACBF] border-t-transparent animate-spin" />
                  <span className="text-xs font-extrabold text-[#A7EBF2]">Calibrating Anatomical Engine...</span>
                </div>
              )}

              {/* Drag Prompt Hint Overlay */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#14171f]/85 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-[#54ACBF]/40 pointer-events-none">
                <Compass className="w-3 h-3 text-[#A7EBF2] animate-spin" style={{ animationDuration: '6s' }} />
                <span>360° Drag Orbit</span>
              </div>

              {/* Live Biomechanical Laser Joint Angle Readout (Green vs Hot Orange) */}
              <div className="absolute top-11 left-3 px-3 py-1 rounded-full bg-[#14171f]/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold flex items-center gap-2 border border-slate-700 pointer-events-none shadow-lg">
                <span className={`w-2.5 h-2.5 rounded-full ${currentPhase === 'concentric' ? 'bg-[#ff5722] shadow-[0_0_8px_#ff5722]' : 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]'}`} />
                <span className="text-slate-200">Joint Angle:</span>
                <span className={`font-black ${currentPhase === 'concentric' ? 'text-[#ff7828]' : 'text-[#4ade80]'}`}>
                  {liveJointAngle}°
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  ({currentPhase === 'concentric' ? 'Peak Squeeze' : 'Optimal Stretch'})
                </span>
              </div>

              {/* Live Rep & Phase Counter */}
              <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-[#14171f]/90 backdrop-blur-md text-white text-[10px] font-mono font-extrabold border border-slate-700">
                  Rep #{repCount}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  currentPhase === 'concentric' 
                    ? 'bg-[#ff5722] text-white shadow-[0_0_12px_rgba(255,87,34,0.6)] animate-pulse' 
                    : 'bg-[#22c55e] text-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                }`}>
                  {currentPhase === 'concentric' ? 'Drive Up ⚡' : 'Controlled 3s 🛡️'}
                </span>
              </div>

              {/* Camera Angle Presets Floating Dock */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2 py-1.5 rounded-2xl bg-[#14171f]/90 backdrop-blur-md border border-slate-700 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-300 hidden sm:inline mr-1">View:</span>
                  <button
                    onClick={() => setCameraAnglePreset('side')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'side' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    Side Profile
                  </button>
                  <button
                    onClick={() => setCameraAnglePreset('iso')}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                      activeAngle === 'iso' ? 'bg-[#54ACBF] text-[#011C40] shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    45° Iso
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

            {/* Quality & Feature Caption */}
            <div className="flex items-center justify-between text-[11px] px-2 text-[#26658C]">
              <span className="flex items-center gap-1.5 font-bold text-[#011C40]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Matte Porcelain Mannequin • Laser Biomechanical Joint Vector
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

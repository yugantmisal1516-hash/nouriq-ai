import * as THREE from 'three';

/**
 * Creates the high-tech 3D neon laser vector angle & dynamic arc system.
 */
export function createLaserAngleSystem(scene) {
  const laserGroup = new THREE.Group();

  // Emissive glowing materials
  const coreMatGreen = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const haloMatGreen = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.55 });

  const coreMatOrange = new THREE.MeshBasicMaterial({ color: 0xff5722 });
  const haloMatOrange = new THREE.MeshBasicMaterial({ color: 0xff8533, transparent: true, opacity: 0.65 });

  const coreMatRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const haloMatRed = new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.70 });

  // Segment 1 (Shoulder to Elbow / Hip to Knee)
  const seg1Core = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 16), coreMatGreen);
  const seg1Halo = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1, 16), haloMatGreen);
  const seg1 = new THREE.Group();
  seg1.add(seg1Core);
  seg1.add(seg1Halo);
  laserGroup.add(seg1);

  // Segment 2 (Elbow to Wrist / Knee to Ankle)
  const seg2Core = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 16), coreMatGreen);
  const seg2Halo = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1, 16), haloMatGreen);
  const seg2 = new THREE.Group();
  seg2.add(seg2Core);
  seg2.add(seg2Halo);
  laserGroup.add(seg2);

  // Joint Nodes (Spheres at Joint A, Pivot, Joint B)
  const nodeA = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), coreMatGreen);
  const nodePivot = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 16), coreMatGreen);
  const nodeB = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), coreMatGreen);

  laserGroup.add(nodeA);
  laserGroup.add(nodePivot);
  laserGroup.add(nodeB);

  // Dynamic Angular Arc between the segments
  const arcGeom = new THREE.TorusGeometry(0.12, 0.008, 8, 32, Math.PI / 2);
  const arcMesh = new THREE.Mesh(arcGeom, coreMatGreen);
  arcMesh.visible = false;
  laserGroup.add(arcMesh);

  scene.add(laserGroup);

  return {
    laserGroup,
    seg1,
    seg2,
    seg1Core,
    seg1Halo,
    seg2Core,
    seg2Halo,
    nodeA,
    nodePivot,
    nodeB,
    arcMesh,
    coreMatGreen,
    haloMatGreen,
    coreMatOrange,
    haloMatOrange,
    coreMatRed,
    haloMatRed
  };
}

/**
 * Updates a 3D cylinder segment to connect two world positions pA and pB.
 */
export function updateLaserSegment(group, pA, pB) {
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
}

/**
 * Creates 3D Motion Trajectory Path ribbons.
 */
export function createMotionTrajectorySystem(scene) {
  const trajectoryGroup = new THREE.Group();

  const correctMat = new THREE.MeshBasicMaterial({ 
    color: 0x22c55e, 
    transparent: true, 
    opacity: 0.85 
  });
  const mistakeMat = new THREE.MeshBasicMaterial({ 
    color: 0xef4444, 
    transparent: true, 
    opacity: 0.85 
  });

  // Curve tube mesh
  let trajectoryMesh = null;

  scene.add(trajectoryGroup);

  const updateTrajectory = (points, isMistake = false) => {
    if (!points || points.length < 2) {
      if (trajectoryMesh) trajectoryMesh.visible = false;
      return;
    }

    if (trajectoryMesh) {
      trajectoryGroup.remove(trajectoryMesh);
      trajectoryMesh.geometry.dispose();
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 24, 0.010, 8, false);
    trajectoryMesh = new THREE.Mesh(tubeGeom, isMistake ? mistakeMat : correctMat);
    trajectoryGroup.add(trajectoryMesh);
  };

  const setVisible = (visible) => {
    trajectoryGroup.visible = visible;
  };

  return { trajectoryGroup, updateTrajectory, setVisible };
}

/**
 * Creates Primary and Secondary Target Muscle Glow patches.
 */
export function createMuscleTargetSystem(scene) {
  const muscleGroup = new THREE.Group();

  // Primary muscle material (Bright warm amber/orange)
  const primaryMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff6600,
    emissiveIntensity: 0.8,
    roughness: 0.35,
    transparent: true,
    opacity: 0.90
  });

  // Secondary muscle material (Subtle warm amber/cyan)
  const secondaryMat = new THREE.MeshStandardMaterial({
    color: 0x54acbf,
    emissive: 0x54acbf,
    emissiveIntensity: 0.45,
    roughness: 0.4,
    transparent: true,
    opacity: 0.75
  });

  const primaryPatch = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16, 0, Math.PI, 0, Math.PI / 1.5),
    primaryMat
  );
  muscleGroup.add(primaryPatch);

  const secondaryPatch = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 16, 16, 0, Math.PI, 0, Math.PI / 1.5),
    secondaryMat
  );
  muscleGroup.add(secondaryPatch);

  scene.add(muscleGroup);

  return { muscleGroup, primaryPatch, secondaryPatch, primaryMat, secondaryMat };
}

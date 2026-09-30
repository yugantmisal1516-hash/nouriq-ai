import * as THREE from 'three';

/**
 * Creates high-fidelity 3D gym equipment models matching commercial fitness standards.
 */
export function createGymEquipment(scene, exercise, initialMode) {
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x16191f, roughness: 0.4, metalness: 0.85 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
  const plateCastMat = new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.6, metalness: 0.5 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.65, metalness: 0.1 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.8, metalness: 0.1 });

  const isLatPulldown = exercise?.kinematicType === 'lat-pulldown' || exercise?.id === 'lat-pulldown';

  // 1. OLYMPIC BARBELL ROD (2.15m knurled chrome shaft with dual 20kg bumper plates)
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
  barbell.visible = initialMode === 'barbell';
  scene.add(barbell);

  // 2. COMMERCIAL PRO ROUND DUMBBELLS (Matching Reference Image)
  function createProDumbbell() {
    const db = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 14), chromeMat);
    handle.rotation.z = Math.PI / 2;
    db.add(handle);

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
  dumbbellL.visible = initialMode === 'dumbbell';
  dumbbellR.visible = initialMode === 'dumbbell' && exercise?.kinematicType !== 'one-arm-row';
  scene.add(dumbbellL);
  scene.add(dumbbellR);

  // 3. WIDE LAT PULLDOWN CABLE BAR & DEDICATED STATION
  const latBar = new THREE.Group();
  
  // Central chrome bar: 0.86m straight section
  const latShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.86, 16), chromeMat);
  latShaft.rotation.z = Math.PI / 2;
  latBar.add(latShaft);

  // Ergonomic angled outer drop grips: 0.20m long at ±0.46m (matching lifter's wide hand separation)
  const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.20, 14), steelMat);
  gripL.position.set(0.48, -0.05, 0.02);
  gripL.rotation.z = Math.PI / 5;
  latBar.add(gripL);

  const gripR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.20, 14), steelMat);
  gripR.position.set(-0.48, -0.05, 0.02);
  gripR.rotation.z = -Math.PI / 5;
  latBar.add(gripR);

  // Center chrome swivel ring
  const latSwivel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12), chromeMat);
  latSwivel.position.set(0, 0.02, 0);
  latBar.add(latSwivel);

  // Overhead High-Pulley Cable Wire (connecting bar swivel to overhead pulley tower at y = 2.25m)
  const latCableWire = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.5, 8), chromeMat);
  latCableWire.position.set(0, 0.75, 0);
  latBar.add(latCableWire);

  latBar.visible = initialMode === 'cable' && isLatPulldown;
  scene.add(latBar);

  // DEDICATED LAT PULLDOWN MACHINE STATION
  const latStation = new THREE.Group();

  // Floor Base Rails (dark steel)
  const baseRailL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.30), steelMat);
  baseRailL.position.set(0.32, 0.03, 0.15);
  latStation.add(baseRailL);

  const baseRailR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.30), steelMat);
  baseRailR.position.set(-0.32, 0.03, 0.15);
  latStation.add(baseRailR);

  const baseCrossFront = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.06, 0.06), steelMat);
  baseCrossFront.position.set(0, 0.03, 0.75);
  latStation.add(baseCrossFront);

  const baseCrossRear = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.06, 0.06), steelMat);
  baseCrossRear.position.set(0, 0.03, -0.45);
  latStation.add(baseCrossRear);

  // Central Frame Spine
  const stationSpine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.10), steelMat);
  stationSpine.position.set(0, 0.04, 0.15);
  latStation.add(stationSpine);

  // Seat Support Post & Ergonomic Contoured Seat Pad
  const seatPost = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.38, 0.07), steelMat);
  seatPost.position.set(0, 0.22, 0.02);
  latStation.add(seatPost);

  const latSeatPad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.34), leatherMat);
  latSeatPad.position.set(0, 0.44, 0.02);
  latSeatPad.receiveShadow = true;
  latStation.add(latSeatPad);

  // Adjustable Thigh Lock-Down Roller Assembly
  const thighPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.06), steelMat);
  thighPost.position.set(0, 0.28, 0.30);
  latStation.add(thighPost);

  const rollerCrossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.56, 16), chromeMat);
  rollerCrossbar.rotation.z = Math.PI / 2;
  rollerCrossbar.position.set(0, 0.54, 0.30);
  latStation.add(rollerCrossbar);

  // Left & Right Thick Round Foam Rollers (locking quadriceps down)
  const rollerPadL = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.20, 20), leatherMat);
  rollerPadL.rotation.z = Math.PI / 2;
  rollerPadL.position.set(0.16, 0.54, 0.30);
  latStation.add(rollerPadL);

  const rollerPadR = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.20, 20), leatherMat);
  rollerPadR.rotation.z = Math.PI / 2;
  rollerPadR.position.set(-0.16, 0.54, 0.30);
  latStation.add(rollerPadR);

  // Vertical Weight Tower Column (in front of the lifter at z = 0.65)
  const towerColumn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.25, 0.08), steelMat);
  towerColumn.position.set(0, 1.15, 0.65);
  latStation.add(towerColumn);

  // Weight Stack Guide Rods & Weight Shroud (adds authentic gym depth)
  const stackShroud = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.20, 0.16), plateCastMat);
  stackShroud.position.set(0, 0.70, 0.72);
  latStation.add(stackShroud);

  // Overhead Cantilever Boom extending back towards the lifter at y = 2.25, z = 0.10
  const overheadBoom = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.60), steelMat);
  overheadBoom.position.set(0, 2.25, 0.35);
  latStation.add(overheadBoom);

  // Overhead Pulley Wheel & Housing
  const pulleyHousing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.10), steelMat);
  pulleyHousing.position.set(0, 2.25, 0.10);
  latStation.add(pulleyHousing);

  const pulleyWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24), chromeMat);
  pulleyWheel.rotation.z = Math.PI / 2;
  pulleyWheel.position.set(0, 2.25, 0.10);
  latStation.add(pulleyWheel);

  latStation.visible = initialMode === 'cable' && isLatPulldown;
  scene.add(latStation);

  // 4. BRAIDED CABLE ROPE ATTACHMENT
  const cableRope = new THREE.Group();
  const ropeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12), chromeMat);
  cableRope.add(ropeTop);

  const ropeCordL = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.32, 12), ropeMat);
  ropeCordL.position.set(0.10, -0.16, 0);
  ropeCordL.rotation.z = -Math.PI / 7;
  cableRope.add(ropeCordL);

  const ropeCordR = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.32, 12), ropeMat);
  ropeCordR.position.set(-0.10, -0.16, 0);
  ropeCordR.rotation.z = Math.PI / 7;
  cableRope.add(ropeCordR);

  const ropeBallL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), steelMat);
  ropeBallL.position.set(0.18, -0.30, 0);
  cableRope.add(ropeBallL);

  const ropeBallR = ropeBallL.clone();
  ropeBallR.position.set(-0.18, -0.30, 0);
  cableRope.add(ropeBallR);

  // Overhead High-Pulley Cable Wire (connecting top chrome clamp to overhead cable crossover beam)
  const cableWire = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.5, 8), chromeMat);
  cableWire.position.set(0, 0.75, 0);
  cableRope.add(cableWire);

  cableRope.visible = initialMode === 'cable' && !isLatPulldown;
  scene.add(cableRope);

  // 5. OVERHEAD PULL-UP BAR
  const pullUpBar = new THREE.Group();
  const puShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.3, 16), steelMat);
  puShaft.rotation.z = Math.PI / 2;
  puShaft.position.set(0, 2.15, 0);
  pullUpBar.add(puShaft);
  pullUpBar.visible = false;
  scene.add(pullUpBar);

  // 6. COMMERCIAL INCLINE / FLAT GYM BENCH
  const benchGroup = new THREE.Group();

  // Floor Base & Stabilizers
  const baseBarRear = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.58, 16), steelMat);
  baseBarRear.rotation.z = Math.PI / 2;
  baseBarRear.position.set(0, 0.028, -0.65);
  benchGroup.add(baseBarRear);

  const baseBarFront = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.58, 16), steelMat);
  baseBarFront.rotation.z = Math.PI / 2;
  baseBarFront.position.set(0, 0.028, 0.48);
  benchGroup.add(baseBarFront);

  // Central Longitudinal Main Steel Spine Beam
  const mainSpine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 1.15), steelMat);
  mainSpine.position.set(0, 0.04, -0.08);
  benchGroup.add(mainSpine);

  // Vertical Upright Support Pillars
  const frontPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), steelMat);
  frontPillar.position.set(0, 0.22, 0.22);
  benchGroup.add(frontPillar);

  const pivotPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), steelMat);
  pivotPillar.position.set(0, 0.22, 0.06);
  benchGroup.add(pivotPillar);

  const rearPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.06), steelMat);
  rearPillar.position.set(0, 0.22, -0.42);
  benchGroup.add(rearPillar);

  // Ergonomic Commercial Seat Pad
  const seatPad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.26), leatherMat);
  seatPad.position.set(0, 0.42, 0.22);
  seatPad.rotation.x = -0.10; // slight ergonomic incline to hold hips
  seatPad.receiveShadow = true;
  benchGroup.add(seatPad);

  // Adjustable Incline Back Pad Pivot Group (Hinged at seat boundary z = 0.06, y = 0.41)
  const padPivot = new THREE.Group();
  padPivot.position.set(0, 0.41, 0.06);

  // Back Pad Leather Cushion
  const backPadMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.82), leatherMat);
  backPadMesh.position.set(0, 0.03, -0.41);
  backPadMesh.receiveShadow = true;
  padPivot.add(backPadMesh);

  // Steel Reinforcement Plate beneath the back pad
  const padSpine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.80), steelMat);
  padSpine.position.set(0, -0.02, -0.41);
  padPivot.add(padSpine);

  // Incline Support Strut (connecting frame to back pad)
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.38, 12), chromeMat);
  strut.position.set(0, 0.22, -0.22);
  strut.rotation.x = Math.PI / 4;
  benchGroup.add(strut);

  benchGroup.add(padPivot);

  const isBenchEx = ['bench-press', 'incline-press', 'one-arm-row', 'overhead-press'].includes(exercise?.kinematicType);
  benchGroup.visible = isBenchEx;
  const isIncline = exercise?.kinematicType === 'incline-press';
  const isOverhead = exercise?.kinematicType === 'overhead-press';
  if (isOverhead) {
    padPivot.rotation.x = 1.40; // 80° upright utility bench
    strut.visible = true;
  } else if (isIncline) {
    padPivot.rotation.x = Math.PI / 6; // 30° incline
    strut.visible = true;
  } else {
    padPivot.rotation.x = 0; // flat
    strut.visible = false;
  }
  scene.add(benchGroup);

  return { barbell, dumbbellL, dumbbellR, latBar, latCableWire, latStation, cableRope, ropeCordL, ropeCordR, ropeBallL, ropeBallR, cableWire, pullUpBar, benchGroup, pad: padPivot, strut };
}

import * as THREE from 'three';

export type TimeOfDay = 'DAY_SUNNY' | 'MORNING_GOLDEN' | 'AFTERNOON_CLEAR' | 'MOUNTAIN_RAIN' | 'NIGHT_FLIR';

export type MapPresetId = 
  | 'LA_COLINA_CAMPUS'
  | 'MEDELLIN_DOWNTOWN'
  | 'LAS_PALMAS_HIGHWAY'
  | 'ENVIGADO_FOOTHILLS'
  | 'SANTA_ELENA_FOREST';

export interface MapPreset {
  id: MapPresetId;
  name: string;
  tagline: string;
  location: string;
  coordinates: string;
  elevationMeters: number;
  description: string;
  droneLaunchPos: [number, number, number];
  incidentTargetPos: [number, number, number];
  defaultCameraPos: [number, number, number];
  defaultCameraLookAt: [number, number, number];
  targetType: string;
  suggestedPayload: string;
}

export const MAP_PRESETS: Record<MapPresetId, MapPreset> = {
  LA_COLINA_CAMPUS: {
    id: 'LA_COLINA_CAMPUS',
    name: 'Colegio Campestre La Colina & Loma Los Balsos',
    tagline: 'Home & School Grounds • Primary Project Focus',
    location: 'Calle 12 Sur # 18 - 173, Loma Los Balsos, El Poblado, Medellín',
    coordinates: '6.1955° N, -75.5685° W',
    elevationMeters: 1740,
    description: 'School campus with Science & Robotics Wing vertiport, classrooms, synthetic soccer field, entrance gate on Calle 12 Sur, and adjacent student residential neighborhood along winding Loma Los Balsos.',
    droneLaunchPos: [-45, 14, 20], // Science lab rooftop
    incidentTargetPos: [50, 1.2, -35], // Soccer field
    defaultCameraPos: [0, 80, 130],
    defaultCameraLookAt: [0, 5, 0],
    targetType: 'Sports Injury / Debris on Soccer Field',
    suggestedPayload: 'Rapid Medical First-Aid & Ankle Splint Trauma Pod',
  },
  MEDELLIN_DOWNTOWN: {
    id: 'MEDELLIN_DOWNTOWN',
    name: 'Medellín Aburrá Valley & El Poblado City Center',
    tagline: 'Urban Skyline • High-Rise Towers & Highway Corridor',
    location: 'Avenida El Poblado & Milla de Oro, Medellín, Antioquia',
    coordinates: '6.2085° N, -75.5670° W',
    elevationMeters: 1495,
    description: 'Dense metropolitan center with commercial glass towers, residential brick high-rises, multi-lane urban avenue with zebra crosswalks, river canal overpass, and hospital rooftop landing zone.',
    droneLaunchPos: [-80, 48, 60], // Hospital tower helipad
    incidentTargetPos: [35, 1.2, -40], // City intersection
    defaultCameraPos: [0, 100, 160],
    defaultCameraLookAt: [0, 15, -10],
    targetType: 'Multi-Vehicle Urban Intersection Collision',
    suggestedPayload: 'Tourniquet & Vital Signs Telemetry Transmitter',
  },
  LAS_PALMAS_HIGHWAY: {
    id: 'LAS_PALMAS_HIGHWAY',
    name: 'Vía Las Palmas & Alto de Las Palmas Pass',
    tagline: 'Mountain Highway • Steep Cliffs, Hairpin Turns & Ravines',
    location: 'Carretera Las Palmas km 14, Medellín - Rionegro corridor',
    coordinates: '6.1820° N, -75.5340° W',
    elevationMeters: 2280,
    description: 'Scenic mountain expressway winding through steep Andean slopes with metal guardrails, roadside mirador viewpoints, dense pine forests, and high-altitude mountain winds.',
    droneLaunchPos: [-90, 36, 120], // Highway lookout station
    incidentTargetPos: [20, 2.0, -110], // Mountain ravine turn
    defaultCameraPos: [-30, 95, 150],
    defaultCameraLookAt: [0, 10, -30],
    targetType: 'Vehicle Rolled Off Mountain Hairpin Curve',
    suggestedPayload: 'Winch Emergency Beacon & Oxygen Supply Pod',
  },
  ENVIGADO_FOOTHILLS: {
    id: 'ENVIGADO_FOOTHILLS',
    name: 'Envigado & Sabaneta Valley Foothills',
    tagline: 'Colonial & Residential Community • Terracotta Roofs',
    location: 'Parque de Envigado & Loma de Las Brujas, Envigado',
    coordinates: '6.1680° N, -75.5820° W',
    elevationMeters: 1575,
    description: 'Traditional community foothills with clay tile rooftops, palm-lined neighborhood plazas, local fire station (Bomberos), and suburban street grid.',
    droneLaunchPos: [-60, 22, 50], // Fire station rooftop
    incidentTargetPos: [45, 1.2, -20], // Residential courtyard
    defaultCameraPos: [0, 75, 120],
    defaultCameraLookAt: [10, 5, 0],
    targetType: 'Residential Structural Roof Distress',
    suggestedPayload: 'Emergency Defibrillator & Bio-Monitor Kit',
  },
  SANTA_ELENA_FOREST: {
    id: 'SANTA_ELENA_FOREST',
    name: 'Santa Elena & Arví Cloud Forest Reserve',
    tagline: 'Dense Cloud Forest • Native Oak & Mountain Trails',
    location: 'Parque Regional Arví, Corregimiento Santa Elena, Medellín',
    coordinates: '6.2820° N, -75.5030° W',
    elevationMeters: 2500,
    description: 'High-altitude protected Andean cloud forest with thick eucalyptus and pine canopy, mossy ravines, wooden ranger lodge, and mountain trails.',
    droneLaunchPos: [-70, 28, 80], // Ranger station pad
    incidentTargetPos: [40, 3.5, -60], // Trail clearing under canopy
    defaultCameraPos: [0, 85, 140],
    defaultCameraLookAt: [0, 10, -10],
    targetType: 'Lost Hiker Hypothermia Distress',
    suggestedPayload: 'Thermal Blanket, Satellite Radio & Water Pod',
  },
};

/**
 * Creates genuine 3D, wide, flat horizontal asphalt roads with 3D concrete curbs,
 * yellow double-center divider lines, white shoulder markings, crosswalks, and guardrails.
 * Eliminates the vertical-line glitch caused by ExtrudeGeometry on horizontal curves!
 */
export function create3DRealisticRoad(
  target: THREE.Object3D,
  roadCurve: THREE.Curve<THREE.Vector3>,
  options: {
    width?: number;
    curbWidth?: number;
    curbHeight?: number;
    asphaltColor?: number;
    curbColor?: number;
    hasCurbs?: boolean;
    hasDoubleYellow?: boolean;
    hasWhiteEdges?: boolean;
    hasZebraCrossing?: boolean;
    zebraCrossingT?: number;
    hasGuardrails?: boolean;
    hasStreetLights?: boolean;
    steps?: number;
  } = {}
) {
  const width = options.width ?? 14;
  const curbWidth = options.curbWidth ?? 0.6;
  const curbHeight = options.curbHeight ?? 0.32;
  const asphaltColor = options.asphaltColor ?? 0x1f2937;
  const curbColor = options.curbColor ?? 0x94a3b8;
  const steps = options.steps ?? 100;

  const points: THREE.Vector3[] = [];
  const tangents: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = []; // horizontal normals in XZ plane

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = roadCurve.getPoint(t);
    const tan = roadCurve.getTangent(t).normalize();

    // Horizontal normal strictly in the XZ ground plane
    let nx = -tan.z;
    let nz = tan.x;
    const len = Math.hypot(nx, nz);
    if (len > 0.0001) {
      nx /= len;
      nz /= len;
    } else {
      nx = 1;
      nz = 0;
    }

    points.push(p);
    tangents.push(tan);
    normals.push(new THREE.Vector3(nx, 0, nz));
  }

  // 1. Asphalt Flat Ribbon Mesh
  const asphaltGeo = new THREE.BufferGeometry();
  const vertCount = (steps + 1) * 2;
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const indices: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const p = points[i];
    const n = normals[i];
    const halfW = width * 0.5;

    // Left vertex
    const lx = p.x - n.x * halfW;
    const ly = p.y + 0.12; // Flat above ground
    const lz = p.z - n.z * halfW;

    // Right vertex
    const rx = p.x + n.x * halfW;
    const ry = p.y + 0.12;
    const rz = p.z + n.z * halfW;

    const idx = i * 2;
    positions[idx * 3] = lx;
    positions[idx * 3 + 1] = ly;
    positions[idx * 3 + 2] = lz;

    positions[(idx + 1) * 3] = rx;
    positions[(idx + 1) * 3 + 1] = ry;
    positions[(idx + 1) * 3 + 2] = rz;

    uvs[idx * 2] = 0;
    uvs[idx * 2 + 1] = i * 0.2;
    uvs[(idx + 1) * 2] = 1;
    uvs[(idx + 1) * 2 + 1] = i * 0.2;

    if (i < steps) {
      const v0 = idx;
      const v1 = idx + 1;
      const v2 = idx + 2;
      const v3 = idx + 3;

      indices.push(v0, v1, v2);
      indices.push(v1, v3, v2);
    }
  }

  asphaltGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  asphaltGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  asphaltGeo.setIndex(indices);
  asphaltGeo.computeVertexNormals();

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: asphaltColor,
    roughness: 0.85,
    metalness: 0.1,
  });
  const asphaltMesh = new THREE.Mesh(asphaltGeo, asphaltMat);
  asphaltMesh.receiveShadow = true;
  target.add(asphaltMesh);

  // 2. 3D Concrete Curbs on Left and Right Sides
  if (options.hasCurbs !== false) {
    const buildCurb = (isLeft: boolean) => {
      const curbGeo = new THREE.BufferGeometry();
      const cVerts: number[] = [];
      const cIndices: number[] = [];

      for (let i = 0; i <= steps; i++) {
        const p = points[i];
        const n = normals[i];
        const sign = isLeft ? -1 : 1;
        const innerDist = width * 0.5 * sign;
        const outerDist = (width * 0.5 + curbWidth) * sign;

        // Inner edge at asphalt height
        const pInner = new THREE.Vector3(p.x + n.x * innerDist, p.y + 0.12, p.z + n.z * innerDist);
        // Top edge raised
        const pTop = new THREE.Vector3(p.x + n.x * innerDist, p.y + 0.12 + curbHeight, p.z + n.z * innerDist);
        // Outer top edge
        const pOuterTop = new THREE.Vector3(p.x + n.x * outerDist, p.y + 0.12 + curbHeight, p.z + n.z * outerDist);
        // Outer bottom drop
        const pOuterBottom = new THREE.Vector3(p.x + n.x * outerDist, p.y - 0.05, p.z + n.z * outerDist);

        cVerts.push(
          pInner.x, pInner.y, pInner.z,
          pTop.x, pTop.y, pTop.z,
          pOuterTop.x, pOuterTop.y, pOuterTop.z,
          pOuterBottom.x, pOuterBottom.y, pOuterBottom.z
        );

        if (i < steps) {
          const base = i * 4;
          const next = (i + 1) * 4;

          // Vertical face (Inner to Top)
          cIndices.push(base, base + 1, next);
          cIndices.push(base + 1, next + 1, next);

          // Horizontal face (Top to OuterTop)
          cIndices.push(base + 1, base + 2, next + 1);
          cIndices.push(base + 2, next + 2, next + 1);

          // Outer face (OuterTop to OuterBottom)
          cIndices.push(base + 2, base + 3, next + 2);
          cIndices.push(base + 3, next + 3, next + 2);
        }
      }

      curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(cVerts, 3));
      curbGeo.setIndex(cIndices);
      curbGeo.computeVertexNormals();

      const curbMat = new THREE.MeshStandardMaterial({
        color: curbColor,
        roughness: 0.9,
        metalness: 0.05,
      });
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      curbMesh.castShadow = true;
      curbMesh.receiveShadow = true;
      target.add(curbMesh);
    };

    buildCurb(true); // Left curb
    buildCurb(false); // Right curb
  }

  // 3. Double Yellow Center Line Markings (Flat strip at Y + 0.15)
  if (options.hasDoubleYellow !== false) {
    const buildStripe = (offsetMeters: number) => {
      const stripeGeo = new THREE.BufferGeometry();
      const sPositions = new Float32Array((steps + 1) * 2 * 3);
      const sIndices: number[] = [];
      const halfStripe = 0.14;

      for (let i = 0; i <= steps; i++) {
        const p = points[i];
        const n = normals[i];
        const centerOffset = offsetMeters;

        const lx = p.x + n.x * (centerOffset - halfStripe);
        const ly = p.y + 0.16;
        const lz = p.z + n.z * (centerOffset - halfStripe);

        const rx = p.x + n.x * (centerOffset + halfStripe);
        const ry = p.y + 0.16;
        const rz = p.z + n.z * (centerOffset + halfStripe);

        const idx = i * 2;
        sPositions[idx * 3] = lx;
        sPositions[idx * 3 + 1] = ly;
        sPositions[idx * 3 + 2] = lz;

        sPositions[(idx + 1) * 3] = rx;
        sPositions[(idx + 1) * 3 + 1] = ry;
        sPositions[(idx + 1) * 3 + 2] = rz;

        if (i < steps) {
          sIndices.push(idx, idx + 1, idx + 2);
          sIndices.push(idx + 1, idx + 3, idx + 2);
        }
      }

      stripeGeo.setAttribute('position', new THREE.BufferAttribute(sPositions, 3));
      stripeGeo.setIndex(sIndices);
      stripeGeo.computeVertexNormals();

      const yellowMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15, // Bright Colombian road yellow
        side: THREE.DoubleSide,
      });
      const yellowMesh = new THREE.Mesh(stripeGeo, yellowMat);
      target.add(yellowMesh);
    };

    buildStripe(-0.25); // Left yellow line
    buildStripe(0.25);  // Right yellow line
  }

  // 4. White Shoulder Boundary Lines
  if (options.hasWhiteEdges !== false) {
    const buildWhiteEdge = (sideSign: number) => {
      const edgeGeo = new THREE.BufferGeometry();
      const ePos = new Float32Array((steps + 1) * 2 * 3);
      const eIdx: number[] = [];
      const dist = (width * 0.5 - 0.7) * sideSign;
      const halfW = 0.12;

      for (let i = 0; i <= steps; i++) {
        const p = points[i];
        const n = normals[i];

        const lx = p.x + n.x * (dist - halfW);
        const ly = p.y + 0.16;
        const lz = p.z + n.z * (dist - halfW);

        const rx = p.x + n.x * (dist + halfW);
        const ry = p.y + 0.16;
        const rz = p.z + n.z * (dist + halfW);

        const idx = i * 2;
        ePos[idx * 3] = lx;
        ePos[idx * 3 + 1] = ly;
        ePos[idx * 3 + 2] = lz;

        ePos[(idx + 1) * 3] = rx;
        ePos[(idx + 1) * 3 + 1] = ry;
        ePos[(idx + 1) * 3 + 2] = rz;

        if (i < steps) {
          eIdx.push(idx, idx + 1, idx + 2);
          eIdx.push(idx + 1, idx + 3, idx + 2);
        }
      }

      edgeGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
      edgeGeo.setIndex(eIdx);
      edgeGeo.computeVertexNormals();

      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const whiteMesh = new THREE.Mesh(edgeGeo, whiteMat);
      target.add(whiteMesh);
    };

    buildWhiteEdge(-1);
    buildWhiteEdge(1);
  }

  // 5. Pedestrian Zebra Crossings (School & Urban Zone Crosswalk)
  if (options.hasZebraCrossing !== false) {
    const tCross = options.zebraCrossingT ?? 0.38;
    const centerPt = roadCurve.getPoint(tCross);
    const tan = roadCurve.getTangent(tCross).normalize();
    let nx = -tan.z;
    let nz = tan.x;
    const len = Math.hypot(nx, nz);
    nx /= len;
    nz /= len;

    const crossGroup = new THREE.Group();
    const stripeCount = 10;
    const totalW = width - 2.5;
    const stepW = totalW / (stripeCount - 1);

    for (let s = 0; s < stripeCount; s++) {
      const offset = -totalW * 0.5 + s * stepW;
      const stripeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 3.8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      stripeMesh.rotateX(-Math.PI / 2);
      stripeMesh.position.set(
        centerPt.x + nx * offset,
        centerPt.y + 0.17,
        centerPt.z + nz * offset
      );
      // Align rotation with road tangent
      stripeMesh.rotation.z = Math.atan2(tan.x, tan.z);
      crossGroup.add(stripeMesh);
    }
    target.add(crossGroup);
  }

  // 6. 3D Metal Guardrails on Mountain Turns
  if (options.hasGuardrails) {
    const guardrailGroup = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });

    for (let i = 2; i < steps; i += 3) {
      const p = points[i];
      const n = normals[i];
      const sign = i % 2 === 0 ? 1 : -1;
      const postX = p.x + n.x * (width * 0.5 + 0.8) * sign;
      const postZ = p.z + n.z * (width * 0.5 + 0.8) * sign;

      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(postX, p.y + 0.55, postZ);
      guardrailGroup.add(post);
    }
    target.add(guardrailGroup);
  }

  // 7. Modern Street Lights along the Road
  if (options.hasStreetLights !== false) {
    const lightsGroup = new THREE.Group();
    for (let i = 4; i < steps; i += 7) {
      const p = points[i];
      const n = normals[i];
      const side = (i / 7) % 2 === 0 ? 1 : -1;
      const lx = p.x + n.x * (width * 0.5 + 1.6) * side;
      const lz = p.z + n.z * (width * 0.5 + 1.6) * side;

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 9, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
      );
      pole.position.set(lx, p.y + 4.5, lz);
      lightsGroup.add(pole);

      // Arm reaching out over road
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.15, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      arm.position.set(lx - n.x * 1.0 * side, p.y + 8.8, lz - n.z * 1.0 * side);
      lightsGroup.add(arm);

      // Lamp head
      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.2, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.5 })
      );
      lampHead.position.set(lx - n.x * 2.0 * side, p.y + 8.6, lz - n.z * 2.0 * side);
      lightsGroup.add(lampHead);
    }
    target.add(lightsGroup);
  }

  return { asphaltMesh, points, tangents, normals };
}

/**
 * Transforms the scene into true daytime (bright sun, blue sky, clouds, lush greenery)
 * or user-selected time of day / atmosphere.
 */
export function setupDaylightSkyAndAtmosphere(
  scene: THREE.Scene,
  timeOfDay: TimeOfDay = 'DAY_SUNNY'
) {
  // Clear any existing sky or sun lights/meshes tagged
  const existingSun = scene.getObjectByName('MAP_SUN_LIGHT');
  if (existingSun) scene.remove(existingSun);
  const existingAmbient = scene.getObjectByName('MAP_AMBIENT_LIGHT');
  if (existingAmbient) scene.remove(existingAmbient);
  const existingHemi = scene.getObjectByName('MAP_HEMI_LIGHT');
  if (existingHemi) scene.remove(existingHemi);
  const existingSunMesh = scene.getObjectByName('MAP_SUN_MESH');
  if (existingSunMesh) scene.remove(existingSunMesh);
  const existingClouds = scene.getObjectByName('MAP_CLOUDS_GROUP');
  if (existingClouds) scene.remove(existingClouds);

  let bgColor = 0x38bdf8; // Radiant day sky
  let fogColor = 0xbae6fd;
  let fogDensity = 0.0009;
  let sunColor = 0xfffaed;
  let sunIntensity = 2.6;
  let sunPos = new THREE.Vector3(180, 360, 140);
  let ambientColor = 0xdbeafe;
  let ambientIntensity = 2.0;
  let hemiSky = 0xbae6fd;
  let hemiGround = 0x2e5c36;
  let hemiIntensity = 1.2;
  let showSunMesh = true;

  if (timeOfDay === 'DAY_SUNNY') {
    bgColor = 0x38bdf8; // Crystal-clear blue sky
    fogColor = 0xbae6fd;
    fogDensity = 0.0009;
    sunColor = 0xfffaed;
    sunIntensity = 2.7;
    sunPos = new THREE.Vector3(140, 380, 120);
    ambientColor = 0xe0f2fe;
    ambientIntensity = 2.1;
  } else if (timeOfDay === 'MORNING_GOLDEN') {
    bgColor = 0xfb923c; // Warm Colombian morning orange-gold
    fogColor = 0xfdba74;
    fogDensity = 0.0011;
    sunColor = 0xffedd5;
    sunIntensity = 2.4;
    sunPos = new THREE.Vector3(260, 160, 100);
    ambientColor = 0xffedd5;
    ambientIntensity = 1.8;
  } else if (timeOfDay === 'AFTERNOON_CLEAR') {
    bgColor = 0x60a5fa; // Soft afternoon blue
    fogColor = 0xbfdbfe;
    fogDensity = 0.0008;
    sunColor = 0xfff7ed;
    sunIntensity = 2.4;
    sunPos = new THREE.Vector3(-140, 320, 160);
    ambientColor = 0xdbeafe;
    ambientIntensity = 2.0;
  } else if (timeOfDay === 'MOUNTAIN_RAIN') {
    bgColor = 0x64748b; // Daylight overcast mountain rain
    fogColor = 0x94a3b8;
    fogDensity = 0.0035;
    sunColor = 0xcfd8dc;
    sunIntensity = 1.2;
    sunPos = new THREE.Vector3(60, 240, 60);
    ambientColor = 0x94a3b8;
    ambientIntensity = 1.4;
    showSunMesh = false;
  } else if (timeOfDay === 'NIGHT_FLIR') {
    bgColor = 0x02150d; // Tactical night FLIR
    fogColor = 0x02150d;
    fogDensity = 0.003;
    sunColor = 0x10b981;
    sunIntensity = 0.6;
    sunPos = new THREE.Vector3(80, 200, 80);
    ambientColor = 0x064e3b;
    ambientIntensity = 1.3;
    hemiSky = 0x064e3b;
    hemiGround = 0x022c22;
    hemiIntensity = 0.8;
    showSunMesh = false;
  }

  scene.background = new THREE.Color(bgColor);
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);

  // Directional Sun Light
  const dirSun = new THREE.DirectionalLight(sunColor, sunIntensity);
  dirSun.name = 'MAP_SUN_LIGHT';
  dirSun.position.copy(sunPos);
  dirSun.castShadow = true;
  dirSun.shadow.mapSize.width = 2048;
  dirSun.shadow.mapSize.height = 2048;
  dirSun.shadow.camera.near = 10;
  dirSun.shadow.camera.far = 1000;
  dirSun.shadow.camera.left = -300;
  dirSun.shadow.camera.right = 300;
  dirSun.shadow.camera.top = 300;
  dirSun.shadow.camera.bottom = -300;
  scene.add(dirSun);

  // Ambient Daylight Skylight
  const ambLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
  ambLight.name = 'MAP_AMBIENT_LIGHT';
  scene.add(ambLight);

  // Hemisphere Light (Sky illumination down + Colombian Green grass bounce up)
  const hemiLight = new THREE.HemisphereLight(hemiSky, hemiGround, hemiIntensity);
  hemiLight.name = 'MAP_HEMI_LIGHT';
  scene.add(hemiLight);

  // Glowing 3D Sun in the Sky
  if (showSunMesh) {
    const sunGroup = new THREE.Group();
    sunGroup.name = 'MAP_SUN_MESH';
    sunGroup.position.copy(sunPos);

    const sunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(22, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfffde7 })
    );
    sunGroup.add(sunSphere);

    const corona = new THREE.Mesh(
      new THREE.RingGeometry(22, 38, 32),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    corona.lookAt(0, 0, 0);
    sunGroup.add(corona);
    scene.add(sunGroup);

    // Drifting 3D Fluffy White Clouds
    const cloudGroup = new THREE.Group();
    cloudGroup.name = 'MAP_CLOUDS_GROUP';
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    for (let c = 0; c < 16; c++) {
      const puffCluster = new THREE.Group();
      const cx = (Math.random() - 0.5) * 800;
      const cy = 200 + Math.random() * 80;
      const cz = (Math.random() - 0.5) * 800;

      for (let p = 0; p < 5; p++) {
        const rad = 14 + Math.random() * 18;
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), cloudMat);
        puff.position.set(
          (p - 2) * 16 + (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 12
        );
        puffCluster.add(puff);
      }
      puffCluster.position.set(cx, cy, cz);
      cloudGroup.add(puffCluster);
    }
    scene.add(cloudGroup);
  }
}

/**
 * MAP 1: COLEGIO CAMPESTRE LA COLINA & LOMA LOS BALSOS (HOME & SCHOOL GROUNDS)
 */
export function buildLaColinaCampusEnvironment(scene: THREE.Scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'MAP_ENV_GROUP';

  // 1. Lush Colombian Mountain Terrain (Andean hillside sloping upward)
  const terrainGeo = new THREE.PlaneGeometry(600, 600, 48, 48);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    // School is on a gentle terrace; hills rise up towards south/east (Loma Los Balsos)
    let elev = 0;
    if (vx < -60 || vz > 60 || vx > 90) {
      elev = Math.max(0, (Math.abs(vx) * 0.12 + vz * 0.14) + Math.sin(vx * 0.02) * Math.cos(vz * 0.02) * 8);
    } else {
      elev = Math.sin(vx * 0.01) * 1.5;
    }
    posAttr.setY(i, elev);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x1e5e2e, // Vibrant lush Colombian mountain green
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  envGroup.add(terrain);

  // 2. 3D Winding Road: Loma Los Balsos / Calle 12 Sur
  const roadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-180, 2.5, 90),
    new THREE.Vector3(-100, 1.8, 65),
    new THREE.Vector3(-30, 0.8, 45), // Right in front of school gate
    new THREE.Vector3(40, 1.2, 50),
    new THREE.Vector3(120, 2.8, 75),
    new THREE.Vector3(180, 5.0, 120),
  ]);

  create3DRealisticRoad(envGroup, roadCurve, {
    width: 14,
    curbWidth: 0.7,
    curbHeight: 0.35,
    asphaltColor: 0x222b37,
    curbColor: 0xa8a29e,
    hasCurbs: true,
    hasDoubleYellow: true,
    hasWhiteEdges: true,
    hasZebraCrossing: true,
    zebraCrossingT: 0.45, // Pedestrian crossing directly in front of school entrance
    hasGuardrails: false,
    hasStreetLights: true,
    steps: 70,
  });

  // 3. COLEGIO CAMPESTRE LA COLINA CAMPUS COMPLEX
  // Building A: Science & Robotics Laboratory Wing (Drone Pad on roof)
  const scienceWing = new THREE.Group();
  scienceWing.position.set(-45, 0, 20);
  const b1 = new THREE.Mesh(
    new THREE.BoxGeometry(36, 12, 30),
    new THREE.MeshStandardMaterial({ color: 0x0f2b48, roughness: 0.4 }) // School Navy
  );
  b1.position.y = 6;
  b1.castShadow = true;
  b1.receiveShadow = true;
  scienceWing.add(b1);

  // Windows glass
  const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.85 });
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(32, 3.5, 30.4), winMat);
  w1.position.y = 7;
  scienceWing.add(w1);

  // Rooftop Vertiport Landing Pad
  const padMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7, 0.8, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  padMesh.position.y = 12.4;
  scienceWing.add(padMesh);

  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(3.5, 5, 24),
    new THREE.MeshBasicMaterial({ color: 0x38b438, side: THREE.DoubleSide }) // School Green
  );
  padRing.rotateX(-Math.PI / 2);
  padRing.position.y = 12.85;
  scienceWing.add(padRing);

  // Strobe beacon light
  const pLight = new THREE.PointLight(0x38b438, 2, 18);
  pLight.position.set(0, 14, 0);
  scienceWing.add(pLight);

  envGroup.add(scienceWing);

  // Building B: Main Academic Pavilion (Classrooms)
  const academicPavilion = new THREE.Group();
  academicPavilion.position.set(-15, 0, -35);
  const b2 = new THREE.Mesh(
    new THREE.BoxGeometry(55, 14, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 })
  );
  b2.position.y = 7;
  b2.castShadow = true;
  academicPavilion.add(b2);

  const w2 = new THREE.Mesh(new THREE.BoxGeometry(50, 4, 24.4), winMat);
  w2.position.y = 8;
  academicPavilion.add(w2);

  // Solar Panels on roof
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });
  const solarMesh = new THREE.Mesh(new THREE.BoxGeometry(46, 0.6, 18), solarMat);
  solarMesh.position.y = 14.3;
  academicPavilion.add(solarMesh);

  envGroup.add(academicPavilion);

  // Building C: School Administration & Infirmary
  const adminHub = new THREE.Group();
  adminHub.position.set(15, 0, 15);
  const b3 = new THREE.Mesh(
    new THREE.BoxGeometry(28, 9, 22),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  b3.position.y = 4.5;
  b3.castShadow = true;
  adminHub.add(b3);

  // Red Cross on roof
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 1.8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  c1.position.y = 9.25;
  adminHub.add(c1);
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 5), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  c2.position.y = 9.25;
  adminHub.add(c2);

  envGroup.add(adminHub);

  // 4. Synthetic Soccer / Sports Field (The Incident Zone)
  const fieldGroup = new THREE.Group();
  fieldGroup.position.set(50, 0.12, -35);

  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 48),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 }) // Turf green
  );
  turf.rotateX(-Math.PI / 2);
  turf.receiveShadow = true;
  fieldGroup.add(turf);

  // White boundary lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const pts = [
    new THREE.Vector3(-35, 0.15, -22),
    new THREE.Vector3(35, 0.15, -22),
    new THREE.Vector3(35, 0.15, 22),
    new THREE.Vector3(-35, 0.15, 22),
    new THREE.Vector3(-35, 0.15, -22),
  ];
  fieldGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));

  // Goalposts
  const goalGeo = new THREE.BoxGeometry(1, 4.5, 10);
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const goalW = new THREE.Mesh(goalGeo, goalMat);
  goalW.position.set(-35.5, 2.25, 0);
  fieldGroup.add(goalW);
  const goalE = new THREE.Mesh(goalGeo, goalMat);
  goalE.position.set(35.5, 2.25, 0);
  fieldGroup.add(goalE);

  // Bleachers / Seating
  const bleachers = new THREE.Mesh(
    new THREE.BoxGeometry(40, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x64748b })
  );
  bleachers.position.set(0, 1.5, 27);
  fieldGroup.add(bleachers);

  envGroup.add(fieldGroup);

  // 5. School Gates & Fencing
  // Gate 1: Main Campus Entrance on Calle 12 Sur
  const gate1 = new THREE.Group();
  gate1.position.set(-30, 0.8, 38);
  const post1 = new THREE.Mesh(new THREE.BoxGeometry(2, 7, 2), new THREE.MeshStandardMaterial({ color: 0x0f2b48 }));
  post1.position.set(-6, 3.5, 0);
  gate1.add(post1);
  const post2 = new THREE.Mesh(new THREE.BoxGeometry(2, 7, 2), new THREE.MeshStandardMaterial({ color: 0x0f2b48 }));
  post2.position.set(6, 3.5, 0);
  gate1.add(post2);
  const gateSign = new THREE.Mesh(
    new THREE.BoxGeometry(14, 1.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x0f2b48 })
  );
  gateSign.position.set(0, 6.5, 0);
  gate1.add(gateSign);
  envGroup.add(gate1);

  // 6. Student Residential Neighborhood (Hillside villas & brick condominiums)
  const homeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }); // Colombian Brick
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }); // Terracotta tile roof
  const whiteWallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });

  const homeConfigs = [
    { x: -110, z: 10, w: 22, h: 18, d: 20 },
    { x: -90, z: -40, w: 20, h: 22, d: 18 },
    { x: 95, z: 20, w: 24, h: 16, d: 22 },
    { x: 120, z: -25, w: 22, h: 24, d: 20 },
    { x: 75, z: 65, w: 18, h: 12, d: 16 },
  ];

  homeConfigs.forEach((cfg) => {
    const house = new THREE.Group();
    house.position.set(cfg.x, 0, cfg.z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), homeMat);
    body.position.y = cfg.h * 0.5;
    body.castShadow = true;
    house.add(body);

    // Terracotta roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(cfg.w * 0.7, 5, 4), roofMat);
    roof.position.y = cfg.h + 2.5;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    // Windows
    const win = new THREE.Mesh(new THREE.BoxGeometry(cfg.w * 0.85, cfg.h * 0.4, cfg.d + 0.4), winMat);
    win.position.y = cfg.h * 0.6;
    house.add(win);

    envGroup.add(house);
  });

  // 7. Colombian Pine & Eucalyptus Trees
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18 });
  const foliageGeo = new THREE.ConeGeometry(3.5, 10, 6);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, flatShading: true });

  for (let i = 0; i < 60; i++) {
    const tx = (Math.random() - 0.5) * 450;
    const tz = (Math.random() - 0.5) * 450;

    // Keep clear of soccer field and road
    if (Math.hypot(tx - 50, tz + 35) > 45 && Math.abs(tz - 55) > 20) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2;
      tree.add(trunk);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 7.5;
      foliage.castShadow = true;
      tree.add(foliage);
      tree.position.set(tx, 0, tz);
      envGroup.add(tree);
    }
  }

  scene.add(envGroup);
  return envGroup;
}

/**
 * MAP 2: MEDELLÍN DOWNTOWN & EL POBLADO FINANCIAL CENTER (URBAN SKYLINE)
 */
export function buildMedellinDowntownEnvironment(scene: THREE.Scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'MAP_ENV_GROUP';

  // Valley base
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
  );
  ground.rotateX(-Math.PI / 2);
  ground.receiveShadow = true;
  envGroup.add(ground);

  // Distant Aburrá Mountain Slopes on sides
  const mountainGeo = new THREE.PlaneGeometry(800, 300, 32, 16);
  mountainGeo.rotateX(-Math.PI / 2);
  const mPos = mountainGeo.attributes.position;
  for (let i = 0; i < mPos.count; i++) {
    const vx = mPos.getX(i);
    const vz = mPos.getZ(i);
    mPos.setY(i, Math.abs(vx) * 0.4 + Math.sin(vx * 0.03) * 20);
  }
  mountainGeo.computeVertexNormals();
  const mountainMesh = new THREE.Mesh(
    mountainGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e3a24, flatShading: true })
  );
  mountainMesh.position.set(0, 0, -250);
  envGroup.add(mountainMesh);

  // Avenida El Poblado (Main 6-lane city avenue)
  const cityAvenue = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.4, 300),
    new THREE.Vector3(10, 0.4, 150),
    new THREE.Vector3(0, 0.4, 0),
    new THREE.Vector3(-10, 0.4, -150),
    new THREE.Vector3(0, 0.4, -300),
  ]);

  create3DRealisticRoad(envGroup, cityAvenue, {
    width: 20,
    curbWidth: 1.2,
    curbHeight: 0.35,
    asphaltColor: 0x1f2937,
    curbColor: 0x94a3b8,
    hasCurbs: true,
    hasDoubleYellow: true,
    hasWhiteEdges: true,
    hasZebraCrossing: true,
    zebraCrossingT: 0.5,
    hasStreetLights: true,
    steps: 60,
  });

  // Cross Avenue
  const crossAvenue = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-250, 0.4, -40),
    new THREE.Vector3(0, 0.4, -40),
    new THREE.Vector3(250, 0.4, -40),
  ]);
  create3DRealisticRoad(envGroup, crossAvenue, {
    width: 16,
    curbWidth: 0.8,
    curbHeight: 0.3,
    asphaltColor: 0x1f2937,
    curbColor: 0x94a3b8,
    hasCurbs: true,
    hasDoubleYellow: true,
    hasWhiteEdges: true,
    hasZebraCrossing: true,
    zebraCrossingT: 0.5,
    hasStreetLights: false,
    steps: 40,
  });

  // 25+ High-Rise Skyscrapers (Medellín glass and brick towers)
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 });
  const brickMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 }); // Poblado brick
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

  const towers = [
    { x: -55, z: 80, w: 28, h: 95, d: 24, mat: glassMat },
    { x: 55, z: 90, w: 26, h: 80, d: 26, mat: brickMat },
    { x: -65, z: -90, w: 32, h: 110, d: 30, mat: glassMat }, // Tall commercial tower
    { x: 60, z: -100, w: 24, h: 75, d: 22, mat: whiteMat },
    { x: -120, z: 20, w: 30, h: 65, d: 30, mat: brickMat },
    { x: 120, z: 40, w: 28, h: 70, d: 28, mat: glassMat },
    { x: -140, z: -60, w: 26, h: 85, d: 26, mat: whiteMat },
    { x: 140, z: -80, w: 32, h: 90, d: 28, mat: brickMat },
    // Hospital Tower with Rooftop Helipad
    { x: -80, z: 60, w: 36, h: 48, d: 36, mat: whiteMat, isHospital: true },
  ];

  towers.forEach((t) => {
    const towerMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), t.mat);
    towerMesh.position.set(t.x, t.h * 0.5, t.z);
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    envGroup.add(towerMesh);

    if (t.isHospital) {
      // Rooftop Helipad / Vertiport
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(10, 10, 0.6, 24),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      pad.position.set(t.x, t.h + 0.3, t.z);
      envGroup.add(pad);

      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.2, 3),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      crossH.position.set(t.x, t.h + 0.65, t.z);
      envGroup.add(crossH);
      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.2, 10),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      crossV.position.set(t.x, t.h + 0.65, t.z);
      envGroup.add(crossV);
    }
  });

  scene.add(envGroup);
  return envGroup;
}

/**
 * MAP 3: VÍA LAS PALMAS MOUNTAIN HIGHWAY (STEEP CURVES & CLIFTS)
 */
export function buildLasPalmasHighwayEnvironment(scene: THREE.Scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'MAP_ENV_GROUP';

  // Steep Mountain Ridge Terrain
  const terrainGeo = new THREE.PlaneGeometry(700, 700, 48, 48);
  terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const mountainRidge = (vx * 0.35 + vz * 0.25) + Math.sin(vx * 0.02) * Math.cos(vz * 0.02) * 24;
    pos.setY(i, Math.max(0, mountainRidge + 20));
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x14532d,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  envGroup.add(terrain);

  // Winding Mountain Highway with Hairpin Turn
  const highwayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-200, 10, 220),
    new THREE.Vector3(-120, 15, 140),
    new THREE.Vector3(-40, 20, 60),
    new THREE.Vector3(30, 24, -10),
    new THREE.Vector3(20, 22, -110), // Hairpin bend where accident occurred
    new THREE.Vector3(-60, 28, -180),
    new THREE.Vector3(-140, 36, -260),
  ]);

  create3DRealisticRoad(envGroup, highwayCurve, {
    width: 15,
    curbWidth: 0.6,
    curbHeight: 0.35,
    asphaltColor: 0x1e293b,
    curbColor: 0x64748b,
    hasCurbs: true,
    hasDoubleYellow: true,
    hasWhiteEdges: true,
    hasZebraCrossing: false,
    hasGuardrails: true, // Crucial for mountain highway!
    hasStreetLights: true,
    steps: 80,
  });

  // Roadside Mirador (Lookout Terrace)
  const mirador = new THREE.Mesh(
    new THREE.BoxGeometry(40, 1.2, 22),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  mirador.position.set(-50, 21, 40);
  envGroup.add(mirador);

  scene.add(envGroup);
  return envGroup;
}

/**
 * MAP 4: ENVIGADO & SABANETA FOOTHILLS (COLONIAL & COMMUNITY)
 */
export function buildEnvigadoFoothillsEnvironment(scene: THREE.Scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'MAP_ENV_GROUP';

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshStandardMaterial({ color: 0x2e663a, roughness: 0.9 })
  );
  ground.rotateX(-Math.PI / 2);
  ground.receiveShadow = true;
  envGroup.add(ground);

  // Neighborhood Road
  const roadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-200, 0.4, 60),
    new THREE.Vector3(-80, 0.4, 40),
    new THREE.Vector3(20, 0.4, 30),
    new THREE.Vector3(120, 0.4, 10),
    new THREE.Vector3(200, 0.4, -20),
  ]);

  create3DRealisticRoad(envGroup, roadCurve, {
    width: 13,
    curbWidth: 0.8,
    curbHeight: 0.3,
    asphaltColor: 0x334155,
    curbColor: 0x94a3b8,
    hasCurbs: true,
    hasDoubleYellow: true,
    hasWhiteEdges: true,
    hasZebraCrossing: true,
    zebraCrossingT: 0.4,
    hasStreetLights: true,
    steps: 60,
  });

  // Colonial Church Tower & Town Square
  const church = new THREE.Group();
  church.position.set(-60, 0, -50);
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 45), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
  cBody.position.y = 8;
  church.add(cBody);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 36, 10), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
  tower.position.set(0, 18, 20);
  church.add(tower);
  envGroup.add(church);

  scene.add(envGroup);
  return envGroup;
}

/**
 * MAP 5: SANTA ELENA & ARVÍ CLOUD FOREST RESERVE
 */
export function buildSantaElenaForestEnvironment(scene: THREE.Scene) {
  const envGroup = new THREE.Group();
  envGroup.name = 'MAP_ENV_GROUP';

  const terrainGeo = new THREE.PlaneGeometry(600, 600, 40, 40);
  terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    pos.setY(i, Math.sin(vx * 0.02) * Math.cos(vz * 0.02) * 14 + (Math.abs(vx) + Math.abs(vz)) * 0.06);
  }
  terrainGeo.computeVertexNormals();
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x0f391b, // Deep forest green
    roughness: 0.95,
    flatShading: true,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  envGroup.add(terrain);

  // Winding forest trail / access road
  const trailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-180, 2, 100),
    new THREE.Vector3(-80, 2.5, 40),
    new THREE.Vector3(0, 3, 0),
    new THREE.Vector3(70, 3.5, -40),
    new THREE.Vector3(160, 4, -100),
  ]);

  create3DRealisticRoad(envGroup, trailCurve, {
    width: 10,
    curbWidth: 0.4,
    curbHeight: 0.2,
    asphaltColor: 0x475569,
    curbColor: 0x334155,
    hasCurbs: true,
    hasDoubleYellow: false,
    hasWhiteEdges: true,
    hasZebraCrossing: false,
    hasStreetLights: false,
    steps: 60,
  });

  // Dense Pine Canopy
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 5, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
  const fGeo = new THREE.ConeGeometry(4, 14, 6);
  const fMat = new THREE.MeshStandardMaterial({ color: 0x14532d, flatShading: true });

  for (let i = 0; i < 90; i++) {
    const tx = (Math.random() - 0.5) * 500;
    const tz = (Math.random() - 0.5) * 500;
    if (Math.abs(tx) > 25 || Math.abs(tz) > 25) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.5;
      tree.add(trunk);
      const foliage = new THREE.Mesh(fGeo, fMat);
      foliage.position.y = 9;
      tree.add(foliage);
      tree.position.set(tx, 0, tz);
      envGroup.add(tree);
    }
  }

  scene.add(envGroup);
  return envGroup;
}


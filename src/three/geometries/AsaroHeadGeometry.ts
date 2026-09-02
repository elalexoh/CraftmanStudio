import * as THREE from 'three';

/**
 * Geometría Anatómica Completa "Asaro Head" (Planes of the Head para Artistas)
 * Contiene todas las facetas anatómicas clásicas:
 * Frente, cresta temporal, órbitas, nariz con planos laterales y alares,
 * complejo cigomático, labios facetados, mentón y ángulo mandibular.
 */
export function createAsaroHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const vertices: number[] = [];

  function addQuad(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ) {
    vertices.push(...p1, ...p2, ...p3);
    vertices.push(...p1, ...p3, ...p4);
  }

  function addTri(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) {
    vertices.push(...p1, ...p2, ...p3);
  }

  // --- VÉRTICES ANATÓMICOS (Simétricos L / R) ---
  // Alturas principales:
  // y = 1.35  (Coronilla / Vertex)
  // y = 1.15  (Parietal / Línea de cabello)
  // y = 0.85  (Eminencias frontales)
  // y = 0.55  (Glabela / Arco superciliar)
  // y = 0.35  (Puente nasal / Órbitas)
  // y = 0.12  (Mitad de nariz / Pómulos)
  // y = -0.08 (Punta y base nasal)
  // y = -0.28 (Filtrum y Labio superior)
  // y = -0.45 (Labio inferior y surco)
  // y = -0.68 (Mentón / Barbilla)
  // y = -0.92 (Mandíbula inferior)
  // y = -1.25 (Base del cuello)

  // 1. Cráneo Superior y Bóveda
  const v_top_mid: [number, number, number] = [0, 1.35, -0.05];
  const v_top_post: [number, number, number] = [0, 1.3, -0.65];
  const v_crown_L: [number, number, number] = [-0.62, 1.25, -0.2];
  const v_crown_R: [number, number, number] = [0.62, 1.25, -0.2];

  // 2. Frente
  const v_forehead_top_mid: [number, number, number] = [0, 1.12, 0.62];
  const v_forehead_top_L: [number, number, number] = [-0.42, 1.08, 0.55];
  const v_forehead_top_R: [number, number, number] = [0.42, 1.08, 0.55];
  const v_temporal_crest_top_L: [number, number, number] = [-0.68, 1.05, 0.32];
  const v_temporal_crest_top_R: [number, number, number] = [0.68, 1.05, 0.32];

  const v_forehead_mid_mid: [number, number, number] = [0, 0.82, 0.72];
  const v_forehead_mid_L: [number, number, number] = [-0.4, 0.8, 0.65];
  const v_forehead_mid_R: [number, number, number] = [0.4, 0.8, 0.65];
  const v_temporal_crest_mid_L: [number, number, number] = [-0.72, 0.78, 0.35];
  const v_temporal_crest_mid_R: [number, number, number] = [0.72, 0.78, 0.35];

  // 3. Glabela y Cejas (Superciliar)
  const v_glabella_top: [number, number, number] = [0, 0.58, 0.8];
  const v_glabella_bot: [number, number, number] = [0, 0.45, 0.83];
  const v_brow_mid_L: [number, number, number] = [-0.22, 0.54, 0.78];
  const v_brow_mid_R: [number, number, number] = [0.22, 0.54, 0.78];
  const v_brow_arch_L: [number, number, number] = [-0.48, 0.55, 0.72];
  const v_brow_arch_R: [number, number, number] = [0.48, 0.55, 0.72];
  const v_temple_L: [number, number, number] = [-0.75, 0.52, 0.32];
  const v_temple_R: [number, number, number] = [0.75, 0.52, 0.32];

  // 4. Órbitas Oculares
  const v_orbit_inner_L: [number, number, number] = [-0.18, 0.32, 0.72];
  const v_orbit_inner_R: [number, number, number] = [0.18, 0.32, 0.72];
  const v_orbit_top_L: [number, number, number] = [-0.35, 0.42, 0.68];
  const v_orbit_top_R: [number, number, number] = [0.35, 0.42, 0.68];
  const v_orbit_outer_L: [number, number, number] = [-0.58, 0.32, 0.6];
  const v_orbit_outer_R: [number, number, number] = [0.58, 0.32, 0.6];
  const v_orbit_bot_L: [number, number, number] = [-0.35, 0.22, 0.66];
  const v_orbit_bot_R: [number, number, number] = [0.35, 0.22, 0.66];
  const v_eye_socket_deep_L: [number, number, number] = [-0.32, 0.32, 0.58];
  const v_eye_socket_deep_R: [number, number, number] = [0.32, 0.32, 0.58];

  // 5. Nariz
  const v_nose_root: [number, number, number] = [0, 0.42, 0.85];
  const v_nose_bridge_mid: [number, number, number] = [0, 0.18, 0.94];
  const v_nose_slope_L: [number, number, number] = [-0.12, 0.18, 0.82];
  const v_nose_slope_R: [number, number, number] = [0.12, 0.18, 0.82];

  const v_nose_tip_top: [number, number, number] = [0, 0.02, 1.05];
  const v_nose_tip_front: [number, number, number] = [0, -0.06, 1.06];
  const v_nose_tip_bot: [number, number, number] = [0, -0.14, 0.92];

  const v_nose_wing_top_L: [number, number, number] = [-0.14, -0.02, 0.96];
  const v_nose_wing_top_R: [number, number, number] = [0.14, -0.02, 0.96];
  const v_nose_wing_side_L: [number, number, number] = [-0.22, -0.12, 0.82];
  const v_nose_wing_side_R: [number, number, number] = [0.22, -0.12, 0.82];
  const v_nose_base_mid: [number, number, number] = [0, -0.16, 0.82];

  // 6. Pómulos y Complejo Cigomático
  const v_cheek_high_L: [number, number, number] = [-0.42, 0.12, 0.72];
  const v_cheek_high_R: [number, number, number] = [0.42, 0.12, 0.72];
  const v_cheek_arch_L: [number, number, number] = [-0.78, 0.15, 0.35];
  const v_cheek_arch_R: [number, number, number] = [0.78, 0.15, 0.35];
  const v_cheek_front_L: [number, number, number] = [-0.36, -0.12, 0.74];
  const v_cheek_front_R: [number, number, number] = [0.36, -0.12, 0.74];
  const v_cheek_side_L: [number, number, number] = [-0.76, -0.08, 0.28];
  const v_cheek_side_R: [number, number, number] = [0.76, -0.08, 0.28];

  // 7. Labios y Zona Peribucal
  const v_philtrum_top: [number, number, number] = [0, -0.16, 0.82];
  const v_philtrum_L: [number, number, number] = [-0.07, -0.24, 0.86];
  const v_philtrum_R: [number, number, number] = [0.07, -0.24, 0.86];
  const v_lip_top_mid: [number, number, number] = [0, -0.26, 0.9];
  const v_lip_top_side_L: [number, number, number] = [-0.16, -0.28, 0.85];
  const v_lip_top_side_R: [number, number, number] = [0.16, -0.28, 0.85];
  const v_mouth_corner_L: [number, number, number] = [-0.28, -0.36, 0.76];
  const v_mouth_corner_R: [number, number, number] = [0.28, -0.36, 0.76];

  const v_lip_mouth_line: [number, number, number] = [0, -0.34, 0.86];
  const v_lip_bot_mid: [number, number, number] = [0, -0.44, 0.86];
  const v_lip_bot_side_L: [number, number, number] = [-0.15, -0.42, 0.82];
  const v_lip_bot_side_R: [number, number, number] = [0.15, -0.42, 0.82];

  // 8. Mentón / Barbilla
  const v_chin_groove: [number, number, number] = [0, -0.52, 0.8];
  const v_chin_groove_L: [number, number, number] = [-0.2, -0.5, 0.75];
  const v_chin_groove_R: [number, number, number] = [0.2, -0.5, 0.75];
  const v_chin_pad_top: [number, number, number] = [0, -0.6, 0.86];
  const v_chin_pad_L: [number, number, number] = [-0.18, -0.66, 0.82];
  const v_chin_pad_R: [number, number, number] = [0.18, -0.66, 0.82];
  const v_chin_bot_mid: [number, number, number] = [0, -0.78, 0.78];
  const v_chin_bot_L: [number, number, number] = [-0.18, -0.76, 0.72];
  const v_chin_bot_R: [number, number, number] = [0.18, -0.76, 0.72];

  // 9. Mandíbula y Ángulo Gonial
  const v_jaw_mid_L: [number, number, number] = [-0.48, -0.52, 0.55];
  const v_jaw_mid_R: [number, number, number] = [0.48, -0.52, 0.55];
  const v_jaw_angle_L: [number, number, number] = [-0.68, -0.48, 0.05];
  const v_jaw_angle_R: [number, number, number] = [0.68, -0.48, 0.05];

  // 10. Orejas y Cráneo Posterior
  const v_ear_top_L: [number, number, number] = [-0.78, 0.35, -0.1];
  const v_ear_top_R: [number, number, number] = [0.78, 0.35, -0.1];
  const v_ear_bot_L: [number, number, number] = [-0.76, -0.22, -0.05];
  const v_ear_bot_R: [number, number, number] = [0.76, -0.22, -0.05];

  const v_occipital_high: [number, number, number] = [0, 0.75, -0.88];
  const v_occipital_mid: [number, number, number] = [0, 0.15, -0.92];
  const v_occipital_low: [number, number, number] = [0, -0.45, -0.78];

  // 11. Cuello
  const v_neck_front: [number, number, number] = [0, -1.18, 0.38];
  const v_neck_front_L: [number, number, number] = [-0.28, -1.18, 0.28];
  const v_neck_front_R: [number, number, number] = [0.28, -1.18, 0.28];
  const v_neck_side_L: [number, number, number] = [-0.48, -1.18, -0.1];
  const v_neck_side_R: [number, number, number] = [0.48, -1.18, -0.1];
  const v_neck_back: [number, number, number] = [0, -1.18, -0.52];

  // --- ENSAMBLAJE DE FACETAS ANATÓMICAS ---

  // Frente y Techo
  addQuad(v_top_mid, v_crown_L, v_forehead_top_L, v_forehead_top_mid);
  addQuad(v_top_mid, v_forehead_top_mid, v_forehead_top_R, v_crown_R);
  addQuad(v_forehead_top_mid, v_forehead_top_L, v_forehead_mid_L, v_forehead_mid_mid);
  addQuad(v_forehead_top_mid, v_forehead_mid_mid, v_forehead_mid_R, v_forehead_top_R);
  addQuad(v_forehead_top_L, v_temporal_crest_top_L, v_temporal_crest_mid_L, v_forehead_mid_L);
  addQuad(v_forehead_top_R, v_forehead_mid_R, v_temporal_crest_mid_R, v_temporal_crest_top_R);

  // Glabela y Cejas
  addQuad(v_forehead_mid_mid, v_forehead_mid_L, v_brow_mid_L, v_glabella_top);
  addQuad(v_forehead_mid_mid, v_glabella_top, v_brow_mid_R, v_forehead_mid_R);
  addQuad(v_forehead_mid_L, v_temporal_crest_mid_L, v_brow_arch_L, v_brow_mid_L);
  addQuad(v_forehead_mid_R, v_brow_mid_R, v_brow_arch_R, v_temporal_crest_mid_R);
  addQuad(v_temporal_crest_mid_L, v_crown_L, v_temple_L, v_brow_arch_L);
  addQuad(v_temporal_crest_mid_R, v_brow_arch_R, v_temple_R, v_crown_R);
  addQuad(v_glabella_top, v_brow_mid_L, v_orbit_inner_L, v_glabella_bot);
  addQuad(v_glabella_top, v_glabella_bot, v_orbit_inner_R, v_brow_mid_R);

  // Órbitas Oculares
  addQuad(v_brow_mid_L, v_brow_arch_L, v_orbit_top_L, v_orbit_inner_L);
  addQuad(v_brow_mid_R, v_orbit_inner_R, v_orbit_top_R, v_brow_arch_R);
  addQuad(v_brow_arch_L, v_temple_L, v_orbit_outer_L, v_orbit_top_L);
  addQuad(v_brow_arch_R, v_orbit_top_R, v_orbit_outer_R, v_temple_R);
  addQuad(v_orbit_inner_L, v_orbit_top_L, v_eye_socket_deep_L, v_orbit_inner_L);
  addQuad(v_orbit_inner_R, v_eye_socket_deep_R, v_orbit_top_R, v_orbit_inner_R);
  addQuad(v_orbit_top_L, v_orbit_outer_L, v_orbit_bot_L, v_eye_socket_deep_L);
  addQuad(v_orbit_top_R, v_eye_socket_deep_R, v_orbit_bot_R, v_orbit_outer_R);

  // Nariz
  addQuad(v_glabella_bot, v_orbit_inner_L, v_nose_slope_L, v_nose_root);
  addQuad(v_glabella_bot, v_nose_root, v_nose_slope_R, v_orbit_inner_R);
  addQuad(v_nose_root, v_nose_slope_L, v_nose_wing_top_L, v_nose_bridge_mid);
  addQuad(v_nose_root, v_nose_bridge_mid, v_nose_wing_top_R, v_nose_slope_R);
  addQuad(v_nose_bridge_mid, v_nose_wing_top_L, v_nose_wing_side_L, v_nose_tip_top);
  addQuad(v_nose_bridge_mid, v_nose_tip_top, v_nose_wing_side_R, v_nose_wing_top_R);
  addTri(v_nose_tip_top, v_nose_wing_side_L, v_nose_tip_front);
  addTri(v_nose_tip_top, v_nose_tip_front, v_nose_wing_side_R);
  addTri(v_nose_tip_front, v_nose_wing_side_L, v_nose_tip_bot);
  addTri(v_nose_tip_front, v_nose_tip_bot, v_nose_wing_side_R);
  addTri(v_nose_tip_bot, v_nose_wing_side_L, v_nose_base_mid);
  addTri(v_nose_tip_bot, v_nose_base_mid, v_nose_wing_side_R);

  // Pómulos y Mejillas
  addQuad(v_orbit_inner_L, v_orbit_bot_L, v_cheek_high_L, v_nose_slope_L);
  addQuad(v_orbit_inner_R, v_nose_slope_R, v_cheek_high_R, v_orbit_bot_R);
  addQuad(v_orbit_bot_L, v_orbit_outer_L, v_cheek_arch_L, v_cheek_high_L);
  addQuad(v_orbit_bot_R, v_cheek_high_R, v_cheek_arch_R, v_orbit_outer_R);
  addQuad(v_nose_slope_L, v_cheek_high_L, v_cheek_front_L, v_nose_wing_side_L);
  addQuad(v_nose_slope_R, v_nose_wing_side_R, v_cheek_front_R, v_cheek_high_R);
  addQuad(v_cheek_high_L, v_cheek_arch_L, v_cheek_side_L, v_cheek_front_L);
  addQuad(v_cheek_high_R, v_cheek_front_R, v_cheek_side_R, v_cheek_arch_R);

  // Zona Peribucal y Labios
  addQuad(v_nose_base_mid, v_nose_wing_side_L, v_philtrum_L, v_philtrum_top);
  addQuad(v_nose_base_mid, v_philtrum_top, v_philtrum_R, v_nose_wing_side_R);
  addQuad(v_philtrum_top, v_philtrum_L, v_lip_top_side_L, v_lip_top_mid);
  addQuad(v_philtrum_top, v_lip_top_mid, v_lip_top_side_R, v_philtrum_R);
  addQuad(v_nose_wing_side_L, v_cheek_front_L, v_mouth_corner_L, v_lip_top_side_L);
  addQuad(v_nose_wing_side_R, v_lip_top_side_R, v_mouth_corner_R, v_cheek_front_R);
  addQuad(v_lip_top_mid, v_lip_top_side_L, v_mouth_corner_L, v_lip_mouth_line);
  addQuad(v_lip_top_mid, v_lip_mouth_line, v_mouth_corner_R, v_lip_top_side_R);
  addQuad(v_lip_mouth_line, v_mouth_corner_L, v_lip_bot_side_L, v_lip_bot_mid);
  addQuad(v_lip_mouth_line, v_lip_bot_mid, v_lip_bot_side_R, v_mouth_corner_R);

  // Mentón
  addQuad(v_lip_bot_mid, v_lip_bot_side_L, v_chin_groove_L, v_chin_groove);
  addQuad(v_lip_bot_mid, v_chin_groove, v_chin_groove_R, v_lip_bot_side_R);
  addQuad(v_chin_groove, v_chin_groove_L, v_chin_pad_L, v_chin_pad_top);
  addQuad(v_chin_groove, v_chin_pad_top, v_chin_pad_R, v_chin_groove_R);
  addQuad(v_chin_pad_top, v_chin_pad_L, v_chin_bot_L, v_chin_bot_mid);
  addQuad(v_chin_pad_top, v_chin_bot_mid, v_chin_bot_R, v_chin_pad_R);

  // Mandíbula y Mejilla Baja
  addQuad(v_mouth_corner_L, v_cheek_front_L, v_jaw_mid_L, v_chin_groove_L);
  addQuad(v_mouth_corner_R, v_chin_groove_R, v_jaw_mid_R, v_cheek_front_R);
  addQuad(v_chin_groove_L, v_jaw_mid_L, v_jaw_angle_L, v_chin_bot_L);
  addQuad(v_chin_groove_R, v_chin_bot_R, v_jaw_angle_R, v_jaw_mid_R);
  addQuad(v_cheek_front_L, v_cheek_side_L, v_jaw_angle_L, v_jaw_mid_L);
  addQuad(v_cheek_front_R, v_jaw_mid_R, v_jaw_angle_R, v_cheek_side_R);

  // Lateral del Cráneo y Orejas
  addQuad(v_temple_L, v_crown_L, v_ear_top_L, v_cheek_arch_L);
  addQuad(v_temple_R, v_cheek_arch_R, v_ear_top_R, v_crown_R);
  addQuad(v_cheek_arch_L, v_ear_top_L, v_ear_bot_L, v_cheek_side_L);
  addQuad(v_cheek_arch_R, v_cheek_side_R, v_ear_bot_R, v_ear_top_R);
  addQuad(v_cheek_side_L, v_ear_bot_L, v_jaw_angle_L, v_cheek_side_L);
  addQuad(v_cheek_side_R, v_cheek_side_R, v_jaw_angle_R, v_ear_bot_R);

  // Cráneo Posterior
  addQuad(v_top_mid, v_top_post, v_crown_L, v_top_mid);
  addQuad(v_top_mid, v_crown_R, v_top_post, v_top_mid);
  addQuad(v_top_post, v_occipital_high, v_ear_top_L, v_crown_L);
  addQuad(v_top_post, v_crown_R, v_ear_top_R, v_occipital_high);
  addQuad(v_occipital_high, v_occipital_mid, v_ear_bot_L, v_ear_top_L);
  addQuad(v_occipital_high, v_ear_top_R, v_ear_bot_R, v_occipital_mid);
  addQuad(v_occipital_mid, v_occipital_low, v_jaw_angle_L, v_ear_bot_L);
  addQuad(v_occipital_mid, v_ear_bot_R, v_jaw_angle_R, v_occipital_low);

  // Cuello
  addQuad(v_chin_bot_mid, v_chin_bot_L, v_neck_front_L, v_neck_front);
  addQuad(v_chin_bot_mid, v_neck_front, v_neck_front_R, v_chin_bot_R);
  addQuad(v_chin_bot_L, v_jaw_angle_L, v_neck_side_L, v_neck_front_L);
  addQuad(v_chin_bot_R, v_neck_front_R, v_neck_side_R, v_jaw_angle_R);
  addQuad(v_jaw_angle_L, v_occipital_low, v_neck_back, v_neck_side_L);
  addQuad(v_jaw_angle_R, v_neck_side_R, v_neck_back, v_occipital_low);

  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();

  return geo;
}

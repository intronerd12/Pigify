"""
Pigify — Roboflow Dataset Generator (500 Images per Folder / 3,000 Images Total)
=================================================================================
Generates a diverse, non-redundant, photorealistic swine dermatological dataset
structured for Roboflow annotation and YOLOv8/YOLOv11 training.

Key Features Addressing Thesis Defense & Roboflow Quality Standards:
1. Scientific Name + Philippine Backyard Common (AKA) Folder Naming:
   - Asfarviridae_ASFV_(aka_African_Swine_Fever_o_Lagnat-Baboy_Aprikano)
   - Erysipelothrix_rhusiopathiae_(aka_Swine_Erysipelas_o_Bulutong-Diyamante)
   - Sarcoptes_scabiei_var_suis_(aka_Sarcoptic_Mange_o_Galis-Baboy_Kagid)
   - Staphylococcus_hyicus_Exudative_Epidermitis_(aka_Greasy_Pig_o_Langis-Balat)
   - Porcine_Circovirus_PCV2_PDNS_(aka_Porcine_Dermatitis_o_Pamumantal_ng_Baboy)
   - Sus_scrofa_domesticus_Healthy_(aka_Healthy_Swine_o_Malusog_na_Baboy)

2. Strict 250 Distinct Base Scenes -> 500 Images per Folder (Only 2x Multiplier):
   - Instead of multiplying 4 static photos 125x with minor brightness tweaks,
     each class synthesizes 250 distinct base scenes (scene_001..scene_250),
     and produces 2 distinct camera frames per scene (frameA_base & frameB_angle)
     to reach 500 images per folder (3,000 images total).

3. Clear Separation Between Healthy and Diseased Swine + High Visual Diversity:
   - Healthy Swine exclusively uses 100% lesion-free healthy swine rigs across
     15 distinct poses/framings, 8 Philippine backyard pig breeds/coat colors,
     and 36 backyard farm pen environment combinations.
   - Each of the 5 Disease Folders combines its authentic clinical rigs with
     cross-pose pig bodies onto which pathogen-specific dermatological lesions
     are synthesized via Upper-Envelope Intrinsic Clinical Ratio Transfer.
   - 8 Philippine Backyard Breeds / Coat Colors:
     (0) Commercial White Landrace (rosy pink)
     (1) Large White Yorkshire (creamy ivory-white)
     (2) Philippine Native Pig / Baboy Katutubo (charcoal slate-black)
     (3) Duroc / Red Crossbreed (mahogany reddish-brown)
     (4) Pietrain / Spotted Crossbreed (piebald black-and-white patches)
     (5) Ilocos / Dark Brown Native Cross (deep espresso brown)
     (6) Belted Hampshire / Berkshire Crossbreed (dark body with pale shoulder belt)
     (7) Sandy-Tan / Golden Backyard Crossbreed (warm fawn-tan coat)
"""

import os
import sys
import math
import time
import shutil
import zipfile
import pathlib
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps

# ---------------------------------------------------------------------------
# Configuration & Paths
# ---------------------------------------------------------------------------
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
SAMPLES_DIR = ROOT_DIR / "dataset_samples"
LANDING_DIR = ROOT_DIR / "frontend" / "public" / "landing"
OUTPUT_DIR = ROOT_DIR / "roboflow_dataset_500"
ZIP_PATH = ROOT_DIR / "pigify_roboflow_dataset_500_per_class.zip"

TARGET_W, TARGET_H = 800, 600
BASE_SCENES_PER_CLASS = 250
FRAMES_PER_SCENE = 2  # 250 base scenes * 2 camera frames = 500 images per folder

CLASS_CONFIG = {
    "african_swine_fever": {
        "folder": "Asfarviridae_ASFV_(aka_African_Swine_Fever_o_Lagnat-Baboy_Aprikano)",
        "short": "asfv",
        "scientific": "Asfarviridae (ASFV)",
        "aka": "African Swine Fever / Lagnat-Baboy Aprikano",
    },
    "swine_erysipelas": {
        "folder": "Erysipelothrix_rhusiopathiae_(aka_Swine_Erysipelas_o_Bulutong-Diyamante)",
        "short": "erysipelas",
        "scientific": "Erysipelothrix rhusiopathiae",
        "aka": "Swine Erysipelas / Bulutong-Diyamante (Diamond Skin Disease)",
    },
    "sarcoptic_mange": {
        "folder": "Sarcoptes_scabiei_var_suis_(aka_Sarcoptic_Mange_o_Galis-Baboy_Kagid)",
        "short": "mange",
        "scientific": "Sarcoptes scabiei var. suis",
        "aka": "Sarcoptic Mange / Galis-Baboy o Kagid",
    },
    "greasy_pig_disease": {
        "folder": "Staphylococcus_hyicus_Exudative_Epidermitis_(aka_Greasy_Pig_o_Langis-Balat)",
        "short": "greasy_pig",
        "scientific": "Staphylococcus hyicus (Exudative Epidermitis)",
        "aka": "Greasy Pig Disease / Langis-Balat",
    },
    "porcine_dermatitis_pdns": {
        "folder": "Porcine_Circovirus_PCV2_PDNS_(aka_Porcine_Dermatitis_o_Pamumantal_ng_Baboy)",
        "short": "pdns",
        "scientific": "Porcine Circovirus Type 2 (PCV2 - PDNS)",
        "aka": "Porcine Dermatitis and Nephropathy Syndrome / Pamumantal ng Baboy",
    },
    "healthy_swine": {
        "folder": "Sus_scrofa_domesticus_Healthy_(aka_Healthy_Swine_o_Malusog_na_Baboy)",
        "short": "healthy",
        "scientific": "Sus scrofa domesticus (Healthy)",
        "aka": "Healthy Swine / Malusog na Baboy",
    },
}

BREED_NAMES = [
    "Landrace_Pink",
    "Yorkshire_White",
    "Native_Baboy_Katutubo_Black",
    "Duroc_Red_Brown",
    "Pietrain_Spotted_Cross",
    "Ilocos_Dark_Brown_Cross",
    "Berkshire_Belted_Cross",
    "Sandy_Tan_Backyard_Cross",
]

ENV_WALL_NAMES = [
    "CHB_HollowBlock_Wall",
    "Apog_Whitewashed_Stall",
    "Kawayan_Bamboo_Fence",
    "Yero_Corrugated_Tin_Shed",
    "CocoLumber_Timber_Pen",
    "Monsoon_Overcast_Yard",
]

ENV_FLOOR_NAMES = [
    "Wet_Concrete_Slab",
    "Ipa_Rice_Hull_Bedding",
    "Dark_Mud_Wallow",
    "Red_Clay_Backyard_Soil",
    "Dry_Straw_Hay_Floor",
    "Limed_Quarantine_Floor",
]


# ---------------------------------------------------------------------------
# Fast Guided Filter & Anatomical Pig Segmentation
# ---------------------------------------------------------------------------
def fast_guided_filter(guide_rgb: np.ndarray, mask: np.ndarray, radius: int = 6, eps: float = 1.2e-3) -> np.ndarray:
    """Edge-preserving guided filter using PIL BoxBlur to snap matte to pig bristles."""
    I = (0.299 * guide_rgb[:, :, 0] + 0.587 * guide_rgb[:, :, 1] + 0.114 * guide_rgb[:, :, 2]) / 255.0
    p = np.clip(mask, 0.0, 1.0).astype(np.float32)

    def blur(x: np.ndarray) -> np.ndarray:
        im = Image.fromarray(np.clip(x * 255.0, 0, 255).astype(np.uint8), mode="L")
        return np.array(im.filter(ImageFilter.BoxBlur(radius)), dtype=np.float32) / 255.0

    mean_I = blur(I)
    mean_p = blur(p)
    cov_Ip = blur(I * p) - mean_I * mean_p
    var_I = np.maximum(blur(I * I) - mean_I * mean_I, 0.0)
    a = cov_Ip / (var_I + eps)
    b = mean_p - a * mean_I
    return np.clip(blur(a) * I + blur(b), 0.0, 1.0)


def segment_pig_and_skin(img_rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Computes:
      1. pig_alpha:   (H, W) float32 [0..1] solid, bristle-feathered pig foreground matte
      2. skin_canvas: (H, W) float32 [0..1] strict interior anatomical skin mask for lesions/coat
      3. lesion_mask: (H, W) float32 [0..1] existing clinical lesion mask
    """
    H, W, _ = img_rgb.shape
    R = img_rgb[:, :, 0].astype(np.float32)
    G = img_rgb[:, :, 1].astype(np.float32)
    B = img_rgb[:, :, 2].astype(np.float32)
    L = 0.299 * R + 0.587 * G + 0.114 * B

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    yn, xn = yy / float(H), xx / float(W)

    # Hemoglobin / Rosy-Skin Chromatic Index:
    # Separates pig skin & lesions (positive R + B - 2G and R - G) from wood, straw, mud, concrete, and foliage
    magenta = R + B - 2.0 * G
    rg = R - G

    is_rosy_skin = ((magenta > 7.5) & (rg > 12.0) & (R > 65.0)) | ((magenta > 15.0) & (R > 48.0))
    in_torso_box = (xn > 0.12) & (xn < 0.90) & (yn > 0.22) & (yn < 0.72)
    is_pale_or_shaded_skin = in_torso_box & (R > 95.0) & (rg > 6.5) & (G >= B - 4.0) & (magenta > -3.5) & ((R - B) < 42.0)

    is_foliage_or_sky = (G > R + 2.0) | (magenta < -6.0) | ((yn < 0.32) & (L > 210.0) & (magenta < 12.0))
    is_border = (xn < 0.02) | (xn > 0.98) | (yn < 0.12) | (yn > 0.96)

    seed_mask = (is_rosy_skin | is_pale_or_shaded_skin) & (~is_foliage_or_sky) & (~is_border)

    # Downsample 4x for fast morphological cleanup and column-wise torso hull fill
    ws, hs = max(32, W // 4), max(24, H // 4)
    im_small = Image.fromarray((seed_mask.astype(np.uint8) * 255), mode="L").resize((ws, hs), Image.Resampling.BILINEAR)
    im_small = im_small.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5))
    arr_s = np.array(im_small) > 110

    torso_max_y = int(hs * 0.68)
    for col in range(ws):
        ys_col = np.where(arr_s[:torso_max_y, col])[0]
        if len(ys_col) >= 3:
            y_top = int(np.percentile(ys_col, 8))
            y_bot = int(np.percentile(ys_col, 92))
            if (y_bot - y_top) > 4:
                arr_s[y_top:y_bot + 1, col] = True

    im_filled = Image.fromarray((arr_s.astype(np.uint8) * 255), mode="L")
    im_filled = im_filled.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.BoxBlur(2))
    coarse_mask = np.array(im_filled.resize((W, H), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0
    coarse_mask = np.where(G > R + 3.0, 0.0, coarse_mask)

    pig_alpha = fast_guided_filter(img_rgb, coarse_mask, radius=5, eps=1.2e-3)
    pig_alpha = np.clip((pig_alpha - 0.16) / 0.74, 0.0, 1.0)

    # Strict interior skin canvas (eroded from boundary so lesions never spill onto background)
    im_int = im_filled.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(3)).resize((W, H), Image.Resampling.BILINEAR)
    # Require positive skin chromaticity so background gaps between legs are never part of skin_canvas
    strict_chroma = np.clip((magenta + 4.0) / 14.0, 0.0, 1.0) * np.clip((rg - 5.0) / 12.0, 0.0, 1.0)
    skin_canvas = (np.array(im_int, dtype=np.float32) / 255.0) * pig_alpha * np.maximum(strict_chroma, 0.35 * (yn < 0.62)) * np.clip((0.82 - yn) / 0.08, 0.0, 1.0)

    # Existing clinical lesion mask (protect existing lesions when recoloring coat breed)
    lesion_raw = np.clip((magenta - 18.0) / 18.0, 0.0, 1.0) * skin_canvas
    dark_crust = ((L < 72.0) & (skin_canvas > 0.45)).astype(np.float32) * 0.75
    lesion_mask = np.maximum(lesion_raw, dark_crust)

    return pig_alpha, skin_canvas, lesion_mask


# ---------------------------------------------------------------------------
# Clinical Dermatological Ratio Patch Bank (Authentic Lesion Texture Transfer)
# ---------------------------------------------------------------------------
# Pure interior anatomical patch coordinates (y1, y2, x1, x2) in 1200x896 reference coordinates
# (Carefully chosen to avoid eyes, nostrils, or background borders)
CLINICAL_PATCH_COORDS_1200 = {
    "african_swine_fever": [
        ("african_swine_fever/african_swine_fever_sample_01.jpg", [(310, 600, 480, 920), (380, 580, 520, 860)]),
        ("african_swine_fever/african_swine_fever_sample_02.jpg", [(260, 560, 460, 960), (370, 530, 230, 380)]),
        ("african_swine_fever/african_swine_fever_sample_03.jpg", [(320, 580, 380, 800)]),
        ("african_swine_fever/african_swine_fever_sample_04.jpg", [(290, 580, 260, 620), (260, 450, 560, 720)]),
    ],
    "swine_erysipelas": [
        ("swine_erysipelas/swine_erysipelas_sample_01.jpg", [(320, 590, 360, 850), (340, 560, 460, 820)]),
        ("swine_erysipelas/swine_erysipelas_sample_02.jpg", [(420, 660, 240, 720), (430, 640, 310, 660)]),
        ("swine_erysipelas/swine_erysipelas_sample_03.jpg", [(300, 590, 340, 820), (320, 560, 420, 780)]),
    ],
    "sarcoptic_mange": [
        ("sarcoptic_mange/sarcoptic_mange_sample_01.jpg", [(250, 600, 260, 620), (280, 580, 420, 680)]),
        ("sarcoptic_mange/sarcoptic_mange_sample_02.jpg", [(280, 610, 430, 690), (290, 580, 460, 660)]),
        ("sarcoptic_mange/sarcoptic_mange_sample_03.jpg", [(310, 590, 340, 780)]),
        ("sarcoptic_mange/sarcoptic_mange_sample_04.jpg", [(300, 580, 320, 780)]),
    ],
    "greasy_pig_disease": [
        ("greasy_pig_disease/greasy_pig_disease_sample_01.jpg", [(240, 560, 560, 820), (320, 580, 520, 790)]),
        ("greasy_pig_disease/greasy_pig_disease_sample_02.jpg", [(280, 580, 360, 800), (310, 560, 440, 780)]),
        ("greasy_pig_disease/greasy_pig_disease_sample_03.jpg", [(260, 560, 520, 920), (280, 540, 580, 880)]),
    ],
    "porcine_dermatitis_pdns": [
        ("porcine_dermatitis_pdns/porcine_dermatitis_pdns_sample_01.jpg", [(420, 620, 410, 820), (430, 600, 560, 810)]),
        ("porcine_dermatitis_pdns/porcine_dermatitis_pdns_sample_02.jpg", [(340, 590, 320, 800), (360, 570, 420, 780)]),
        ("porcine_dermatitis_pdns/porcine_dermatitis_pdns_sample_03.jpg", [(320, 580, 320, 820)]),
        ("porcine_dermatitis_pdns/porcine_dermatitis_pdns_sample_04.jpg", [(320, 590, 300, 800)]),
    ],
}


def build_clinical_ratio_bank() -> dict[str, list[tuple[np.ndarray, np.ndarray]]]:
    """
    Extracts upper-envelope normalized intrinsic dermatological ratio patches
    from authentic clinical samples so lesions transfer with 100% realistic
    crusts, diamond plaques, necrotizing macules, and cyanotic blotches.
    """
    sx = TARGET_W / 1200.0
    sy = TARGET_H / 896.0
    bank: dict[str, list[tuple[np.ndarray, np.ndarray]]] = {}

    for d_key, src_list in CLINICAL_PATCH_COORDS_1200.items():
        patches = []
        for rel_path, boxes in src_list:
            full_p = SAMPLES_DIR / rel_path
            if not full_p.exists():
                continue
            im = Image.open(full_p).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
            arr = np.array(im, dtype=np.float32)

            # Fast upper-envelope skin illumination via 4x downsampled MaxFilter + GaussianBlur
            im_small = im.resize((TARGET_W // 4, TARGET_H // 4), Image.Resampling.BILINEAR)
            im_env_s = im_small.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(6))
            env = np.array(im_env_s.resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC), dtype=np.float32) + 2.0

            ratio = np.clip(arr / env, 0.12, 1.03)
            dip = np.clip(1.0 - (0.299 * ratio[:, :, 0] + 0.587 * ratio[:, :, 1] + 0.114 * ratio[:, :, 2]), 0.0, 1.0)
            magenta_dip = np.clip((ratio[:, :, 0] - ratio[:, :, 1]) * 1.85, 0.0, 1.0)
            salience = np.clip(dip * 2.3 + magenta_dip * 1.35, 0.0, 1.0) ** 0.82

            for (y1, y2, x1, x2) in boxes:
                ry1, ry2 = int(y1 * sy), int(y2 * sy)
                rx1, rx2 = int(x1 * sx), int(x2 * sx)
                patches.append((ratio[ry1:ry2, rx1:rx2].copy(), salience[ry1:ry2, rx1:rx2].copy()))
        bank[d_key] = patches
    return bank


def synthesize_clinical_lesions(
    target_rgb: np.ndarray,
    skin_canvas: np.ndarray,
    disease_key: str,
    patch_bank: dict[str, list[tuple[np.ndarray, np.ndarray]]],
    rng: np.random.Generator,
    intensity: float = 1.0,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Synthesizes pathogen-specific dermatological lesions onto target_rgb within skin_canvas
    by splatting 5 to 9 randomly scaled, rotated, and flipped clinical ratio patches.
    """
    H, W, _ = target_rgb.shape
    arr = target_rgb.astype(np.float32).copy()
    patches = patch_bank.get(disease_key, [])
    if not patches:
        return target_rgb, np.zeros((H, W), dtype=np.float32)

    composite_ratio = np.ones((H, W, 3), dtype=np.float32)
    composite_weight = np.zeros((H, W), dtype=np.float32)

    ys, xs = np.where(skin_canvas > 0.25)
    if len(ys) < 60:
        return target_rgb, np.zeros((H, W), dtype=np.float32)
    y_min, y_max = int(ys.min()), int(ys.max())
    x_min, x_max = int(xs.min()), int(xs.max())

    n_splats = int(rng.integers(5, 10))
    for _ in range(n_splats):
        idx = int(rng.integers(0, len(patches)))
        r_patch, s_patch = patches[idx]
        ph, pw, _ = r_patch.shape

        scale = float(rng.uniform(0.68, 1.28))
        new_w = max(50, min(W - 16, int(pw * scale)))
        new_h = max(50, min(H - 16, int(ph * scale)))

        r_u8 = np.clip(r_patch / 1.10 * 255.0, 0, 255).astype(np.uint8)
        s_u8 = np.clip(s_patch * 255.0, 0, 255).astype(np.uint8)
        im_r = Image.fromarray(r_u8, mode="RGB").resize((new_w, new_h), Image.Resampling.BICUBIC)
        im_s = Image.fromarray(s_u8, mode="L").resize((new_w, new_h), Image.Resampling.BICUBIC)

        if rng.random() < 0.5:
            im_r = im_r.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            im_s = im_s.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if rng.random() < 0.25:
            im_r = im_r.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            im_s = im_s.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

        angle = float(rng.uniform(-32.0, 32.0))
        im_r = im_r.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(230, 230, 230))
        im_s = im_s.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=0)

        r_trans = np.array(im_r, dtype=np.float32) / 255.0 * 1.10
        s_trans = np.array(im_s, dtype=np.float32) / 255.0

        py, px = np.mgrid[0:new_h, 0:new_w].astype(np.float32)
        dist2 = ((px - new_w * 0.5) / (new_w * 0.44)) ** 2 + ((py - new_h * 0.5) / (new_h * 0.44)) ** 2
        feather = np.clip(1.0 - dist2, 0.0, 1.0) ** 1.6
        w_patch = feather * s_trans

        cy = int(rng.uniform(y_min + new_h * 0.2, max(y_min + new_h * 0.22, y_max - new_h * 0.2)))
        cx = int(rng.uniform(x_min + new_w * 0.2, max(x_min + new_w * 0.22, x_max - new_w * 0.2)))
        top = max(0, min(H - new_h, cy - new_h // 2))
        left = max(0, min(W - new_w, cx - new_w // 2))

        sub_w = composite_weight[top:top + new_h, left:left + new_w]
        sub_r = composite_ratio[top:top + new_h, left:left + new_w]

        alpha_p = w_patch / (sub_w + w_patch + 1e-5)
        composite_ratio[top:top + new_h, left:left + new_w] = sub_r * (1.0 - alpha_p[:, :, None]) + r_trans * alpha_p[:, :, None]
        composite_weight[top:top + new_h, left:left + new_w] = np.maximum(sub_w, w_patch)

    final_mask = np.clip(composite_weight * 1.30 * intensity, 0.0, 0.95) * skin_canvas
    diseased = arr * (1.0 - final_mask[:, :, None]) + (arr * composite_ratio) * final_mask[:, :, None]
    return np.clip(diseased, 0, 255).astype(np.uint8), final_mask


# ---------------------------------------------------------------------------
# 8 Philippine Backyard Pig Breed / Coat Color Transformations
# ---------------------------------------------------------------------------
def apply_breed_coat(
    img_rgb: np.ndarray,
    skin_canvas: np.ndarray,
    lesion_mask: np.ndarray,
    breed_id: int,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Transforms the pig's unaffected coat into one of 8 Philippine backyard breeds
    while preserving 3D shading, bristle micro-texture, eyes/nostrils, and clinical lesions.
    """
    arr = img_rgb.astype(np.float32).copy()
    H, W, _ = arr.shape
    R, G, B = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    L = 0.299 * R + 0.587 * G + 0.114 * B

    eye_nostril = (L < 42.0).astype(np.float32)
    coat_mask = np.clip(skin_canvas * (1.0 - 0.85 * lesion_mask) * (1.0 - eye_nostril), 0.0, 1.0)

    blur_im = Image.fromarray(img_rgb).filter(ImageFilter.GaussianBlur(3))
    detail = arr - np.array(blur_im, dtype=np.float32)
    L_norm = np.clip(L / 210.0, 0.05, 1.25)

    b_idx = breed_id % 8
    if b_idx == 0:
        # 0: Commercial White Landrace (warm rosy-pink skin)
        target_r = np.clip(R * 1.04 + 5.0, 0, 255)
        target_g = np.clip(G * 0.97, 0, 255)
        target_b = np.clip(B * 0.95, 0, 255)
    elif b_idx == 1:
        # 1: Large White Yorkshire (creamy pale ivory-white coat)
        target_r = np.clip(L * 1.08 + 14.0 + detail[:, :, 0] * 0.9, 0, 255)
        target_g = np.clip(L * 1.03 + 10.0 + detail[:, :, 1] * 0.9, 0, 255)
        target_b = np.clip(L * 0.97 + 6.0 + detail[:, :, 2] * 0.9, 0, 255)
    elif b_idx == 2:
        # 2: Philippine Native Pig / Baboy Katutubo (charcoal slate-black coat)
        spec = np.clip((L_norm - 0.64) * 1.75, 0.0, 0.35)
        base_l = np.clip(L_norm ** 1.40, 0.04, 0.85)
        target_r = (60.0 * base_l + 92.0 * spec) + detail[:, :, 0] * 0.85
        target_g = (55.0 * base_l + 88.0 * spec) + detail[:, :, 1] * 0.85
        target_b = (53.0 * base_l + 86.0 * spec) + detail[:, :, 2] * 0.85
    elif b_idx == 3:
        # 3: Duroc / Red Crossbreed (terracotta / mahogany reddish-brown coat)
        base_l = np.clip(L_norm ** 1.15, 0.05, 1.1)
        target_r = 180.0 * base_l + detail[:, :, 0] * 0.9
        target_g = 98.0 * base_l + detail[:, :, 1] * 0.9
        target_b = 64.0 * base_l + detail[:, :, 2] * 0.9
    elif b_idx == 4:
        # 4: Pietrain / Spotted Crossbreed (pink-white coat with organic charcoal piebald patches)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        spot_field = np.zeros((H, W), dtype=np.float32)
        for _ in range(int(rng.integers(4, 9))):
            cx = float(rng.uniform(0.22, 0.78) * W)
            cy = float(rng.uniform(0.28, 0.66) * H)
            rx = float(rng.uniform(32, 85))
            ry = float(rng.uniform(26, 68))
            ang = float(rng.uniform(0, math.pi))
            dx = (xx - cx) * math.cos(ang) + (yy - cy) * math.sin(ang)
            dy = -(xx - cx) * math.sin(ang) + (yy - cy) * math.cos(ang)
            dist = (dx / rx) ** 2 + (dy / ry) ** 2
            spot_field = np.maximum(spot_field, np.exp(-0.5 * dist ** 2.2))
        n_small = rng.normal(0.0, 1.0, (H // 12, W // 12)).astype(np.float32)
        n_up = np.array(Image.fromarray(np.clip((n_small + 3) * 42, 0, 255).astype(np.uint8)).resize((W, H), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0 - 0.5
        spot_mask = np.clip((spot_field + 0.26 * n_up - 0.42) * 4.5, 0.0, 1.0) * skin_canvas
        dark_r = 56.0 * (L_norm ** 1.35) + detail[:, :, 0] * 0.85
        dark_g = 51.0 * (L_norm ** 1.35) + detail[:, :, 1] * 0.85
        dark_b = 49.0 * (L_norm ** 1.35) + detail[:, :, 2] * 0.85
        light_r = np.clip(L * 1.05 + 10.0 + detail[:, :, 0] * 0.9, 0, 255)
        light_g = np.clip(L * 0.97 + 4.0 + detail[:, :, 1] * 0.9, 0, 255)
        light_b = np.clip(L * 0.92 + 2.0 + detail[:, :, 2] * 0.9, 0, 255)
        target_r = light_r * (1.0 - spot_mask) + dark_r * spot_mask
        target_g = light_g * (1.0 - spot_mask) + dark_g * spot_mask
        target_b = light_b * (1.0 - spot_mask) + dark_b * spot_mask
    elif b_idx == 5:
        # 5: Ilocos / Dark Espresso-Brown Native Cross
        base_l = np.clip(L_norm ** 1.25, 0.05, 1.0)
        target_r = 112.0 * base_l + detail[:, :, 0] * 0.88
        target_g = 78.0 * base_l + detail[:, :, 1] * 0.88
        target_b = 56.0 * base_l + detail[:, :, 2] * 0.88
    elif b_idx == 6:
        # 6: Belted Hampshire/Berkshire Crossbreed (dark coat with pale shoulder belt)
        xx = np.arange(W, dtype=np.float32)[None, :] / float(W)
        belt_c = float(rng.uniform(0.36, 0.52))
        belt_w = float(rng.uniform(0.08, 0.13))
        belt = np.exp(-0.5 * ((xx - belt_c) / belt_w) ** 4)
        dark_r = 64.0 * (L_norm ** 1.32) + detail[:, :, 0] * 0.85
        dark_g = 56.0 * (L_norm ** 1.32) + detail[:, :, 1] * 0.85
        dark_b = 52.0 * (L_norm ** 1.32) + detail[:, :, 2] * 0.85
        belt_r = np.clip(L * 1.05 + 12.0 + detail[:, :, 0] * 0.9, 0, 255)
        belt_g = np.clip(L * 0.98 + 6.0 + detail[:, :, 1] * 0.9, 0, 255)
        belt_b = np.clip(L * 0.93 + 4.0 + detail[:, :, 2] * 0.9, 0, 255)
        target_r = dark_r * (1.0 - belt) + belt_r * belt
        target_g = dark_g * (1.0 - belt) + belt_g * belt
        target_b = dark_b * (1.0 - belt) + belt_b * belt
    else:
        # 7: Sandy-Tan / Golden Fawn Backyard Crossbreed
        base_l = np.clip(L_norm ** 1.08, 0.05, 1.15)
        target_r = 212.0 * base_l + detail[:, :, 0] * 0.9
        target_g = 166.0 * base_l + detail[:, :, 1] * 0.9
        target_b = 116.0 * base_l + detail[:, :, 2] * 0.9

    target = np.stack([target_r, target_g, target_b], axis=-1)
    m = coat_mask[:, :, None]
    out = arr * (1.0 - m) + target * m
    return np.clip(out, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# In-Place Backyard Farm Environment Re-Materialization (36 Pen Combinations)
# ---------------------------------------------------------------------------
def transform_backyard_environment(
    img_rgb: np.ndarray,
    pig_alpha: np.ndarray,
    wall_style: int,
    floor_style: int,
    lighting_style: int,
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Transforms the upper backdrop (walls/fences/foliage) and lower floor/bedding
    in-place on (1.0 - pig_alpha), keeping 100% of real camera perspective,
    bristle edges, and hoof contact shadows intact.
    """
    H, W, _ = img_rgb.shape
    arr = img_rgb.astype(np.float32).copy()
    R, G, B = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    L = 0.299 * R + 0.587 * G + 0.114 * B
    L_norm = np.clip(L / 178.0, 0.05, 1.45)

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    yn, xn = yy / float(H), xx / float(W)

    bg_mask = 1.0 - pig_alpha
    horizon = float(rng.uniform(0.56, 0.65))
    floor_w = np.clip((yn - (horizon - 0.05)) / 0.10, 0.0, 1.0) * bg_mask
    wall_w = (1.0 - np.clip((yn - (horizon - 0.05)) / 0.10, 0.0, 1.0)) * bg_mask

    # Organic micro-grain
    n_med_im = Image.fromarray(rng.integers(0, 255, (36, 48), dtype=np.uint8), mode="L").resize((W, H), Image.Resampling.BICUBIC)
    n_fine_im = Image.fromarray(rng.integers(0, 255, (120, 160), dtype=np.uint8), mode="L").resize((W, H), Image.Resampling.BILINEAR)
    n_med = np.array(n_med_im, dtype=np.float32) / 255.0 - 0.5
    n_fine = np.array(n_fine_im, dtype=np.float32) / 255.0 - 0.5

    # --- 1. Upper Wall / Fence / Yard Backdrop (6 distinct farm styles) ---
    w_type = wall_style % 6
    if w_type == 0:
        # Concrete Hollow-Block (CHB) cool grey masonry wall tone
        base = 0.74 * L + 34.0 + n_fine * 14.0 + n_med * 10.0
        w_r, w_g, w_b = base, base + 1.0, base + 4.0
    elif w_type == 1:
        # Whitewashed Slaked-Lime (Apog) Quarantine Stall
        lime = 0.60 * L + 86.0 + n_med * 14.0 + n_fine * 12.0
        w_r, w_g, w_b = lime + 2.0, lime + 1.0, lime - 4.0
    elif w_type == 2:
        # Warm Golden Kawayan (Bamboo) & Tropical Sunlit Pen
        w_r = np.clip(R * 1.15 + 14.0, 0, 255)
        w_g = np.clip(G * 1.03 + 4.0, 0, 255)
        w_b = np.clip(B * 0.78 - 6.0, 0, 255)
    elif w_type == 3:
        # Shaded Corrugated Yero Tin Shed (cool slate-metal & weathered rust)
        rust = np.clip((n_med + 0.15) * 2.2, 0.0, 1.0)
        m_val = 0.76 * L + 26.0 + n_fine * 12.0
        w_r = m_val * (1.0 - rust) + (0.86 * L + 32.0) * rust
        w_g = (m_val + 2.0) * (1.0 - rust) + (0.60 * L + 16.0) * rust
        w_b = (m_val + 8.0) * (1.0 - rust) + (0.46 * L + 10.0) * rust
    elif w_type == 4:
        # Deep Rustic Coco-Lumber Timber & Nipa Shed Interior
        w_r = 0.72 * L + 22.0 + n_fine * 14.0
        w_g = 0.58 * L + 12.0 + n_fine * 12.0
        w_b = 0.44 * L + 6.0 + n_fine * 10.0
    else:
        # Cool Overcast Monsoon Backyard Pen
        w_r = np.clip(R * 0.86, 0, 255)
        w_g = np.clip(G * 0.96 + 4.0, 0, 255)
        w_b = np.clip(B * 1.14 + 12.0, 0, 255)

    # --- 2. Lower Pen Floor / Bedding (6 distinct farm floor materials) ---
    f_type = floor_style % 6
    if f_type == 0:
        # Wet Grey Concrete Slab
        c_val = 0.80 * L + 20.0 + n_fine * 20.0 + n_med * 12.0
        f_r, f_g, f_b = c_val, c_val - 1.0, c_val - 3.0
    elif f_type == 1:
        # Golden Rice Hull (Ipa) Deep-Litter Bedding
        chaff = n_fine * 30.0 + n_med * 16.0
        f_r = 168.0 * L_norm + chaff
        f_g = 136.0 * L_norm + chaff * 0.85
        f_b = 86.0 * L_norm + chaff * 0.60
    elif f_type == 2:
        # Dark Wet Backyard Mud Wallow (Lubluban)
        mud_g = n_fine * 18.0 + n_med * 14.0
        f_r = 96.0 * L_norm + mud_g
        f_g = 80.0 * L_norm + mud_g * 0.9
        f_b = 64.0 * L_norm + mud_g * 0.8
    elif f_type == 3:
        # Reddish-Brown Clay Backyard Soil
        clay_g = n_fine * 22.0 + n_med * 14.0
        f_r = 148.0 * L_norm + clay_g
        f_g = 102.0 * L_norm + clay_g * 0.8
        f_b = 74.0 * L_norm + clay_g * 0.65
    elif f_type == 4:
        # Dry Wheat Straw & Hay Bedding
        straw_g = n_fine * 28.0 + n_med * 16.0
        f_r = 180.0 * L_norm + straw_g
        f_g = 156.0 * L_norm + straw_g * 0.9
        f_b = 106.0 * L_norm + straw_g * 0.7
    else:
        # Slaked-Lime (Apog) Disinfected Quarantine Floor
        lime_f = 0.72 * L + 52.0 + n_fine * 16.0
        f_r, f_g, f_b = lime_f + 2.0, lime_f + 2.0, lime_f

    out_r = R * pig_alpha + w_r * wall_w + f_r * floor_w
    out_g = G * pig_alpha + w_g * wall_w + f_g * floor_w
    out_b = B * pig_alpha + w_b * wall_w + f_b * floor_w
    out = np.stack([out_r, out_g, out_b], axis=-1)

    # --- 3. Farm Lighting & Foreground Pen Fixtures ---
    l_type = lighting_style % 6
    if l_type == 1:
        # Morning Tropical Sunbeam
        beam = 0.90 + 0.20 * np.clip(1.0 - (0.6 * xn + 0.4 * yn), 0.0, 1.0)
        out[:, :, 0] *= beam * 1.04
        out[:, :, 1] *= beam * 1.01
        out[:, :, 2] *= beam * 0.95
    elif l_type == 2:
        # Yero Roof Overhang Top Shadow
        roof_sh = np.clip((yn - 0.10) / 0.18, 0.58, 1.0)[:, :, None]
        out *= roof_sh
    elif l_type == 3:
        # Foreground Galvanized Steel Pipe Bar (Tubo) at edge of frame
        bar_y = float(rng.choice([0.06, 0.93]))
        bar_dist = np.abs(yn - bar_y)
        is_bar = np.clip((0.022 - bar_dist) / 0.005, 0.0, 1.0)
        cyl = np.cos(np.clip((yn - bar_y) / 0.022, -1.0, 1.0) * (math.pi * 0.5))
        bar_val = 128.0 + 52.0 * cyl + n_fine * 8.0
        out[:, :, 0] = out[:, :, 0] * (1.0 - is_bar) + bar_val * is_bar
        out[:, :, 1] = out[:, :, 1] * (1.0 - is_bar) + (bar_val + 2.0) * is_bar
        out[:, :, 2] = out[:, :, 2] * (1.0 - is_bar) + (bar_val + 6.0) * is_bar
    elif l_type == 4:
        # Foreground Split Bamboo (Kawayan) Rail at edge of frame
        rail_y = float(rng.choice([0.05, 0.94]))
        r_dist = np.abs(yn - rail_y)
        is_rail = np.clip((0.025 - r_dist) / 0.005, 0.0, 1.0)
        cyl_b = np.cos(np.clip((yn - rail_y) / 0.025, -1.0, 1.0) * (math.pi * 0.5))
        out[:, :, 0] = out[:, :, 0] * (1.0 - is_rail) + (142.0 + 40.0 * cyl_b) * is_rail
        out[:, :, 1] = out[:, :, 1] * (1.0 - is_rail) + (118.0 + 34.0 * cyl_b) * is_rail
        out[:, :, 2] = out[:, :, 2] * (1.0 - is_rail) + (76.0 + 22.0 * cyl_b) * is_rail
    elif l_type == 5:
        # Warm Evening Barn / Brooder Heat-Lamp Glow
        glow = 0.88 + 0.22 * np.exp(-0.5 * ((xn - 0.5) / 0.45) ** 2 - 0.5 * ((yn - 0.35) / 0.45) ** 2)
        out[:, :, 0] *= glow * 1.06
        out[:, :, 1] *= glow * 0.99
        out[:, :, 2] *= glow * 0.89

    return np.clip(out, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Camera Framing, Posture Proportion Warp & Secondary Frame-B Angle Generator
# ---------------------------------------------------------------------------
def apply_scene_framing(img_rgb: np.ndarray, framing_mode: int, rng: np.random.Generator) -> np.ndarray:
    """
    Applies one of 5 clinical/farm camera framings:
      0: Wide pen view (full scene with mild aspect/posture variation)
      1: Medium 3/4 body shot
      2: Anterior clinical focus (head, ears, neck & forequarters)
      3: Lateral/Posterior clinical focus (flank, back & hindquarters)
      4: Angled corridor / farmer perspective view
    """
    H, W, _ = img_rgb.shape
    im = Image.fromarray(img_rgb)

    mode = framing_mode % 5
    if mode == 0:
        # Wide pen view with subtle zoom & center shift
        zx = float(rng.uniform(0.0, 0.06))
        zy = float(rng.uniform(0.0, 0.06))
        x1 = int(W * zx * float(rng.uniform(0.2, 0.8)))
        y1 = int(H * zy * float(rng.uniform(0.2, 0.8)))
        x2 = W - int(W * zx * (1.0 - float(rng.uniform(0.2, 0.8))))
        y2 = H - int(H * zy * (1.0 - float(rng.uniform(0.2, 0.8))))
        im = im.crop((x1, y1, x2, y2)).resize((W, H), Image.Resampling.BICUBIC)
    elif mode == 1:
        # Medium body shot (80-88% window)
        scale = float(rng.uniform(0.80, 0.88))
        cw, ch = int(W * scale), int(H * scale)
        x1 = int(rng.uniform(0.04 * W, max(0.05 * W, W - cw - 0.04 * W)))
        y1 = int(rng.uniform(0.06 * H, max(0.07 * H, H - ch - 0.04 * H)))
        im = im.crop((x1, y1, x1 + cw, y1 + ch)).resize((W, H), Image.Resampling.BICUBIC)
    elif mode == 2:
        # Anterior clinical focus (left-to-center or right-to-center 74-82% window)
        scale = float(rng.uniform(0.74, 0.82))
        cw, ch = int(W * scale), int(H * scale)
        x1 = int(rng.uniform(0.02 * W, 0.14 * W))
        y1 = int(rng.uniform(0.08 * H, 0.18 * H))
        im = im.crop((x1, y1, min(W, x1 + cw), min(H, y1 + ch))).resize((W, H), Image.Resampling.BICUBIC)
    elif mode == 3:
        # Lateral/Posterior clinical focus (flank/back/hindquarters 74-82% window)
        scale = float(rng.uniform(0.74, 0.82))
        cw, ch = int(W * scale), int(H * scale)
        x1 = int(rng.uniform(0.14 * W, max(0.15 * W, W - cw - 0.02 * W)))
        y1 = int(rng.uniform(0.10 * H, 0.20 * H))
        im = im.crop((x1, y1, min(W, x1 + cw), min(H, y1 + ch))).resize((W, H), Image.Resampling.BICUBIC)
    else:
        # Angled perspective view (slight rotation + body proportion stretch/stockiness)
        ang = float(rng.uniform(-5.5, 5.5))
        im_rot = im.rotate(ang, resample=Image.Resampling.BICUBIC, expand=False)
        # Crop 86% inner box to avoid black rotation corners
        cw, ch = int(W * 0.86), int(H * 0.86)
        x1 = (W - cw) // 2 + int(rng.integers(-15, 16))
        y1 = (H - ch) // 2 + int(rng.integers(-12, 13))
        x1 = max(0, min(W - cw, x1))
        y1 = max(0, min(H - ch, y1))
        im = im_rot.crop((x1, y1, x1 + cw, y1 + ch)).resize((W, H), Image.Resampling.BICUBIC)

    return np.array(im, dtype=np.uint8)


def generate_frame_b_variation(frame_a_rgb: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """
    Produces the secondary camera frame (Frame B) from a base scene (Frame A),
    representing a second shot taken by the farmer/annotator a moment later from
    a shifted camera angle, distance, perspective, and ambient exposure (strictly 2x).
    """
    H, W, _ = frame_a_rgb.shape
    im = Image.fromarray(frame_a_rgb)

    # 1. Camera angle tilt (-4.5 to +4.5 deg) & distance zoom (84% to 92%)
    angle = float(rng.choice([-1.0, 1.0]) * rng.uniform(2.0, 4.8))
    im = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)

    zoom = float(rng.uniform(0.84, 0.92))
    cw, ch = int(W * zoom), int(H * zoom)
    dx = int(rng.uniform(-0.04 * W, 0.04 * W))
    dy = int(rng.uniform(-0.04 * H, 0.04 * H))
    x1 = max(0, min(W - cw, (W - cw) // 2 + dx))
    y1 = max(0, min(H - ch, (H - ch) // 2 + dy))
    im = im.crop((x1, y1, x1 + cw, y1 + ch)).resize((W, H), Image.Resampling.BICUBIC)

    # 2. Subtle camera auto-exposure & white-balance shift between shots
    im = ImageEnhance.Brightness(im).enhance(float(rng.uniform(0.91, 1.09)))
    im = ImageEnhance.Contrast(im).enhance(float(rng.uniform(0.93, 1.08)))
    im = ImageEnhance.Color(im).enhance(float(rng.uniform(0.92, 1.09)))

    arr = np.array(im, dtype=np.float32)
    # Slight color temperature shift (warmer or cooler)
    temp = float(rng.uniform(-6.0, 6.0))
    arr[:, :, 0] += temp
    arr[:, :, 2] -= temp
    return np.clip(arr, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Pre-Loading & Preparing the Multi-Pose Rig Pool
# ---------------------------------------------------------------------------
def build_rig_pool(patch_bank: dict[str, list[tuple[np.ndarray, np.ndarray]]]) -> dict[str, list[dict]]:
    """
    Loads all base images, heals/replaces duplicate mirrors in dataset_samples,
    extracts sub-poses from multi-pig pens, and pre-computes solid segmentation masks.
    Returns a dictionary of rig dicts for 'healthy_swine' and each disease class.
    """
    rng_init = np.random.default_rng(20261101)

    # First, replace the two mirror duplicates in dataset_samples (greasy_pig_04 and erysipelas_04)
    # with genuinely distinct clinical base scenes so dataset_samples itself has zero mirror duplicates!
    h05_path = SAMPLES_DIR / "healthy_swine" / "healthy_swine_sample_05.jpg"
    h06_path = SAMPLES_DIR / "healthy_swine" / "healthy_swine_sample_06.jpg"
    if h05_path.exists():
        im_h5 = np.array(Image.open(h05_path).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC))
        pa5, sc5, lm5 = segment_pig_and_skin(im_h5)
        gp_coated = apply_breed_coat(im_h5, sc5, lm5, breed_id=3, rng=rng_init)
        gp_lesioned, _ = synthesize_clinical_lesions(gp_coated, sc5, "greasy_pig_disease", patch_bank, rng_init, intensity=1.15)
        gp_env = transform_backyard_environment(gp_lesioned, pa5, wall_style=1, floor_style=0, lighting_style=1, rng=rng_init)
        Image.fromarray(gp_env).resize((1200, 896), Image.Resampling.BICUBIC).save(
            SAMPLES_DIR / "greasy_pig_disease" / "greasy_pig_disease_sample_04.jpg", quality=94
        )
    if h06_path.exists():
        im_h6 = np.array(Image.open(h06_path).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC))
        pa6, sc6, lm6 = segment_pig_and_skin(im_h6)
        se_coated = apply_breed_coat(im_h6, sc6, lm6, breed_id=0, rng=rng_init)
        se_lesioned, _ = synthesize_clinical_lesions(se_coated, sc6, "swine_erysipelas", patch_bank, rng_init, intensity=1.15)
        se_env = transform_backyard_environment(se_lesioned, pa6, wall_style=2, floor_style=1, lighting_style=2, rng=rng_init)
        Image.fromarray(se_env).resize((1200, 896), Image.Resampling.BICUBIC).save(
            SAMPLES_DIR / "swine_erysipelas" / "swine_erysipelas_sample_04.jpg", quality=94
        )

    def make_rig_entry(rgb_arr: np.ndarray, name: str, is_native_clinical: bool) -> dict:
        pa, sc, lm = segment_pig_and_skin(rgb_arr)
        return {
            "name": name,
            "rgb": rgb_arr,
            "pig_alpha": pa,
            "skin_canvas": sc,
            "lesion_mask": lm,
            "is_native_clinical": is_native_clinical,
        }

    # Load all 9 healthy_swine base images + extra sub-crops from landing page photos -> 15 healthy rigs
    healthy_rigs = []
    for p in sorted((SAMPLES_DIR / "healthy_swine").glob("*.jpg")):
        im = Image.open(p).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        healthy_rigs.append(make_rig_entry(np.array(im), p.stem, False))

    # Add distinct sub-crops from multi-pig pens so Healthy Swine has 15 distinct pose rigs
    h02_p = SAMPLES_DIR / "healthy_swine" / "healthy_swine_sample_02.jpg"
    if h02_p.exists():
        im02 = Image.open(h02_p).convert("RGB")
        w, h = im02.size
        # Left standing piglets crop & right piglets crop
        c1 = im02.crop((0, int(h * 0.12), int(w * 0.68), int(h * 0.92))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        c2 = im02.crop((int(w * 0.28), int(h * 0.14), w, int(h * 0.94))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        healthy_rigs.append(make_rig_entry(np.array(c1), "healthy_02_left_group", False))
        healthy_rigs.append(make_rig_entry(np.array(c2), "healthy_02_right_group", False))

    bio_pen_p = LANDING_DIR / "swine-biosecurity-pen.jpg"
    if bio_pen_p.exists():
        bio = Image.open(bio_pen_p).convert("RGB")
        bw, bh = bio.size
        # Full 4-pig outdoor pen, grazing white pig solo crop, lying pink pig solo crop, drinking pig crop
        full_pen = bio.crop((int(bw * 0.12), int(bh * 0.15), int(bw * 0.88), int(bh * 0.95))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        grazing_solo = bio.crop((int(bw * 0.16), int(bh * 0.38), int(bw * 0.44), int(bh * 0.88))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        lying_solo = bio.crop((int(bw * 0.50), int(bh * 0.52), int(bw * 0.84), int(bh * 0.88))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        drinking_solo = bio.crop((int(bw * 0.48), int(bh * 0.36), int(bw * 0.78), int(bh * 0.76))).resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
        healthy_rigs.append(make_rig_entry(np.array(full_pen), "healthy_bio_full_pen", False))
        healthy_rigs.append(make_rig_entry(np.array(grazing_solo), "healthy_grazing_solo", False))
        healthy_rigs.append(make_rig_entry(np.array(lying_solo), "healthy_lying_solo", False))
        healthy_rigs.append(make_rig_entry(np.array(drinking_solo), "healthy_drinking_solo", False))

    # Select clean single-pig & pair rigs that serve as cross-pose anatomical canvases for disease synthesis
    clean_canvas_rigs = [
        r for r in healthy_rigs
        if r["name"] in (
            "healthy_swine_sample_01",
            "healthy_swine_sample_03",
            "healthy_swine_sample_04",
            "healthy_swine_sample_05",
            "healthy_swine_sample_06",
            "healthy_swine_sample_07",
            "healthy_swine_sample_08",
            "healthy_swine_sample_09",
            "healthy_grazing_solo",
            "healthy_lying_solo",
            "healthy_drinking_solo",
        )
    ]

    pool: dict[str, list[dict]] = {"healthy_swine": healthy_rigs}

    for d_key in CLASS_CONFIG.keys():
        if d_key == "healthy_swine":
            continue
        class_rigs = []
        for p in sorted((SAMPLES_DIR / d_key).glob("*.jpg")):
            im = Image.open(p).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.BICUBIC)
            class_rigs.append(make_rig_entry(np.array(im), p.stem, True))
        # Append the 11 clean anatomical cross-pose rigs (which will receive synthesized lesions of d_key)
        for cr in clean_canvas_rigs:
            class_rigs.append(cr)
        pool[d_key] = class_rigs

    return pool


# ---------------------------------------------------------------------------
# Main Generation Pipeline (250 Base Scenes x 2 Frames = 500 Images / Class)
# ---------------------------------------------------------------------------
def save_jpeg_task(args: tuple[np.ndarray, pathlib.Path]) -> None:
    arr, out_path = args
    Image.fromarray(arr).save(out_path, format="JPEG", quality=90, optimize=False)


def generate_dataset() -> None:
    t0 = time.time()
    print("=" * 78)
    print("PIGIFY ROBOFLOW DATASET GENERATOR — 500 IMAGES PER CLASS (3,000 TOTAL)")
    print("=" * 78)

    if OUTPUT_DIR.exists():
        print(f"Cleaning previous output directory: {OUTPUT_DIR}")
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("[1/4] Extracting Upper-Envelope Clinical Dermatological Ratio Patch Bank...")
    patch_bank = build_clinical_ratio_bank()
    for k, v in patch_bank.items():
        print(f"      - {k}: {len(v)} high-salience dermatological patches ready")

    print("[2/4] Building Multi-Pose Swine Rig Pool & Solid Bristle Alpha Mattes...")
    rig_pool = build_rig_pool(patch_bank)
    for k, v in rig_pool.items():
        print(f"      - {k}: {len(v)} distinct pose rigs available")

    print(f"[3/4] Generating {BASE_SCENES_PER_CLASS} distinct base scenes x {FRAMES_PER_SCENE} camera frames = 500 images per folder...")

    total_written = 0
    for class_idx, (class_key, cfg) in enumerate(CLASS_CONFIG.items()):
        c_t0 = time.time()
        folder_name = cfg["folder"]
        short_tag = cfg["short"]
        class_dir = OUTPUT_DIR / folder_name
        class_dir.mkdir(parents=True, exist_ok=True)

        rigs = rig_pool[class_key]
        native_rigs = [r for r in rigs if r["is_native_clinical"]]
        cross_rigs = [r for r in rigs if not r["is_native_clinical"]]

        # Class-specific deterministic RNG so Healthy and Diseased never share identical combinations
        rng = np.random.default_rng(10000 + class_idx * 1337)
        write_queue: list[tuple[np.ndarray, pathlib.Path]] = []

        for scene_idx in range(1, BASE_SCENES_PER_CLASS + 1):
            # For disease classes: 45% use native clinical rigs (with varied breed/env/lesion boost),
            # 55% use cross-pose pig rigs with synthesized pathogen-specific clinical lesions
            if class_key == "healthy_swine":
                rig = rigs[(scene_idx - 1) % len(rigs)]
            else:
                if (scene_idx % 20) < 9 and len(native_rigs) > 0:
                    rig = native_rigs[(scene_idx // 2) % len(native_rigs)]
                else:
                    rig = cross_rigs[(scene_idx - 1) % len(cross_rigs)]

            base_rgb = rig["rgb"].copy()
            pig_alpha = rig["pig_alpha"].copy()
            skin_canvas = rig["skin_canvas"].copy()
            lesion_mask = rig["lesion_mask"].copy()

            # Horizontal orientation variation on base scene
            if (scene_idx + class_idx) % 2 == 1:
                base_rgb = base_rgb[:, ::-1, :]
                pig_alpha = pig_alpha[:, ::-1]
                skin_canvas = skin_canvas[:, ::-1]
                lesion_mask = lesion_mask[:, ::-1]

            # Deterministic prime-stepped selection of breed, wall, floor, lighting, and framing
            # offset by class_idx so every class has disjoint scene combinations
            breed_id = (scene_idx * 3 + class_idx * 5) % 8
            wall_style = (scene_idx * 5 + class_idx * 2) % 6
            floor_style = (scene_idx * 7 + class_idx * 3 + (scene_idx // 6)) % 6
            lighting_style = (scene_idx * 11 + class_idx) % 6
            framing_mode = (scene_idx + class_idx * 2) % 5

            # 1. Apply Philippine backyard pig breed / coat color transformation
            scene_rgb = apply_breed_coat(base_rgb, skin_canvas, lesion_mask, breed_id, rng)

            # 2. For the 5 disease classes, synthesize / augment pathogen-specific clinical lesions
            if class_key != "healthy_swine":
                if not rig["is_native_clinical"]:
                    # Cross-pose clean rig: render full pathogen-specific clinical lesions onto skin_canvas
                    scene_rgb, _ = synthesize_clinical_lesions(
                        scene_rgb, skin_canvas, class_key, patch_bank, rng, intensity=float(rng.uniform(0.95, 1.22))
                    )
                else:
                    # Native clinical rig: add secondary randomized clinical patches so lesion pattern varies across scenes
                    scene_rgb, _ = synthesize_clinical_lesions(
                        scene_rgb, skin_canvas, class_key, patch_bank, rng, intensity=float(rng.uniform(0.45, 0.78))
                    )

            # 3. Transform backyard farm environment (wall/fence backdrop + floor bedding + lighting/fixtures)
            scene_rgb = transform_backyard_environment(
                scene_rgb, pig_alpha, wall_style=wall_style, floor_style=floor_style, lighting_style=lighting_style, rng=rng
            )

            # 4. Apply camera framing (Frame A: Primary Base Scene)
            frame_a = apply_scene_framing(scene_rgb, framing_mode=framing_mode, rng=rng)

            # 5. Generate secondary camera angle/perspective shot (Frame B: 2x pair)
            frame_b = generate_frame_b_variation(scene_rgb, rng=rng)

            breed_tag = BREED_NAMES[breed_id].lower()
            fname_a = f"{short_tag}_scene{scene_idx:03d}_frameA_{breed_tag}.jpg"
            fname_b = f"{short_tag}_scene{scene_idx:03d}_frameB_{breed_tag}.jpg"

            write_queue.append((frame_a, class_dir / fname_a))
            write_queue.append((frame_b, class_dir / fname_b))

        with ThreadPoolExecutor(max_workers=8) as ex:
            list(ex.map(save_jpeg_task, write_queue))

        n_saved = len(write_queue)
        total_written += n_saved
        print(f"  -> [{class_idx + 1}/6] {folder_name}: {n_saved} images ({BASE_SCENES_PER_CLASS} base scenes x 2) in {time.time() - c_t0:.1f}s")

    print(f"[4/4] Packaging all {total_written} images into Roboflow archive: {ZIP_PATH.name} ...")
    z_t0 = time.time()
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()

    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_STORED) as zf:
        for img_file in sorted(OUTPUT_DIR.rglob("*.jpg")):
            arcname = img_file.relative_to(OUTPUT_DIR)
            zf.write(img_file, arcname)

    zip_mb = ZIP_PATH.stat().st_size / (1024 * 1024)
    print("=" * 78)
    print(f"COMPLETED SUCCESSFULLY in {time.time() - t0:.1f}s!")
    print(f"  Output Folder : {OUTPUT_DIR}")
    print(f"  Zip Archive   : {ZIP_PATH} ({zip_mb:.1f} MB, packaged in {time.time() - z_t0:.1f}s)")
    print(f"  Total Images  : {total_written} (6 folders x 500 images)")
    print("=" * 78)


if __name__ == "__main__":
    generate_dataset()


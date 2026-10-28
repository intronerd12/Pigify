"""
PIGIFY Dataset Generator (1,000+ Images)
Generates a balanced, realistic 1,000+ image dataset for swine skin disease detection
specifically calibrated for Philippine backyard piggeries.
"""

import os
import random
import shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw

CLASSES = [
    {"id": 0, "name": "african_swine_fever", "folder": "african_swine_fever", "box": [0.48, 0.52, 0.82, 0.65]},
    {"id": 1, "name": "swine_erysipelas", "folder": "swine_erysipelas", "box": [0.50, 0.54, 0.84, 0.62]},
    {"id": 2, "name": "sarcoptic_mange", "folder": "sarcoptic_mange", "box": [0.52, 0.50, 0.80, 0.68]},
    {"id": 3, "name": "greasy_pig_disease", "folder": "greasy_pig_disease", "box": [0.50, 0.55, 0.76, 0.70]},
    {"id": 4, "name": "porcine_dermatitis_pdns", "folder": "porcine_dermatitis_pdns", "box": [0.51, 0.52, 0.80, 0.64]},
    {"id": 5, "name": "healthy_swine", "folder": "healthy_swine", "box": [0.55, 0.56, 0.74, 0.60]},
]

TARGET_PER_CLASS = 170  # 170 * 6 = 1020 images
VAL_RATIO = 0.2
IMG_SIZE = (640, 640)
SEED = 42

random.seed(SEED)
np.random.seed(SEED)

BASE_DIR = Path(r"c:\Users\bumat\Downloads\Pigify")
SRC_DIR = BASE_DIR / "dataset_samples"
OUT_DIR = BASE_DIR / "dataset_1000"

def apply_farm_variations(img: Image.Image, variant_idx: int) -> Image.Image:
    """Applies realistic Philippine backyard farm conditions."""
    img = img.copy()
    
    # 1. Flip (simulate facing left or right)
    if random.random() > 0.5:
        img = ImageOps.mirror(img)
        
    # 2. Lighting & Time of Day Simulation
    # Tropical midday sun vs overcast monsoon vs shaded afternoon stall
    light_type = random.choice(["bright_sun", "diffused_monsoon", "afternoon_shade", "warm_dusk", "neutral"])
    if light_type == "bright_sun":
        img = ImageEnhance.Brightness(img).enhance(random.uniform(1.08, 1.25))
        img = ImageEnhance.Contrast(img).enhance(random.uniform(1.05, 1.20))
    elif light_type == "diffused_monsoon":
        img = ImageEnhance.Brightness(img).enhance(random.uniform(0.85, 0.96))
        img = ImageEnhance.Color(img).enhance(random.uniform(0.82, 0.95))
    elif light_type == "afternoon_shade":
        img = ImageEnhance.Brightness(img).enhance(random.uniform(0.90, 1.05))
        img = ImageEnhance.Contrast(img).enhance(random.uniform(0.92, 1.08))
    elif light_type == "warm_dusk":
        # Slight warm color tone
        r, g, b = img.split()
        r = ImageEnhance.Brightness(r).enhance(1.08)
        b = ImageEnhance.Brightness(b).enhance(0.92)
        img = Image.merge("RGB", (r, g, b))

    # 3. Slight Rotation / Handheld Phone Camera Angle (-10 to +10 degrees)
    rot_angle = random.uniform(-10.0, 10.0)
    img = img.rotate(rot_angle, resample=Image.Resampling.BILINEAR, expand=False)

    # 4. Zoom / Cropping (simulate distance to pig: wide vs triage close-up)
    w, h = img.size
    crop_scale = random.uniform(0.78, 1.0)
    if crop_scale < 1.0:
        new_w, new_h = int(w * crop_scale), int(h * crop_scale)
        left = random.randint(0, w - new_w)
        top = random.randint(0, h - new_h)
        img = img.crop((left, top, left + new_w, top + new_h))

    # 5. Pen Occlusions (simulated bamboo slat or wire mesh shadow occasionally)
    if random.random() < 0.25:
        draw = ImageDraw.Draw(img, "RGBA")
        slat_x = random.randint(20, w - 80)
        slat_w = random.randint(15, 40)
        alpha = random.randint(40, 95)
        draw.rectangle([slat_x, 0, slat_x + slat_w, h], fill=(30, 20, 10, alpha))

    # 6. Camera Sensor Noise & Sharpness / Blur
    if random.random() < 0.30:
        # Farmer quick motion blur
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.4, 0.9)))
    elif random.random() < 0.35:
        # Sharpness adjustment
        img = ImageEnhance.Sharpness(img).enhance(random.uniform(1.2, 1.7))

    # 7. Final Resize to standard YOLO training resolution (640x640)
    img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    return img

def build_dataset():
    print(f"Creating dataset in: {OUT_DIR}")
    
    # Setup folders
    dirs = {
        "images_train": OUT_DIR / "images" / "train",
        "images_val": OUT_DIR / "images" / "val",
        "labels_train": OUT_DIR / "labels" / "train",
        "labels_val": OUT_DIR / "labels" / "val",
    }
    for d in dirs.values():
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True, exist_ok=True)

    by_class_dir = OUT_DIR / "by_class"
    if by_class_dir.exists():
        shutil.rmtree(by_class_dir)
    by_class_dir.mkdir(parents=True, exist_ok=True)

    summary_counts = {}
    total_train = 0
    total_val = 0

    for cls in CLASSES:
        cls_id = cls["id"]
        cls_name = cls["name"]
        folder_name = cls["folder"]
        default_box = cls["box"]  # [xc, yc, w, h]
        
        cls_src = SRC_DIR / folder_name
        seed_files = [f for f in cls_src.glob("*.jpg")] + [f for f in cls_src.glob("*.png")]
        if not seed_files:
            print(f"Warning: No seed files found in {cls_src}")
            continue
            
        print(f"Processing '{cls_name}': {len(seed_files)} seed images -> {TARGET_PER_CLASS} target images...")
        
        class_out_dir = by_class_dir / cls_name
        class_out_dir.mkdir(parents=True, exist_ok=True)
        
        # Load all seed PIL images
        seed_imgs = [Image.open(f).convert("RGB") for f in seed_files]
        
        val_target = int(round(TARGET_PER_CLASS * VAL_RATIO))
        train_target = TARGET_PER_CLASS - val_target
        
        indices = list(range(TARGET_PER_CLASS))
        random.shuffle(indices)
        val_indices = set(indices[:val_target])
        
        for i in range(TARGET_PER_CLASS):
            seed = random.choice(seed_imgs)
            aug_img = apply_farm_variations(seed, i)
            
            is_val = (i in val_indices)
            split = "val" if is_val else "train"
            
            stem = f"{cls_name}_{i+1:04d}"
            img_filename = f"{stem}.jpg"
            lbl_filename = f"{stem}.txt"
            
            # Save into split
            img_path = dirs[f"images_{split}"] / img_filename
            aug_img.save(img_path, format="JPEG", quality=92)
            
            # Save into by_class
            class_img_path = class_out_dir / img_filename
            aug_img.save(class_img_path, format="JPEG", quality=92)
            
            # Slightly jitter box to match bounding box variations
            xc = min(0.95, max(0.05, default_box[0] + random.uniform(-0.04, 0.04)))
            yc = min(0.95, max(0.05, default_box[1] + random.uniform(-0.04, 0.04)))
            bw = min(0.98, max(0.20, default_box[2] + random.uniform(-0.05, 0.05)))
            bh = min(0.98, max(0.20, default_box[3] + random.uniform(-0.05, 0.05)))
            
            lbl_content = f"{cls_id} {xc:.4f} {yc:.4f} {bw:.4f} {bh:.4f}\n"
            lbl_path = dirs[f"labels_{split}"] / lbl_filename
            with open(lbl_path, "w", encoding="utf-8") as f:
                f.write(lbl_content)
                
            if is_val:
                total_val += 1
            else:
                total_train += 1
                
        summary_counts[cls_name] = TARGET_PER_CLASS

    # Generate data.yaml for YOLO training
    names_yaml = "\n".join([f"  {c['id']}: {c['name']}" for c in CLASSES])
    data_yaml_content = f"""# PIGIFY YOLOv8 Dataset Configuration
path: {OUT_DIR.as_posix()}
train: images/train
val: images/val

# Classes (6 Classes)
nc: {len(CLASSES)}
names:
{names_yaml}
"""
    yaml_path = OUT_DIR / "data.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(data_yaml_content)

    print("\n" + "=" * 50)
    print("Dataset generation complete!")
    print(f"Total images generated: {total_train + total_val}")
    print(f"  - Train images: {total_train}")
    print(f"  - Val images:   {total_val}")
    print(f"data.yaml generated at: {yaml_path}")
    print("=" * 50)

if __name__ == "__main__":
    build_dataset()

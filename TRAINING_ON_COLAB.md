# PIGIFY: Swine Disease Colab Training Guide (6 Classes, 1,000+ Images)

Train your deep learning swine disease and symptom monitoring model using your 1,000+ image dataset.

### Swine Disease Classes:
0. `african_swine_fever` (ASF)
1. `swine_erysipelas` (Diamond Skin Disease)
2. `sarcoptic_mange` (Galis Baboy)
3. `greasy_pig_disease` (Exudative Epidermitis)
4. `porcine_dermatitis_pdns` (PDNS)
5. `healthy_swine` (Healthy Control)

Target output:
- `yolov8_pigify_best.pt`

---

## 1) Package The Dataset Locally
Run in your PowerShell terminal:

```powershell
.\prepare_pigify_dataset.ps1
```

This packages the `dataset_1000` directory into:
- `pigify_swine_dataset_1000.zip`

---

## 2) Upload To Google Drive
Upload `pigify_swine_dataset_1000.zip` to your Google Drive at:
- `/content/drive/MyDrive/Pigify/pigify_swine_dataset_1000.zip`

---

## 3) Paste & Run This Cell In Google Colab
Set your Colab runtime to GPU first (`Runtime` -> `Change runtime type` -> `T4 GPU`), then paste and run:

```python
from google.colab import drive, files
drive.mount("/content/drive")

!pip -q install ultralytics pyyaml

import shutil
import zipfile
from pathlib import Path
import yaml
from ultralytics import YOLO

# ================== CONFIG ==================
ZIP_PATH = Path("/content/drive/MyDrive/Pigify/pigify_swine_dataset_1000.zip")
EPOCHS = 35
IMGSZ = 640
BATCH = 16
DEVICE = 0  # GPU 0
RUN_NAME = "pigify_swine_model"
RUNS_PROJECT = Path("/content/runs/detect")
OUT_WEIGHTS = Path("/content/yolov8_pigify_best.pt")
# ============================================

if not ZIP_PATH.exists():
    raise FileNotFoundError(f"Zip not found: {ZIP_PATH}. Please check your Drive path.")

work_root = Path("/content/pigify_dataset")
if work_root.exists():
    shutil.rmtree(work_root)
work_root.mkdir(parents=True, exist_ok=True)

print(f"Extracting {ZIP_PATH.name}...")
with zipfile.ZipFile(ZIP_PATH, "r") as zf:
    zf.extractall(work_root)

# Find data.yaml or create dynamically
yaml_candidates = list(work_root.rglob("data.yaml"))
if yaml_candidates:
    data_yaml = yaml_candidates[0]
    print(f"Found dataset config at: {data_yaml}")
else:
    raise FileNotFoundError("data.yaml not found inside extracted zip.")

# Update absolute path inside data.yaml for Colab environment
with open(data_yaml, "r") as f:
    conf = yaml.safe_load(f)

dataset_base = data_yaml.parent
conf["path"] = str(dataset_base)
conf["train"] = "images/train"
conf["val"] = "images/val"

with open(data_yaml, "w") as f:
    yaml.safe_dump(conf, f, sort_keys=False)

print("Dataset classes:", conf.get("names"))

# Train with Ultralytics YOLOv8
model = YOLO("yolov8s.pt")  # Starting from pre-trained YOLOv8s
results = model.train(
    data=str(data_yaml),
    epochs=EPOCHS,
    imgsz=IMGSZ,
    batch=BATCH,
    device=DEVICE,
    project=str(RUNS_PROJECT),
    name=RUN_NAME,
    exist_ok=True
)

best_pt = Path(results.save_dir) / "weights" / "best.pt"
if not best_pt.exists():
    raise FileNotFoundError(f"Training completed but weights not found at {best_pt}")

shutil.copy2(best_pt, OUT_WEIGHTS)
print(f"Successfully trained! Best weights saved to: {OUT_WEIGHTS}")
files.download(str(OUT_WEIGHTS))
```

---

## 4) Load Into Pigify
Once downloaded, place `yolov8_pigify_best.pt` into your `backend/` or root `Pigify/` directory to serve real-time predictions via the dashboard and mobile app.

# Pigify ML Models (YOLOv11 Swine Disease Detection)

This directory stores deep-learning weights (`.pt` or ONNX format) for Pigify's swine clinical vision pipeline.

### Swine Disease Classes (6 Classes)
1. `african_swine_fever` (ASF / Lagnat-Baboy Aprikano)
2. `swine_erysipelas` (Diamond Skin Disease / Bulutong-Diyamante)
3. `sarcoptic_mange` (Acariasis / Galis-Baboy Kagid)
4. `greasy_pig_disease` (Exudative Epidermitis / Langis-Balat)
5. `porcine_dermatitis_pdns` (PDNS / Pamumantal ng Baboy)
6. `healthy_swine` (Normal Healthy Dermis / Malusog na Baboy)

### Training
To train or fine-tune models, use the curated swine dataset in `roboflow_dataset_500/` or `dataset_samples/`.
Weights placed here as `swine_yolo.pt` or `yolo_best.pt` will automatically be loaded by the AI vision engine.
When weights are not present, the system operates seamlessly using grounded clinical heuristic triage and Gemini AI vision.


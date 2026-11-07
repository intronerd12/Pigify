$source = "roboflow_dataset_500"
$target = "pigify_roboflow_dataset_500_per_class.zip"

if (!(Test-Path $source)) {
    Write-Host "Generating 500-per-folder Roboflow dataset via backend/generate_roboflow_dataset_500.py..."
    python backend/generate_roboflow_dataset_500.py
}

if (!(Test-Path $target)) {
    Write-Host "Creating Roboflow zip archive from '$source'..."
    Compress-Archive -Path "$source\*" -DestinationPath $target -Force
}

Write-Host "Successfully packaged: $target"
Write-Host ("File size: {0:N2} MB" -f ((Get-Item $target).Length / 1MB))

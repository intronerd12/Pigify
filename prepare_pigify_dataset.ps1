$source = "dataset_1000"
$target = "pigify_swine_dataset_1000.zip"

if (!(Test-Path $source)) {
    throw "Source folder not found: $source"
}

Write-Host "Creating training zip from '$source'..."
if (Test-Path $target) {
    Remove-Item $target -Force
}
Compress-Archive -Path "$source\*" -DestinationPath $target -Force
Write-Host "Successfully packaged: $target"
Write-Host "File size: $((Get-Item $target).Length / 1MB) MB"

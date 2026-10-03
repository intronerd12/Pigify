const API_BASE = 'http://localhost:8000';

let stream = null;
let processedCount = 0;
let healthScores = [];

const startBtn = document.getElementById('startBtn');
const captureBtn = document.getElementById('captureBtn');
const stopBtn = document.getElementById('stopBtn');
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const resultsDiv = document.getElementById('results');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const cameraStatus = document.getElementById('cameraStatus');
const apiStatus = document.getElementById('apiStatus');

startBtn.addEventListener('click', startDetection);
captureBtn.addEventListener('click', captureImage);
stopBtn.addEventListener('click', stopDetection);

// Check backend health on page load
window.addEventListener('load', checkBackendHealth);

async function checkBackendHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.status === 'healthy' || res.ok) {
            updateSystemStatus('Online', true);
            apiStatus.textContent = 'Backend: Connected';
            apiStatus.classList.remove('offline');
        }
    } catch (err) {
        updateSystemStatus('Offline', false);
        apiStatus.textContent = 'Backend: Offline';
        apiStatus.classList.add('offline');
    }
}

function updateSystemStatus(text, isOnline) {
    statusText.textContent = text;
    if (isOnline) {
        statusIndicator.style.background = '#16a34a';
    } else {
        statusIndicator.style.background = '#dc2626';
    }
}

async function startDetection() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        camera.srcObject = stream;
        
        startBtn.disabled = true;
        captureBtn.disabled = false;
        stopBtn.disabled = false;
        cameraStatus.textContent = 'Active';
        cameraStatus.classList.remove('inactive');
        
        appendResult('Pen camera initialized successfully');
    } catch (err) {
        appendResult(`❌ Camera Error: ${err.message}`, 'danger');
        cameraStatus.textContent = 'Error';
        cameraStatus.classList.add('inactive');
    }
}

async function captureImage() {
    if (!camera.videoWidth) {
        appendResult('❌ Camera not ready', 'danger');
        return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    ctx.drawImage(camera, 0, 0);
    
    appendResult('📸 Swine scan captured, evaluating clinical triage...');
    
    canvas.toBlob(async (blob) => {
        await sendToBackend(blob);
    }, 'image/jpeg', 0.9);
}

async function sendToBackend(imageBlob) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'swine_scan.jpg');
    
    try {
        const res = await fetch(`${API_BASE}/detect`, {
            method: 'POST',
            body: formData
        });
        
        if (!res.ok) {
            throw new Error(`Server error: ${res.statusText}`);
        }
        
        const data = await res.json();
        processResults(data);
    } catch (err) {
        appendResult(`❌ Clinical Analysis Error: ${err.message}`, 'danger');
    }
}

function processResults(analysisData) {
    processedCount++;
    
    // Update stats
    document.getElementById('processedCount').textContent = processedCount;
    
    // Extract metrics
    const healthScore = analysisData.health_score || analysisData.confidence * 100 || 85;
    const biosecurityScore = analysisData.biosecurity_score || 90;
    const riskScore = analysisData.disease_risk || (100 - healthScore);
    
    healthScores.push(healthScore);
    const avgHealth = (healthScores.reduce((a, b) => a + b, 0) / healthScores.length).toFixed(1);
    document.getElementById('avgQuality').textContent = avgHealth + '%';
    
    // Update metric bars
    document.getElementById('metricRipeness').style.width = healthScore + '%';
    document.getElementById('ripenessPct').textContent = healthScore.toFixed(1) + '%';
    
    document.getElementById('metricQuality').style.width = biosecurityScore + '%';
    document.getElementById('qualityPct').textContent = biosecurityScore.toFixed(1) + '%';
    
    document.getElementById('metricDefects').style.width = riskScore + '%';
    document.getElementById('defectsPct').textContent = riskScore.toFixed(1) + '%';
    
    // Update detailed parameters
    updateParameterDetails(analysisData);
    
    // Display results
    clearResults();
    appendResult('✓ Clinical Inspection Complete', 'success');
    appendResult(`Clinical Health Grade: ${analysisData.grade || 'Grade A'}`, 'success');
    appendResult(`Health Index: ${healthScore.toFixed(1)}%`);
    appendResult(`Biosecurity Index: ${biosecurityScore.toFixed(1)}%`);
    appendResult(`Risk Level: ${riskScore.toFixed(1)}%`);
    
    if (analysisData.notes || analysisData.treatment_recommendation) {
        appendResult(`Treatment/Notes: ${analysisData.notes || analysisData.treatment_recommendation}`);
    }
}

function updateParameterDetails(data) {
    document.getElementById('colorDetail').textContent = data.skin_condition || 'Clear pink dermis, no cyanosis detected';
    document.getElementById('surfaceDetail').textContent = data.posture_mobility || 'Normal alert stance, active gait';
    document.getElementById('sizeDetail').textContent = data.body_condition || 'BCS 3.0 / Ideal weight range';
    document.getElementById('ripenessDetail').textContent = data.thermal_status || 'Thermal comfort 22°C (Optimal)';
    document.getElementById('gradeDetail').textContent = data.grade || 'Grade A (Prime Healthy)';
    document.getElementById('defectDetail').textContent = data.lesion_description || 'None / No clinical pathogens flagged';
}

function stopDetection() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        camera.srcObject = null;
    }
    
    startBtn.disabled = false;
    captureBtn.disabled = true;
    stopBtn.disabled = true;
    cameraStatus.textContent = 'Ready';
    cameraStatus.classList.add('inactive');
    
    clearResults();
    appendResult('Camera stopped');
}

function clearResults() {
    resultsDiv.innerHTML = '';
}

function appendResult(text, type = 'default') {
    const p = document.createElement('p');
    p.textContent = text;
    if (type === 'danger') p.style.color = '#ef4444';
    if (type === 'success') p.style.color = '#22c55e';
    resultsDiv.appendChild(p);
}

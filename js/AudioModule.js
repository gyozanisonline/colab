const audioCTX = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let gainNode = null;
let analyser = null;
let dataArray = null;
let isPlaying = false;

function initAudio() {
    // Initial setup if needed
    const playBtn = document.getElementById('play-audio');
    if (playBtn) {
        playBtn.addEventListener('click', toggleAudio);
        playBtn.innerText = "Start Ambient Sound";
    }

    // Setup Analyser
    analyser = audioCTX.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function toggleAudio() {
    if (isPlaying) {
        stopAudio();
    } else {
        startAudio();
    }
}

function startAudio() {
    if (audioCTX.state === 'suspended') {
        audioCTX.resume();
    }

    oscillator = audioCTX.createOscillator();
    gainNode = audioCTX.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioCTX.currentTime); // 220 Hz

    // Connect Graph: Osc -> Gain -> Analyser -> Dest
    oscillator.connect(gainNode);
    gainNode.connect(analyser); // Connect to analyser
    analyser.connect(audioCTX.destination);

    oscillator.start();

    // Smooth attack
    gainNode.gain.setValueAtTime(0, audioCTX.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCTX.currentTime + 1);

    isPlaying = true;

    const playBtn = document.getElementById('play-audio');
    if (playBtn) playBtn.innerText = "Stop Ambient Sound";

    // Simple modulation loop
    modulateAudio();
}

function stopAudio() {
    if (oscillator) {
        // Smooth release
        gainNode.gain.linearRampToValueAtTime(0, audioCTX.currentTime + 1);
        setTimeout(() => {
            if (oscillator) {
                oscillator.stop();
                oscillator.disconnect();
                oscillator = null;
            }
        }, 1000);
    }
    isPlaying = false;

    const playBtn = document.getElementById('play-audio');
    if (playBtn) playBtn.innerText = "Start Ambient Sound";
}

function modulateAudio() {
    if (!isPlaying || !oscillator) return;

    // Simple random frequency drift
    const time = audioCTX.currentTime;
    const freq = 200 + Math.sin(time) * 50;
    oscillator.frequency.setTargetAtTime(freq, time, 0.1);

    requestAnimationFrame(modulateAudio);
}

// Public API for other modules
window.audioModule = {
    getAudioData: () => {
        if (!analyser) return 0;
        analyser.getByteFrequencyData(dataArray);
        // Return average volume for simple reactivity
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / dataArray.length; // 0-255 average
    }
};

// Init when DOM is ready
document.addEventListener('DOMContentLoaded', initAudio);

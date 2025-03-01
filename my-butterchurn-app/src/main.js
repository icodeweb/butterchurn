import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

const canvas = document.querySelector('canvas');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentAudioSource = null;
let micStream = null;

const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: canvas.width,
  height: canvas.height
});

const presets = butterchurnPresets.getPresets();
let allPresets = Object.keys(presets);
let presetKey = allPresets[Math.floor(Math.random() * allPresets.length)];

let presetSelectElement = document.createElement("select");
allPresets.forEach(preset => {
  let presetOption = new Option(preset, preset);
  presetSelectElement.appendChild(presetOption);
});
presetSelectElement.value = presetKey;
document.body.appendChild(presetSelectElement);

presetSelectElement.addEventListener("change", () => {
  presetKey = presetSelectElement.value;
  visualizer.loadPreset(presets[presetKey], 5.0);
});
visualizer.loadPreset(presets[presetKey], 0.0);

let inputSelectElement = document.createElement("select");
let micOptionElement = new Option("mic", "mic");
let mp3OptionElement = new Option("mp3", "mp3");
inputSelectElement.appendChild(micOptionElement);
inputSelectElement.appendChild(mp3OptionElement);
document.body.appendChild(inputSelectElement);

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "audio/mp3";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

fileInput.addEventListener("change", async (event) => {
  stopCurrentAudio();
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    playAudio(audioBuffer);
  };
});

function playAudio(audioBuffer) {
  stopCurrentAudio();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  visualizer.connectAudio(source);
  currentAudioSource = source;
  source.start(0);
}

function stopCurrentAudio() {
  if (currentAudioSource) {
    currentAudioSource.disconnect();
    currentAudioSource = null;
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
}

inputSelectElement.addEventListener("change", async () => {
  stopCurrentAudio();

  if (inputSelectElement.value === "mp3") {
    fileInput.style.display = "block";
  } else {
    fileInput.style.display = "none";
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentAudioSource = audioContext.createMediaStreamSource(micStream);
      visualizer.connectAudio(currentAudioSource);
    } catch (err) {
      console.error("❌ Failed to get audio stream:", err);
    }
  }
});

visualizer.setRendererSize(canvas.width, canvas.height);
function renderFrame() {
  requestAnimationFrame(renderFrame);
  visualizer.render();
}
renderFrame();

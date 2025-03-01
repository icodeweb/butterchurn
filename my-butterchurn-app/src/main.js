import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
let input = "mp3;";

// تأكد من وجود <canvas>
const canvas = document.querySelector('canvas');
if (!canvas) {
  console.error("❌ No <canvas> element found!");
}

// إنشاء `AudioContext`
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// إنشاء الـ visualizer
const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: canvas.width,
  height: canvas.height
});

// تحميل الـ Presets
const presets = butterchurnPresets.getPresets();
let allPresets = Object.keys(butterchurnPresets.getPresets());
let presetKey = allPresets[15];

let presetSelectElemnt = document.createElement("select");
allPresets.forEach(preset => {
  let presetOption = document.createElement("option");
  presetOption.text = preset
  presetOption.value = preset
  presetSelectElemnt.appendChild(presetOption)
})
document.body.appendChild(presetSelectElemnt)

presetSelectElemnt.addEventListener("change", () => {
  presetKey = presetSelectElemnt.value
  visualizer.loadPreset(presets[presetKey], 5.0);
})


{/* <label for="choices">Choose an option:</label>
<select id="presetSelect">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
    <option value="option4">Option 4</option>
</select> */}
if (presets[presetKey]) {
  visualizer.loadPreset(presets[presetKey], 0.0);
} else {
  console.error("❌ Preset not found!");
}
if (input === "mp3") {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'audio/mp3';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      playAudio(audioBuffer);
      fileInput.remove();
    };
  });

  function playAudio(audioBuffer) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    visualizer.connectAudio(source);

    source.start(0);
  }
} else {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioSource = audioContext.createMediaStreamSource(stream);
    visualizer.connectAudio(audioSource);
  }).catch(err => {
    console.error("❌ Failed to get audio stream:", err);
  });
}


document.addEventListener('click', async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
    console.log("✅ AudioContext resumed!");
  }
});

// ضبط الحجم
visualizer.setRendererSize(canvas.width, canvas.height);

// تشغيل الـ visualizer
function renderFrame() {
  requestAnimationFrame(renderFrame);
  visualizer.render();
}
renderFrame();


// audioContext = new AudioContext();
// fetch('/my-butterchurn-app/src/بنها العسل.mp3')
//   .then(response => response.arrayBuffer())
//   .then(data => audioContext.decodeAudioData(data))
//   .then(buffer => {
//     const source = audioContext.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContext.destination);
//     source.start(0); // تشغيل الصوت فورًا
//   });
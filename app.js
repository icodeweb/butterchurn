import butterchurn from "butterchurn";
import butterchurnPresets from "butterchurn-presets";

// تحقق من دعم WebGL2
if (!window.WebGL2RenderingContext) {
    alert("WebGL2 is not supported on your browser!");
} else {
    // إنشاء AudioContext و Canvas
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const canvas = document.getElementById("visualizer");

    // إنشاء الفيزوالايزر
    const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
        width: window.innerWidth,
        height: window.innerHeight
    });

    // ربط الفيزوالايزر بمصدر الصوت (الميكروفون أو أي ملف صوتي)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const audioNode = audioContext.createMediaStreamSource(stream);
        visualizer.connectAudio(audioNode);

        // تحميل Presets
        const presets = butterchurnPresets.getPresets();
        const preset = presets["Flexi, martin + geiss - dedicated to the sherwin maxawow"];
        visualizer.loadPreset(preset, 0.0);

        // ضبط الحجم والتحديث المستمر
        visualizer.setRendererSize(window.innerWidth, window.innerHeight);
        function render() {
            visualizer.render();
            requestAnimationFrame(render);
        }
        render();
    }).catch((err) => console.error("Error accessing microphone:", err));
}
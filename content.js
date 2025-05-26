// Create a single audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Set up filters, compressor, and gain
const bandpassFilter = audioCtx.createBiquadFilter();
bandpassFilter.type = "bandpass";
bandpassFilter.frequency.value = 1500; // center frequency (voice)
bandpassFilter.Q.value = 1;            // bandwidth

const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
compressor.knee.setValueAtTime(40, audioCtx.currentTime);
compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

const gainNode = audioCtx.createGain();
gainNode.gain.value = 2.5; // boost audio (you can adjust this later)

// Connect filter → compressor → gain → output
bandpassFilter.connect(compressor);
compressor.connect(gainNode);
gainNode.connect(audioCtx.destination);

// Find all media elements (audio + video)
const mediaElements = document.querySelectorAll("audio, video");

// Apply enhancement to each media element
mediaElements.forEach(media => {
    // Skip if already connected
    if (media._enhanced) return;

    const source = audioCtx.createMediaElementSource(media);
    source.connect(bandpassFilter);
    media._enhanced = true; // mark as processed
});
// Global refs for popup interaction
window._audioCtx = audioCtx;
window._gainNode = gainNode;
window._filterChainStart = bandpassFilter;
//window._filterChainEnd = compressor; ----  given by codegeex
// // Apply the gain to all media elements
// mediaElements.forEach(media => {
//     const gainNode = audioCtx.createGain();
//     gainNode.gain.value = 2.5; // boost audio (you can adjust this later)
//     gainNode.connect(audioCtx.destination);
//     media._gainNode = gainNode; // store gain node for later use            
// })
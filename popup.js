// When gain slider changes
document.getElementById('gainRange').addEventListener('input', async (e) => {
  const gain = parseFloat(e.target.value);
  document.getElementById('gainValue').innerText = gain.toFixed(1);

  // Send gain value to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (gainValue) => {
      if (window._gainNode) {
        window._gainNode.gain.value = gainValue;
      }
    },
    args: [gain]
  });
});

// When toggle checkbox changes
document.getElementById('enableToggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (enable) => {
      const mediaElements = document.querySelectorAll("audio, video");

      mediaElements.forEach(media => {
        if (!window._audioCtx || !window._gainNode || !window._filterChainStart) return;

        if (enable && !media._enhanced) {
          const source = window._audioCtx.createMediaElementSource(media);
          source.connect(window._filterChainStart);
          media._enhanced = true;
        } else if (!enable && media._enhanced) {
          // Just mark as unenhanced (disconnection isn't fully implemented for stability)
          media._enhanced = false;
          console.log("Enhancement disabled (restart page to fully reset).");
        }
      });
    },
    args: [enabled]
  });
});

// Handle Filter Mode change
document.getElementById('modeSelect').addEventListener('change', async (e) => {
  const selectedMode = e.target.value;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (mode) => {
      if (!window._filterChainStart) return;

      const filter = window._filterChainStart;
      if (mode === "voice") {
        filter.type = "bandpass";
        filter.frequency.value = 1500;
        filter.Q.value = 1.0;
      } else if (mode === "music") {
        filter.type = "peaking";
        filter.frequency.value = 800;
        filter.Q.value = 0.8;
        filter.gain.value = 2.0;
      } else if (mode === "bass") {
        filter.type = "lowshelf";
        filter.frequency.value = 200;
        filter.gain.value = 4.0;
      }
    },
    args: [selectedMode]
  });
});


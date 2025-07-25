// settings.js
let currentSettings = {};

function initializeSettingsPage() {
  const slider = document.getElementById("concurrent-downloads-slider");
  const valueLabel = document.getElementById("concurrent-downloads-value");
  const resetAppBtn = document.getElementById("reset-app-btn");
  const clearMediaBtn = document.getElementById("clear-media-btn");
  const appVersionEl = document.getElementById("app-version");

  const updateSettingsUI = (settings) => {
    currentSettings = settings;
    slider.value = settings.concurrentDownloads;
    valueLabel.textContent = settings.concurrentDownloads;
  };

  window.electronAPI.getSettings().then(updateSettingsUI);
  window.electronAPI.getAppVersion().then((v) => {
    if (appVersionEl) appVersionEl.textContent = `Version ${v}`;
  });

  slider.addEventListener("input", (e) => {
    valueLabel.textContent = e.target.value;
  });
  slider.addEventListener("change", (e) => {
    window.electronAPI.saveSettings({
      ...currentSettings,
      concurrentDownloads: parseInt(e.target.value, 10),
    });
  });

  resetAppBtn.addEventListener("click", () => {
    showConfirmationModal(
      "Reset ViveStream?",
      "This will restore all settings to their defaults. Your downloaded media will not be deleted.",
      async () => {
        const newSettings = await window.electronAPI.resetApp();
        updateSettingsUI(newSettings);
        loadSettings(); // Reload all settings in the UI
        showNotification(
          "ViveStream has been reset to default settings.",
          "info"
        );
      }
    );
  });

  clearMediaBtn.addEventListener("click", () => {
    showConfirmationModal(
      "Delete All Media?",
      "<strong>WARNING:</strong> This will permanently delete all your downloaded videos, audio, and thumbnails. This action cannot be undone.",
      async () => {
        const result = await window.electronAPI.clearAllMedia();
        if (result.success) {
          showNotification("All local media has been deleted.", "success");
          currentlyPlayingIndex = -1;
          videoPlayer.src = "";
          closeMiniplayer();
          await loadLibrary();
          showPage("home");
        } else {
          showNotification(`Error: ${result.error}`, "error");
        }
      }
    );
  });

  document
    .getElementById("github-view-link")
    ?.addEventListener("click", () =>
      window.electronAPI.openExternal(
        "https://github.com/Md-Siam-Mia-Code/ViveStream-Revived"
      )
    );
  document
    .getElementById("github-star-link")
    ?.addEventListener("click", () =>
      window.electronAPI.openExternal(
        "https://github.com/Md-Siam-Mia-Code/ViveStream-Revived/stargazers"
      )
    );
}

window.electronAPI.onClearLocalStorage(() => {
  const keysToKeep = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith("viveStream_")) {
      keysToKeep.push({ key: key, value: localStorage.getItem(key) });
    }
  }
  localStorage.clear();
  keysToKeep.forEach((item) => localStorage.setItem(item.key, item.value));
  console.log(
    "Cleared app-specific localStorage as requested by main process."
  );
});

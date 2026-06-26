import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isLayerEnabled, setIsLayerEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get("gmail_layer_enabled", (result) => {
      if (result.gmail_layer_enabled !== undefined) {
        setIsLayerEnabled(!!result.gmail_layer_enabled);
      }
    });
  }, []);

  const toggleLayer = () => {
    const newState = !isLayerEnabled;
    setIsLayerEnabled(newState);
    chrome.storage.local.set({ gmail_layer_enabled: newState });

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggle_layer",
          enabled: newState,
        });
      }
    });
  };

  return (
    <div className="popup-container">
      <div className="header">
        <span className="icon">🏷️</span>
        <h2>Gmail Tags</h2>
      </div>

      <p className="description">
        Manage your inbox efficiently by adding customizable tags to your emails
        right from the list view.
      </p>

      <div className="toggle-section">
        <span>Enable Tags Overlay</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isLayerEnabled}
            onChange={toggleLayer}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="footer">
        <p>Label selections save automatically.</p>
      </div>
    </div>
  );
}

export default App;

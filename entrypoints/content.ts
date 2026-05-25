export default defineContentScript({
  matches: ["https://mail.google.com/*"],
  main() {
    let isLayerEnabled = true;
    let savedLabels: Record<string, string> = {};

    // 1. Inject global CSS instead of setting inline styling per element
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-label-container { position: relative; display: inline-flex; margin-left: 8px; vertical-align: middle; z-index: 99; }
      .custom-label-chip { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; font-family: Roboto, Arial, sans-serif; display: flex; align-items: center; gap: 4px; transition: all 0.2s ease; border: 1px solid transparent; }
      .custom-label-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
      .custom-label-container:hover .custom-label-chip { filter: brightness(0.95); }
      .custom-label-container[data-tag="Add Tag"]:hover .custom-label-chip { background-color: #f1f3f4; filter: none; }
      tr.zA { transition: background-color 0.2s ease, box-shadow 0.2s ease; }
      body.gmail-tags-disabled .custom-label-container { display: none !important; }
    `;
    document.head.appendChild(style);

    const LABEL_STYLES: Record<
      string,
      { bg: string; text: string; icon: string }
    > = {
      "Add Tag": { bg: "transparent", text: "#5f6368", icon: "🏷️" },
      Important: { bg: "#fce8e6", text: "#c5221f", icon: "🔥" },
      "Follow Up": { bg: "#fef7e0", text: "#e37400", icon: "⏳" },
      Work: { bg: "#e8f0fe", text: "#1967d2", icon: "💼" },
      Personal: { bg: "#e6f4ea", text: "#137333", icon: "🏠" },
    };

    // Initialize body class early if possible, else wait for DOM
    if (document.body) {
      document.body.classList.toggle("gmail-tags-disabled", !isLayerEnabled);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.classList.toggle("gmail-tags-disabled", !isLayerEnabled);
      });
    }

    // 2. Fetch state and manage body class
    chrome.storage.local.get(
      ["gmail_custom_labels", "gmail_layer_enabled"],
      (result) => {
        savedLabels = result.gmail_custom_labels || {};
        if (result.gmail_layer_enabled !== undefined) {
          isLayerEnabled = result.gmail_layer_enabled;
          if (document.body) {
            document.body.classList.toggle(
              "gmail-tags-disabled",
              !isLayerEnabled,
            );
          }
          forceUpdateAllRows();
        }
      },
    );

    // Toggle layer by using body class
    chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
      if (req.action === "toggle_layer") {
        isLayerEnabled = req.enabled;
        document.body.classList.toggle("gmail-tags-disabled", !isLayerEnabled);
        forceUpdateAllRows();
        sendResponse({ success: true });
      }
    });

    // 3. Simple UI Injector Pooler
    setInterval(() => {
      document.querySelectorAll("tr.zA").forEach((row) => {
        const threadEl = row.querySelector(
          "[data-legacy-thread-id], [data-thread-id]",
        );
        const threadId =
          threadEl?.getAttribute("data-legacy-thread-id") ||
          threadEl?.getAttribute("data-thread-id") ||
          row.id;
        if (!threadId) return;

        const subjectWrapper = row.querySelector(".bog, .y6, .xT");
        if (!subjectWrapper) return;

        let container = subjectWrapper.querySelector(
          ".custom-label-container",
        ) as HTMLDivElement;

        // Initialize if not present
        if (!container) {
          container = document.createElement("div");
          container.className = "custom-label-container";
          container.setAttribute("data-tag", "Add Tag");

          const optionsHtml = Object.keys(LABEL_STYLES)
            .map((opt) => `<option value="${opt}">${opt}</option>`)
            .join("");
          container.innerHTML = `
            <div class="custom-label-chip">
              <span class="icon"></span><span class="text"></span>
            </div>
            <select class="custom-label-select">${optionsHtml}</select>
          `;

          const stopEvent = (e: Event) => e.stopPropagation();
          ["click", "mousedown", "mouseup"].forEach((evt) =>
            container.addEventListener(evt, stopEvent),
          );

          container.querySelector("select")!.addEventListener("change", (e) => {
            const val = (e.target as HTMLSelectElement).value;
            savedLabels[threadId] = val;
            chrome.storage.local.set({ gmail_custom_labels: savedLabels });
            updateRowUI(container, val, row as HTMLTableRowElement);
          });

          subjectWrapper.appendChild(container);
          updateRowUI(container, "Add Tag", row as HTMLTableRowElement);
        }

        // Sync State
        const select = container.querySelector("select") as HTMLSelectElement;
        const currentLabel = savedLabels[threadId] || "Add Tag";
        if (
          select.value !== currentLabel ||
          !container.hasAttribute("data-synced")
        ) {
          select.value = currentLabel;
          updateRowUI(container, currentLabel, row as HTMLTableRowElement);
          container.setAttribute("data-synced", "true");
        }
      });
    }, 1000);

    // 4. Single update function for Chips and Rows
    function updateRowUI(
      container: HTMLDivElement,
      value: string,
      row: HTMLTableRowElement,
    ) {
      const style = LABEL_STYLES[value] || LABEL_STYLES["Add Tag"];
      container.setAttribute("data-tag", value);

      const chip = container.querySelector(
        ".custom-label-chip",
      ) as HTMLDivElement;
      chip.style.backgroundColor = style.bg;
      chip.style.color = style.text;
      chip.style.borderColor = value === "Add Tag" ? "#dadce0" : style.bg;

      container.querySelector(".icon")!.textContent = style.icon;
      container.querySelector(".text")!.textContent = value;

      // Handle Row Accent
      if (!isLayerEnabled || value === "Add Tag") {
        row.style.backgroundColor = "";
        row.style.boxShadow = "";
      } else {
        row.style.backgroundColor = style.bg;
        row.style.boxShadow = `inset 4px 0 0 ${style.text}`;
      }
    }

    function forceUpdateAllRows() {
      document.querySelectorAll(".custom-label-container").forEach((c) => {
        const row = c.closest("tr.zA") as HTMLTableRowElement;
        const val =
          (c.querySelector("select") as HTMLSelectElement)?.value || "Add Tag";
        if (row) updateRowUI(c as HTMLDivElement, val, row);
      });
    }
  },
});

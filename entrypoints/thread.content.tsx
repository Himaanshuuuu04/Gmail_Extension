import { createRoot } from "react-dom/client";
import React from "react";
import { Sidebar } from "../components/Sidebar";
import { InsightCard } from "../components/InsightCard";
import "../components/styles.css";

export default defineContentScript({
  matches: ["https://mail.google.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("AIRA Insights extension loaded");

    // Initialize Sidebar UI
    const sidebarUi = await createShadowRootUi(ctx, {
      name: "aira-sidebar-ui",
      position: "inline",
      anchor: ".bAw", // The Gmail side panel container
      append: (anchor, ui) => {
        anchor.parentElement?.insertBefore(ui, anchor);
        const mainContent = ui.previousElementSibling as HTMLElement | null;
        if (mainContent) {
          mainContent.style.padding = "0px";
          mainContent.style.borderRadius = "16px";
          mainContent.style.overflow = "hidden";
        }
      },
      onMount: (container) => {
        const root = createRoot(container);
        root.render(<Sidebar />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    const mountInterval = setInterval(() => {
      if (document.querySelector(".bAw") && !document.querySelector("aira-sidebar-ui")) {
        try {
          sidebarUi.mount();
          clearInterval(mountInterval);
        } catch (e) {
          console.warn("AIRA Sidebar mount delayed:", e);
        }
      }
    }, 1000);

    // In Gmail thread view, messages are usually grouped in a container with class .Bk or .G2 / .G3
    // Individual messages inside the thread usually have classes like .kv (collapsed), .h7 (expanded), .adn.ads, or .adf.ads
    const MESSAGE_CONTAINER_SELECTOR = ".kv, .h7, .adn.ads, .adf.ads";

    setInterval(() => {
      // Find the main thread container. We want to avoid injecting on the normal home page.
      // The home page is a list of rows (tr.zA). The thread view is usually a container with .Bk or .G2
      const threadContainers = document.querySelectorAll(".Bk, .G2, .G3");
      
      threadContainers.forEach(container => {
        const messages = Array.from(container.querySelectorAll(MESSAGE_CONTAINER_SELECTOR));
        
        // Only apply on threads consisting of multiple followups
        if (messages.length > 1) {
          messages.forEach(async (msgEl, index) => {
            // Avoid duplicate injections
            if (msgEl.hasAttribute("data-aira-injected")) return;
            msgEl.setAttribute("data-aira-injected", "true");

            // We only want to inject a few cards as requested
            if (index < 3) {
              const types = ["ownership", "decision", "followup"] as const;
              const type = types[index];
              
              try {
                const cardUi = await createShadowRootUi(ctx, {
                  name: `aira-insight-card-${Math.random().toString(36).substring(7)}`,
                  position: "inline",
                  anchor: msgEl,
                  append: (anchor, ui) => {
                    const uiHtml = ui as HTMLElement;
                    uiHtml.style.display = "block";
                    uiHtml.style.padding = "0 16px";
                    uiHtml.style.marginBottom = "8px";
                    uiHtml.addEventListener("click", (e) => e.stopPropagation());
                    anchor.insertAdjacentElement("afterend", uiHtml);
                  },
                  onMount: (container) => {
                    const root = createRoot(container);
                    root.render(<InsightCard type={type} />);
                    return root;
                  },
                  onRemove: (root) => {
                    root?.unmount();
                  },
                });
                cardUi.mount();
              } catch (e) {
                console.warn("AIRA Card mount failed:", e);
              }
            }
          });
        }
      });
    }, 2000);
  },
});

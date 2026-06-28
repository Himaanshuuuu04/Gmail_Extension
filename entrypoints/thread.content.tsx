import { createRoot } from "react-dom/client";
import React from "react";
import { Sidebar } from "../components/Sidebar";
import { InsightCard } from "../components/InsightCard";
import "../components/styles.css";

type Surface = "gmail" | "chat";

const INSIGHT_TYPES = ["ownership", "decision", "followup"] as const;

const SELECTORS = {
  gmail: {
    sidebarAnchor: ".bAw",
    threadContainers: ".Bk, .G2, .G3",
    messageRows: ".kv, .h7, .adn.ads, .adf.ads",
  },
  chat: {
    sidebarAnchor: '[role="complementary"][aria-label="Side panel"]',
    threadContainers: 'c-wiz[data-is-main-view="true"][data-topic-id]',
    messageRows:
      '.nF6pT[role="group"][data-id], c-wiz[data-multiplat-item-id^="MSG_LIST/"][data-topic-id]',
  },
} as const;

function getSurface(): Surface | null {
  if (location.hostname.includes("mail.google.com")) return "gmail";
  if (location.hostname.includes("chat.google.com")) return "chat";
  return null;
}

function getSelectors(surface: Surface) {
  return SELECTORS[surface];
}

export default defineContentScript({
  matches: ["https://mail.google.com/*", "https://chat.google.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("AIRA Insights extension loaded");

    const surface = getSurface();
    if (!surface) return;
    const selectors = getSelectors(surface);

    // Initialize Sidebar UI
    const sidebarUi = await createShadowRootUi(ctx, {
      name: "aira-sidebar-ui",
      position: "inline",
      anchor: selectors.sidebarAnchor,
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
        root.render(<Sidebar surface={surface} />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    const sidebarMountInterval = setInterval(() => {
      if (
        document.querySelector(selectors.sidebarAnchor) &&
        !document.querySelector("aira-sidebar-ui")
      ) {
        try {
          sidebarUi.mount();
          clearInterval(sidebarMountInterval);
        } catch (e) {
          console.warn("AIRA Sidebar mount delayed:", e);
        }
      }
    }, 1000);

    const MESSAGE_CONTAINER_SELECTOR = selectors.messageRows;

    setInterval(() => {
      const threadContainers = document.querySelectorAll(
        selectors.threadContainers,
      );

      threadContainers.forEach((container) => {
        const messages = Array.from(
          container.querySelectorAll(MESSAGE_CONTAINER_SELECTOR),
        );

        // Only apply on threads consisting of multiple followups
        if (messages.length > 1) {
          messages.forEach(async (msgEl, index) => {
            // Avoid duplicate injections
            if (msgEl.hasAttribute("data-aira-injected")) return;
            msgEl.setAttribute("data-aira-injected", "true");

            // We only want to inject a few cards as requested
            if (index < 3) {
              const type = INSIGHT_TYPES[index];

              try {
                const cardUi = await createShadowRootUi(ctx, {
                  name: `aira-insight-card-${Math.random().toString(36).substring(7)}`,
                  position: "inline",
                  anchor: msgEl,
                  append: (anchor, ui) => {
                    const uiHtml = ui as HTMLElement;
                    uiHtml.style.display = "block";
                    uiHtml.style.padding =
                      surface === "chat" ? "0 10px" : "0 16px";
                    uiHtml.style.margin =
                      surface === "chat" ? "8px 0 12px" : "0 0 8px";
                    uiHtml.addEventListener("click", (e) =>
                      e.stopPropagation(),
                    );
                    anchor.insertAdjacentElement(
                      surface === "chat" ? "afterend" : "afterend",
                      uiHtml,
                    );
                  },
                  onMount: (container) => {
                    const root = createRoot(container);
                    root.render(<InsightCard type={type} surface={surface} />);
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

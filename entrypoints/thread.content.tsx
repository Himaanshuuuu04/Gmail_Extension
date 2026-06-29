import { createRoot } from "react-dom/client";
import React from "react";
import { Sidebar } from "../components/Sidebar";
import { InsightCard, InsightType, CardVariant } from "../components/InsightCard";
import "../components/styles.css";

type Surface = "gmail" | "chat";

const CARD_PERMUTATIONS: Array<{ type: InsightType; variant: CardVariant }> = [
  { type: "followup", variant: "compact" },
  { type: "ownership", variant: "full" },
  { type: "decision", variant: "full" },
  { type: "ownership", variant: "compact" },
  { type: "followup", variant: "full" },
  { type: "decision", variant: "compact" },
];

const SELECTORS = {
  gmail: {
    sidebarAnchor: ".bAw",
    threadContainers: ".Bk, .G2, .G3",
    messageRows: ".kv, .h7, .adn.ads, .adf.ads",
  },
  chat: {
    sidebarAnchor:
      '.Kk7lMc-DWWcKd-OomVLb-haAclf, [role="complementary"][aria-label="Side panel"]',
    threadContainers:
      'c-wiz[data-topic-id], c-wiz[data-multiplat-item-id^="MSG_LIST/"], c-wiz.cZICLc',
    messageRows:
      '.nF6pT[data-id], .nF6pT[role="group"], [data-is-initial-message-of-thread="true"]',
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
        if (surface === "chat") {
          // The anchor is the inner side panel. Its parent (.JXi8l) is the wrapper for the vertical bar.
          // To ensure our sidebar appears on the left of the vertical bar, we insert it before the wrapper.
          const wrapper = anchor.parentElement;
          if (wrapper && wrapper.parentElement) {
            wrapper.parentElement.insertBefore(ui, wrapper);
          } else if (anchor.parentElement) {
            anchor.parentElement.insertBefore(ui, anchor);
          }
        } else {
          anchor.parentElement?.insertBefore(ui, anchor);
          const mainContent = ui.previousElementSibling as HTMLElement | null;
          if (mainContent) {
            mainContent.style.padding = "0px";
            mainContent.style.borderRadius = "16px";
            mainContent.style.overflow = "hidden";
          }
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

    let isMounting = false;
    const sidebarMountInterval = setInterval(() => {
      if (
        document.querySelector(selectors.sidebarAnchor) &&
        !document.querySelector("aira-sidebar-ui") &&
        !isMounting
      ) {
        if (surface === "gmail") {
          isMounting = true;
          setTimeout(() => {
            try {
              if (
                document.querySelector(selectors.sidebarAnchor) &&
                !document.querySelector("aira-sidebar-ui")
              ) {
                sidebarUi.mount();
                clearInterval(sidebarMountInterval);
              }
            } catch (e) {
              console.warn("AIRA Sidebar mount delayed:", e);
            } finally {
              isMounting = false;
            }
          }, 2000);
        } else {
          try {
            sidebarUi.mount();
            clearInterval(sidebarMountInterval);
          } catch (e) {
            console.warn("AIRA Sidebar mount delayed:", e);
          }
        }
      }
    }, 1000);

    const MESSAGE_CONTAINER_SELECTOR = selectors.messageRows;
    let cardInjectionCounter = 0;

    setInterval(() => {
      const threadContainers = document.querySelectorAll(
        selectors.threadContainers,
      );

      threadContainers.forEach((container) => {
        const messages = Array.from(
          container.querySelectorAll(MESSAGE_CONTAINER_SELECTOR),
        );

        // Apply on threads (allow single or multiple for Chat)
        if (messages.length >= (surface === "chat" ? 1 : 2)) {
          messages.forEach(async (msgEl, index) => {
            // Avoid duplicate injections
            if (msgEl.hasAttribute("data-aira-injected")) return;
            msgEl.setAttribute("data-aira-injected", "true");

            // Permutate through card types and variants across messages
            const config =
              CARD_PERMUTATIONS[
                cardInjectionCounter % CARD_PERMUTATIONS.length
              ];
            cardInjectionCounter++;
            const { type, variant } = config;

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
                  anchor.insertAdjacentElement("afterend", uiHtml);
                },
                onMount: (container) => {
                  const root = createRoot(container);
                  root.render(
                    <InsightCard
                      type={type}
                      variant={variant}
                      surface={surface}
                    />,
                  );
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
          });
        }
      });
    }, 2000);
  },
});

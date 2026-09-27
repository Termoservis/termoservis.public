// Preserve links to the old installation tab now that MD has its own page.
function redirectLegacyCompanyLink() {
  if (document.body.dataset.company === "service" && location.hash === "#md") {
    location.replace("/md/");
  }
}
redirectLegacyCompanyLink();
window.addEventListener("hashchange", redirectLegacyCompanyLink);

// Native details and anchor links remain usable without JavaScript.
const menu = document.querySelector(".mobile-menu");
if (menu) {
  menu.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    menu.open = false;
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true },
      );
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
}

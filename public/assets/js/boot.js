/* Runs before first paint so scroll-reveal styles only apply when JS works */
document.documentElement.classList.add("js");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.classList.add("reduced");

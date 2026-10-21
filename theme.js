const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem("community-theme");

if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
}

function updateThemeToggle() {
    const isDark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : systemPrefersDark.matches;
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.querySelector("span").textContent = isDark ? "☀" : "☾";
}

updateThemeToggle();

themeToggle.addEventListener("click", function () {
    const isDark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : systemPrefersDark.matches;
    const nextTheme = isDark ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("community-theme", nextTheme);
    updateThemeToggle();
});

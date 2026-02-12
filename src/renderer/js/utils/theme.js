function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Add transition class
  body.style.transition = "background-color 0.3s ease, color 0.3s ease";
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  // Make toggle function globally available
  window.toggleTheme = toggleTheme;
}

function getCurrentTheme() {
  return document.body.getAttribute("data-theme") || "dark";
}

module.exports = {
  toggleTheme,
  initTheme,
  getCurrentTheme,
};

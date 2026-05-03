
(() => {
  'use strict'

  
  const forms = document.querySelectorAll('.needs-validation')

  
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

(() => {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const root = document.documentElement;

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector("i");
    if (!icon) return;
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    themeToggleBtn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    themeToggleBtn.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("themeMode", theme);
    updateThemeIcon(theme);
  }

  const activeTheme = root.getAttribute("data-theme") || "light";
  updateThemeIcon(activeTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }
})();
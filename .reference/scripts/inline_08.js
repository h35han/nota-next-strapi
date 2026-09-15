
document.addEventListener("DOMContentLoaded", function () {

  setTimeout(() => {

    const links = document.querySelectorAll(".menu-link");
    const icons = document.querySelectorAll(".header__icon");
    const logo = document.querySelector(".text-logo");

    function isDesktop() {
      return window.innerWidth > 991;
    }

    function getScrollPercent() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      return (scrollTop / (docHeight - winHeight)) * 100;
    }

    function setColor(color) {

      // важно: только переменная темы (если TapTop её использует)
      document.documentElement.style.setProperty(
        "--header-color",
        color
      );

      links.forEach(el => {
        el.style.color = color;
      });

      icons.forEach(el => {
        el.style.color = color;
      });

      if (logo) {
        logo.style.color = color;
      }

      // &#x1F525; лёгкий триггер пересчёта hover в браузере (не ломает TapTop)
      document.body.style.pointerEvents = "none";
      document.body.offsetHeight;
      document.body.style.pointerEvents = "";
    }

function update() {

  if (!isDesktop()) return;

  const p = getScrollPercent();

  if (
    (p >= 0 && p < 8.17) ||
    (p >= 20.51 && p < 37.58) ||
    (p >= 40.83 && p < 58.60) ||
    (p >= 76.29)
  ) {
    setColor("#ffffff");
  } else {
    setColor("#000000");
  }
}

    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    update();

  }, 2700);

});

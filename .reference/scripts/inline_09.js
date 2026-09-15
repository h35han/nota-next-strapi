
document.addEventListener("DOMContentLoaded", function () {

  const header = document.querySelector(".header__wrapper");

  const icons = document.querySelectorAll(".header__icon");
  const burger = document.querySelector(".header__burger");
  const logo = document.querySelector(".header__logo-icon");

  if (!header) return;

  function isTabletMobile() {
    return window.innerWidth <= 991;
  }

  function setColor(color, borderColor) {

    icons.forEach(el => el.style.color = color);

    if (burger) burger.style.color = color;
    if (logo) logo.style.color = color;

    header.style.borderBottom =
      `1px solid ${borderColor}`;
  }

  function getHeaderBottom() {
    return header.getBoundingClientRect().bottom;
  }

  function getTop(el) {
    return el.getBoundingClientRect().top;
  }

  // секции в порядке появления
  const sections = [
    {
      el: document.querySelector(".specs--static"),
      color: "#000000"
    },
    {
      el: document.querySelector(".who--static"),
      color: "#ffffff"
    },
    {
      el: document.querySelector(".paper__cover--static"),
      color: "#000000"
    },
    {
      el: document.querySelector(".paper__slider--static"),
      color: "#ffffff"
    },
    {
      el: document.querySelector(".inside--static"),
      color: "#000000"
    },
    {
      el: document.querySelector(".details--static"),
      color: "#ffffff"
    }
  ].filter(s => s.el);

  let activeIndex = -1;

  function update() {

    if (!isTabletMobile()) return;

    const headerBottom = getHeaderBottom();

    // ДО первой секции → всегда белый
    const first = sections[0];

    if (first && headerBottom < getTop(first.el)) {
      setColor("#ffffff", "rgba(255,255,255,0.2)");
      activeIndex = -1;
      return;
    }

    // ищем активную секцию
    for (let i = 0; i < sections.length; i++) {

      const sec = sections[i];

      const secTop = getTop(sec.el);
      const next = sections[i + 1];
      const nextTop = next ? getTop(next.el) : Infinity;

      // условие "header bottom внутри секции"
      if (headerBottom >= secTop && headerBottom < nextTop) {

        if (activeIndex !== i) {
          activeIndex = i;

          const color = sec.color;

          const border =
            color === "#ffffff"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)";

          setColor(color, border);
        }

        break;
      }
    }
  }

  setTimeout(() => {

    if (!isTabletMobile()) return;

    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    update();

  }, 500);

});

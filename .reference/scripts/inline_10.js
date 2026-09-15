
document.addEventListener("DOMContentLoaded", function () {

  setTimeout(() => {

    const header = document.querySelector(".header");
    if (!header) return;

    let lastScroll = window.scrollY;
    let ticking = false;

    function showHeader() {
      header.style.transform = "translateY(0)";
    }

    function hideHeader() {
      header.style.transform = "translateY(-101%)";
    }

    function getScrollPercent() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      return (scrollTop / (docHeight - winHeight)) * 100;
    }

    header.style.transition = "transform 0.35s ease";
    header.style.willChange = "transform";
    header.style.backfaceVisibility = "hidden";
    header.style.webkitBackfaceVisibility = "hidden";

    showHeader();

    window.addEventListener("scroll", function () {

      if (!ticking) {

        window.requestAnimationFrame(function () {

          const currentScroll = window.scrollY;
          const scrollPercent = getScrollPercent();

          if (scrollPercent < 6) {

            showHeader();
            lastScroll = currentScroll;
            ticking = false;

            return;
          }

          const diff = currentScroll - lastScroll;

          if (diff > 5) {
            hideHeader();
          }

          if (diff < -5) {
            showHeader();
          }

          lastScroll = currentScroll;
          ticking = false;

        });

        ticking = true;
      }

    });

  }, 2600);

});

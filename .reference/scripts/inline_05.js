
(function () {

  // только desktop
  if (window.innerWidth < 992) return;

  if (window.lenisInitialized) return;
  window.lenisInitialized = true;

  // Ждём окончания preload
  setTimeout(() => {

    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/lenis@1.3.8/dist/lenis.min.js';

    script.onload = function () {

      // =========================
      // СТИЛИ LENIS
      // =========================

      const style = document.createElement('style');

      style.textContent = `
        html.lenis,
        html.lenis body {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }

        .lenis.lenis-stopped {
          overflow: hidden;
        }

        .lenis.lenis-smooth iframe {
          pointer-events: none;
        }
      `;

      document.head.appendChild(style);

      // =========================
      // INIT LENIS
      // =========================

      const lenis = new Lenis({
        duration: 1.2,
        lerp: 0.08,
        wheelMultiplier: 1,
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 1,
        normalizeWheel: true
      });

      window.lenis = lenis;

      // =========================
      // RAF
      // =========================

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // =========================
      // GSAP + ScrollTrigger
      // =========================

      if (window.ScrollTrigger) {

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
      }

      // =========================
      // STABLE ANCHOR JUMP
      // =========================

      document.addEventListener(
        "click",
        function (e) {

          const link = e.target.closest('a[href*="#"]');
          if (!link) return;

          const href = link.getAttribute("href");
          if (!href) return;

          // только якоря текущего сайта
          const isHashOnly = href.startsWith("#");

          const isSamePage =
            href.includes(window.location.pathname) &&
            href.includes("#");

          if (!isHashOnly && !isSamePage) return;

          let hash = "";

          if (isHashOnly) {
            hash = href;
          } else {
            hash = href.substring(href.indexOf("#"));
          }

          if (!hash || hash === "#") return;

          const target = document.querySelector(hash);
          if (!target) return;

          e.preventDefault();
          e.stopPropagation();

          // STOP LENIS
          lenis.stop();

          // отключаем smooth браузера
          document.documentElement.style.scrollBehavior = "auto";
          document.body.style.scrollBehavior = "auto";

          // позиция якоря
          const top =
            target.getBoundingClientRect().top +
            window.pageYOffset;

          // INSTANT JUMP
          window.scrollTo(0, top);

          // обновляем URL
          history.replaceState(null, "", hash);

          // двойной RAF = стабильный reflow
          requestAnimationFrame(() => {

            requestAnimationFrame(() => {

              // refresh ScrollTrigger
              if (window.ScrollTrigger) {
                ScrollTrigger.refresh();
              }

              // restart Lenis
              lenis.start();

            });

          });

        },
        true
      );

    };

    document.head.appendChild(script);

  }, 2700);

})();

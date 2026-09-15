
(function () {

    if (window.innerWidth < 991) return;

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    let scrollLocked = true;
    let scrollTop = 0;

    function lockScroll() {

        scrollTop = window.scrollY || window.pageYOffset;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollTop}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';

    }

    function unlockScroll() {

        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';

        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });

        scrollLocked = false;
    }

    lockScroll();

    function preventScroll(e) {
        if (scrollLocked) {
            e.preventDefault();
        }
    }

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    setTimeout(() => {

        unlockScroll();

        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);

    }, 2600);

})();

/* =============================================
   DAVVBB — Global JS v2
   Cursor · Navbar · Scroll Progress · Reveals
   Magnetic · Smooth anchor scroll
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────
     1. CUSTOM CURSOR (smooth follower)
  ───────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');

  if (cursor && cursorRing) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    // Ring follows with lerp
    (function lerpRing() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();

    // Hover state
    document.querySelectorAll('a, button, [data-magnetic], .passion-card, .stat-card, .fi').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        cursorRing.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      });
    });

    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorRing.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorRing.style.opacity = '1'; });
  }

  /* ─────────────────────────────────
     2. SCROLL PROGRESS BAR
  ───────────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const docH  = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ─────────────────────────────────
     3. NAVBAR SCROLL
  ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────
     4. HAMBURGER / MOBILE MENU
  ───────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─────────────────────────────────
     5. SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal, .reveal-left, .reveal-right') || [])];
      const idx = siblings.indexOf(entry.target);
      const delay = Math.max(0, idx * 70);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  /* ─────────────────────────────────
     6. MAGNETIC BUTTONS
  ───────────────────────────────── */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const POWER = 0.35;

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) * POWER;
      const dy = (e.clientY - cy) * POWER;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'transform 0.1s ease';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    });
  });

  /* ─────────────────────────────────
     7. SMOOTH ANCHOR SCROLL
  ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});

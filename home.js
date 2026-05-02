/* =============================================
   DAVVBB — Home JS v2
   Canvas Mesh · Text Scramble · Parallax
   Counters · Tilt Cards · Particle Burst
   Progress Bars · Manifesto Canvas
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     1. HERO CANVAS — Interactive Particle Mesh
  ══════════════════════════════════════════ */
  (function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const COUNT  = 80;
    const RADIUS = 130;
    const mouse  = { x: -999, y: -999 };

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.ox = this.x;
        this.oy = this.y;
        this.r  = Math.random() * 1.4 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.15;
        // color oscillation
        this.hue = Math.random() < 0.5 ? 'electric' : (Math.random() < 0.5 ? 'cyan' : 'lime');
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.008 + 0.003;
      }
      update(t) {
        // Gentle drift
        this.x += this.vx + Math.sin(t * this.speed + this.phase) * 0.4;
        this.y += this.vy + Math.cos(t * this.speed + this.phase * 1.3) * 0.3;

        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS) {
          const force = (RADIUS - dist) / RADIUS;
          this.x += dx / dist * force * 2.5;
          this.y += dy / dist * force * 2.5;
        }

        // Wrap edges
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
      }
      draw() {
        let color;
        if      (this.hue === 'electric') color = `rgba(255,45,85,${this.alpha})`;
        else if (this.hue === 'cyan')     color = `rgba(0,232,255,${this.alpha * 0.7})`;
        else                              color = `rgba(186,255,41,${this.alpha * 0.6})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const a = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,45,85,${a})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    let animT = 0;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      animT++;
      drawConnections();
      particles.forEach(p => { p.update(animT); p.draw(); });
      requestAnimationFrame(loop);
    }

    function init() {
      resize();
      particles = Array.from({ length: COUNT }, () => new Particle());
      loop();
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    window.addEventListener('resize', () => { resize(); });
    init();
  })();

  /* ══════════════════════════════════════════
     2. HERO TITLE — Text Scramble on Hover
  ══════════════════════════════════════════ */
  (function initScramble() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    const lines = document.querySelectorAll('.ht-line');

    lines.forEach(line => {
      const originalText = line.textContent.trim();
      let scrambleAnim;

      function scramble() {
        clearTimeout(scrambleAnim);
        let iter = 0;
        const maxIter = originalText.length * 2;

        (function step() {
          line.textContent = originalText
            .split('')
            .map((ch, i) => {
              if (ch === ' ') return ' ';
              if (i < iter * 0.4) return ch;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('');

          if (iter < maxIter) {
            iter++;
            scrambleAnim = setTimeout(step, 30);
          } else {
            line.textContent = originalText;
          }
        })();
      }

      line.addEventListener('mouseenter', scramble);
    });
  })();

  /* ══════════════════════════════════════════
     3. STATS — Spring Counters + Bar Fills
  ══════════════════════════════════════════ */
  (function initCounters() {
    const cards = document.querySelectorAll('.stat-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;

        // Counter
        const numEl  = card.querySelector('.counter');
        const barEl  = card.querySelector('.sc-bar-fill');
        if (!numEl) return;

        const target = parseInt(numEl.dataset.target, 10);
        const barW   = barEl ? parseInt(barEl.dataset.width, 10) : 0;

        // Animate number with spring-like easing
        const start    = performance.now();
        const duration = 1800 + Math.random() * 400;

        function easeOutExpo(x) {
          return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        }

        requestAnimationFrame(function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          numEl.textContent = Math.round(easeOutExpo(t) * target);
          if (t < 1) requestAnimationFrame(tick);
          else numEl.textContent = target;
        });

        // Bar
        if (barEl) {
          setTimeout(() => { barEl.style.width = barW + '%'; }, 200);
        }

        obs.unobserve(card);
      });
    }, { threshold: 0.35 });

    cards.forEach(c => obs.observe(c));
  })();

  /* ══════════════════════════════════════════
     4. ABOUT — Progress Bars
  ══════════════════════════════════════════ */
  (function initProgressBars() {
    const fills = document.querySelectorAll('.pi-fill');
    if (!fills.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const w  = el.dataset.width;
        setTimeout(() => { el.style.width = w + '%'; }, 300);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    fills.forEach(f => obs.observe(f));
  })();

  /* ══════════════════════════════════════════
     5. PASSION CARDS — Advanced 3D Tilt + Light
  ══════════════════════════════════════════ */
  (function initTilt() {
    const cards = document.querySelectorAll('.passion-card');

    cards.forEach(card => {
      let raf;

      card.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r  = card.getBoundingClientRect();
          const x  = (e.clientX - r.left) / r.width;
          const y  = (e.clientY - r.top)  / r.height;
          const rx = (y - 0.5) * -10;
          const ry = (x - 0.5) *  10;

          card.style.transition = 'transform 0.08s ease, box-shadow 0.4s ease, border-color 0.4s ease';
          card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;

          // Spotlight glow following cursor
          const pct = `${x * 100}% ${y * 100}%`;
          card.querySelector('.pc-bg').style.backgroundImage =
            `radial-gradient(circle at ${pct}, rgba(255,45,85,0.14), transparent 60%)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.4s';
        card.style.transform  = '';
        const bg = card.querySelector('.pc-bg');
        if (bg) bg.style.backgroundImage = '';
      });
    });
  })();

  /* ══════════════════════════════════════════
     6. FEATURED ITEMS — Velocity Parallax
  ══════════════════════════════════════════ */
  (function initFeaturedHover() {
    document.querySelectorAll('.fi').forEach(fi => {
      fi.addEventListener('mousemove', e => {
        const r = fi.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
        const icon = fi.querySelector('.fi-icon');
        if (icon) icon.style.transform = `translateX(${x * 0.5}px) scale(1.12) rotate(${x}deg)`;
      });
      fi.addEventListener('mouseleave', () => {
        const icon = fi.querySelector('.fi-icon');
        if (icon) icon.style.transform = '';
      });
    });
  })();

  /* ══════════════════════════════════════════
     7. HERO SCROLL PARALLAX (multi-layer)
  ══════════════════════════════════════════ */
  (function initParallax() {
    const title  = document.getElementById('heroTitle');
    const sub    = document.getElementById('heroSub');
    const acts   = document.getElementById('heroActions');
    const tags   = document.getElementById('heroTags');
    const orb1   = document.querySelector('.hero-orb-1');
    const orb2   = document.querySelector('.hero-orb-2');
    const fc1    = document.getElementById('fcCard1');
    const fc2    = document.getElementById('fcCard2');

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const s = window.scrollY;
        if (s > window.innerHeight * 1.2) { ticking = false; return; }

        if (title)  title.style.transform  = `translateY(${s * 0.18}px)`;
        if (sub)    sub.style.transform    = `translateY(${s * 0.12}px)`;
        if (acts)   acts.style.transform   = `translateY(${s * 0.10}px)`;
        if (tags)   tags.style.transform   = `translateY(${s * 0.08}px)`;
        if (orb1)   orb1.style.transform   = `translateY(${s * 0.22}px)`;
        if (orb2)   orb2.style.transform   = `translateY(${-s * 0.10}px)`;
        if (fc1)    fc1.style.transform    = `translateY(${s * 0.06}px)`;
        if (fc2)    fc2.style.transform    = `translateY(${s * 0.09}px)`;

        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  })();

  /* ══════════════════════════════════════════
     8. MANIFESTO CANVAS — Animated Gradient Waves
  ══════════════════════════════════════════ */
  (function initManifestoCanvas() {
    const canvas = document.getElementById('manifestoCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function drawWave(yOffset, amp, freq, phase, color) {
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      for (let x = 0; x <= W; x += 3) {
        const y = H / 2 + yOffset + Math.sin((x * freq) + phase + t * 0.012) * amp
                                   + Math.cos((x * freq * 0.4) + t * 0.007) * (amp * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawWave(-80,  30, 0.008, 0,    'rgba(255,45,85,0.04)');
      drawWave(-40,  20, 0.012, 1.5,  'rgba(0,232,255,0.03)');
      drawWave(  0,  25, 0.010, 3.0,  'rgba(186,255,41,0.025)');
      t++;
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    loop();

    // Reveal quote on scroll
    const quote = document.querySelector('.manifesto-quote');
    if (quote) {
      const qobs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          quote.classList.add('visible');
          qobs.disconnect();
        }
      }, { threshold: 0.3 });
      qobs.observe(quote);
    }
  })();

  /* ══════════════════════════════════════════
     9. CTA BUTTON — Particle Burst on Click
  ══════════════════════════════════════════ */
  (function initParticleBurst() {
    document.querySelectorAll('.btn-lime, .btn-primary').forEach(btn => {
      btn.addEventListener('click', e => {
        burst(e.clientX, e.clientY);
      });
    });

    function burst(cx, cy) {
      const colors = ['#FF2D55', '#00E8FF', '#BAFF29', '#FF6040'];
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        const size = Math.random() * 8 + 4;
        p.style.cssText = `
          position:fixed; pointer-events:none; z-index:9990;
          width:${size}px; height:${size}px; border-radius:50%;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          left:${cx}px; top:${cy}px;
          transform:translate(-50%,-50%);
        `;
        document.body.appendChild(p);

        const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5;
        const vel   = 80 + Math.random() * 120;
        const dx    = Math.cos(angle) * vel;
        const dy    = Math.sin(angle) * vel;
        const dur   = 600 + Math.random() * 400;
        const start = performance.now();

        (function animParticle() {
          const elapsed = performance.now() - start;
          const prog    = Math.min(elapsed / dur, 1);
          const eased   = 1 - Math.pow(prog, 2);

          p.style.left    = cx + dx * prog + 'px';
          p.style.top     = cy + dy * prog + 40 * Math.pow(prog, 2) + 'px';
          p.style.opacity = (1 - prog).toString();
          p.style.transform = `translate(-50%,-50%) scale(${eased})`;

          if (prog < 1) requestAnimationFrame(animParticle);
          else p.remove();
        })();
      }
    }
  })();

  /* ══════════════════════════════════════════
     10. STATS SECTION — Animated Grid BG Canvas
  ══════════════════════════════════════════ */
  (function initStatsCanvas() {
    const canvas = document.getElementById('statsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function drawGrid() {
      const COLS = 20, ROWS = 12;
      const cw = W / COLS, rh = H / ROWS;

      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const wave   = Math.sin(t * 0.02 + c * 0.4 + r * 0.6);
          const alpha  = 0.04 + wave * 0.03;
          const radius = 1.5 + wave * 1;

          ctx.beginPath();
          ctx.arc(c * cw, r * rh, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,45,85,${Math.max(0, alpha)})`;
          ctx.fill();
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      t++;
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);
    loop();
  })();

  /* ══════════════════════════════════════════
     11. FLOATING CARDS — Mouse parallax
  ══════════════════════════════════════════ */
  (function initCardParallax() {
    const fc1 = document.getElementById('fcCard1');
    const fc2 = document.getElementById('fcCard2');
    if (!fc1 || !fc2) return;

    document.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      // fc1 and fc2 already animated by scroll parallax, add subtle mouse offset
      if (window.scrollY < 200) {
        fc1.style.transform = `translateX(${nx * 8}px) translateY(${ny * 5}px)`;
        fc2.style.transform = `translateX(${nx * -5}px) translateY(${ny * 8}px)`;
      }
    });
  })();

  /* ══════════════════════════════════════════
     12. TICKER — Velocity responsive speed
  ══════════════════════════════════════════ */
  (function initTicker() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    let speed = 22;

    window.addEventListener('scroll', () => {
      const sv = Math.abs(window.scrollY - (initTicker._lastY || 0));
      initTicker._lastY = window.scrollY;
      speed = Math.max(10, 22 - sv * 0.5);
      track.style.animationDuration = speed + 's';
    }, { passive: true });
  })();

});

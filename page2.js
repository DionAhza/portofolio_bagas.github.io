/* ==========================================================
   PORTOFOLIO MATCHDAY — interaksi & animasi
   ========================================================== */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $  = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];

    /* ---------- 1. Nama: huruf masuk satu per satu ---------- */
    const nama = $('.nama');
    if (nama) {
        const text = nama.textContent.trim();
        nama.textContent = '';
        let i = 0;
        text.split(' ').forEach(word => {
            const w = document.createElement('span');
            w.className = 'word';
            w.setAttribute('aria-hidden', 'true');
            [...word].forEach(ch => {
                const s = document.createElement('span');
                s.className = 'ch';
                s.style.setProperty('--i', i++);
                s.textContent = ch;
                w.appendChild(s);
            });
            nama.appendChild(w);
        });
    }

    /* ---------- 2. Menu mobile ---------- */
    const toggle = $('.nav-toggle');
    const menu = $('#menu');
    const closeMenu = () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Buka menu');
    };
    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ---------- 3. Progres scroll + menu aktif ---------- */
    const progress = $('.progress');
    const links = $$('.menu a');
    const sections = ['home', 'aboutme', 'skills', 'contact'].map(id => document.getElementById(id));
    let ticking = false;

    function onScroll() {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        progress.style.setProperty('--p', (p * 100).toFixed(2) + '%');
        progress.style.setProperty('--pn', p.toFixed(4));
        progress.style.setProperty('--rot', (scrollY * 0.6).toFixed(0) + 'deg');

        const mark = scrollY + innerHeight * 0.35;
        let current = 0;
        sections.forEach((s, i) => { if (s && s.offsetTop <= mark) current = i; });
        links.forEach((a, i) => {
            a.classList.toggle('active', i === current);
            if (i === current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        ticking = false;
    }
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();

    $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    /* ---------- 4. Kartu pemain miring 3D ---------- */
    const card = $('#playerCard');
    if (card && finePointer && !reduceMotion) {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.setProperty('--ry', (x * 18).toFixed(1) + 'deg');
            card.style.setProperty('--rx', (-y * 18).toFixed(1) + 'deg');
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    }

    /* ---------- 5. Muncul saat scroll: kartu, bar skill, angka ---------- */
    const counters = $$('.count');
    function countUp(el) {
        const to = +el.dataset.to;
        if (reduceMotion) { el.textContent = to; return; }
        const start = performance.now(), dur = 1500, delay = 350;
        (function step(now) {
            const t = Math.min(Math.max((now - start - delay) / dur, 0), 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(to * eased);
            if (t < 1) requestAnimationFrame(step);
        })(start);
    }
    // angka mulai dari 0 hanya kalau JS jalan (tanpa JS tetap tampil nilai akhir)
    counters.forEach(c => { c.textContent = '0'; });

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            en.target.classList.add('in');
            $$('.count', en.target).forEach(countUp);
            obs.unobserve(en.target);
        });
    }, { threshold: 0.25 });
    $$('.pop').forEach(el => io.observe(el));

    /* ---------- 6. Mini game: tendang bola ke gawang ---------- */
    const hero = $('[data-pitch]');
    const ball = $('#heroBall');
    const shadow = $('#ballShadow');
    const goalEl = $('#goal');
    const banner = $('#goalBanner');
    const scoreEl = $('#score');
    const board = $('.scoreboard');
    const hint = $('#hint');
    if (!hero || !ball) return;

    const FLOOR = 34;               // jarak garis pinggir dari bawah (px), sama dengan --floor
    const GRAVITY = 1500;           // px/detik^2
    const ball$ = ball.firstElementChild;
    let W = 0, H = 0, R = 0, goalW = 0, goalH = 0;
    let x = 0, y = 0, vx = 0, vy = 0, rot = 0;
    let scored = false, score = 0, running = false, last = 0, resetTimer = 0;

    function measure() {
        W = hero.clientWidth;
        H = hero.clientHeight;
        R = ball.offsetWidth / 2;
        goalW = goalEl.offsetWidth;
        goalH = goalEl.offsetHeight;
    }

    function resetBall(drop) {
        measure();
        x = W * 0.42;
        y = drop ? -R * 2 : H - FLOOR - R;
        vx = 0;
        vy = 0;
        scored = false;
        render();
    }

    function render() {
        ball.style.transform = `translate3d(${(x - R).toFixed(1)}px,${(y - R).toFixed(1)}px,0)`;
        ball$.style.transform = `rotate(${rot.toFixed(1)}deg)`;
        const floorY = H - FLOOR - R;
        const air = Math.max(floorY - y, 0);
        const s = Math.max(1 - air / 520, 0.35);
        shadow.style.transform = `translate3d(${(x - R).toFixed(1)}px,${(H - FLOOR - R * 0.28 + 2).toFixed(1)}px,0) scale(${s.toFixed(2)})`;
        shadow.style.opacity = (0.25 + s * 0.75).toFixed(2);
    }

    function tick(now) {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, 0.032);
        last = now;

        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        const floorY = H - FLOOR - R;
        let onGround = false;
        if (y >= floorY) {
            y = floorY;
            if (Math.abs(vy) > 140) vy = -vy * 0.66; else { vy = 0; onGround = true; }
        }
        if (y < R) { y = R; vy = Math.abs(vy) * 0.6; }

        // gesekan: lebih besar saat menggelinding di rumput
        vx *= Math.pow(onGround ? 0.3 : 0.75, dt);
        if (Math.abs(vx) < 2) vx = 0;

        // gawang: bola masuk jika berada di dalam bingkai
        const inGoal = x > W - goalW + R * 0.5 && y > H - FLOOR - goalH + R * 0.4;
        if (inGoal && !scored) goal();

        if (x < R) { x = R; vx = Math.abs(vx) * 0.8; }
        if (x > W - R) { x = W - R; vx = -Math.abs(vx) * (scored ? 0.15 : 0.8); }
        if (scored && inGoal) vx *= 0.9;   // jaring menahan bola

        rot += (vx * dt / R) * (180 / Math.PI);
        render();
        requestAnimationFrame(tick);
    }

    function start() {
        if (running) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(tick);
    }

    function goal() {
        scored = true;
        score++;
        scoreEl.textContent = score;
        vx *= 0.35;
        vy *= 0.4;
        board.classList.remove('bump'); goalEl.classList.remove('flash'); banner.classList.remove('show');
        void board.offsetWidth;                // restart animasi
        board.classList.add('bump'); goalEl.classList.add('flash'); banner.classList.add('show');
        if (!reduceMotion) confetti();
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => resetBall(true), 1900);
    }

    function confetti() {
        const colors = ['#ffd51f', '#f7f8ee', '#e3262f', '#2f7fe5', '#ff8a3d'];
        for (let i = 0; i < 40; i++) {
            const c = document.createElement('i');
            c.className = 'confetti';
            c.style.left = (W - goalW / 2 + (Math.random() - .5) * goalW) + 'px';
            c.style.top = (H - FLOOR - goalH / 2) + 'px';
            c.style.setProperty('--c', colors[i % colors.length]);
            c.style.setProperty('--dx', (-Math.random() * W * 0.45 - 40).toFixed(0) + 'px');
            c.style.setProperty('--dy', (-Math.random() * H * 0.55 - 60 + 120).toFixed(0) + 'px');
            c.style.setProperty('--rot', ((Math.random() - .5) * 900).toFixed(0) + 'deg');
            c.style.animationDelay = (Math.random() * 120).toFixed(0) + 'ms';
            hero.appendChild(c);
            setTimeout(() => c.remove(), 1800);
        }
    }

    // ketuk lapangan = tendang bola ke titik itu
    hero.addEventListener('click', e => {
        if (e.target.closest('a,button,input,select,textarea')) return;
        const r = hero.getBoundingClientRect();
        const px = e.clientX - r.left, py = e.clientY - r.top;
        const dx = px - x, dy = py - y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = Math.min(1700, Math.max(650, dist * 2.6));
        vx = dx / dist * speed;
        vy = dy / dist * speed - 180;
        scored = scored && x > W - goalW;   // tendangan baru boleh mencetak gol lagi

        const rp = document.createElement('i');
        rp.className = 'ripple';
        rp.style.left = px + 'px';
        rp.style.top = py + 'px';
        hero.appendChild(rp);
        setTimeout(() => rp.remove(), 650);

        hint.classList.add('done');
    });

    // hemat baterai: berhenti saat hero tidak terlihat
    new IntersectionObserver(([en]) => {
        if (en.isIntersecting) start(); else running = false;
    }, { threshold: 0 }).observe(hero);

    addEventListener('resize', () => { measure(); if (y > H - FLOOR - R) y = H - FLOOR - R; if (x > W - R) x = W - R; render(); });

    // peluit awal: bola jatuh dari atas setelah nama selesai masuk
    resetBall(false);
    if (reduceMotion) { start(); }
    else {
        y = -R * 2; render();
        setTimeout(() => { start(); }, 700);
    }
})();

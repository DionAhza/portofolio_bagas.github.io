/* Tiket masuk: tiket terbang ke atas, lalu pindah ke halaman portofolio */
(() => {
    const enter = document.getElementById('enter');
    const ticket = document.getElementById('ticket');
    if (!enter || !ticket) return;

    enter.addEventListener('click', e => {
        // biarkan klik dengan Ctrl/Cmd/tengah membuka tab baru seperti biasa
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        const url = enter.href;
        ticket.classList.add('leave');
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(() => { location.href = url; }, reduce ? 0 : 520);
    });
})();

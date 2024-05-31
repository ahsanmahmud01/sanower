// scripts.js

document.querySelectorAll('.button').forEach(btn => {
    btn.onmousemove = function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--x', x + 'px');
        btn.style.setProperty('--y', y + 'px');
    };
});

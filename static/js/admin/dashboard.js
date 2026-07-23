document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    document.querySelectorAll('.sidebar a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace(/\/$/, ''))) {
            link.classList.add('active');
        }
    });

    console.log('Panel administrativo inicializado');
});

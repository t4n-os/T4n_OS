/* =========================
   GLOBAL ELEMENTS
========================= */
const html = document.documentElement;

const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar       = document.getElementById('sidebar');
const overlay       = document.getElementById('overlay');

const navToggles = document.querySelectorAll('.nav-toggle');
const navLinks   = document.querySelectorAll('.sidebar-nav a');


/* =========================
   THEME MANAGER
========================= */
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.apply();
        this.bind();
    }

    apply() {
        html.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);

        if (themeIcon) {
            themeIcon.className =
                this.theme === 'light'
                    ? 'fas fa-sun'
                    : 'fas fa-moon';
        }
    }

    toggle() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.apply();
    }

    bind() {
        if (!themeToggle) return;
        themeToggle.addEventListener('click', () => this.toggle());
    }
}


/* =========================
   SIDEBAR MANAGER
========================= */
class SidebarManager {
    constructor() {
        this.open = false;
        this.bind();
    }

    toggle() {
        this.open = !this.open;
        sidebar.classList.toggle('active', this.open);
        overlay.classList.toggle('active', this.open);

        if (window.innerWidth <= 1199) {
            document.body.style.overflow = this.open ? 'hidden' : '';
        }
    }

    close() {
        this.open = false;
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    bind() {
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggle());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.open) {
                this.close();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1199) {
                this.close();
            }
        });
    }
}


/* =========================
   NAVIGATION (MULTI-PAGE SAFE)
========================= */
class NavigationManager {
    constructor(sidebarManager) {
        this.sidebar = sidebarManager;
        this.bindToggles();
        this.markActiveLink();
    }

    /* Expand / collapse nested menu */
    bindToggles() {
        navToggles.forEach(toggle => {
            toggle.addEventListener('click', e => {
                // JANGAN ganggu <a>
                if (e.target.tagName === 'A') return;

                const parent = toggle.parentElement;
                const nested = parent.querySelector('.nested-nav');
                if (!nested) return;

                nested.classList.toggle('active');
            });
        });
    }

    /* Highlight active page */
    markActiveLink() {
        const currentPath = location.pathname.split('/').pop();

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const file = href.split('/').pop();
            if (file === currentPath) {
                link.classList.add('active');

                // buka parent menu
                let parent = link.closest('.nested-nav');
                while (parent) {
                    parent.classList.add('active');
                    parent = parent.parentElement.closest('.nested-nav');
                }
            }
        });
    }
}


/* =========================
   CODE COPY (OPTIONAL)
========================= */
class CodeCopyManager {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('pre code').forEach(code => {
            const pre = code.parentElement;
            if (pre.querySelector('.copy-button')) return;

            const btn = document.createElement('button');
            btn.className = 'copy-button';
            btn.innerHTML = '<i class="fas fa-copy"></i>';

            Object.assign(btn.style, {
                position: 'absolute',
                top: '10px',
                right: '10px',
                cursor: 'pointer',
                zIndex: 10
            });

            btn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 1500);
                } catch {
                    btn.innerHTML = '<i class="fas fa-times"></i>';
                }
            };

            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    }
}


/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const themeManager   = new ThemeManager();
    const sidebarManager = new SidebarManager();
    const navManager     = new NavigationManager(sidebarManager);
    const copyManager    = new CodeCopyManager();

    window.app = {
        themeManager,
        sidebarManager,
        navManager,
        copyManager
    };
});


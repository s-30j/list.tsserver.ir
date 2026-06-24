let data = [], cur = [], sort = { col: null, dir: 'asc' };

class Theme {
    constructor() {
        this.theme = localStorage.getItem('t') || 'dark';
        this.btn = document.getElementById('themeToggle');
        this.set(this.theme);
        this.btn.addEventListener('click', () => this.toggle());
    }
    set(t) {
        this.theme = t;
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('t', t);
        this.btn.querySelector('.icon').textContent = t === 'dark' ? '☀️' : '🌙';
        this.btn.setAttribute('aria-label', t === 'dark' ? 'تم روشن' : 'تم تاریک');
    }
    toggle() { this.set(this.theme === 'dark' ? 'light' : 'dark'); }
}

class Server {
    constructor() {
        this.body = document.getElementById('serversBody');
        this.sel = document.getElementById('searchInput');
        this.sbtn = document.getElementById('searchButton');
        this.load = document.getElementById('loading');
        this.empty = document.getElementById('empty');
        this.skel = document.getElementById('skel');
        this._ready = this.init();
    }
    async init() {
        this.events();
        await this.fetch();
        setInterval(() => this.fetch(), 300000);
    }
    ready() { return this._ready; }

    events() {
        const d = U.debounce(v => this.go(v), 260);
        this.sel.addEventListener('input', e => d(e.target.value));
        this.sbtn.addEventListener('click', () => this.go(this.sel.value));
        this.sel.addEventListener('keypress', e => { if (e.key === 'Enter') this.go(this.sel.value); });
        document.querySelectorAll('.sort').forEach(th => {
            th.addEventListener('click', () => this.sort(th.dataset.sort));
        });
    }

    go(q) {
        const s = q.toLowerCase();
        cur = data.filter(v =>
            v.name.toLowerCase().includes(s) ||
            v.ip.toLowerCase().includes(s) ||
            v.description.toLowerCase().includes(s)
        );
        this.render();
        this.stats();
    }

    sort(col) {
        const th = document.querySelector(`[data-sort="${col}"]`);
        document.querySelectorAll('.sort').forEach(h => { if (h !== th) { h.classList.remove('asc', 'desc'); } });
        const dir = sort.col === col && sort.dir === 'asc' ? 'desc' : 'asc';
        sort = { col, dir };
        th.classList.remove('asc', 'desc');
        th.classList.add(dir);
        cur.sort((a, b) => {
            let va = a[col], vb = b[col];
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });
        this.render();
    }

    async fetch() {
        this.showLoad();
        try {
            const r = await fetch('servers.json');
            if (!r.ok) throw Error();
            data = await r.json();
            cur = [...data];
            this.render();
            this.stats();
        } catch (e) { this.empty.style.display = 'block'; }
        finally { this.hideLoad(); }
    }

    render() {
        if (!cur.length) { this.empty.style.display = 'block'; this.body.innerHTML = ''; return; }
        this.empty.style.display = 'none';
        this.body.innerHTML = '';
        cur.forEach((s, i) => {
            const tr = document.createElement('tr');
            tr.style.opacity = '0';
            tr.style.transform = 'translateY(10px)';
            const st = s.status === 'online' ? 's-online' : s.status === 'offline' ? 's-offline' : '';
            const lb = s.status === 'online' ? 'آنلاین' : s.status === 'offline' ? 'آفلاین' : 'نامشخص';
            const ip = this.esc(s.ip);
            tr.innerHTML =
                `<td><div class="sv-name">${this.esc(s.name)}</div><small class="sv-desc">${this.esc(s.description)}</small></td>` +
                `<td class="ip-cell"><div class="ip-box"><span class="ip-txt">${ip}</span><button class="cpy" data-ip="${ip}" aria-label="کپی">📋</button></div></td>` +
                `<td><span class="ucnt">${s.maxUsers}</span></td>` +
                `<td><span class="sbadge ${st}">${lb}</span></td>` +
                `<td><a href="ts3server://${ip}" class="cn"${s.status !== 'online' ? ' disabled' : ''}><span>اتصال</span></a></td>`;
            this.body.appendChild(tr);
            setTimeout(() => {
                tr.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            }, 30 + i * 30);
        });
    }

    showLoad() {
        this.skel.classList.add('on');
        this.load.style.display = 'block';
        this.empty.style.display = 'none';
        this.body.style.display = 'none';
    }
    hideLoad() {
        this.skel.classList.remove('on');
        this.load.style.display = 'none';
        this.body.style.display = '';
    }

    stats() {
        this.anim('totalServers', data.length);
        this.anim('onlineServers', data.filter(s => s.status === 'online').length);
    }

    anim(id, target) {
        const el = document.getElementById(id);
        const start = parseInt(el.textContent) || 0;
        const dur = 900;
        const t0 = performance.now();
        const tick = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(start + (target - start) * e).toLocaleString('fa-IR');
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
}

class U {
    static debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

    static copy(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        return new Promise((res, rej) => { document.execCommand('copy') ? res() : rej(); ta.remove(); });
    }
}

class Acc {
    constructor() {
        document.addEventListener('keydown', e => {
            const row = e.target.closest('tr');
            if (!row) return;
            const t = e.key === 'ArrowDown' ? row.nextElementSibling : e.key === 'ArrowUp' ? row.previousElementSibling : null;
            if (t) { e.preventDefault(); t.focus(); }
        });
    }
}

class SEO {
    init() {
        if (!data.length) return;
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "بهترین سرورهای تیم اسپیک ایران",
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": data.length,
                "itemListElement": data.map((s, i) => ({
                    "@type": "ListItem", "position": i + 1,
                    "item": { "@type": "SoftwareApplication", "name": s.name, "description": s.description }
                }))
            }
        });
        document.head.appendChild(el);
    }
}

class FAQ {
    constructor() {
        document.querySelectorAll('.faq-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                const open = item.classList.contains('open');
                document.querySelectorAll('.faq-item.open').forEach(el => {
                    el.classList.remove('open');
                    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
                });
                if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
            });
        });
    }
}

class Reveal {
    constructor() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            return;
        }
        const o = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); } });
        }, { threshold: 0.04, rootMargin: '0px 0px -20px 0px' });
        document.querySelectorAll('.reveal').forEach(el => o.observe(el));
    }
}

class App {
    constructor() {
        new Theme();
        this.srv = new Server();
        new Acc();
        this.seo = new SEO();
        new FAQ();
        new Reveal();
        this.copy();
    }

    copy() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.cpy');
            if (!btn) return;
            U.copy(btn.dataset.ip).then(() => {
                btn.textContent = '✓';
                btn.classList.add('done');
                this.toast('کپی شد ✓');
                setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('done'); }, 1600);
            }).catch(() => this.toast('خطا'));
        });
        this.srv.ready().then(() => this.seo.init());
    }

    toast(msg) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = msg;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2600);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });

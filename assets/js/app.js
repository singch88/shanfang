/* ============ 山房 · 开门见山 · 路由 + 滚动叙事 ============ */
/* 零依赖：file:// 双击可开；粒子/视差/计数均为原生实现 */

(function () {
  'use strict';

  var app = document.getElementById('app');
  var POSTS = [];
  var postsReady = false;

  /* 加载文章：先尝试拉 data/posts.json（Decap CMS 写入），失败用 window.POSTS 兜底 */
  function loadPosts(cb) {
    if (postsReady) { cb(); return; }
    fetch('data/posts.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (Array.isArray(d) && d.length) { POSTS = d; }
        else { POSTS = window.POSTS || []; }
        postsReady = true;
        cb();
      })
      .catch(function () {
        POSTS = window.POSTS || [];
        postsReady = true;
        cb();
      });
  }

  /* ================= 汉堡菜单 ================= */

  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }

  burger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });

  /* ================= 四季按钮 ================= */

  function initBloom() {
    var btn = document.getElementById('bloom');
    if (!btn) return;

    function apply(i, silent) {
      var c = SEASONS[i];
      document.documentElement.style.setProperty('--accent', c.v);
      document.documentElement.style.setProperty('--accent-bright', c.bright);
      document.documentElement.setAttribute('data-snow', c.snow);
      btn.setAttribute('data-si', String(i));
      seasonIdx = i;
      if (canvas) buildParticles();
      try { localStorage.setItem('garden-season', String(i)); } catch (e) {}
      if (!silent) {
        toast.textContent = c.name + ' · ' + c.en;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toast.classList.remove('show'); }, 1500);
      }
    }

    var idx = 0;
    try {
      var s = parseInt(localStorage.getItem('garden-season'), 10);
      if (!isNaN(s) && s >= 0 && s < SEASONS.length) idx = s;
    } catch (e) {}
    apply(idx, true);

    btn.addEventListener('click', function () {
      idx = (idx + 1) % SEASONS.length;
      apply(idx);
      var r = document.createElement('span');
      r.className = 'bloom-ripple';
      btn.appendChild(r);
      setTimeout(function () { r.remove(); }, 750);
    });
  }

  /* ================= 页面 ================= */

  var BSPACE = 'https://space.bilibili.com/3707020756650095';

  var VIDEOS = [
    { title: '旅居 Room Tour', tag: '高光 · 爆款', desc: '转折之作。旅居赛道的第一支出圈视频，也是赛道选择的答案。', pf: 'B 站', url: BSPACE },
    { title: '独居男生系列', tag: '2024.10 — 2025', desc: '从深圳拍到云南，一年。不温不火，但一直在拍。', pf: 'B 站', url: BSPACE },
    { title: '生活混剪', tag: '手感最熟', desc: '碎片混剪。想往电影感走，还在找形状。', pf: 'B 站', url: BSPACE }
  ];

  /* 四季轮：冬（雪/银白）→ 春（芽/绿）→ 夏（萤/黄）→ 秋（叶/橙）→ 回冬 */
  /* 黑底配色：黑白灰基调，v = 主色（按钮/高亮），bright = 强版（菜单 hover） */
  var SEASONS = [
    { name: '冬', en: 'WINTER', v: '#d8d8d8', bright: '#f5f5f5', snow: 'winter' },
    { name: '春', en: 'SPRING', v: '#9cb069', bright: '#b8d18a', snow: 'spring' },
    { name: '夏', en: 'SUMMER', v: '#d8c66a', bright: '#f0d980', snow: 'summer' },
    { name: '秋', en: 'AUTUMN', v: '#c96f3b', bright: '#d9925e', snow: 'autumn' }
  ];

  /* 门：两张纯白门扇 + 中间一条渐变缝（颜色随四季主题色切换） */

  function homePage() {
    return '' +
      '<canvas id="dust"></canvas>' +
      '<div class="book">' +
        '<div class="book-sticky">' +
          '<div class="cover" id="cover">' +
            '<div class="shutter s-l"></div>' +
            '<div class="shutter s-r"></div>' +
            '<div class="seam"></div>' +
            '<div class="cover-inner">' +
              '<p class="cover-kicker">S I N G C H</p>' +
              '<h1 class="cover-title">山\u3000房</h1>' +
            '</div>' +
          '</div>' +
          '<section class="scene" id="scene-hero">' +
            '<div class="hero-core" id="hero-core">' +
              '<p class="hero-kicker">卷\u3000首</p>' +
              '<h1 class="hero-line">开<span class="accent">门</span>见山</h1>' +
              '<svg class="mtn" viewBox="0 0 260 100" aria-hidden="true">' +
                '<path d="M18 88 L86 34 L112 58 L142 20 L204 88"/>' +
                '<path d="M138 88 L188 44 L214 66 L248 88" opacity="0.45"/>' +
                /* 雪线：不规则曲线（尖角 + 弧形混杂，每条都不一样），随季节换高度
                   冬 41（最低，两峰都有雪） / 春 35 / 秋 30（高于春，只在峰高的中峰上） */
                '<g class="snowgrp" fill="#d8d8d8" stroke="none">' +
                  '<g class="snow-w">' +
                    '<path d="M86 34 L77.2 41 L79 44 L82 39 Q86 44 90 40 L93.6 41 Z"/>' +
                    '<path d="M142 20 L125.4 41 L129 44 L133 39 Q138 44 142 40 L147 44 L151 39 Q156 42 161.2 41 Z"/>' +
                  '</g>' +
                  '<g class="snow-s">' +
                    '<path d="M142 20 L130.2 35 L134 38 L138 33 Q142 37 146 34 L150 37 Q153 35 155.7 35 Z"/>' +
                  '</g>' +
                  '<g class="snow-a">' +
                    '<path d="M142 20 L134.1 30 L137 32 L140 28 Q143 31 147 29 L151.1 30 Z"/>' +
                  '</g>' +
                '</g>' +
              '</svg>' +
              '<p class="hero-en">THE MOUNTAIN IS ALWAYS THERE</p>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>' +
      '<section class="scene scene-left">' +
        '<div class="stat rise"><span class="num" data-count="11">0</span><em>年的记录</em></div>' +
        '<div class="stat rise"><span class="num" data-count="3116">0</span><em>条笔记</em></div>' +
        '<div class="stat rise"><span class="num" data-count="1606632">0</span><em>字</em></div>' +
        '<p class="scene-note rise">相当于十六本书。<br>现在，它们有了安放的地方。</p>' +
      '</section>' +
      '<section class="scene">' +
        '<h2 class="creed rise">你好，<br>欢迎来到我的<span class="hl">山房</span>。</h2>' +
        '<p class="scene-note rise">这里收着我的十一年——三千条笔记、一些照片、一些影像。<br>我正把它们一件一件搬进来，你随便逛。</p>' +
      '</section>' +
      '<section class="scene scene-compact">' +
        '<p class="scene-note rise" style="margin-top:0;margin-bottom:30px;">进 去 逛 逛</p>' +
        '<div class="enter rise">' +
          '<a href="#/posts"><span class="zh">文<small>NOTES</small></span></a>' +
          '<a href="#/videos"><span class="zh">影<small>FILMS</small></span></a>' +
          '<a href="#/gallery"><span class="zh">画<small>PHOTOS</small></span></a>' +
        '</div>' +
      '</section>' +
      '<section class="scene scene-end">' +
        '<p class="end-note">© 2026 SINGCH<br>本站由 AI 辅助搭建 · 内容均为本人</p>' +
      '</section>';
  }

  function postsPage() {
    var rows = POSTS.map(function (p) {
      return '<a class="row" href="#/post/' + p.id + '">' +
        '<div class="meta">' + p.date + ' · ' + p.tags.join(' / ') + '</div>' +
        '<h3>' + p.title + '</h3>' +
        '<p>' + p.excerpt + '</p></a>';
    }).join('');
    return '<main class="page">' +
      '<h2 class="page-title">文</h2>' +
      '<p class="page-sub">NOTES · 只挑选，不发布</p>' +
      (rows || '<p style="color:var(--dim)">第一株植物正在移植中。</p>') +
      '</main>';
  }

  function postPage(id) {
    var p = null;
    for (var i = 0; i < POSTS.length; i++) { if (POSTS[i].id === id) { p = POSTS[i]; break; } }
    if (!p) {
      return '<main class="page"><a class="back" href="#/posts">← 返回文字</a><p style="color:var(--dim)">这篇文章不存在。</p></main>';
    }
    document.title = p.title + ' · 山房';
    return '<main class="page">' +
      '<a class="back" href="#/posts">← 返回文字</a>' +
      '<header class="article-head">' +
        '<div class="meta">' + p.date + '</div>' +
        '<h1>' + p.title + '</h1>' +
        '<div class="tags">' + p.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
        '<hr>' +
      '</header>' +
      '<article class="article">' + p.html +
        '<div class="src-note">素材出处：' + p.sources + '<br>本文由 AI 辅助整理成文，观点与人生均为 singch 本人。</div>' +
      '</article>' +
      '<footer class="footer">© 2026 SINGCH · 山房</footer>' +
      '</main>';
  }

  function videosPage() {
    var cards = VIDEOS.map(function (v) {
      return '<a class="v-card-p" href="' + v.url + '" target="_blank" rel="noopener">' +
        '<div class="v-poster"><span class="pf">' + v.pf + '</span><div class="play">▶</div></div>' +
        '<div class="v-info-p"><div class="meta">' + v.tag + '</div><h3>' + v.title + '</h3><p>' + v.desc + '</p></div>' +
        '</a>';
    }).join('');
    return '<main class="page">' +
      '<h2 class="page-title">影</h2>' +
      '<p class="page-sub">FILMS · 点开去 B 站看</p>' +
      '<div class="v-grid">' + cards + '</div>' +
      '<p class="ph-note">封面是占位图——B 站自动抓的竖屏封面不好看，这站自己配封面（3:4 竖版），想配哪张配哪张，不受平台限制。</p>' +
      '<a class="v-space-link" href="' + BSPACE + '" target="_blank" rel="noopener">在 B 站看全部 →</a>' +
      '</main>';
  }

  function galleryPage() {
    var frames = '';
    for (var i = 0; i < 8; i++) { frames += '<div class="ph-frame">待接入</div>'; }
    return '<main class="page">' +
      '<h2 class="page-title">画</h2>' +
      '<p class="page-sub">PHOTOS · 不是摄影师，只是看得见</p>' +
      '<div class="gallery-grid">' + frames + '</div>' +
      '<p class="ph-note">待接入：手机摄影。照片放进 site/assets/img/ 后替换占位即可。</p>' +
      '</main>';
  }

  function aboutPage() {
    return '<main class="page">' +
      '<h2 class="page-title">我</h2>' +
      '<p class="page-sub">ABOUT</p>' +
      '<section class="about-block">' +
        '<p class="big">在深圳做了十三年品牌，<br>现在在云南，把生活剪成片子。</p>' +
      '</section>' +
      '<section class="about-block">' +
        '<h2>这里是什么</h2>' +
        '<p>一间数字山房。介于博客与笔记库之间：不断生长，不求完成，随时可看。</p>' +
        '<p>它只进不出——flomo 里的三千条笔记流进来，视频聚合进来，旧文字收进来。我不在上面"发布"任何东西，只做一件事：挑选。</p>' +
        '<p>挑选比创作轻一万倍。没有发表压力，没有标题焦虑，因为这里不是发布，是陈列。</p>' +
      '</section>' +
      '<section class="about-block">' +
        '<h2>两条线</h2>' +
        '<p>十三年品牌操盘手：To B 外贸 → 跨境电商 → 独立站 → 品牌官网 → 品牌总监。审美、叙事、转化路径是吃饭的本事。</p>' +
        '<p>云南旅居创作者：2024 年 10 月开拍独居视频，2025 年转战旅居赛道。混剪最熟，电影感在找。</p>' +
        '<p>两条线互为证据。</p>' +
      '</section>' +
      '<section class="about-block">' +
        '<h2>联系</h2>' +
        '<p style="color:var(--dim)">待接入：微信 / 视频号二维码。</p>' +
      '</section>' +
      '<footer class="footer">© 2026 SINGCH · 本站由 AI 辅助搭建，内容均为本人</footer>' +
      '</main>';
  }

  /* ================= 首页动效 ================= */

  var raf = null;
  var canvas = null;
  var ctx = null;
  var coverEl = null;
  var seasonIdx = 0;
  var particles = [];
  var scenes = [];
  var W = 0;
  var H = 0;
  var mouse = { x: -9999, y: -9999 };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* 四季粒子 */
  var SEASON_FX = {
    0: { shape: 'snow',     colors: ['#a9b7c4', '#c3ccd4'], n: 60, a: 0.55 },
    1: { shape: 'dandelion',colors: ['#b5c690', '#a8c082'], n: 42, a: 0.7  },
    2: { shape: 'glow',     colors: ['#f0d980', '#d8c66a'], n: 50, a: 0.85 },
    3: { shape: 'leaf',     colors: ['#c96f3b', '#c9a86a', '#b0413e'], n: 28, a: 0.75 }
  };

  function buildParticles() {
    particles = [];
    var fx = SEASON_FX[seasonIdx] || SEASON_FX[0];
    var n = Math.round(fx.n * (window.innerWidth < 768 ? 0.65 : 1));
    for (var i = 0; i < n; i++) {
      var r, vy;
      if (fx.shape === 'snow') { r = 1.1 + Math.random() * 1.6; vy = 0.16 + Math.random() * 0.26; }
      else if (fx.shape === 'dandelion') { r = 1.6 + Math.random() * 1.4; vy = -0.04 - Math.random() * 0.12; }
      else if (fx.shape === 'glow') { r = 0.9 + Math.random() * 1.3; vy = (Math.random() - 0.5) * 0.1; }
      else { r = 2.4 + Math.random() * 2.2; vy = 0.3 + Math.random() * 0.3; }
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: r,
        vy: vy,
        vx: (Math.random() - 0.5) * 0.08,
        sw: Math.random() * Math.PI * 2,
        sp: 0.008 + Math.random() * 0.012,
        sa: (fx.shape === 'leaf' ? 10 : 5) + Math.random() * 6,
        tw: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.03,
        c: fx.colors[i % fx.colors.length]
      });
    }
  }

  function onResize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildParticles();
  }

  function onMove(x, y) { mouse.x = x; mouse.y = y; }
  function onLeave() { mouse.x = -9999; mouse.y = -9999; }

  function updateScenes() {
    var vh = window.innerHeight;
    for (var s = 0; s < scenes.length; s++) {
      var sc = scenes[s];
      var r = sc.el.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh + r.height), 0, 1);

      for (var i = 0; i < sc.rises.length; i++) {
        var t = clamp((p - 0.16 - i * 0.05) / 0.22, 0, 1);
        var e = 1 - Math.pow(1 - t, 3);
        sc.rises[i].style.opacity = e;
        sc.rises[i].style.transform = 'translateX(' + (36 * (1 - e)) + 'px)';
      }

      if (sc.core) {
        var sy2 = window.scrollY || window.pageYOffset || 0;
        var cp = clamp(sy2 / H, 0, 1);
        var reveal = clamp((cp - 0.45) / 0.35, 0, 1);
        sc.core.style.opacity = reveal;
        sc.core.style.transform = 'scale(' + (1 + (1 - reveal) * 0.04) + ')';
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var sy = window.scrollY || window.pageYOffset;

    if (coverEl) {
      var cp = clamp(sy / H, 0, 1);
      var ce = cp * cp * (3 - 2 * cp);
      coverEl.style.setProperty('--w', ce.toFixed(4));
    }

    var fx = SEASON_FX[seasonIdx] || SEASON_FX[0];

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.sw += p.sp;
      p.tw += 0.02;
      p.rot += p.rv;
      p.x += p.vx;
      p.y += p.vy;

      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 12100 && d2 > 0.01) {
        var d = Math.sqrt(d2);
        var f = (1 - d / 110) * 1.2;
        p.x += (dx / d) * f;
        p.y += (dy / d) * f;
      }

      if (p.x < -14) p.x = W + 14; else if (p.x > W + 14) p.x = -14;
      if (p.y < -14) p.y = H + 14; else if (p.y > H + 14) p.y = -14;

      var px = p.x + Math.sin(p.sw) * p.sa;
      var py = p.y - sy * 0.1;
      py = ((py % H) + H) % H;
      var al = fx.a * (0.6 + 0.4 * Math.sin(p.tw));

      if (fx.shape === 'leaf') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot + Math.sin(p.sw) * 0.4);
        ctx.globalAlpha = al;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(0, -p.r * 1.4);
        ctx.quadraticCurveTo(p.r * 0.7, -p.r * 0.3, p.r * 0.55, p.r * 0.4);
        ctx.quadraticCurveTo(p.r * 0.35, p.r * 1.1, 0, p.r * 1.4);
        ctx.quadraticCurveTo(-p.r * 0.35, p.r * 1.1, -p.r * 0.55, p.r * 0.4);
        ctx.quadraticCurveTo(-p.r * 0.7, -p.r * 0.3, 0, -p.r * 1.4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.r * 1.15);
        ctx.lineTo(0, p.r * 1.15);
        ctx.stroke();
        ctx.restore();
      } else if (fx.shape === 'dandelion') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot);
        ctx.globalAlpha = al;
        ctx.strokeStyle = p.c;
        ctx.fillStyle = p.c;
        ctx.lineWidth = 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (var a = 0; a < 6; a++) {
          var ang = a * Math.PI / 3;
          var cx = Math.cos(ang), sy = Math.sin(ang);
          ctx.moveTo(cx * p.r * 0.4, sy * p.r * 0.4);
          ctx.lineTo(cx * p.r * 1.6, sy * p.r * 1.6);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.45, 0, 6.2832);
        ctx.fill();
        ctx.restore();
      } else {
        if (fx.shape === 'glow') {
          ctx.globalAlpha = al * 0.18;
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(px, py, p.r * 3.2, 0, 6.2832);
          ctx.fill();
        }
        ctx.globalAlpha = al;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    updateScenes();
    raf = requestAnimationFrame(frame);
  }

  /* 数字滚动 */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1800;
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1);
      k = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * k).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initHome() {
    canvas = document.getElementById('dust');
    if (!canvas) return;
    coverEl = document.getElementById('cover');
    ctx = canvas.getContext('2d');
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildParticles();

    scenes = [];
    var els = document.querySelectorAll('.scene');
    for (var i = 0; i < els.length; i++) {
      scenes.push({
        el: els[i],
        rises: els[i].querySelectorAll('.rise'),
        core: els[i].querySelector('.hero-core')
      });
    }

    var nums = document.querySelectorAll('.num');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { io.unobserve(e.target); countUp(e.target); }
        });
      }, { threshold: 0.5 });
      for (var j = 0; j < nums.length; j++) io.observe(nums[j]);
    } else {
      for (var k = 0; k < nums.length; k++) countUp(nums[k]);
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
    window.addEventListener('touchend', onLeave);
    document.addEventListener('mouseleave', onLeave);

    updateScenes();
    raf = requestAnimationFrame(frame);
  }

  function destroyHome() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    window.removeEventListener('resize', onResize);
    canvas = null; ctx = null; coverEl = null; particles = []; scenes = [];
  }

  /* ================= 路由 ================= */

  function router() {
    var h = location.hash || '#/';
    var html, tab = 'home';

    if (h.indexOf('#/post/') === 0) { html = postPage(h.slice(7)); tab = 'posts'; }
    else if (h.indexOf('#/posts') === 0) { html = postsPage(); tab = 'posts'; }
    else if (h.indexOf('#/videos') === 0) { html = videosPage(); tab = 'videos'; }
    else if (h.indexOf('#/gallery') === 0) { html = galleryPage(); tab = 'gallery'; }
    else if (h.indexOf('#/about') === 0) { html = aboutPage(); tab = 'about'; }
    else { html = homePage(); tab = 'home'; }

    if (tab !== 'posts' || h.indexOf('#/posts') === 0) { document.title = '山房'; }

    if (tab !== 'home') html = '<a class="back-garden" href="#/">← 山房</a>' + html;

    destroyHome();
    app.innerHTML = html;
    window.scrollTo(0, 0);
    setMenu(false);

    var links = menu.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('active', links[i].getAttribute('data-tab') === tab);
    }

    if (tab === 'home') initHome();
  }

  var toast = document.getElementById('bloomToast');
  initBloom();
  window.addEventListener('hashchange', function () {
    if (postsReady) router();
    else loadPosts(router);
  });
  loadPosts(router);
})();

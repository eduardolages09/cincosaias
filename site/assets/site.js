/* Cinco Saias · comportamento do site (ronda 3). Sem dependências; funciona em file://. */
(function () {
  var doc = document, $ = function (s, r) { return (r || doc).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var largo = function () { return window.innerWidth > 860; };
  var limita = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* Topo: transparente sobre o hero (landing e Premium), cheio depois */
  var topo = $('.topo'), preso = $('.hero-preso'), heroNome = $('.hero__nome'), heroVideo = $('.hero__video');
  var heroCasa = $('.hp');
  function progressoHero() { var t = preso.offsetHeight - window.innerHeight; return t > 0 ? limita(window.scrollY / t, 0, 1) : 0; }
  function estadoTopo() {
    if (!topo) return;
    var fora = preso && !calmo ? progressoHero() > .5 : window.scrollY > window.innerHeight * .8;
    topo.classList.toggle('cheio', !topo.classList.contains('topo--sobre') || fora);
  }

  /* Vídeo do hero: versão leve no telemóvel; só a imagem com movimento reduzido ou poupança de dados */
  if (heroVideo && !calmo && !(navigator.connection && navigator.connection.saveData)) {
    heroVideo.src = window.innerWidth <= 860 ? heroVideo.dataset.pequeno : heroVideo.dataset.grande;
    var tenta = heroVideo.play(); if (tenta && tenta.catch) tenta.catch(function () { });
  }
  /* Saída do hero: a página sobe por cima dele; o nome sobe um pouco; o vídeo pára quando já ficou tapado */
  function passoHero() {
    if (!preso || calmo) return;
    var p = progressoHero();
    if (heroNome) heroNome.style.transform = 'translate3d(0,' + (-p * 110).toFixed(1) + 'px,0)';
    if (heroVideo && heroVideo.src) { if (p >= 1 && !heroVideo.paused) heroVideo.pause(); else if (p < 1 && heroVideo.paused) { var t = heroVideo.play(); if (t && t.catch) t.catch(function () { }); } }
  }

  /* Nome do hero letra a letra */
  $$('[data-letras]').forEach(function (h) {
    var t = h.textContent; h.setAttribute('aria-label', t); h.textContent = '';
    var i = 0;
    t.split(' ').forEach(function (pal, n) {
      var w = doc.createElement('span'); w.className = 'pal'; w.setAttribute('aria-hidden', 'true');
      pal.split('').forEach(function (ch) { var s = doc.createElement('span'); s.className = 'l'; s.style.setProperty('--i', i++); s.textContent = ch; w.appendChild(s); });
      if (n) h.appendChild(doc.createTextNode(' ')); h.appendChild(w); i++;
    });
  });
  requestAnimationFrame(function () { setTimeout(function () { $$('.hp,.hd').forEach(function (h) { h.classList.add('entrou'); }); }, 60); });

  /* Entradas: medidas no scroll (um elemento todo recortado nunca dispara o IntersectionObserver) */
  $$('.just').forEach(function (j) { $$('button', j).forEach(function (b, n) { b.style.setProperty('--n', n); }); });
  var porVer = $$('.rev,.abre');
  if (calmo) { porVer.forEach(function (el) { el.classList.add('vista'); }); porVer = []; }
  function passoEntradas() {
    if (!porVer.length) return;
    var h = window.innerHeight * .9;
    porVer = porVer.filter(function (el) { if (el.getBoundingClientRect().top < h) { el.classList.add('vista'); return false; } return true; });
  }

  /* Landing: os painéis das casas; o de baixo recua quando o seguinte sobe; as fotos pequenas sobem ao chegar */
  var saias = $$('.saia');
  function passoSaias() {
    if (!saias.length || !largo() || calmo) return;
    var h = window.innerHeight;
    saias.forEach(function (s, i) {
      var seg = saias[i + 1], d = s.firstElementChild;
      if (seg) d.style.setProperty('--r', limita(1 - seg.getBoundingClientRect().top / h, 0, 1).toFixed(3));
      var t = s.getBoundingClientRect().top; d.style.setProperty('--e', limita(1 - t / h, 0, 1).toFixed(3));
    });
  }

  /* Destaque: as molduras andam a velocidades diferentes; o pesponto corre como uma costura */
  var molduras = $$('.moldura'), pesp = $('.pesponto path');
  function passoMolduras() {
    if (calmo) return;
    if (molduras.length && window.scrollY < window.innerHeight * 1.2) molduras.forEach(function (m, n) { m.style.setProperty('--py', (-window.scrollY * [0.06, 0.16, 0.24][n]).toFixed(1) + 'px'); });
    if (pesp) pesp.style.strokeDashoffset = (-window.scrollY * .12).toFixed(1);
  }

  /* Premium: a casa numa só moldura presa. O scroll troca as fotos (a seguinte esvai-se por cima da anterior e assenta);
     cada foto fica parada e inteira entre trocas; o fundo, o nome da divisão e a fita de cima seguem a foto que está à vista */
  var cp = $('.cp'), cpF = $$('.cp__f'), cpN = $$('.cp__nome'), cpCont = $('.cp__cont b'), cpBar = $('.cp__barra'), fitaD = $$('.fitad a'), prog = $('.fitad__prog'), cpAt = -1, cpO = [];
  function medeCp() {
    if (!cp) return;
    var f = $('.fitad'), t = (topo ? topo.offsetHeight : 60) + (f ? f.offsetHeight : 0);
    cp.style.setProperty('--cp-top', Math.round(t + (window.innerHeight < 521 ? 8 : 22)) + 'px');
  }
  /* s vai de -.35 a n-1+.35: cada foto (também a primeira e a última) fica parada .7 de passo; a troca leva .3.
     O fundo e a cor do texto passam de um tom ao outro com a própria troca, no mesmo frame (nada fica atrás do scroll). */
  var cpPreso = cp && $('.cp__preso', cp), cpTom = cpF.map(function (f) { var h = f.dataset.tom.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }), cpBg = '';
  function passoCp() {
    if (!cp) return;
    var n = cpF.length, tot = cp.offsetHeight - window.innerHeight, r = cp.getBoundingClientRect();
    var p = tot > 0 ? limita(-r.top / tot, 0, 1) : 0, s = p * (n - 1 + .7) - .35, topo = 0, oTopo = 1;
    if (cpBar) cpBar.style.setProperty('--p', p.toFixed(4));
    if (prog) prog.style.setProperty('--p', p.toFixed(4));
    for (var i = 1; i < n; i++) {
      var o = calmo ? (s >= i - .5 ? 1 : 0) : limita((s - i + .65) / .3, 0, 1);
      o = Math.round(o * 1000) / 1000;
      if (o > 0) { topo = i; oTopo = o; }
      if (o === cpO[i]) continue; cpO[i] = o;
      var st = cpF[i].style; st.opacity = o; st.visibility = o > 0 ? 'visible' : 'hidden';
      st.transform = o > 0 && o < 1 ? 'translate3d(0,' + ((1 - o) * 26).toFixed(1) + 'px,0)' : '';
    }
    var a0 = cpTom[topo > 0 ? topo - 1 : 0], a1 = cpTom[topo], rgb = a0.map(function (v, k) { return Math.round(v + (a1[k] - v) * oTopo); });
    var bg = 'rgb(' + rgb.join(',') + ')';
    if (bg !== cpBg) { cpBg = bg; cpPreso.style.setProperty('--tom', bg); cp.classList.toggle('claro', (.2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]) / 255 < .5); }
    /* o nome da divisão troca com a própria foto: o antigo sai na primeira metade da troca, o novo entra na segunda */
    var dN = cpF[topo].dataset.d, dA = topo > 0 ? cpF[topo - 1].dataset.d : dN;
    cpN.forEach(function (x) {
      var op = x.dataset.d === dN ? (dA === dN ? 1 : limita(oTopo * 2 - 1, 0, 1)) : (x.dataset.d === dA ? limita(1 - oTopo * 2, 0, 1) : 0);
      op = Math.round(op * 100) / 100; if (x._op === op) return; x._op = op;
      x.style.opacity = op; x.style.visibility = op > 0 ? 'visible' : 'hidden';
      x.style.transform = op < 1 && op > 0 ? 'translate3d(0,' + ((1 - op) * (x.dataset.d === dN ? 10 : -10)).toFixed(1) + 'px,0)' : '';
    });
    var at = limita(Math.round(s), 0, n - 1);
    if (at === cpAt) return; cpAt = at;
    var fig = cpF[at], d = fig.dataset.d;
    cpF.forEach(function (f, i) { f.setAttribute('aria-hidden', i === at ? 'false' : 'true'); $$('button', f).forEach(function (b) { b.tabIndex = i === at ? 0 : -1; }); });
    if (cpCont) cpCont.textContent = (at + 1 < 10 ? '0' : '') + (at + 1);
    fitaD.forEach(function (a) {
      var on = a.dataset.d === d; a.classList.toggle('ativa', on);
      if (on && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollTo({ left: a.offsetLeft - 40, behavior: 'smooth' });
    });
  }
  medeCp();

  /* Destaque: o índice preso acende a divisão que está a meio do ecrã */
  var dvs = $$('.dv'), indA = $$('.ind a'), dvAtual = null;
  function passoInd() {
    if (!dvs.length) return;
    var meio = window.innerHeight * .45, k = '';
    dvs.forEach(function (d) { if (d.getBoundingClientRect().top <= meio) k = d.dataset.d; });
    if (k === dvAtual) return; dvAtual = k;
    indA.forEach(function (a) { a.classList.toggle('ativa', a.dataset.d === k); });
  }

  var pedido = false;
  function aoScroll() {
    if (pedido) return; pedido = true;
    requestAnimationFrame(function () { pedido = false; estadoTopo(); passoHero(); passoEntradas(); passoSaias(); passoMolduras(); passoCp(); passoInd(); });
  }
  window.addEventListener('scroll', aoScroll, { passive: true });
  window.addEventListener('resize', function () { medeCp(); cpAt = -1; aoScroll(); });
  aoScroll();

  /* Mapa: lista e pinos acendem-se juntos */
  $$('[data-casa]').forEach(function (el) {
    var k = el.dataset.casa, par = $$('[data-casa="' + k + '"]');
    ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { par.forEach(function (p) { p.classList.add('ativo'); }); }); });
    ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { par.forEach(function (p) { p.classList.remove('ativo'); }); }); });
  });

  /* Base: a fita de fotos arrasta-se com o rato (arrastar não abre o visor) e anda com a roda na vertical */
  $$('.fita').forEach(function (f) {
    var x0 = 0, s0 = 0, baixo = false, mexeu = false;
    f.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; baixo = true; mexeu = false; x0 = e.clientX; s0 = f.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!baixo) return; var d = e.clientX - x0; if (Math.abs(d) > 5) { mexeu = true; f.classList.add('agarra'); } f.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { if (!baixo) return; baixo = false; f.classList.remove('agarra'); });
    f.addEventListener('click', function (e) { if (mexeu) { e.stopPropagation(); e.preventDefault(); mexeu = false; } }, true);
    f.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var fim = f.scrollLeft + f.clientWidth >= f.scrollWidth - 2, ini = f.scrollLeft <= 0;
      if ((e.deltaY > 0 && !fim) || (e.deltaY < 0 && !ini)) { e.preventDefault(); f.scrollLeft += e.deltaY; }
    }, { passive: false });
  });

  /* Destaque: a fita da casa (setas, separadores, contador, arrastar com o rato ou o dedo, teclado).
     A foto ativa encosta à grelha; carregar numa das outras trá-la para a frente; carregar na ativa abre o visor. */
  $$('.vc').forEach(function (v) {
    var fitaV = $('.vc__fita', v), pista = $('.vc__pista', v), sl = $$('.vc__sl', v), tabs = $$('.vc__div button', v);
    var cont = $('.vc__cont span', v), leg = $('.vc__legenda b', v), setas = $$('.vc__seta', v), grelha = $('.vc__topo', v), at = 0, x = 0;
    function alvo(n) {
      var esq = grelha.getBoundingClientRect().left + parseFloat(getComputedStyle(grelha).paddingLeft) - fitaV.getBoundingClientRect().left;
      var min = Math.min(0, fitaV.clientWidth - pista.scrollWidth - esq);
      return Math.max(min, esq - sl[n].offsetLeft);
    }
    function vai(n) {
      at = limita(n, 0, sl.length - 1); var d = sl[at].dataset.d; x = alvo(at);
      pista.style.setProperty('--x', x.toFixed(1) + 'px');
      sl.forEach(function (f, i) { f.classList.toggle('ativo', i === at); $('button', f).tabIndex = i === at ? 0 : -1; });
      tabs.forEach(function (t) {
        var on = t.dataset.d === d; if (on) { t.setAttribute('aria-current', 'true'); if (t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollTo({ left: t.offsetLeft - 20, behavior: 'smooth' }); } else t.removeAttribute('aria-current');
        if (on && leg) leg.textContent = t.textContent;
      });
      if (cont) cont.textContent = (at + 1 < 10 ? '0' : '') + (at + 1);
      setas[0].disabled = at === 0; setas[1].disabled = at === sl.length - 1;
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { vai(sl.findIndex(function (f) { return f.dataset.d === t.dataset.d; })); }); });
    setas.forEach(function (b) { b.addEventListener('click', function () { vai(at + (+b.dataset.passo)); }); });
    /* carregar numa foto que não é a ativa: vai para ela, em vez de abrir o visor */
    pista.addEventListener('click', function (e) {
      if (pista.dataset.arrastou) { e.stopPropagation(); e.preventDefault(); return; }
      var f = e.target.closest('.vc__sl'); if (f && !f.classList.contains('ativo')) { e.stopPropagation(); e.preventDefault(); vai(sl.indexOf(f)); }
    }, true);
    /* arrastar (rato ou dedo): a fita segue o gesto e assenta na foto mais perto */
    var x0 = null, y0 = 0, dx = 0, lado = false;
    pista.addEventListener('pointerdown', function (e) { if (e.button) return; x0 = e.clientX; y0 = e.clientY; dx = 0; lado = false; });
    window.addEventListener('pointermove', function (e) {
      if (x0 === null) return; dx = e.clientX - x0;
      if (!lado && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) { lado = true; pista.classList.add('arrasta'); }
      if (lado) pista.style.setProperty('--x', (x + dx).toFixed(1) + 'px');
    });
    function solta() {
      if (x0 === null) return; x0 = null; pista.classList.remove('arrasta');
      if (!lado) return;
      pista.dataset.arrastou = '1'; setTimeout(function () { pista.dataset.arrastou = ''; }, 60);
      var passo = Math.abs(dx) > 50 ? (dx < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dx) / (sl[at].offsetWidth * .9))) : 0;
      vai(at + passo);
    }
    pista.addEventListener("dragstart", function (e) { e.preventDefault(); });
    window.addEventListener('pointerup', solta); window.addEventListener('pointercancel', solta);
    fitaV.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); vai(at + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); vai(at - 1); } });
    window.addEventListener('resize', function () { vai(at); });
    vai(0);
  });

  /* Visor (uma foto de cada vez, só da divisão escolhida) */
  var dados = {}; var dEl = $('#fotos-dados'); if (dEl) { try { dados = JSON.parse(dEl.textContent); } catch (e) { } }
  var visor = $('.visor'), alb = $('.album');
  function travar() { doc.body.style.overflow = (visor && visor.classList.contains('aberto')) || (alb && !alb.hidden) ? 'hidden' : ''; }
  if (visor) {
    var vImg = $('.visor__centro img', visor), vTit = $('.visor__titulo', visor), fita = $('.visor__fita', visor), lista = [], idx = 0, antes = null;
    var poe = function (i) {
      idx = (i + lista.length) % lista.length; var f = lista[idx];
      vImg.src = f.s; vImg.alt = f.a; vTit.textContent = f.l + ' · ' + (idx + 1) + ' de ' + lista.length;
      $$('button', fita).forEach(function (b, n) { b.classList.toggle('ativa', n === idx); if (n === idx) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
    };
    var abre = function (g, i) {
      lista = dados[g] || []; if (!lista.length) return;
      antes = doc.activeElement; fita.textContent = '';
      lista.forEach(function (f, n) {
        var b = doc.createElement('button'), im = doc.createElement('img'); b.type = 'button'; b.setAttribute('aria-label', 'Fotografia ' + (n + 1));
        im.src = f.m; im.alt = ''; im.loading = 'lazy'; b.appendChild(im); b.addEventListener('click', function () { poe(n); }); fita.appendChild(b);
      });
      visor.classList.add('aberto'); travar(); poe(i || 0); $('.visor__fechar', visor).focus();
    };
    var fecha = function () { visor.classList.remove('aberto'); travar(); if (antes) antes.focus(); };
    doc.addEventListener('click', function (e) {
      var t = e.target.closest('[data-grupo]'); if (t) { e.preventDefault(); abre(t.dataset.grupo, +(t.dataset.i || 0)); }
    });
    $('.visor__fechar', visor).addEventListener('click', fecha);
    $('.visor__seta--a', visor).addEventListener('click', function () { poe(idx - 1); });
    $('.visor__seta--d', visor).addEventListener('click', function () { poe(idx + 1); });
    doc.addEventListener('keydown', function (e) {
      if (!visor.classList.contains('aberto')) return;
      if (e.key === 'Escape') { e.stopImmediatePropagation(); fecha(); } if (e.key === 'ArrowLeft') poe(idx - 1); if (e.key === 'ArrowRight') poe(idx + 1);
    });
  }

  /* Álbum: todas as fotografias da casa, por divisão; carregar numa abre o visor dessa divisão */
  if (alb) {
    var corpo = $('.album__corpo', alb), navA = $$('.album__nav a', alb), secs = $$('.album__sec', alb), antesA = null;
    var carrega = function () { $$('img[data-src]', alb).forEach(function (i) { i.src = i.dataset.src; i.removeAttribute('data-src'); }); };
    var vai = function (k) { var s = k && $('#al-' + k, alb); corpo.scrollTop = s ? s.offsetTop - 8 : 0; marca(); };
    var marca = function () {
      var y = corpo.scrollTop + 60, at = secs[0];
      secs.forEach(function (s) { if (s.offsetTop <= y) at = s; });
      navA.forEach(function (a) { var on = at && a.getAttribute('href') === '#' + at.id; a.classList.toggle('ativa', on); if (on) a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
    };
    var abreA = function (k) { antesA = doc.activeElement; carrega(); alb.hidden = false; travar(); vai(k); $('.album__x', alb).focus(); };
    var fechaA = function () { alb.hidden = true; travar(); if (antesA) antesA.focus(); };
    doc.addEventListener('click', function (e) { var t = e.target.closest('[data-album]'); if (t) { e.preventDefault(); abreA(t.dataset.album); } });
    navA.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); vai(a.dataset.al); }); });
    corpo.addEventListener('scroll', function () { requestAnimationFrame(marca); }, { passive: true });
    $('.album__x', alb).addEventListener('click', fechaA);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !alb.hidden && !(visor && visor.classList.contains('aberto'))) fechaA(); });
  }

  /* Reserva: calendário próprio; o botão leva ao Booking com a pesquisa feita, nesta casa */
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var dois = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + dois(d.getMonth() + 1) + '-' + dois(d.getDate()); };
  var legivel = function (t) { var p = t.split('-').map(Number); return p[2] + ' ' + CURTO[p[1] - 1]; };
  $$('.rz').forEach(function (f) {
    var casas = JSON.parse(f.dataset.casas), ir = $('.rz__ir', f), out = $('output', f), cal = $('.rz__cal', f), nota = $('.rz__airbnb', f);
    var mais = $('[data-passo="1"]', f), menos = $('[data-passo="-1"]', f);
    var campos = { 'in': $('[data-campo="in"]', f), 'out': $('[data-campo="out"]', f) };
    var hoje = new Date(); hoje.setHours(12, 0, 0, 0); var minimo = iso(hoje);
    var casa = casas[0], n = Math.min(2, casa.max), ent = '', sai = '', fase = '', ano = hoje.getFullYear(), mes = hoje.getMonth();
    function liga() {
      out.textContent = n; mais.disabled = n >= casa.max; menos.disabled = n <= 1;
      var q = ['group_adults=' + n, 'group_children=0', 'no_rooms=1'];
      if (ent && sai) q.push('checkin=' + ent, 'checkout=' + sai);
      ir.href = casa.url + '?' + q.join('&'); if (nota) nota.href = casa.airbnb;
      [['in', ent], ['out', sai]].forEach(function (p) {
        var c = campos[p[0]]; c.classList.toggle('cheio', !!p[1]); c.classList.toggle('agora', fase === p[0]);
        $('b', c).textContent = p[1] ? legivel(p[1]) : 'Escolher';
      });
    }
    function desenha() {
      var primeiro = new Date(ano, mes, 1, 12), dias = new Date(ano, mes + 1, 0).getDate(), vazios = (primeiro.getDay() + 6) % 7;
      var ant = ano > hoje.getFullYear() || mes > hoje.getMonth();
      var h = '<div class="rz__mes"><button type="button" data-mes="-1" aria-label="Mês anterior"' + (ant ? '' : ' disabled') + '>‹</button><span aria-live="polite">' + MESES[mes] + ' ' + ano + '</span><button type="button" data-mes="1" aria-label="Mês seguinte">›</button></div><div class="rz__dias">';
      h += ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + new Array(vazios + 1).join('<i></i>');
      for (var d = 1; d <= dias; d++) {
        var t = iso(new Date(ano, mes, d, 12)), fora = t < minimo || (fase === 'out' && ent && t <= ent);
        var cl = t === ent || t === sai ? 'ponta' : (ent && sai && t > ent && t < sai ? 'entre' : '');
        h += '<button type="button" data-dia="' + t + '" class="' + cl + '"' + (fora ? ' disabled' : '') + ' aria-label="' + d + ' de ' + MESES[mes] + '">' + d + '</button>';
      }
      cal.innerHTML = h + '</div>';
    }
    function abre(k) { fase = k; var t = k === 'out' ? (sai || ent) : ent; if (t) { var p = t.split('-').map(Number); ano = p[0]; mes = p[1] - 1; } cal.hidden = false; desenha(); liga(); }
    function fecha() { fase = ''; cal.hidden = true; liga(); }
    campos['in'].addEventListener('click', function () { if (fase === 'in') fecha(); else abre('in'); });
    campos['out'].addEventListener('click', function () { if (fase === 'out') fecha(); else abre(ent ? 'out' : 'in'); });
    cal.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.mes) { mes += +b.dataset.mes; if (mes < 0) { mes = 11; ano--; } else if (mes > 11) { mes = 0; ano++; } desenha(); return; }
      var t = b.dataset.dia;
      if (fase === 'in') { ent = t; if (sai && sai <= ent) sai = ''; fase = 'out'; desenha(); liga(); } else { sai = t; fecha(); }
    });
    $$('[data-passo]', f).forEach(function (b) { b.addEventListener('click', function () { n = limita(n + +b.dataset.passo, 1, casa.max); liga(); }); });
    $$('input[name="casa"]', f).forEach(function (r) { r.addEventListener('change', function () { casa = casas[+r.value]; n = Math.min(n, casa.max); liga(); }); });
    $$('select[name="casa"]', f).forEach(function (r) { r.addEventListener('change', function () { casa = casas[+r.value]; n = Math.min(n, casa.max); liga(); }); });
    doc.addEventListener('click', function (e) { if (fase && (e.composedPath ? e.composedPath().indexOf(f) < 0 : !f.contains(e.target))) fecha(); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fase) { e.stopPropagation(); fecha(); } });
    ir.addEventListener('click', function (e) { if (!ent || !sai) { e.preventDefault(); abre(ent ? 'out' : 'in'); } });
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    liga();
  });

  /* Câmara em profundidade: a foto original e o seu mapa de profundidade num shader; a câmara anda devagar para o lado e para dentro
     e volta, em ciclo; o que está perto mexe mais do que o fundo. Em repouso desenha a foto tal como está. Sem WebGL2 fica a foto. */
  $$('.cam__3d').forEach(function (c3) {
    var gl = !calmo && c3.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    var P = Object.assign({ ciclo: 24, lado: 0.022, dentro: 0.08, sobe: 0.006, pan_tm: 0.06 }, JSON.parse(c3.dataset.p || '{}'));
    var foco = function (s) { return s.split(/\s+/).map(function (v) { return parseFloat(v) / 100; }); };
    var sh = function (t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, '#version 300 es\nin vec2 a; out vec2 v; void main() { v = vec2(a.x, -a.y) * .5 + .5; gl_Position = vec4(a, 0., 1.); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float;\nuniform sampler2D foto, prof;\nuniform vec2 k, o, desl;\nuniform float esc, aprox;\nin vec2 v; out vec4 cor;\n' +
      'vec2 em(vec2 p, vec2 c, float L) { return c + (p - c) / (1. + aprox * L) - desl * L; }\n' +
      'void main() { vec2 c = o + .5 * k; vec2 p = c + (o + v * k - c) / esc; float L = 1., ant = 1.;\n' +
      ' for (int i = 0; i <= 44; i++) { L = 1. - float(i) / 44.; if (textureLod(prof, em(p, c, L), 0.).r >= L) break; ant = L; }\n' +
      ' float a = L, b = ant; for (int j = 0; j < 6; j++) { float m = (a + b) * .5; if (textureLod(prof, em(p, c, m), 0.).r >= m) a = m; else b = m; }\n' +
      ' vec2 dx = dFdx(p), dy = dFdy(p); cor = textureGrad(foto, clamp(em(p, c, a), vec2(0.), vec2(1.)), dx, dy); }'));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['foto', 'prof', 'k', 'o', 'desl', 'esc', 'aprox'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    function textura(im, u, mip) {
      gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    var carregaI = function (src) { return new Promise(function (ok, falha) { var i = new Image(); i.decoding = 'async'; i.onload = function () { ok(i); }; i.onerror = falha; i.src = src; }); };
    var fontes = location.protocol === 'file:'
      ? new Promise(function (ok, falha) { var s = doc.createElement('script'); s.src = c3.dataset.js; s.onload = function () { ok(window.P3D); }; s.onerror = falha; doc.head.appendChild(s); })
      : Promise.resolve({ foto: c3.dataset.foto, prof: c3.dataset.prof });
    var fw = 1, fh = 1, larg = 0, alt = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), decorrido = 0, ultimo = null, vivo = true, ped = 0, lentos = 0;
    function mede() { var r = c3.getBoundingClientRect(); larg = r.width; alt = r.height; c3.width = Math.round(larg * dpr); c3.height = Math.round(alt * dpr); gl.viewport(0, 0, c3.width, c3.height); }
    function desenha(fase) {
      var ao = alt > larg, fc = foco(ao && P.foco_tm ? P.foco_tm : c3.dataset.foco), ra = larg / alt, ri = fw / fh;
      var k = ra > ri ? [1, ri / ra] : [ra / ri, 1];
      var s = Math.sin(fase * 2 * Math.PI), e = (1 - Math.cos(fase * 2 * Math.PI)) / 2, pan = ao ? P.pan_tm * s : 0;
      var ox = Math.min(Math.max((1 - k[0]) * fc[0] + pan * (1 - k[0]), 0), 1 - k[0]), oy = (1 - k[1]) * fc[1];
      var lx = P.lado * s * k[0], ly = -P.sobe * e * k[1];
      gl.uniform1i(U.foto, 0); gl.uniform1i(U.prof, 1);
      gl.uniform2f(U.k, k[0], k[1]); gl.uniform2f(U.o, ox, oy); gl.uniform2f(U.desl, lx, ly);
      gl.uniform1f(U.aprox, P.dentro * e);
      gl.uniform1f(U.esc, 1 + (Math.abs(lx) / k[0] * 2.2 + Math.abs(ly) / k[1] * 2.2) + P.dentro * e * .18);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function passo(agora) {
      ped = 0; if (!vivo) { ultimo = null; return; }
      if (ultimo !== null) decorrido += Math.min(agora - ultimo, 100); ultimo = agora;
      var fase = window.__fase3d != null ? window.__fase3d : (decorrido / 1000 / P.ciclo) % 1, ini = performance.now();
      desenha(fase);
      if (performance.now() - ini > 12 && ++lentos > 20 && dpr > 1) { dpr = Math.max(1, dpr - .5); lentos = 0; mede(); }
      ped = requestAnimationFrame(passo);
    }
    fontes.then(function (f) { return Promise.all([carregaI(f.foto), carregaI(f.prof)]); }).then(function (r) {
      fw = r[0].naturalWidth; fh = r[0].naturalHeight; textura(r[0], 0, true); textura(r[1], 1, false);
      mede(); desenha(0); c3.classList.add('pronto');
      window.addEventListener('resize', function () { mede(); desenha(0); });
      var io = new IntersectionObserver(function (es) { vivo = es[0].isIntersecting && !doc.hidden; if (vivo && !ped) ped = requestAnimationFrame(passo); });
      io.observe(c3);
      doc.addEventListener('visibilitychange', function () { vivo = !doc.hidden; if (vivo && !ped) ped = requestAnimationFrame(passo); });
      ped = requestAnimationFrame(passo);
    }).catch(function () { });
  });
})();

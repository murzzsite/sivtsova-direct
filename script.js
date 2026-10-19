(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/HXCGRK65T7';

  const form = document.getElementById('leadForm');
  // ===== Яндекс Метрика: цели =====
  const goal = name => { try { if (typeof ym === 'function') ym(100636783, 'reachGoal', name); } catch (e) {} };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.includes('t.me/S_Olga_N')) goal('click_telegram');
    else if (href.includes('max.ru/u/')) goal('click_max');
    else if (href.startsWith('mailto:kontext.rekl@yandex.ru')) goal('click_email');
  });
  document.querySelectorAll('.consent input').forEach(i => i.addEventListener('change', () => {
    if (form && form.consent_pd.checked && form.consent_policy.checked) document.getElementById('consentErr')?.classList.remove('is-on');
  }));

  // ===== Отзывы: просмотр крупно =====
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const closeLb = () => { if (lb) { lb.hidden = true; lbImg.src = ''; } };
  document.querySelectorAll('.review__btn').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.full; lbImg.alt = b.querySelector('img')?.alt || '';
    lb.hidden = false;
  }));
  lb?.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  // ===== Cookie-баннер =====
  const cookie = document.getElementById('cookie');
  const fabStack = document.getElementById('fabStack');
  if (cookie) {
    let seen = false;
    try { seen = !!localStorage.getItem('cookie_ok'); } catch (e) {}
    if (!seen) {
      cookie.hidden = false;
      if (fabStack) fabStack.style.bottom = '110px';
      document.getElementById('cookieOk')?.addEventListener('click', () => {
        try { localStorage.setItem('cookie_ok', '1'); } catch (e) {}
        cookie.hidden = true;
        if (fabStack) fabStack.style.bottom = '';
      });
    }
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
  }));

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });

    if (payload._gotcha) return;

    if (!payload.name || (!payload.phone && !payload.contact)) {
      alert('Заполните имя и контактные данные');
      return;
    }

    const consentErr = document.getElementById('consentErr');
    if (!form.consent_pd.checked || !form.consent_policy.checked) {
      consentErr?.classList.add('is-on');
      return;
    }
    consentErr?.classList.remove('is-on');
    delete payload.consent_pd;
    delete payload.consent_policy;

    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена ✓';
      goal('form_submit');
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const targets = document.querySelectorAll(
    '.audience__card, .case-card, .about__fact, .case__box, .price-card, .price__table, .method__box, .step, .faq__item, .form, .hero__card, .recognize__list li'
  );
  targets.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
})();

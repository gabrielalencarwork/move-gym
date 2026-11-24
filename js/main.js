/**
 * X-MOVE GYM - JAVASCRIPT
 * Navegação, modais acessíveis, galeria, FAQ, filtro de planos,
 * simulador de plano, revelação ao rolar e contadores.
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '5538999459994'; // Montes Claros
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const brl = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  // ------------------------------------------------------------------
  // 0. Vídeo de fundo: respeita "reduzir movimento"
  // ------------------------------------------------------------------
  const heroVideo = $('.hero-bg-video');
  if (heroVideo && prefersReducedMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  // ------------------------------------------------------------------
  // 1. Navbar fixa ao rolar
  // ------------------------------------------------------------------
  const navbar = $('#navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ------------------------------------------------------------------
  // 2. Menu mobile
  // ------------------------------------------------------------------
  const mobileMenuBtn = $('#mobileMenuBtn');
  const navMenu = $('#nav-menu');

  const setMenu = (open) => {
    navMenu.classList.toggle('mobile-open', open);
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    mobileMenuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenu(!navMenu.classList.contains('mobile-open'));
    });
    navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        setMenu(false);
        mobileMenuBtn.focus();
      }
    });
  }

  // ------------------------------------------------------------------
  // 3. Item ativo do menu conforme a seção visível
  // ------------------------------------------------------------------
  const navLinks = $$('.nav-links a[href^="#"]');
  const spyTargets = navLinks
    .map((a) => ({ a, section: $(a.getAttribute('href')) }))
    .filter((x) => x.section);

  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('active'));
        const match = spyTargets.find((x) => x.section === entry.target);
        if (match) match.a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach((x) => spy.observe(x.section));
  }

  // ------------------------------------------------------------------
  // 4. Modais: abrir/fechar, foco preso, Esc, scroll travado
  // ------------------------------------------------------------------
  let lastFocused = null;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  const openModal = (modal, focusSel) => {
    lastFocused = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll', 'modal-open');
    const target = (focusSel && $(focusSel, modal)) || $(FOCUSABLE, modal);
    // Tenta de novo caso a transição de visibilidade ainda não tenha terminado
    [60, 250].forEach((delay) => setTimeout(() => {
      if (target && !modal.contains(document.activeElement)) target.focus();
    }, delay));
  };

  const closeModal = (modal) => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll', 'modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  const trapFocus = (e, modal) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, modal).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // ------------------------------------------------------------------
  // 5. Modal do voucher (1 dia grátis)
  // ------------------------------------------------------------------
  const leadModal = $('#leadModal');
  const leadForm = $('#freePassForm');
  const leadName = $('#leadName');
  const leadPhone = $('#leadPhone');
  const leadError = $('#leadError');
  const lightboxModal = $('#lightboxModal');

  $$('.open-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Se o lightbox estiver aberto, fecha antes de abrir o voucher
      if (lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
      }
      openModal(leadModal, '#leadName');
    });
  });

  $('.modal-close-btn', leadModal).addEventListener('click', () => closeModal(leadModal));
  leadModal.addEventListener('click', (e) => { if (e.target === leadModal) closeModal(leadModal); });
  leadModal.addEventListener('keydown', (e) => trapFocus(e, leadModal));

  // Máscara de telefone: (38) 99999-9999
  const maskPhone = (value) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  leadPhone.addEventListener('input', () => { leadPhone.value = maskPhone(leadPhone.value); });

  const showLeadError = (msg, field) => {
    leadError.textContent = msg;
    leadError.hidden = false;
    [leadName, leadPhone].forEach((f) => f.classList.remove('invalid'));
    field.classList.add('invalid');
    field.focus();
  };

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = leadName.value.trim();
    const phone = leadPhone.value.trim();
    const digits = phone.replace(/\D/g, '');

    if (name.length < 3) return showLeadError('Informe seu nome completo.', leadName);
    if (digits.length < 10) return showLeadError('Informe um WhatsApp válido, com DDD.', leadPhone);

    leadError.hidden = true;
    [leadName, leadPhone].forEach((f) => f.classList.remove('invalid'));

    const text = `Olá! Meu nome é ${name} (${phone}). Gostaria de resgatar meu *1 Dia Grátis de Treino* na X-Move Gym Montes Claros!`;
    window.open(waLink(text), '_blank', 'noopener');
    closeModal(leadModal);
    leadForm.reset();
  });

  // ------------------------------------------------------------------
  // 6. Filtro de planos
  // ------------------------------------------------------------------
  const planTabBtns = $$('.plan-tab-btn');
  const pricingCards = $$('.pricing-card');

  planTabBtns.forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      planTabBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      pricingCards.forEach((card) => {
        const show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = show ? 'flex' : 'none';
        if (show && !prefersReducedMotion) card.style.animation = 'fadeIn 0.4s ease';
      });
    });
  });

  // ------------------------------------------------------------------
  // 7. Galeria com lightbox
  // ------------------------------------------------------------------
  const galleryWrappers = $$('.gallery-img-wrapper');
  const lightboxImg = $('#lightboxImg');
  const lightboxTitle = $('#lightboxTitle');
  const lightboxDesc = $('#lightboxDesc');
  const lightboxCounter = $('#lightboxCounter');
  let currentGalleryIndex = 0;

  const updateLightbox = (index) => {
    if (!galleryWrappers.length) return;
    currentGalleryIndex = (index + galleryWrappers.length) % galleryWrappers.length;
    const w = galleryWrappers[currentGalleryIndex];
    const title = w.getAttribute('data-lightbox-title') || '';
    lightboxImg.src = w.getAttribute('data-lightbox-src') || $('img', w).src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = w.getAttribute('data-lightbox-desc') || '';
    lightboxCounter.textContent = `Foto ${currentGalleryIndex + 1} de ${galleryWrappers.length}`;
  };

  const openLightbox = (idx) => {
    updateLightbox(idx);
    openModal(lightboxModal, '#lightboxCloseBtn');
  };

  galleryWrappers.forEach((w, idx) => {
    w.addEventListener('click', () => openLightbox(idx));
    w.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  $('#lightboxPrevBtn').addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentGalleryIndex - 1); });
  $('#lightboxNextBtn').addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentGalleryIndex + 1); });
  $('#lightboxCloseBtn').addEventListener('click', () => closeModal(lightboxModal));
  lightboxModal.addEventListener('click', (e) => { if (e.target === lightboxModal) closeModal(lightboxModal); });
  lightboxModal.addEventListener('keydown', (e) => trapFocus(e, lightboxModal));

  // Teclado global para os modais abertos (Esc e setas)
  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal(lightboxModal);
      else if (e.key === 'ArrowLeft') updateLightbox(currentGalleryIndex - 1);
      else if (e.key === 'ArrowRight') updateLightbox(currentGalleryIndex + 1);
    } else if (leadModal.classList.contains('active') && e.key === 'Escape') {
      closeModal(leadModal);
    }
  });

  // ------------------------------------------------------------------
  // 8. FAQ (acordeão acessível)
  // ------------------------------------------------------------------
  $$('.faq-header').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const willOpen = !item.classList.contains('active');
      $$('.faq-item').forEach((i) => {
        i.classList.remove('active');
        $('.faq-header', i).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ------------------------------------------------------------------
  // 9. Simulador: encontra o plano certo (usa os preços da própria página)
  // ------------------------------------------------------------------
  const planData = {};
  $$('.price-freq-item[data-plan]').forEach((li) => {
    planData[`${li.dataset.plan}-${li.dataset.freq}`] = {
      plan: li.dataset.plan,
      freq: li.dataset.freq,
      parcelas: Number(li.dataset.parcelas),
      valor: Number(li.dataset.valor),
    };
  });

  const planNames = { mensal: 'Plano Mensal', semestral: 'Plano Semestral', anual: 'Plano Anual VIP' };
  const goalLabels = {
    hypertrophy: 'Hipertrofia e ganho de massa',
    weightloss: 'Emagrecimento e definição',
    health: 'Saúde, postura e qualidade de vida',
    rehab: 'Reabilitação e prevenção de lesões',
  };
  const goalPrograms = {
    hypertrophy: 'Programas indicados: Musculação High Performance + Treino de Força & Lifting.',
    weightloss: 'Programas indicados: Musculação High Performance + Treino Funcional & Cardio.',
    health: 'Programas indicados: Musculação orientada + Aulas de Yoga.',
    rehab: 'Programas indicados: Fisioterapia & Reabilitação + Musculação orientada.',
  };

  const planFinder = $('#planFinder');
  const calcResult = $('#calcResult');

  if (planFinder && calcResult) {
    planFinder.addEventListener('submit', (e) => {
      e.preventDefault();
      const goal = $('#calcGoal').value;
      const freq = $('#calcFreq').value;
      const commit = $('#calcCommit').value;

      const chosen = planData[`${commit}-${freq}`];
      const monthly = planData[`mensal-${freq}`];
      if (!chosen || !monthly) return;

      const freqText = freq === '7' ? 'todos os dias' : `${freq}x por semana`;
      let priceText;
      let metaHtml;

      if (chosen.plan === 'mensal') {
        priceText = `${brl(chosen.valor)} /mês`;
        metaHtml = `Treinando ${freqText}, <strong>sem fidelidade</strong>. Cancele quando quiser.`;
      } else {
        const total = chosen.parcelas * chosen.valor; // usado só no cálculo da economia
        const saving = chosen.parcelas * monthly.valor - total;
        priceText = `${chosen.parcelas}x de ${brl(chosen.valor)}`;
        metaHtml = `Treinando ${freqText}, você economiza <strong>${brl(saving)}</strong> em relação ao mensal. Avaliação física grátis inclusa.`;
      }

      $('#resPlan').textContent = planNames[chosen.plan];
      $('#resPrice').textContent = priceText;
      $('#resMeta').innerHTML = metaHtml;
      $('#resPrograms').textContent = goalPrograms[goal];

      const msg = `Olá! Usei o simulador de planos da X-Move Gym e quero o *${planNames[chosen.plan]}* (${freqText}, ${priceText}). Objetivo: ${goalLabels[goal]}. Pode me ajudar a matricular?`;
      $('#resWhats').href = waLink(msg);

      calcResult.classList.add('show');
      calcResult.focus({ preventScroll: true });
      calcResult.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  // ------------------------------------------------------------------
  // 10. Contadores animados (quando entram na tela)
  // ------------------------------------------------------------------
  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-target')) || 0;
    if (prefersReducedMotion) { el.textContent = target; return; }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = $$('.counter');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => counterObs.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  // ------------------------------------------------------------------
  // 11. Revelação ao rolar
  // ------------------------------------------------------------------
  const revealSelector = [
    '.section-header', '.why-us-image-wrapper', '.why-us-content', '.feature-box',
    '.program-card', '.gallery-item', '.unit-card-wrapper', '.wellhub-banner',
    '.calc-card', '.plan-tab-nav', '.pricing-card', '.motivation-banner', '.faq-item',
  ].join(',');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealEls = $$(revealSelector);
    revealEls.forEach((el) => {
      const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(revealSelector));
      const idx = Math.max(siblings.indexOf(el), 0);
      el.style.setProperty('--reveal-delay', `${Math.min(idx, 5) * 70}ms`);
      el.classList.add('reveal');
    });

    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('in-view');
        obs.unobserve(el);
        // Após a animação, devolve o controle de transição ao próprio componente (hover etc.)
        setTimeout(() => el.classList.remove('reveal', 'in-view'), 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObs.observe(el));
  }
});

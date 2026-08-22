/**
 * X-MOVE GYM - JAVASCRIPT LOGIC
 * High-performance UI interactions, tab switcher, lead modal & BMI/training calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar on Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 1.5 Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('mobile-open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navMenu.classList.remove('mobile-open');
      }
    });
  }

  // 2. Unit Tab Switcher (Montes Claros vs. Francisco Sá)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const unitCards = document.querySelectorAll('.unit-card-wrapper');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUnit = btn.getAttribute('data-unit');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      unitCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeCard = document.getElementById(`unit-${targetUnit}`);
      if (activeCard) {
        activeCard.classList.add('active');
      }
    });
  });

  // 2.5 Plan Category Filter Switcher (All vs Semestral vs Anual vs Mensal vs Avaliação)
  const planTabBtns = document.querySelectorAll('.plan-tab-btn');
  const pricingCards = document.querySelectorAll('.pricing-card');

  planTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      planTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      pricingCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 2.8 Gym Structure Gallery Carousel Lightbox
  const galleryWrappers = Array.from(document.querySelectorAll('.gallery-img-wrapper'));
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let currentGalleryIndex = 0;

  const updateLightbox = (index) => {
    if (galleryWrappers.length === 0) return;
    if (index < 0) index = galleryWrappers.length - 1;
    if (index >= galleryWrappers.length) index = 0;
    currentGalleryIndex = index;

    const wrapper = galleryWrappers[currentGalleryIndex];
    const imgSrc = wrapper.getAttribute('data-lightbox-src') || wrapper.querySelector('img')?.src;
    const title = wrapper.getAttribute('data-lightbox-title');
    const desc = wrapper.getAttribute('data-lightbox-desc');

    if (lightboxImg) lightboxImg.src = imgSrc;
    if (lightboxTitle) lightboxTitle.innerText = title || '';
    if (lightboxDesc) lightboxDesc.innerText = desc || '';
    if (lightboxCounter) lightboxCounter.innerText = `Foto ${currentGalleryIndex + 1} de ${galleryWrappers.length}`;
  };

  galleryWrappers.forEach((wrapper, idx) => {
    wrapper.addEventListener('click', () => {
      updateLightbox(idx);
      if (lightboxModal) lightboxModal.classList.add('active');
    });
  });

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentGalleryIndex - 1);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentGalleryIndex + 1);
    });
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => {
      if (lightboxModal) lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  // Keyboard controls (Arrow Left, Arrow Right, Escape)
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') {
      updateLightbox(currentGalleryIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updateLightbox(currentGalleryIndex + 1);
    } else if (e.key === 'Escape') {
      lightboxModal.classList.remove('active');
    }
  });

  // 3. Interactive FAQ Accordion
  const faqHeaders = document.querySelectorAll('.faq-header');
  faqHeaders.forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.parentElement;
      const isActive = faqItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // 4. Free Pass Lead Modal Toggle
  const modalOverlay = document.getElementById('leadModal');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');
  const closeModalBtn = document.querySelector('.modal-close-btn');
  const leadForm = document.getElementById('freePassForm');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Lead Form Submission Handler (WhatsApp Direct Dispatcher)
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('leadName').value.trim();
      const phone = document.getElementById('leadPhone').value.trim();
      const whatsappNumber = '5538999459994'; // Montes Claros

      const text = encodeURIComponent(`Olá! Meu nome é ${name} (${phone}). Gostaria de resgatar meu **1 Dia Grátis de Treino** na X-Move Gym Montes Claros!`);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${text}`;

      window.open(whatsappUrl, '_blank');
      modalOverlay.classList.remove('active');
      leadForm.reset();
    });
  }

  // 5. Training Plan Calculator Widget
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');
  const resultText = document.getElementById('resultText');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const weight = parseFloat(document.getElementById('calcWeight').value);
      const height = parseFloat(document.getElementById('calcHeight').value) / 100;
      const goal = document.getElementById('calcGoal').value;

      if (!weight || !height || height <= 0) {
        alert('Por favor, informe seu peso e altura corretamente.');
        return;
      }

      const bmi = (weight / (height * height)).toFixed(1);
      let recommendation = '';

      if (goal === 'hypertrophy') {
        recommendation = `Seu IMC é ${bmi}. Para Hipertrofia e Ganho de Massa, recomendamos nosso Plano Anual VIP X-Move com acompanhamento de Personal e Bioimpedância!`;
      } else if (goal === 'weightloss') {
        recommendation = `Seu IMC é ${bmi}. Para Emagrecimento e Definição, recomendamos Musculação High Performance + Treino Funcional.`;
      } else {
        recommendation = `Seu IMC é ${bmi}. A melhor opção para você é agendar uma aula experimental para montarmos um treino 100% personalizado!`;
      }

      resultText.innerText = recommendation;
      calcResult.classList.add('show');
    });
  }

  // 6. Number Counter Animation on Scroll
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const speed = 200;
      const updateCount = () => {
        const count = +counter.innerText;
        const inc = target / speed;
        if (count < target) {
          counter.innerText = Math.ceil(count + inc);
          setTimeout(updateCount, 15);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  };

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats-bar');
    if (statsSection && !animated) {
      const pos = statsSection.getBoundingClientRect().top;
      if (pos < window.innerHeight - 100) {
        animateCounters();
        animated = true;
      }
    }
  });
});

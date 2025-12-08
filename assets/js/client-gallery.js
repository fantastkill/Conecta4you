// JavaScript específico para páginas de clientes
document.addEventListener('DOMContentLoaded', function() {
  // Remover qualquer elemento flutuante que possa ter sido criado
  const floatingElements = document.querySelectorAll('.whatsapp-float, .scroll-to-top, #loader');
  floatingElements.forEach(element => {
    element.remove();
  });
  
  // Garantir que não há elementos com position fixed
  const fixedElements = document.querySelectorAll('*');
  fixedElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'fixed' && !element.classList.contains('lightbox')) {
      element.style.position = 'static';
    }
  });
  // Animação de entrada dos elementos
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos para animação
  document.querySelectorAll('.gallery-item, .result-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Adicionar classe visible quando observado
  const visibleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.gallery-item, .result-item').forEach(el => {
    visibleObserver.observe(el);
  });

  // Efeito de parallax suave no scroll
  let ticking = false;
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.gallery-item');
    
    parallaxElements.forEach((el, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // Aplicar parallax apenas em desktop
  if (window.innerWidth > 768) {
    window.addEventListener('scroll', requestTick);
  }

  // Lightbox para imagens da galeria
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      if (img) {
        openLightbox(img.src, img.alt);
      }
    });
  });

  function openLightbox(src, alt) {
    // Criar overlay do lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <img src="${src}" alt="${alt}" class="lightbox-image">
        <button class="lightbox-close">&times;</button>
      </div>
    `;

    // Adicionar estilos do lightbox
    const style = document.createElement('style');
    style.textContent = `
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .lightbox-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
      }
      
      .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        z-index: 10001;
      }
      
      .lightbox-image {
        width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      
      .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 32px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .lightbox-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Animar entrada
    setTimeout(() => {
      lightbox.style.opacity = '1';
    }, 10);

    // Fechar lightbox
    function closeLightbox() {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(lightbox);
        document.head.removeChild(style);
        document.body.style.overflow = '';
      }, 300);
    }

    // Event listeners para fechar
    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  // Animação de contadores nos resultados
  const resultValues = document.querySelectorAll('.result-value');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const text = element.textContent;
        
        // Verificar se é um número
        if (text.includes('%') || text.includes('★')) {
          const number = parseInt(text.replace(/[^\d]/g, ''));
          if (number) {
            animateCounter(element, number, text);
          }
        }
        
        counterObserver.unobserve(element);
      }
    });
  }, { threshold: 0.5 });

  resultValues.forEach(el => counterObserver.observe(el));

  function animateCounter(element, target, originalText) {
    let current = 0;
    const increment = target / 60; // 60 frames para 1 segundo
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      // Manter o formato original (%, ★, etc.)
      const suffix = originalText.replace(/[\d]/g, '');
      element.textContent = Math.floor(current) + suffix;
    }, 16);
  }
});

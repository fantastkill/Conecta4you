(function(){
  // Inicialização quando DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    // Remove classe preload
    document.documentElement.classList.remove('preload');
    
    // Progress Bar
    const progressBar = document.getElementById('progress-bar');
    
    function updateProgressBar() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
      
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
    }
    
    // Atualizar barra de progresso no scroll
    window.addEventListener('scroll', updateProgressBar);
    
    // Navegação mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('#nav-list');
    if(navToggle && navList){
      navToggle.addEventListener('click', function(){
        const isOpen = navList.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Dropdown mobile
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');
    if(dropdownToggle && dropdown){
      dropdownToggle.addEventListener('click', function(e){
        e.preventDefault();
        dropdown.classList.toggle('open');
      });
    }

    // Sistema de scroll reveal
    const createRevealObserver = () => {
      return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('visible');
            
            // Adiciona delays escalonados para elementos múltiplos
            const siblings = target.parentElement?.querySelectorAll('.reveal');
            if (siblings && siblings.length > 1) {
              Array.from(siblings).forEach((sibling, index) => {
                if (sibling.isIntersecting || sibling.classList.contains('visible')) {
                  sibling.style.transitionDelay = `${index * 0.1}s`;
                }
              });
            }
            
            observer.unobserve(target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });
    };

    const observer = createRevealObserver();
    
    // Inicializa scroll reveal
    function initializeScrollReveal() {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    
    // Inicializa após carregamento da página
    setTimeout(initializeScrollReveal, 100);
    
    // Adiciona brilho azul quando revelar
    document.querySelectorAll('.feature, .stat-card, .service-media').forEach(el => {
      observer.observe(el);
      el.addEventListener('transitionend', function(){
        if(el.classList.contains('visible')){
          el.classList.add('glow-blue');
          setTimeout(() => el.classList.remove('glow-blue'), 800);
        }
      });
    });

    // Footer year
    const y = document.getElementById('year');
    if(y){ y.textContent = String(new Date().getFullYear()); }

    // Simple contact form handler (client-side)
    const form = document.querySelector('.contact-form');
    const feedback = document.querySelector('.form-feedback');
    if(form){
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        if(!feedback) return;
        feedback.textContent = 'Enviando...';
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        try{
          // Placeholder: apenas simula envio
          await new Promise(function(r){setTimeout(r, 800);});
          feedback.textContent = 'Mensagem enviada! Responderemos em breve.';
          form.reset();
        }catch(err){
          feedback.textContent = 'Não foi possível enviar agora. Tente novamente.';
        }
      });
    }

    // Carousel controls (Netflix-like)
    document.querySelectorAll('[data-carousel]').forEach(function(track){
      const parent = track.parentElement;
      if(!parent) return;
      const prev = parent.querySelector('.carousel-btn.prev');
      const next = parent.querySelector('.carousel-btn.next');
      const card = track.querySelector('.portfolio-card');
      const step = card ? (card.clientWidth + 14) : 300;
      if(prev){
        prev.addEventListener('click', function(){
          track.scrollBy({left:-step,behavior:'smooth'});
        });
      }
      if(next){
        next.addEventListener('click', function(){
          track.scrollBy({left:step,behavior:'smooth'});
        });
      }
    });

    // Contadores animados (números subindo)
    const counters = document.querySelectorAll('[data-count]');
    if(counters.length){
      const countObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            const el = entry.target;
            const target = Number(el.getAttribute('target') || 0);
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('suffix') || '';
            let current = 0;
            const durationMs = 3000;
            const start = performance.now();
            const step = function(now){
              const progress = Math.min((now - start)/durationMs,1);
              current = Math.floor(progress * target);
              el.textContent = prefix + current.toLocaleString() + suffix;
              if(progress < 1){ requestAnimationFrame(step); }
            };
            requestAnimationFrame(step);
            countObserver.unobserve(el);
          }
        });
      },{threshold:0.6});
      counters.forEach(function(el){countObserver.observe(el);});
    }

    // Animação de texto por caracteres (para todos os spans .animated-chars)
    document.querySelectorAll('.animated-chars').forEach(function(node, groupIndex){
      // Em telas menores, evitamos quebrar palavras na descrição animada
      const isSmallScreen = window.innerWidth <= 720;
      const skipPerChar = isSmallScreen && node.classList.contains('desc-anim');
      if (skipPerChar) { return; }

      const html = node.innerHTML;
      
      // Para evitar quebras inadequadas, vamos agrupar palavras inteiras
      const words = html.split(' ');
      const wordSpans = words.map(function(word, wordIndex) {
        const chars = word.split('');
        const charSpans = chars.map(function(c,i){
          const baseDelay = Number(node.getAttribute('data-delay') || 0);
          const step = Number(node.getAttribute('data-step') || 22);
          const charIndex = wordIndex * 20 + i; // Espaço para palavras
          const delay = baseDelay + (groupIndex*250) + charIndex*step;
          const safe = c === ' ' ? '&nbsp;' : c;
          return '<span class="char" style="animation-delay:' + delay + 'ms">' + safe + '</span>';
        }).join('');
        
        // Envolver cada palavra em um span para evitar quebras
        return '<span class="word-group" style="white-space: nowrap; display: inline-block; word-break: keep-all; overflow-wrap: normal;">' + charSpans + '</span>';
      }).join('&nbsp;'); // Usar &nbsp; entre palavras para evitar quebras
      
      node.innerHTML = wordSpans;
      
      // Adicionar CSS inline adicional para garantir que não quebre
      node.style.wordBreak = 'keep-all';
      node.style.overflowWrap = 'normal';
      node.style.hyphens = 'none';
    });

    // Função adicional para forçar anti-quebra em elementos específicos
    function forceNoWordBreak() {
      // Aplicar estilos anti-quebra em elementos específicos
      const elementsToFix = [
        '.title-xl',
        '.subtitle-text', 
        '.hero-copy .subtitle',
        '.hero-copy .subtitle .animated-chars'
      ];
      
      elementsToFix.forEach(function(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          el.style.wordBreak = 'keep-all';
          el.style.overflowWrap = 'normal';
          el.style.hyphens = 'none';
        });
      });
    }
    
    // Executar imediatamente e após um delay
    forceNoWordBreak();
    setTimeout(forceNoWordBreak, 100);
    setTimeout(forceNoWordBreak, 500);

    // Sistema de Notificações - Versão Simples
    function createNotification() {
      const container = document.getElementById('testimonials-notification-center');
      if (!container) return;

      const messages = [
        "Obrigado pelo excelente trabalho! Site ficou incrível",
        "Muito obrigado! O Instagram está trazendo muitos clientes",
        "Obrigado pela dedicação! Site muito profissional",
        "Obrigado pelo atendimento! Trabalho de qualidade",
        "Muito obrigado! Site rápido e bem feito",
        "Obrigado pela parceria! Instagram está perfeito",
        "Obrigado pelo excelente serviço! Site fantástico",
        "Muito obrigado! Trabalho no Instagram impecável",
        "Obrigado pela qualidade! Site incrível",
        "Obrigado pelo profissionalismo! Instagram maravilhoso",
        "Muito obrigado! Site muito bom",
        "Obrigado pela eficiência! Instagram perfeito",
        "Obrigado pelo comprometimento! Site excelente",
        "Muito obrigado! Instagram fantástico",
        "Obrigado pela excelência! Site lindo",
        "Obrigado pelo marketing digital! Resultados incríveis",
        "Muito obrigado! Tráfego pago funcionando muito bem",
        "Obrigado pelas campanhas! Google Ads estão ótimas",
        "Obrigado pelo Facebook Ads! Muitos leads chegando",
        "Muito obrigado! Marketing de performance excelente",
        "Obrigado pelos anúncios! Convertendo muito",
        "Obrigado pelo ROI! Campanhas fantásticas",
        "Muito obrigado! Marketing digital trazendo resultados",
        "Obrigado pelo tráfego pago! Superando expectativas",
        "Obrigado pelas campanhas! Convertendo muito bem"
      ];

      const names = ["João Silva", "Maria Santos", "Carlos Costa", "Ana Lima", "Pedro Oliveira", "Julia Ferreira", "Rafael Mendes", "Bianca Souza", "Lucas Almeida", "Camila Rocha", "Diego Santos", "Fernanda Lima", "Gabriel Costa", "Larissa Oliveira", "Marcos Pereira"];
      const colors = ["#2D8CFF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

      // Mapeamento de nomes para gênero
      const genderMap = {
        "João Silva": "male",
        "Maria Santos": "female", 
        "Carlos Costa": "male",
        "Ana Lima": "female",
        "Pedro Oliveira": "male",
        "Julia Ferreira": "female",
        "Rafael Mendes": "male",
        "Bianca Souza": "female",
        "Lucas Almeida": "male",
        "Camila Rocha": "female",
        "Diego Santos": "male",
        "Fernanda Lima": "female",
        "Gabriel Costa": "male",
        "Larissa Oliveira": "female",
        "Marcos Pereira": "male"
      };

      const message = messages[Math.floor(Math.random() * messages.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const gender = genderMap[name];
      const emoji = gender === "female" ? "👩🏻" : "👨🏻";
      const color = colors[Math.floor(Math.random() * colors.length)];

      const noteDiv = document.createElement('div');
      noteDiv.className = 'note';
      noteDiv.innerHTML = '<div class="note__inner"><div class="avatar" style="background-color: ' + color + '">' + emoji + '</div><div class="note__content"><h3 class="note__title">' + name + '</h3><p class="note__message">' + message + '</p></div></div>';

      container.appendChild(noteDiv);

      // Remove notificações antigas se houver mais de 3
      const notes = container.querySelectorAll('.note');
      if (notes.length > 3) {
        const firstNote = notes[0];
        firstNote.classList.add('note--out');
        setTimeout(function() {
          if (firstNote.parentNode) {
            firstNote.remove();
          }
        }, 300);
      }
      
      // Garantir que sempre tenha exatamente 3 notificações
      const currentNotes = container.querySelectorAll('.note');
      if (currentNotes.length > 3) {
        const excessNotes = Array.from(currentNotes).slice(0, currentNotes.length - 3);
        excessNotes.forEach(function(note) {
          note.classList.add('note--out');
          setTimeout(function() {
            if (note.parentNode) {
              note.remove();
            }
          }, 100);
        });
      }
    }

    // Inicia notificações quando a seção estiver visível
    const notificationContainer = document.getElementById('testimonials-notification-center');
    if (notificationContainer) {
      let isActive = false;
      let intervalId = null;

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !isActive) {
            isActive = true;
            createNotification(); // Primeira notificação imediata
            intervalId = setInterval(createNotification, 3000);
          } else if (!entry.isIntersecting && isActive) {
            isActive = false;
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            // Limpa todas as notificações quando sair de vista
            const notes = notificationContainer.querySelectorAll('.note');
            notes.forEach(function(note) {
              note.classList.add('note--out');
              setTimeout(function() {
                if (note.parentNode) {
                  note.remove();
                }
              }, 300);
            });
          }
        });
      }, { threshold: 0.3 });

      observer.observe(notificationContainer);
    }

    // Animação do card de sites no scroll
    const parallaxCard = document.querySelector('.parallax-content');
    if (parallaxCard) {
      const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      cardObserver.observe(parallaxCard);
    }

    // Parallax leve para mobile (fallback quando background-attachment:fixed falha)
    const parallaxSection = document.querySelector('.parallax-section');
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxSection && parallaxBg) {
      const enableMobileParallax = function() { return window.innerWidth <= 768; };
      let active = false;
      let onScroll;

      const attach = function() {
        if (active) return;
        onScroll = function() {
          const rect = parallaxSection.getBoundingClientRect();
          const viewportH = window.innerHeight || document.documentElement.clientHeight;
          if (rect.bottom > 0 && rect.top < viewportH) {
            const progress = (viewportH - rect.top) / (viewportH + rect.height);
            const translate = Math.max(-30, Math.min(30, (progress - 0.5) * 60));
            parallaxBg.style.transform = 'translateY(' + translate + 'px)';
          }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        active = true;
      };

      const detach = function() {
        if (!active) return;
        window.removeEventListener('scroll', onScroll);
        parallaxBg.style.transform = '';
        active = false;
      };

      const evaluate = function() {
        if (enableMobileParallax()) attach(); else detach();
      };

      window.addEventListener('resize', evaluate);
      evaluate();
    }

    // Animação da seção de WhatsApp no scroll
    const whatsappMedia = document.querySelector('.whatsapp-media');
    const whatsappText = document.querySelector('.whatsapp-text');
    
    if (whatsappMedia && whatsappText) {
      const whatsappObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            whatsappMedia.classList.add('animate');
            whatsappText.classList.add('animate');
            whatsappObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      whatsappObserver.observe(whatsappMedia);
    }

    // Scroll to Top Arrow
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
      // Show/hide arrow based on scroll position
      window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add('visible');
        } else {
          scrollToTopBtn.classList.remove('visible');
        }
      });

      // Scroll to top functionality
      scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Sistema de Galeria de Clientes - Agora usando páginas dedicadas
    // Os botões de galeria agora são links para páginas específicas
    // Não há mais necessidade de modal, pois cada cliente tem sua própria página

    // Otimização de scroll para galeria de clientes
    let ticking = false;
    
    function optimizeScroll() {
      const galleryCards = document.querySelectorAll('.client-card');
      
      galleryCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
          card.style.willChange = 'transform';
        } else {
          card.style.willChange = 'auto';
        }
      });
      
      ticking = false;
    }
    
    function requestScrollOptimization() {
      if (!ticking) {
        requestAnimationFrame(optimizeScroll);
        ticking = true;
      }
    }
    
    // Aplicar otimização de scroll apenas na seção de clientes
    const clientsSection = document.getElementById('clientes');
    if (clientsSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            window.addEventListener('scroll', requestScrollOptimization, { passive: true });
          } else {
            window.removeEventListener('scroll', requestScrollOptimization);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(clientsSection);
    }

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

  }); // Fecha o DOMContentLoaded
})(); // Fecha a função principal


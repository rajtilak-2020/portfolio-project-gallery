document.addEventListener('DOMContentLoaded', () => {
  initializeFilter();
  initializeAnimations();
});

export function initializeFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  let isFirstLoad = true;

  async function filterProjects(category) {
    const settings = viewport.getTransitionSettings();
    const cards = Array.from(projectCards);
    
    // First, animate out cards that don't match the category
    const exitPromises = cards.map((card, index) => {
      const shouldShow = category === 'all' || card.dataset.category === category;
      if (!shouldShow) {
        return animate.fadeOutCard(card, {
          delay: index * settings.delay * 0.5,
          scale: 0.9,
          duration: settings.duration
        });
      }
      return Promise.resolve();
    });

    await Promise.all(exitPromises);

    // Then, animate in the matching cards with a stagger effect
    const enterPromises = cards.map((card, index) => {
      const shouldShow = category === 'all' || card.dataset.category === category;
      if (shouldShow) {
        card.style.display = 'block';
        return animate.fadeInCard(card, {
          delay: index * settings.delay,
          duration: settings.duration,
          direction: index % 2 === 0 ? 'left' : 'right'
        });
      }
      card.style.display = 'none';
      return Promise.resolve();
    });

    await Promise.all(enterPromises);
    isFirstLoad = false;
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProjects(button.dataset.category);
    });
  });

  // Initialize with 'all' category
  filterProjects('all');
}


export function initializeAnimations() {
  const settings = viewport.getTransitionSettings();
  
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: viewport.isMobile() ? 0.1 : 0.2,
    rootMargin: '50px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Initialize all project cards with proper animation states
  document.querySelectorAll('.project-card').forEach((card, index) => {
    // Reset any existing classes
    card.classList.remove('visible', 'hidden');
    
    // Set initial state
    card.style.transitionDuration = settings.duration;
    card.style.transitionDelay = `${index * settings.delay}ms`;
    
    // Start observing
    scrollObserver.observe(card);
  });

  // Optimize image loading
  const images = document.querySelectorAll('.project-card img');
  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });
}
export const animate = {
  fadeOutCard: (element, { delay = 0, scale = 0.9, duration = '0.3s' }) => {
    return new Promise(resolve => {
      element.style.transition = `all ${duration} var(--ease-smooth)`;
      element.style.transitionDelay = `${delay}ms`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '0';
        element.style.transform = `scale(${scale}) translateY(20px)`;
      });

      setTimeout(resolve, parseFloat(duration) * 1000 + delay);
    });
  },

  fadeInCard: (element, { delay = 0, duration = '0.3s', direction = 'left' }) => {
    return new Promise(resolve => {
      // Initial state
      const startX = direction === 'left' ? -20 : 20;
      element.style.opacity = '0';
      element.style.transform = `translateX(${startX}px) translateY(20px)`;
      
      // Trigger animation
      requestAnimationFrame(() => {
        element.style.transition = `all ${duration} var(--ease-smooth)`;
        element.style.transitionDelay = `${delay}ms`;
        element.style.opacity = '1';
        element.style.transform = 'translateX(0) translateY(0)';
      });

      setTimeout(resolve, parseFloat(duration) * 1000 + delay);
    });
  }
};
export const viewport = {
  isMobile: () => window.matchMedia('(max-width: 768px)').matches,
  isTablet: () => window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches,
  isDesktop: () => window.matchMedia('(min-width: 1025px)').matches,
  
  getTransitionSettings: () => ({
    scale: viewport.isMobile() ? 1.01 : (viewport.isTablet() ? 1.02 : 1.03),
    duration: viewport.isMobile() ? '0.2s' : '0.25s',
    delay: viewport.isMobile() ? 30 : 50,
    translateY: viewport.isMobile() ? '5px' : '10px'
  })
};
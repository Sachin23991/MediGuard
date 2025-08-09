// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    const ctaStartBtn = document.getElementById('cta-start-btn');
    if (ctaStartBtn) {
        ctaStartBtn.addEventListener('click', function() {
            createRippleEffect(this, event);
            setTimeout(() => {
                alert('Redirecting to the Medicine Checker!');
                // Here you would redirect to your actual medicine checker page
                // window.location.href = 'medicine-checker.html';
            }, 300);
        });
    }
    
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            createRippleEffect(this, event);
            document.getElementById('features').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});

function initializeApp() {
    // Initialize all components
    initPreloader();
    initNavigation();
    initScrollAnimations();
    initCounterAnimations();
    initTestimonialSlider();
   // initPricingToggle();
    initParallaxEffects();
    initTypewriterEffect();
    initFloatingElements();
    initMagneticButtons();
    initProgressBars();
    initParticleSystem();
    initSmoothScrolling();
    initLazyLoading();
}

// ===== ANIMATION 1: PRELOADER WITH MEDICAL CROSS =====
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const loadingProgress = document.querySelector('.loading-progress');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = 'visible';
                triggerEntranceAnimations();
            }, 500);
        }
        loadingProgress.style.width = progress + '%';
    }, 150);
}

// ===== ANIMATION 2: NAVIGATION WITH SMOOTH TRANSITIONS =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Smooth navbar appearance on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Auto-hide navbar on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle with animation
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate menu items
        navLinks.forEach((link, index) => {
            if (navMenu.classList.contains('active')) {
                link.style.animation = `slideInFromTop 0.5s ease-out ${index * 0.1}s both`;
            } else {
                link.style.animation = '';
            }
        });
    });
    
    // Smooth scroll to sections
    // Smooth scroll to sections (and allow external links)
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Check if the link is for an on-page section (starts with '#')
        if (href.startsWith('#')) {
            e.preventDefault(); // Prevent default only for smooth scroll links
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
        // For external links like "login.html", the code does nothing, 
        // allowing the browser to navigate normally.

        // Always close the mobile menu after a click
        if (navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});
}

// ===== ANIMATION 3: SCROLL-TRIGGERED ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('animate-on-scroll');
                
                // Add specific animation classes
                setTimeout(() => {
                    element.classList.add('animated');
                }, 100);
                
                // Unobserve after animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('[data-animation], .feature-card, .step-item, .pricing-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ===== ANIMATION 4: COUNTER ANIMATIONS =====
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const increment = target / 100;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (target > 1000) {
                            counter.textContent = (current / 1000).toFixed(1) + 'K';
                        } else {
                            counter.textContent = Math.ceil(current);
                        }
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (target > 1000) {
                            counter.textContent = (target / 1000).toFixed(1) + 'K';
                        } else if (target === 99.9) {
                            counter.textContent = target + '%';
                        } else {
                            counter.textContent = target;
                        }
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ===== ANIMATION 5: TESTIMONIAL SLIDER WITH SMOOTH TRANSITIONS =====
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    let currentSlide = 0;
    const totalSlides = testimonials.length;
    
    function showSlide(index) {
        testimonials.forEach((card, i) => {
            card.classList.remove('active', 'prev');
            if (i === index) {
                card.classList.add('active');
            } else if (i < index) {
                card.classList.add('prev');
            }
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto-advance slides
    setInterval(nextSlide, 5000);
}


function animateNumberChange(element, start, end) {
    const duration = 500;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (end - start) * easeOutQuart(progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ===== ANIMATION 7: PARALLAX EFFECTS =====
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-bg, .dna-helix, .floating-pills');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// ===== ANIMATION 8: TYPEWRITER EFFECT =====
function initTypewriterEffect() {
    const titleHighlight = document.querySelector('.title-highlight');
    
    if (titleHighlight) {
        const text = titleHighlight.textContent;
        titleHighlight.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                titleHighlight.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                titleHighlight.classList.add('typing-complete');
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
}

// ===== ANIMATION 9: FLOATING ELEMENTS =====
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.feature-icon, .step-visual, .phone-mockup');
    
    floatingElements.forEach((element, index) => {
        element.style.animation = `float 6s ease-in-out ${index * 0.5}s infinite`;
    });
    
    // Mouse movement effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            
            element.style.transform += ` translate(${x}px, ${y}px)`;
        });
    });
}

// ===== ANIMATION 10: MAGNETIC BUTTONS =====
function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.btn, .slider-btn');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transition = 'transform 0.3s ease-out';
        });
        
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
}

// ===== ANIMATION 11: PROGRESS BARS =====
function initProgressBars() {
    const progressElements = document.querySelectorAll('.loading-progress, .status-bar');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.style.animation = 'progressFill 2s ease-out forwards';
            }
        });
    });
    
    progressElements.forEach(element => {
        progressObserver.observe(element);
    });
}

// ===== ANIMATION 12: PARTICLE SYSTEM =====
function initParticleSystem() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.3
        };
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            particle.y -= particle.speed;
            particle.opacity -= 0.001;
            
            if (particle.y < -10 || particle.opacity <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
            ctx.fill();
        }
        
        if (Math.random() < 0.1) {
            particles.push(createParticle());
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    // Smooth scroll for anchor links
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
}

// ===== LAZY LOADING =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== ENTRANCE ANIMATIONS =====
function triggerEntranceAnimations() {
    const elementsToAnimate = document.querySelectorAll('.hero-content > *');
    
    elementsToAnimate.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// ===== UTILITY FUNCTIONS =====
function easeOutQuart(t) {
    return 1 - (--t) * t * t * t;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== BUTTON INTERACTIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // Get Started Button
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            // Add ripple effect
            createRippleEffect(this, event);
            
            // Simulate app redirect
            setTimeout(() => {
                alert('Redirecting to the Medicine Checker App!');
            }, 300);
        });
    }
    
    // Watch Demo Button
    const watchDemoBtn = document.getElementById('watch-demo-btn');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', function() {
            createRippleEffect(this, event);
            showDemoModal();
        });
    }
});

// ===== RIPPLE EFFECT =====
function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ===== DEMO MODAL =====
function showDemoModal() {
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Watch Demo Video</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>Demo video would be embedded here</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyles = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 800px;
            width: 90%;
            max-height: 90%;
            overflow: hidden;
            animation: slideInUp 0.3s ease-out;
        }
        
        .modal-header {
            padding: 2rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #6b7280;
        }
        
        .modal-body {
            padding: 2rem;
        }
        
        .video-placeholder {
            aspect-ratio: 16/9;
            background: #f3f4f6;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #6b7280;
        }
        
        .video-placeholder i {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
    
    // Close modal
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
            styleSheet.remove();
        }, 300);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations are handled here
}, 16)); // ~60fps

// Debounce resize events
window.addEventListener('resize', debounce(() => {
    // Resize-based recalculations
}, 250));

console.log('🚀 MediGuard Landing Page Loaded Successfully!');

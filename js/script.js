const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');
const mouseGlow = document.getElementById('mouse-glow');

// Mouse Glow Tracking
document.addEventListener('mousemove', (e) => {
    if (mouseGlow) {
        mouseGlow.style.left = e.clientX + 'px';
        mouseGlow.style.top = e.clientY + 'px';
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

// Smooth Scroll for local links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission (Actual Logic)
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        const formData = new FormData(form);
        
        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                btn.textContent = 'Message Envoyé !';
                btn.style.background = 'var(--success)';
                form.reset();
            } else {
                throw new Error('Erreur de réponse');
            }
        } catch (error) {
            btn.textContent = 'Erreur lors de l\'envoi';
            btn.style.background = '#e74c3c'; // Red for error
            console.error('Submission error:', error);
        } finally {
            btn.disabled = false;
            btn.style.opacity = '1';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'var(--accent)';
            }, 3000);
        }
    });
}


// Hero section parallax
window.addEventListener('scroll', () => {
    const heroContent = document.querySelector('.hero-content');
    const heroImg = document.querySelector('.profile-img-container');
    
    if (heroContent) {
        let scrollValue = window.scrollY;
        heroContent.style.transform = `translateY(${scrollValue * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrollValue / 700);
    }
    
    if (heroImg) {
        let scrollValue = window.scrollY;
        heroImg.style.transform = `translateY(${scrollValue * 0.15}px) rotate(${scrollValue * 0.02}deg)`;
    }
});

// Project Slider Logic
function initSliders() {
    const sliders = document.querySelectorAll('.project-slider');
    
    sliders.forEach(slider => {
        const container = slider.querySelector('.slider-container');
        const slides = slider.querySelectorAll('.slider-slide');
        const dots = slider.querySelectorAll('.slider-dot');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        
        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSlider() {
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update dots
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = parseInt(dot.dataset.index);
                updateSlider();
            });
        });

        // Prevent project card click when clicking slider controls
        slider.addEventListener('click', (e) => {
            if (e.target !== slider) {
                // Keep the card click if it's meant to open something else later
            }
        });
    });
}

// Lightbox Logic
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const projectImages = document.querySelectorAll('.project-card img');

    projectImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Visitor Counter Logic
async function updateVisitorCount() {
    const counterElement = document.getElementById('visitor-count');
    const container = document.getElementById('visitor-container');
    if (!counterElement || !container) return;

    // 1. Check for activation via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        localStorage.setItem('portfolio_isAdmin', 'true');
        alert("Mode Administrateur activé ! Vos visites sur cet appareil ne seront plus comptabilisées.");
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    const isAdmin = localStorage.getItem('portfolio_isAdmin') === 'true';

    try {
        let count;
        const baseUrl = 'https://api.counterapi.dev/v1/seblechti974-beep/portfolio-visitors';

        if (isAdmin) {
            // Admin workaround for V1: Increment then immediately decrement to get the count without changing it
            // This bypasses the lack of a read-only endpoint in V1 and potential CORS issues on the base URL
            await fetch(`${baseUrl}/up`);
            const response = await fetch(`${baseUrl}/down`);
            const data = await response.json();
            count = data.count;
        } else {
            // Normal visitor: just increment
            const response = await fetch(`${baseUrl}/up`);
            const data = await response.json();
            count = data.count;
        }
        
        if (count !== undefined) {
            counterElement.textContent = count.toLocaleString();
            container.classList.add('visible');
            
            if (isAdmin) {
                counterElement.style.color = '#00ffcc';
                counterElement.style.fontWeight = 'bold';
                if (!document.getElementById('admin-badge')) {
                    const badge = document.createElement('span');
                    badge.id = 'admin-badge';
                    badge.textContent = ' (Admin)';
                    badge.style.fontSize = '0.7em';
                    badge.style.color = 'var(--accent)';
                    badge.style.marginLeft = '5px';
                    counterElement.parentNode.appendChild(badge);
                }
                container.title = "Vos visites ne sont plus comptabilisées.";
            }
        }
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        // Show something even if it fails for the admin
        if (isAdmin) {
            counterElement.textContent = "---";
            container.classList.add('visible');
            const badge = document.createElement('span');
            badge.textContent = ' (Mode Admin Activé)';
            badge.style.fontSize = '0.7em';
            badge.style.color = 'var(--accent)';
            counterElement.parentNode.appendChild(badge);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    initLightbox();
    updateVisitorCount();
});

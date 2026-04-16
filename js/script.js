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
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentGallery = [];
    let currentIndex = 0;

    function updateLightbox() {
        if (currentGallery[currentIndex]) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = currentGallery[currentIndex].src;
                lightboxImg.style.opacity = '1';
            }, 200);
        }
    }

    const allImages = document.querySelectorAll('.project-card img');
    allImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const card = img.closest('.project-card');
            currentGallery = Array.from(card.querySelectorAll('img'));
            currentIndex = currentGallery.indexOf(img);
            
            lightboxImg.src = img.src;
            lightboxImg.style.opacity = '1';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (currentGallery.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGallery.length > 1) {
                currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
                updateLightbox();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentGallery.length > 1) {
                currentIndex = (currentIndex + 1) % currentGallery.length;
                updateLightbox();
            }
        });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'ArrowLeft' && currentGallery.length > 1) prevBtn.click();
        if (e.key === 'ArrowRight' && currentGallery.length > 1) nextBtn.click();
        if (e.key === 'Escape') closeBtn.click();
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
    const labelElement = container ? container.querySelector('span') : null;
    
    if (!counterElement || !container) return;

    // 1. Forced Activation via URL
    if (window.location.search.includes('admin=true')) {
        localStorage.setItem('portfolio_isAdmin', 'true');
        alert("MODE ADMINISTRATEUR ACTIVÉ : Vos visites ne seront plus comptées sur ce navigateur.");
        // Nettoyage de l'URL sans recharger
        const freshUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, freshUrl);
    }

    const isAdmin = localStorage.getItem('portfolio_isAdmin') === 'true';
    const baseUrl = 'https://api.counterapi.dev/v1/seblechti974-beep/portfolio-visitors';

    if (isAdmin) {
        console.log("Portfolio: Admin Mode Active");
        if (labelElement) labelElement.textContent = "Visites (Admin) : ";
        counterElement.style.color = "#00ffcc";
        counterElement.style.fontWeight = "bold";
    }

    try {
        let count;
        if (isAdmin) {
            // Pour l'admin, on tente de lire sans incrémenter. 
            // Si le GET échoue (CORS v1), on affiche quand même le compteur mais sans changer le serveur.
            try {
                // Workaround: On fait un UP puis un DOWN pour lire la valeur sans la changer
                // C'est le moyen le plus sûr en V1 pour contourner les limites de lecture seule
                await fetch(`${baseUrl}/up`);
                const response = await fetch(`${baseUrl}/down`);
                const data = await response.json();
                count = data.count;
            } catch (e) {
                console.warn("Erreur workaround admin, tentative lecture simple...");
                const response = await fetch(baseUrl);
                const data = await response.json();
                count = data.count;
            }
        } else {
            // Visiteur normal : incrémentation classique
            const response = await fetch(`${baseUrl}/up`);
            const data = await response.json();
            count = data.count;
        }

        if (count !== undefined) {
            counterElement.textContent = count.toLocaleString();
            container.classList.add('visible');
        }
    } catch (error) {
        console.error('Visitor Counter Error:', error);
        // En cas d'erreur API, on montre quand même le compteur avec un état "chargé" pour l'admin
        if (isAdmin) {
            counterElement.textContent = "Connecté";
            container.classList.add('visible');
        } else {
            container.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    initLightbox();
    updateVisitorCount();
});

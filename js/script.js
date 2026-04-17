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

// Lightbox / Viewer.js Logic
function initLightbox() {
    const sliders = document.querySelectorAll('.project-card');
    
    sliders.forEach(card => {
        const sliderContainer = card.querySelector('.slider-container');
        if (sliderContainer) {
            // Initialisation de Viewer.js
            const viewer = new Viewer(sliderContainer, {
                button: true,
                navbar: true,
                title: true, // Montre l'attribut alt de l'image
                toolbar: {
                    zoomIn: 1,
                    zoomOut: 1,
                    oneToOne: 1,
                    reset: 1,
                    prev: 1,
                    play: {
                        show: 1,
                        size: 'large',
                    },
                    next: 1,
                    rotateLeft: 1,
                    rotateRight: 1,
                    flipHorizontal: 1,
                    flipVertical: 1,
                },
                tooltip: true,
                movable: true,
                zoomable: true,
                rotatable: true,
                scalable: true,
                transition: true,
                fullscreen: true,
                keyboard: true,
            });

            // Action du bouton "Appuyer pour agrandir"
            const expandHint = card.querySelector('.expand-hint');
            if (expandHint) {
                expandHint.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const activeDot = card.querySelector('.slider-dot.active');
                    if (activeDot) {
                        const idx = parseInt(activeDot.dataset.index);
                        const allSlides = sliderContainer.querySelectorAll('.slider-slide');
                        
                        if (allSlides[idx]) {
                            const modelViewer = allSlides[idx].querySelector('model-viewer');
                            const img = allSlides[idx].querySelector('img');
                            
                            if (modelViewer) {
                                // Stocker le parent et créer un emplacement temporaire
                                const parentNode = modelViewer.parentNode;
                                const placeholder = document.createElement('div');
                                placeholder.style.width = '100%';
                                placeholder.style.height = '100%';
                                placeholder.style.backgroundColor = '#e5e5e5';
                                placeholder.style.borderRadius = '8px';
                                parentNode.insertBefore(placeholder, modelViewer);
                                
                                // Déplacer temporairement le model-viewer dans le body pour éviter le clipping (identique au Viewer.js)
                                document.body.appendChild(modelViewer);
                                
                                // Plein écran CSS personnalisé
                                modelViewer.style.position = 'fixed';
                                modelViewer.style.top = '0';
                                modelViewer.style.left = '0';
                                modelViewer.style.width = '100vw';
                                modelViewer.style.height = '100vh';
                                modelViewer.style.zIndex = '999999';
                                modelViewer.style.borderRadius = '0';
                                modelViewer.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
                                document.body.style.overflow = 'hidden';
                                
                                // Bouton "Fermer"
                                const closeBtn = document.createElement('div');
                                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                                closeBtn.style.position = 'fixed';
                                closeBtn.style.top = '20px';
                                closeBtn.style.right = '20px';
                                closeBtn.style.zIndex = '9999999';
                                closeBtn.style.color = 'white';
                                closeBtn.style.fontSize = '24px';
                                closeBtn.style.cursor = 'pointer';
                                closeBtn.style.background = 'rgba(0,0,0,0.6)';
                                closeBtn.style.width = '50px';
                                closeBtn.style.height = '50px';
                                closeBtn.style.display = 'flex';
                                closeBtn.style.alignItems = 'center';
                                closeBtn.style.justifyContent = 'center';
                                closeBtn.style.borderRadius = '50%';
                                closeBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
                                
                                document.body.appendChild(closeBtn);
                                
                                closeBtn.addEventListener('click', () => {
                                    // Remettre le modèle à sa place initiale
                                    parentNode.insertBefore(modelViewer, placeholder);
                                    placeholder.remove();
                                    
                                    modelViewer.style.position = '';
                                    modelViewer.style.top = '';
                                    modelViewer.style.left = '';
                                    modelViewer.style.width = '100%';
                                    modelViewer.style.height = '100%';
                                    modelViewer.style.zIndex = '';
                                    modelViewer.style.borderRadius = '8px';
                                    modelViewer.style.backgroundColor = '#e5e5e5';
                                    document.body.style.overflow = 'auto';
                                    closeBtn.remove();
                                });
                                
                            } else if (img) {
                                // Lancer Viewer.js pour les images
                                img.click();
                            }
                        }
                    }
                });
            }
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

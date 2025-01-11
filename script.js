document.addEventListener('DOMContentLoaded', () => {
    initAngryBird();
    initSmoothScrolling();
    initTypedText();
    initHeaderScrollEffect();
    initThemeToggle();
    initCustomCursor();
    initScrollUpButton();
    initLazyLoading();
    initEmailJS();
});

function initEmailJS() {
    (function() {
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded');
            return;
        }

        emailjs.init("IQujbyKGZzEAZUJko");
        
        const contactForm = document.getElementById('contactForm');
        
        if (!contactForm) {
            console.error('Contact form not found');
            return;
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submitBtn');
            const originalText = submitBtn.textContent;
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            if (!nameInput || !emailInput || !messageInput) {
                console.error('Form fields not found');
                return;
            }

            try {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                const templateParams = {
                    from_name: nameInput.value,
                    from_email: emailInput.value,
                    message: messageInput.value,
                    to_name: 'Mann Mehta',
                    reply_to: emailInput.value
                };

                const response = await emailjs.send(
                    'service_ypjbvke', 
                    'template_fw3r6ip', 
                    templateParams, 
                    'IQujbyKGZzEAZUJko'
                );

                if (response.status === 200) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send email');
                }
            } catch (error) {
                console.error('EmailJS error:', error);
                alert('Oops! Something went wrong. Please try again later.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    })();
}


function initAngryBird() {
    const angryBird = document.querySelector('.angry-bird');
    const eyes = document.querySelectorAll('.bird-eye .pupil');
    const beak = document.querySelector('.beak');
    const leftEyebrow = document.querySelector('.left-eyebrow');
    const rightEyebrow = document.querySelector('.right-eyebrow');

    document.addEventListener('mousemove', (e) => {
        eyes.forEach(eye => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const distance = Math.min(rect.width / 3, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 8);
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            eye.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    angryBird.addEventListener('mousedown', () => {
        angryBird.style.transform = 'scale(0.95)';
        beak.style.borderBottomColor = '#FF6347';
        leftEyebrow.style.transform = 'translateY(10px)';
        rightEyebrow.style.transform = 'translateY(10px)';
    });

    angryBird.addEventListener('mouseup', () => {
        angryBird.style.transform = 'scale(1)';
        beak.style.borderBottomColor = '#FFD700';
        setTimeout(() => {
            leftEyebrow.style.transform = 'none';
            rightEyebrow.style.transform = 'none';
        }, 100);
    });

    angryBird.addEventListener('mouseover', () => {
        angryBird.style.filter = 'brightness(1.1)';
    });

    angryBird.addEventListener('mouseout', () => {
        angryBird.style.filter = 'brightness(1)';
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function initTypedText() {
    const typedTextElement = document.querySelector('.typed-text');
    const textArray = ["Full Stack Developer", "Software Engineer", "Problem Solver"];
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextElement.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 1000);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typedTextElement.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, 500);
        }
    }

    setTimeout(type, 1000);
}

function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (window.innerWidth <= 768) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
        } else {
            // For larger screens, just add/remove the 'scrolled' class
            header.classList.toggle('scrolled', scrollTop > 0);
        }

        lastScrollTop = scrollTop;
    });
}

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const icon = themeToggleBtn.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}

function initCustomCursor() {
    if (window.matchMedia("(min-width: 768px)").matches) {
        const cursorDot = document.createElement('div');
        const cursorOutline = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        cursorOutline.className = 'cursor-outline';
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorDot.style.opacity = '1';
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: 'forwards' });
            cursorOutline.style.opacity = '1';
        });

        window.addEventListener('mouseout', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });
    }
}

function initScrollUpButton() {
    const scrollUpBtn = document.createElement('button');
    scrollUpBtn.id = 'scrollUpBtn';
    scrollUpBtn.innerHTML = '↑';
    scrollUpBtn.title = 'Scroll to top';
    document.body.appendChild(scrollUpBtn);

    function toggleScrollUpBtn() {
        if (window.innerWidth <= 768) {
            if (window.scrollY > window.innerHeight / 2) {
                scrollUpBtn.classList.add('show');
            } else {
                scrollUpBtn.classList.remove('show');
            }
        } else {
            scrollUpBtn.classList.remove('show');
        }
    }

    window.addEventListener('scroll', toggleScrollUpBtn);
    window.addEventListener('resize', toggleScrollUpBtn);

    scrollUpBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    let observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                preloadImage(entry.target);
                self.unobserve(entry.target);
            }
        });
    }, config);

    images.forEach(image => {
        observer.observe(image);
    });
}

function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) { return; }
    img.src = src;
}

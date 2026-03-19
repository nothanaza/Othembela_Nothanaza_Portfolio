// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Navigation Links
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

// Navbar Background on Scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
    }
});

// Animate Skills Progress Bars on Scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            skillsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const skillsSection = document.getElementById('skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Scroll Animation for Elements
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            scrollObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Add animation class to sections
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.classList.add('animate-on-scroll');
    scrollObserver.observe(section);
});

// Contact Form Handling
// Configuration: enable EmailJS and fill the IDs if you want client-side sending without opening user's mail client.
// Create an account at https://www.emailjs.com/, create an email service and a template, then set EMAILJS_ENABLED = true
// and fill EMAILJS_USER_ID, EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID below.
const EMAILJS_ENABLED = true; // set to true after filling IDs
const EMAILJS_USER_ID = 'user_7xiku28'; // e.g. 'user_xxx'
const EMAILJS_SERVICE_ID = 'service_9x9p6fi'; // e.g. 'service_xxx'
const EMAILJS_TEMPLATE_ID = 'template_7xiku28'; // e.g. 'template_xxx'

// Initialize EmailJS if available
if (window.emailjs && EMAILJS_ENABLED && EMAILJS_USER_ID) {
    try { emailjs.init(EMAILJS_USER_ID); } catch (err) { /* ignore init errors until configured */ }
}

const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim() || 'Portfolio Inquiry';
    const message = document.getElementById('message').value.trim();

    // Prefer EmailJS when configured
    if (EMAILJS_ENABLED && window.emailjs && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        const templateParams = {
            from_name: name || 'Website visitor',
            from_email: email || '',
            subject: subject,
            message: message || ''
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            alert('Message sent — thank you!');
            contactForm.reset();
            return;
        } catch (err) {
            console.error('EmailJS send error:', err);
            alert('Failed to send via EmailJS. Falling back to opening your email client.');
            // fallthrough to mailto fallback
        }
    }

    // Mailto fallback (opens user's mail client)
    const to = 'nothanazao@gmail.com';
    const bodyLines = [];
    if (name) bodyLines.push(`Name: ${name}`);
    if (email) bodyLines.push(`Reply-to: ${email}`);
    if (message) bodyLines.push('', 'Message:', message);
    const body = bodyLines.join('\n');
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    setTimeout(() => {
        alert('Your email client should open shortly. If it did not, please email nothanazao@gmail.com directly.');
        contactForm.reset();
    }, 500);
});
    // If you want to use PHP for form handling, you would do something like:
    // fetch('contact.php', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     alert(data.message);
    //     contactForm.reset();
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert('An error occurred. Please try again.');
    // });

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
// ============================================================
// COFFETTO - Main JavaScript
// ============================================================

// ============ MOBILE NAVIGATION ============
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
let navOverlay = null;

function createNavOverlay() {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);
}
createNavOverlay();

function openNav() {
    navMenu.classList.add('active');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeNav() {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

navToggle.addEventListener('click', openNav);
navClose.addEventListener('click', closeNav);
navOverlay.addEventListener('click', closeNav);

navLinks.forEach(link => {
    link.addEventListener('click', closeNav);
});

// ============ HEADER SCROLL EFFECT ============
const header = document.getElementById('header');

function handleHeaderScroll() {
    if (window.scrollY >= 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

// ============ ACTIVE LINK HIGHLIGHTING ============
const sections = document.querySelectorAll('section[id]');

function highlightActiveLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active-link');
            } else {
                navLink.classList.remove('active-link');
            }
        }
    });
}

window.addEventListener('scroll', highlightActiveLink);

// ============ SCROLL TO TOP ============
const scrollUp = document.getElementById('scroll-up');

function handleScrollUp() {
    if (window.scrollY >= 400) {
        scrollUp.classList.add('show');
    } else {
        scrollUp.classList.remove('show');
    }
}

window.addEventListener('scroll', handleScrollUp);

// ============ TOAST NOTIFICATIONS ============
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
        success: 'ri-check-line',
        error: 'ri-error-warning-line',
        info: 'ri-information-line'
    };

    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ SEARCH ============
const searchEl = document.getElementById('search');
const searchButton = document.getElementById('search-button');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.querySelectorAll('.search__suggestion');

function openSearch() {
    searchEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 300);
}

function closeSearch() {
    searchEl.classList.remove('active');
    document.body.style.overflow = '';
    searchInput.value = '';
}

searchButton.addEventListener('click', openSearch);
searchClose.addEventListener('click', closeSearch);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSearch();
        closeCart();
    }
});

searchSuggestions.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        searchInput.value = suggestion.dataset.term;
        showToast(`Searching for "${suggestion.dataset.term}"...`, 'info');
        setTimeout(closeSearch, 500);
    });
});

// ============ CART ============
const cartEl = document.getElementById('cart');
const cartButton = document.getElementById('cart-button');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartFooter = document.getElementById('cart-footer');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');

let cart = JSON.parse(localStorage.getItem('coffetto-cart')) || [];

function openCart() {
    cartEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartEl.classList.remove('active');
    document.body.style.overflow = '';
}

cartButton.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);

function saveCart() {
    localStorage.setItem('coffetto-cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('show', totalItems > 0);

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.textContent = `₹${total.toFixed(2)}`;

    // Update items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart__empty">Your cart is empty</p>';
        cartFooter.style.display = 'none';
    } else {
        cartFooter.style.display = 'block';
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart__item">
                <img src="${item.img}" alt="${item.name}" class="cart__item-img">
                <div class="cart__item-info">
                    <h4 class="cart__item-name">${item.name}</h4>
                    <span class="cart__item-price">₹${item.price.toFixed(2)}</span>
                    <div class="cart__item-controls">
                        <button class="cart__item-btn" onclick="updateQty(${index}, -1)">
                            <i class="ri-subtract-line"></i>
                        </button>
                        <span class="cart__item-qty">${item.qty}</span>
                        <button class="cart__item-btn" onclick="updateQty(${index}, 1)">
                            <i class="ri-add-line"></i>
                        </button>
                    </div>
                </div>
                <button class="cart__item-remove" onclick="removeItem(${index})">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `).join('');
    }

    saveCart();
}

function addToCart(name, price, img) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price: parseFloat(price), img, qty: 1 });
    }

    updateCartUI();
    showToast(`${name} added to cart!`, 'success');
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function removeItem(index) {
    const name = cart[index].name;
    cart.splice(index, 1);
    updateCartUI();
    showToast(`${name} removed from cart`, 'info');
}

function clearCart() {
    cart = [];
    updateCartUI();
    showToast('Cart cleared', 'info');
}

clearCartBtn.addEventListener('click', clearCart);

checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        showToast(`Order placed! Total: ₹${total.toFixed(2)}`, 'success');
        cart = [];
        updateCartUI();
        setTimeout(closeCart, 1000);
    }
});

// Add to cart buttons
document.querySelectorAll('.product-card__add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const { name, price, img } = btn.dataset;
        addToCart(name, price, img);
    });
});

// Initialize cart UI
updateCartUI();

// ============ PRODUCT FILTERING ============
const filterButtons = document.querySelectorAll('.products__filter');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active-filter'));
        button.classList.add('active-filter');

        const filter = button.dataset.filter;

        productCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn .4s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Add fadeIn keyframe
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ============ GALLERY LIGHTBOX ============
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const galleryItems = document.querySelectorAll('.gallery__item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('.gallery__img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// ============ SWIPER TESTIMONIALS ============
const swiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

// ============ CONTACT FORM ============
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Simulate form submission
    const submitBtn = contactForm.querySelector('.form__submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showToast(`Thanks ${name}! We'll get back to you soon.`, 'success');
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
});

// ============ NEWSLETTER FORM ============
const newsletterForm = document.getElementById('newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = newsletterForm.querySelector('input').value.trim();

    if (!email) {
        showToast('Please enter your email', 'error');
        return;
    }

    showToast('Welcome to the Coffetto family!', 'success');
    newsletterForm.reset();
});

// ============ SCROLL REVEAL ANIMATION ============
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '40px',
    duration: 1000,
    delay: 100,
    reset: false,
});

// Home
sr.reveal('.home__subtitle', { delay: 200 });
sr.reveal('.home__title', { delay: 300 });
sr.reveal('.home__description', { delay: 400 });
sr.reveal('.home__buttons', { delay: 500 });
sr.reveal('.home__stats', { delay: 600 });
sr.reveal('.home__visual', { origin: 'right', delay: 400 });

// About
sr.reveal('.about__header');
sr.reveal('.about__img-wrap', { origin: 'left', delay: 200 });
sr.reveal('.about__feature', { interval: 150 });

// Products
sr.reveal('.products__header');
sr.reveal('.products__filters', { delay: 200 });
sr.reveal('.product-card', { interval: 100 });

// Process
sr.reveal('.process__header');
sr.reveal('.process__step', { interval: 150 });

// Testimonials
sr.reveal('.testimonials__header');

// Gallery
sr.reveal('.gallery__header');
sr.reveal('.gallery__item', { interval: 100 });

// Contact
sr.reveal('.contact__info', { origin: 'left' });
sr.reveal('.contact__form-wrap', { origin: 'right' });

// Newsletter
sr.reveal('.newsletter__content', { interval: 200 });

// Footer
sr.reveal('.footer__brand', { delay: 100 });
sr.reveal('.footer__links', { delay: 200 });
sr.reveal('.footer__contact', { delay: 300 });

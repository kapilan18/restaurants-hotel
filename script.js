// ===== Gold Restaurant - JavaScript Functionality =====

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupMenuFilters();
    setupCheckoutForm();
    setupContactForm();
    animateOnScroll();
});

// ===== Enhanced Shopping Cart with Sidebar =====
let cartItems = [];

function addToCart(itemName, price) {
    cartItems.push({ name: itemName, price: price });
    updateCartDisplay();
    
    // Show success message
    showNotification(`${itemName} added to cart! 🎉`, 'success');
    
    // Auto-open cart sidebar
    openCart();
}

function removeFromCart(index) {
    const itemName = cartItems[index].name;
    cartItems.splice(index, 1);
    updateCartDisplay();
    showNotification(`${itemName} removed from cart`, 'info');
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartBadge = document.getElementById('cartBadge');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartDelivery = document.getElementById('cartDelivery');
    const cartTotal = document.getElementById('cartTotal');

    if (cartItems.length === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <small>Add items to get started</small>
            </div>
        `;
        cartBadge.style.display = 'none';
        cartSubtotal.textContent = '₹0';
        cartDelivery.textContent = '₹0';
        cartTotal.textContent = '₹0';
        return;
    }

    // Show badge with item count
    cartBadge.textContent = cartItems.length;
    cartBadge.style.display = 'flex';

    // Build cart items HTML
    let cartHTML = '';
    let subtotal = 0;

    cartItems.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <button type="button" class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            </div>
        `;
        subtotal += item.price;
    });

    cartItemsList.innerHTML = cartHTML;

    // Calculate totals
    const deliveryCharge = 50;
    const total = subtotal + deliveryCharge;

    cartSubtotal.textContent = '₹' + subtotal;
    cartDelivery.textContent = '₹' + deliveryCharge;
    cartTotal.textContent = '₹' + total;
}

function initializeCart() {
    updateCartDisplay();
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.add('active');
    overlay.classList.add('active');
}

function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ===== Checkout Modal Functions =====
function openCheckout() {
    if (cartItems.length === 0) {
        showNotification('Please add items to your cart first', 'error');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    closeCart();
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
}

function toggleDeliveryAddress() {
    const orderType = document.getElementById('checkoutOrderType').value;
    const addressGroup = document.getElementById('deliveryAddressGroup');
    
    if (orderType === 'Delivery') {
        addressGroup.style.display = 'block';
    } else {
        addressGroup.style.display = 'none';
    }
}

// ===== Checkout Form Handling =====
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', submitCheckout);
    }
}

function submitCheckout(e) {
    e.preventDefault();

    if (cartItems.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const name = document.getElementById('checkoutName').value;
    const email = document.getElementById('checkoutEmail').value;
    const phone = document.getElementById('checkoutPhone').value;
    const orderType = document.getElementById('checkoutOrderType').value;
    const address = document.getElementById('checkoutAddress').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const requests = document.getElementById('checkoutRequests').value;

    // Validate required fields
    if (!name || !email || !phone || !orderType || !paymentMethod) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate delivery address if Delivery is selected
    if (orderType === 'Delivery' && !address) {
        showNotification('Please enter your delivery address', 'error');
        return;
    }

    // Validate email and phone
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (!isValidPhone(phone)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const deliveryCharge = 50;
    const total = subtotal + deliveryCharge;

    // Prepare order data
    const orderData = {
        name: name,
        email: email,
        phone: phone,
        orderType: orderType,
        address: address,
        paymentMethod: paymentMethod,
        specialRequests: requests,
        items: cartItems,
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        total: total,
        timestamp: new Date().toISOString(),
        orderId: 'ORD-' + Date.now()
    };

    // Store order in localStorage
    let orders = JSON.parse(localStorage.getItem('koodooOrders')) || [];
    orders.push(orderData);
    localStorage.setItem('koodooOrders', JSON.stringify(orders));

    // Show success message with order details
    showNotification(
        `✅ Order Confirmed!\nOrder ID: ${orderData.orderId}\nTotal: ₹${total}\n\nThank you for ordering! We'll contact you shortly.`,
        'success'
    );

    // Clear form and cart
    document.getElementById('checkoutForm').reset();
    cartItems = [];
    updateCartDisplay();
    closeCheckout();

    // Log to console
    console.log('Order placed:', orderData);

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// ===== Menu Filters =====
function setupMenuFilters() {
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const menuCategories = document.querySelectorAll('.menu-category');

    categoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const selectedCategory = this.value;

            menuCategories.forEach(category => {
                const categoryData = category.getAttribute('data-category');
                
                if (selectedCategory === 'all') {
                    category.style.display = 'block';
                } else if (categoryData === selectedCategory) {
                    category.style.display = 'block';
                } else {
                    category.style.display = 'none';
                }
            });
        });
    });
}

// ===== Contact Form Handling =====
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Validate form
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Validate email
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Prepare message data
            const messageData = {
                name: name,
                email: email,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString()
            };

            // Store message in localStorage
            let messages = JSON.parse(localStorage.getItem('koodooMessages')) || [];
            messages.push(messageData);
            localStorage.setItem('koodooMessages', JSON.stringify(messages));

            // Show success message
            showNotification('Thank you! We have received your message. We will get back to you soon.', 'success');

            // Clear form
            contactForm.reset();

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.toast-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notificationDiv = document.createElement('div');
    notificationDiv.className = `alert alert-${type} toast-notification`;
    notificationDiv.setAttribute('role', 'alert');
    notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        min-width: 300px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease-out;
        border-radius: 8px;
        padding: 16px;
        max-width: 400px;
    `;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ';
    const messageHTML = message.replace(/\n/g, '<br>');
    notificationDiv.innerHTML = `
        <strong>${icon}</strong> ${messageHTML}
    `;

    document.body.appendChild(notificationDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notificationDiv.remove();
    }, 5000);
}

// ===== Validation Functions =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ===== Animate on Scroll =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.card, .menu-card, .gallery-item, .service-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        observer.observe(element);
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// ===== Set Minimum Date to Today =====
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

// ===== Active Navigation Link =====
document.addEventListener('DOMContentLoaded', function() {
    const currentLocation = location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation || href === location.pathname.split('/').pop()) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// ===== Close checkout modal when clicking outside =====
document.addEventListener('click', function(e) {
    const modal = document.getElementById('checkoutModal');
    const checkoutContent = document.querySelector('.checkout-content');
    
    if (modal && e.target === modal) {
        closeCheckout();
    }
});

// ===== Dynamically Add Bootstrap Styles for Alerts =====
const style = document.createElement('style');
style.textContent = `
    .alert-success {
        background-color: #d4edda;
        color: #155724;
        border-color: #c3e6cb;
    }
    .alert-error {
        background-color: #f8d7da;
        color: #721c24;
        border-color: #f5c6cb;
    }
    .alert-info {
        background-color: #d1ecf1;
        color: #0c5460;
        border-color: #bee5eb;
    }
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== Console Welcome Message =====
console.log('%cWelcome to Koodoo Restaurant!', 'font-size: 20px; color: #dc3545; font-weight: bold;');
console.log('%cOrder online at: https://koodoorestaurant.com', 'font-size: 14px; color: #666;');
console.log('%cPhone: 091594 224449', 'font-size: 14px; color: #666;');

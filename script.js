// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = count;
    });
}

function addToCart(productId, name, price, image, size = '', color = '') {
    const existingItem = cart.find(item => 
        item.id === productId && item.size === size && item.color === color
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name,
            price,
            image,
            size,
            color,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function renderCartItems() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    cartContainer.innerHTML = cart.map((item, index) => `
        <div class="p-4 border-b">
            <div class="flex items-center">
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500 mr-4">
                    <i class="fas fa-times"></i>
                </button>
                <div class="h-20 w-20 bg-gray-200 rounded overflow-hidden mr-4">
                    <img src="${item.image}" alt="${item.name}" class="h-full w-full object-cover">
                </div>
                <div class="flex-1">
                    <h3 class="font-medium">${item.name}</h3>
                    ${item.size ? `<p class="text-sm text-gray-500">Size: ${item.size}</p>` : ''}
                    ${item.color ? `<p class="text-sm text-gray-500">Color: ${item.color}</p>` : ''}
                    <p class="text-sm font-medium">₹${item.price.toLocaleString()}</p>
                </div>
                <div class="flex items-center">
                    <button onclick="updateQuantity(${index}, -1)" class="h-8 w-8 border rounded-l flex items-center justify-center">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                        onchange="updateQuantity(${index}, 0, this.value)" 
                        class="h-8 w-12 border-t border-b text-center">
                    <button onclick="updateQuantity(${index}, 1)" class="h-8 w-8 border rounded-r flex items-center justify-center">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="ml-4 font-medium">
                    ₹${(item.price * item.quantity).toLocaleString()}
                </div>
            </div>
        </div>
    `).join('');

    updateCartTotal();
}

function updateQuantity(index, change, newValue) {
    if (newValue !== undefined) {
        cart[index].quantity = parseInt(newValue) || 1;
    } else {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

function updateCartTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 99;
    const tax = subtotal * 0.12;
    const discount = subtotal > 3000 ? 500 : 0;
    const total = subtotal + shipping + tax - discount;

    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('shipping').textContent = `₹${shipping.toLocaleString()}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('discount').textContent = `-₹${discount.toLocaleString()}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('animate-fade-in');
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500');
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }

        if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value)) {
            input.classList.add('border-red-500');
            isValid = false;
        }
    });

    return isValid;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    renderCartItems();

    // Add event listeners for all "Add to Cart" buttons
    document.querySelectorAll('[data-add-to-cart]').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const image = this.dataset.image;
            const size = this.dataset.size || '';
            const color = this.dataset.color || '';
            addToCart(productId, name, price, image, size, color);
        });
    });

    // Form submission handlers
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this.id)) {
                e.preventDefault();
                showNotification('Please fill all required fields correctly');
            }
        });
    });
});

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-fade-out {
        animation: fadeOut 0.3s ease-out forwards;
    }
`;
document.head.appendChild(style);
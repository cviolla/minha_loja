// Catalyst Script - Interactive Systems

// Product Database (60 items)
const products = Array.from({ length: 60 }, (_, i) => {
    const id = i + 1;
    const categories = ['NEURAL_TECH', 'BIO_ENGINE'];
    const category = categories[i % categories.length];

    const price = (29.90 + (Math.sin(i) * 20)).toFixed(2);

    return {
        id: `PROD_${id.toString().padStart(3, '0')}`,
        name: `Catalyst_${category}_${id}`,
        category: category,
        description: `Módulo operacional de alta performance versão ${id}.0. Otimizado para estabilidade sensorial e integração neural completa.`,
        price: price,
        img: `https://picsum.photos/seed/${id + 100}/800/800`
    };
});

let cart = [];
let currentFilter = 'all';
let currentProduct = null;
let currentQty = 1;

/**
 * Initialize Category Tabs
 */
function initCategories() {
    const filterContainer = document.getElementById('category-filters');
    const categories = [...new Set(products.map(p => p.category))];

    categories.forEach(cat => {
        const tab = document.createElement('div');
        tab.className = 'category-tab';
        tab.innerText = cat;
        tab.setAttribute('data-filter', cat);
        tab.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter products
            currentFilter = cat;
            renderProducts();
        });
        filterContainer.appendChild(tab);
    });

    // Special listener for "All/Tudo"
    const allTab = filterContainer.querySelector('[data-filter="all"]');
    allTab.addEventListener('click', () => {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        allTab.classList.add('active');
        currentFilter = 'all';
        renderProducts();
    });
}

/**
 * Render products to grid
 */
function renderProducts(term = '') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = products.filter(product => {
        const matchFilter = currentFilter === 'all' || product.category === currentFilter;
        const matchSearch = product.name.toLowerCase().includes(term.toLowerCase()) ||
            product.category.toLowerCase().includes(term.toLowerCase()) ||
            product.description.toLowerCase().includes(term.toLowerCase());
        return matchFilter && matchSearch;
    });

    grid.innerHTML = filtered.map(product => `
        <div class="menu-item" data-category="${product.category}" onclick="openProductDetail('${product.id}')">
            <span class="item-category">${product.category}</span>
            <div class="menu-img-wrapper scan-effect">
                <img src="${product.img}" alt="${product.name}" class="menu-img" loading="lazy">
            </div>
            <div class="menu-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="menu-footer">
                    <div class="price"><span>R$</span> ${product.price}</div>
                    <button class="add-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Update count labels
    const totalCountLabel = document.querySelector('.section-header div');
    if (totalCountLabel) {
        totalCountLabel.innerText = `TOTAL_ITEMS: ${filtered.length} | FILTER: ${currentFilter.toUpperCase()}`;
    }
}

/**
 * Modal & Sidebar Controls
 */
function openProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentProduct = product;
    currentQty = 1;

    document.getElementById('modal-img').src = product.img;
    document.getElementById('modal-category').innerText = product.category;
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-description').innerText = product.description;
    document.getElementById('modal-price').innerText = product.price;
    document.getElementById('modal-qty').innerText = currentQty;
    document.getElementById('modal-notes').value = '';

    document.getElementById('overlay').classList.add('active');
    document.getElementById('product-modal').classList.add('active');
}

function updateQty(delta) {
    currentQty = Math.max(1, currentQty + delta);
    document.getElementById('modal-qty').innerText = currentQty;
}

function closeAll() {
    document.querySelectorAll('.modal, .cart-sidebar, .overlay').forEach(el => el.classList.remove('active'));
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    if (sidebar.classList.contains('active')) renderCart();
}

function openModal(modalId) {
    closeAll();
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

/**
 * Store Status Logic
 */
const operationalHours = {
    0: { open: "13:00", close: "00:00" }, // Dom
    1: null,                             // Seg (Fechado)
    2: { open: "13:00", close: "00:00" }, // Ter
    3: { open: "13:00", close: "00:00" }, // Qua
    4: { open: "13:00", close: "00:00" }, // Qui
    5: { open: "13:00", close: "00:10" }, // Sex
    6: { open: "13:00", close: "00:00" }  // Sab
};

function updateStoreStatus() {
    const statusEl = document.getElementById('store-status');
    if (!statusEl) return;

    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const todayHours = operationalHours[day];
    let isOpen = false;

    if (todayHours) {
        const [openH, openM] = todayHours.open.split(':').map(Number);
        const [closeH, closeM] = todayHours.close.split(':').map(Number);

        const openTime = openH * 60 + openM;
        let closeTime = closeH * 60 + closeM;

        // Tratar horário que vira o dia (ex: 00:10)
        if (closeTime <= openTime) {
            closeTime += 1440; // Adiciona 24 horas em minutos
        }

        if (currentTime >= openTime && currentTime < closeTime) {
            isOpen = true;
        }
    }

    if (isOpen) {
        statusEl.innerText = "ABERTO AGORA";
        statusEl.className = "store-status open";
    } else {
        statusEl.innerText = "FECHADO AGORA";
        statusEl.className = "store-status closed";
    }
}

/**
 * Cart Logic Refined
 */
function confirmAddToCart() {
    const item = {
        ...currentProduct,
        cartId: Date.now(),
        qty: currentQty,
        notes: document.getElementById('modal-notes').value
    };

    cart.push(item);
    updateCartUI();
    closeAll();

    // Small feedback
    console.log('ITEM_ADDED:', item.name);
}

function removeItem(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    updateCartUI();
    renderCart();
}

function updateCartUI() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    }
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total');
    let total = 0;

    list.innerHTML = cart.map(item => {
        const itemTotal = parseFloat(item.price) * item.qty;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.img}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.qty}x R$ ${item.price}</p>
                    ${item.notes ? `<p style="color: var(--primary); font-size: 0.6rem;">[REF: ${item.notes}]</p>` : ''}
                    <div class="cart-item-price">R$ ${itemTotal.toFixed(2)}</div>
                    <button class="remove-item" onclick="removeItem(${item.cartId})">REMOVER_DATA</button>
                </div>
            </div>
        `;
    }).join('');

    if (cart.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">SACOLA_VAZIA</div>';
    }

    totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

/**
 * Checkout & WhatsApp
 */
function openCheckout() {
    if (cart.length === 0) return alert('TERMINAL_VAZIO: Adicione itens primeiro.');
    document.getElementById('checkout-modal').classList.add('active');
}

function sendOrder(event) {
    event.preventDefault();

    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const ref = document.getElementById('cust-ref').value;

    let message = `*MINHA LOJA - NOVO_PEDIDO*\n\n`;
    message += `*CLIENTE:* ${name}\n`;
    message += `*ENDEREÇO:* ${address}\n`;
    if (ref) message += `*REF:* ${ref}\n`;
    message += `\n*ÍTENS_DO_SISTEMA:*\n`;

    let total = 0;
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price) * item.qty;
        total += itemTotal;
        message += `- ${item.qty}x ${item.name} (R$ ${item.price})\n`;
        if (item.notes) message += `  _Nota: ${item.notes}_\n`;
    });

    message += `\n*TOTAL_FINAL: R$ ${total.toFixed(2)}*`;
    message += `\n\n_Protocolo gerado via MINHA_LOJA_INTERFACE_`;

    const encoded = encodeURIComponent(message);
    const phone = '5521965226788'; // Consistent with previous context
    window.open(`https://wa.me/${phone}?text=${encoded}`);
}

/**
 * Search functionality
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }
}

// Nav backdrop change on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(41, 30, 53, 0.95)';
    } else {
        nav.style.background = 'rgba(41, 30, 53, 0.85)';
    }
});

/**
 * Bottom Bar Navigation Logic
 */
function setupBottomBar() {
    const items = document.querySelectorAll('.bottom-bar-item');
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    renderProducts();
    setupSearch();
    setupBottomBar();
    updateStoreStatus();
    // Refresh status every minute
    setInterval(updateStoreStatus, 60000);
});

console.log('MINHA_LOJA_SYSTEMS initialized // Version 1.0.6 // Multi-Category Nav Active');

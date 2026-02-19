import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrwyqp3Gu6iB2pspqlPGb2ga-8wWFt5Q8",
    authDomain: "minha-loja-53420.firebaseapp.com",
    projectId: "minha-loja-53420",
    storageBucket: "minha-loja-53420.firebasestorage.app",
    messagingSenderId: "106005793663",
    appId: "1:106005793663:web:c1dd4db97bc8802198684a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Product Database
let products = [];
let firestoreProductsLoaded = false;
let storeSettings = {};

// Default Seed Data
const initialProductsSeed = [
    {
        id: "PROD_001",
        name: "Hambúrguer Clássico",
        category: "BURGUERS",
        description: "Pão brioche, carne 160g, queijo cheddar e maionese especial.",
        price: "29.90",
        img: "https://picsum.photos/seed/101/800/800"
    }
];

let cart = [];
let currentFilter = 'all';
let currentProduct = null;
let currentQty = 1;

/**
 * Carrega produtos do Firestore
 */
async function loadProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        if (querySnapshot.empty) {
            console.log("Banco vazio, usando dados iniciais...");
            products = initialProductsSeed;
            // Opcional: Salvar semente no Firestore se quiser
            // initialProductsSeed.forEach(p => addDoc(collection(db, "products"), p));
        } else {
            products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        renderProducts();
    } catch (e) {
        console.error("Erro ao carregar produtos:", e);
        products = initialProductsSeed;
        renderProducts();
    }
}

/**
 * Carrega configurações da loja
 */
async function loadSettings() {
    try {
        const docRef = doc(db, "settings", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            storeSettings = docSnap.data();
            applySettings(storeSettings);
        } else {
            // Configurações padrão
            storeSettings = {
                store_name: "MINHA LOJA",
                store_name_hero: "MINHA LOJA",
                address_hero: "Rio de Janeiro, RJ",
                contact_info: "(21) 99999-9999"
            };
            applySettings(storeSettings);
        }
    } catch (e) {
        console.error("Erro ao carregar configurações:", e);
    }
}

function applySettings(data) {
    Object.keys(data).forEach(key => {
        const elements = document.querySelectorAll(`[data-config="${key}"]`);
        elements.forEach(el => {
            if (key === 'store_name_hero' && data[key].includes(' ')) {
                const parts = data[key].split(' ');
                el.innerHTML = `${parts[0]}<span>${parts.slice(1).join(' ')}</span>`;
            } else {
                el.innerText = data[key];
            }
        });
    });
}

/**
 * Renderiza produtos na grade
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
        <div class="menu-item" data-category="${product.category}" data-id="${product.id}" onclick="handleCardClick(event, '${product.id}')">
            <span class="item-category">${product.category}</span>
            <button class="edit-btn" onclick="toggleEdit(event, '${product.id}')">
                <i class="fas fa-pen"></i>
            </button>
            <div class="menu-img-wrapper">
                <img src="${product.img}" alt="${product.name}" class="menu-img" loading="lazy">
                <div class="editable-image-overlay" onclick="editImage('${product.id}')">
                    <i class="fas fa-camera"></i> ALTERAR
                </div>
            </div>
            <div class="menu-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="menu-footer">
                    <div class="price"><span>R$</span> ${product.price}</div>
                    <button class="add-btn" onclick="addToCartDirect(event, '${product.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Popula o banco de dados com produtos iniciais (Seed)
 * Execute isto no console do navegador se o banco estiver vazio.
 */
async function seedDatabase() {
    console.log("Iniciando Seeding...");
    try {
        const seedData = [
            {
                name: "Açaí Tradicional 500ml",
                category: "ACAI",
                description: "Açaí puro e cremoso, perfeito para quem ama o sabor clássico.",
                price: "18.00",
                img: "https://picsum.photos/seed/acai1/800/800"
            },
            {
                name: "Hambúrguer Gourmet",
                category: "BURGUERS",
                description: "Pão brioche, blend de carne 160g, cheddar duplo e cebola caramelizada.",
                price: "32.00",
                img: "https://picsum.photos/seed/burger1/800/800"
            },
            {
                name: "Combo Família",
                category: "COMBOS",
                description: "2 Burguers + Batata G + Refri 1.5L. A alegria da galera.",
                price: "65.00",
                img: "https://picsum.photos/seed/combo1/800/800"
            }
        ];

        for (const item of seedData) {
            await addDoc(collection(db, "products"), item);
        }

        // Configurações Iniciais
        await setDoc(doc(db, "settings", "main"), {
            store_name: "MINHA LOJA",
            store_name_hero: "MINHA LOJA",
            address_hero: "Nova Campinas, RJ",
            address_info: "Rua Exemplo, 123",
            contact_info: "(21) 96522-6788",
            social_info: "@minhaloja.rj"
        });

        console.log("Seeding concluído com sucesso! Recarregue a página.");
        alert("Banco de dados inicializado! Recarregue a página.");
    } catch (e) {
        console.error("Erro no Seeding:", e);
        alert("Erro ao inicializar banco: " + e.message);
    }
}

// Funções de UI e Auxiliares
function handleCardClick(e, id) {
    if (e.target.closest('.edit-btn') || e.target.closest('.add-btn') || e.target.closest('.editable-image-overlay')) return;
    openProductDetail(id);
}

function openProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    currentProduct = product;
    currentQty = 1;

    document.getElementById('modal-img').src = product.img;
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-description').innerText = product.description;
    document.getElementById('modal-price').innerText = product.price;
    document.getElementById('modal-category').innerText = product.category;
    document.getElementById('modal-qty').innerText = currentQty;
    document.getElementById('modal-notes').value = '';

    document.getElementById('product-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function updateQty(delta) {
    currentQty = Math.max(1, currentQty + delta);
    document.getElementById('modal-qty').innerText = currentQty;
}

function closeAll() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function addToCartDirect(e, id) {
    e.stopPropagation();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id && !item.notes);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1, notes: '' });
    }
    updateCartUI();
}

function confirmAddToCart() {
    if (!currentProduct) return;
    const notes = document.getElementById('modal-notes').value;

    cart.push({ ...currentProduct, qty: currentQty, notes });
    updateCartUI();
    closeAll();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    const count = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');

    count.innerText = cart.reduce((acc, item) => acc + item.qty, 0);

    if (cart.length === 0) {
        list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">SACOLA VAZIA</div>';
        totalEl.innerText = 'R$ 0.00';
        return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        const itemTotal = parseFloat(item.price) * item.qty;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name} x${item.qty}</div>
                    <div class="cart-item-price">R$ ${itemTotal.toFixed(2)}</div>
                    ${item.notes ? `<div class="cart-item-notes">${item.notes}</div>` : ''}
                </div>
                <button class="remove-item" onclick="removeItem(${index})">&times;</button>
            </div>
        `;
    }).join('');

    totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function openCheckout() {
    if (cart.length === 0) return;
    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

function sendOrder(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const addr = document.getElementById('cust-address').value;
    const ref = document.getElementById('cust-ref').value;

    let message = `*NOVO PEDIDO - ${storeSettings.store_name || 'LOJA'}*\n\n`;
    message += `*CLIENTE:* ${name}\n`;
    message += `*ENDEREÇO:* ${addr}\n`;
    if (ref) message += `*REF:* ${ref}\n\n`;
    message += `*ITENS:*\n`;

    let total = 0;
    cart.forEach(item => {
        const sub = parseFloat(item.price) * item.qty;
        total += sub;
        message += `- ${item.name} (${item.qty}x) - R$ ${sub.toFixed(2)}\n`;
        if (item.notes) message += `  _Obs: ${item.notes}_\n`;
    });

    message += `\n*TOTAL: R$ ${total.toFixed(2)}*`;

    const phone = storeSettings.contact_info.replace(/\D/g, '') || "5521999999999";
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`);

    cart = [];
    updateCartUI();
    closeAll();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSettings();

    // Filtros de Categoria (Bottom Bar)
    document.querySelectorAll('.premium-bottom-bar .bottom-bar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = item.getAttribute('data-section');
            if (section === 'cardapio' || section === 'acai' || section === 'burguers' || section === 'combos') {
                e.preventDefault();
                currentFilter = section === 'cardapio' ? 'all' : section.toUpperCase();

                // Update UI active state
                document.querySelectorAll('.premium-bottom-bar .bottom-bar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                renderProducts();
                window.scrollTo({ top: document.getElementById('vitrine').offsetTop - 100, behavior: 'smooth' });
            }
        });
    });

    // Busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderProducts(e.target.value));
    }
});

// Exposure Global
window.seedDatabase = seedDatabase;
window.handleCardClick = handleCardClick;
window.updateQty = updateQty;
window.closeAll = closeAll;
window.addToCartDirect = addToCartDirect;
window.confirmAddToCart = confirmAddToCart;
window.removeItem = removeItem;
window.toggleCart = toggleCart;
window.openCheckout = openCheckout;
window.sendOrder = sendOrder;
window.openModal = (id) => {
    document.getElementById(id).classList.add('active');
    document.getElementById('overlay').classList.add('active');
};

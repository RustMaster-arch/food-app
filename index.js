const PRODUCTS_API_URL = "https://script.google.com/macros/s/AKfycbwfh6C_0zTMjci3lAN9xih4XEM_u5QZ9vsJPnD-NJMay3h_pGqVuQ0NYuBmi7VQ51q3MQ/exec";
const ORDER_API_URL = "https://script.google.com/macros/s/AKfycbwfh6C_0zTMjci3lAN9xih4XEM_u5QZ9vsJPnD-NJMay3h_pGqVuQ0NYuBmi7VQ51q3MQ/exec";

const globalProducts = new Map();
const cartItems = new Map();

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  console.log("DOM fully loaded and parsed");
  fetchProducts()
    .then(displayProductsByCategory)
    .catch(error => console.error('Initialization error:', error));
}

async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_API_URL);
    const data = await response.json();
    data.data.forEach(product => {
      globalProducts.set(product.id, product);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

function displayProductsByCategory() {
  globalProducts.forEach(product => {
    const productCard = createProductCard(product.id);
    appendProductToCategory(productCard, product.categoria);
  });
}

function appendProductToCategory(productCard, category) {
  const categoryElement = document.getElementById(category);
  if (categoryElement) {
    categoryElement.appendChild(productCard);
  } else {
    console.warn(`Category '${category}' not found for product.`);
  }
}

function createProductCard(productId) {
  const product = globalProducts.get(productId);

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
<img src="${product.img}" alt="Product" class="image"/>
<div>
<h1 class="h1">${product.nombre}</h1>
<p class="p">Descripción: ${product.descripcion}</p>
<p class="p">Consíguelo a tan solo: $${product.precio}</p>
</div>
<button class="btn" id="add-to-cart-${product.id}">Añadir al carrito</button>
`;

  const addToCartButton = card.querySelector(`#add-to-cart-${product.id}`);
  addToCartButton.addEventListener('click', () => {
    addToCart(productId);
  });

  return card;
}

function addToCart(productId) {
  const currentQuantity = cartItems.get(productId) || 0;
  cartItems.set(productId, currentQuantity + 1);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartSection = getOrCreateCartSection();
  clearCartItems(cartSection);
  displayCartItems(cartSection);
  displayCartTotal(cartSection);
  displayClientForm(cartSection);
  displaySubmitOrderButton(cartSection);
}

function getOrCreateCartSection() {
  let cartSection = document.getElementById('cart-section');
  if (!cartSection) {
    cartSection = document.createElement('div');
    cartSection.id = 'cart-section';

    const cartTitle = document.createElement('h1');
    cartTitle.className = 'h1';
    cartTitle.innerText = 'Carrito';
    cartSection.appendChild(cartTitle);

    document.body.appendChild(cartSection);
  }
  return cartSection;
}

function clearCartItems(cartSection) {
  const existingItems = cartSection.querySelectorAll('.cart-item');
  existingItems.forEach(item => item.remove());
}

function displayCartItems(cartSection) {
  cartItems.forEach((quantity, productId) => {
    const cartItem = createCartItem(productId, quantity);
    cartSection.appendChild(cartItem);
  });
}

function createCartItem(productId, quantity) {
  const product = globalProducts.get(productId);

  const cartItem = document.createElement('div');
  cartItem.className = 'card cart-item';

  cartItem.innerHTML = `
<img src="${product.img}" alt="Product" class="image"/>
<h1 class="h1c">${product.nombre}</h1>
<div class="final">
  <p class="p">Precio: $${product.precio}</p>
</div>
<div class="bottom">
  <p class="p">Cantidad: ${quantity}</p>
<button class="btn-decrease" data-id="${productId}"> - </button>
<button class="btn-increase" data-id="${productId}"> + </button>
</div>
`;

  const decreaseButton = cartItem.querySelector('.btn-decrease');
  const increaseButton = cartItem.querySelector('.btn-increase');

  decreaseButton.addEventListener('click', () => {
    updateCartItemQuantity(productId, -1);
  });

  increaseButton.addEventListener('click', () => {
    updateCartItemQuantity(productId, 1);
  });

  return cartItem;
}

function updateCartItemQuantity(productId, change) {
  const currentQuantity = cartItems.get(productId) || 0;
  const newQuantity = currentQuantity + change;

  if (newQuantity > 0) {
    cartItems.set(productId, newQuantity);
  } else {
    cartItems.delete(productId);
  }

  updateCartDisplay();
}

function displayCartTotal(cartSection) {
  let totalValueElement = document.getElementById('total-value');
  if (!totalValueElement) {
    totalValueElement = document.createElement('p');
    totalValueElement.id = 'total-value';
    cartSection.appendChild(totalValueElement);
  }
  const totalValue = calculateCartTotal();
  totalValueElement.innerText = `Valor Total del Pedido: $${totalValue}`;
  totalValueElement.className = "p";
}

function calculateCartTotal() {
  let total = 0;
  cartItems.forEach((quantity, productId) => {
    const product = globalProducts.get(productId);
    total += product.precio * quantity;
  });
  return total;
}

function displayClientForm(cartSection) {
  if (!document.getElementById('client-form')) {
    const form = createClientForm();
    cartSection.appendChild(form);
  }
}

function createClientForm() {
  const form = document.createElement('form');
  form.id = 'client-form';

  const nameField = createInputField('client-name', 'Nombre del cliente');
  const phoneField = createInputField('client-phone', 'Teléfono del cliente');
  const addressField = createInputField('client-address', 'Dirección del cliente');

  form.appendChild(nameField);
  form.appendChild(phoneField);
  form.appendChild(addressField);

  return form;
}

function createInputField(id, placeholder) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = "input";
  input.id = id;
  input.placeholder = placeholder;
  input.required = true;
  return input;
}

function displaySubmitOrderButton(cartSection) {
  if (!document.getElementById('submit-order-button')) {
    const submitButton = document.createElement('button');
    submitButton.id = 'submit-order-button';
    submitButton.innerText = 'Realizar Pedido';
    submitButton.addEventListener('click', submitOrder);
    cartSection.appendChild(submitButton);
  }
}

function submitOrder(event) {
  event.preventDefault();

  const clientInfo = getClientInfo();
  if (!clientInfo) {
    alert('Por favor, complete toda la información del cliente.');
    return;
  }

  if (cartItems.size === 0) {
    alert('El carrito está vacío.');
    return;
  }

  const orderData = createOrderData(clientInfo);
  sendOrderData(orderData);
}

function getClientInfo() {
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const address = document.getElementById('client-address').value.trim();

  if (name && phone && address) {
    return { name, phone, address };
  } else {
    return null;
  }
}

function createOrderData(clientInfo) {
  const products = [];
  let totalValue = 0;
  console.log(clientInfo);

  cartItems.forEach((quantity, productId) => {
    const product = globalProducts.get(productId);
    products.push({
      id: productId,
      precio: product.precio,
      cantidad: quantity,
    });
    totalValue += product.precio * quantity;
  });

  console.log(clientInfo.name + clientInfo.phone + clientInfo.address + products + totalValue);

  return {
    nombreCliente: clientInfo.name,
    telefonoCliente: clientInfo.phone,
    direccionCliente: clientInfo.address,
    productos: products,
    valorTotal: totalValue,
  };
}

async function sendOrderData(orderData) {
  console.log(orderData);

  try {
    await fetch(ORDER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors',
      body: JSON.stringify(orderData),
    });

    alert("good request")
  } catch (error) {
    alert("error fetching backend")
    console.log("error: ", error)
  }
}

function clearCart() {
  cartItems.clear();
  updateCartDisplay();
}


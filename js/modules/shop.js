const CART_STORAGE_KEY = "discovery:shop:cart";
const PRODUCT_DATA_URL = new URL("../../data/best-items.json", import.meta.url);
const DETAIL_PAGE_URL = "./pages/product-detail.html";
const PRODUCT_DATA_TIMEOUT = 10000;

function getStatusElement() {
  return document.querySelector('[data-js="shop-status"]');
}

function showStatus(message) {
  const status = getStatusElement();
  if (status) status.textContent = message;
}

function getCartItems() {
  let serialized;
  try {
    serialized = localStorage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    throw new Error("장바구니 저장 공간에 접근할 수 없습니다.", { cause: error });
  }
  if (!serialized) return [];

  let items;
  try {
    items = JSON.parse(serialized);
  } catch (error) {
    throw new Error("저장된 장바구니 정보를 읽을 수 없습니다.", { cause: error });
  }
  if (!Array.isArray(items) || items.some((item) =>
    typeof item?.productId !== "string" ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  )) {
    throw new Error("저장된 장바구니 정보가 올바르지 않습니다.");
  }
  return items;
}

function saveCartItems(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    throw new Error("장바구니를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.", { cause: error });
  }
  window.dispatchEvent(new CustomEvent("discovery-cart-change"));
}

function getCartCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

function formatPrice(price) {
  return `${new Intl.NumberFormat("ko-KR").format(price)}원`;
}

function getProductImageUrl(imagePath) {
  return new URL(imagePath, PRODUCT_DATA_URL).href;
}

async function loadProducts() {
  const response = await fetch(PRODUCT_DATA_URL, {
    signal: AbortSignal.timeout(PRODUCT_DATA_TIMEOUT),
  });
  if (!response.ok) throw new Error("상품 정보를 불러오지 못했습니다.");
  const products = await response.json();
  if (!Array.isArray(products) || products.some((product) =>
    typeof product?.id !== "string" ||
    typeof product.name !== "string" ||
    !Number.isFinite(product.price) ||
    typeof product.image !== "string"
  )) {
    throw new Error("상품 정보 형식이 올바르지 않습니다.");
  }
  return products;
}

function updateCartBadges() {
  const badges = document.querySelectorAll('[data-js="cart-count"]');
  if (!badges.length) return;
  const count = getCartCount(getCartItems());
  badges.forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function addProductToCart(productId) {
  const items = getCartItems();
  const existingItem = items.find((item) => item.productId === productId);
  if (existingItem) existingItem.quantity += 1;
  else items.push({ productId, quantity: 1 });
  saveCartItems(items);
}

function createDetailUrl(productId) {
  const url = new URL(DETAIL_PAGE_URL, window.location.href);
  url.searchParams.set("id", productId);
  return url.href;
}

function updateCard(card, product) {
  const detailUrl = createDetailUrl(product.id);
  card.querySelectorAll(".best-card__image-link, .best-card__title-link").forEach((link) => {
    link.href = detailUrl;
  });
  const primaryImage = card.querySelector(".best-card__image--primary");
  const hoverImage = card.querySelector(".best-card__image--hover");
  const title = card.querySelector(".best-card__name");
  const price = card.querySelector(".best-card__sale");
  if (primaryImage) {
    primaryImage.src = getProductImageUrl(product.image);
    primaryImage.alt = `${product.name} 메인 이미지`;
  }
  if (hoverImage) {
    hoverImage.src = getProductImageUrl(product.hoverImage);
    hoverImage.alt = `${product.name} 호버 이미지`;
  }
  if (title) title.textContent = product.name;
  if (price) price.textContent = new Intl.NumberFormat("ko-KR").format(product.price);

  const addButton = card.querySelector(".best-card__cart");
  if (addButton) {
    addButton.setAttribute("aria-label", `${product.name} 장바구니 담기`);
    addButton.addEventListener("click", () => {
      try {
        addProductToCart(product.id);
        showStatus(`${product.name} 상품을 장바구니에 담았습니다.`);
      } catch (error) {
        showStatus(error.message);
      }
    });
  }
}

export async function initBestItemShopping() {
  const cards = [...document.querySelectorAll(".best-card")];
  if (!cards.length) return;
  cards.forEach((card) => {
    const rank = Number(card.querySelector(".best-card__rank")?.textContent);
    if (rank) {
      const detailUrl = createDetailUrl(`best-${rank}`);
      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        window.location.assign(detailUrl);
      });
      card.querySelectorAll(".best-card__image-link, .best-card__title-link").forEach((link) => {
        link.href = detailUrl;
      });
    }
  });
  try {
    const products = await loadProducts();
    const productsByRank = new Map(products.map((product) => [product.rank, product]));
    cards.forEach((card) => {
      const rank = Number(card.querySelector(".best-card__rank")?.textContent);
      const product = productsByRank.get(rank);
      if (product) updateCard(card, product);
    });
  } catch (error) {
    showStatus(error.message || "상품 정보를 불러오지 못했습니다.");
  }
}

function createProductCard(product, quantity, onRemove) {
  const item = document.createElement("article");
  item.className = "cart-item";
  const image = document.createElement("img");
  image.className = "cart-item__image";
  image.src = getProductImageUrl(product.image);
  image.alt = product.name;
  const info = document.createElement("div");
  info.className = "cart-item__info";
  const name = document.createElement("h2");
  name.className = "cart-item__name";
  name.textContent = product.name;
  const quantityLabel = document.createElement("p");
  quantityLabel.className = "cart-item__quantity";
  quantityLabel.textContent = `수량 ${quantity}개`;
  const price = document.createElement("p");
  price.className = "cart-item__price";
  price.textContent = formatPrice(product.price * quantity);
  const removeButton = document.createElement("button");
  removeButton.className = "cart-item__remove";
  removeButton.type = "button";
  removeButton.textContent = "삭제";
  removeButton.setAttribute("aria-label", `${product.name} 삭제`);
  removeButton.addEventListener("click", onRemove);
  info.append(name, quantityLabel, price);
  item.append(image, info, removeButton);
  return item;
}

function renderCartItems(products, list, totalElements) {
  const cartItems = getCartItems();
  const productById = new Map(products.map((product) => [product.id, product]));
  const validItems = cartItems.filter((item) => productById.has(item.productId));
  list.replaceChildren();

  if (validItems.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "선택한 상품이 없습니다";
    list.append(emptyMessage);
    totalElements.forEach((element) => {
      element.textContent = formatPrice(0);
    });
    return;
  }

  validItems.forEach((cartItem) => {
    const product = productById.get(cartItem.productId);
    const card = createProductCard(product, cartItem.quantity, () => {
      saveCartItems(getCartItems().filter((item) => item.productId !== product.id));
    });
    list.append(card);
  });
  const total = validItems.reduce((sum, item) =>
    sum + productById.get(item.productId).price * item.quantity, 0);
  totalElements.forEach((element) => {
    element.textContent = formatPrice(total);
  });
}

export function initCartBadges() {
  const update = () => {
    try {
      updateCartBadges();
    } catch (error) {
      showStatus(error.message);
    }
  };
  update();
  window.addEventListener("storage", update);
  window.addEventListener("discovery-cart-change", update);
}

export async function initProductDetail() {
  const root = document.querySelector('[data-js="product-detail"]');
  if (!root) return;
  const productId = new URLSearchParams(window.location.search).get("id");
  try {
    const products = await loadProducts();
    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      showStatus("상품 정보를 찾을 수 없습니다.");
      return;
    }
    root.querySelector('[data-js="product-image"]').src = getProductImageUrl(product.image);
    root.querySelector('[data-js="product-image"]').alt = product.name;
    root.querySelector('[data-js="product-name"]').textContent = product.name;
    root.querySelector('[data-js="product-price"]').textContent = formatPrice(product.price);
    root.querySelector('[data-js="add-to-cart"]').addEventListener("click", () => {
      try {
        addProductToCart(product.id);
        showStatus(`${product.name} 상품을 장바구니에 담았습니다.`);
      } catch (error) {
        showStatus(error.message);
      }
    });
  } catch (error) {
    showStatus(error.message || "상품 정보를 불러오지 못했습니다.");
  }
}

export async function initCartPage() {
  const list = document.querySelector('[data-js="cart-items"]');
  const totals = [...document.querySelectorAll('[data-js="cart-total"]')];
  if (!list || !totals.length) return;
  try {
    const products = await loadProducts();
    const render = () => {
      try {
        renderCartItems(products, list, totals);
      } catch (error) {
        showStatus(error.message);
      }
    };
    render();
    window.addEventListener("discovery-cart-change", render);
    window.addEventListener("storage", render);
  } catch (error) {
    showStatus(error.message || "상품 정보를 불러오지 못했습니다.");
  }
}

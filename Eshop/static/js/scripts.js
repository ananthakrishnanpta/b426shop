// =======================
// Cart handling
// =======================

// cart badge
const cart_count = document.getElementById("cart-count");

// load cart count
async function loadCartCount() {
    if (!cart_count) return;

    const countUrl = cart_count.dataset.countUrl;

    try {
        const result = await fetch(countUrl);
        const data = await result.json();
        cart_count.innerText = data.cart_count;
    }
    catch (error) {
        console.error(`Cart count fetch error : ${error}`);
    }
}

loadCartCount();

// CSRF token
const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value;

// support listing + detail page
const products_container = document.getElementById('products-container');
const detail_section = document.getElementById("product-detail-section");

const cartScope = products_container || detail_section;

if (cartScope) {

    const addUrl = cartScope.dataset.addUrl;
    const plusUrl = cartScope.dataset.plusUrl;
    const minusUrl = cartScope.dataset.minusUrl;
    const removeUrl = cartScope.dataset.removeUrl;

    cartScope.addEventListener("click", async function (event) {

        const btn = event.target;

        if (
            !btn.classList.contains("add-to-cart") &&
            !btn.classList.contains("qty-plus") &&
            !btn.classList.contains("qty-minus") &&
            !btn.classList.contains("remove-item")
        ) return;

        let productId;

        const card = btn.closest(".product-card");

        if (card) {
            productId = card.dataset.productId;
        }

        if (!productId) {
            productId = cartScope.dataset.productId;
        }

        let url = addUrl;

        if (btn.classList.contains("qty-plus")) url = plusUrl;
        if (btn.classList.contains("qty-minus")) url = minusUrl;
        if (btn.classList.contains("remove-item")) url = removeUrl;

        btn.disabled = true;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `product_id=${productId}`
            });

            const data = await response.json();

            // login redirect
            if (response.status === 401 && data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            // update cart badge
            if (data.cart_count !== undefined && cart_count) {
                cart_count.innerText = data.cart_count;
            }

            // update quantity UI if backend returns qty
            if (data.qty !== undefined) {
                updateQuantityUI(btn, data.qty, productId);
            }

        }
        catch (error) {
            console.error("Cart error:", error);
        }
        finally {
            btn.disabled = false;
        }
    });
}

// =======================
// UI updater
// =======================

function updateQuantityUI(btn, qty, productId) {

    const card = btn.closest(".product-card") || document;

    let container = card.querySelector(".product-action-buttons");

    if (!container) return;

    if (qty <= 0) {
        container.innerHTML = `
            <button class="btn btn-sm btn-success add-to-cart">
                Add to Cart
            </button>
        `;
        return;
    }

    container.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary qty-minus">-</button>
            <span class="fw-bold">${qty}</span>
            <button class="btn btn-sm btn-outline-secondary qty-plus">+</button>
            <button class="btn btn-sm btn-danger remove-item">Remove</button>
        </div>
    `;
}


// =======================
// Load existing qty on detail page
// =======================

async function hydrateDetailPage() {

    const detail = document.getElementById("product-detail-section");
    if (!detail) return;

    const qtyUrl = detail.dataset.qtyUrl;
    const productId = detail.dataset.productId;

    try {
        const res = await fetch(`${qtyUrl}?product_id=${productId}`);
        const data = await res.json();

        const fakeBtn = detail.querySelector(".add-to-cart");

        if (fakeBtn && data.qty > 0) {
            updateQuantityUI(fakeBtn, data.qty, productId);
        }

    } catch (err) {
        console.error("Hydration error:", err);
    }
}

hydrateDetailPage();

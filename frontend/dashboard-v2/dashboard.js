const BASE_URL = "http://127.0.0.1:8000/api/menu/items/";
const RESTAURANTS_URL = "http://127.0.0.1:8000/api/restaurants/";
const CATEGORIES_URL = "http://127.0.0.1:8000/api/menu/categories/"; 
const token = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", function () {
    if (!token) {
        window.location.href = "../login/index.html";
        return;
    }
    
    loadRestaurants();
    loadProducts();
    
    const select = document.getElementById("restaurantSelect");
    if (select) {
        select.addEventListener("change", loadProducts);
    }
    
    document.getElementById("editForm").addEventListener("submit", handleEditSubmit);
    document.getElementById("addForm").addEventListener("submit", handleAddSubmit);
    
    const resForm = document.getElementById("restaurantForm");
    if (resForm) {
        resForm.addEventListener("submit", handleCreateRestaurant);
    }

    const catForm = document.getElementById("categoryForm");
    if (catForm) {
        catForm.addEventListener("submit", handleCreateCategory);
    }
});

// ==========================================
// 0. RESTAURANT & CATEGORY MANAGEMENT
// ==========================================
function loadRestaurants() {
    fetch(RESTAURANTS_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(shops => {
        const select = document.getElementById("restaurantSelect");
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Select Store --</option>';
        
        shops.forEach(shop => {
            const option = document.createElement("option");
            option.value = shop.id;
            option.textContent = shop.name; 
            select.appendChild(option);
        });
    })
    .catch(err => console.error("Error loading restaurants:", err));
}

function handleCreateRestaurant(e) {
    e.preventDefault();
    
    const name = document.getElementById("resName").value;
    const address = document.getElementById("resAddress").value;
    const phone_number = document.getElementById("resPhone").value;
    const email = document.getElementById("resEmail").value;

    fetch(RESTAURANTS_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            address: address,
            phone_number: phone_number,
            email: email || null
        })
    })
    .then(res => {
        if (res.ok) {
            closeRestaurantModal();
            document.getElementById("restaurantForm").reset();
            loadRestaurants(); 
        } else {
            res.json().then(err => console.error("Django Create Error:", err));
        }
    })
    .catch(err => console.error("Network Error:", err));
}

function handleCreateCategory(e) {
    e.preventDefault();
    
    const select = document.getElementById("restaurantSelect");
    const restaurantId = select ? select.value : null;
    
    // Εφόσον το Serializer θέλει πλέον απλό name:
    const name = document.getElementById("catName").value; 

    if (!restaurantId) {
        alert("Παρακαλώ επιλέξτε πρώτα ένα κατάστημα!");
        return;
    }

    fetch(CATEGORIES_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            restaurant: parseInt(restaurantId),
            name: name // Στέλνουμε απλό string
        })
    })
    .then(res => {
        if (res.ok) {
            closeCategoryModal();
            document.getElementById("categoryForm").reset();
            loadProducts();
        } else {
            res.json().then(err => console.error("Error:", err));
        }
    });
}

// ==========================================
// 1. LOAD AND GROUP PRODUCTS
// ==========================================
async function loadProducts() {
    const select = document.getElementById("restaurantSelect");
    const restaurantId = select ? select.value : "";
    const container = document.getElementById("productsList");

    if (!restaurantId) {
        container.innerHTML = "<p>Please select a restaurant.</p>";
        return;
    }

    try {
        const catRes = await fetch(`${CATEGORIES_URL}?restaurant=${restaurantId}`, { 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        if (!catRes.ok) throw new Error("Failed to load categories");
        const categories = await catRes.json();

        const prodRes = await fetch(`${BASE_URL}?restaurant=${restaurantId}`, { 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        if (!prodRes.ok) throw new Error("Failed to load products");
        const products = await prodRes.json();

        container.innerHTML = "";

        categories.forEach(cat => {
            const items = products.filter(p => p.category === cat.id);
            const div = document.createElement("div");
            div.className = "category-section mb-6 p-4 border rounded shadow-sm bg-white";
            
            div.innerHTML = `
                <h2 class="text-xl font-bold mb-3">${cat.name.GR || cat.name}</h2>
                <div class="items-list">
                    ${items.length > 0 ? items.map(item => `
                        <div class="flex justify-between border-b py-2">
                            <span>${item.name}</span>
                            <span>${item.price}€</span>
                            <button onclick='openModal(${JSON.stringify(item)})' class="text-blue-500">Edit</button>
                        </div>
                    `).join('') : '<p class="text-gray-500 italic">No products here</p>'}
                </div>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading data:", err);
        container.innerHTML = `<p class="text-red-500">Error loading data: ${err.message}</p>`;
    }
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden");
}

// ==========================================
// 2. MODAL CONTROLS (EDIT)
// ==========================================
function openModal(product) {
    document.getElementById("editProductId").value = product.id;
    const catId = (product.category && typeof product.category === 'object') ? product.category.id : product.category;
    document.getElementById("editCategoryId").value = catId || "";
    
    document.getElementById("editName").value = product.name || "";
    document.getElementById("editDescription").value = product.description || "";
    document.getElementById("editPrice").value = product.price || "";
    
    const modal = document.getElementById("editModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() { 
    const modal = document.getElementById("editModal");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
}

// ==========================================
// 3. MODAL CONTROLS (ADD)
// ==========================================
function openAddModal(catId) {
    const inputElement = document.getElementById("addCategoryName");
    if (inputElement) inputElement.value = catId;
    
    document.getElementById("addName").value = "";
    document.getElementById("addDescription").value = "";
    document.getElementById("addPrice").value = "";
    
    const modal = document.getElementById("addModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

function closeAddModal() { 
    const modal = document.getElementById("addModal");
    if (modal) {
        modal.classList.remove("flex");
        modal.classList.add("hidden");
    }
}

// ==========================================
// 4. POST NEW PRODUCT (Create)
// ==========================================
function handleAddSubmit(e) {
    e.preventDefault();
    const select = document.getElementById("restaurantSelect");
    const restaurantId = select ? select.value : null;

    fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            restaurant: parseInt(restaurantId),
            category: parseInt(document.getElementById("addCategoryName").value),
            price: parseFloat(document.getElementById("addPrice").value),
            name: document.getElementById("addName").value, 
            description: document.getElementById("addDescription").value,
        })
    })
    .then(res => {
        if (res.ok) {
            closeAddModal();
            loadProducts();
        } else {
            res.json().then(err => console.error("Django Create Error:", err));
        }
    });
}

// ==========================================
// 5. UPDATE PRODUCT (Update)
// ==========================================
function handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("editProductId").value;
    const catId = document.getElementById("editCategoryId").value;

    const payload = {
        restaurant: parseInt(document.getElementById("restaurantSelect").value),
        category: parseInt(catId), 
        name: document.getElementById("editName").value,
        description: document.getElementById("editDescription").value,
        price: parseFloat(document.getElementById("editPrice").value)
    };

    fetch(`${BASE_URL}${id}/`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (!res.ok) {
            const err = await res.json();
            console.error("Django Error:", err);
        } else {
            closeModal();
            loadProducts();
        }
    });
}

// ==========================================
// 6. DELETE PRODUCT (Delete)
// ==========================================
function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const cleanUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

    fetch(`${cleanUrl}${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => { 
        if (res.ok) loadProducts(); 
        else console.error("Delete Error:", res.status);
    });
}
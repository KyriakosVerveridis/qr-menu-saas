const BASE_URL = "http://127.0.0.1:8000/api/menu/items/";
const token = localStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", function () {
    if (!token) {
        window.location.href = "../login/index.html";
        return;
    }
    loadProducts();
    document.getElementById("editForm").addEventListener("submit", handleEditSubmit);
    document.getElementById("addForm").addEventListener("submit", handleAddSubmit);
});

// 1. ΦΟΡΤΩΣΗ ΚΑΙ ΟΜΑΔΟΠΟΙΗΣΗ ΠΡΟΪΟΝΤΩΝ
function loadProducts() {
    fetch(BASE_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(products => {
        const container = document.getElementById("productsList");
        container.innerHTML = "";

        // Ομαδοποίηση προϊόντων ανά κατηγορία (π.χ. "Καφές", "Πίτσα")
        const categories = {};
        products.forEach(p => {
            const catName = p.category ? (p.category.GR || p.category.gr || p.category) : "Χωρίς Κατηγορία";
            if (!categories[catName]) categories[catName] = [];
            categories[catName].push(p);
        });

        // Δημιουργία Accordion για κάθε κατηγορία
        Object.keys(categories).forEach((catName, index) => {
            let itemsHtml = "";
            
            categories[catName].forEach(p => {
                const displayName = p.name ? (p.name.GR || p.name.gr || p.name) : "Χωρίς Όνομα";
                itemsHtml += `
                    <div class="flex items-center justify-between p-3 pl-10 border-b border-slate-100 bg-white hover:bg-slate-50 transition">
                        <div class="text-slate-700 font-medium">${displayName} <span class="text-slate-400 text-sm ml-2">(${p.price}€)</span></div>
                        <div class="flex space-x-2">
                            <button onclick="event.stopPropagation(); openModal(${p.id}, '${displayName}', ${p.price})" class="text-amber-600 hover:text-amber-800 font-bold text-sm px-2 py-1">Edit</button>
                            <button onclick="event.stopPropagation(); deleteProduct(${p.id})" class="text-rose-600 hover:text-rose-800 font-bold text-sm px-2 py-1">Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML += `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div onclick="toggleAccordion('cat-content-${index}')" class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition select-none bg-slate-50/50">
                        <div class="flex items-center gap-3">
                            <span class="text-xl text-slate-400">📁</span>
                            <h3 class="text-lg font-bold text-slate-800">${catName}</h3>
                        </div>
                        <span class="text-slate-400 text-xs">Κλικ για άνοιγμα</span>
                    </div>
                    
                    <div id="cat-content-${index}" class="hidden">
                        <div class="bg-slate-100/40">${itemsHtml}</div>
                        <div class="p-3 flex justify-center bg-slate-50 border-t border-slate-100">
                            <button onclick="openAddModal('${catName}')" class="flex items-center gap-2 border border-dashed border-slate-300 text-slate-600 hover:text-sky-600 hover:border-sky-500 font-bold py-1.5 px-6 rounded-xl text-sm transition">
                                <span>➕</span> Add Entry
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}

// TOGGLE ACCORDION
function toggleAccordion(id) {
    const el = document.getElementById(id);
    el.classList.toggle("hidden");
}

// 2. MODAL CONTROLS (EDIT)
function openModal(id, name, price) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editPrice").value = price;
    document.getElementById("editModal").style.display = "flex";
}
function closeModal() { document.getElementById("editModal").style.display = "none"; }

// 3. MODAL CONTROLS (ADD)
function openAddModal(catName) {
    document.getElementById("addCategoryName").value = catName;
    document.getElementById("addName").value = "";
    document.getElementById("addPrice").value = "";
    document.getElementById("addModal").style.display = "flex";
}
function closeAddModal() { document.getElementById("addModal").style.display = "none"; }

// 4. POST NEW PRODUCT (Create)
function handleAddSubmit(e) {
    e.preventDefault();
    const catName = document.getElementById("addCategoryName").value;
    const name = document.getElementById("addName").value;
    const price = document.getElementById("addPrice").value;

    fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: { GR: name },
            category: { GR: catName }, // Στέλνει το όνομα της κατηγορίας στην οποία έγινε κλικ
            price: parseFloat(price)
        })
    })
    .then(res => {
        if (res.ok) {
            closeAddModal();
            loadProducts();
        }
    });
}

// 5. UPDATE PRODUCT (Update)
function handleEditSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("editProductId").value;
    const name = document.getElementById("editName").value;
    const price = document.getElementById("editPrice").value;

    // Καθαρισμός του URL για να μην γίνει διπλό slash //
    const cleanUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

    fetch(`${cleanUrl}${id}/`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            name: { GR: name }, 
            price: parseFloat(price) 
        })
    })
    .then(res => {
        if (res.ok) {
            closeModal();
            loadProducts();
        } else {
            console.error("Σφάλμα κατά το Update. Status:", res.status);
        }
    });
}

// 6. DELETE PRODUCT (Delete)
function deleteProduct(id) {
    if (!confirm("Είστε σίγουροι για τη διαγραφή;")) return;
    
    // Καθαρισμός του URL για να μην γίνει διπλό slash //
    const cleanUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

    fetch(`${cleanUrl}${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => { 
        if (res.ok) {
            loadProducts(); 
        } else {
            console.error("Σφάλμα κατά τη Διαγραφή. Status:", res.status);
        }
    });
}
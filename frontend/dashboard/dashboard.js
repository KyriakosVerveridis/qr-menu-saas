// Retrieve the token saved in browser during login
const TOKEN = localStorage.getItem('user_token'); 

// URLs for your Django API endpoints
const RESTAURANTS_API_URL = 'http://127.0.0.1:8000/api/restaurants/';
const MENU_ITEMS_API_URL = 'http://127.0.0.1:8000/api/menu/items/';

// Helper function to generate authorized headers
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}` // 'Token' to 'Bearer' for JWT
});

// 1. Fetch restaurants from DB and populate the dropdown when page loads
function loadRestaurants() {
    // If there is no token, stop and notify the user
    if (!TOKEN) {
        alert('You must be logged in to view your dashboard.');
        return;
    }

    fetch(RESTAURANTS_API_URL, {
        method: 'GET',
        headers: getAuthHeaders() // Pass the token here
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch restaurants');
        return response.json();
    })
    .then(restaurants => {
        const selectElement = document.getElementById('restaurantSelect');
        selectElement.innerHTML = ''; // Clear mock options

        if (restaurants.length === 0) {
            selectElement.innerHTML = '<option value="">No shops found</option>';
            return;
        }

        // Loop through data and create HTML options
        restaurants.forEach(shop => {
            const option = document.createElement('option');
            option.value = shop.id; // The ID stored in DB
            option.textContent = shop.name; // The name shown to user
            selectElement.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading restaurants:', error);
        alert('Could not load shops from database.');
    });
}

// Call the function immediately on load
loadRestaurants();

// 2. Handle form submission to insert new product into DB
document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const selectedRestaurantId = document.getElementById('restaurantSelect').value;
    if (!selectedRestaurantId) {
        alert('Please select a valid shop first.');
        return;
    }

    // Gather values from HTML inputs
    const productData = {
        name_gr: document.getElementById('name_gr').value,
        name_en: document.getElementById('name_en').value,
        description_gr: document.getElementById('description_gr').value,
        description_en: document.getElementById('description_en').value,
        price: parseFloat(document.getElementById('price').value),
        restaurant: parseInt(selectedRestaurantId), // Linked DB ID
        category: parseInt(document.getElementById('categorySelect').value)
    };

    // Send data to Django using POST method
    fetch(MENU_ITEMS_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(), // Pass the token here too
        body: JSON.stringify(productData)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('API request failed');
    })
    .then(data => {
        alert('Product saved successfully to database!');
        document.getElementById('productForm').reset(); // Clear form fields
        console.log('Django response:', data);
    })
    .catch(error => {
        console.error('Error saving product:', error);
        alert('Failed to save product to database.');
    });
});
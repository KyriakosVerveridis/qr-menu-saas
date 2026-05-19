document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    // JWT endpoint
    fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Invalid credentials');
    })
    .then(data => {
        // SimpleJWT returns the token as 'access'
        localStorage.setItem('user_token', data.access); 
        
        alert('Login successful!');
        window.location.href = 'index.html'; 
    })
});
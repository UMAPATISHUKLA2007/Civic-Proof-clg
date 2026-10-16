
/* ==========================================
   CIVIPROOF - LOGIN & REGISTER JAVASCRIPT
========================================== */

// Main container
const container = document.querySelector('.container');

// Login and Register toggle buttons
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Login and Register forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');


// ==========================================
// 1. REGISTER FORM SHOW KARNA
// ==========================================

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});


// ==========================================
// 2. LOGIN FORM SHOW KARNA
// ==========================================

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});


// ==========================================
// 3. SUCCESSFUL DEMO LOGIN
// ==========================================

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Browser ki required-field validation
    if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
    }

    alert('Login successful! Welcome to CiviProof.');

    // Navbar page par redirect
    window.location.href = 'navbar.html';
});


// ==========================================
// 4. SUCCESSFUL DEMO REGISTRATION
// ==========================================

registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Browser ki required-field validation
    if (!registerForm.checkValidity()) {
        registerForm.reportValidity();
        return;
    }

    alert('Registration successful! Welcome to CiviProof.');

    // Navbar page par redirect
    window.location.href = 'navbar.html';
});

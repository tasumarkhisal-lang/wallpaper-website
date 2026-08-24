// Tab Switching Logic
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-btn-tab').classList.add('active');
    document.getElementById('signup-btn-tab').classList.remove('active');
}

function showSignup() {
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-btn-tab').classList.add('active');
    document.getElementById('login-btn-tab').classList.remove('active');
}

// Form Submit Event Handlers
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Sign up request sent!');
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('Login request sent!');
});
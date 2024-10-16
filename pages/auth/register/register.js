document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const firstname = document.getElementById('firstname').value;
        const surname = document.getElementById('Surname').value;
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const rasm = document.getElementById('rasm').value;

        // Form validation
        if (firstname.trim() === '' || surname.trim() === '' || login.trim() === '' || password.trim() === '' || email.trim() === '' || rasm.trim() === '') {
            alert('All fields are required');
            return;
        }

        if (login.length < 4) {
            alert('Login must be at least 4 characters long');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Invalid email address');
            return;
        }

        // Prepare data object
        const register = {
            firstName: firstname,
            lastName: surname,
            login: login,
            password: password,
            email: email,
            rasm: rasm
        };

        
        fetch('http://localhost:3000/new_admins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(register)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            alert('Registration successful');
            form.reset(); 
            window.location.href="../log-in/index.html"
            
            
            
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('Registration failed. Please try again later.');
        });
    });
});

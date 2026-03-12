document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    const showError = (message) => {
        let alert = document.getElementById('registerMessage');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'registerMessage';
            alert.style.margin = '8px 0 16px';
            alert.style.color = '#ff6b6b';
            form.parentNode.insertBefore(alert, form);
        }
        alert.textContent = message;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const role = form.role.value;

        if (!name || !email || !password || !role) {
            showError('All fields are required.');
            return;
        }

        try {
            const res = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.message || 'Signup failed');
                return;
            }

            // option: save name/role for prefill
            localStorage.setItem('signupUser', JSON.stringify({ name, email, role }));

            showError('Signup successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);

        } catch (err) {
            showError('Server error, please try again.');
            console.error(err);
        }
    });
});

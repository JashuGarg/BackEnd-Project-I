let selectedRole = 'Student';
let pwVisible = false;

function selectRole(el, role) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedRole = role;
}

function handleInput(id) {
    const input = document.getElementById(id);
    const label = document.getElementById('lbl-' + id);
    if (label) {
        if (input.value) label.classList.add('lifted');
        else label.classList.remove('lifted');
    }
    // clear error on type
    const errEl = document.getElementById('err-' + id);
    if (errEl) errEl.classList.remove('show');
    const box = document.getElementById('f-' + id)?.querySelector('.field-box');
    if (box) box.classList.remove('error');
    document.getElementById('alertError').classList.remove('show');
}

// focus / blur lift
document.querySelectorAll('input').forEach(el => {
    el.addEventListener('focus', () => {
        const lbl = document.getElementById('lbl-' + el.id);
        if (lbl) lbl.classList.add('lifted');
    });
    el.addEventListener('blur', () => {
        const lbl = document.getElementById('lbl-' + el.id);
        if (lbl && !el.value) lbl.classList.remove('lifted');
    });
});

function togglePw() {
    pwVisible = !pwVisible;
    const inp = document.getElementById('password');
    inp.type = pwVisible ? 'text' : 'password';
    document.getElementById('toggleBtn').textContent = pwVisible ? '🙈' : '👁️';
}

function showFieldError(id, msg) {
    const err = document.getElementById('err-' + id);
    if (err) { err.textContent = msg; err.classList.add('show'); }
    const box = document.getElementById('f-' + id)?.querySelector('.field-box');
    if (box) box.classList.add('error');
}

async function doLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showFieldError('email', 'Enter a valid email address');
        return;
    }
    if (!password) {
        showFieldError('password', 'Password is required');
        return;
    }

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            document.getElementById('alertMsg').textContent = data.message || 'Login failed';
            document.getElementById('alertError').classList.add('show');
            return;
        }

        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        window.location.href = '/dashboard';
    } catch (err) {
        document.getElementById('alertMsg').textContent = 'Server error, please try again.';
        document.getElementById('alertError').classList.add('show');
        console.error(err);
    }
}

function doIdLogin() {
    const id = document.getElementById('studentId').value.trim();
    if (!id) {
        showFieldError('studentId', 'Please enter your ID');
        return;
    }

    // optionally submit using id-based login endpoint later
    window.location.href = '/dashboard';
}

function closeSuccess() {
    document.getElementById('successOverlay').classList.remove('show');
}

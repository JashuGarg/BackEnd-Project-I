let currentStep = 1;
let pwVisible = false;

const stepMeta = {
    1: { icon: '📋', tag: '📋 Step 1 of 3', title: 'Personal Information', leftIcon: '🎓', leftTitle: 'Create Your<br/>Account', leftSub: 'Join ScholarVault to access thousands of books, journals and research materials.' },
    2: { icon: '🎓', tag: '🎓 Step 2 of 3', title: 'Academic Details', leftIcon: '🏛️', leftTitle: 'Almost<br/>There!', leftSub: 'Tell us about your academic role so we can set up your library access.' },
    3: { icon: '🔐', tag: '🔐 Step 3 of 3', title: 'Set Your Password', leftIcon: '🔐', leftTitle: 'One Last<br/>Step!', leftSub: 'Create a secure password to protect your ScholarVault account.' },
};

function updateUI() {
    const m = stepMeta[currentStep];
    // progress
    document.getElementById('progressFill').style.width = (currentStep / 3 * 100) + '%';
    // tag & title
    document.getElementById('tagText').textContent = m.tag;
    document.getElementById('formTitle').textContent = m.title;
    // left panel
    document.getElementById('leftIcon').textContent = m.leftIcon;
    document.getElementById('leftTitle').innerHTML = m.leftTitle;
    document.getElementById('leftSub').textContent = m.leftSub;
    // dots
    [0, 1, 2].forEach(i => {
        const d = document.getElementById('ld' + i);
        d.style.width = i === currentStep - 1 ? '28px' : '8px';
        d.style.background = i < currentStep - 1 ? 'rgba(255,255,255,0.5)' : i === currentStep - 1 ? '#6c63ff' : 'rgba(255,255,255,0.2)';
    });
    // steps
    document.querySelectorAll('.step-section').forEach((s, i) => s.classList.toggle('active', i + 1 === currentStep));
    // buttons
    document.getElementById('btnBack').style.display = currentStep > 1 ? 'inline-flex' : 'none';
    const btnNext = document.getElementById('btnNext');
    btnNext.innerHTML = currentStep === 3 ? '<span>🎉</span><span>Create My Account</span>' : '<span>Continue</span><span>→</span>';
}

function handleInput(id) {
    const input = document.getElementById(id);
    const label = document.getElementById('lbl-' + id);
    if (label) { if (input.value) label.classList.add('lifted'); else label.classList.remove('lifted'); }
    clearErr(id);
}

function handleSelect(id) {
    const sel = document.getElementById(id);
    const label = document.getElementById('lbl-' + id);
    if (label) { if (sel.value) label.classList.add('lifted'); else label.classList.remove('lifted'); }
    clearErr(id);
}

function clearErr(id) {
    const e = document.getElementById('err-' + id);
    if (e) e.classList.remove('show');
    const box = document.getElementById('f-' + id)?.querySelector('.field-box');
    if (box) box.classList.remove('error');
}

// focus/blur lift
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('focus', () => { const l = document.getElementById('lbl-' + el.id); if (l) l.classList.add('lifted'); });
    el.addEventListener('blur', () => { const l = document.getElementById('lbl-' + el.id); if (l && !el.value) l.classList.remove('lifted'); });
});

function showErr(id, msg) {
    const e = document.getElementById('err-' + id);
    if (e) { if (msg) e.textContent = msg; e.classList.add('show'); }
    const box = document.getElementById('f-' + id)?.querySelector('.field-box');
    if (box) box.classList.add('error');
}

function onRoleChange() {
    const role = document.getElementById('role').value;
    document.getElementById('f-year').style.display = role === 'Student' ? 'block' : 'none';
    document.getElementById('f-department').style.display = role === 'Librarian' ? 'none' : 'block';
}

function onPasswordInput() {
    const pw = document.getElementById('password').value;
    const wrap = document.getElementById('strengthWrap');
    if (!pw) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    const s = Math.min(4, Math.floor(pw.length / 3));
    const colors = ['', '#ff6b6b', '#ffa502', '#f7971e', '#11998e'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    for (let i = 1; i <= 4; i++) document.getElementById('sb' + i).style.background = i <= s ? colors[s] : '#e8e4f0';
    document.getElementById('strengthLabel').textContent = labels[s] + ' password';
    document.getElementById('strengthLabel').style.color = colors[s];
}

function togglePw() {
    pwVisible = !pwVisible;
    document.getElementById('password').type = pwVisible ? 'text' : 'password';
    document.getElementById('toggleBtn').textContent = pwVisible ? '🙈' : '👁️';
}

function validate() {
    let ok = true;
    if (currentStep === 1) {
        if (!document.getElementById('firstName').value.trim()) { showErr('firstName'); ok = false; }
        if (!document.getElementById('lastName').value.trim()) { showErr('lastName'); ok = false; }
        const em = document.getElementById('email').value.trim();
        if (!em.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { showErr('email', 'Enter a valid email address'); ok = false; }
        if (!document.getElementById('studentId').value.trim()) { showErr('studentId'); ok = false; }
    }
    if (currentStep === 2) {
        if (!document.getElementById('role').value) { showErr('role', 'Please select a role'); ok = false; }
        const role = document.getElementById('role').value;
        if (role !== 'Librarian' && !document.getElementById('department').value) { 
            showErr('department', 'Please select your department'); ok = false; 
        }
    }
    if (currentStep === 3) {
        const pw = document.getElementById('password').value;
        const cp = document.getElementById('confirmPassword').value;
        const ag = document.getElementById('agreed').checked;
        if (pw.length < 8) { showErr('password', 'At least 8 characters required'); ok = false; }
        if (pw !== cp) { showErr('confirmPassword', "Passwords don't match"); ok = false; }
        const errAg = document.getElementById('err-agreed');
        const cbw = document.getElementById('check-agreed');
        errAg.classList.toggle('show', !ag);
        cbw.classList.toggle('error', !ag);
        if (!ag) ok = false;
    }
    return ok;
}

function goNext() {
    if (!validate()) return;
    if (currentStep < 3) { currentStep++; updateUI(); }
    else {
        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            studentId: document.getElementById('studentId').value.trim(),
            role: document.getElementById('role').value,
            department: document.getElementById('department').value || null,
            year: document.getElementById('year').value,
            password: document.getElementById('password').value
        };

        // Send to backend
        fetch('http://localhost:8000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User created successfully') {
                document.getElementById('successName').textContent = formData.firstName;
                document.getElementById('successEmail').textContent = formData.email;
                document.getElementById('successOverlay').classList.add('show');
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Network error. Please try again.');
        });
    }
}

function goBack() {
    if (currentStep > 1) { currentStep--; updateUI(); }
}

function closeSuccess() {
    window.location.href = '../login/login.html';
}

updateUI();

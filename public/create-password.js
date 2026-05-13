const resetForm = document.getElementById('resetForm');
const btnSubmit = document.getElementById('enter');
const description = document.getElementById('reset-password-desc');

resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('As senhas não correspondem!');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        alert('Token não encontrado.');
        window.location.href = '/index.html';
        return;
    }

    window.history.replaceState({}, document.title, '/create-password.html');

    btnSubmit.disabled = true;

    try {
        const response = await fetch(`/auth/complete-signup?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            const payload = await response.json();
            alert('Senha criada com sucesso.');
            if (payload.access_token) {
                localStorage.setItem('token', payload.access_token);
                window.location.href = '/painel.html';
            } else {
                console.log('No acess token');
            }
        } else {
            const res = await response.json();
            alert(res.error || 'Erro ao criar sua senha');
        }
    } catch (error) {
        console.error('Erro ao criar senha:', error);
        alert('Erro ao criar senha');
    } finally {
        btnSubmit.disabled = false;
    }
});

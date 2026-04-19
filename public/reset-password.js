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
        alert('Token não identificado!');
        window.location.href = '/index.html';
        return;
    }

    btnSubmit.disabled = true;

    try {
        const response = await fetch(`/reset-password?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            alert(
                'Senha redefinida com sucesso! Faça login com sua nova senha.'
            );
            window.location.href = '/index.html';
        } else {
            const res = await response.json();
            alert(res.error || 'Erro ao redefinir senha');
        }
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        alert('Erro ao redefinir senha');
    } finally {
        btnSubmit.disabled = false;
    }
});

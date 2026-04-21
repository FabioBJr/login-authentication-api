const forgotForm = document.getElementById('forgotForm');
const btnSubmit = document.getElementById('enter');
const description = document.getElementById('forgot-password-desc');

forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;

    btnSubmit.disabled = true;

    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'applicantion/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            description.textContent =
                'Se o email existir, um link de recuperação será enviado. Verifique sua caixa de entrada.';

            alert(
                'Se o email existir, um link de recuperação será enviado. Verifique sua caixa de entrada.'
            );
        }
    } catch (error) {
        console.error(
            'Erro ao enviar solicitação de recuperação de senha:',
            error
        );
    } finally {
        btnSubmit.disabled = false;
    }
});

const btnEnter = document.getElementById('enter');
const loginForm = document.getElementById('loginForm');
const btnToggle = document.getElementById('create-account');
const forgotPasswordLink = document.querySelector('.forgot-password');
const campoNome = document.querySelector('.campo:has(input[name="nome"])');
const campoEsqueceuSenha = document.querySelector('.forgot-password-container');

let isLogin = true;

// Alterna tela de cadastro/login
btnToggle.addEventListener('click', () => {
    isLogin = !isLogin;

    loginForm.reset();

    const inputName = document.getElementById('name');

    if (isLogin) {
        campoNome.classList.add('hidden');
        campoEsqueceuSenha.classList.remove('hidden');
        inputName.required = false;
        btnEnter.textContent = 'Entrar';
        btnToggle.querySelector('p').textContent =
            'Não tem uma conta? Clique aqui para criar uma conta';
    } else {
        campoNome.classList.remove('hidden');
        campoEsqueceuSenha.classList.add('hidden');
        inputName.required = true;
        btnEnter.textContent = 'Cadastrar';
        btnToggle.querySelector('p').textContent =
            'Já tem uma conta? Clique aqui para entrar';
    }
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    btnEnter.disable = true;
    btnEnter.textContent = 'Aguarde...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const rota = isLogin ? '/auth/login' : '/auth';

    const dados = { name, email, password };

    try {
        const response = await fetch(rota, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(
                isLogin ? 'Login realizado!' : 'Conta cadastrada com sucesso!'
            );

            if (resultado.access_token) {
                localStorage.setItem('token', resultado.access_token);
                console.log('Token armazenado com sucesso!');
            } else {
                console.log('Não foi possível armazenar token!');
            }

            window.location.href = '/painel.html';
        } else {
            alert('Erro: ' + (resultado.error || 'Falha na operação'));
        }
    } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
        alert('Servidor offline!');
    } finally {
        btnEnter.disable = false;
        btnEnter.textContent = 'Entrar';
    }
});

forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();

    window.location.href = '/forgot-password.html';
});

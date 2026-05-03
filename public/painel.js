const btnEditPhoto = document.querySelector('.edit-photo-btn');
const btnSaveText = document.getElementById('btn-text');
const btnExit = document.getElementById('exit');

function editaFoto() {
    const input = document.createElement('input');
    const photoExibition = document.getElementById('photo-exibition');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const base64String = event.target.result;
            photoExibition.src = base64String;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

async function carregaDadosUsuario() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/auth/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Sessão expirada!');
        }

        const user = await response.json();

        document.getElementById('nome-usuario').textContent = user.name;
        document.getElementById('input-nome').value = user.name;
        document.getElementById('email-usuario').textContent = user.email;
        document.getElementById('num-acessos').value = user.access;

        const photoExibition = document.getElementById('photo-exibition');
        photoExibition.src = user.photo || 'https://via.placeholder.com/100';
    } catch (error) {
        console.log(error);
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

async function atualizaPerfil() {
    btnSaveText.disabled = true;
    btnSaveText.textContent = 'Aguarde...';
    const loading = document.getElementById('spinner');

    try {
        const token = localStorage.getItem('token');
        const userId = document.getElementById('userId');
        const username = document.getElementById('input-nome').value;
        const photoExibition = document.getElementById('photo-exibition');

        loading.classList.remove('hidden');

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const response = await fetch('/users/update-profile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                name: username,
                photo: photoExibition.src,
            }),
        });

        if (!response.ok) throw new Error('Não foi atualizar usuário!');

        const user = await response.json();

        document.getElementById('nome-usuario').textContent = user.name;
        photoExibition.src = user.photo;

        alert('Perfil atualizado com sucesso!');
    } catch (err) {
        console.log(err);
    } finally {
        btnSaveText.disabled = false;
        btnSaveText.textContent = 'Salvar Alterações';
        loading.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('token');

    console.log('Usuário deslogado');

    window.location.replace('/index.html');
}

function capturaToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, '/painel.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    capturaToken();
    carregaDadosUsuario();
});

btnEditPhoto.addEventListener('click', editaFoto);
btnSaveText.addEventListener('click', atualizaPerfil);
btnExit.addEventListener('click', logout);

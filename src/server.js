import http from 'node:http';
import authController from './controllers/authController.js';

const port = 3000;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/users' && req.method === 'POST') {
        return authController.criaUsuario(req, res);
    }

    if (req.url === '/users/login' && req.method === 'POST') {
        return authController.logaUsuario(req, res);
    }

    if (req.url === '/users/forgot-password' && req.method === 'POST') {
        return authController.recuperaSenha(req, res);
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(port, () => console.log('Aplicação rodando'));

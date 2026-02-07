import http from 'node:http';
import AuthController from './app/controllers/authController.js';
import { authMiddleware } from './app/middlewares/authMiddleware.js';

const port = 3000;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/auth' && req.method === 'POST') {
        return AuthController.criaUsuario(req, res);
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
        return AuthController.logaUsuario(req, res);
    }

    if (req.url === '/auth/forgot-password' && req.method === 'POST') {
        return AuthController.recuperaSenha(req, res);
    }

    if (req.url === '/auth/me' && req.method === 'GET') {
        return authMiddleware(AuthController.painelUsuario)(req, res);
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(port, () => console.log('Aplicação rodando'));

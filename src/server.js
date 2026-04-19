import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

import AuthController from './app/controllers/authController.js';
import UserController from './app/controllers/UserController.js';
import { authMiddleware } from './app/middlewares/authMiddleware.js';

const port = 3000;

const server = http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        try {
            const filePath = path.resolve('public', 'index.html');
            const content = await fs.readFile(filePath);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(content);
        } catch (error) {
            res.writeHead(500);
            return res.end('Erro ao carregar index.html');
        }
    }

    if (req.url === '/auth' && req.method === 'POST') {
        return AuthController.criaUsuario(req, res);
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
        return AuthController.logaUsuario(req, res);
    }

    if (req.url.startsWith('/forgot-password') && req.method === 'POST') {
        return AuthController.recuperaSenha(req, res);
    }

    const routePath = req.url.split('?')[0];

    if (routePath === '/reset-password' && req.method === 'GET') {
        try {
            const filePath = path.resolve('public', 'reset-password.html');
            const content = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(content);
        } catch (error) {
            res.writeHead(404);
            return res.end('Página não encontrada');
        }
    }

    if (routePath === '/reset-password' && req.method === 'POST') {
        const token = req.url.split('?token=')[1];

        req.params = { token };
        return AuthController.redefineSenha(req, res);
    }

    if (req.url === '/auth/me' && req.method === 'GET') {
        return authMiddleware(UserController.getProfile)(req, res);
    }

    if (req.url === '/users/update-profile' && req.method === 'PUT') {
        return authMiddleware(UserController.updateProfile)(req, res);
    }

    if (
        req.url !== '/' &&
        req.method === 'GET' &&
        (req.url.endsWith('.css') ||
            req.url.endsWith('.js') ||
            req.url.endsWith('.html'))
    ) {
        try {
            const relativePath = req.url.startsWith('/')
                ? req.url.slice(1)
                : req.url;
            const fullPath = path.resolve(
                process.cwd(),
                'public',
                relativePath
            );

            const content = await fs.readFile(fullPath);

            const ext = path.extname(fullPath);
            const types = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'text/javascript',
                '.png': 'image/png',
            };

            res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
            return res.end(content);
        } catch (error) {
            res.writeHead(404);
            return res.end('Arquivo não encontrado');
        }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(port, () => console.log('Aplicação rodando'));

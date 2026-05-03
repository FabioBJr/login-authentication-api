import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { handleApiRoutes } from './routes.js';

const port = 3000;

const server = http.createServer(async (req, res) => {
    const isApiRoute = await handleApiRoutes(req, res);
    if (isApiRoute !== false) {
        return;
    }

    const routePath = req.url.split('?')[0];

    if (routePath === '/' && req.method === 'GET') {
        return serveFile(res, 'index.html', 'text/html');
    }

    if (routePath === '/reset-password' && req.method === 'GET') {
        return serveFile(res, 'reset-password.html', 'text/html');
    }

    if (req.method === 'GET') {
        try {
            const cleanUrl = req.url.split('?')[0];
            const relativePath = cleanUrl.startsWith('/')
                ? cleanUrl.slice(1)
                : cleanUrl;
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
        } catch (error) {}
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

async function serveFile(res, filename, contentType) {
    try {
        const filePath = path.resolve('public', filename);
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(content);
    } catch (error) {
        res.writeHead(404);
        return res.end('Página não encontrada');
    }
}

server.listen(port, () => console.log(`Aplicação rodando na porta ${port}`));

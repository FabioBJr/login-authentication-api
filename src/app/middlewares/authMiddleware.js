import { validaToken } from '../utils/jwt.js';

export function authMiddleware(handler) {
    return async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                res.writeHead(401);
                return res.end(
                    JSON.stringify({ error: 'Token não fornecido' })
                );
            }

            const [, token] = authHeader.split(' ');

            if (!token) {
                res.writeHead(401);
                res.end(
                    JSON.stringify({ error: 'Erro na formatação do token' })
                );
            }

            const decoded = validaToken(token);

            if (!decoded) {
                res.writeHead(401);
                res.end();
            }

            req.user = decoded;

            return handler(req, res);
        } catch (error) {
            res.writeHead(401);
            return res.end(JSON.stringify({ error: error.message }));
        }
    };
}

import { validaEmail, validaSenha } from '../utils/validators.js';
import { geraSenhaHash, verificaSenha } from '../utils/password.js';
import { geraToken } from '../utils/jwt.js';

import User from '../models/User.js';

class AuthController {
    async criaUsuario(req, res) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const payload = JSON.parse(body);
            const { email, password } = payload;

            try {
                if (!email || !validaEmail(email)) {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({ error: 'Informe um email válido' })
                    );
                }

                if (!password || !validaSenha(password)) {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({ error: 'Informe uma senha forte.' })
                    );
                }
            } catch (error) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({
                        error: 'Corpo da requisição inválido (JSON malformado)',
                        error,
                    })
                );
            }

            if (await User.findUser(email)) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({
                        error: 'Este email já está em uso.', // Feature: Deseja fazer login?
                    })
                );
            }

            const { salt, hash } = await geraSenhaHash(password);

            const user = await User.create(email, hash, salt);

            if (user) {
                const exp = 3600 * 2;
                const expiraEm = Math.floor(Date.now() / 1000) + exp;

                const token = geraToken({
                    id: user.id,
                    email: user.email,
                    exp: expiraEm,
                });

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        message: 'Usuário criado com sucesso!',
                        user: { id: user.id, email: user.email },
                        access_token: token,
                    })
                );
            } else {
                res.writeHead(400);
                res.end({ error: 'Não foi possível criar usuário.' });
            }
        });
    }

    async logaUsuario(req, res) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const payload = JSON.parse(body);
            const { email, password } = payload;

            try {
                if (!email || !validaEmail(email)) {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({ error: 'Informe um email válido' })
                    );
                }

                if (!password || !validaSenha(password)) {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({ error: 'Informe uma senha forte' })
                    );
                }
            } catch (error) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error }));
            }

            const user = await User.findUser(email);

            if (user) {
                if (
                    await verificaSenha(password, user.password_hash, user.salt)
                ) {
                    const exp = 3600 * 2;
                    const expiraEm = Math.floor(Date.now() / 1000) + exp;
                    const token = geraToken({
                        id: user.id,
                        email: user.email,
                        exp: expiraEm,
                    });

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(
                        JSON.stringify({
                            message: `Login realizado com sucesso. Bem vindo(a) ${user.email}`,
                            user: { id: user.id, email: user.email },
                            access_token: token,
                        })
                    );
                } else {
                    res.writeHead(400);
                    return res.end(
                        JSON.stringify({ error: 'Senha incorreta.' })
                    );
                }
            } else {
                res.writeHead(400);
                res.end(
                    JSON.stringify({
                        error: `Nenhuma conta encontrada com este email: ${email}`, // Feature para encaminhar para tela de login
                    })
                );
            }
        });
    }

    async painelUsuario(req, res) {
        res.writeHead(200);
        return res.end(console.log('TELA DE PAINEL DE USUÁRIO'));
    }

    async recuperaSenha(req, res) {}
}

export default new AuthController();

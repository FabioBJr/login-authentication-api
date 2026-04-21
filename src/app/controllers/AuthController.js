import crypto from 'node:crypto';
import Mail from '../lib/Mail.js';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { parseJSONBody } from '../utils/requestHelper.js';
import { checkEmail, checkPassword } from '../utils/validators.js';
import { generateHash, verifyPassword } from '../utils/password.js';

class AuthController {
    async createUser(req, res) {
        const { name, email, password } = await parseJSONBody(req);

        try {
            if (!name) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Informe um nome de usuário' })
                );
            }

            if (!email || !checkEmail(email)) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Informe um email válido' })
                );
            }

            if (!password || !checkPassword(password)) {
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
                    error: 'Este email já está em uso.',
                })
            );
        }

        const { salt, hash } = await generateHash(password);

        const user = await User.create(name, email, hash, salt);

        if (user) {
            const exp = 3600 * 2;
            const expiraEm = Math.floor(Date.now() / 1000) + exp;

            const token = generateToken({
                id: user.id,
                email: user.email,
                exp: expiraEm,
            });

            User.accessSucceed(user.id);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'Usuário criado com sucesso!',
                    user: {
                        id: user.id,
                        name: user.username,
                        email: user.email,
                    },
                    access_token: token,
                })
            );
        } else {
            res.writeHead(400);
            res.end(
                JSON.stringify({ error: 'Não foi possível criar usuário.' })
            );
        }
    }

    async userLogin(req, res) {
        const { email, password } = await parseJSONBody(req);

        try {
            if (!email || !checkEmail(email)) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Informe um email válido' })
                );
            }

            if (!password || !checkPassword(password)) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Email ou senha incorreta.' })
                );
            }
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error }));
        }

        const user = await User.findUser(email);

        if (user) {
            if (await verifyPassword(password, user.password_hash, user.salt)) {
                const exp = 3600 * 2;
                const expiraEm = Math.floor(Date.now() / 1000) + exp;
                const token = generateToken({
                    id: user.id,
                    email: user.email,
                    exp: expiraEm,
                });

                User.accessSucceed(user.id);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        message: `Login realizado com sucesso. Bem vindo(a) ${user.username}`,
                        user: {
                            id: user.id,
                            name: user.username,
                            email: user.email,
                        },
                        access_token: token,
                    })
                );
            } else {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Email ou senha incorreta.' })
                );
            }
        } else {
            res.writeHead(400);
            res.end(
                JSON.stringify({
                    error: 'Email ou senha incorreta.',
                })
            );
        }
    }

    async recoverPassword(req, res) {
        const { email } = await parseJSONBody(req);

        const user = await User.findUser(email);

        if (!user) {
            res.writeHead(200);
            return res.end(
                JSON.stringify({
                    message:
                        'Se este e-mail estiver cadastrado, você receberá um link.',
                })
            );
        }

        const token = crypto.randomBytes(16).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        try {
            await User.saveResetToken(user.id, token, now);

            Mail.send({
                to: email,
                subject: 'Redefinição de senha',
                text: `
                        Foi solicitada a redefinição de sua senha de acesso
                        
                        Se essa solicitação não foi feita por você, desconsidere esta mensagem pois
                        nenhuma alteração foi feita em seus dados.
                        
                        Para efetivar a redefinição da sua senha, clique no link abaixo para
                        acessar a página de cadastramento de nova senha:
                        
                        Link: http://localhost:3000/reset-password?token=${token}
                        
                        Atenção: O link acima é válido até ${now}
                        e será invalidado se um novo e-mail de recuperação de senha for solicitado.
                    `.replace(/^\s+/gm, ''),
            });
        } catch (error) {
            res.writeHead(200);
            res.end(
                JSON.stringify({
                    error: error.message,
                })
            );
        }

        res.writeHead(200);
        res.end(
            JSON.stringify({
                message:
                    'Se este e-mail estiver cadastrado, você receberá um link.',
            })
        );
    }

    async resetPassword(req, res) {
        const { password } = await parseJSONBody(req);
        const token = req.params.token;

        try {
            if (!password || !checkPassword(password)) {
                res.writeHead(400);
                return res.end(
                    JSON.stringify({ error: 'Informe uma senha forte' })
                );
            }
        } catch (error) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error }));
        }

        if (await User.tokenExpired(token)) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: 'Token expirou' }));
        }

        const { salt, hash } = await generateHash(password);

        const user = await User.resetPassword(token, hash, salt);

        if (user) {
            res.writeHead(200);
            return res.end(
                JSON.stringify({
                    message: `Senha redefinida com sucesso ${user.email}. Realize o login para acessar sua conta.`,
                })
            );
        } else {
            res.writeHead(400);
            return res.end(
                JSON.stringify({
                    erro: `Ocorreu um erro ao redefiner sua senha. Tente novamente.`,
                })
            );
        }
    }
}

export default new AuthController();

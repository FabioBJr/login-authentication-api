import crypto from 'node:crypto';
import Mail from '../lib/Mail.js';
import { google } from 'googleapis';
import User from '../models/User.js';
import { stringify } from 'node:querystring';
import { generateToken } from '../utils/jwt.js';
import authConfig from '../../config/authenticators.js';
import { parseJSONBody } from '../utils/requestHelper.js';
import { checkEmail, checkPassword } from '../utils/validators.js';
import { generateHash, verifyPassword, expirationTime } from '../utils/password.js';

class AuthController {
    async createUser(req, res) {
        const { name, email, password } = await parseJSONBody(req);

        try {
            if (!name) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Informe um nome de usuário' }));
            }

            if (!email || !checkEmail(email)) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Informe um email válido' }));
            }

            if (!password || !checkPassword(password)) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Informe uma senha forte.' }));
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
            const expiresIn = expirationTime();

            const token = generateToken({
                id: user.id,
                email: user.email,
                exp: expiresIn,
            });

            User.accessSucceed(user.id);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(
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
            res.end(JSON.stringify({ error: 'Não foi possível criar usuário.' }));
        }
    }

    async userLogin(req, res) {
        const { email, password } = await parseJSONBody(req);

        try {
            if (!email || !checkEmail(email)) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Informe um email válido' }));
            }

            if (!password || !checkPassword(password)) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Email ou senha incorreta.' }));
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
                return res.end(JSON.stringify({ error: 'Email ou senha incorreta.' }));
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
                    message: 'Se este e-mail estiver cadastrado, você receberá um link.',
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
                message: 'Se este e-mail estiver cadastrado, você receberá um link.',
            })
        );
    }

    async resetPassword(req, res) {
        const { password } = await parseJSONBody(req);
        const token = req.params.token;

        try {
            if (!password || !checkPassword(password)) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Informe uma senha forte' }));
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

    githubRedirect(req, res) {
        try {
            const client_id = authConfig.github.clientId;
            const redirectUri = 'http://localhost:3000/auth/github/callback';
            const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirectUri}&scope=user:email`;

            res.writeHead(302, { Location: githubUrl });
            res.end();
        } catch (err) {
            console.error('Erro no endpoint de redirecionamento', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro no redirecionamento' }));
        }
    }

    async githubCallback(req, res) {
        try {
            const url = req.url.split('code=');
            const client_id = authConfig.github.clientId;
            const client_secret = authConfig.github.clientSecret;

            if (url.length < 2) {
                console.log('Autorização cancelada ou código ausente.');
                res.writeHead(302, {
                    Location: '/index.html',
                });
                return res.end();
            }

            const code = url[1];

            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ client_id, client_secret, code }),
            });

            if (!tokenResponse.ok) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Erro ao obter token.' }));
            }

            const tokenData = await tokenResponse.json();

            if (tokenData.error || !tokenData.access_token) {
                console.error('Erro na troca do código:', tokenData.error_description);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Código de autorização inválido.' }));
            }

            const { access_token } = tokenData;

            const userResponse = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            if (!userResponse.ok) {
                const error = await userResponse.text();
                console.error('Erro ao conectar com Github:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Falha ao buscar perfil.' }));
            }

            const githubUser = await userResponse.json();

            if (!githubUser) {
                console.log('Erro ao encontrar o usuário github.');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(
                    JSON.stringify({
                        error: 'Falha ao capturar dados do usuário',
                    })
                );
            }

            let userEmail = githubUser.email;

            if (!userEmail) {
                const emailResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                if (!emailResponse.ok) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json',
                    });
                    return res.end(
                        JSON.stringify({
                            error: 'Erro ao buscar emails privados.',
                        })
                    );
                }

                const emails = await emailResponse.json();
                const primaryEmail = emails.find((o) => o.primary && o.verified);

                userEmail = primaryEmail ? primaryEmail.email : emails[0].email;
            }

            let user = await User.findUser(userEmail);

            if (!user) {
                const payload = {
                    name: githubUser.login,
                    email: userEmail,
                    photo: githubUser.avatar_url,
                };

                const tempToken = generateToken(payload);

                res.writeHead(302, { Location: `/create-password.html?token=${tempToken}` });
                return res.end();
            }

            const token = generateToken({ id: user.id, email: user.email });
            User.accessSucceed(user.id);

            res.writeHead(302, { Location: `/painel.html?token=${token}` });
            return res.end();
        } catch (error) {
            console.error('Erro no fluxo de autenticação:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Erro interno no servidor.' }));
        }
    }

    async createAuthenticatedUser(req, res) {
        try {
            const { password } = await parseJSONBody(req);
            const token = req.params.token;
            const encodedPayload = token.split('.')[1];

            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

            const { salt, hash } = await generateHash(password);

            const user = await User.create(payload.name, payload.email, hash, salt, payload.photo);

            if (user) {
                const expiresIn = expirationTime();

                const token = generateToken({
                    id: user.id,
                    email: user.email,
                    exp: expiresIn,
                });
                User.accessSucceed(user.id);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(
                    JSON.stringify({
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            photo: user.photo,
                        },
                        access_token: token,
                    })
                );
            }
        } catch (err) {
            res.writeHead(400, { Content_type: 'application/json' });
            return res.end(JSON.stringify({ error: 'Erro ao criar novo usuário' }));
        }
    }

    googleRedirect(req, res) {
        try {
            const client_id = authConfig.google.clientId;
            const clientSecret = authConfig.google.clientSecret;
            const redirectUri = 'http://localhost:3000/auth/google/callback';

            const oauth2Client = new google.auth.OAuth2(client_id, clientSecret, redirectUri);

            const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

            const googleUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                include_granted_scopes: true,
            });

            res.writeHead(302, { Location: googleUrl });
            res.end();
        } catch (err) {
            console.error('Erro no endpoint de redirecionamento', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro no redirecionamento' }));
        }
    }

    async googleCallback(req, res) {
        try {
            const client_id = authConfig.google.clientId;
            const clientSecret = authConfig.google.clientSecret;
            const redirectUri = 'http://localhost:3000/auth/google/callback';

            const oauth2Client = new google.auth.OAuth2(client_id, clientSecret, redirectUri);
            const baseURL = 'http://localhost:3000';
            const parsedUrl = new URL(req.url, baseURL);

            const code = parsedUrl.searchParams.get('code');

            if (!code) {
                console.log('Autorização cancelada ou código ausente.');
                res.writeHead(302, { Location: '/index.html' });
                return res.end();
            }

            const { tokens } = await oauth2Client.getToken(code);

            oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2',
            });

            const userInfo = await oauth2.userinfo.get();
            const googleUser = userInfo.data;

            let user = await User.findUser(googleUser.email);

            if (!user) {
                const tempToken = generateToken({
                    name: googleUser.name,
                    email: googleUser.email,
                    photo: googleUser.picture,
                });

                res.writeHead(302, { Location: `/create-password.html?token=${tempToken}` });
                return res.end();
            }

            const token = generateToken({ id: user.id, email: user.email });
            User.accessSucceed(user.id);

            res.writeHead(302, { Location: `/painel.html?token=${token}` });
            return res.end();
        } catch (err) {
            console.error('Erro no fluxo de callback Google', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Erro interno no servidor.' }));
        }
    }
}

export default new AuthController();

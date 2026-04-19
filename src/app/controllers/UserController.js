import User from '../models/User.js';

class UserController {
    async getProfile(req, res) {
        try {
            const user = await User.findUserById(req.user.id);

            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(
                    JSON.stringify({ error: 'Usuário não encontrado' })
                );
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(
                JSON.stringify({
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    photo: user.image,
                    access: user.access_count,
                })
            );
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(
                JSON.stringify({ error: 'Erro interno no servidor' })
            );
        }
    }

    async updateProfile(req, res) {
        let body = '';
        const userId = req.user.id;

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { name, photo } = JSON.parse(body);

                const result = await User.update(userId, name, photo);

                return res.end(
                    JSON.stringify({
                        id: result.id,
                        name: result.username,
                        photo: result.image,
                    })
                );
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'applicant/json' });
                return res.end(
                    JSON.stringify({ error: 'Erro ao atualizar perfil' })
                );
            }
        });
    }
}

export default new UserController();

import User from '../models/User.js';
import { parseJSONBody } from '../utils/requestHelper.js';

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
        const userId = req.user.id;
        const { name, photo } = await parseJSONBody(req);

        try {
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
    }
}

export default new UserController();

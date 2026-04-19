import pool from '../../database/index.js';

class User {
    async create(name, email, passwordHash, salt) {
        const query = `
            INSERT INTO users (username, email, password_hash, salt)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email;
        `;
        const values = [name, email, passwordHash, salt];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }

    async update(id, username, image) {
        try {
            const query = `
                UPDATE users SET username = COALESCE($2, username), image = COALESCE($3, image)
                WHERE id = $1
                RETURNING id, username, image;
            `;
            const values = [id, username, image];

            const { rows } = await pool.query(query, values);

            return rows[0];
        } catch (err) {
            console.log(err);
        }
    }

    async delete(email) {
        const query = `
            DELETE FROM users WHERE TRIM(email) = $1;
        `;

        await pool.query(query, [email]);
    }

    async findUser(email) {
        const query = `
            SELECT id, username, email, password_hash, salt FROM users WHERE TRIM(email) = $1;
        `;

        const { rows } = await pool.query(query, [email]);

        return rows[0];
    }

    async findUserById(id) {
        const query = `
            SELECT id, username, email, image, access_count FROM users WHERE id = $1;
        `;

        const { rows } = await pool.query(query, [id]);

        return rows[0];
    }

    async salvaResetToken(id, token, dataExpiracao) {
        const query = `
            UPDATE users
            SET password_reset_token = $1,
                password_reset_expires = $2
            WHERE id = $3
        `;

        await pool.query(query, [token, dataExpiracao, id]);
    }

    async tokenExpired(token) {
        const query = `
            SELECT password_reset_expires FROM users WHERE TRIM(password_reset_token) = $1;
        `;

        const { rows } = await pool.query(query, [token]);

        return new Date() > rows[0].password_reset_expires;
    }

    async resetPassword(token, passwordHash, salt) {
        const query = `
                UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL, password_hash = $2, salt = $3
                WHERE TRIM(password_reset_token) = $1
                RETURNING id, email;
            `;
        const values = [token, passwordHash, salt];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }

    async accessSucceed(id) {
        const query = `
            UPDATE users SET access_count = access_count + 1 WHERE id = $1; 
        `;

        await pool.query(query, [id]);
    }
}

export default new User();

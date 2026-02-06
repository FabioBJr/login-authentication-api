import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

export async function geraSenhaHash(password) {
    const salt = crypto.randomBytes(16).toString('hex');

    const hashKey = await scryptAsync(password, salt, 16);

    return {
        salt,
        hash: hashKey.toString('hex'),
    };
}

export async function verificaSenha(password, storedHash, storedSalt) {
    const hashKey = await scryptAsync(password, storedSalt, 16);

    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    // Evitar ataques por tentativa bruta calculando o tempo
    return crypto.timingSafeEqual(hashKey, storedHashBuffer);
}

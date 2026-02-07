import process from 'node:process';
import 'dotenv/config';

import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET;

function base64UrlEncode(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function geraToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);

    const assinatura = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${assinatura}`;
}

export function validaToken(token) {
    const [encodedHeader, encodedPayload, assinatura] = token.split('.');

    const novaAssinatura = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    if (assinatura !== novaAssinatura) {
        throw new Error('Token inválido');
    }

    const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString()
    );

    console.log(JSON.stringify(payload));

    if (payload.exp) {
        const timestampAtual = Math.floor(Date.now() / 1000);

        if (timestampAtual > payload.exp) {
            throw new Error('Token expirou. Faça login novamente');
        }
    }

    return payload;
}

import process from 'node:process';
import 'dotenv/config';

export default {
    jwt: process.env.JWT_SECRET,
};

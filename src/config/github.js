import process from 'node:process';
import 'dotenv/config';

export default {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
};

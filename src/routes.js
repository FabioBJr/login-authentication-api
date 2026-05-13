import AuthController from './app/controllers/authController.js';
import UserController from './app/controllers/UserController.js';
import { authMiddleware } from './app/middlewares/authMiddleware.js';

const apiRoutes = {
    'POST:/auth': AuthController.createUser,
    'POST:/auth/login': AuthController.userLogin,
    'POST:/forgot-password': AuthController.recoverPassword,
    'GET:/auth/me': authMiddleware(UserController.getProfile),
    'PUT:/users/update-profile': authMiddleware(UserController.updateProfile),
    'GET:/auth/github': AuthController.githubRedirect,
    'GET:/auth/github/callback': AuthController.githubCallback,
    'GET:/auth/google': AuthController.googleRedirect,
    'GET:/auth/google/callback': AuthController.googleCallback,
};

export async function handleApiRoutes(req, res) {
    const method = req.method;
    const routePath = req.url.split('?')[0];

    const routeKey = `${method}:${routePath}`;
    const handler = apiRoutes[routeKey];

    if (routeKey === 'POST:/reset-password') {
        req.params = { token: req.url.split('?token=')[1] };
        return AuthController.resetPassword(req, res);
    }

    if (routeKey === 'POST:/auth/complete-signup') {
        req.params = { token: req.url.split('?token=')[1] };
        return AuthController.createAuthenticatedUser(req, res);
    }

    if (handler) {
        return handler(req, res);
    }

    return false;
}

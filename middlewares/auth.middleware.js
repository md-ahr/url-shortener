import { validateUserToken } from "../utils/token.js";

export async function authenticationMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return next();

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "Authorization header must start with Bearer!" });
    }

    const [_, token] = authHeader.split(" ");

    if (!token) {
        return res.status(400).json({ error: "Authorization header must include a bearer token!" });
    }

    req.user = validateUserToken(token);

    next();
}

export function ensureAuthenticated(req, res, next) {
    if (!req?.user?.id) {
        return res.status(401).json({ error: "You must be logged in to access this resource!" });
    }
    next();
}

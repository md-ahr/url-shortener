import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validation/token.validation.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken(payload) {
    const validationResult = await userTokenSchema.safeParseAsync(payload);

    if (validationResult.error) {
        throw new Error(validationResult.error.message);
    }

    const payloadValidatedData = validationResult.data;

    return jwt.sign(payloadValidatedData, JWT_SECRET);
}

export function validateUserToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch(error) {
        console.log(error);
        return null;
    }
}

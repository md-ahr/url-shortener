import express from "express";
import {
    signupPostRequestBodySchema,
    loginPostRequestBodySchema,
} from "../validation/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import { createUserToken } from "../utils/token.js";

const router = express.Router();

router.post('/signup', async (req, res) => {
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        res.status(400).json({ error: validationResult.error.format() });
    }

    const { firstName, lastName, email, password } = validationResult.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return res.status(400).json({ error: `User with email ${email} already exists!` });
    }

    const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

    const user = await createUser({ firstName, lastName, email, hashedPassword, salt });

    return res.status(201).json({ status: "success", message: "User registered successfully!", data: { userId: user.id } });
})

router.post('/login', async (req, res) => {
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        res.status(400).json({ error: validationResult.error.format() });
    }

    const {  email, password } = validationResult.data;

    const user = await getUserByEmail(email);

    if (!user) {
        return res.status(404).json({ error: `User with email ${email} does not exists!` });
    }

    const { password: hashedPassword } = hashPasswordWithSalt(password, user.salt);

    if (user.password !== hashedPassword) {
        return res.status(401).json({ error: `Invalid email or password!` });
    }

    const token = await createUserToken({ id: user.id });

    return res.status(200).json({ status: "success", message: "User logged in successfully!", data: { token } });
})

export default router;

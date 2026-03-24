import express from "express";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { shortenPostRequestBodySchema } from "../validation/request.validation.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { createShortUrl } from "../services/url.service.js";
import db from "../db/index.js";
import { urlsTable } from "../models/index.js";

const router = express.Router();

router.get("/codes", ensureAuthenticated, async (req, res) => {
    console.log({msg: "click"})
    const codes = await db
        .select()
        .from(urlsTable)
        .where(eq(urlsTable.userId, req.user.id));

    return res.status(200).json({ status: "success", data: { codes } });
});

router.get("/:shortCode", async (req, res) => {
    const code = req.params.shortCode;
    const [result] = await db
        .select({ targetUrl: urlsTable.targetUrl })
        .from(urlsTable)
        .where(eq(urlsTable.shortCode, code));

    if (!result) {
        return res.status(404).json({ error: "Invalid url!" });
    }

    return res.redirect(result.targetUrl);
});

router.post("/shorten", ensureAuthenticated, async (req, res) => {
    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);

    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const result = await createShortUrl(shortCode, url, req.user.id);

    return res
        .status(201)
        .json({
            status: "success",
            message: "Provided url shorted successfully!",
            data: { id: result.id, shortCode: result.shortCode, targetUrl: result.targetUrl }
        });
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
    await db
        .delete(urlsTable)
        .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));
    return res.status(200).json({ status: "success", message: "Url deleted successfully!" });
});

export default router;

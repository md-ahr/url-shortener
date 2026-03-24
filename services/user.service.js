import { eq } from "drizzle-orm";
import db from "../db/index.js"
import { usersTable } from "../models/index.js";

export async function getUserByEmail(email) {
    const [existingUser] = await db
        .select({
            id: usersTable.id,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            email: usersTable.email,
            salt: usersTable.salt,
            password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));

    return existingUser;
}

export async function createUser({ firstName, lastName, email, hashedPassword, salt }) {
    const [user] = await db
        .insert(usersTable)
        .values({ firstName, lastName, email, password: hashedPassword, salt })
        .returning({ id: usersTable.id });

    return user;
}

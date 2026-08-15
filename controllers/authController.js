import bcrypt, { hash } from "bcrypt";
import AppError from "../models/appError.js";
import sql from "../db.js";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return next(new AppError(400, 'One or more missing fields'))
    }
    // TODO: validate email
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`INSERT INTO users(username, email, password) values(${username}, ${email},${hashedPassword})`;

    res.status(201).json({ status: 'success', message: 'User created' });
}

export const login = async (req, res, next) => {
    const { username, password } = req.body;
}
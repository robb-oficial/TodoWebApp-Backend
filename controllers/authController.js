import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
};

export const login = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new AppError(400, 'One or more missing fields'));
    }
    const storedUser = await sql`SELECT id,username, password FROM users where username = ${username}`;
    if (storedUser.count === 0) {
        return next(new AppError(400, 'User with that username does not exist'));
    }
    const passwordsMatch = await bcrypt.compare(password, storedUser[0].password);
    if (!passwordsMatch) {
        return next(new AppError(401, 'Incorrect password'));
    }
    const jwtPayload = { id: storedUser[0].id };
    jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, { expiresIn: '2d' }, (err, token) => {
        if (err) {
            return next(new AppError(500, 'Error creating token'));
        }
        // TODO: add secure attribute and maybe sameSite
        res.cookie('jwt_token', token, {
            httpOnly: true,
            maxAge: 48 * 60 * 60 * 1000
        });
        return res.json({ status: 'success', message: 'sent token' });
    });
};

export const verifyJWT = (req, res, next) => {
    const token = req.cookies['jwt_token'];
    if (!token) {
        return next(new AppError(401, 'You need to login to access this route'));
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
            return next(new AppError(401, 'Could not verify token'));
        }
        req.user = data;
        next()
    });
}
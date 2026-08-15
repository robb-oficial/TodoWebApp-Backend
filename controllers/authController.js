import AppError from "../models/appError.js";

export const signup = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return next(new AppError(400, 'One or more missing fields'))
    }

    res.json({ msg: 'ended', username, email, password })
}
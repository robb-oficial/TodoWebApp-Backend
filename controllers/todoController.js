import sql from "../db.js";
import AppError from "../models/appError.js";

export const getTodos = async (req, res, next) => {
    const userId = req.user.id;
    const todos = await sql`
        SELECT id, title, content, priority, status, deadline, created_at
        FROM todos
        WHERE user_id = ${userId} AND is_deleted = false;
    `;

    res.status(200).json({
        status: 'success',
        data: todos
    });
};

export const getSingleTodo = async (req, res, next) => {
    const userId = req.user.id;
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
        return next(new AppError(400, 'Todo Id must be an integer'));
    }

    const todo = await sql`SELECT * FROM todos WHERE id = ${todoId} AND user_id = ${userId} AND is_deleted = false`;
    if (todo.count === 0) {
        return next(new AppError(404, 'Todo not found'));
    }
    let data = { todo: todo[0] };
    const queriedPhotos = await sql`
        SELECT path from todos AS t 
        JOIN contains_photos ON t.id = contains_photos.todo_id 
        JOIN photos ON photos.id = contains_photos.photo_id
        WHERE t.id = ${todoId} AND t.user_id = ${userId}
    `;

    if (queriedPhotos.count !== 0) {
        data = { ...data, photos: queriedPhotos };
    }
    res.status(200).json({
        status: 'success',
        data
    });
};

export const createTodo = async (req, res, next) => {
    const userId = req.user.id;
    const { title, content, priority, deadline } = req.body;
    const photos = req.files;

    if (!title || !content || !priority) {
        return next(new AppError(400, 'Missing any of the fields: title, content, priority'));
    }

    const todo = {
        title,
        content,
        priority: parseInt(priority),
        deadline,
        user_id: userId
    };

    Object.keys(todo).forEach(key => todo[key] === undefined ? delete todo[key] : {});

    const insertion = await sql`INSERT INTO todos ${sql(todo)} RETURNING *`;

    let data = { newTodo: insertion[0] }
    // error
    if (photos.length) {
        const paths = photos.map(photo => ({ path: photo.path.replace(/\\/g, '/') }));
        const photosInserted = await sql`INSERT INTO photos ${sql(paths)} RETURNING *`;

        const joins = photosInserted.map(photo => ({ todo_id: insertion[0].id, photo_id: photo.id }));
        const joinInsertion = await sql`INSERT INTO contains_photos ${sql(joins)}`;
        data = { ...data, photos: photosInserted };
    }

    res.status(201).json({
        status: 'success',
        data
    });
};

export const editTodo = async (req, res, next) => {
    const userId = req.user.id;
    const todoId = parseInt(req.params.id);
    const { title, content, priority, deadline } = req.body;
    const photos = req.files;

    if (isNaN(todoId)) {
        return next(new AppError(400, 'Todo Id must be an integer'));
    }

    const updatedTodo = {
        title,
        content,
        priority: parseInt(priority),
        deadline
    };

    Object.keys(updatedTodo).forEach(key => updatedTodo[key] === undefined ? delete updatedTodo[key] : {});
    const columnsToUpdate = Object.keys(updatedTodo);
    const update = await sql`
        UPDATE todos SET ${sql(updatedTodo, columnsToUpdate)}
        WHERE id = ${todoId} AND user_id = ${userId} RETURNING *
    `;

    let data = { editedTodo: update[0] };


    if (photos.length) {
        const paths = photos.map(photo => ({ path: photo.path.replace(/\\/g, '/') }));
        const photosInserted = await sql`INSERT INTO photos ${sql(paths)} RETURNING *`;

        const joins = photosInserted.map(photo => ({ todo_id: todoId, photo_id: photo.id }));
        const joinInsertion = await sql`INSERT INTO contains_photos ${sql(joins)}`;
        data = { ...data, photos: photosInserted };
    }

    res.status(201).json({
        status: 'success',
        data
    });
};

export const deleteTodo = async (req, res, next) => {
    const userId = req.user.id;
    const todoId = parseInt(req.params.id);

    if (isNaN(todoId)) {
        return next(new AppError(400, 'Todo Id must be an integer'));
    }

    const todo = await sql`SELECT * FROM todos WHERE id = ${todoId} AND user_id = ${userId} AND is_deleted = false`;
    if (todo.count === 0) {
        return next(new AppError(404, 'Target todo not found'));
    }

    const deletion = await sql`UPDATE todos SET is_deleted = true WHERE id = ${todoId} AND user_id = ${userId}`;
    res.status(204).end();
};
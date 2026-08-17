DROP TABLE IF EXISTS contains_photos;
DROP TABLE IF EXISTS has_tags;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TYPE todo_status AS ENUM ('pending', 'done', 'expired');

CREATE TABLE users(
    id SERIAL UNIQUE NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_pic TEXT UNIQUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE todos(
    id SERIAL UNIQUE NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER NOT NULL,
    status todo_status NOT NULL DEFAULT 'pending',
    deadline TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE tags(
    id SERIAL UNIQUE NOT NULL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE has_tags(
    todo_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY(todo_id) REFERENCES todos(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id)
);

CREATE TABLE photos(
    id SERIAL UNIQUE NOT NULL PRIMARY KEY,
    path TEXT UNIQUE NOT NULL
);

CREATE TABLE contains_photos(
    todo_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    PRIMARY KEY (todo_id, photo_id),
    FOREIGN KEY(todo_id) REFERENCES todos(id),
    FOREIGN KEY(photo_id) REFERENCES photos(id)
);
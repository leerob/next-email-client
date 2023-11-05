# Next.js Email Client

## TODO

- Need to clear form after sending email
- Probably need both sender and recipient everywhere so to and from are right

## Schema

```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    subject VARCHAR(255),
    body TEXT,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE user_folders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    folder_id INTEGER REFERENCES folders(id)
);

CREATE TABLE email_folders (
    id SERIAL PRIMARY KEY,
    email_id INTEGER REFERENCES emails(id),
    folder_id INTEGER REFERENCES folders(id)
);
```

## Sample Data

```
INSERT INTO users (first_name, last_name, email)
VALUES ('John', 'Doe', 'john.doe@example.com'),
       ('Jane', 'Doe', 'jane.doe@example.com'),
       ('Alice', 'Smith', 'alice.smith@example.com'),
       ('Bob', 'Johnson', 'bob.johnson@example.com');

INSERT INTO emails (sender_id, recipient_id, subject, body, sent_date)
VALUES (1, 2, 'Meeting Reminder', 'Don''t forget about our meeting tomorrow at 10am.', '2022-01-10 09:00:00'),
       (1, 3, 'Hello', 'Just wanted to say hello.', '2022-01-09 08:00:00'),
       (2, 1, 'Re: Meeting Reminder', 'I won''t be able to make it.', '2022-01-10 10:00:00'),
       (3, 1, 'Re: Hello', 'Hello to you too!', '2022-01-09 09:00:00'),
       (4, 1, 'Invitation', 'You are invited to my party.', '2022-01-11 07:00:00'),
       (1, 2, 'Work Project', 'Let''s discuss the new work project.', '2022-01-12 07:00:00'),
       (1, 4, 'Expenses Report', 'Please find the expenses report attached.', '2022-01-13 07:00:00'),
       (4, 1, 'Personal Note', 'Let''s catch up sometime.', '2022-01-14 07:00:00');

INSERT INTO folders (name)
VALUES ('Inbox'),
       ('Flagged'),
       ('Sent'),
       ('Work'),
       ('Expenses'),
       ('Personal');

INSERT INTO user_folders (user_id, folder_id)
VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
       (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
       (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
       (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6);

INSERT INTO email_folders (email_id, folder_id)
VALUES (1, 1),
       (2, 1),
       (3, 3),
       (4, 1),
       (5, 1),
       (6, 4),
       (7, 5),
       (8, 6);
```

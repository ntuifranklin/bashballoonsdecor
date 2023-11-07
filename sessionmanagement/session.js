
require('dotenv').config();
const session_database_options = {
    host: process.env.SESSION_DATABASE_HOST,
    port: process.env.SESSION_DATABASE_PORT,
    user: process.env.SESSION_DATABASE_USER,
    password: process.env.SESSION_DATABASE_PASSWORD,
    database: process.env.SESSION_DATABASE_NAME,
};

exports.session_database_options = session_database_options;


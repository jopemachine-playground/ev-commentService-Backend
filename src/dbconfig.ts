export function dbConfig (database: string, connectionLimit: number) {
  return {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: database,
    connectionLimit: connectionLimit
  }
}

export const userDBConfig = dbConfig('userdb', 4);

export const usersURLConfig = dbConfig('usersurltbl', 4);

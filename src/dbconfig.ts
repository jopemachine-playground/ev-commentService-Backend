import {} from "dotenv/config";

export function dbConfig (database: string, connectionLimit: number) {
  return {
    host: 'localhost',
    user: 'root',
    password: '!cWdfds2',
    port: 3306,
    database: database,
    connectionLimit: connectionLimit
  }
}

export const userDBConfig = dbConfig('userdb', 4);

export const usersURLConfig = dbConfig('usersurltbl', 4);

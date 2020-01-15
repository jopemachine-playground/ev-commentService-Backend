import promiseMysql from 'promise-mysql';

export module sql {
  export const connect = (dbConf: Object, fn: Function) => async (...args: any) => {
    const pool = await promiseMysql.createPool(dbConf);
    const con: any = await pool.getConnection();

    const result = await fn(con, ...args).catch((error: any) => {
      con.connection.release();
      throw error;
    });

    con.connection.release();
    return result;
  };
}

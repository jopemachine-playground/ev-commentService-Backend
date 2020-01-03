import {Request, Response, NextFunction} from "express";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";

const router = express.Router();

router.post("/SignIn", (req: Request, res: Response, next: NextFunction) => {

  const result = sql.connect(userDBConfig,
    (async (con: any, id: string, pw: string) => {
      const result = await con.query(`select * from usersinfotbl where ID = ? AND PW = ?`, [id, pw]);
      return result;
    })
  )(req.body.ID, req.body.PW);

  console.log(result);
});

export default router;

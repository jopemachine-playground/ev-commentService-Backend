import {Request, Response, NextFunction} from "express";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";
import alert from 'alert-node';

const router = express.Router();

router.post("/SignIn", (req: Request, res: Response, next: NextFunction) => {

  const result = sql.connect(userDBConfig,
    (async (con: any, id: string, pw: string) => {

      const storeSession = (id: string) => {
        req.session!.userID = id;
        return true;
      };

      const searchRes = await con.query(`select * from usersinfotbl where ID = '${id}' AND PW = '${pw}'`);

      searchRes.length ? storeSession(id) && res.redirect('/URL-Register') : alert("ID와 PW의 조합이 일치하지 않습니다.");

      return result;
    })
  )(req.body.ID, req.body.PW);

});

router.get("./SignOut", (req: Request, res: Response) => {
  req.session!.destroy(() => { return req.session });
  res.clearCookie("sID");
  res.redirect('/');
});

export default router;

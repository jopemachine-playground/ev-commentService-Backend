import {Request, Response, NextFunction} from "express";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";
import alert from 'alert-node';

const user = express.Router();

user.post("/SignIn", (req: Request, res: Response) => {
  sql.connect(userDBConfig,
    (async (con: any) => {

      let id = req.body.ID;
      let pw = req.body.PW;

      const storeSession = (id: string) => {
        req.session!.userID = id;
        return true;
      };

      const searchRes = await con.query(`select * from usersinfotbl where ID = '${id}' and PW = '${pw}'`);

      const isValid : Boolean = searchRes.length;

      storeSession(id) && res.json({isValid: isValid});
    })
  )();
});

user.get("./SignOut", (req: Request, res: Response) => {
  req.session!.destroy(() => { return req.session });
  res.clearCookie("sID");
  res.redirect('/');
});


user.post("./SignUp", (req: Request, res: Response) => {
  sql.connect(userDBConfig,
    (async (con: any) => {

      await con.query(`
        insert into usersinfotbl (
          ID,
          PW,
          Address,
          PhoneNumber,
          ProfileImageFileName,
          Gender,
          Name,
          SignupDate,
          Email
          ) values(
          '${req.body.ID}',
          '${req.body.PW}',
          '${req.body.Address}',
          '${req.body.PhoneNumber}',
          '${req.body.ProfileImage}',
          '${req.body.Gender}',
          '${req.body.LastName + ' ' + req.body.FirstName}',
          now(),
          '${req.body.Email}'
        `);
    })
  )();
});

export default user;

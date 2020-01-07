import {Request, Response} from "express";
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

      const signInQuery = `select * from usersinfotbl where ID = '${id}' and PW = '${pw}'`;

      const searchRes = await con.query(signInQuery);

      const isValid : Boolean = searchRes.length;

      storeSession(id) && res.json({ VALID: isValid });
    })
  )();
});

user.get("/SignOut", (req: Request, res: Response) => {
  req.session!.destroy(() => { return req.session });
  res.clearCookie("sID");
  res.redirect('/');
});

user.post("/SignUp", (req: Request, res: Response) => {

  const fileObj = req.files[0];
  const orgFileName = fileObj.originalname;
  const filesize = fileObj.size;

  if(filesize > 1024 * 1000 * 16) {
    console.log("File Size Over 16MB");
    res.json( { FILE_SIZE_OVER : true });
    return;
  }

  sql.connect(userDBConfig,
    (async (con: any) => {
      try {
        const signUpQuery = `
          insert into usersinfotbl (
            ID,
            PW,
            Address,
            PhoneNumber,
            ProfileImage,
            Gender,
            Name,
            SignupDate,
            Email
            ) values(
            '${req.body.ID}',
            '${req.body.PW}',
            '${req.body.Address}',
            '${req.body.PhoneNumber}',
            '${fileObj}',
            '${req.body.Gender}',
            '${req.body.LastName + ' ' + req.body.FirstName}',
            now(),
            '${req.body.Email}'
          )
        `;

        await con.query(signUpQuery);
        res.json({ SUCCESS: true });

      } catch(error) {
        res.json({ DUP_ENTRY: true });
      }
    })
  )();
});

export default user;

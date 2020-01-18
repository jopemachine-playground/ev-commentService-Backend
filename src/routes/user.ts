import {Request, Response} from "express";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";
import jwt from 'jsonwebtoken';

const user = express.Router();

user.post("/SignIn", (req: Request, res: Response) => {
  sql.connect(userDBConfig, async (con: any) => {
    const signInQuery =
      `select * from usersinfotbl where ID = '${req.body.ID}' and PW = '${req.body.PW}'`;

    const searchRes = await con.query(signInQuery);

    const isValid: Boolean = searchRes.length;

    if(!isValid) res.json ({ VALID: false, message: "ID와 비밀번호가 일치하지 않습니다."});
  })();

  const token = jwt.sign(
    {
      ID: req.body.ID
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '120m',
      issuer: 'ev-CommmentServiceBackend',
    });

  return res.json({
    VALID: true,
    code: 200,
    message: "토큰이 발급되었습니다",
    token,
  })

});

user.get("/SignOut", (req: Request, res: Response) => {
  // req.session.destroy();
  res.redirect('/');
});

user.post("/SignUp", (req: Request, res: Response) => {

  let fileObj;
  let fileObjStr: string = "NULL";

  if (req.files.length !== 0) {
    fileObj = req.files[0];
    const orgFileName = fileObj.originalname;
    const filesize = fileObj.size;

    if (filesize > 1024 * 1000 * 16) {
      console.log("File Size Over 16MB");
      res.json({ FILE_SIZE_OVER: true });
      return;
    }
  }

  typeof fileObj !== 'undefined' && (fileObjStr = `'${fileObj}'`);

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
            ${fileObjStr},
            '${req.body.Gender}',
            '${req.body.LastName + ' ' + req.body.FirstName}',
            now(),
            '${req.body.Email}'
          )
        `;

        console.log(signUpQuery);

        await con.query(signUpQuery);
        res.json({ SUCCESS: true });

      } catch(error) {
        res.json({ DUP_ENTRY: true });
      }
    })
  )();
});

export default user;

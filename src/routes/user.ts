import {Request, Response, response} from "express";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";
import jwt from 'jsonwebtoken';
import { verifyToken } from "../authentification";
import fs from "fs";
import path from "path";

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

  let fileName: string = "NULL";

  if (req.files.length !== 0) {
    const fileObj = req.files[0];
    const orgFileName = fileObj.originalname,
      filesize = fileObj.size;

    if (filesize > 1024 * 1000 * 16) {
      console.log("File Size Over 16MB");
      res.json({ FILE_SIZE_OVER: true });
      return;
    }

    let ext = orgFileName.split(".")[1];

    fs.open(fileObj.path, "r", function(status, fd) {
      if (status) {
        console.log(status.message);
        return;
      }

      var buffer = new Buffer(filesize);

      fs.read(fd, buffer, 0, filesize, 0, (err, num) => {});

      fileName = `${req.body.ID}.${ext}`;

      fs.writeFile(
        path.join(__dirname, "/../../", "public", "profileImages", fileName),
        buffer,
        err => {}
      );
    });
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
            ProfileImageName,
            Gender,
            Name,
            SignupDate,
            Email
            ) values(
            '${req.body.ID}',
            '${req.body.PW}',
            '${req.body.Address}',
            '${req.body.PhoneNumber}',
            '${fileName}',
            '${req.body.Gender}',
            '${req.body.LastName + ' ' + req.body.FirstName}',
            now(),
            '${req.body.Email}'
          )
        `;

        await con.query(signUpQuery);
        res.json({ SUCCESS: true });

      } catch(error) {
        console.log(error);
        res.json({ DUP_ENTRY: true });
      }
    })
  )();
});

user.post('/UserEdit', verifyToken, (req: Request, res: Response) => {
  const token = req.body.token;
  const userID = jwt.verify(token, process.env.JWT_SECRET).ID;

  sql.connect(userDBConfig, async (con: any) => {
    const fetchQuery =
      `select * from usersinfotbl where ID = '${userID}'`;

    const searchRes = await con.query(fetchQuery);

    res.json(searchRes);
  })(); 
})

user.post(
  "/UserEdit/Update",
  verifyToken,
  async (req: Request, res: Response) => {

    const token = req.body.token;
    const userID = jwt.verify(token, process.env.JWT_SECRET).ID;

    let fileName: string = "NULL";

    let updateQuery = `
      update usersinfotbl set
        PW = '${req.body.PW}',
        Address = '${req.body.Address}',
        PhoneNumber = '${req.body.PhoneNumber}',
        Gender = '${req.body.Gender}',
        Email = '${req.body.Email}',
        Name = '${req.body.LastName + ' ' + req.body.FirstName}'
    `;

    if (req.files.length !== 0) {
      const fileObj = req.files[0];
      const orgFileName = fileObj.originalname,
        filesize = fileObj.size;

      if (filesize > 1024 * 1000 * 16) {
        console.log("File Size Over 16MB");
        res.json({ FILE_SIZE_OVER: true });
        return;
      }

      let ext = orgFileName.split(".")[1];

      let oldImageFileName: string = "";

      await sql.connect(userDBConfig, async (con: any) => {
        const fetchOldProfileImageName = `select ProfileImageName from usersinfotbl where ID = '${userID}'`,
          fetchRes = await con.query(fetchOldProfileImageName);

        oldImageFileName = fetchRes[0].ProfileImageName;
      })();

      // 기존에 존재하던 프로필 이미지 파일 삭제
      fs.unlink(
        path.join(
          __dirname,
          "/../../",
          "public",
          "profileImages",
          oldImageFileName
        ),
        function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
        }
      );

      // 보내진 프로필 사진을 새로 등록할 수 있도록 update문을 갱신
      fs.open(fileObj.path, "r", async (status, fd) => {
        if (status) {
          console.log(status.message);
          return;
        }

        var buffer = new Buffer(filesize);

        fs.read(fd, buffer, 0, filesize, 0, (err, num) => {});

        fileName = `${req.body.ID}.${ext}`;

        fs.writeFile(
          path.join(__dirname, "/../../", "public", "profileImages", fileName),
          buffer,
          err => {}
        );

        updateQuery += `, ProfileImageName = '${fileName}' where ID = '${userID}'`;

      });
    }
    else {
      updateQuery += `where ID = '${userID}'`;
    }

    sql.connect(userDBConfig, async (con: any) => {
      con.query(updateQuery);
      res.json({ SUCCESS: true });
    })();
  }
);


export default user;

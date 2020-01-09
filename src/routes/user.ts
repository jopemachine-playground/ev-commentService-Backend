import {NextFunction, Request, Response} from "passport";
import {sql} from "../sql";
import express from "express";
import {userDBConfig} from "../dbconfig";
import passport from "passport";
import {isNotSignedIn, isSignedIn} from "../authentification";

const user = express.Router();

user.post("/SignIn", isNotSignedIn, (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (authError, user, info) => {
    if(authError) {
      console.log(authError);
      return next(authError);
    }

    if(!user) {
      req.flash('loginError', info.message);
      return res.redirect('/');
    }

    return req.login(user, (loginError) => {
      if(loginError) {
        console.log(loginError);
        return next(loginError);
      }

      return res.json({ VALID: true });
    });
  })(req, res, next);
});

user.get("/SignOut", isSignedIn, (req: Request, res: Response) => {
  req.session.destroy();
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

import LocalStrategy from "passport-local";
import {sql} from "../sql";
import {userDBConfig} from "../dbconfig";

export default (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'ID',
    passwordField: 'PW'
  }, async (ID, PW, done) => {
      await sql.connect(userDBConfig, async (con: any) => {

        const signInQuery =
          `select * from usersinfotbl where ID = '${ID}' and PW = '${PW}'`;

        const searchRes = await con.query(signInQuery);

        const isValid: Boolean = searchRes;

        if(isValid) done(null, ID);
        else done (null, false, { message: "ID와 비밀번호가 일치하지 않습니다."})
      })();
  })
  )
}
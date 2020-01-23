import local from "./localStrategy"

export default (passport) => {
  passport.serializeUser((user, done) => {
    console.log("serialize");
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    console.log("deserialize : " + user);
    done(null, user);
  });

  local(passport);
};
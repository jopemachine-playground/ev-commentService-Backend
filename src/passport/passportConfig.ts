import local from "./localStrategy"

export default (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    console.log("deserialize");
  });

  local(passport);
};
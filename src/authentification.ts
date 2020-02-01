import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "passport";

export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Please login first!');
  }
}

export function isNotLoggedIn (req: Request, res: Response, next: NextFunction) {
  if(!req.isAuthenticated()){
    next();
  } else {
    res.redirect('back');
  }
}

export function verifyToken (req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.body.token;
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch(error) {
    if(error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: "Token expired."
      });
    }
    return res.status(401).json({
      code: 401,
      message: "Not valid token"
    });
  }
}


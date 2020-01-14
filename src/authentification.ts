import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function verifyToken (req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.body.token;
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch(error) {
    if(error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다."
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다."
    });
  }
}


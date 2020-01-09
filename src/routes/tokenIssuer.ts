import express from 'express';
import jwt from 'jsonwebtoken';
import {verifyToken} from "../authentification";
import {Request, Response} from "express";
import fs from "fs";
import _ from "underscore";
import path from "path";

const tokenIssuer = express.Router();

tokenIssuer.get('/token', async (req: Request, res: Response) => {
  const { clientSecret } = req.body;

  // apiUser를 확인하여 등록된 도메인인지 확인하는 로직 작성
  fs.readFile(path.resolve(__dirname, '../../apiUser.json'), (err, data) => {
    if(err) throw err;
    // @ts-ignore
    let user = JSON.parse(data);

    const token = jwt.sign(
      {},
      process.env.JWT_SECRET,
      {
        expiresIn: '1m',
        issuer: 'ev-CommmentServiceBackend',
      });

    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다",
      token
    })
  });
});

tokenIssuer.get('/tokenTest', verifyToken, (req: Request, res: Response) => {
  res.json(req);
});

export default tokenIssuer;
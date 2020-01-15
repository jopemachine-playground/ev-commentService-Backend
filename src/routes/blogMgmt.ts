import { Request, Response } from "express";
import { sql } from "../sql";
import express from "express";
import { userDBConfig } from "../dbconfig";
import {verifyToken} from "../authentification";
import jwt from "jsonwebtoken";
import shorthash from "shorthash";

const blogMgmt = express.Router();

blogMgmt.post("/", verifyToken, (req: Request, res: Response) => {

  let token = req.body.token;
  let decoded = jwt.verify(token, process.env.JWT_SECRET);

  sql.connect(userDBConfig,
    (async (con: any) => {
      const fetchQuery =
        `select * from usersurltbl where UserID = '${decoded.ID}'`;

      const searchRes = await con.query(fetchQuery);

      res.json(searchRes);
    })
  )();
});

blogMgmt.post("/Add", verifyToken, (req: Request, res: Response) => {

  let token = req.body.token;
  let userID = jwt.verify(token, process.env.JWT_SECRET);

  let { url, urlTitle } = req.body;

  let urlID = shorthash.unique(URL);

  sql.connect(userDBConfig,
    (async (con: any) => {
      const insertNewService =
        `insert into usersurltbl (
          URLID,
          URLTitle,
          URL,
          UserID
          ) VALUES(
          '${urlID}',
          '${urlTitle}',
          '${url}',
          '${userID}'`;

      const searchRes = await con.query(insertNewService);

      console.log("insert New Service Success");

      res.json(searchRes);
    })
  )();

  sql.connect(userDBConfig,
    (async (con: any) => {
      const createDB = `create database ${urlID} charset 'utf8mb4' collate utf8mb4_unicode_ci`;
      const searchRes = await con.query(createDB);
      res.json(searchRes);

      console.log("create DB Success")
    })
  )();
  
});



export default blogMgmt;

import { Request, Response } from "express";
import { sql } from "../sql";
import express from "express";
import { userDBConfig } from "../dbconfig";
import {verifyToken} from "../authentification";
import jwt from "jsonwebtoken";

const blogMgmt = express.Router();

blogMgmt.post("/URL-Register", verifyToken, (req: Request, res: Response) => {

  let token = req.body.token;
  let decoded = jwt.verify(token, process.env.JWT_SECRET);

  sql.connect(userDBConfig,
    (async (con: any) => {
      const fetchQuery =
        `SELECT * FROM usersurltbl WHERE UserID = '${decoded.ID}'`;

      const searchRes = await con.query(fetchQuery);

      res.json(searchRes);
    })
  )();
});


export default blogMgmt;

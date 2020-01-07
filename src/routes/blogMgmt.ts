import { Request, Response } from "express";
import { sql } from "../sql";
import express from "express";
import { userDBConfig } from "../dbconfig";
import alert from 'alert-node';

const blogMgmt = express.Router();

blogMgmt.post("/URL-Register", (req: Request, res: Response) => {
  sql.connect(userDBConfig,
    (async (con: any) => {
      const fetchQuery =
        `SELECT * FROM usersurltbl WHERE UserID = ${req.body.IDSession}`;

      const searchRes = await con.query(fetchQuery);

      res.json(searchRes);
    })
  )();
});



export default blogMgmt;

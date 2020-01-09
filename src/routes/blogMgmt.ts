import { Request, Response } from "passport";
import { sql } from "../sql";
import express from "express";
import { userDBConfig } from "../dbconfig";
import { isSignedIn } from "../authentification";

const blogMgmt = express.Router();

blogMgmt.post("/URL-Register", isSignedIn, (req: Request, res: Response) => {
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

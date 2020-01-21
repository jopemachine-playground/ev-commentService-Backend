import { Request, Response, NextFunction } from "express";
import { sql } from "../sql";
import express from "express";
import { dbConfig, userDBConfig } from "../dbconfig";
import { verifyToken } from "../authentification";
import jwt from "jsonwebtoken";
import R from "ramda";
import shortHash from "shorthash";

const comment = express.Router();

comment.get("/", (req: Request, res: Response) => {
  const { blogID, pageID, paginationID, mode, paginationDivison } = req.body;

  const token = req.body.token;
  const userID = jwt.verify(token, process.env.JWT_SECRET);

  let title: string = "";
  let comments;

  sql.connect(dbConfig(blogID, 4), async (con: any) => {
    const fetchTitle = `select Title from pagetitlepairs where UserID = '${userID.ID}'`;
    title = await con.query(fetchTitle)[0];
  })();

  sql.connect(dbConfig(blogID, 4), async (con: any) => {
    const fetchAllComments = `select * from ${pageID} order by CommentIndex desc`;
    comments = await con.query(fetchAllComments);
  })();

  res.render('comment');
});

export default comment;
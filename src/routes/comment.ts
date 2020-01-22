import { Request, Response, NextFunction } from "express";
import { sql } from "../sql";
import express from "express";
import { dbConfig, userDBConfig } from "../dbconfig";
import { verifyToken } from "../authentification";
import jwt from "jsonwebtoken";
import shortHash from "shorthash";
import dotenv from "dotenv";

dotenv.config();

const comment = express.Router();

// 클라이언트 페이지에서 댓글 페이지를 요청할 때 실행
// 전송받은 데이터를 비동기적으로 검증한다.
// DB엔 ajax로 php에 요청해 접근한다
comment.get(
  "/URL-Verification",
  async (req: Request, res: Response) => {

    const { userID, pageID, url, mode, title, paginationDivision } = req.query;

    const urlID = shortHash.unique(url);

    let isValid : boolean = true;

    if(!userID || !pageID || !url || !mode || !title) {
      res.render("notSetValue");
      return;
    }
    
    await sql.connect(userDBConfig, async con => {
      const validUrl = `select * from usersurltbl where URL = '${url}'`
      const fetchingData = await con.query(validUrl);
      isValid = fetchingData ? true : false;
    })();

    if(!isValid){
      res.render("notRegisteredUrl");
      return;
    }
    
    await sql.connect(dbConfig(urlID, 4), async con => {
      // 게시글 (테이블) 이 존재하지 않는 경우
      const tableExistQuery = `show tables like '${pageID}'`;

      const tableExist = await con.query(tableExistQuery);

      if(!tableExist) {
        const createTbl = 
          `create table \`${urlID}\`.\`${pageID}\`(
            \`CommentUserId\` varchar(20) not null,
            \`Content\` mediumtext not null,
            \`DateTime\` datetime not null,
            \`ProfileImageFileName\` varchar(25),
            \`CommentIndex\` int(11) not null auto_increment,
            \`EmotionalAnalysisValue\` float,
            PRIMARY KEY(\`CommentIndex\`) 
            )`;

        await con.query(createTbl);

        const insertRecord = `
          insert Into pagetitlepairs(
            PageID,
            Title
            ) Values(
            '${pageID}',
            '${title}')`;

        await con.query(insertRecord);

      } else {
        // 게시글 (테이블)이 존재하는 경우
        const confirmTitle = `select Title from pagetitlepairs where PageID = '${pageID}'`;

        const oldTitle = await con.query(confirmTitle);

        if (title !== oldTitle.Title) {
          const updateTitle = `
            update pagetitlepairs set
            Title = '${title}'
            where PageID = '${pageID}'`;
          
          con.query(updateTitle);
        }
      }

      res.render("commentIFrame", {
        api: process.env.API,
        blogID: urlID,
        pageID,
        mode,
        paginationID: 1,
        paginationDivision
      });
    })();
  }
);

comment.get(
  "/",
  async (req: Request, res: Response) => {

    const token = req.body.token;

    const { blogID, pageID, paginationID, mode, connectedUserID } = req.query;

    const paginationDivision = parseInt(req.query.paginationDivision);

    let comments;
    let commentsCnt;

    let paginationEnd;
    let userID: string = "";
    let title;

    if (token) userID = jwt.verify(token, process.env.JWT_SECRET).ID;

    // Fetch title
    await sql.connect(dbConfig(blogID, 4), async (con) => {
      const fetchTitle = `select Title from pagetitlepairs where PageID = '${pageID}'`;
      title = await con.query(fetchTitle).Title;
    })();

    // Calculate pagination info
    await sql.connect(dbConfig(blogID, 4), async (con) => { 
      const fetchComments = `select * from \`${pageID}\` order by CommentIndex desc limit ${paginationDivision}`;
      
      comments = await con.query(fetchComments);

      commentsCnt = comments.length;

      // 몇 페이지가 끝인 지 계산
      if((commentsCnt % paginationDivision) == 0) {
        paginationEnd = commentsCnt / paginationDivision;
      }
      else {
        paginationEnd = (commentsCnt / paginationDivision) + 1;
      }
    })();

    res.render("comment", {
      api: process.env.api,
      connectedUserID: userID,
      params: req.params,
      comments,
      commentsCnt,
      paginationInfo: { paginationID, paginationEnd, paginationDivision },
      conf: { dbConfig, userDBConfig },
      sql: sql
    });
  }
);

comment.post("/Add", (req: Request, res: Response) => {

});

comment.post("/Delete", (req: Request, res: Response) => {

});

comment.post("/Edit", (req: Request, res: Response) => {

});

export default comment;
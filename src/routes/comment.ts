import { Request, Response, NextFunction } from "express";
import { sql } from "../sql";
import express from "express";
import { dbConfig, userDBConfig } from "../dbconfig";
import { verifyToken } from "../authentification";
import jwt from "jsonwebtoken";
import shortHash from "shorthash";

const comment = express.Router();

// 클라이언트 페이지에서 댓글 페이지를 요청할 때 실행
// 전송받은 데이터를 비동기적으로 검증한다.
// DB엔 ajax로 php에 요청해 접근한다
comment.get(
  "URL-Verification/:userID/:pageID/:url/:mode/:title",
  async (req: Request, res: Response) => {
    const { userID, pageID, url, mode, title } = req.params;

    const urlID = shortHash(url);

    let isNotValid : boolean = false;

    if(!userID || !pageID || !url || !mode || !title) {
      res.render("notSetValue");
      return;
    }
    
    await sql.connect(userDBConfig, async con => {
      const validUrl = `select * from usersurltbl where URL = '${url}'`
      const fetchingData = await con.query(validUrl);
      isNotValid = (fetchingData[0].length === 0);
    })();

    if(isNotValid) {
      res.render("notRegisteredUrl");
      return;
    }
    
    await sql.connect(dbConfig(urlID, 4), async con => {
      // 게시글 (테이블) 이 존재하지 않는 경우
      const tableExist = `show tables like '${pageID}'`;

      const noTable = await con.query(tableExist)[0].length;

      if(noTable) {
        const createTbl = 
          `create table \`$URL_ID\`.\`$PageIdentifier\`(
            \`CommentUserId\` varchar(20) not null,
            \`Content\` mediumtext not null,
            \`DateTime\` datetime not null,
            \`ProfileImageFileName\` varchar(25),
            \`CommentIndex\` int(11) not null auto_increment,
            \`EmotionalAnalysisValue\` float,
            PRIMARY KEY(\`CommentIndex\`)`;

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

        const oldTitle = await con.query(confirmTitle)[0].Title;

        console.log(oldTitle);

        if (title !== oldTitle) {
          const updateTitle = `
            update pagetitlepairs set
            Title = '${title}'
            where PageID = '${pageID}'`;
          
          con.query(updateTitle);
        }
      }

      res.render("commentIFrame", {
        api: "http://localhost:8000/Comment/",
        blogID: urlID,
        pageID,
        mode,
        paginationID: 1,
        paginationDivision: 10
      });
    })();
  }
);

comment.get(
  "/:blogID/:pageID/:paginationID/:mode/:paginationDivision",
  (req: Request, res: Response) => {
    const token = req.body.token;

    const { blogID, pageID, paginationID, mode, connectedUserID } = req.params;

    const paginationDivision = parseInt(req.params.paginationDivision);

    let comments;
    let commentsCnt;

    let paginationEnd;
    let userID: string = "";
    let title;

    if (token) userID = jwt.verify(token, process.env.JWT_SECRET).ID;

    // Fetch title
    sql.connect(dbConfig(blogID, 4), async (con) => {
      const fetchTitle = `select Title from pagetitlepairs where PageID = '${pageID}'`;
      title = await con.query(fetchTitle)[0].Title;
    })();

    // Calculate pagination info
    sql.connect(dbConfig(blogID, 4), async (con) => { 
      const fetchComments = `select * from ${pageID} order by CommentIndex desc limit ${paginationDivision}`;
      comments = await con.query(fetchComments);

      commentsCnt = comments[0].length;
    
      // 몇 페이지가 끝인 지 계산
      if((commentsCnt % paginationDivision) == 0) {
        paginationEnd = commentsCnt / paginationDivision;
      }
      else {
        paginationEnd = (commentsCnt / paginationDivision) + 1;
      }
    })();

    res.render("comment", {
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

export default comment;
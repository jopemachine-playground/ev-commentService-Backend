import { Request, Response, NextFunction } from "passport";
import { sql } from "../sql";
import express from "express";
import { dbConfig, userDBConfig } from "../dbconfig";
import { verifyToken, isNotLoggedIn, isLoggedIn } from "../authentification";
import shortHash from "shorthash";
import dotenv from "dotenv";
import passport from "passport";

dotenv.config();

const comment = express.Router();

// 클라이언트 페이지에서 댓글 페이지를 요청할 때 실행
// 전송받은 데이터를 비동기적으로 검증한다.
comment.get("/URL-Verification", async (req: Request, res: Response) => {
  const { userID, pageID, url, mode, title, paginationDivision } = req.query;

  const urlID = shortHash.unique(url);

  let isValid: boolean = true;

  if (!userID || !pageID || !url || !mode || !title) {
    res.render("error/notSetValue");
    return;
  }

  await sql.connect(userDBConfig, async con => {
    const validUrl = `select * from usersurltbl where URL = '${url}'`;
    const fetchingData = await con.query(validUrl);
    isValid = fetchingData ? true : false;
  })();

  if (!isValid) {
    res.render("error/notRegisteredUrl");
    return;
  }

  await sql.connect(dbConfig(urlID, 4), async con => {
    // 게시글 (테이블) 이 존재하지 않는 경우
    const tableExistQuery = `show tables like '${pageID}'`;

    const tableExist = await con.query(tableExistQuery);

    if (!tableExist) {
      const createTbl = `create table \`${urlID}\`.\`${pageID}\`(
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

        await con.query(updateTitle);
      }
    }
  })();

  res.render("commentIFrame", {
    api: process.env.API,
    blogID: urlID,
    pageID,
    mode,
    paginationID: 1,
    paginationDivision
  });
});

comment.get("/Fetch", async (req: Request, res: Response) => {

  const connectedUserID: string = req.user;
  const { blogID, pageID, mode } = req.query;

  if (!pageID || !blogID || !mode) {
    res.render("error/notSetValue");
    return;
  }

  let connectedUserInfo: any;
  
  if(req.user){
    await sql.connect(userDBConfig, async con => {
      const fetch = `select * from usersinfotbl where ID = '${req.user}'`;
      const fetchRet = await con.query(fetch);
      connectedUserInfo = fetchRet[0];
    })();
  }
  
  let title                 : string = "";
  
  let startPoint            : number = -1;
  let paginationEnd         : number = -1;
  let laquo_paginationID    : number = -1;
  let raquo_paginationID    : number = -1;
  const paginationID        : number = parseInt(req.query.paginationID);
  const paginationDivision  : number = parseInt(req.query.paginationDivision);

  // 페이지네이션 할 수 있는 숫자를 몇 개까지 표시할 것인지 나타내는 int형 변수
  // (값을 바꿔도 되지만, 웹페이지 디자인 상 홀수여야 균형이 맞아보이니 주의)
  const paginatorsNumber    : number = 5;

  let comments              : any;
  let commentsCnt           : number = -1;
  
  await sql.connect(dbConfig(blogID, 4), async con => {
    const fetchTitle = 
      `select Title from pagetitlepairs where PageID = '${pageID}'`;

    title = await con.query(fetchTitle).Title;

    const fetchComments = 
      `select * from \`${pageID}\` order by CommentIndex desc limit ${paginationDivision} offset ${paginationDivision * (paginationID - 1)}`;

    const calcCommentsCnt = 
      `select count(*) as cnt from \`${pageID}\``;

    comments = await con.query(fetchComments);
    const fetchCommentsCnt = await con.query(calcCommentsCnt);

    // 몇 페이지가 끝인 지 계산
    commentsCnt = fetchCommentsCnt[0].cnt;
    
    if (commentsCnt % paginationDivision == 0) {
      paginationEnd = Math.floor(commentsCnt / paginationDivision);
    } else {
      paginationEnd = Math.floor(commentsCnt / paginationDivision) + 1;
    }
    
    laquo_paginationID = paginationID === 1 ? 1: paginationID - 1;
    raquo_paginationID = paginationEnd ? paginationEnd : paginationID - 1;

    // 현재 페이지가 앞 쪽에 치우친 경우 (1부터 순차대로 $paginatorsNumber 수 만큼 출력)
    if(paginationEnd < paginatorsNumber || paginationID - (paginatorsNumber / 2) <= 0){
      startPoint = 1;
    }
    // 현재 페이지가 뒤 쪽에 치우친 경우 (순차대로 $paginatorsNumber 수 만큼 출력)
    else if(paginationEnd - paginationID < (paginatorsNumber / 2)){
      startPoint = paginationEnd - paginatorsNumber + 1;
    }
    // 페이지를 중앙에 놓으면 되는 경우
    else {
      startPoint = paginationID - (paginatorsNumber / 2);
    }

  })();

  res.render("comment", {
    api: process.env.API,
    connectedUserInfo,
    params: req.query,
    comments,
    commentsCnt,
    paginationInfo: {
      startPoint,         
      paginatorsNumber,
      paginationID, 
      paginationEnd, 
      paginationDivision,
      laquo_paginationID,
      raquo_paginationID
    },
    conf: { dbConfig, userDBConfig },
    sql
  });
});

comment.post("/Add", async (req: Request, res: Response) => {

  let { commentContent, emotionalAnalysisValue, pageID, blogID } = req.body;

  let profileImageFileName: string;
  let connectedUserID = req.user;

  if (req.user) {
    await sql.connect(userDBConfig, async con => {
      const fetchProfileImageName = 
        `select ProfileImageName from usersinfotbl where ID = '${connectedUserID}'`;
        
      const ret = await con.query(fetchProfileImageName);
      (ret && (profileImageFileName = `'${ret[0].ProfileImageName}'`)) || (profileImageFileName = "NULL");
    })();
  } else {
    connectedUserID = "Anonymous";
    profileImageFileName = "NULL";
  }

  if(!emotionalAnalysisValue) emotionalAnalysisValue = 0;

  await sql.connect(dbConfig(blogID, 4), async con => { 
    const insertComment = `
      insert into  \`${pageID}\`(
          CommentUserId,
          Content,
          DateTime,
          ProfileImageFileName,
          EmotionalAnalysisValue
          ) VALUES(
          '${connectedUserID}',
          '${commentContent}',
          Now(),
          ${profileImageFileName},
          ${emotionalAnalysisValue}
      )`;

    await con.query(insertComment);
  })();

  res.json({ VALID: true });
});

comment.post("/Delete", isLoggedIn, (req: Request, res: Response) => {
  const { CommentID, blogID, pageID } = req.body;

  sql.connect(dbConfig(blogID, 4), async con => {
    const deleteComment = 
      `delete from \`${pageID}\` where CommentUserId = '${req.user}' and CommentIndex = ${CommentID}`;
  
    await con.query(deleteComment);
  })();

  res.json({ VALID: true });
});

comment.post("/Edit", (req: Request, res: Response) => {
  const { CommentID, blogID, pageID, commentContent } = req.body;

  const { emotionalAnalysisValue } = req.body;

  sql.connect(dbConfig(blogID, 4), async con => {
    let updateComment = 
      `update \`${pageID}\` set
        Content                 = '${commentContent}',`;

    if(emotionalAnalysisValue) updateComment +=
       `EmotionalAnalysisValue  = '${emotionalAnalysisValue}',`;

       updateComment +=
       `DateTime                = NOW()
        WHERE CommentIndex      = '${CommentID}'`;

    await con.query(updateComment);
  })();

  res.json({ VALID: true });
});

comment.post("/Login", isNotLoggedIn, (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (authError, user, info) => {
    if(authError) {
      console.log(authError);
      return next(authError);
    }

    if(!user) {
      req.flash('loginError', info.message);
      return res.redirect('back');
    }

    return req.login(user, (loginError) => {
      if(loginError) {
        console.log(loginError);
        return next(loginError);
      }
      
      return res.redirect('back');
    });
  
  })(req, res, next);
});

comment.get("/Logout", isLoggedIn, (req: Request, res: Response) => {
  req.logout();
  req.session.destroy();
  res.json({ VALID: true });
});

export default comment;
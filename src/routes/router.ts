import {NextFunction} from "express";

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbConfig = require('../dbconfig');

const connection = mysql.createConnection(dbConfig);

router.get("/", function () {
  console.log('Example app');
});

router.post("/SignIn", (req: Request, res:Response, next: NextFunction) => {

});

module.exports = router;
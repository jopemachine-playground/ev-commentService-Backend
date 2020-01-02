const express = require('express');
const router = express.Router();

router.get("/", function () {
  console.log('Example app');
});

module.exports = router;
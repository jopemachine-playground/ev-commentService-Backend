import RateLimit from "express-rate-limit";

const rateLimit = new RateLimit({
  windowMs: 1000,
  max: 2,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: '초당 2회까지만 요청할 수 있습니다.'
    })
  }
});

export default rateLimit;
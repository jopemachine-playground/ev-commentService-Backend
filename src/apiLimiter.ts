import RateLimit from "express-rate-limit";

const rateLimit = new RateLimit({
  windowMs: 1000,
  max: 2,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: 'You can only request up to two times per second.'
    })
  }
});

export default rateLimit;
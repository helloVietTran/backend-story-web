//redis được dùng để tính view chapter chính xác và chiến lược trong môi trường phát triển 
// code tính view tại viewController
// code đồng bộ dữ liệu redis và viewController ở src/config/cron

/*
const Redis = require("ioredis");
const redisClient = new Redis(
  "redis://:VX1qs7bVi9MH4SL0xoh7DJeG4I1hS4Vf@redis-15073.c299.asia-northeast1-1.gce.redns.redis-cloud.com:15073"
);
redisClient.on("connect", () => {
  console.log("connected to redis");
});
redisClient.on("error", (err) => {
  console.log(err);
});
module.exports = redisClient;
*/
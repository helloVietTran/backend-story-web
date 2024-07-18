const Point = require("../models/Point");
const User =  require("../models/User");
const { io } = require("../../config/socket");

class PointController {
  async getPoint(req, res) {
    try {
      const userId = req.id;
      let point = await Point.findOne({ userId })
        .select({ history: { $slice: [0, 5] } })
        .exec();
      if (!point) {
        point = await Point.create({ userId });
      }

      res.json(point);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  //điểm danh
  async attendance(req, res) {
    try {
      const userId = req.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let point = await Point.findOne({ userId });
      const user = await User.findById(userId);

      // check người dùng đã điểm danh chưa bằng lần cuối điểm danh
      if (
        !point.lastAttendanceDate ||
        point.lastAttendanceDate.getTime() !== today.getTime()
      ) {
        point.lastAttendanceDate = today;
        point.consecutiveAttendanceCount++; // tăng biến điểm danh liên tục
      } else {
        //đã điểm danh
        return;
      }
      point.totalPoints += 100;
      //đăng nhập đủ 7 ngày
      if (point.consecutiveAttendanceCount === 7) {
        point.totalPoints += 200;
        point.consecutiveAttendanceCount = 0;
      }
      const historyItem = {
        date: Date.now(),
        type: "Điểm danh",
        description: "+100",
      };
      point.history.push(historyItem);
      user.point = point.totalPoints;
      await user.save();
      await point.save();
      
      io.emit("attendance", {
        totalPoints: point.totalPoints,
        historyItem: historyItem,
      });

      return res.status(200).end();
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new PointController();

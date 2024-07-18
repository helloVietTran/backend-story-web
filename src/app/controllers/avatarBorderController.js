
const AvatarBorder = require("../models/AvatarBorder");
const Point = require("../models/Point");
const User = require("../models/User");

const CustomError = require("../../error/CustomError")

class AvatarBorderController {
  create(req, res) {
    res.render("pages/create-border");
  }

  async store(req, res) {
    try {
      if (!req.file) {
        throw new CustomError("No file uploaded", 500, "/avatar-border/store")
      }
      const imgUrl = req.file.path;
      const { expiry, price } = req.body;
      const avatarBorder = new AvatarBorder({
        imgSrc: imgUrl,
        price: +price || 100,
        expiry: expiry || "1d",
      });
      await avatarBorder.save();

      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  async allAvatarBorder(req, res) {
    try {
      const avatarBorders = await AvatarBorder.find();
      res.json(avatarBorders);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  async buyAvatarBorder(req, res, next) {
    try {
      const { avatarBorderId } = req.params;
      const userId = req.id;

      const user = await User.findById(userId);
      const frame = await AvatarBorder.findById(avatarBorderId);
      const point = await Point.findOne({ userId });

      if (point.totalPoints < frame.price) {
        throw new CustomError("Không đủ điểm hoặc tiền để mua khung viền này", 400, "/avatar-border/buy/...");
      }
      const buyingHistory = {
        date: Date.now(),
        type: "Mua Viền Avatar",
        description: `-${frame.price}`,
      };

      user.frame = avatarBorderId;
      user.buyingFrameDate = Date.now();
      user.frameExpiryDate = Date.now() + 24*60*60*1000;
      point.totalPoints -= frame.price;
      user.point = point.totalPoints;

      point.history.push(buyingHistory);

      await user.save();
      await point.save();

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new AvatarBorderController();

const mongoose = require("mongoose");

const point = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    lastAttendanceDate: {
      type: Date,
    },
    consecutiveAttendanceCount: {
      type: Number,
      default: 0,
    },
    history: [
      {
        date: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    versionKey: false,
  }
);
point.pre('save', function (next) {
  const capitalizeDescription = (description) => {
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  this.history.forEach((item) => {
    item.description = capitalizeDescription(item.description);
  });

  next();
});

const Point = mongoose.model("Point", point);

module.exports = Point;

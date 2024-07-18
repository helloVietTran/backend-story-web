const mongoose = require("mongoose");
const slugify = require('slugify');
const mongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

function otherNameValidator(value){
  return value !== this.name;
}
const customOtherNameValidator = [otherNameValidator, '{PATH} must different story name'];

const story = new Schema(
  {
    name: { type: String, required: true },
    otherName: { 
      type: String, 
      validate: customOtherNameValidator,
    },
    author: { type: String, default: "Đang cập nhật",},
    status: { 
      type: String,
      default: "Đang tiến hành",
      enum: {
        values: ['Đang tiến hành', 'Đã hoàn thành', 'Sắp phát hành'],
        message: '{VALUE} is not supported'
      } 
    },
    genres: { type: [String], required: true,},
    viewCount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    follower: { type: Number, default: 0 },
    description: { type: String, default: "" },
    commentCount: { type: Number, default: 0 },
    slug: { type: String },
    chapters: {
      type: Map,
      of: {
        chap: {type: String, required: true},
        createdAt: {type: Date, default: Date.now()},
        viewCount: {type: Number, default: 0}
      },
      default: function(){
        return new Map();
      }
    },

    imgSrc: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    newestChapter: { type: Number, default: 0 },
    hot: { type: Boolean, default: false },
    gender: { 
      type: String, 
      default: "both",
      enum: {
        values: ["male", "female", "both"],
      }
     },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

story.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

story.plugin(mongooseDelete, { deletedAt: true, overrideMethods: "all" });

const Story = mongoose.model("Story", story);

module.exports = Story;

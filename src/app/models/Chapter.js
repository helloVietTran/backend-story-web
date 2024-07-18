const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const chapter = new Schema({
    chap: {type: Number, required: true},
    name: {type: String},
    viewCount: {type: Number, default: 0},
    imgSrcs: [{type: String, required: true}],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    slug: {type: String},
},{
    timestamps: true,
    versionKey: false,
})

chapter.pre('save', function(next) {
    if (!this.slug || this.isModified('chap')) {
        this.slug = slugify(`chap-${this.chap}`, { lower: true });
    }
    next();
});

const Chapter = mongoose.model('Chapter', chapter);

module.exports = Chapter;

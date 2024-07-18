const Story = require("../models/Story");
const Chapter = require("../models/Chapter");
const mongoose = require("mongoose");

const CustomError = require("../../error/CustomError");

class ChapterController{
    async index(req, res, next){
       try {
        const { storyId } = req.params;
        const { chap } = req.query;
        const objectIdStoryId = new mongoose.Types.ObjectId(storyId);
        const chapter = await Chapter.findOne({ story: objectIdStoryId, chap: parseInt(chap) })                                   
        if(!chapter){
          throw new CustomError("Chapter not found", 404, "/chapter/:storyId");
        }
        res.json(chapter);
       } catch (error) {
        console.log(error);
        next(error);
       }
       
    }
    create(req,res){
        const id = req.params.id;
        res.render('pages/create-chapter',{id})
    }

    async store(req, res){
      const chapterData = req.body;
      const storyId = req.params.storyId;
      try{
        const files = req.files;
        const urls = files.map(file => file.path).reverse();

        chapterData.imgSrcs = urls;
        chapterData.story = storyId;

        const chapter = new Chapter(chapterData);
        await chapter.save();
        
        const story = await Story.findById(storyId);
        const chapterValue = {
          chap: `chap-${chapterData.chap}`,
        }
        story.chapters.set(chapter._id.toString(), chapterValue)

        story.newestChapter += 1;
        await story.save();
        res.redirect('back')
      }
      catch(error){
        console.log(error);
        res.status(500).json({error: "multiple files can not upload"})
      }
    }
    edit(req, res){
      const { id } = req.params;
      res.render('pages/edit-chapter', {id})
    }
    async update(req,res){
      const storyID =  req.params.id;
      console.log(req.body)
      try{
        const files = req.files;
        const urls = files.map(file => file.path);
        const chapter = await Chapter.findOne({story: storyID, chap: req.body.chap})
        chapter.url = chapter.url.concat(urls);
        console.log(chapter.url);
        await chapter.save();
        res.redirect('back');
      }
      catch{
        res.status(500).json({error: "multiple files can not upload"})
      }
      res.end()
    }
}
module.exports = new ChapterController

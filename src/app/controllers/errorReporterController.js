const ErrorReporter = require("../models/ErrorReporter");

class ErrorReporterController {
  async create(req, res) {
    try {
      const { description, storyName, atChapter, type } = req.body;
      await ErrorReporter.create({
        description,
        userId: req.id,
        atChapter: +atChapter,
        storyName,
        type
      });

      res.status(200).json({
        message: "Server receives report"
      });
    } catch (error) {
      res.status(500).json({
        path: "/error-reporter",
        error: error.message
      })
    }
  }
}
module.exports = new ErrorReporterController();

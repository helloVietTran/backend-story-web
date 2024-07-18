const Story = require("../models/Story");
class SiteController {
  async index(req, res) {
    await Story.find({})
      .then((stories) => res.render("pages/home", { stories }))
      .catch(() => console.log("can not read from database"));
  }
  async trash(req, res) {
    await Story.findDeleted({})
      .then((stories) => {
        console.log(stories);
        res.render("pages/trash", { stories });
      })
      .catch(() => console.log("can not read from database"));
  }
  googleRegister(req, res) {
    res.redirect(302, 'http://localhost:3000/secure/dashboard');
  }
  successedLogin(req, res){
    if(req.user){
        res.status(200).json({
            error: false,
            message: 'Sucessfully loged in',
            user: req.user
        })
    }else{
        res.status(403).json({
            error: true,
            message: 'Not Authorized'
        })
    }
  }
  failedLogin(req, res){
    res.status(401).json({
        error: true,
        message: 'Log in failure'
    });
  }
  logout(req, res){
    req.logout();
    res.redirect('http://localhost:3000')
  }
}
module.exports = new SiteController();

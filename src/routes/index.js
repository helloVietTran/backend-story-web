const storyRoute = require('./storyRoute');
const userRoute = require('./userRoute');
const siteRoute = require('./siteRoute');
const chapterRoute = require('./chapterRoute');
const authRoute = require('./authRoute')
const commentRoute = require('./commentRoute')
const pointRoute = require('./pointRoute');
const avatarBorderRoute = require('./avatarBorderRoute');
const readingRoute = require('./readingRoute');
const errorReporterRoute = require('./errorReporterRoute');
const viewRoute = require('./viewRoute')
function route(app){
    app.use('/stories', storyRoute);
    app.use('/chapters',chapterRoute);
    app.use('/users', userRoute);
    app.use('/auth', authRoute);
    app.use('/comment', commentRoute);
    app.use('/point', pointRoute);
    app.use('/avatar-border', avatarBorderRoute);
    app.use('/reading-history', readingRoute);
    app.use('/error-reporter', errorReporterRoute);
    app.use('/view-count', viewRoute);
    app.use('/', siteRoute);
}

module.exports = route;
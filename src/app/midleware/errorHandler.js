const errorHandler = (err, req, res, next) => {
    if(!err){
        return;
    }
    console.log("Header: " + req.header);
    console.log("Body: " + req.body);
    
    const stack = err.stack;
    const errorMessage = err.message;
    const status = err.status || 500;
    const timestamp = err.timestamp || new Date().toISOString();
    const path = err.path || "";
    const method = err.method || "";
    const detail = err.detail || "";

    const error = {
        error: true,
        message: errorMessage,
        timestamp,
        stack,
        path,
        method,
        detail
    }
    res.status(status).json(error);
}

module.exports = errorHandler;
class CustomError extends Error{
    constructor(message, status, path ="", method="", detail = "No details provided"){
        super(message);
        this.status= status;
        this.timestamp = new Date().toISOString();
        this.detail = detail;
        this.path = path;
        this.method = method;
    }
}

module.exports = CustomError;
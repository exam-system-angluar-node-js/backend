"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const custom_error_1 = require("./custom-error");
class ForbiddenError extends custom_error_1.CustomError {
    constructor(forbaddinMessage) {
        super(forbaddinMessage || 'you are not allowed to access this');
        this.forbaddinMessage = forbaddinMessage;
        this.statusCode = 403;
        this.message = 'you are not allowed to access this';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message || 'you are not allowed to access this' }];
    }
}
exports.ForbiddenError = ForbiddenError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                status: 'fail',
                message: 'Unauthorized',
            });
            return;
        }
        if (!roles.includes(user === null || user === void 0 ? void 0 : user.role)) {
            res.status(403).json({
                status: 'fail',
                message: 'Forrbiden',
            });
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;

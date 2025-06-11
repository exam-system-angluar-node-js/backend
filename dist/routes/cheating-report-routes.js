"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheatingReportRouter = void 0;
const express_1 = __importDefault(require("express"));
const protect_1 = require("../middlewares/protect");
const restricto_1 = require("../middlewares/restricto");
const cheating_report_handler_1 = require("../handlers/cheating-report-handler");
const router = express_1.default.Router();
exports.CheatingReportRouter = router;
// Route to receive cheating reports (accessible to authenticated users)
router.post('/', protect_1.protect, cheating_report_handler_1.createCheatingReportHandler);
// Route to get all cheating reports (admin and teacher only)
router.get('/', protect_1.protect, (0, restricto_1.restrictTo)('admin', 'teacher'), cheating_report_handler_1.getAllCheatingReportsHandler);

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCheatingReportsHandler = exports.createCheatingReportHandler = void 0;
const index_1 = require("../../generated/prisma/index");
const catchAsync_1 = require("../utils/catchAsync");
const bad_request_error_1 = require("../errors/bad-request-error");
const prisma = new index_1.PrismaClient();
// Handler to receive cheating reports
exports.createCheatingReportHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, examId, cheatingType } = req.body;
    if (!studentId || !examId || !cheatingType) {
        throw new bad_request_error_1.BadRequestError('Missing required fields: studentId, examId, cheatingType');
    }
    const cheatingReport = yield prisma.cheatingReport.create({
        data: {
            studentId: parseInt(studentId),
            examId: parseInt(examId),
            cheatingType,
        },
    });
    res.status(201).json({
        status: 'success',
        message: 'Cheating report created successfully',
        data: cheatingReport,
    });
}));
// Handler to get all cheating reports (for admin)
exports.getAllCheatingReportsHandler = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cheatingReports = yield prisma.cheatingReport.findMany({
        orderBy: {
            timestamp: 'desc',
        },
    });
    res.status(200).json(cheatingReports);
}));

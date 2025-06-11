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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const path_1 = __importDefault(require("path"));
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }
        // Get the file path relative to the uploads directory
        const relativePath = path_1.default.relative(path_1.default.join(__dirname, '../../uploads'), req.file.path);
        // Create the URL for the uploaded file
        const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            imageUrl: fileUrl
        });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
});
exports.uploadImage = uploadImage;

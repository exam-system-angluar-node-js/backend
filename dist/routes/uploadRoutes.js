"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadHandler_1 = require("../handlers/uploadHandler");
const fileUpload_1 = require("../utils/fileUpload");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Upload image route - protected by authentication
router.post('/image', auth_1.authenticateToken, fileUpload_1.upload.single('image'), uploadHandler_1.uploadImage);
exports.default = router;

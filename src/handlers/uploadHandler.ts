import { Request, Response } from 'express';
import path from 'path';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }

        // Get the file path relative to the uploads directory
        const relativePath = path.relative(path.join(__dirname, '../../uploads'), req.file.path);

        // Create the URL for the uploaded file
        const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            imageUrl: fileUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
}; 
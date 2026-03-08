const { Upload } = require('@aws-sdk/lib-storage');
const r2Client = require('../config/r2');
const path = require('path');

const uploadToR2 = async (file, folder = 'general') => {
    if (!file) return null;

    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const upload = new Upload({
        client: r2Client,
        params: {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        },
    });

    await upload.done();
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
};

module.exports = { uploadToR2 };

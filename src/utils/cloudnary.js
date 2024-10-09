import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Async Configuration
const configureCloudinary = async () => {
    return new Promise((resolve, reject) => {
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        await configureCloudinary(); // Ensure Cloudinary is configured

        // upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Remove the local file after upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        // console.log("File uploaded to Cloudinary", response);
        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
        }
        return null;
    }
}

const deleteoncloudinary = async (pathoncloudinary) => {
    try {
        if (!pathoncloudinary) return null;
        await configureCloudinary(); // Ensure Cloudinary is configured

        // upload the file to Cloudinary
        const response = await cloudinary.uploader.destroy(localFilePath, function(error, result) {
            if (error) {
              console.log('Error:', error);
            } else {
              console.log('Result:', result);
            }
          });

        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteoncloudinary };

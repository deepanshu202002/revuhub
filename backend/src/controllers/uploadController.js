import s3 from "../config/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Single presigned URL
export const getPresignedUrl = async (req, res) => {
  try {
    const { type, filetype } = req.body;
    const ext = filetype.split("/")[1] || "png";
    const key = `${type}/${req.user.id}-${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 120 });
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, fileUrl, key });
  } catch (err) {
    console.error("❌ getPresignedUrl error:", err);
    res.status(500).json({ message: "Failed to sign url" });
  }
};

// Batch presigned URLs
export const getPresignedBatch = async (req, res) => {
  try {
    const { type, files } = req.body;

    const items = await Promise.all(
      files.map(async (f) => {
        const ext = f.filetype.split("/")[1] || "png";
        const key = `${type}/${req.user._id}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          ContentType: f.filetype,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 180 });
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return { uploadUrl, fileUrl, key };
      })
    );

    res.json({ items });
  } catch (err) {
    console.error("❌ getPresignedBatch error:", err);
    res.status(500).json({ message: "Failed to sign batch URLs" });
  }
};

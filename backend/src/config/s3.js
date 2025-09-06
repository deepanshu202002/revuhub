import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Function to check credentials by listing buckets
export const checkS3Credentials = async () => {
  console.log("AWS_ACCESS_KEY:", process.env.AWS_ACCESS_KEY);
  console.log(
    "AWS_SECRET_KEY:",
    process.env.AWS_SECRET_KEY ? "***" : "MISSING"
  );
  console.log("AWS_REGION:", process.env.AWS_REGION);

  try {
    const data = await s3.send(new ListBucketsCommand({}));
    console.log(
      "✅ S3 connection test successful, buckets:",
      data.Buckets.map((b) => b.Name)
    );
  } catch (err) {
    console.error("❌ S3 connection test failed:", err.message);
  }
};

export default s3;

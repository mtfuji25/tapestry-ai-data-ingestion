import dotenv from "dotenv";
import { config as awsConfig } from "aws-sdk";

dotenv.config();

export function initAwsConfig(): void {
  // Configure the AWS SDK with credentials and region
  awsConfig.update({
    region: process.env.AWS_REGION || "us-east-1",
    // Either rely on the default credential provider chain or override with specific credentials:
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  console.info(
    `AWS SDK configured for region: ${process.env.AWS_REGION || "us-east-1"}`
  );
}

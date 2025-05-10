
// AWS configuration for services
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || "us-east-1";

// Get AWS credentials from environment variables
export const getAwsConfig = () => {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_ID";
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_ACCESS_KEY";
  const sessionToken = import.meta.env.VITE_AWS_SESSION_TOKEN || null;
  
  // Log configuration status (without revealing secrets)
  console.log("AWS credentials configuration:", {
    hasAccessKey: accessKeyId !== "YOUR_ACCESS_KEY_ID",
    hasSecretKey: secretAccessKey !== "YOUR_SECRET_ACCESS_KEY",
    hasSessionToken: !!sessionToken,
    region: AWS_REGION,
    s3Bucket: import.meta.env.VITE_S3_BUCKET_NAME || "not configured"
  });
  
  return {
    region: AWS_REGION,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  };
};

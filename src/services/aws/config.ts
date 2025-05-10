
// AWS configuration for services
export const AWS_REGION = "us-east-1"; // Change this to your preferred AWS region

// Replace these with your actual AWS credentials
export const getAwsConfig = () => {
  return {
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_ID", 
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_ACCESS_KEY",
    },
  };
};

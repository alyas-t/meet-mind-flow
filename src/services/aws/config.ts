
// AWS configuration for services
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || "us-east-1";

// Get AWS credentials from environment variables
export const getAwsConfig = () => {
  return {
    region: AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_ID", 
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_ACCESS_KEY",
    },
  };
};

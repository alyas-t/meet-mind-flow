
// AWS configuration for services
export const AWS_REGION = "us-east-1"; // Default region

// This would normally come from environment variables in a production app
export const getAwsConfig = () => {
  return {
    region: AWS_REGION,
    credentials: {
      accessKeyId: "YOUR_ACCESS_KEY_ID", // Replace with your AWS access key
      secretAccessKey: "YOUR_SECRET_ACCESS_KEY", // Replace with your AWS secret key
    },
  };
};

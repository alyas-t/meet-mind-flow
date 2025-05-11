
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getAwsConfig } from '@/services/aws/config';

const AwsCredentialNotice = () => {
  const config = getAwsConfig();
  const needsCredentials = 
    config.credentials.accessKeyId === "YOUR_ACCESS_KEY_ID" || 
    config.credentials.secretAccessKey === "YOUR_SECRET_ACCESS_KEY";
  
  if (!needsCredentials) {
    return null;
  }
  
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md my-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">AWS Credentials Required</h4>
          <p className="text-sm text-amber-700 mt-1">
            This application is currently using mock data. To enable full AWS functionality:
          </p>
          <ol className="text-sm text-amber-700 mt-2 list-decimal list-inside space-y-1 ml-2">
            <li>Add environment variables for AWS credentials:
              <ul className="ml-5 list-disc">
                <li>VITE_AWS_ACCESS_KEY_ID</li>
                <li>VITE_AWS_SECRET_ACCESS_KEY</li>
              </ul>
            </li>
            <li>Make sure your AWS account has the necessary permissions for Transcribe and Bedrock</li>
            <li>Create an S3 bucket for storing meeting recordings and transcripts</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AwsCredentialNotice;

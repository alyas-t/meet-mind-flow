
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AwsCredentialNotice = () => {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md my-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">AWS Credentials Required</h4>
          <p className="text-sm text-amber-700 mt-1">
            This application is currently using mock data. To enable full functionality with AWS services, 
            please provide valid AWS credentials in the configuration file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AwsCredentialNotice;

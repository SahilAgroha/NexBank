import React from 'react';
import { Clock } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Clock className="w-16 h-16 text-blue-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon!</h1>
      <p className="text-gray-500 max-w-md">
        This section is currently under development. We are working hard to bring you these features in the next update.
      </p>
    </div>
  );
};

export default ComingSoon;

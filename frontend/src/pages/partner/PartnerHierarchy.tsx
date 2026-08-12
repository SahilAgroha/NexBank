import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchHierarchy } from '../../features/partner/partnerSlice';
import { Users, ChevronRight, UserCircle2 } from 'lucide-react';

const HierarchyTree = ({ node, level = 0 }: { node: any; level?: number }) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);

  return (
    <div className={`mt-2 ${level > 0 ? 'ml-6 pl-4 border-l border-gray-200' : ''}`}>
      <div className="flex items-center space-x-3 group">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-gray-100 transition-colors ${node.downline?.length ? '' : 'invisible'}`}
        >
          <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
        
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 transition-colors cursor-pointer w-full max-w-md">
          <div className="bg-blue-50 p-2 rounded-full">
            <UserCircle2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{node.fullName}</p>
            <p className="text-xs text-gray-500">{node.partnerType}</p>
          </div>
          <div className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            {node.downline?.length || 0} downlines
          </div>
        </div>
      </div>
      
      {isExpanded && node.downline && node.downline.length > 0 && (
        <div className="mt-2 space-y-1">
          {node.downline.map((child: any) => (
            <HierarchyTree key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const PartnerHierarchy = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hierarchy, loading } = useSelector((state: RootState) => state.partner);

  useEffect(() => {
    dispatch(fetchHierarchy());
  }, [dispatch]);

  if (loading && !hierarchy) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Network Hierarchy</h1>
        <p className="text-sm text-gray-500 mt-1">View your downline partners and their network.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-100 min-h-[500px]">
        {hierarchy ? (
          <div className="py-4">
            <HierarchyTree node={hierarchy} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <p>No network hierarchy available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerHierarchy;

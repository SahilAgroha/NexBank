import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Trash2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchNotifications, markAsRead } from '../../features/notification/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        dispatch(markAsRead(n.id));
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="mr-3 h-6 w-6 text-blue-600" />
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">Stay updated with your account activity</p>
          </div>
          
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
              <p className="text-gray-500 mt-2 max-w-md">There are no new notifications to display right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-6 transition-colors hover:bg-gray-50 flex gap-4 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${!notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Bell className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-base font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
};

export default Notifications;

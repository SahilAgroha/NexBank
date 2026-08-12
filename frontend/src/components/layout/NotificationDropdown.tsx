import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchNotifications, fetchUnreadCount, markAsRead } from '../../features/notification/notificationSlice';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden transform transition-all duration-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications to display.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map(notification => (
                  <li 
                    key={notification.id} 
                    className={`p-4 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <Link 
              to="/notifications" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 block"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

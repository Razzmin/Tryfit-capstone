import React, {createContext, useState} from "react";

export const NotificationContent = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationContent.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContent.Provider>
  );
};
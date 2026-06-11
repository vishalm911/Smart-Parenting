export const createNotification = (
  childId,
  parentId,
  message,
  type
) => {

  return {
    childId,
    parentId,
    message,
    type,
    createdAt: new Date(),
    readStatus: false
  };
};

export const getNotifications = (
  parentId
) => {

  return [];
};

export const markAsRead = (
  notificationId
) => {

  return {
    success: true
  };
};

export const deleteNotification = (
  notificationId
) => {

  return {
    success: true
  };
};
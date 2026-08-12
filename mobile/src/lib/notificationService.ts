// src/lib/notificationService.ts

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let configured = false;

/**
 * Configure local notifications for:
 * - Leave updates
 * - Task allocations
 * - Announcements
 *
 * Expo Go SDK 53+ walin Android remote push notifications support wenne naha.
 * Local notifications development build / APK ekaka wada karanawa.
 */
export async function configureLocalNotifications(): Promise<boolean> {
  try {
    if (configured) {
      return true;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const currentPermission =
      await Notifications.getPermissionsAsync();

    let permissionStatus = currentPermission.status;

    if (permissionStatus !== 'granted') {
      const requestedPermission =
        await Notifications.requestPermissionsAsync();

      permissionStatus = requestedPermission.status;
    }

    if (Platform.OS === 'android') {
      /*
       * General channel
       */
      await Notifications.setNotificationChannelAsync(
        'staff-updates',
        {
          name: 'Staff Updates',
          description:
            'Leave, task allocation and announcement updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 150, 250],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          lightColor: '#7A1020',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );

      /*
       * Leave notification channel
       */
      await Notifications.setNotificationChannelAsync(
        'leave-updates',
        {
          name: 'Leave Updates',
          description:
            'Notifications about leave requests and approvals',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 150, 250],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          lightColor: '#16803D',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );

      /*
       * Task notification channel
       */
      await Notifications.setNotificationChannelAsync(
        'task-updates',
        {
          name: 'Task Allocations',
          description:
            'Notifications about newly assigned tasks and task updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 300, 150, 300],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          lightColor: '#6A1B9A',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );

      /*
       * Announcement notification channel
       */
      await Notifications.setNotificationChannelAsync(
        'announcement-updates',
        {
          name: 'Announcements',
          description:
            'Important announcements published by the administration',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 350, 150, 350],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          lightColor: '#D32F2F',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );
    }

    configured = permissionStatus === 'granted';

    return configured;
  } catch (error) {
    console.error(
      'Local notification configuration error:',
      error
    );

    configured = false;

    return false;
  }
}

interface LeaveNotificationInput {
  title: string;
  body: string;
  requestId?: number | string | null;
  notificationId?: number | string | null;
}

/**
 * Show leave notification.
 *
 * Touch karama LeaveBalance page eke
 * adala Leave History request eka open wenawa.
 */
export async function showLeaveNotification({
  title,
  body,
  requestId,
  notificationId,
}: LeaveNotificationInput): Promise<void> {
  try {
    const allowed =
      await configureLocalNotifications();

    if (!allowed) {
      console.log(
        'Leave notification permission not granted'
      );

      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          title?.trim() ||
          'Leave Update',

        body:
          body?.trim() ||
          'Your leave request has been updated.',

        sound: 'default',

        data: {
          screen: 'LeaveBalance',
          notificationType: 'leave',

          requestId:
            requestId !== null &&
            requestId !== undefined
              ? String(requestId)
              : null,

          notificationId:
            notificationId !== null &&
            notificationId !== undefined
              ? String(notificationId)
              : null,

          openedFromNotification: true,
          openHistory: true,
        },

        ...(Platform.OS === 'android'
          ? {
              priority:
                Notifications.AndroidNotificationPriority.HIGH,
            }
          : {}),
      },

      trigger:
        Platform.OS === 'android'
          ? {
              channelId: 'leave-updates',
            }
          : null,
    });
  } catch (error) {
    console.error(
      'Show leave notification error:',
      error
    );
  }
}

interface TaskNotificationInput {
  title: string;
  body: string;
  taskId?: number | string | null;
  notificationId?: number | string | null;
}

/**
 * Show task allocation notification.
 *
 * Touch karama TaskDetails page ekata yai.
 */
// 🔥 Profile Update / Role Change Requests සඳහා Notification එක
export const showProfileUpdateNotification = async ({
  title,
  body,
  requestId,
  
  notificationId,
}: {
  title: string;
  body: string;
  requestId?: number;
  
  notificationId?: number;
}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          notificationType: 'profile_change',
          requestId,
          notificationId,
        },
      },
      trigger: null, // null දුන්නම ඒ වෙලාවෙම Notification එක පෙන්නනවා
    });
  } catch (error) {
    console.error('Error showing profile update notification:', error);
  }
};

export async function showTaskNotification({
  title,
  body,
  taskId,
  notificationId,
}: TaskNotificationInput): Promise<void> {
  try {
    const allowed =
      await configureLocalNotifications();

    if (!allowed) {
      console.log(
        'Task notification permission not granted'
      );

      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          title?.trim() ||
          'New Task Assigned',

        body:
          body?.trim() ||
          'A new task has been assigned to you.',

        sound: 'default',

        data: {
          screen: 'TaskDetails',
          notificationType: 'task',

          taskId:
            taskId !== null &&
            taskId !== undefined
              ? String(taskId)
              : null,

          notificationId:
            notificationId !== null &&
            notificationId !== undefined
              ? String(notificationId)
              : null,

          openedFromNotification: true,
        },

        ...(Platform.OS === 'android'
          ? {
              priority:
                Notifications.AndroidNotificationPriority.HIGH,
            }
          : {}),
      },

      trigger:
        Platform.OS === 'android'
          ? {
              channelId: 'task-updates',
            }
          : null,
    });
  } catch (error) {
    console.error(
      'Show task notification error:',
      error
    );
  }
}

interface AnnouncementNotificationInput {
  title: string;
  body: string;
  announcementId?: number | string | null;
  notificationId?: number | string | null;
}

/**
 * Show announcement notification.
 *
 * Touch karama Announcements page eke
 * adala announcement eka open wenawa.
 */
export async function showAnnouncementNotification({
  title,
  body,
  announcementId,
  notificationId,
}: AnnouncementNotificationInput): Promise<void> {
  try {
    const allowed =
      await configureLocalNotifications();

    if (!allowed) {
      console.log(
        'Announcement notification permission not granted'
      );

      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          title?.trim() ||
          'New Announcement',

        body:
          body?.trim() ||
          'A new announcement has been published.',

        sound: 'default',

        data: {
          screen: 'Announcements',
          notificationType: 'announcement',

          announcementId:
            announcementId !== null &&
            announcementId !== undefined
              ? String(announcementId)
              : null,

          notificationId:
            notificationId !== null &&
            notificationId !== undefined
              ? String(notificationId)
              : null,

          openedFromNotification: true,
        },

        ...(Platform.OS === 'android'
          ? {
              priority:
                Notifications.AndroidNotificationPriority.HIGH,
            }
          : {}),
      },

      trigger:
        Platform.OS === 'android'
          ? {
              channelId: 'announcement-updates',
            }
          : null,
    });
  } catch (error) {
    console.error(
      'Show announcement notification error:',
      error
    );
  }
}

interface ComplaintNotificationInput {
  title: string;
  body: string;
  complaintId?: number | string | null;
  notificationId?: number | string | null;
}

/**
 * Optional complaint notification.
 *
 * Complaint reply/status update walatath use karanna puluwan.
 */
export async function showComplaintNotification({
  title,
  body,
  complaintId,
  notificationId,
}: ComplaintNotificationInput): Promise<void> {
  try {
    const allowed =
      await configureLocalNotifications();

    if (!allowed) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          title?.trim() ||
          'Complaint Update',

        body:
          body?.trim() ||
          'Your complaint has been updated.',

        sound: 'default',

        data: {
          screen: 'ComplaintSubmit',
          notificationType: 'complaint',

          complaintId:
            complaintId !== null &&
            complaintId !== undefined
              ? String(complaintId)
              : null,

          notificationId:
            notificationId !== null &&
            notificationId !== undefined
              ? String(notificationId)
              : null,

          openedFromNotification: true,
        },

        ...(Platform.OS === 'android'
          ? {
              priority:
                Notifications.AndroidNotificationPriority.HIGH,
            }
          : {}),
      },

      trigger:
        Platform.OS === 'android'
          ? {
              channelId: 'staff-updates',
            }
          : null,
    });
  } catch (error) {
    console.error(
      'Show complaint notification error:',
      error
    );
  }
}

/**
 * Badge count clear karanna.
 */
export async function clearNotificationBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error(
      'Clear notification badge error:',
      error
    );
  }
}

/**
 * Phone notification tray eke
 * app eken schedule karapu notifications clear karanna.
 */
export async function clearPresentedNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error(
      'Clear presented notifications error:',
      error
    );
  }
}
// src/app/NotificationNavigationBridge.tsx

import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import * as Notifications from 'expo-notifications';

import {
  configureLocalNotifications,
} from '../lib/notificationService';

interface Props {
  onNavigate: (
    screen: string,
    params?: any
  ) => void;
}

const getNumberValue = (
  value: unknown
): number | undefined => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue)
    ? undefined
    : parsedValue;
};

export default function NotificationNavigationBridge({
  onNavigate,
}: Props) {
  const lastHandledIdentifier =
    useRef<string | null>(null);

  const openNotification = useCallback(
    (
      response:
        | Notifications.NotificationResponse
        | null
    ) => {
      if (!response) {
        return;
      }

      const notificationIdentifier =
        response.notification.request.identifier;

      /*
       * getLastNotificationResponseAsync saha
       * addNotificationResponseReceivedListener
       * dekama same notification eka return karoth
       * duplicate navigation eka nawathwanawa.
       */
      if (
        lastHandledIdentifier.current ===
        notificationIdentifier
      ) {
        return;
      }

      lastHandledIdentifier.current =
        notificationIdentifier;

      const data =
        response.notification.request.content.data ||
        {};

      console.log(
        'Opened phone notification:',
        data
      );

      const screen =
        String(data.screen || '')
          .trim();

      const notificationType =
        String(
          data.notificationType ||
            data.notification_type ||
            ''
        )
          .trim()
          .toLowerCase();

      const requestId =
        getNumberValue(data.requestId);

      const taskId =
        getNumberValue(data.taskId);

      const announcementId =
        getNumberValue(
          data.announcementId
        );

      const complaintId =
        getNumberValue(
          data.complaintId
        );

      const notificationId =
        getNumberValue(
          data.notificationId
        );

      /*
       * Leave notification
       */
      if (
        notificationType === 'leave' ||
        screen === 'LeaveBalance' ||
        screen === 'LeaveHistory' ||
        requestId !== undefined
      ) {
        onNavigate(
          'LeaveBalance',
          {
            requestId,
            notificationId,
            openedFromNotification:
              true,
            openHistory: true,
          }
        );

        return;
      }

      /*
       * Task notification
       */
      if (
        notificationType === 'task' ||
        screen === 'TaskDetails' ||
        taskId !== undefined
      ) {
        onNavigate(
          'TaskDetails',
          {
            taskId,
            notificationId,
            openedFromNotification:
              true,
          }
        );

        return;
      }

      /*
       * Announcement notification
       */
      if (
        notificationType ===
          'announcement' ||
        screen === 'Announcements' ||
        announcementId !== undefined
      ) {
        onNavigate(
          'Announcements',
          {
            announcementId,
            notificationId,
            openedFromNotification:
              true,
          }
        );

        return;
      }

      /*
       * Complaint notification
       */
      if (
        notificationType ===
          'complaint' ||
        screen === 'ComplaintSubmit' ||
        complaintId !== undefined
      ) {
        onNavigate(
          'ComplaintSubmit',
          {
            complaintId,
            notificationId,
            openedFromNotification:
              true,
          }
        );

        return;
      }

      /*
       * Birthday notification
       */
      if (
        notificationType === 'birthday' ||
        screen === 'Dashboard'
      ) {
        onNavigate('Dashboard', {
          openedFromNotification: true,
        });
        return;
      }

      /*
       * Unknown/general notification
       */
      onNavigate(
        'Notifications',
        {
          notificationId,
          openedFromNotification:
            true,
        }
      );
    },
    [onNavigate]
  );

  useEffect(() => {
    configureLocalNotifications()
      .catch((error) => {
        console.error(
          'Notification configuration error:',
          error
        );
      });

    /*
     * App open wela thiyeddi user notification eka touch karama.
     */
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        openNotification
      );

    /*
     * App close wela thiyeddi notification eka touch karala
     * app open karoth last response eka meken gannawa.
     */
    Notifications
      .getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          openNotification(response);
        }
      })
      .catch((error) => {
        console.error(
          'Get last notification response error:',
          error
        );
      });

    return () => {
      responseSubscription.remove();
    };
  }, [openNotification]);

  return null;
}
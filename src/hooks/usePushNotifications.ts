import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive updates about courses and enrollment!",
        });
        // Show a welcome notification
        showNotification({
          title: "Welcome to MTech Academy!",
          body: "You'll receive notifications about new courses, updates, and reminders.",
          icon: "/icon-192.png",
        });
        return true;
      } else {
        toast({
          title: "Notifications Blocked",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const showNotification = useCallback(({ 
    title, 
    body, 
    icon = '/icon-192.png',
    tag 
  }: { 
    title: string; 
    body: string; 
    icon?: string;
    tag?: string;
  }) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/icon-192.png',
        tag,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    isEnabled: permission === 'granted',
  };
};

// Notification types for the app
export const NotificationTypes = {
  NEW_COURSE: 'new_course',
  COURSE_UPDATE: 'course_update',
  ENROLLMENT_CONFIRMED: 'enrollment_confirmed',
  PAYMENT_REMINDER: 'payment_reminder',
  PROGRESS_UPDATE: 'progress_update',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

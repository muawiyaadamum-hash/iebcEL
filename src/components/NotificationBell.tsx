import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationBell = () => {
  const { isSupported, isEnabled, requestPermission } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={requestPermission}
          className="relative"
        >
          {isEnabled ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {isEnabled && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isEnabled ? 'Notifications enabled' : 'Enable notifications'}
      </TooltipContent>
    </Tooltip>
  );
};

export default NotificationBell;

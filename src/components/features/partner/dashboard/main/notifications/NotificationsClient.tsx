"use client";

import { useMemo } from "react";
import { useNotifications } from "@/src/lib/notifications/NotificationsContext";
import { toUINotification } from "@/src/lib/notifications/adapters";
import Notifications from "./Notifications";

export default function NotificationsClient() {
  const { notifications } = useNotifications();
  const data = useMemo(
    () => notifications.map(toUINotification),
    [notifications]
  );
  return <Notifications notifications={data} />;
}

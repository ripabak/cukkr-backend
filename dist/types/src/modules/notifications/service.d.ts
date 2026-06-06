import { PaginatedResult } from '../../core/pagination';
import type { BookingModel } from '../bookings/model';
import { NotificationModel } from './model';
import { type Notification as NotificationRow } from './schema';
type NotificationListItem = NotificationModel.NotificationListItem;
type NotificationListQuery = NotificationModel.NotificationListQuery;
type NotificationMarkReadResponse = NotificationModel.NotificationMarkReadResponse;
type NotificationRegisterPushTokenResponse = NotificationModel.NotificationRegisterPushTokenResponse;
export type CreateNotificationsForRecipientsInput = {
    organizationId: string;
    recipientUserIds: string[];
    type: NotificationListItem['type'];
    title: string;
    body: string;
    referenceId?: string | null;
    referenceType?: NotificationListItem['referenceType'];
    data?: Record<string, unknown>;
};
export declare abstract class NotificationService {
    private static toNotificationListItem;
    private static deriveActionType;
    private static dispatchPushNotifications;
    private static dispatchWebPushNotifications;
    private static normalizePagination;
    private static getOwnedNotification;
    static listNotifications(recipientUserId: string, query: NotificationListQuery): Promise<PaginatedResult<NotificationListItem>>;
    static getUnreadCount(recipientUserId: string): Promise<NotificationModel.NotificationUnreadCountResponse>;
    static markAsRead(recipientUserId: string, notificationId: string): Promise<NotificationMarkReadResponse>;
    static markAllAsRead(recipientUserId: string): Promise<NotificationModel.NotificationMarkAllReadResponse>;
    static createNotificationsForRecipients(input: CreateNotificationsForRecipientsInput): Promise<NotificationRow[]>;
    static getOrganizationRecipientUserIds(organizationId: string): Promise<string[]>;
    static registerPushToken(userId: string, token: string): Promise<NotificationRegisterPushTokenResponse>;
    static registerWebPushSubscription(userId: string, input: NotificationModel.NotificationWebPushSubscribeInput): Promise<void>;
    static unregisterWebPushSubscription(userId: string, endpoint: string): Promise<void>;
    static executeAcceptAction(userId: string, notificationId: string): Promise<NotificationModel.NotificationActionResponse>;
    static executeDeclineAction(userId: string, notificationId: string, reason?: string): Promise<NotificationModel.NotificationActionResponse>;
    static createBookingNotifications(bookingDetail: BookingModel.BookingDetailResponse): Promise<void>;
    static cleanupOldNotifications(): Promise<{
        deletedCount: number;
    }>;
}
export {};

export type NotificationType =
  | "stock_low"
  | "sale"
  | "backup_success"
  | "stock_updated"
  | "stock_out"
  | "sync_error"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  metadata?: {
    amount?: string;
    productName?: string;
    quantity?: number;
  };
}

export type CanalMessage = {
  id: string;
  content: string;
  imageUrls?: string[];
  imageSizeLabel?: string;
  sentAt: string;
  isAdmin: boolean;
};

export type Reaction = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

export type CanalReply = {
  id: string;
  messageId: string;
  content: string;
  sentAt: string;
};

export type CanalMessageWithReactions = CanalMessage & {
  reactions: Reaction[];
};

export type CanalListItem =
  | { type: "date"; id: string; label: string }
  | { type: "message"; id: string; data: CanalMessageWithReactions };

import * as LucideIcons from "lucide-react-native";

export type ChannelAlertConfig = {
  title: string;
  description: string;
  iconName?: keyof typeof LucideIcons;
  color?: string;
  primaryButtonLabel: string;
  onPrimaryPress: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
};

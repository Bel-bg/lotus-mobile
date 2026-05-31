import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Bell,
  BellOff,
  ChevronLeft,
  MoreVertical,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Layout, Radius } from "@/constants/layout";
import { formatSubscriberCount } from "../utils/canal-list";

type Props = {
  onBack: () => void;
  channelName: string;
  avatarLabel: string;
  subscriberCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenMenu: () => void;
};

export default function CanalTopBar({
  onBack,
  channelName,
  avatarLabel,
  subscriberCount,
  isMuted,
  onToggleMute,
  onOpenMenu,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.iconButton} hitSlop={8}>
        <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2.5} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {channelName}
          </Text>
          <Text style={styles.subtitle}>
            {formatSubscriberCount(subscriberCount)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onToggleMute} style={styles.iconButton} hitSlop={8}>
          {isMuted ? (
            <BellOff size={20} color={Colors.textSecondary} strokeWidth={2.2} />
          ) : (
            <Bell size={20} color={Colors.textPrimary} strokeWidth={2.2} />
          )}
        </Pressable>
        <Pressable onPress={onOpenMenu} style={styles.iconButton} hitSlop={8}>
          <MoreVertical
            size={20}
            color={Colors.textPrimary}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    minHeight: Layout.headerHeight,
  },
  iconButton: {
    padding: 8,
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  avatar: {
    width: Layout.avatarMd,
    height: Layout.avatarMd,
    borderRadius: Radius.full,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  avatarText: {
    color: Colors.successText,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
  },
  titles: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});

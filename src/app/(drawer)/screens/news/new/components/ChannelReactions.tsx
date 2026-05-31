import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Shadow } from "@/constants/layout";
import { Reaction } from "../types/canal.types";
import { getTotalReactions } from "../utils/canal-list";

type Props = {
  reactions: Reaction[];
  onPress: () => void;
};

export default function ChannelReactions({ reactions, onPress }: Props) {
  const total = getTotalReactions(reactions);
  if (total === 0) return null;

  const topEmojis = reactions
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((reaction) => reaction.emoji);

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <View style={styles.pill}>
        <View style={styles.emojiRow}>
          {topEmojis.map((emoji) => (
            <Text key={emoji} style={styles.emoji}>
              {emoji}
            </Text>
          ))}
        </View>
        <Text style={styles.count}>{total}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
    marginTop: -10,
    marginLeft: 12,
    marginBottom: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  emojiRow: {
    flexDirection: "row",
    marginRight: 6,
  },
  emoji: {
    fontSize: FontSize.md,
    marginRight: -2,
  },
  count: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
  },
});

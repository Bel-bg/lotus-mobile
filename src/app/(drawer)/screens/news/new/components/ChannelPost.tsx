import { Pressable, StyleSheet, Text, View } from "react-native";
import { CanalMessageWithReactions } from "../../../../../../features/news/types/canal.types";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Shadow, Spacing } from "@/constants/layout";
import ChannelMedia from "./ChannelMedia";
import ChannelReactions from "./ChannelReactions";

type Props = {
  message: CanalMessageWithReactions;
  onReactionPress: () => void;
  onLongPress: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onImagePress: (messageId: string, index: number) => void;
  onDownload: (messageId: string) => void;
};

function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${part}-${index}`} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={`${part}-${index}`}>{part}</Text>;
  });
}

export default function ChannelPost({
  message,
  onReactionPress,
  onLongPress,
  onReply,
  onImagePress,
  onDownload,
}: Props) {
  const timeLabel = new Date(message.sentAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <Pressable
        onLongPress={() => onLongPress(message.id)}
        delayLongPress={280}
        style={styles.card}
      >
        {message.imageUrls && message.imageUrls.length > 0 ? (
          <ChannelMedia
            imageUrls={message.imageUrls}
            sizeLabel={message.imageSizeLabel}
            onImagePress={(index) => onImagePress(message.id, index)}
            onDownload={() => onDownload(message.id)}
          />
        ) : null}

        <View
          style={[
            styles.body,
            !message.imageUrls?.length && styles.bodyRoundedTop,
          ]}
        >
          <Text style={styles.content}>{renderContent(message.content)}</Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>

        <View style={styles.divider} />

        <Pressable
          style={styles.replyButton}
          onPress={() => onReply(message.id)}
        >
          <Text style={styles.replyLabel}>Répondre</Text>
        </Pressable>
      </Pressable>

      <ChannelReactions
        reactions={message.reactions}
        onPress={onReactionPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  bodyRoundedTop: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  content: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.55,
  },
  bold: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },
  time: {
    alignSelf: "flex-end",
    marginTop: Spacing[2],
    color: Colors.textTertiary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[4],
  },
  replyButton: {
    alignItems: "center",
    paddingVertical: Spacing[3],
  },
  replyLabel: {
    color: Colors.success,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
  },
});

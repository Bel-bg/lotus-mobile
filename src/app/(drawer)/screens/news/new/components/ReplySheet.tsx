import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";
import { CanalMessageWithReactions } from "../types/canal.types";

type Props = {
  visible: boolean;
  message: CanalMessageWithReactions | null;
  onClose: () => void;
  onSend: (content: string) => void;
};

export default function ReplySheet({
  visible,
  message,
  onClose,
  onSend,
}: Props) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (visible) {
      setContent("");
    }
  }, [visible, message?.id]);

  if (!message) return null;

  const preview =
    message.content.length > 120
      ? `${message.content.slice(0, 120).trimEnd()}…`
      : message.content;

  const canSend = content.trim().length > 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardWrap}
      >
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Spacing[3] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Répondre au canal</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>Publication</Text>
            <Text style={styles.quoteText} numberOfLines={3}>
              {preview.replace(/\*\*/g, "")}
            </Text>
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Écrivez votre réponse privée…"
            placeholderTextColor={Colors.textTertiary}
            style={styles.input}
            multiline
            maxLength={1000}
            autoFocus
          />

          <Pressable
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            disabled={!canSend}
            onPress={() => onSend(content.trim())}
          >
            <Send size={18} color={Colors.textInverse} />
            <Text style={styles.sendLabel}>Envoyer</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  keyboardWrap: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing[3],
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.lg,
  },
  closeButton: {
    padding: Spacing[1],
  },
  quote: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[3],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quoteLabel: {
    color: Colors.success,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    marginBottom: Spacing[1],
  },
  quoteText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  input: {
    minHeight: 96,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    color: Colors.textPrimary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    textAlignVertical: "top",
    backgroundColor: Colors.surface,
    marginBottom: Spacing[3],
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
    backgroundColor: Colors.success,
    borderRadius: Radius.lg,
    paddingVertical: Spacing[3],
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
  },
});

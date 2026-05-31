import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";

type MenuAction = {
  id: string;
  label: string;
  destructive?: boolean;
};

const MENU_ACTIONS: MenuAction[] = [
  { id: "share", label: "Partager le canal" },
  { id: "info", label: "Infos du canal" },
  { id: "report", label: "Signaler", destructive: true },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
};

export default function ChannelMenuSheet({
  visible,
  onClose,
  onAction,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          {MENU_ACTIONS.map((action, index) => (
            <Pressable
              key={action.id}
              style={[
                styles.row,
                index < MENU_ACTIONS.length - 1 && styles.rowBorder,
              ]}
              onPress={() => {
                onAction(action.id);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.label,
                  action.destructive && styles.labelDestructive,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={[styles.row, styles.cancelRow]} onPress={onClose}>
            <Text style={styles.cancelLabel}>Annuler</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
    padding: Spacing[4],
    paddingBottom: Spacing[6],
  },
  sheet: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  row: {
    paddingVertical: Spacing[4],
    alignItems: "center",
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  label: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.utility,
    fontSize: FontSize.base,
  },
  labelDestructive: {
    color: Colors.danger,
  },
  cancelRow: {
    marginTop: Spacing[2],
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
  },
  cancelLabel: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
  },
});

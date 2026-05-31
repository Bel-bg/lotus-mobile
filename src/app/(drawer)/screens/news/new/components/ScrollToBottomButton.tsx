import { Pressable, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Radius, Shadow } from "@/constants/layout";

type Props = {
  onPress: () => void;
  visible: boolean;
};

export default function ScrollToBottomButton({ onPress, visible }: Props) {
  if (!visible) return null;

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <ChevronDown size={22} color={Colors.textSecondary} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 20,
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
});

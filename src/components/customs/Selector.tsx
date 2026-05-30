// ============================================
// LOTUS BUSINESS — Composant : Selector
// ============================================
// Selecteur modal simple a choix unique

import React from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { Colors } from "../../constants/colors";
import { FontFamily } from "../../constants/typography";

export interface SelectorOption {
  label: string;
  value: string;
}

interface SelectorProps {
  visible: boolean;
  title: string;
  options: SelectorOption[];
  selectedValue?: string | null;
  onClose: () => void;
  onSelect: (option: SelectorOption) => void;
}

export default function Selector({
  visible,
  title,
  options,
  selectedValue = null,
  onClose,
  onSelect,
}: SelectorProps) {
  const renderItem = ({ item }: { item: SelectorOption }) => {
    const isSelected = item.value === selectedValue;

    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
        activeOpacity={0.8}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Text
          style={[styles.optionText, isSelected && styles.optionTextSelected]}
          numberOfLines={1}
        >
          {item.label}
        </Text>

        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <SafeAreaView>
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <X size={18} color={Colors.textPrimary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              </SafeAreaView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    maxHeight: "72%",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  listContent: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#FCFCFC",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionItemSelected: {
    backgroundColor: "#F7F7F7",
    borderColor: Colors.textPrimary,
  },
  optionText: {
    flex: 1,
    fontFamily: FontFamily.utility,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingRight: 12,
  },
  optionTextSelected: {
    fontFamily: FontFamily.utilityBold,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioSelected: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
});

import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Radius, Spacing } from "@/constants/layout";
import {
  chunkEmojis,
  filterEmojiCategories,
} from "../../../../../../features/news/data/emoji-data";

type SectionRow = {
  key: string;
  emojis: string[];
};

type EmojiSection = {
  title: string;
  data: SectionRow[];
};

type Props = {
  visible: boolean;
  recentEmojis: string[];
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export default function EmojiPicker({
  visible,
  recentEmojis,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const sections = useMemo<EmojiSection[]>(() => {
    const categories = filterEmojiCategories(query);
    const built: EmojiSection[] = [];

    if (!query.trim() && recentEmojis.length > 0) {
      built.push({
        title: "Récents",
        data: chunkEmojis(recentEmojis).map((row, index) => ({
          key: `recent-${index}`,
          emojis: row,
        })),
      });
    }

    for (const category of categories) {
      built.push({
        title: category.title,
        data: chunkEmojis(category.emojis).map((row, index) => ({
          key: `${category.id}-${index}`,
          emojis: row,
        })),
      });
    }

    return built;
  }, [query, recentEmojis]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + Spacing[2] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisir un emoji</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <X size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un emoji"
            placeholderTextColor={Colors.textTertiary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + Spacing[6],
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.emojis.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => {
                    onSelect(emoji);
                    handleClose();
                  }}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun emoji trouvé.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.xl,
  },
  closeButton: {
    padding: Spacing[2],
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    gap: Spacing[2],
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.textPrimary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: Spacing[3],
    marginBottom: Spacing[1],
  },
  emojiButton: {
    width: "12.5%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  emoji: {
    fontSize: 28,
  },
  empty: {
    padding: Spacing[8],
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
  },
});

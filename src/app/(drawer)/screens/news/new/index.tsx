import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "@/components/customs/Alert";
import CustomToast from "@/components/customs/toast";
import { copyText } from "@/lib/utils/clipboard";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/layout";
import CanalTopBar from "./components/CanalTopBar";
import ChannelMenuSheet from "./components/ChannelMenuSheet";
import ChannelPost from "./components/ChannelPost";
import DateSeparator from "./components/DateSeparator";
import EmojiPicker from "./components/EmojiPicker";
import EmptyCanal from "./components/EmptyCanal";
import ImageViewerModal from "./components/ImageViewerModal";
import ReplySheet from "./components/ReplySheet";
import ScrollToBottomButton from "./components/ScrollToBottomButton";
import { MOCK_CHANNEL } from "../../../../../features/news/data/canal.mock";
import { useCanalStore } from "../../../../../features/news/store/useCanalStore";
import { buildCanalListItems } from "../../../../../features/news/utils/canal-list";
import { downloadChannelImages } from "../../../../../features/news/utils/download-images";
import {
  CanalListItem,
  ChannelAlertConfig,
} from "../../../../../features/news/types/canal.types";
import { useEffect } from "react";
import { ActivityIndicator, Text } from "react-native";
import Loader from "@/components/ui/loader";

const CHANNEL_BACKGROUND = require("@/assets/background.png");

export default function CanalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<CanalListItem>>(null);
  const didInitialScroll = useRef(false);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isMuted, setIsMuted] = useState(MOCK_CHANNEL.isMuted);
  const [alertConfig, setAlertConfig] = useState<ChannelAlertConfig | null>(
    null,
  );
  const [toast, setToast] = useState({ visible: false, text: "" });

  const messages = useCanalStore((state) => state.messages);
  const recentEmojis = useCanalStore((state) => state.recentEmojis);
  const isChannelReported = useCanalStore((state) => state.isChannelReported);
  const loadingState = useCanalStore((state) => state.loadingState);
  const loadError = useCanalStore((state) => state.loadError);
  const loadMessages = useCanalStore((state) => state.loadMessages);
  const toggleReaction = useCanalStore((state) => state.toggleReaction);
  const sendReply = useCanalStore((state) => state.sendReply);
  const reportChannel = useCanalStore((state) => state.reportChannel);

  // Charge les infos au premier affichage
  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const listItems = useMemo(() => buildCanalListItems(messages), [messages]);

  const replyMessage = useMemo(
    () => messages.find((message) => message.id === replyMessageId) ?? null,
    [messages, replyMessageId],
  );

  const closeAlert = () => setAlertConfig(null);

  const showToast = (text: string) => {
    setToast({ visible: true, text });
  };

  const openEmojiPicker = (messageId: string) => {
    setActiveMessageId(messageId);
    setEmojiPickerVisible(true);
  };

  const handleSelectEmoji = (emoji: string) => {
    if (!activeMessageId) return;
    toggleReaction(activeMessageId, emoji);
    setEmojiPickerVisible(false);
  };

  const openReplySheet = (messageId: string) => {
    setReplyMessageId(messageId);
    setReplyVisible(true);
  };

  const handleSendReply = (content: string) => {
    if (!replyMessageId) return;
    sendReply(replyMessageId, content);
    setReplyVisible(false);
    setReplyMessageId(null);
    setAlertConfig({
      title: "Réponse envoyée",
      description:
        "Votre message privé a été transmis à l'équipe Lotus Business.",
      iconName: "Check",
      color: Colors.success,
      primaryButtonLabel: "Parfait",
      onPrimaryPress: closeAlert,
    });
  };

  const openImageViewer = (messageId: string, index: number) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message?.imageUrls?.length) return;
    setViewerImages(message.imageUrls);
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const handleDownloadImages = async (messageId: string) => {
    const message = messages.find((item) => item.id === messageId);
    if (!message?.imageUrls?.length) return;

    const result = await downloadChannelImages(message.imageUrls);
    if (result.success) {
      setAlertConfig({
        title: "Images enregistrées",
        description: `${result.savedCount} image${result.savedCount > 1 ? "s" : ""} enregistrée${result.savedCount > 1 ? "s" : ""} dans votre galerie.`,
        iconName: "Download",
        color: Colors.success,
        primaryButtonLabel: "OK",
        onPrimaryPress: closeAlert,
      });
      return;
    }

    setAlertConfig({
      title: "Téléchargement impossible",
      description: result.error ?? "Une erreur est survenue.",
      iconName: "AlertTriangle",
      color: Colors.danger,
      primaryButtonLabel: "Compris",
      onPrimaryPress: closeAlert,
    });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    showToast(
      nextMuted
        ? "Notifications du canal désactivées"
        : "Notifications du canal activées",
    );
  };

  const handleMenuAction = (actionId: string) => {
    if (actionId === "share") {
      void copyText(MOCK_CHANNEL.shareUrl).then((copied) => {
        setAlertConfig({
          title: copied ? "Lien copié" : "Partage du canal",
          description: copied
            ? "Le lien du canal Lotus Business est dans votre presse-papiers."
            : MOCK_CHANNEL.shareUrl,
          iconName: "Share2",
          color: Colors.info,
          primaryButtonLabel: "OK",
          onPrimaryPress: closeAlert,
        });
      });
      return;
    }

    if (actionId === "info") {
      setAlertConfig({
        title: MOCK_CHANNEL.name,
        description: `${MOCK_CHANNEL.description}\n\n${MOCK_CHANNEL.subscriberCount.toLocaleString("fr-FR")} abonnés · Créé le ${new Date(MOCK_CHANNEL.createdAt).toLocaleDateString("fr-FR")}`,
        iconName: "Info",
        color: Colors.accent,
        primaryButtonLabel: "Fermer",
        onPrimaryPress: closeAlert,
      });
      return;
    }

    if (actionId === "report") {
      if (isChannelReported) {
        setAlertConfig({
          title: "Signalement déjà envoyé",
          description:
            "Votre signalement est en cours d'examen par notre équipe.",
          iconName: "AlertTriangle",
          color: Colors.warning,
          primaryButtonLabel: "OK",
          onPrimaryPress: closeAlert,
        });
        return;
      }

      setAlertConfig({
        title: "Signaler ce canal ?",
        description:
          "Ce signalement sera transmis à l'équipe Lotus Business pour vérification.",
        iconName: "AlertTriangle",
        color: Colors.danger,
        primaryButtonLabel: "Signaler",
        onPrimaryPress: () => {
          reportChannel();
          closeAlert();
          setAlertConfig({
            title: "Signalement envoyé",
            description: "Merci, nous examinerons ce canal rapidement.",
            iconName: "Check",
            color: Colors.success,
            primaryButtonLabel: "OK",
            onPrimaryPress: closeAlert,
          });
        },
        secondaryButtonLabel: "Annuler",
        onSecondaryPress: closeAlert,
      });
    }
  };

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
    setShowScrollDown(false);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    setShowScrollDown(distanceFromBottom > 120);
  };

  const renderItem = ({ item }: { item: CanalListItem }) => {
    if (item.type === "date") {
      return <DateSeparator label={item.label} />;
    }

    return (
      <ChannelPost
        message={item.data}
        onLongPress={openEmojiPicker}
        onReactionPress={() => openEmojiPicker(item.data.id)}
        onReply={openReplySheet}
        onImagePress={openImageViewer}
        onDownload={handleDownloadImages}
      />
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.safeTop, { paddingTop: insets.top }]}>
        <CanalTopBar
          onBack={() => router.back()}
          channelName={MOCK_CHANNEL.name}
          avatarLabel={MOCK_CHANNEL.avatarLabel}
          subscriberCount={MOCK_CHANNEL.subscriberCount}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenMenu={() => setMenuVisible(true)}
        />
      </View>

      <ImageBackground
        source={CHANNEL_BACKGROUND}
        style={styles.background}
        resizeMode="cover"
      >
        {loadingState === "loading" && messages.length === 0 && (
          <View style={styles.centerOverlay}>
            <Loader />
          </View>
        )}

        {loadingState === "error" && (
          <View style={styles.centerOverlay}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity
              onPress={() => void loadMessages()}
              style={styles.retryBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={listItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={loadingState !== "loading" ? <EmptyCanal /> : null}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing[8] },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (!didInitialScroll.current && listItems.length > 0) {
              didInitialScroll.current = true;
              listRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <ScrollToBottomButton
          visible={showScrollDown}
          onPress={scrollToBottom}
        />
      </ImageBackground>

      <EmojiPicker
        visible={emojiPickerVisible}
        recentEmojis={recentEmojis}
        onSelect={handleSelectEmoji}
        onClose={() => setEmojiPickerVisible(false)}
      />

      <ReplySheet
        visible={replyVisible}
        message={replyMessage}
        onClose={() => {
          setReplyVisible(false);
          setReplyMessageId(null);
        }}
        onSend={handleSendReply}
      />

      <ImageViewerModal
        visible={viewerVisible}
        imageUrls={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      <ChannelMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onAction={handleMenuAction}
      />

      {alertConfig ? (
        <CustomAlert
          isVisible
          onClose={closeAlert}
          title={alertConfig.title}
          description={alertConfig.description}
          iconName={alertConfig.iconName}
          color={alertConfig.color}
          primaryButtonLabel={alertConfig.primaryButtonLabel}
          onPrimaryPress={alertConfig.onPrimaryPress}
          secondaryButtonLabel={alertConfig.secondaryButtonLabel}
          onSecondaryPress={alertConfig.onSecondaryPress}
        />
      ) : null}

      <CustomToast
        visible={toast.visible}
        text={toast.text}
        onHide={() => setToast({ visible: false, text: "" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeTop: {
    backgroundColor: Colors.background,
  },
  background: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[2],
    flexGrow: 1,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
    gap: 12,
  },
  errorText: {
    color: Colors.danger ?? "#C0392B",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.accent ?? "#0A0A0A",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
});

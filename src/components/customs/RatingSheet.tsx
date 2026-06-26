// ============================================================
// LOTUS BUSINESS — Composant : RatingSheet
// Sheet native (@expo/ui) — notation + objet + commentaire
// ============================================================

import { Star } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheet,
  Column,
  Host,
  RNHostView,
  Text as UIText,
} from "@expo/ui";
import { FontFamily } from "@/constants/typography";

const SCREEN_WIDTH = Dimensions.get("window").width;

const STORE_URL = Platform.select({
  ios: "https://apps.apple.com/app/idXXXXXXXXX",
  android: "market://details?id=com.lotus.business",
  default: "https://play.google.com/store/apps/details?id=com.lotus.business",
});

const RATING_LABELS: Record<number, string> = {
  0: "Appuyez sur une étoile",
  1: "Très décevant",
  2: "Peut mieux faire",
  3: "Correct",
  4: "Très bien",
  5: "Excellent !",
};

const SUBJECTS = [
  { label: "Choisir un thème…", value: "" },
  { label: "Interface & design", value: "ui" },
  { label: "Ventes & caisse", value: "pos" },
  { label: "Stock & inventaire", value: "stock" },
  { label: "Rapports & bilans", value: "reports" },
  { label: "Synchronisation cloud", value: "sync" },
  { label: "Performance", value: "perf" },
  { label: "Autre", value: "other" },
];

interface RatingSheetProps {
  isPresented: boolean;
  onDismiss: () => void;
  /** Callback optionnel — envoie rating + objet + commentaire à ton backend */
  onSubmit?: (data: { rating: number; subject: string; comment: string }) => void;
}

export function RatingSheet({
  isPresented,
  onDismiss,
  onSubmit,
}: RatingSheetProps) {
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetState = () => {
    setRating(0);
    setSubject("");
    setComment("");
    setSubmitted(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setTimeout(resetState, 400);
  };

  const handleSubmit = () => {
    if (rating === 0 || submitted) return;
    setSubmitted(true);
    onSubmit?.({ rating, subject, comment });

    setTimeout(() => {
      if (rating >= 4 && STORE_URL) {
        Linking.openURL(STORE_URL);
      }
      handleDismiss();
    }, 1200);
  };

  return (
    <Host>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={handleDismiss}
        showDragIndicator
        snapPoints={[{ fraction: submitted ? 0.35 : 0.68 }]}
      >
        <Column spacing={0}>
          <>
            {submitted ? (
              /* ── État succès ── */
              <RNHostView style={{ width: SCREEN_WIDTH }}>
                <View style={styles.successWrapper}>
                  <Text style={styles.successIcon}>🎉</Text>
                  <Text style={styles.successTitle}>Merci !</Text>
                  <Text style={styles.successSub}>
                    Votre avis a bien été reçu.
                    {rating >= 4
                      ? "\nOn vous redirige vers le store…"
                      : "\nNous en tiendrons compte pour améliorer l'app."}
                  </Text>
                </View>
              </RNHostView>
            ) : (
              <>
                {/* ── Titre ── */}
                <UIText
                  textStyle={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: "#0A0A0A",
                    textAlign: "center",
                  }}
                >
                  Noter l'application
                </UIText>

                {/* ── Sous-titre ── */}
                <UIText
                  textStyle={{
                    fontSize: 13,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Votre avis nous aide à améliorer Lotus Business.
                </UIText>

                {/* ── Étoiles + formulaire (RN) ── */}
                <RNHostView style={{ width: SCREEN_WIDTH }}>
                  <View style={styles.rnWrapper}>

                    {/* Étoiles */}
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => setRating(i)}
                          activeOpacity={0.7}
                          style={styles.starBtn}
                          accessibilityLabel={`${i} étoile${i > 1 ? "s" : ""}`}
                          accessibilityRole="button"
                        >
                          <Star
                            size={34}
                            color={i <= rating ? "#F59E0B" : "#E5E7EB"}
                            fill={i <= rating ? "#F59E0B" : "transparent"}
                            strokeWidth={1.5}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Label contextuel */}
                    <Text style={styles.ratingLabel}>
                      {RATING_LABELS[rating]}
                    </Text>

                    {/* Séparateur */}
                    <View style={styles.divider} />

                    {/* Objet — chips scrollables */}
                    <View style={styles.fieldGroup}>
                      <View style={styles.fieldLabelRow}>
                        <Text style={styles.fieldLabel}>Objet</Text>
                        <Text style={styles.badgeOptional}>facultatif</Text>
                      </View>
                      <RNScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                      >
                        {SUBJECTS.filter((s) => s.value !== "").map((s) => (
                          <TouchableOpacity
                            key={s.value}
                            style={[
                              styles.chip,
                              subject === s.value && styles.chipActive,
                            ]}
                            onPress={() =>
                              setSubject(subject === s.value ? "" : s.value)
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.chipLabel,
                                subject === s.value && styles.chipLabelActive,
                              ]}
                            >
                              {s.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </RNScrollView>
                    </View>

                    {/* Commentaire */}
                    <View style={styles.fieldGroup}>
                      <View style={styles.fieldLabelRow}>
                        <Text style={styles.fieldLabel}>Commentaire</Text>
                        <Text style={styles.badgeOptional}>facultatif</Text>
                      </View>
                      <TextInput
                        style={styles.textarea}
                        placeholder="Dites-nous ce que vous en pensez…"
                        placeholderTextColor="#D1D5DB"
                        multiline
                        numberOfLines={3}
                        maxLength={500}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                      />
                      <Text style={styles.charCount}>
                        {comment.length}/500
                      </Text>
                    </View>

                    {/* Bouton Envoyer */}
                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        rating === 0 && styles.submitBtnDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={rating === 0}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Envoyer mon avis"
                    >
                      <Text
                        style={[
                          styles.submitLabel,
                          rating === 0 && styles.submitLabelDisabled,
                        ]}
                      >
                        Envoyer mon avis
                      </Text>
                    </TouchableOpacity>

                  </View>
                </RNHostView>
              </>
            )}
          </>
        </Column>
      </BottomSheet>
    </Host>
  );
}

const styles = StyleSheet.create({
  rnWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: "stretch",
    width: "100%",
  },

  /* Étoiles */
  starsRow: {
    flexDirection: "row",
  justifyContent: "center",  
     alignSelf: "center",  
    gap: 6,
    marginBottom: 10,
  },
  starBtn: {
    padding: 6,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: FontFamily.utility,
    textAlign: "center",
    marginBottom: 18,
  },

  /* Séparateur */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginBottom: 18,
  },

  /* Champs */
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: FontFamily.utilityBold,
    color: "#374151",
    letterSpacing: 0.3,
  },
  badgeOptional: {
    fontSize: 10,
    color: "#9CA3AF",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  pickerWrapper: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  picker: {
    height: 44,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: FontFamily.utility,
    color: "#6B7280",
  },
  chipLabelActive: {
    color: "#FFFFFF",
    fontFamily: FontFamily.utilityBold,
  },
  textarea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 13,
    fontFamily: FontFamily.utility,
    color: "#111827",
    minHeight: 80,
  },
  charCount: {
    fontSize: 10,
    color: "#D1D5DB",
    textAlign: "right",
    marginTop: 4,
    fontFamily: FontFamily.utility,
  },

  /* Bouton */
  submitBtn: {
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  submitBtnDisabled: {
    backgroundColor: "#F3F4F6",
  },
  submitLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FontFamily.utilityBold,
  },
  submitLabelDisabled: {
    color: "#D1D5DB",
  },

  /* État succès */
  successWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  successIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: FontFamily.utilityBold,
    color: "#0A0A0A",
  },
  successSub: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: FontFamily.utility,
  },
});
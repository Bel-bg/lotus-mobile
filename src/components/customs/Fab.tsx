import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ChevronUp } from "lucide-react-native";
// ─── Types ───────────────────────────────────────────────────────────────────

export type FABAction = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type Props = {
  actions: FABAction[];
};

// ─── Calcul des positions en éventail ────────────────────────────────────────
// Arc de -55° à -125° (éventail vers le haut), radius 95px
// Les translateX/Y sont appliqués sur le wrapper de chaque action timerRef

function getActionPositions(count: number): { x: number; y: number }[] {
  const radius = 100;
  const startAngle = -100;
  const endAngle = -260;
  if (count === 1) return [{ x: 0, y: -radius }];

  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (i / (count - 1)) * (endAngle - startAngle);
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  });
}

// ─── Composant action individuelle ───────────────────────────────────────────

type ActionItemProps = {
  action: FABAction;
  position: { x: number; y: number };
  index: number;
  isOpen: boolean;
  onPress: () => void;
};

const ActionItem: React.FC<ActionItemProps> = ({
  action,
  position,
  index,
  isOpen,
  onPress,
}) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration: 160 + index * 25,
      easing: Easing.out(Easing.quad),
    });
  }, [isOpen]);

  // Le wrapper se translate vers sa position finale
  // Icône + label empilés en colonne, centrés sur le point de destination
  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: position.x * progress.value },
      { translateY: position.y * progress.value },
      { scale: 0.75 + 0.25 * progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.actionWrapper, animStyle]}
      pointerEvents={isOpen ? "auto" : "none"}
    >
      {/* Icône */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {action.icon}
      </TouchableOpacity>

      {/* Label en dessous, toujours horizontal et lisible */}
      <Text style={styles.actionLabel} numberOfLines={1}>
        {action.label}
      </Text>
    </Animated.View>
  );
};

// ─── FAB principal ────────────────────────────────────────────────────────────

export const FloatingActionButton: React.FC<Props> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateProgress = useSharedValue(0);
  const positions = getActionPositions(actions.length);

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    rotateProgress.value = withTiming(next ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    rotateProgress.value = withTiming(0, { duration: 200 });
  }, []);

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateProgress.value * 180}deg` }],
  }));

  return (
    <>
      {/* Overlay transparent pour fermer au tap extérieur */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}

      {/* Conteneur FAB — taille fixe, centré sur le bouton principal */}
      <View style={styles.container} pointerEvents="box-none">
        {/* Actions — toutes en position absolute depuis le centre du container */}
        {actions.map((action, i) => (
          <ActionItem
            key={action.key}
            action={action}
            position={positions[i]}
            index={i}
            isOpen={isOpen}
            onPress={() => {
              close();
              action.onPress();
            }}
          />
        ))}

        {/* Bouton FAB principal — par dessus les actions */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={toggle}
        >
          <Animated.View style={[styles.fabIcon, fabIconStyle]}>
            <ChevronUp size={24} color="#111111" />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const FAB_SIZE = 56;
const ACTION_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    right: 30,
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },

  // ── FAB principal
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  fabPressed: {
    backgroundColor: "#F0F0F0",
  },
  fabIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  actionWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 4,
    width: 80,
  },
  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111111",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});

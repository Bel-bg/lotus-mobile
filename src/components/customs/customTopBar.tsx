// ============================================
// LOTUS BUSINESS — Composant : CustomTopBar
// ============================================

import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  LayersPlus,
  Menu,
  Search,
  User,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "../../constants/colors";
import { FontFamily } from "../../constants/typography";
import BluetoothBadge from "../ui/BluetoothBadge";
import MenuIcon from "@/assets/icons/menu.png";
import NotifsIcon from "@/assets/icons/notification.png";

export type TopBarType =
  | "home"
  | "stock"
  | "bilan"
  | "profil"
  | "sauvegarde"
  | "mouvement"
  | "aide";

interface CustomTopBarProps {
  type: TopBarType;
  date?: string;
  onPressMenu?: () => void;
  onPressBell?: () => void;
  onPressSearch?: () => void;
  onPressLayersPlus?: () => void;
  onPressCalendar?: () => void;
}

export default function CustomTopBar({
  type,
  date,
  onPressMenu,
  onPressBell,
  onPressSearch,
  onPressLayersPlus,
  onPressCalendar,
}: CustomTopBarProps) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();

  const handlePressMenu = () => {
    if (onPressMenu) {
      onPressMenu();
    } else {
      navigation.openDrawer();
    }
  };

  const handlePressBell = () => {
    if (onPressBell) {
      onPressBell();
    } else {
      router.push("/notifications");
    }
  };
  const handlePressLayersPlus = () => {
    if (onPressLayersPlus) {
      onPressLayersPlus();
    } else {
      router.push("/(drawer)/screens/inventaire");
    }
  };
  const handlePressProfile = () => {
    router.push("/profil");
  };

  const renderContent = () => {
    switch (type) {
      case "home":
        return (
          <>
            <TouchableOpacity onPress={handlePressMenu} activeOpacity={0.7}>
              <Image source={MenuIcon} style={styles.customIcon} contentFit="contain" />
            </TouchableOpacity>
            <BluetoothBadge />
            <TouchableOpacity onPress={handlePressBell} activeOpacity={0.7}>
              <Image source={NotifsIcon} style={styles.customIcon} contentFit="contain" />
            </TouchableOpacity>
          </>
        );
      case "stock":
        return (
          <View style={{paddingTop: Platform.OS === "ios" ? 0 : 30, display: "flex", flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "space-between"}}>
            <Text style={styles.title}>Stock</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={onPressSearch}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Search size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePressLayersPlus}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <LayersPlus size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case "bilan":
        return (
          <>
            <Text style={styles.title}>Bilan</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={onPressCalendar}
                style={styles.datePicker}
                activeOpacity={0.7}
              >
                <Calendar size={18} color={Colors.textSecondary} strokeWidth={2.5} />
                <Text style={styles.dateText}>{date || "Aujourd'hui"}</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      case "profil":
        return (
          <>
            <Text style={styles.title}>Profil</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={handlePressBell}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Bell size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePressMenu}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Menu size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </>
        );
      case "sauvegarde":
        return (
          <>
            <Text style={styles.title}>Sauvegarde</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={handlePressProfile}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <User size={22} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePressMenu}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Menu size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </>
        );
      case "mouvement":
        return (
          <>
            <Text style={styles.title}>Mouvements</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={handlePressMenu}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Menu size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </>
        );
      case "aide":
        return (
          <>
            <Text style={styles.title}>Aide</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={handlePressBell}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Bell size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePressMenu}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Menu size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    letterSpacing: 1.2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  customIcon: {
    width: 24,
    height: 24,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderCurve: "continuous",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    gap: 8,
    maxWidth: 180,
  },
  dateText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
});

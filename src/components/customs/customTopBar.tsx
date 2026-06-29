// ============================================
// LOTUS BUSINESS — Composant : CustomTopBar
// ============================================

import { DrawerActions } from "@react-navigation/routers";
import { NavigationContext } from "@react-navigation/core";
import { useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  Menu,
  TextAlignStart,
  History,
  Store,
  StoreIcon,
} from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Colors } from "../../constants/colors";
import { FontFamily } from "../../constants/typography";
import BluetoothBadge from "../ui/BluetoothBadge";
import StatusBadge from "./StatusBadge";

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
  // useContext retourne undefined si hors contexte — pas d'exception contrairement à useNavigation
  const navContext = React.useContext(NavigationContext);
  const router = useRouter();

  const handlePressMenu = () => {
    if (onPressMenu) {
      onPressMenu();
    } else {
      navContext?.dispatch(DrawerActions.openDrawer());
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
    router.push("/(drawer)/screens/profil");
  };

  const renderContent = () => {
    switch (type) {
      case "home":
        return (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={handlePressMenu} activeOpacity={0.7}>
              <TextAlignStart size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePressProfile} activeOpacity={0.7}  >
            <StatusBadge />
            </TouchableOpacity>
            <TouchableOpacity  activeOpacity={0.7}>
              <Store size={24} />
            </TouchableOpacity>
          </View>
        );
      case "stock":
        return (
          <View
            style={{
              // paddingTop: Platform.OS === "ios" ? 0 : 30,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.title}>Analyse</Text>
            <View style={styles.headerIcons}>
              {/* <TouchableOpacity
                onPress={onPressSearch}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Search
                  size={20}
                  color={Colors.textPrimary}
                  strokeWidth={2.5}
                />
              </TouchableOpacity> */}
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
                <Calendar
                  size={18}
                  color={Colors.textSecondary}
                  strokeWidth={2.5}
                />
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
      case "mouvement":
        return (
          <>
            <Text style={styles.title}>Activités</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => {
                  router.replace('/(drawer)/screens/historique');
                }}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <History
                  size={20}
                  color={Colors.textPrimary}
                  strokeWidth={2.5}
                />
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
    color: Colors.textPrimary,
    letterSpacing: 1.5,
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

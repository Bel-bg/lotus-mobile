// ============================================
// LOTUS BUSINESS — Composant : CustomTopBar
// ============================================

import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Bell, Calendar, LayersPlus, Menu, Search, User, Logs } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { FontFamily } from "../../constants/typography";
import { useAuthStore } from "../../store/useAuthStore";

export type TopBarType = "home" | "stock" | "bilan" | "profil" | "sauvegarde" | "aide";

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
  const boutique = useAuthStore((state) => state.boutique);
  const boutiqueNom = boutique?.nom || "Success";
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
  }
  const handlePressProfile = () => {
    router.push("/profil");
  };

  const renderContent = () => {
    switch (type) {
      case "home":
        return (
          <>
            <Text style={styles.title}>{boutiqueNom}</Text>
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
      case "stock":
        return (
          <>
            <Text style={styles.title}>Stock</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={onPressSearch}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Search
                  size={20}
                  color={Colors.textPrimary}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePressLayersPlus}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <LayersPlus
                  size={20}
                  color={Colors.textPrimary}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={handlePressMenu}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Menu size={20} color={Colors.textPrimary} strokeWidth={2.5} />
              </TouchableOpacity> */}
            </View>
          </>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
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
  },
  iconButton: {
    marginLeft: 10,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateText: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
});

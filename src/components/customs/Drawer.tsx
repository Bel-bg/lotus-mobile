import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutGrid,
  LogOut,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontFamily } from "@/constants/typography";
import { useAuthStore } from "../../store/useAuthStore";

// 👉 Remplace ce chemin par ton image réelle
const DRAWER_BG = require("@/assets/drawer.png");

interface DrawerItemProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onPress?: () => void;
}

interface DrawerMenuItem {
  label: string;
  href: string;
  icon: (color: string) => React.ReactNode;
  matches: (pathname: string) => boolean;
}

const DrawerItem = ({ label, icon, isActive, onPress }: DrawerItemProps) => (
  <TouchableOpacity
    style={[styles.menuItem, isActive && styles.menuItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemContent}>
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        {icon}
      </View>
      <Text
        style={[
          styles.menuLabel,
          isActive && { color: "#0A0A0A", fontFamily: FontFamily.utilityBold },
        ]}
      >
        {label}
      </Text>
    </View>
    {isActive && <ChevronRight size={16} color="#0A0A0A" />}
  </TouchableOpacity>
);

export default function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const menuItems: DrawerMenuItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: (color) => <LayoutGrid size={20} color={color} />,
      matches: (p) => p === "/",
    },
    {
      label: "Profil",
      href: "/profil",
      icon: (color) => <User size={20} color={color} />,
      matches: (p) => p.startsWith("/profil"),
    },
    {
      label: "Historique des ventes",
      href: "/historique-ventes",
      icon: (color) => <FileText size={20} color={color} />,
      matches: (p) => p.startsWith("/historique-ventes"),
    },
    {
      label: "Aide",
      href: "/aide",
      icon: (color) => <HelpCircle size={20} color={color} />,
      matches: (p) => p.startsWith("/aide"),
    },
  ];

  const socialLinks = [

    {
      key: "Gmail",
      png: "https://i.pinimg.com/736x/da/da/17/dada173dafaf9854d9045009e3f86f61.jpg",
      url: "https://mail.google.com",
    },
    {
      key: "facebook",
      png: "https://i.pinimg.com/736x/49/47/52/494752f8b49a44aac5a152ddcb70c95d.jpg",
      url: "https://facebook.com",
    },
    {
      key: "instagram",
      png: "https://i.pinimg.com/736x/04/05/ed/0405eda56f4151d8cc4c4408f34ba1c9.jpg",
      url: "https://instagram.com",
    },
    {
      key: "whatsapp",
      png: "https://i.pinimg.com/736x/52/16/49/5216499f3137ba1f69694d5b7b9f549a.jpg",
      url: "https://wa.me/",
    },
  ];

  const handleNavigate = (href: string) => {
    props.navigation.closeDrawer();
    router.replace(href as never);
  };

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await logout();
  };

  return (
    <ImageBackground
      source={DRAWER_BG}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Overlay léger pour garder la lisibilité */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.appName}>Lotus Business</Text>
        </View>

        <View style={styles.divider} />

        {/* MENU */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {menuItems.map((item) => {
            const isActive = item.matches(pathname);
            const iconColor = isActive ? "#FFFFFF" : "#9CA3AF";
            return (
              <DrawerItem
                key={item.label}
                label={item.label}
                icon={item.icon(iconColor)}
                isActive={isActive}
                onPress={() => handleNavigate(item.href)}
              />
            );
          })}

          
        </ScrollView>
{/* SOCIAL ICONS */}
          <View style={styles.socialRow}>
            {socialLinks.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={styles.socialButton}
                onPress={() => Linking.openURL(s.url)}
                activeOpacity={0.6}
              >
                <Image
                  source={{ uri: s.png }}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        {/* FOOTER — LOGOUT */}
        <View style={styles.divider} />
        <TouchableOpacity style={styles.footer} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color="#9CA3AF" />
          <Text style={styles.footerLabel}>Déconnexion</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FontFamily.utilityBold,
  },
  appName: {
    fontSize: 24,
    fontFamily: FontFamily.display,
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 5,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  menuItemActive: {
    backgroundColor: "rgba(245, 245, 245, 0.9)",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  iconContainerActive: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },
  menuLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: FontFamily.utility,
    flexShrink: 1,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  socialButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  socialIcon: {
    width: 38,
    height: 38,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerLabel: {
    fontSize: 14,
    fontFamily: FontFamily.utility,
    color: "#9CA3AF",
  },
});
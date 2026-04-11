import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import {
  AlertTriangle,
  ChevronRight,
  Cloud,
  FileText,
  HelpCircle,
  History,
  LayoutGrid,
  LogOut,
  Package,
  User,
  LayersPlus,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { FontFamily } from "@/constants/typography";
import { useAuthStore } from "../../store/useAuthStore";

interface DrawerItemProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onPress?: () => void;
  activeColor?: string;
  activeSurface?: string;
  activeBorder?: string;
}

interface DrawerMenuItem {
  label: string;
  href: string;
  icon: (color: string) => React.ReactNode;
  matches: (pathname: string) => boolean;
  activeColor: string;
  activeSurface: string;
  activeBorder: string;
}

const DrawerItem = ({
  label,
  icon,
  isActive,
  onPress,
  activeColor,
  activeSurface,
  activeBorder,
}: DrawerItemProps) => (
  <TouchableOpacity
    style={[
      styles.menuItem,
      isActive && {
        backgroundColor: activeSurface,
        borderWidth: 1,
        borderColor: activeBorder,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemContent}>
      <View
        style={[styles.iconContainer, isActive && styles.iconContainerActive]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.menuLabel,
          isActive && {
            color: activeColor,
            fontFamily: FontFamily.utilityBold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
    {isActive && <ChevronRight size={16} color={activeColor} />}
  </TouchableOpacity>
);

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { boutique, displayName, email, photoURL, logout } = useAuthStore();

  const menuItems: DrawerMenuItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: (color) => <LayoutGrid size={20} color={color} />,
      matches: (currentPath) => currentPath === "/",
      activeColor: "#16A34A",
      activeSurface: "#ECFDF3",
      activeBorder: "#BBF7D0",
    },
    {
      label: "Stock",
      href: "/stock",
      icon: (color) => <Package size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/stock"),
      activeColor: "#2563EB",
      activeSurface: "#EFF6FF",
      activeBorder: "#BFDBFE",
    },
    {
      label: "Inventaire",
      href: "/inventaire",
      icon: (color) => <LayersPlus size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/inventaire"),
      activeColor: "#16A34A",
      activeSurface: "#ECFDF3",
      activeBorder: "#BBF7D0",
    },
    {
      label: "Historique des ventes",
      href: "/historique-ventes",
      icon: (color) => <FileText size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/historique-ventes"),
      activeColor: "#EA580C",
      activeSurface: "#FFF7ED",
      activeBorder: "#FED7AA",
    },
    {
      label: "Alertes stock",
      href: "/alertes-stock",
      icon: (color) => <AlertTriangle size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/alertes-stock"),
      activeColor: "#DC2626",
      activeSurface: "#FEF2F2",
      activeBorder: "#FECACA",
    },
    {
      label: "Historique des bilans",
      href: "/historique-bilans",
      icon: (color) => <History size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/historique-bilans"),
      activeColor: "#7C3AED",
      activeSurface: "#F3E8FF",
      activeBorder: "#D8B4FE",
    },
    {
      label: "Exports & PDF",
      href: "/documents",
      icon: (color) => <Cloud size={20} color={color} />,
      matches: (currentPath) =>
        currentPath.startsWith("/documents") ||
        currentPath.startsWith("/exports-pdf"),
      activeColor: "#0891B2",
      activeSurface: "#ECFEFF",
      activeBorder: "#A5F3FC",
    },
    {
      label: "Ma boutique",
      href: "/profil",
      icon: (color) => <User size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/profil"),
      activeColor: "#4F46E5",
      activeSurface: "#EEF2FF",
      activeBorder: "#C7D2FE",
    },
    {
      label: "Aide",
      href: "/aide",
      icon: (color) => <HelpCircle size={20} color={color} />,
      matches: (currentPath) => currentPath.startsWith("/aide"),
      activeColor: "#6B7280",
      activeSurface: "#F9FAFB",
      activeBorder: "#D1D5DB",
    },
  ];

  const handleNavigate = (href: string) => {
    props.navigation.closeDrawer();
    router.replace(href as never);
  };

  const boutiqueName = boutique?.nom?.trim();
  const profileTitle = boutiqueName || "Ma boutique";
  const profileSubtitle = displayName ?? email ?? "Configuration en attente";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/logo-black.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.appName}>Lotus Business</Text>
          {/* <Text style={styles.appTagline}>Pilote ta boutique au quotidien</Text> */}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* <View style={styles.profileSection}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
            </View>
          )}

          <Text style={styles.userName}>{profileTitle}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {profileSubtitle}
          </Text>
        </View> */}

        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Menu</Text>
          {menuItems.map((item) => {
            const isActive = item.matches(pathname);
            const iconColor = isActive ? item.activeColor : "#4B5563";

            return (
              <DrawerItem
                key={item.label}
                label={item.label}
                icon={item.icon(iconColor)}
                isActive={isActive}
                onPress={() => handleNavigate(item.href)}
                activeColor={item.activeColor}
                activeSurface={item.activeSurface}
                activeBorder={item.activeBorder}
              />
            );
          })}
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            // onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={Colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

        {/* <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>Lotus Business</Text>
          <Text style={styles.footerSubtitle}>Offline first, pensé pour le terrain</Text>
        </View> */}
        </View>
        
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  logo: {
    width: 38,
    height: 38,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FontFamily.display,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  appTagline: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: FontFamily.content,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    gap: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitials: {
    fontSize: 18,
    fontFamily: FontFamily.utilityBold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontFamily: FontFamily.display,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: FontFamily.content,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    marginBottom: 10,
    paddingHorizontal: 8,
    fontSize: 12,
    fontFamily: FontFamily.utilityBold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 6,
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
    backgroundColor: "#F3F4F6",
  },
  iconContainerActive: {
    backgroundColor: "#FFFFFF",
  },
  menuLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontFamily: FontFamily.utility,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 16,
    backgroundColor: Colors.background,
  },
  footerInfo: {
    gap: 2,
  },
  footerTitle: {
    fontSize: 14,
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },
  footerSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.content,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: {
    color: Colors.dangerText,
    fontSize: 14,
    fontFamily: FontFamily.utilityBold,
  },
});

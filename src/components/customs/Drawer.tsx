import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import {
  ChevronRight,
  Home,
  User,
  Megaphone,
  HelpCircle,
  Crown,
  HardDrive,
  Star,
  LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontFamily } from "@/constants/typography";
import { RatingSheet } from "./RatingSheet";

// ─── Couleurs d'accent par item ──────────────────────────────────────────────

const ICON_COLORS: Record<string, string> = {
  Accueil:              "#1A56DB",
  Profil:               "#0E9F6E",
  "Infos & Nouveautés": "#D03801",
  Aide:                 "#7E3AF2",
  Premium:              "#C27803",
  Sauvegarde:           "#1A4A7A",
  "Noter l'app":        "#D97706",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface DrawerMenuItemDef {
  label: string;
  href?: string;          // undefined → action custom (ex: ouvre un sheet)
  Icon: LucideIcon;
  matches: (pathname: string) => boolean;
  onPress?: () => void;   // si défini, overrides la navigation
}

// ─── DrawerItem ───────────────────────────────────────────────────────────────

interface DrawerItemProps {
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onPress: () => void;
}

function DrawerItem({ label, Icon, isActive, onPress }: DrawerItemProps) {
  const accentColor = ICON_COLORS[label] ?? "#374151";

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        isActive && { backgroundColor: `${accentColor}18` }, // ~10% opacité
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        {/* Icône 3D */}
        <View style={[styles.iconOuter, { backgroundColor: accentColor }]}>
          <View style={[styles.iconInner, { backgroundColor: accentColor }]}>
            <Icon size={16} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </View>

        <Text
          style={[
            styles.menuLabel,
            isActive && {
              color: accentColor,
              fontFamily: FontFamily.utilityBold,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      {isActive && <ChevronRight size={15} color={accentColor} />}
    </TouchableOpacity>
  );
}

// ─── DrawerContent ────────────────────────────────────────────────────────────

const socialLinks = [
  {
    key: "Gmail",
    png: "https://i.postimg.cc/6pXKDnCf/gog.png",
    url: "https://wa.me/59466991",
  },
  {
    key: "facebook",
    png: "https://i.postimg.cc/3wxsTBNg/face.png",
    url: "https://wa.me/59466991",
  },
  {
    key: "instagram",
    png: "https://i.postimg.cc/HLNhC1fy/ins.png",
    url: "https://wa.me/59466991",
  },
  {
    key: "whatsapp",
    png: "https://i.postimg.cc/fbPrhQ60/waw.png",
    url: "https://wa.me/59466991",
  },
];

export default function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ratingVisible, setRatingVisible] = useState(false);

  const menuItems: DrawerMenuItemDef[] = [
    {
      label: "Accueil",
      href: "/",
      Icon: Home,
      matches: (p) => p === "/",
    },
    {
      label: "Profil",
      href: "/profil",
      Icon: User,
      matches: (p) => p.startsWith("/profil"),
    },
    {
      label: "Infos & Nouveautés",
      href: "/news",
      Icon: Megaphone,
      matches: (p) => p.startsWith("/news"),
    },
    {
      label: "Premium",
      href: "/premium",
      Icon: Crown,
      matches: (p) => p.startsWith("/premium"),
    },
    {
      label: "Sauvegarde",
      href: "/screens/sauvegarde",
      Icon: HardDrive,
      matches: (p) => p.includes("/sauvegarde"),
    },
    {
      label: "Aide",
      href: "/aide",
      Icon: HelpCircle,
      matches: (p) => p.startsWith("/aide"),
    },
    {
      label: "Noter l'app",
      Icon: Star,
      matches: () => false, // jamais "actif" comme une route
      onPress: () => {
        props.navigation.closeDrawer();
        setRatingVisible(true);
      },
    },
  ];

  const handleNavigate = (href: string) => {
    props.navigation.closeDrawer();
    router.replace(href as never);
  };

  return (
    <View style={styles.bgSolid}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

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
          {menuItems.map((item) => (
            <DrawerItem
              key={item.label}
              label={item.label}
              Icon={item.Icon}
              isActive={item.matches(pathname)}
              onPress={
                item.onPress
                  ? item.onPress
                  : () => handleNavigate(item.href!)
              }
            />
          ))}
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

        {/* RATING SHEET */}
        <RatingSheet
          isPresented={ratingVisible}
          onDismiss={() => setRatingVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bgSolid: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingBottom: 12,
  },

  // Header
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  appName: {
    fontSize: 32,
    fontFamily: FontFamily.display,
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },

  divider: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },

  // Scroll menu
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: "center",
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flex: 1,
  },

  // Icône 3D
  iconOuter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 6,
    borderBottomWidth: 3,
    borderRightWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.30)",
    borderRightColor: "rgba(0,0,0,0.20)",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  iconInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    borderLeftColor: "rgba(255,255,255,0.15)",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },

  menuLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: FontFamily.utility,
    flexShrink: 1,
  },

  // Social
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  socialButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "rgba(255,255,255,0.85)",
  },
  socialIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
});

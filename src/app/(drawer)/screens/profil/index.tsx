import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from "react-native";
import {
  Edit2,
  ChevronRight,
  Cloud,
  Database,
  History,
  Trash2,
  LogOut,
  Smartphone,
  Info,
  Settings2,
  ArrowLeft,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { useRouter, router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

interface ProfileItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  destructive?: boolean;
}

const ProfileItem = ({
  icon: Icon,
  label,
  value,
  onPress,
  showChevron = true,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  destructive = false,
}: ProfileItemProps) => {
  const Card = onPress ? TouchableOpacity : View;

  return (
    <Card style={styles.itemContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeading}>
        <View
          style={[styles.iconBox, destructive && styles.iconBoxDestructive]}
        >
          <Icon
            size={20}
            color={destructive ? Colors.danger : Colors.textPrimary}
          />
        </View>
        <Text
          style={[styles.itemLabel, destructive && styles.itemLabelDestructive]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.itemTrailing}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E0E0E0", true: Colors.success }}
            thumbColor={"#fff"}
          />
        ) : (
          showChevron && <ChevronRight size={20} color={Colors.borderStrong} />
        )}
      </View>
    </Card>
  );
};

export default function ProfileScreen() {
  const [autoBackup, setAutoBackup] = React.useState(true);
  
  const boutique = useAuthStore(s => s.boutique);
  const email = useAuthStore(s => s.email);

  const shopName = boutique?.nom || "Ma Boutique";
  const managerName = boutique?.gerant || boutique?.proprietaire || "Non renseigné";
  const currency = boutique?.devise || "FCFA";
  const phone = boutique?.telephone || "Non renseigné";
  const userEmail = email || boutique?.email || "Non renseigné";
  
  const getInitials = (name: string) => {
    if (!name) return "B";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} selectable>
          {shopName}
        </Text>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.75}>
          <Settings2 size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(shopName)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatar}>
              <Edit2 size={16} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.managerName}>{managerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma boutique</Text>
          <ProfileItem
            icon={Smartphone}
            label="Nom de la boutique"
            value={shopName}
            onPress={() => {}}
          />
          <ProfileItem
            icon={Database}
            label="Devise"
            value={currency}
            onPress={() => {}}
          />
          <ProfileItem
            icon={Info}
            label="Numéro de téléphone"
            value={phone}
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stockage & Sync</Text>
          <ProfileItem
            icon={Cloud}
            label="Compte Google"
            value={userEmail}
            onPress={() => {}}
          />
          <ProfileItem
            icon={Cloud}
            label="Sauvegarde automatique"
            isSwitch={true}
            switchValue={autoBackup}
            onSwitchChange={setAutoBackup}
            showChevron={false}
          />
          <ProfileItem
            icon={Database}
            label="Dossier Drive"
            value="BoutiqueApp/"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <ProfileItem
            icon={Database}
            label="Exporter toutes les données"
            onPress={() => {}}
          />
          <ProfileItem
            icon={History}
            label="Historique des bilans"
            onPress={() => {}}
          />
          <ProfileItem
            icon={Trash2}
            label="Vider le cache"
            value="12.4 MB"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Réinitialiser l'application</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Lotus Business v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
  },
  header: {
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Outfit_700Bold",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for custom tab bar
  },
  profileCard: {
    alignItems: "center",
    marginVertical: 30,
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    padding: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: FontFamily.display,
    color: "#fff",
  },
  editAvatar: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: Colors.textPrimary,
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  shopName: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  managerName: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemLeading: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconBoxDestructive: {
    backgroundColor: Colors.dangerLight,
  },
  itemLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemLabelDestructive: {
    color: Colors.danger,
  },
  itemTrailing: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dangerLight,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
    marginTop: 10,
  },
  logoutText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.danger,
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  versionText: {
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

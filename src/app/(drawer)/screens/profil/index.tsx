import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "expo-router";
import {
  ChevronRight,
  Database,
  Trash2,
  LogOut,
  Smartphone,
  Info,
  Settings2,
  ArrowLeft,
  User,
  Store,
  MapPin,
  MessageCircle,
  FileText,
  Mail,
  Globe2,
  ShieldAlert,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Colors } from "@/constants/colors";
import { FontFamily, FontSize } from "@/constants/typography";
import { Boutique } from "@/types";
import { clearBusinessData, DB_NAME, getBoutique, getDB, resetDB, updateBoutique } from "@/lib/db";
import { useAuthStore } from "@/store/useAuthStore";
import CustomAlert from "@/components/customs/Alert";
// Lotus Business
type AlertConfig = {
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof CustomAlert>["iconName"];
  color: string;
  primaryButtonLabel: string;
  onPrimaryPress: () => void | Promise<void>;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
};

type BoutiqueField = keyof Pick<
  Boutique,
  | "nom"
  | "proprietaire"
  | "gerant"
  | "telephone"
  | "whatsapp"
  | "ifu"
  | "devise"
  | "email"
  | "pays"
  | "ville"
  | "bp"
  | "specialiteBoutique"
  | "politiqueVentes"
>;

interface ProfileItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

interface EditableField {
  key: BoutiqueField;
  label: string;
  icon: any;
  onPressMenu?: () => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}

const EMPTY_BOUTIQUE: Boutique = {
  nom: "",
  proprietaire: "",
  gerant: "",
  pays: "",
  ville: "",
  bp: "",
  telephone: "",
  whatsapp: "",
  ifu: "",
  politiqueVentes: "Les produits vendus ne sont ni échangés ni repris",
  specialiteBoutique: "",
  devise: "FCFA",
  email: "",
};
const SHOP_FIELDS: EditableField[] = [
  { key: "nom", label: "Nom de la boutique", icon: Store, placeholder: "Ma boutique" },
  { key: "specialiteBoutique", label: "Spécialité", icon: Info, placeholder: "Alimentation, textile..." },
  { key: "devise", label: "Devise", icon: Database, placeholder: "FCFA" },
  { key: "ifu", label: "Numéro IFU", icon: FileText, placeholder: "Ex: 3200..." },
];

const OWNER_FIELDS: EditableField[] = [
  { key: "proprietaire", label: "Propriétaire", icon: User, placeholder: "Nom du propriétaire" },
  { key: "gerant", label: "Gérant", icon: User, placeholder: "Nom du gérant" },
  { key: "telephone", label: "Téléphone", icon: Smartphone, placeholder: "+229 ...", keyboardType: "phone-pad" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "+229 ...", keyboardType: "phone-pad" },
  { key: "email", label: "Email", icon: Mail, placeholder: "contact@boutique.com", keyboardType: "email-address" },
];

const LOCATION_FIELDS: EditableField[] = [
  { key: "pays", label: "Pays", icon: Globe2, placeholder: "Bénin" },
  { key: "ville", label: "Ville", icon: MapPin, placeholder: "Cotonou" },
  { key: "bp", label: "Boîte postale", icon: Mail, placeholder: "BP ..." },
  {
    key: "politiqueVentes",
    label: "Politique de vente",
    icon: Info,
    placeholder: "Conditions de vente",
    multiline: true,
  },
];

const getValue = (boutique: Boutique | null, key: BoutiqueField) => {
  const value = boutique?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "Non renseigné";
};

const ProfileItem = ({
  icon: Icon,
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
}: ProfileItemProps) => {
  const Card = onPress ? TouchableOpacity : View;

  return (
    <Card style={styles.itemContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeading}>
        <View style={[styles.iconBox, destructive && styles.iconBoxDestructive]}>
          <Icon size={20} color={destructive ? Colors.danger : Colors.textPrimary} />
        </View>
        <Text style={[styles.itemLabel, destructive && styles.itemLabelDestructive]}>
          {label}
        </Text>
      </View>

      <View style={styles.itemTrailing}>
        {!!value && (
          <Text style={[styles.itemValue, destructive && styles.itemValueDestructive]} numberOfLines={1} selectable>
            {value}
          </Text>
        )}
        {showChevron && <ChevronRight size={20} color={Colors.borderStrong} />}
      </View>
    </Card>
  );
};

export default function ProfileScreen(
  onPressMenu?: () => void
) {
  const navigation = useNavigation() as any;

  const handlePressMenu = () => {
    if (onPressMenu) {
      onPressMenu();
    } else {
      navigation.openDrawer();
    }
  };
  const [editingField, setEditingField] = React.useState<EditableField | null>(null);
  const [draftValue, setDraftValue] = React.useState("");
  const [isBusy, setIsBusy] = React.useState(false);
  const [alertConfig, setAlertConfig] = React.useState<AlertConfig | null>(null);

  const boutique = useAuthStore((state) => state.boutique);
  const setBoutique = useAuthStore((state) => state.setBoutique);

  const currentBoutique = boutique ?? EMPTY_BOUTIQUE;
  const shopName = getValue(currentBoutique, "nom") === "Non renseigné" ? "Ma Boutique" : getValue(currentBoutique, "nom");
  const cityLabel = [currentBoutique.ville, currentBoutique.pays]
    .filter((value) => typeof value === "string" && value.trim())
    .join(", ");

  const closeAlert = () => setAlertConfig(null);

  const showInfoAlert = (
    title: string,
    description: string,
    iconName: AlertConfig["iconName"] = "CheckCircle",
    color: string = Colors.success
  ) => {
    setAlertConfig({
      title,
      description,
      iconName,
      color,
      primaryButtonLabel: "OK",
      onPrimaryPress: closeAlert,
    });
  };

  const openEditor = (field: EditableField) => {
    const value = currentBoutique[field.key];
    setEditingField(field);
    setDraftValue(typeof value === "string" ? value : "");
  };

  const refreshBoutique = async () => {
    const nextBoutique = await getBoutique();
    setBoutique(nextBoutique ?? EMPTY_BOUTIQUE);
  };

  const saveField = async () => {
    if (!editingField) return;

    try {
      setIsBusy(true);
      await updateBoutique({ [editingField.key]: draftValue.trim() } as Partial<Boutique>);
      await refreshBoutique();
      setEditingField(null);
      setDraftValue("");
    } catch (error) {
      console.error("Erreur mise à jour boutique:", error);
      showInfoAlert(
        "Modification impossible",
        "La valeur n'a pas pu être enregistrée.",
        "AlertTriangle",
        Colors.danger
      );
    } finally {
      setIsBusy(false);
    }
  };

  const exportDatabase = async () => {
    try {
      setIsBusy(true);

      const source = new File(Paths.document, "SQLite", DB_NAME);
      if (!source.exists) {
        showInfoAlert(
          "Export impossible",
          "Le fichier de base de données est introuvable.",
          "AlertTriangle",
          Colors.danger
        );
        return;
      }

      // Copie dans un dossier temporaire avant le partage
      const exportsDirectory = new Directory(Paths.document, "exports");
      exportsDirectory.create({ idempotent: true });

      const database = getDB();
      await database.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const destination = new File(exportsDirectory, `lotus-business-${timestamp}.db`);
      if (destination.exists) destination.delete();
      source.copy(destination);

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        showInfoAlert(
          "Partage non disponible",
          `Le fichier a été créé ici :\n${destination.uri}`,
          "AlertTriangle",
          Colors.warning
        );
        return;
      }

      // Ouvre le dialogue natif : l'utilisateur choisit où envoyer/enregistrer le fichier
      await Sharing.shareAsync(destination.uri, {
        mimeType: "application/octet-stream",
        dialogTitle: "Enregistrer la base de données",
        UTI: "public.database",
      });
    } catch (error) {
      console.error("Erreur export base:", error);
      showInfoAlert(
        "Export impossible",
        "La base de données n'a pas pu être exportée.",
        "AlertTriangle",
        Colors.danger
      );
    } finally {
      setIsBusy(false);
    }
  };

  const confirmClearBusinessData = () => {
    setAlertConfig({
      title: "Supprimer toutes les données ?",
      description: "Les produits, ventes, mouvements, bilans et charges seront supprimés. Les infos boutique restent conservées.",
      iconName: "AlertTriangle",
      color: Colors.danger,
      primaryButtonLabel: "Supprimer",
      secondaryButtonLabel: "Annuler",
      onSecondaryPress: closeAlert,
      onPrimaryPress: async () => {
        closeAlert();
        try {
          setIsBusy(true);
          await clearBusinessData();
          showInfoAlert("Données supprimées", "Les données métier ont été vidées.", "CheckCircle", Colors.success);
        } catch (error) {
          console.error("Erreur suppression données:", error);
          showInfoAlert(
            "Suppression impossible",
            "Les données n'ont pas pu être supprimées.",
            "AlertTriangle",
            Colors.danger
          );
        } finally {
          setIsBusy(false);
        }
      },
    });
  };

  const confirmResetApp = () => {
    setAlertConfig({
      title: "Réinitialiser l'application ?",
      description: "Toute la base locale sera recréée, y compris les informations de boutique. Cette action est irréversible.",
      iconName: "ShieldAlert",
      color: Colors.danger,
      primaryButtonLabel: "Réinitialiser",
      secondaryButtonLabel: "Annuler",
      onSecondaryPress: closeAlert,
      onPrimaryPress: async () => {
        closeAlert();
        try {
          setIsBusy(true);
          await resetDB();
          await refreshBoutique();
          showInfoAlert(
            "Application réinitialisée",
            "La base locale est revenue à son état initial.",
            "CheckCircle",
            Colors.success
          );
        } catch (error) {
          console.error("Erreur reset app:", error);
          showInfoAlert(
            "Réinitialisation impossible",
            "L'application n'a pas pu être réinitialisée.",
            "AlertTriangle",
            Colors.danger
          );
        } finally {
          setIsBusy(false);
        }
      },
    });
  };

  const renderFields = (fields: EditableField[]) =>
    fields.map((field) => (
      <ProfileItem
        key={field.key}
        icon={field.icon}
        label={field.label}
        value={getValue(currentBoutique, field.key)}
        onPress={() => openEditor(field)}
      />
    ));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePressMenu} style={styles.iconButton} activeOpacity={0.75}>
          <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} selectable numberOfLines={1}>
            {shopName}
          </Text>
          <View style={styles.headerMetaRow}>
            <Store size={12} color={Colors.textSecondary} strokeWidth={2.4} />
            <Text style={styles.headerMeta} numberOfLines={1}>
              {cityLabel || "Configuration locale"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.75} onPress={() => openEditor(SHOP_FIELDS[0])}>
          <Settings2 size={18} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.spacer}/>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma boutique</Text>
          {renderFields(SHOP_FIELDS)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propriétaire & contacts</Text>
          {renderFields(OWNER_FIELDS)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse & politique</Text>
          {renderFields(LOCATION_FIELDS)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres techniques</Text>
          <ProfileItem icon={Database} label="Exporter la base de données" onPress={exportDatabase} />
          {/* <ProfileItem icon={Braces} label="Exporter les données dans un fichier JSON" onPress={() => ()} /> */}
          <ProfileItem
            icon={Trash2}
            label="Supprimer toutes les données"
            value="Garde la boutique"
            onPress={confirmClearBusinessData}
            destructive
          />
          <ProfileItem
            icon={ShieldAlert}
            label="Réinitialisation complète"
            value="Irréversible"
            onPress={confirmResetApp}
            destructive
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmResetApp}>
          <LogOut size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{"Réinitialiser l'application"}</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Lotus Business v1.0.0</Text>
        </View>
      </ScrollView>

      <Modal transparent visible={!!editingField} animationType="fade" onRequestClose={() => setEditingField(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Modifier</Text>
            <Text style={styles.modalLabel}>{editingField?.label}</Text>
            <TextInput
              style={[styles.input, editingField?.multiline && styles.inputMultiline]}
              value={draftValue}
              onChangeText={setDraftValue}
              placeholder={editingField?.placeholder}
              placeholderTextColor={Colors.textTertiary}
              keyboardType={editingField?.keyboardType ?? "default"}
              multiline={editingField?.multiline}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingField(null)} disabled={isBusy}>
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={saveField} disabled={isBusy}>
                {isBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isBusy && !editingField && (
        <View style={styles.busyOverlay}>
          <ActivityIndicator color={Colors.textInverse} />
        </View>
      )}

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
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    minWidth: 0,
  },
  headerTitle: {
    maxWidth: "100%",
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F7F7F7",
  },
  headerMeta: {
    flexShrink: 1,
    fontFamily: FontFamily.content,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  spacer: {
    marginVertical: 15,
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
    textAlign: "center",
  },
  managerName: {
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
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
    gap: 12,
  },
  itemLeading: {
    flex: 1,
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
    flex: 1,
    fontFamily: FontFamily.utility,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemLabelDestructive: {
    color: Colors.danger,
  },
  itemTrailing: {
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  itemValue: {
    flexShrink: 1,
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  itemValueDestructive: {
    color: Colors.danger,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    padding: 24,
  },
  editModal: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  modalLabel: {
    fontFamily: FontFamily.content,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: FontFamily.content,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: "#FAFAFA",
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.textPrimary,
  },
  primaryButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textInverse,
  },
  busyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
});

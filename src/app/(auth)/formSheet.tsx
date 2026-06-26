// ============================================
// LOTUS BUSINESS — Écran : Informations Boutique (Bottom Sheet)
// ============================================

import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/useAuthStore'
import { updateBoutique } from '../../lib/db/boutique'
import { initDB } from '../../lib/db/schema'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react-native'
import CustomAlert from '../../components/customs/Alert'
import { useLoadingStore } from '../../store/useLoadingStore'

// ── Icônes images prédéfinies ──────────────────────────────────────────────
const ICONS = {
  store:     require('../../../assets/icons/store.png'),
  user:      require('../../../assets/icons/user.png'),
  gerant:    require('../../../assets/icons/proprietaire.png'),
  map:       require('../../../assets/icons/map.png'),
  mail:      require('../../../assets/icons/mail.png'),
  telephone: require('../../../assets/icons/telephone.png'),
  whatsapp:  require('../../../assets/icons/whatsapp.png'),
  ifu:       require('../../../assets/icons/ifu.png'),
  devises:   require('../../../assets/icons/devises.png'),
  shield:    require('../../../assets/icons/shield.png'),
}

const COUNTRIES = [
  {
    nom: 'Bénin',
    drapeau: '🇧🇯',
  },
  {
    nom: 'Niger',
    drapeau: '🇳🇪',
  },
  {
    nom: 'Togo',
    drapeau: '🇹🇬',
  },
  {
    nom: 'Côte d\'Ivoire',
    drapeau: '🇨🇮',
  },
  {
    nom: 'Burkina Faso',
    drapeau: '🇧🇫',
  },
]
// ── Séparateur de section ─────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <View style={secStyles.wrap}>
      <View style={secStyles.bar} />
      <Text style={secStyles.text}>{label}</Text>
      <View style={secStyles.line} />
    </View>
  )
}
const secStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  bar:  { width: 3, height: 13, borderRadius: 2, backgroundColor: Colors.accent },
  text: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 10.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  line: { flex: 1, height: 1, borderRadius: 1, backgroundColor: Colors.border },
})

// ── Icône de champ ────────────────────────────────────────────────────────
function FieldIcon({ source }: { source: any }) {
  return (
    <View style={iconStyle.wrap}>
      <Image source={source} style={iconStyle.img} />
    </View>
  )
}
const iconStyle = StyleSheet.create({
  wrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  img: { width: 17, height: 17, resizeMode: 'contain' },
})

// ─────────────────────────────────────────────────────────────────────────
type Devise = { code: string; symbole: string; label: string }

const DEVISES: Devise[] = [
  { code: 'XOF', symbole: 'FCFA', label: 'Franc CFA (XOF)' },
  { code: 'NGN', symbole: '₦',    label: 'Naira (NGN)' },
  { code: 'GHS', symbole: '₵',    label: 'Cedi Ghanéen (GHS)' },
]

export default function FormScreen() {
  const router = useRouter()
  const { top } = useSafeAreaInsets()
  const setBoutique = useAuthStore((s) => s.setBoutique)
  const isLoading = useLoadingStore((state) => state.isLoading)
  const showLoading = useLoadingStore((state) => state.showLoading)
  const hideLoading = useLoadingStore((state) => state.hideLoading)

  const [nomBoutique,        setNomBoutique]        = useState('')
  const [specialiteBoutique, setSpecialiteBoutique] = useState('')
  const [proprietaire,       setProprietaire]       = useState('')
  const [gerant,             setGerant]             = useState('')
  const [pays,               setPays]               = useState('')
  const [ville,              setVille]              = useState('')
  const [bp,                 setBp]                 = useState('')
  const [telephone,          setTelephone]          = useState('')
  const [whatsapp,           setWhatsapp]           = useState('')
  const [ifu,                setIfu]                = useState('')
  const [politiqueVentes,    setPolitiqueVentes]    = useState(
    'Les produits vendus ne sont ni échangés ni repris',
  )
  const [deviseSelectionnee, setDeviseSelectionnee] = useState<Devise>(DEVISES[0])
  const [deviseOpen,         setDeviseOpen]         = useState(false)
  const [paysOpen,           setPaysOpen]           = useState(false)
  const [erreurs,            setErreurs]            = useState<Record<string, string>>({})
  const [alertMessage,       setAlertMessage]       = useState('')

  const handleSubmit = async () => {
    const errs: Record<string, string> = {}
    if (!nomBoutique.trim())        errs.nom               = 'Requis'
    if (!specialiteBoutique.trim()) errs.specialite        = 'Requis'
    if (!proprietaire.trim())       errs.proprietaire      = 'Requis'
    if (!gerant.trim())             errs.gerant            = 'Requis'
    if (!pays.trim())               errs.pays              = 'Requis'
    if (!ville.trim())              errs.ville             = 'Requis'
    if (!bp.trim())                 errs.bp                = 'Requis'
    if (!telephone.trim())          errs.telephone         = 'Requis'
    if (!whatsapp.trim())           errs.whatsapp          = 'Requis'
    if (!ifu.trim())                errs.ifu               = 'Requis'
    if (!politiqueVentes.trim())    errs.politiqueVentes   = 'Requis'
    if (Object.keys(errs).length) {
      setErreurs(errs)
      setAlertMessage('Veuillez remplir tous les champs obligatoires avant de continuer.')
      return
    }
    setErreurs({})
    showLoading()

    const boutiqueData = {
      nom:                nomBoutique.trim(),
      specialiteBoutique: specialiteBoutique.trim(),
      proprietaire:       proprietaire.trim(),
      gerant:             gerant.trim(),
      pays:               pays.trim(),
      ville:              ville.trim(),
      bp:                 bp.trim(),
      telephone:          telephone.trim(),
      whatsapp:           whatsapp.trim(),
      ifu:                ifu.trim(),
      politiqueVentes:    politiqueVentes.trim(),
      devise:             deviseSelectionnee.code,
      deviseSymbole:      deviseSelectionnee.symbole,
    }

    setBoutique(boutiqueData as any)

    try {
      await initDB()
      await updateBoutique(boutiqueData as any)
    } catch (e) {
      console.error('Erreur sauvegarde SQLite:', e)
      setAlertMessage('Impossible de sauvegarder la configuration boutique. Réessayez.')
      hideLoading()
      return
    }

    await new Promise((r) => setTimeout(r, 300))
    hideLoading()
    router.replace('/(auth)/ConfigReadyScreen')
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Bouton Fermer */}
      <TouchableOpacity
        style={[styles.closeButton, { top: top + 10 }]}
        onPress={() => router.replace('/(auth)/start-signin')}
        activeOpacity={0.7}
      >
        <X color={Colors.textPrimary} size={20} strokeWidth={2.2} />
      </TouchableOpacity>

        {/* Une barre legère ici */}
        <View style={styles.headerHandle}/>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════
            FORMULAIRE
        ══════════════════════════════════════════ */}
        {/* ── En-tête ────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Votre boutique</Text>
          <Text style={styles.subtitle}>
            Ces informations apparaîtront sur vos factures et rapports.
          </Text>
        </View>
        <View style={styles.drawerCard}>

          {/* ─── Section : Boutique ─────────────── */}
          <SectionHeader label="Informations boutique" />

          {/* Nom boutique */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Nom de la boutique <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, erreurs.nom ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.store} />
              <TextInput
                style={styles.input}
                placeholder="Ex : Boutique Adjoua"
                placeholderTextColor={Colors.textTertiary}
                value={nomBoutique}
                onChangeText={(t) => { setNomBoutique(t); if (erreurs.nom) setErreurs(e => ({ ...e, nom: '' })) }}
                autoFocus
                returnKeyType="next"
              />
            </View>
            {erreurs.nom ? <Text style={styles.erreurText}>{erreurs.nom}</Text> : null}
          </View>

          {/* Spécialité */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Spécialité de la boutique <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, erreurs.specialite ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.store} />
              <TextInput
                style={styles.input}
                placeholder="Ex : Vente de vêtements"
                placeholderTextColor={Colors.textTertiary}
                value={specialiteBoutique}
                onChangeText={(t) => { setSpecialiteBoutique(t); if (erreurs.specialite) setErreurs(e => ({ ...e, specialite: '' })) }}
                returnKeyType="next"
              />
            </View>
            {erreurs.specialite ? <Text style={styles.erreurText}>{erreurs.specialite}</Text> : null}
          </View>

          {/* ─── Section : Responsables ──────────── */}
          <SectionHeader label="Responsables" />

          {/* Propriétaire */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom du propriétaire <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, erreurs.proprietaire ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.user} />
              <TextInput
                style={styles.input}
                placeholder="Ex : Marie Adjoua"
                placeholderTextColor={Colors.textTertiary}
                value={proprietaire}
                onChangeText={(t) => { setProprietaire(t); if (erreurs.proprietaire) setErreurs(e => ({ ...e, proprietaire: '' })) }}
                returnKeyType="next"
              />
            </View>
            {erreurs.proprietaire ? <Text style={styles.erreurText}>{erreurs.proprietaire}</Text> : null}
          </View>

          {/* Gérant */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom du gérant <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, erreurs.gerant ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.gerant} />
              <TextInput
                style={styles.input}
                placeholder="Ex : Jean Koffi"
                placeholderTextColor={Colors.textTertiary}
                value={gerant}
                onChangeText={(t) => { setGerant(t); if (erreurs.gerant) setErreurs(e => ({ ...e, gerant: '' })) }}
                returnKeyType="next"
              />
            </View>
            {erreurs.gerant ? <Text style={styles.erreurText}>{erreurs.gerant}</Text> : null}
          </View>

          {/* ─── Section : Localisation ──────────── */}
          <SectionHeader label="Localisation" />

          {/* Pays */}
          <View style={styles.field}>
            <Text style={styles.label}>Pays <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.deviseSelector, erreurs.pays ? styles.inputContainerError : null]}
              onPress={() => setPaysOpen((o) => !o)}
              activeOpacity={0.7}
            >
              <Text style={styles.paysEmoji}>
                {pays ? (COUNTRIES.find(c => c.nom === pays)?.drapeau ?? '🌍') : '🌍'}
              </Text>
              <Text style={[styles.input, { flex: 1, color: pays ? Colors.textPrimary : Colors.textTertiary }]}>
                {pays || 'Sélectionner un pays'}
              </Text>
              {paysOpen
                ? <ChevronUp  color={Colors.textSecondary} size={18} />
                : <ChevronDown color={Colors.textTertiary}  size={18} />
              }
            </TouchableOpacity>
            {erreurs.pays ? <Text style={styles.erreurText}>{erreurs.pays}</Text> : null}
            {paysOpen && (
              <View style={styles.deviseDropdown}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c.nom}
                    style={[styles.deviseOption, c.nom === pays && styles.deviseOptionActive]}
                    onPress={() => { setPays(c.nom); setPaysOpen(false); if (erreurs.pays) setErreurs(e => ({ ...e, pays: '' })) }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={styles.paysEmoji}>{c.drapeau}</Text>
                      <Text style={[styles.deviseOptionText, c.nom === pays && styles.deviseOptionTextActive]}>
                        {c.nom}
                      </Text>
                    </View>
                    {c.nom === pays && <Check color={Colors.textPrimary} size={16} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Ville */}
          <View style={styles.field}>
            <Text style={styles.label}>Ville <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, erreurs.ville ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.map} />
              <TextInput
                style={styles.input}
                placeholder="Ex : Cotonou"
                placeholderTextColor={Colors.textTertiary}
                value={ville}
                onChangeText={(t) => { setVille(t); if (erreurs.ville) setErreurs(e => ({ ...e, ville: '' })) }}
                returnKeyType="next"
              />
            </View>
            {erreurs.ville ? <Text style={styles.erreurText}>{erreurs.ville}</Text> : null}
          </View>

          {/* Boîte Postale */}
          <View style={styles.field}>
            <Text style={styles.label}>Boîte Postale (BP) <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, erreurs.bp ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.mail} />
              <TextInput
                style={styles.input}
                placeholder="Ex : 01 BP 1234"
                placeholderTextColor={Colors.textTertiary}
                value={bp}
                onChangeText={(t) => { setBp(t); if (erreurs.bp) setErreurs(e => ({ ...e, bp: '' })) }}
                returnKeyType="next"
              />
            </View>
            {erreurs.bp ? <Text style={styles.erreurText}>{erreurs.bp}</Text> : null}
          </View>

          {/* ─── Section : Contact ───────────────── */}
          <SectionHeader label="Contact" />

          {/* Téléphone & WhatsApp */}
          <View style={styles.row}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Téléphone <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputContainer, erreurs.telephone ? styles.inputContainerError : null]}>
                <FieldIcon source={ICONS.telephone} />
                <TextInput
                  style={styles.input}
                  placeholder="+229 01..."
                  placeholderTextColor={Colors.textTertiary}
                  value={telephone}
                  onChangeText={(t) => { setTelephone(t); if (erreurs.telephone) setErreurs(e => ({ ...e, telephone: '' })) }}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              {erreurs.telephone ? <Text style={styles.erreurText}>{erreurs.telephone}</Text> : null}
            </View>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>N° Whatsapp <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputContainer, erreurs.whatsapp ? styles.inputContainerError : null]}>
                <FieldIcon source={ICONS.whatsapp} />
                <TextInput
                  style={styles.input}
                  placeholder="+229 01..."
                  placeholderTextColor={Colors.textTertiary}
                  value={whatsapp}
                  onChangeText={(t) => { setWhatsapp(t); if (erreurs.whatsapp) setErreurs(e => ({ ...e, whatsapp: '' })) }}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              {erreurs.whatsapp ? <Text style={styles.erreurText}>{erreurs.whatsapp}</Text> : null}
            </View>
          </View>

          {/* ─── Section : Légal & Financier ─────── */}
          <SectionHeader label="Légal & Financier" />

          {/* IFU */}
          <View style={styles.field}>
            <Text style={styles.label}>IFU (Numéro Fiscal) <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, erreurs.ifu ? styles.inputContainerError : null]}>
              <FieldIcon source={ICONS.ifu} />
              <TextInput
                style={styles.input}
                placeholder="Ex : 32019..."
                placeholderTextColor={Colors.textTertiary}
                value={ifu}
                onChangeText={(t) => { setIfu(t); if (erreurs.ifu) setErreurs(e => ({ ...e, ifu: '' })) }}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            {erreurs.ifu ? <Text style={styles.erreurText}>{erreurs.ifu}</Text> : null}
          </View>

          {/* Devise */}
          <View style={styles.field}>
            <Text style={styles.label}>Devise</Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.deviseSelector]}
              onPress={() => setDeviseOpen((o) => !o)}
              activeOpacity={0.7}
            >
              <FieldIcon source={ICONS.devises} />
              <Text style={[styles.input, { flex: 1 }]}>
                {deviseSelectionnee.label}
              </Text>
              {deviseOpen
                ? <ChevronUp  color={Colors.textSecondary} size={18} />
                : <ChevronDown color={Colors.textTertiary}  size={18} />
              }
            </TouchableOpacity>

            {deviseOpen && (
              <View style={styles.deviseDropdown}>
                {DEVISES.map((d) => (
                  <TouchableOpacity
                    key={d.code}
                    style={[
                      styles.deviseOption,
                      d.code === deviseSelectionnee.code && styles.deviseOptionActive,
                    ]}
                    onPress={() => { setDeviseSelectionnee(d); setDeviseOpen(false) }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.deviseOptionText,
                      d.code === deviseSelectionnee.code && styles.deviseOptionTextActive,
                    ]}>
                      {d.label}
                    </Text>
                    {d.code === deviseSelectionnee.code && (
                      <Check color={Colors.textPrimary} size={16} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Politique de Ventes */}
          <View style={styles.field}>
            <Text style={styles.label}>Politique de Ventes <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, styles.textAreaContainer, erreurs.politiqueVentes ? styles.inputContainerError : null]}>
              <TextInput
                style={styles.textArea}
                placeholder="Ex : Les produits vendus ne sont ni échangés ni repris"
                placeholderTextColor={Colors.textTertiary}
                value={politiqueVentes}
                onChangeText={(t) => { setPolitiqueVentes(t); if (erreurs.politiqueVentes) setErreurs(e => ({ ...e, politiqueVentes: '' })) }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {erreurs.politiqueVentes ? <Text style={styles.erreurText}>{erreurs.politiqueVentes}</Text> : null}
          </View>

        </View>{/* fin drawerCard */}

        {/* ── Bouton de validation ─────────────────── */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            Confirmer et continuer
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Vous pourrez modifier ces informations plus tard dans les paramètres.
        </Text>
      </ScrollView>
      <CustomAlert
        isVisible={Boolean(alertMessage)}
        onClose={() => setAlertMessage('')}
        title="Configuration incomplète"
        description={alertMessage}
        iconName="AlertTriangle"
        color={Colors.danger}
        primaryButtonLabel="Corriger"
        onPrimaryPress={() => setAlertMessage('')}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Bouton fermer ─────────────────────────────────────────────────────
  closeButton: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // ── Scroll ────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
    paddingTop: 10
  },
  headerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 15,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  // ── Header ────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    gap: 6,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.content,
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Card drawer ───────────────────────────────────────────────────────
  drawerCard: {
    padding: 18,
    gap: 14,
  },

  // ── Champs ────────────────────────────────────────────────────────────
  row:   { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  field: { gap: 6 },

  label: {
    fontFamily: FontFamily.utility,
    fontSize: 12.5,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  required: { color: Colors.danger },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerLight,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },

  input: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14.5,
    color: Colors.textPrimary,
  },
  textArea: {
    flex: 1,
    fontFamily: FontFamily.content,
    fontSize: 14.5,
    color: Colors.textPrimary,
    minHeight: 64,
  },
  erreurText: {
    fontFamily: FontFamily.content,
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },

  // ── Sélecteurs (Devise / Pays) ────────────────────────────────────────
  deviseSelector: {
    justifyContent: 'space-between',
  },
  paysEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  deviseDropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginTop: 4,
  },
  deviseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  deviseOptionActive: {
    backgroundColor: Colors.surface,
  },
  deviseOptionText: {
    fontFamily: FontFamily.content,
    fontSize: 14.5,
    color: Colors.textSecondary,
  },
  deviseOptionTextActive: {
    fontFamily: FontFamily.utilityBold,
    color: Colors.textPrimary,
  },

  // ── Bouton submit ─────────────────────────────────────────────────────
  submitButton: {
    height: 54,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  },
  submitButtonLoading: {
    backgroundColor: Colors.accentHover,
  },
  submitButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 15,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },

  // ── Note bas de page ──────────────────────────────────────────────────
  note: {
    fontFamily: FontFamily.content,
    fontSize: 12.5,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
})

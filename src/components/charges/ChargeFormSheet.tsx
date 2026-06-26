import CustomToast from '@/components/customs/toast';
import PrimaryButton from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { getDateISO } from '@/lib/utils/formatters';
import { useChargeStore } from '@/store/useChargeStore';
import type { CategorieCharge } from '@/types/charge';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategorieChips from './CategorieChips';

const SNAP_POINTS = ['75%', '92%'];
const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export interface ChargeFormSheetRef {
  open: () => void;
  close: () => void;
}

type Props = {
  onSuccess?: () => void;
};

function parseISODate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatLocalDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReadableDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseISODate(iso));
}

function buildCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const totalDays = new Date(year, m + 1, 0).getDate();
  const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, m, d));
  return days;
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase());
}

const ChargeFormSheet = forwardRef<ChargeFormSheetRef, Props>(
  ({ onSuccess }, ref) => {
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const labelRef = useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);
    const addCharge = useChargeStore((s) => s.addCharge);
    const isSaving = useChargeStore((s) => s.isSaving);

    const [label, setLabel] = useState('');
    const [montant, setMontant] = useState('');
    const [categorie, setCategorie] = useState<CategorieCharge | null>(null);
    const [date, setDate] = useState(getDateISO());
    const [note, setNote] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() =>
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    const [errors, setErrors] = useState<{ label?: string; montant?: string }>(
      {}
    );
    const [toast, setToast] = useState({ visible: false, text: '' });

    const isDirty = label.trim().length > 0 || montant.trim().length > 0 || note.trim().length > 0;

    const resetForm = useCallback(() => {
      setLabel('');
      setMontant('');
      setCategorie(null);
      setDate(getDateISO());
      setNote('');
      setShowCalendar(false);
      setCalendarMonth(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      );
      setErrors({});
    }, []);

    const dismissSheet = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    const requestClose = useCallback(() => {
      if (!isDirty) {
        dismissSheet();
        return;
      }

      Alert.alert(
        'Abandonner la saisie ?',
        'Les informations saisies seront perdues.',
        [
          { text: 'Continuer', style: 'cancel' },
          {
            text: 'Abandonner',
            style: 'destructive',
            onPress: dismissSheet,
          },
        ]
      );
    }, [dismissSheet, isDirty]);

    useImperativeHandle(ref, () => ({
      open: () => {
        resetForm();
        sheetRef.current?.present();
      },
      close: dismissSheet,
    }));

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={isDirty ? 'none' : 'close'}
        />
      ),
      [isDirty]
    );

    const calendarDays = useMemo(
      () => buildCalendarDays(calendarMonth),
      [calendarMonth]
    );

    const validate = () => {
      const nextErrors: { label?: string; montant?: string } = {};
      const parsedMontant = Number(montant.replace(/\s/g, '').replace(',', '.'));

      if (!label.trim()) {
        nextErrors.label = 'Indiquez une désignation';
      }

      if (!montant.trim() || Number.isNaN(parsedMontant) || parsedMontant <= 0) {
        nextErrors.montant = 'Indiquez un montant valide';
      }

      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0
        ? { parsedMontant }
        : null;
    };

    const handleSubmit = async () => {
      const result = validate();
      if (!result) return;

      try {
        await addCharge({
          label: label.trim(),
          montant: result.parsedMontant,
          categorie: categorie ?? 'Autre',
          note: note.trim() || undefined,
          date,
        });

        setToast({ visible: true, text: 'Dépense enregistrée' });
        dismissSheet();
        onSuccess?.();
      } catch {
        // Erreur gérée par le store
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={SNAP_POINTS}
          enablePanDownToClose={!isDirty}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handle}
          backgroundStyle={styles.background}
          onDismiss={resetForm}
          onChange={(index) => {
            if (index >= 0) {
              setTimeout(() => labelRef.current?.focus(), 120);
            }
          }}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title} selectable>
                Nouvelle dépense
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label} selectable>
                Désignation *
              </Text>
              <BottomSheetTextInput
                ref={labelRef}
                value={label}
                onChangeText={setLabel}
                placeholder="Loyer du mois de juin..."
                placeholderTextColor={Colors.textTertiary}
                style={[styles.input, errors.label && styles.inputError]}
                returnKeyType="next"
              />
              {errors.label ? (
                <Text style={styles.errorText} selectable>
                  {errors.label}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <View style={styles.amountHeader}>
                <Text style={styles.label} selectable>
                  Montant *
                </Text>
                <Text style={styles.currency} selectable>
                  FCFA
                </Text>
              </View>
              <BottomSheetTextInput
                value={montant}
                onChangeText={setMontant}
                placeholder="45 000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="decimal-pad"
                style={[styles.input, errors.montant && styles.inputError]}
              />
              {errors.montant ? (
                <Text style={styles.errorText} selectable>
                  {errors.montant}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.optionalLabel} selectable>
                Catégorie (optionnel)
              </Text>
              <CategorieChips value={categorie} onChange={setCategorie} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label} selectable>
                Date
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar((current) => !current)}
                activeOpacity={0.82}
              >
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.dateLabel} selectable>
                  {formatReadableDate(date)}
                </Text>
              </TouchableOpacity>

              {showCalendar ? (
                <View style={styles.calendar}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                      style={styles.calendarNav}
                    >
                      <ChevronLeft size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.calendarTitle} selectable>
                      {formatMonthLabel(calendarMonth)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                      style={styles.calendarNav}
                    >
                      <ChevronRight size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weekRow}>
                    {WEEK_DAYS.map((day, index) => (
                      <Text key={`${day}-${index}`} style={styles.weekDay} selectable>
                        {day}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.daysGrid}>
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                      }

                      const iso = formatLocalDateToISO(day);
                      const selected = iso === date;

                      return (
                        <TouchableOpacity
                          key={iso}
                          style={[styles.dayCell, selected && styles.dayCellSelected]}
                          onPress={() => {
                            setDate(iso);
                            setShowCalendar(false);
                          }}
                          activeOpacity={0.82}
                        >
                          <Text
                            style={[
                              styles.dayLabel,
                              selected && styles.dayLabelSelected,
                            ]}
                            selectable
                          >
                            {day.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.optionalLabel} selectable>
                Note (optionnel)
              </Text>
              <BottomSheetTextInput
                value={note}
                onChangeText={setNote}
                placeholder="Commentaire libre..."
                placeholderTextColor={Colors.textTertiary}
                style={[styles.input, styles.noteInput]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <PrimaryButton
              label={isSaving ? 'Enregistrement...' : 'Enregistrer'}
              onPress={() => void handleSubmit()}
              disabled={isSaving}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>

        <CustomToast
          visible={toast.visible}
          text={toast.text}
          onHide={() => setToast({ visible: false, text: '' })}
        />
      </>
    );
  }
);

ChargeFormSheet.displayName = 'ChargeFormSheet';
export default ChargeFormSheet;

const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  background: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  optionalLabel: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currency: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  noteInput: {
    minHeight: 96,
  },
  errorText: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.danger,
  },
  dateButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
  },
  dateLabel: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  calendar: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    backgroundColor: Colors.surface,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  calendarTitle: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    borderRadius: 999,
    backgroundColor: Colors.textPrimary,
  },
  dayLabel: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dayLabelSelected: {
    color: Colors.textInverse,
    fontFamily: FontFamily.utilityBold,
  },
});

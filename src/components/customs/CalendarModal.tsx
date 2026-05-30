import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { FontFamily } from '../../constants/typography';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days: (number | null)[] = [];

    // Ajouter des cases vides pour le début du mois (en commençant par Lundi pour un look FR)
    // getDay() renvoie 0 pour Dimanche, on veut 0 pour Lundi.
    let firstDay = firstDayOfMonth(year, month);
    let offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    const totalDays = daysInMonth(year, month);
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newMonth);
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isFuture = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return dateToCheck > today;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentMonth);
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const selected = isSelected(day);
    const today = isToday(day);
    const future = isFuture(day);

    return (
      <TouchableOpacity
        key={day}
        style={[styles.dayCell, selected && styles.selectedDayCell]}
        onPress={() => {
          if (future) return;
          const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          onDateSelect(newDate);
        }}
        disabled={future}
        activeOpacity={future ? 1 : 0.7}
      >
        <Text style={[
          styles.dayText, 
          selected && styles.selectedDayText,
          today && !selected && styles.todayText,
          future && styles.futureDayText
        ]}>
          {day}
        </Text>
        {today && !selected && <View style={styles.todayIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={SlideInDown.duration(250)}
          style={styles.modalContent}
        >
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.title}>Choisir une date</Text>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                <ChevronLeft size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthName.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                <ChevronRight size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeader}>
              {weekDays.map(d => (
                <Text key={d} style={styles.weekDayLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {generateCalendarDays().map((day, index) => renderDay(day, index))}
            </View>

            <TouchableOpacity 
              style={styles.todayButton}
              onPress={() => {
                const today = new Date();
                onDateSelect(today);
              }}
            >
              <Text style={styles.todayButtonText}>AUJOURD'HUI</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 8,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  weekDayLabel: {
    fontFamily: FontFamily.utility,
    fontSize: 12,
    color: Colors.textTertiary,
    width: 40,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 12,
  },
  selectedDayCell: {
    backgroundColor: '#0A0A0A',
  },
  dayText: {
    fontFamily: FontFamily.content,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  todayText: {
    color: Colors.info,
    fontWeight: '700',
  },
  futureDayText: {
    color: Colors.textTertiary,
    opacity: 0.3,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.info,
    position: 'absolute',
    bottom: 6,
  },
  todayButton: {
    marginTop: 30,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  todayButtonText: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
});

export default CalendarModal;

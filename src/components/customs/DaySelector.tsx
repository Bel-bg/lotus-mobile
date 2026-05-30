import React, { useEffect, useRef, useState } from 'react'
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { Colors } from '../../constants/colors'
import { FontFamily } from '../../constants/typography'
import { LayoutGrid, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native'
import CalendarModal from './CalendarModal'

interface DaySelectorProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface DayItem {
  date: Date
  id: string
  dayName: string
  dayNumber: string
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDate, onDateSelect }) => {
  const flatListRef = useRef<FlatList>(null)
  const [days, setDays] = useState<DayItem[]>([])
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    generateDays()
  }, [])

  const generateDays = () => {
    const today = new Date()
    const result: DayItem[] = []

    // Génère les jours de 30 jours dans le passé jusqu'à aujourd'hui
    for (let i = -30; i <= 0; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)

      const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
        .format(date)
        .replace('.', '')
        .toUpperCase()
        
      const dayNumber = date.getDate().toString()

      result.push({
        date,
        id: date.toISOString(),
        dayName,
        dayNumber,
      })
    }
    // On veut le dernier jour (aujourd'hui) à droite, donc on ne change pas l'ordre
    // Mais on s'assure que le FlatList défile à la fin par défaut
    setDays(result)
  }

  const navigateDate = (offset: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + offset)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (newDate <= today) {
      onDateSelect(newDate)
    }
  }

  const isFutureDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    )
  }

  const renderItem = ({ item }: { item: DayItem }) => {
    const isSelected = isSameDay(item.date, selectedDate)

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: withSpring(isSelected ? 1.05 : 1) },
        ],
        opacity: withTiming(1),
      }
    }, [isSelected])

    const future = isFutureDate(item.date)

    return (
      <TouchableOpacity
        onPress={() => {
          if (future) return
          onDateSelect(item.date)
        }}
        activeOpacity={future ? 1 : 0.7}
        disabled={future}
      >
        <Animated.View
          style={[
            styles.dayCard,
            isSelected && styles.dayCardSelected,
            animatedStyle,
          ]}
        >
          <Text
            style={[
              styles.dayName,
              isSelected && styles.dayNameSelected,
            ]}
          >
            {item.dayName}
          </Text>
          <Text
            style={[
              styles.dayNumber,
              isSelected && styles.dayNumberSelected,
            ]}
          >
            {item.dayNumber}
          </Text>
          {future && <View style={styles.disabledOverlay} />}
          {isSelected && (
            <View 
              style={styles.indicator} 
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Quick Navigation Header */}
      <View style={styles.headerRow}>
        <View style={styles.quickNavContainer}>
          <TouchableOpacity 
            onPress={() => navigateDate(-1)} 
            style={styles.navArrow}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={styles.calendarTrigger}
            activeOpacity={0.7}
          >
            <View style={styles.dateDisplay}>
              <Text style={styles.selectedDayNumber}>{selectedDate.getDate()}</Text>
              <Text style={styles.selectedMonthName}>
                {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(selectedDate).replace('.', '').toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigateDate(1)} 
            disabled={isFutureDate(new Date(selectedDate.getTime() + 86400000))}
            style={[
              styles.navArrow,
              isFutureDate(new Date(selectedDate.getTime() + 86400000)) && { opacity: 0.1 }
            ]}
            activeOpacity={0.7}
          >
            <ChevronRight size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Secondary Horizontal List */}
      <FlatList
        ref={flatListRef}
        data={days}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialScrollIndex={30}
        getItemLayout={(data, index) => ({
          length: 72,
          offset: 72 * index,
          index,
        })}
      />

      <CalendarModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          onDateSelect(date);
          setModalVisible(false);
        }}
      />
    </View>
  )
}

export default DaySelector

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  quickNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 6,
    width: '100%',
    height: 72,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  navArrow: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  calendarTrigger: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    // Ombre premium pour le bouton central
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  dateDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  selectedDayNumber: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  selectedMonthName: {
    fontFamily: FontFamily.utilityBold,
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  dayCard: {
    width: 60,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCardSelected: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dayName: {
    fontFamily: FontFamily.utility,
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: 'rgba(255,255,255,0.6)',
  },
  dayNumber: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 8,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
  }
})
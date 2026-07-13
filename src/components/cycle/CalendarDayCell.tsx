import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, typography, useTheme } from '@/theme';

export interface CalendarDayState {
  isPeriodLogged: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isPms: boolean;
  isOvulation: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasLog: boolean;
  isHighEnergy: boolean;
  inMonth: boolean;
}

interface Props {
  date: string;
  state: CalendarDayState;
  onPress: (date: string) => void;
}

export function CalendarDayCell({ date, state, onPress }: Props) {
  const p = useTheme();
  const bg = state.isPeriodLogged
    ? p.accent
    : state.isFertile || state.isOvulation
      ? p.phaseSoft.follicular
      : state.isPms
        ? p.phaseSoft.ovulation
        : state.isPredictedPeriod
          ? p.name === 'dark'
            ? 'rgba(225,173,102,0.28)'
            : p.accent200
          : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={date}
      onPress={() => onPress(date)}
      style={styles.wrap}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: bg },
          state.isToday && { borderWidth: 1.5, borderColor: p.text },
          state.isSelected && { borderWidth: 1.5, borderColor: p.accent },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            { color: p.text },
            !state.inMonth && { color: p.textFaint },
            state.isPeriodLogged && [styles.onPrimary, { color: p.onPrimaryBtn }],
            state.isToday && styles.todayText,
          ]}
        >
          {format(parseISO(date), 'd')}
        </Text>
        {state.isOvulation && (
          <View style={[styles.ovulationDot, { backgroundColor: p.success }]} />
        )}
        {state.isHighEnergy && !state.isPeriodLogged && (
          <Text style={styles.energy}>⚡</Text>
        )}
      </View>
      <View
        style={[
          styles.logDot,
          { backgroundColor: state.hasLog ? p.accent600 : 'transparent' },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    ...typography.bodySmall,
  },
  onPrimary: {
    fontWeight: '700',
  },
  todayText: {
    fontWeight: '700',
  },
  ovulationDot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: radius.pill,
  },
  energy: {
    position: 'absolute',
    top: -2,
    right: -2,
    fontSize: 9,
  },
  logDot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    marginTop: 2,
  },
});

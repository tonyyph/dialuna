import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/theme';

export interface CalendarDayState {
  isPeriodLogged: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isPms: boolean;
  isOvulation: boolean;
  isToday: boolean;
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
  const bg = state.isPeriodLogged
    ? colors.primary
    : state.isFertile || state.isOvulation
      ? colors.phaseSoft.follicular
      : state.isPms
        ? colors.phaseSoft.ovulation
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
          state.isPredictedPeriod && styles.predicted,
          state.isToday && styles.today,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            !state.inMonth && styles.muted,
            state.isPeriodLogged && styles.onPrimary,
          ]}
        >
          {format(parseISO(date), 'd')}
        </Text>
        {state.isOvulation && <View style={styles.ovulationDot} />}
        {state.isHighEnergy && !state.isPeriodLogged && (
          <Text style={styles.energy}>⚡</Text>
        )}
      </View>
      <View style={[styles.logDot, state.hasLog && styles.logDotVisible]} />
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
  predicted: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.deepPlum,
  },
  dayText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  muted: {
    color: colors.border,
  },
  onPrimary: {
    color: colors.card,
    fontWeight: '700',
  },
  ovulationDot: {
    position: 'absolute',
    bottom: 3,
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.mint,
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
    backgroundColor: 'transparent',
  },
  logDotVisible: {
    backgroundColor: colors.lavender,
  },
});

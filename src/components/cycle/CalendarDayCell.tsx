import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius } from '@/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { colors, typography } = useTheme();
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
          state.isPredictedPeriod && [styles.predicted, { borderColor: colors.primary }],
          state.isToday && [styles.today, { borderColor: colors.royalViolet }],
        ]}
      >
        <Text
          style={[
            typography.body,
            { color: colors.textPrimary },
            !state.inMonth && { color: colors.border },
            state.isPeriodLogged && [styles.onPrimary, { color: colors.card }],
          ]}
        >
          {format(parseISO(date), 'd')}
        </Text>
        {state.isOvulation && (
          <View style={[styles.ovulationDot, { backgroundColor: colors.mint }]} />
        )}
        {state.isHighEnergy && !state.isPeriodLogged && (
          <Text style={styles.energy}>⚡</Text>
        )}
      </View>
      <View
        style={[styles.logDot, state.hasLog && { backgroundColor: colors.lavender }]}
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
  predicted: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  today: {
    borderWidth: 2,
  },
  onPrimary: {
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
    backgroundColor: 'transparent',
  },
});

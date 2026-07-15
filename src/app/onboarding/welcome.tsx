import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { spacing, typography, useTheme } from "@/theme";

export default function Welcome() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <LinearGradient colors={p.bgGradient} style={styles.fill}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.field}>
            <View style={[styles.orbitOuter, { borderColor: p.track }]} />
            <View style={[styles.orbitInner, { borderColor: p.accent }]} />
            <View style={[styles.fieldCore, { backgroundColor: p.accent }]} />
          </View>
          <Text style={[styles.wordmark, { color: p.text }]}>
            {t("onboarding.welcome.title")}
          </Text>
          <Text style={[styles.subtitle, { color: p.textMuted }]}>
            {t("onboarding.welcome.subtitle")}
          </Text>
        </View>
        <Button
          label={t("onboarding.welcome.cta")}
          onPress={() => router.push("/onboarding/disclaimer")}
          style={styles.cta}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing(4), paddingBottom: spacing(3) },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  field: { width: 260, height: 200, alignItems: "center", justifyContent: "center", marginBottom: spacing(3) },
  orbitOuter: { position: "absolute", width: 250, height: 130, borderRadius: 130, borderWidth: 1, transform: [{ rotate: "-14deg" }] },
  orbitInner: { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderRightColor: "transparent" },
  fieldCore: { width: 58, height: 58, borderRadius: 29, opacity: 0.24 },
  wordmark: { ...typography.display, marginBottom: spacing(1.25) },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 260
  },
  cta: { alignSelf: "center", width: "100%", maxWidth: 220 }
});

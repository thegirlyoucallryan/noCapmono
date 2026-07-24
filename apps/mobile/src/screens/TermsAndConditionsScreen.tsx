import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import {
  LEGAL_CONTACT_EMAIL,
  TERMS_INTRO,
  TERMS_META,
  TERMS_SECTIONS,
} from "../constants/TermsOfService";
import { TERMS_VERSION } from "../constants/Legal";

export type LegalStackParamList = {
  Welcome?: undefined;
  AcceptLegalHome?: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};

type Props = StackScreenProps<LegalStackParamList, "TermsAndConditions">;

export function TermsAndConditionsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const openEmail = async () => {
    const url = `mailto:${LEGAL_CONTACT_EMAIL}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Email", LEGAL_CONTACT_EMAIL);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.docTitle}>{TERMS_META.title}</Text>
        <Text style={styles.meta}>
          Effective: {TERMS_META.effectiveDate}
          {"\n"}
          Last updated: {TERMS_META.lastUpdated}
          {"\n"}
          Version: {TERMS_VERSION}
        </Text>

        <Text style={styles.body}>{TERMS_INTRO}</Text>

        {TERMS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}

        <Pressable onPress={openEmail} style={styles.emailBtn}>
          <Ionicons name="mail-outline" size={18} color={Colors.twentyThree} />
          <Text style={styles.emailBtnText}>{LEGAL_CONTACT_EMAIL}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.highlight,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: "#fff",
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  docTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 28,
    color: Colors.accent,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  body: {
    color: Colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  emailBtn: {
    marginTop: 32,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emailBtnText: {
    color: Colors.twentyThree,
    fontWeight: "700",
    fontSize: 14,
  },
});

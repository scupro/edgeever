import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, RefreshCw } from "./icons";
import { Pressable, Text } from "./LocalizedText";
import { useMobileLocale } from "../lib/mobile-locale";
import { useMobileUpdate } from "../lib/mobile-update";
import { useMobileTheme, resolveMobileThemeStyles } from "../lib/mobile-theme";

export const MobileUpdateCard = () => {
  const { resolvedLocale } = useMobileLocale();
  const { resolvedTheme } = useMobileTheme();
  const { checkForUpdate, hasUpdate, isSupported, openUpdate, status, updateKind } = useMobileUpdate();
  const english = resolvedLocale !== "zh-TW";
  const busy = status === "checking" || status === "downloading";
  const styles = resolveMobileThemeStyles(baseStyles, resolvedTheme);
  const checkLabel = status === "checking"
    ? (english ? "Checking…" : "正在檢查…")
    : (english ? "Check for updates" : "檢查更新");
  const openLabel = status === "downloading"
    ? (english ? "Downloading update…" : "正在下載更新…")
    : status === "ready"
      ? (english ? "Restart to apply" : "重啟以應用")
      : updateKind === "ota"
        ? (english ? "Download update" : "下載更新")
        : updateKind === "play"
          ? (english ? "Update with Google Play" : "透過 Google Play 更新")
        : (english ? "Choose update source" : "選擇更新渠道");

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{english ? "App updates" : "應用更新"}</Text>
        <Text style={styles.description}>
          {english
            ? "EdgeEver automatically checks for compatible in-app updates and newer app versions."
            : "EdgeEver 會自動檢查相容的應用內熱更新和新版應用。"}
        </Text>
        <Text style={styles.version}>
          {english ? "Current version" : "當前版本"}: v{Updates.runtimeVersion ?? Constants.expoConfig?.version ?? "unknown"}
        </Text>
      </View>
      {hasUpdate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: busy }}
          disabled={busy}
          onPress={() => void openUpdate()}
          style={[styles.button, busy && styles.buttonDisabled]}
        >
          {status === "downloading" ? <ActivityIndicator color="#047857" size="small" /> : <RefreshCw color="#047857" size={16} />}
          <Text style={styles.buttonText}>{openLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: busy }}
        disabled={busy}
        onPress={() => void checkForUpdate()}
        style={[styles.button, busy && styles.buttonDisabled]}
      >
        {status === "checking" ? <ActivityIndicator color="#047857" size="small" /> : <RefreshCw color="#047857" size={16} />}
        <Text style={styles.buttonText}>{checkLabel}</Text>
      </Pressable>
      {!isSupported ? (
        <Text style={styles.hint}>
          {english ? "Available in installed release builds." : "此功能會在已安裝的正式版中啟用。"}
        </Text>
      ) : null}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  card: {
    borderTopColor: "#f1f5f9",
    borderTopWidth: 1,
    gap: 12,
    padding: 16,
  },
  copy: {
    gap: 4,
  },
  title: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
  },
  version: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "700",
  },
  hint: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
  },
});

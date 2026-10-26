import { ApiRequestError } from "@edgeever/client";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "../components/icons";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { Pressable, Text, TextInput } from "../components/LocalizedText";
import { resolveMobileThemeStyles, useMobileTheme, type MobileResolvedTheme } from "../lib/mobile-theme";
import { useSession } from "../lib/session";

export const AccountSecurityPanel = ({
  active,
}: {
  active: boolean;
}) => {
  const { resolvedTheme } = useMobileTheme();
  refreshAccountSecurityThemeStyles(resolvedTheme);
  const { client } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (!client) throw new Error("Client is not ready");
      if (newPassword.length < 8) throw new Error("新密碼至少需要 8 個字元。");
      if (newPassword !== confirmPassword) throw new Error("兩次輸入的新密碼不一致。");
      return client.changePassword({ currentPassword, newPassword, confirmPassword });
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  useEffect(() => {
    if (!active) {
      passwordMutation.reset();
    }
  }, [active]);

  const errorMessage = (error: unknown) => {
    if (error instanceof ApiRequestError && error.code === "invalid_current_password") return "當前密碼不正確。";
    return error instanceof Error ? error.message : "操作失敗，請稍後再試";
  };

  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <KeyRound color="#15803d" size={22} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>修改密碼</Text>
          <Text style={styles.help}>修改後會保留當前裝置登入，並退出其他裝置上的登入會話。</Text>
        </View>
      </View>
      <Field label="當前密碼" onChangeText={setCurrentPassword} value={currentPassword} />
      <Field label="新密碼" onChangeText={setNewPassword} value={newPassword} />
      <Field label="確認新密碼" onChangeText={setConfirmPassword} value={confirmPassword} />
      {passwordMutation.error ? <Text style={styles.error}>{errorMessage(passwordMutation.error)}</Text> : null}
      {passwordMutation.isSuccess ? <Text accessibilityLiveRegion="polite" style={styles.success}>密碼已修改成功。</Text> : null}
      <PrimaryButton
        disabled={passwordMutation.isPending}
        label={passwordMutation.isPending ? "修改中..." : "修改密碼"}
        onPress={() => passwordMutation.mutate()}
      />
    </View>
  );
};

const Field = ({ help, label, onChangeText, placeholder, secure = true, value }: {
  help?: string;
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  value: string;
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      secureTextEntry={secure}
      style={styles.input}
      value={value}
    />
    {help ? <Text style={styles.help}>{help}</Text> : null}
  </View>
);

const PrimaryButton = ({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) => (
  <Pressable disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled && styles.disabled]}>
    <Text style={styles.primaryButtonText}>{label}</Text>
  </Pressable>
);

const baseAccountSecurityStyles = StyleSheet.create({
  content: { gap: 14, padding: 16, paddingBottom: 40 },
  hero: { alignItems: "flex-start", backgroundColor: "transparent", flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  cardTitle: { color: "#17211a", fontSize: 16, fontWeight: "800" },
  help: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 3 },
  field: { gap: 7 },
  label: { color: "#334155", fontSize: 13, fontWeight: "700" },
  input: { backgroundColor: "#ffffff", borderColor: "#cad8cc", borderRadius: 10, borderWidth: 1, color: "#17211a", minHeight: 48, paddingHorizontal: 13 },
  primaryButton: { alignItems: "center", backgroundColor: "#15803d", borderRadius: 10, minHeight: 48, justifyContent: "center", paddingHorizontal: 16 },
  primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.45 },
  error: { color: "#be123c", fontSize: 13, lineHeight: 19 },
  success: { color: "#15803d", fontSize: 13, fontWeight: "700", lineHeight: 19 },
});

let styles = baseAccountSecurityStyles;
let accountSecurityStylesTheme: MobileResolvedTheme = "light";

const refreshAccountSecurityThemeStyles = (theme: MobileResolvedTheme) => {
  if (accountSecurityStylesTheme !== theme) {
    styles = resolveMobileThemeStyles(baseAccountSecurityStyles, theme);
    accountSecurityStylesTheme = theme;
  }
};

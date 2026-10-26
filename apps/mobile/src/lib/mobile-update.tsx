import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Constants from "expo-constants";
import { AppState, Linking, Platform, type AppStateStatus } from "react-native";
import * as Updates from "expo-updates";
import { Alert } from "../components/LocalizedText";
import { googlePlayUpdates, openGooglePlayDetails } from "../../modules/edgeever-app-store";
import { MobilePlayUpdate } from "./mobile-play-update";
import { useMobileLocale } from "./mobile-locale";
import {
  ANDROID_INSTALL_UPDATE_SOURCES,
  findNewerMobileRelease,
  type MobileInstallUpdateSource,
  type MobileRelease,
} from "./mobile-release";
import { openMobileInstallUpdateSource } from "./mobile-update-destination";

const FOREGROUND_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

type MobileUpdateStatus = "idle" | "checking" | "available" | "downloading" | "ready";
export type MobileUpdateKind = "install" | "ota" | "play";

type MobileUpdateContextValue = {
  checkForUpdate: () => Promise<void>;
  hasUpdate: boolean;
  installedVersion: string | null;
  isSupported: boolean;
  openUpdate: () => Promise<void>;
  status: MobileUpdateStatus;
  updateKind: MobileUpdateKind | null;
};

const MobileUpdateContext = createContext<MobileUpdateContextValue>({
  checkForUpdate: async () => undefined,
  hasUpdate: false,
  installedVersion: null,
  isSupported: false,
  openUpdate: async () => undefined,
  status: "idle",
  updateKind: null,
});
const MobileUpdateAvailableContext = createContext(false);

export const MobileUpdateProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedLocale } = useMobileLocale();
  const [installRelease, setInstallRelease] = useState<MobileRelease | null>(null);
  const [status, setStatus] = useState<MobileUpdateStatus>("idle");
  const [updateKind, setUpdateKind] = useState<MobileUpdateKind | null>(null);
  const activeCheckRef = useRef<Promise<void> | null>(null);
  const lastAutomaticCheckRef = useRef(0);
  const playActiveRef = useRef(false);
  const playUpdate = useMemo(() => new MobilePlayUpdate(googlePlayUpdates, (state) => {
    if (state.status === "unavailable") {
      if (playActiveRef.current) {
        playActiveRef.current = false;
        setUpdateKind("install");
        setStatus("available");
      }
      return;
    }
    playActiveRef.current = true;
    setUpdateKind("play");
    setStatus(state.status);
  }), []);
  const isSupported = !__DEV__ && (Platform.OS === "android" || Updates.isEnabled);
  const english = resolvedLocale !== "zh-TW";
  const installedVersion = Updates.runtimeVersion ?? Constants.expoConfig?.version ?? null;

  const showLinkError = useCallback(() => {
    Alert.alert(
      english ? "Could not open link" : "無法開啟連結",
      english ? "Check your browser settings and try again." : "請檢查瀏覽器設定後重試。"
    );
  }, [english]);

  const openManualUpdateSource = useCallback((source: MobileInstallUpdateSource) => {
    void openMobileInstallUpdateSource(source, {
      linking: Linking,
      openGooglePlayDetails,
    }).then((result) => {
      if (result.status !== "google-play-unavailable") {
        return;
      }
      if (result.reason === "not-installed") {
        Alert.alert(
          english ? "Google Play is not installed" : "未安裝 Google Play",
          english
            ? "Google Play Store is not installed on this device, so this update channel is unavailable."
            : "這臺裝置未安裝 Google Play 商店，無法透過該渠道更新。"
        );
        return;
      }
      const { fallbackUrl, reason } = result;
      const copy = reason === "disabled"
        ? {
          message: english
            ? "Google Play Store is disabled. Enable it in system settings, or open the web listing instead."
            : "Google Play 商店已被停用，請先在系統設定中啟用，或改用網頁版。",
          title: english ? "Google Play is disabled" : "Google Play 已停用",
        }
        : {
          message: english
            ? "Google Play Store could not handle this update link. Try again later, or open the web listing instead."
            : "Google Play 商店無法處理這個更新連結，請稍後重試，或改用網頁版。",
          title: english ? "Could not open Google Play" : "無法開啟 Google Play",
        };
      Alert.alert(copy.title, copy.message, [
        {
          text: english ? "Cancel" : "取消",
          style: "cancel",
        },
        {
          text: english ? "Open web listing" : "開啟網頁版",
          onPress: () => {
            void Linking.openURL(fallbackUrl).catch(showLinkError);
          },
        },
      ]);
    }).catch(() => {
      showLinkError();
    });
  }, [english, showLinkError]);

  const openInstallUpdateOptions = useCallback((release: MobileRelease | null) => {
    const googlePlay = ANDROID_INSTALL_UPDATE_SOURCES.find((source) => source.id === "google-play");
    const github = ANDROID_INSTALL_UPDATE_SOURCES.find((source) => source.id === "github");
    if (!googlePlay || !github) {
      return;
    }
    Alert.alert(
      english ? "Update available" : "發現新版本",
      !release
        ? (english ? "Choose where to check for an app update." : "請選擇檢查應用更新的渠道。")
        : (english
          ? `EdgeEver ${release.version} is available. Choose where to update.`
          : `EdgeEver ${release.version} 已釋出，請選擇更新渠道。`),
      [
        {
          text: english ? "Later" : "稍後",
          style: "cancel",
        },
        {
          icon: "github",
          text: english ? github.labelEn : github.labelZh,
          onPress: () => openManualUpdateSource(github),
        },
        {
          icon: "google-play",
          text: english ? googlePlay.labelEn : googlePlay.labelZh,
          onPress: () => openManualUpdateSource(googlePlay),
        },
      ]
    );
  }, [english, openManualUpdateSource]);

  const runCheck = useCallback((userInitiated: boolean) => {
    if (activeCheckRef.current) {
      return activeCheckRef.current;
    }

    if (!isSupported) {
      if (userInitiated) {
        Alert.alert(
          english ? "Updates unavailable" : "暫無法檢查更新",
          english
            ? "Update checks are available in installed release builds, not Expo Go or development builds."
            : "檢查更新僅適用於已安裝的正式版，Expo Go 和開發版暫不支援。"
        );
      }
      return Promise.resolve();
    }

    const check = (async () => {
      try {
        setStatus("checking");
        if (Platform.OS === "android" && await playUpdate.check(!userInitiated)) {
          return;
        }

        if (Platform.OS === "android") {
          try {
            if (!installedVersion) {
              throw new Error("Installed app version is unavailable");
            }
            const release = await findNewerMobileRelease(installedVersion);
            if (release) {
              setInstallRelease(release);
              setUpdateKind("install");
              setStatus("available");
              return;
            }
          } catch {
            // Fall back to Expo's in-app update check when the release API is unavailable.
          }
          // Play can publish before GitHub. A failed native flow must still leave
          // manual destinations available even when the release API has no update.
          if (playUpdate.hasKnownUpdate) {
            setInstallRelease(null);
            setUpdateKind("install");
            setStatus("available");
            return;
          }
        }

        const result = Updates.isEnabled ? await Updates.checkForUpdateAsync() : { isAvailable: false };

        if (!result.isAvailable) {
          setInstallRelease(null);
          setUpdateKind(null);
          setStatus("idle");
          return;
        }

        setUpdateKind("ota");
        setStatus("available");
      } catch {
        setInstallRelease(null);
        setUpdateKind(null);
        setStatus("idle");
      }
    })();

    activeCheckRef.current = check;
    void check.finally(() => {
      activeCheckRef.current = null;
    });
    return check;
  }, [english, installedVersion, isSupported, playUpdate]);

  const completePlayUpdate = useCallback(async () => {
    if (await googlePlayUpdates.complete()) return;
    Alert.alert(
      english ? "Could not install update" : "無法安裝更新",
      english ? "Try again, or use an existing update channel." : "請重試，或使用現有更新渠道。",
      [
        { text: english ? "Later" : "稍後", style: "cancel" },
        { text: english ? "Choose update source" : "選擇更新渠道", onPress: () => openInstallUpdateOptions(installRelease) },
      ]
    );
  }, [english, installRelease, openInstallUpdateOptions]);

  useEffect(() => {
    if (Platform.OS !== "android" || !isSupported) return;
    const subscription = googlePlayUpdates.subscribe(playUpdate.receive);
    return () => subscription.remove();
  }, [isSupported, playUpdate]);

  const readyPromptVersionRef = useRef<number | null>(null);
  useEffect(() => {
    if (updateKind !== "play" || status !== "ready" || readyPromptVersionRef.current === playUpdate.state.versionCode) return;
    readyPromptVersionRef.current = playUpdate.state.versionCode;
    Alert.alert(
      english ? "Update ready" : "更新已就緒",
      english ? "Restart now to install the Google Play update, or continue using the app." : "重啟即可安裝 Google Play 更新，也可以稍後繼續使用。",
      [
        { text: english ? "Later" : "稍後", style: "cancel" },
        { text: english ? "Restart" : "立即重啟", onPress: () => { void completePlayUpdate(); } },
      ]
    );
  }, [completePlayUpdate, english, playUpdate, status, updateKind]);

  useEffect(() => {
    const attemptAutomaticCheck = () => {
      if (Date.now() - lastAutomaticCheckRef.current < FOREGROUND_CHECK_INTERVAL_MS) {
        return;
      }
      lastAutomaticCheckRef.current = Date.now();
      void runCheck(false);
    };
    const timer = setTimeout(attemptAutomaticCheck, 1_500);
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        if (Platform.OS === "android" && isSupported) {
          // Recover downloads even during the normal six-hour check cooldown.
          void playUpdate.check(false).then((handled) => {
            if (!handled || playUpdate.state.status === "available") attemptAutomaticCheck();
          });
        } else {
          attemptAutomaticCheck();
        }
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [isSupported, playUpdate, runCheck]);

  const openUpdate = useCallback(async () => {
    if (updateKind === "play") {
      if (status === "ready") {
        await completePlayUpdate();
      } else if (status !== "downloading") {
        const result = await playUpdate.start();
        if (result === "unavailable") openInstallUpdateOptions(installRelease);
      }
      return;
    }
    if (updateKind === "install") {
      if (Platform.OS !== "android") {
        return;
      }
      openInstallUpdateOptions(installRelease);
      return;
    }

    if (updateKind !== "ota" || !isSupported) {
      return;
    }

    try {
      if (status === "ready") {
        await Updates.reloadAsync();
        return;
      }

      setStatus("downloading");
      const result = await Updates.fetchUpdateAsync();
      if (!result.isNew) {
        setUpdateKind(null);
        setStatus("idle");
        if (english) {
          Alert.alert("No update", "No downloadable in-app update was found.");
        } else {
          Alert.alert("暫無更新", "沒有可下載的應用內更新。");
        }
        return;
      }

      setStatus("ready");
      Alert.alert(
        english ? "Update ready" : "更新已就緒",
        english ? "Restart now to apply the update." : "重啟後即可應用更新。",
        [
          {
            text: english ? "Later" : "稍後",
            style: "cancel",
          },
          {
            text: english ? "Restart" : "立即重啟",
            onPress: () => {
              void Updates.reloadAsync();
            },
          },
        ]
      );
    } catch {
      setStatus("available");
      Alert.alert(
        english ? "Update failed" : "更新失敗",
        english
          ? "Could not download the in-app update. Try again later."
          : "無法下載應用內更新，請稍後再試。"
      );
    }
  }, [completePlayUpdate, english, installRelease, isSupported, openInstallUpdateOptions, playUpdate, status, updateKind]);

  const hasUpdate = status === "available" || status === "ready" || status === "downloading";
  const value = useMemo<MobileUpdateContextValue>(
    () => ({
      checkForUpdate: () => {
        return runCheck(true);
      },
      hasUpdate,
      installedVersion,
      isSupported,
      openUpdate,
      status,
      updateKind,
    }),
    [hasUpdate, installedVersion, isSupported, openUpdate, runCheck, status, updateKind]
  );

  return (
    <MobileUpdateAvailableContext.Provider value={hasUpdate}>
      <MobileUpdateContext.Provider value={value}>{children}</MobileUpdateContext.Provider>
    </MobileUpdateAvailableContext.Provider>
  );
};

export const useMobileUpdate = () => useContext(MobileUpdateContext);
export const useMobileUpdateAvailable = () => useContext(MobileUpdateAvailableContext);

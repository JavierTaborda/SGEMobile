import BarcodeScanner from "@/components/camera/BarcodeScanner";
import CustomTextInput from "@/components/inputs/CustomTextInput";
import BottomModal from "@/components/ui/BottomModal";
import CustomImage from "@/components/ui/CustomImagen";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { imageURL } from "@/utils/imageURL";
import { safeHaptic } from "@/utils/safeHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import ClientModal from "../../../components/inputs/ClientModal";
import ArtsModal from "../components/ArtsModal";
import MotiveModal from "../components/MotiveModal";
import SerialInput from "../components/SerialInput";
import { useReturnReport } from "../hooks/useReturnReport";

// Constants for better maintainability
const ANIMATION_CONFIG = {
  duration: 350,
  easing: Easing.out(Easing.exp),
} as const;

export default function ProductDefectScreen() {
  const { isDark } = useThemeStore();
  const { width } = useWindowDimensions();

  // Custom hook state
  const {
    registerDefect,
    loading,
    loadingData,
    pickImage,
    handlePickFromCamera,
    barcode,
    setBarcode,
    serial,
    setSerial,
    codeArt,
    artDes,
    reason,
    setReason,
    comment,
    setComment,
    image,
    showScanner,
    setShowScanner,
    clients,
    selectedClient,
    setSelectedClient,
    showClientModal,
    setShowClientModal,
    showMotiveModal,
    setShowMotiveModal,
    codeVen,
    venDes,
    setCodeArt,
    setArtDes,
    setCodeVen,
    setVenDes,
    factNumber,
    setFactNumber,
    handleSearchFactNum,
    handleSearchSerial,
    clearForm,
    isData,
    artList,
    isManual,
    isFormComplete,
    handleManual,
    showArtModal,
    setShowArtModal,
    motives,
  } = useReturnReport();

  const [startMethod, setStartMethod] = useState<"serial" | "fact">("serial");
  const isFormValid = useMemo(() => isFormComplete(), [isFormComplete]);

  // Memoized values
  const isDarkPrimary = useMemo(
    () => (isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT),
    [isDark]
  );

  // Animation values
  const toggleX = useSharedValue(startMethod === "serial" ? 0 : 1);
  const sectionProgress = useSharedValue(isData ? 1 : 0);
  const sectionProgressSearch = useSharedValue(isData ? 0 : 1);
  const toggleOpacity = useSharedValue(!isData ? 1 : 0);
  const toggleTranslateY = useSharedValue(!isData ? 0 : 20);
  const scale = useSharedValue(2);
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.9);
  const saveScale = useSharedValue(1);
  const btnScale = useSharedValue(1);

  // Toggle animation
  useEffect(() => {
    toggleX.value = withTiming(
      startMethod === "serial" ? 0 : 1,
      ANIMATION_CONFIG
    );
  }, [startMethod, toggleX]);

  // Section animations
  useEffect(() => {
    if (isData) {
      sectionProgress.value = withTiming(1, ANIMATION_CONFIG);
      sectionProgressSearch.value = withTiming(1, ANIMATION_CONFIG);
    } else {
      sectionProgress.value = withDelay(150, withTiming(0, { duration: 300 }));
      sectionProgressSearch.value = withTiming(1, ANIMATION_CONFIG);
    }
  }, [isData]);

  // Toggle fade animation
  useEffect(() => {
    if (!isData) {
      toggleOpacity.value = withTiming(1, ANIMATION_CONFIG);
      toggleTranslateY.value = withTiming(0, ANIMATION_CONFIG);
    } else {
      toggleOpacity.value = withDelay(200, withTiming(0, { duration: 250 }));
      toggleTranslateY.value = withTiming(20, { duration: 250 });
    }
  }, [isData, toggleOpacity, toggleTranslateY]);

  // Manual button animation
  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
  }, [isManual]);

  // Image animation
  useEffect(() => {
    if (image) {
      imageOpacity.value = withTiming(1, { duration: 350 });
      imageScale.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.exp),
      });
    } else {
      imageOpacity.value = withTiming(0, { duration: 200 });
      imageScale.value = withTiming(0.9, { duration: 200 });
    }
  }, [image]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: toggleX.value * ((width - 42) / 2) }],
  }));

  const sectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sectionProgress.value,
    transform: [
      { translateY: interpolate(sectionProgress.value, [0, 1], [20, 0]) },
    ],
  }));

  const sectionAnimatedStyleSearch = useAnimatedStyle(() => ({
    opacity: sectionProgressSearch.value,
    transform: [
      {
        translateY: interpolate(sectionProgress.value, [0, 1], [5, 0]),
      },
    ],
  }));

  const animatedStyleToggle = useAnimatedStyle(() => ({
    opacity: toggleOpacity.value,
    transform: [{ translateY: toggleTranslateY.value }],
  }));

  const animatedStyleAddManual = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // Handlers
  const handleSearchPress = useCallback(() => {
    safeHaptic("medium");
    handleSearchSerial();
  }, [handleSearchSerial]);

  const handleSavePress = useCallback(async () => {
    safeHaptic("success");
    await registerDefect();
  }, [registerDefect]);

  const handleManualPress = useCallback(() => {
    safeHaptic("success");
    handleManual();
  }, [handleManual]);

  const handleClearPress = useCallback(() => {
    safeHaptic("warning");
    clearForm();
  }, [clearForm]);

  const handleArtSelectPress = useCallback(() => {
    setShowArtModal(true);
  }, []);

  const handleClientSelectPress = useCallback(() => {
    setShowClientModal(true);
  }, []);
  const handleMotiveSelectPress = useCallback(() => {
    setShowMotiveModal(true);
  }, []);

  // Render helpers
  const renderHeader = () => (
    <View>
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground">
          Registrar devolución
        </Text>
      </View>
    </View>
  );

  const renderToggleSelector = () =>
    !isData &&
    !isManual && (
      <>
        {/* <ToggleSelector
          startMethod={startMethod}
          setStartMethod={setStartMethod}
          animatedStyle={animatedStyle}
          animatedStyleToggle={animatedStyleToggle}
          emojis={emojis}
        />
        <View className="" /> */}
      </>
    );

  const renderSearchSection = () =>
    !isManual && (
      <Animated.View
        style={sectionAnimatedStyleSearch}
        className="gap-y-1 bg-componentbg dark:bg-dark-componentbg p-4 rounded-2xl shadow-xs mb-2"
      >
        {startMethod === "serial" ? (
          <>
            <SerialInput
              serial={serial}
              setSerial={setSerial}
              setShowScanner={setShowScanner}
              editable={!isData}
            />
            {!isData && (
              <View className="mt-1">
                <Animated.View style={btnAnimatedStyle}>
                  <Pressable
                    onPress={handleSearchPress}
                    android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                    className="flex-row items-center justify-center py-3 px-5 rounded-xl border border-primary dark:border-dark-primary bg-transparent"
                  >
                    <Text className="text-primary dark:text-dark-primary font-semibold text-base">
                      Buscar serial despachado
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </>
        ) : (
          <View className="flex-row gap-2 items-center">
            <View className="flex-1">
              <CustomTextInput
                placeholder="Número de factura"
                keyboardType="numeric"
                value={factNumber}
                onChangeText={setFactNumber}
              />
            </View>
            <Animated.View style={btnAnimatedStyle}>
              <Pressable
                onPress={handleSearchFactNum}
                className="bg-primary dark:bg-dark-primary py-3 px-5 rounded-xl"
              >
                <Text className="text-white font-semibold">Buscar</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    );

  const renderLoading = () =>
    loadingData && (
      <View className="flex-row items-center justify-center gap-2 mt-10 w-full">
        <ActivityIndicator color={isDarkPrimary} />
        <Text className="text-mutedForeground dark:text-dark-mutedForeground text-center">
          Buscando datos...
        </Text>
      </View>
    );

  const renderProductInfo = () => (
    <Animated.View className="gap-y-2 bg-componentbg dark:bg-dark-componentbg p-4 rounded-2xl shadow-xs">
      <Text className="text-lg font-semibold mb-1 text-foreground dark:text-dark-foreground">
        Información general
      </Text>

      {startMethod === "fact" || isManual ? (
        <View className="gap-2">
          <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
            Serial
          </Text>
          <SerialInput
            serial={serial}
            setSerial={setSerial}
            setShowScanner={setShowScanner}
          />
          <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
            Artículo
          </Text>
          <Pressable
            onPress={handleArtSelectPress}
            className="flex-row items-center justify-between px-4 py-3.5   border rounded-xl bg-transparent dark:bg-dark-componentbg border-gray-300 dark:border-gray-600"
          >
            {codeArt && (
              <View className="w-12 h-12 rounded-lg bg-bgimages overflow-hidden">
                <CustomImage img={`${imageURL}${codeArt.trim()}.jpg`} />
              </View>
            )}
            <Text className="text-foreground dark:text-dark-foreground flex-1 ml-3">
              {codeArt && artDes
                ? `${codeArt.trim()} - ${artDes.trim()} - ${barcode.trim()}`
                : "Seleccionar artículo..."}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#fff" : "#333"}
            />
          </Pressable>
        </View>
      ) : (
        <>
          <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
            Artículo
          </Text>
          <View
            className="flex-row items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 
                 bg-white dark:bg-dark-componentbg"
          >
            {codeArt ? (
              <View className="w-20 h-20 rounded-lg bg-bgimages overflow-hidden">
                <CustomImage img={`${imageURL}${codeArt.trim()}.jpg`} />
              </View>
            ) : (
              <View className="w-20 h-20 rounded-lg bg-bgimages items-center justify-center">
                <Ionicons name="image-outline" size={28} color="#999" />
              </View>
            )}

            {/* Texto */}
            <View className="flex-1 ml-4">
              <Text className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {codeArt && artDes && barcode
                  ? `${codeArt.trim()} - ${artDes.trim()} - ${barcode.trim()}`
                  : "Seleccionar artículo..."}
              </Text>
            </View>
          </View>
        </>
      )}

      <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
        Cliente
      </Text>
      {isManual ? (
        <Pressable
          onPress={handleClientSelectPress}
          className="flex-row items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-xl"
        >
          <Text className="text-foreground dark:text-dark-foreground">
            {selectedClient
              ? `${selectedClient.co_cli.trim()} - ${selectedClient.cli_des.trim()}`
              : "Seleccionar cliente..."}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#fff" : "#333"}
          />
        </Pressable>
      ) : (
        <Text className="text-foreground dark:text-dark-foreground flex-row items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-xl">
          {selectedClient
            ? `${selectedClient.co_cli.trim()} - ${selectedClient.cli_des.trim()}`
            : ""}
        </Text>
      )}
    </Animated.View>
  );

  const renderReturnDetails = () => (
    <Animated.View
      style={sectionAnimatedStyle}
      className="gap-y-2 bg-componentbg dark:bg-dark-componentbg p-4 rounded-2xl shadow-xs"
    >
      <View className="gap-2">
        <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
          Motivo
        </Text>
        <Pressable
          onPress={handleMotiveSelectPress}
          className="flex-row items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-xl"
        >
          <Text className="text-foreground dark:text-dark-foreground">
            {reason ? `${reason}` : "Seleccionar motivo..."}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#fff" : "#333"}
          />
        </Pressable>
        <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
          Comentario
        </Text>
        <CustomTextInput
          placeholder="Comentario"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />
      </View>
    </Animated.View>
  );

  const renderImageSection = () => (
    <View className="gap-y-1 bg-componentbg dark:bg-dark-componentbg p-4 rounded-2xl shadow-xs">
      <Text className="text-lg font-semibold mb-2 text-foreground dark:text-dark-foreground">
        Cargar imagen
      </Text>
      <View className="flex-row gap-3 mb-3">
        <TouchableOpacity
          onPress={pickImage}
          className="flex-1 border border-primary dark:border-dark-primary py-3 rounded-xl"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="images-outline" size={22} color={isDarkPrimary} />
            <Text className="text-secondary dark:text-dark-secondary font-bold ml-2">
              Galería
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePickFromCamera}
          className="flex-1 border border-secondary dark:border-dark-secondary py-3 rounded-xl"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="camera" size={22} color={isDarkPrimary} />
            <Text className="text-secondary dark:text-dark-secondary font-bold ml-2">
              Cámara
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {image && (
        <Animated.View
          style={imageAnimatedStyle}
          className="h-48 rounded-2xl overflow-hidden border border-dotted border-gray-300 dark:border-gray-600"
        >
          <CustomImage img={image} />
        </Animated.View>
      )}
    </View>
  );

  const renderSaveButton = () => (
    <View className="mt-6 mb-4">
      <Animated.View style={saveAnimatedStyle}>
        <Pressable
          onPress={handleSavePress}
          disabled={!isFormValid || loading}
          style={{
            backgroundColor: isFormValid ? isDarkPrimary : "#ccc",
          }}
          className="py-4 rounded-xl items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Registrar</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );

  const renderModals = () => (
    <>
      <BottomModal visible={showScanner} onClose={() => setShowScanner(false)}>
        <BarcodeScanner
          onScanned={(code) => {
            setSerial(code);
            setShowScanner(false);
          }}
        />
      </BottomModal>

      <BottomModal
        visible={showArtModal}
        onClose={() => setShowArtModal(false)}
      >
        <ArtsModal
          onClose={setShowArtModal}
          setCodeArt={setCodeArt}
          arts={artList}
        />
      </BottomModal>

      <BottomModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
      >
        <ClientModal
          onClose={setShowClientModal}
          setSelectedClient={setSelectedClient}
          clients={clients}
        />
      </BottomModal>
      <BottomModal
        visible={showMotiveModal}
        onClose={() => setShowMotiveModal(false)}
        heightPercentage={0.55}
      >
        <MotiveModal
          onClose={setShowMotiveModal}
          setSelectedMotive={setReason}
          selectedMotive={reason}
          motives={motives}
        />
      </BottomModal>
    </>
  );

  const renderFloatingButtons = () => (
    <>
      {isData && (
        <TouchableOpacity
          onPress={handleClearPress}
          className="bg-error dark:bg-dark-error p-4 rounded-full shadow-lg absolute bottom-32 left-4 z-50 elevation-xl"
          accessibilityLabel="Cancelar"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      )}

      {!isData && (
        <Animated.View
          style={animatedStyleAddManual}
          className="absolute bottom-32 right-4 z-99"
        >
          <TouchableOpacity
            onPress={handleManualPress}
            className="bg-primary dark:bg-dark-primary p-4 rounded-full shadow-lg elevation-xl"
            accessibilityLabel="Agregar manualmente"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );

  return (
    <View className="flex-1 bg-primary dark:bg-dark-primary">
      <View className="flex-1 bg-background dark:bg-dark-background rounded-t-3xl">
        <ScrollView
          contentContainerClassName="py-4 px-5 pb-44 gap-2"
          keyboardShouldPersistTaps="handled"
        >
          {renderHeader()}
          {renderToggleSelector()}
          {renderSearchSection()}
          {renderLoading()}

          {isData && (
            <Animated.View className="mt-1 gap-y-5">
              {renderProductInfo()}
              {renderReturnDetails()}
              {renderImageSection()}
              {renderSaveButton()}
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {renderModals()}
      {renderFloatingButtons()}
    </View>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import CustomPicker from "@/components/inputs/CustomPicker";
import CustomTextInput from "@/components/inputs/CustomTextInput";
import RateInput from "@/components/inputs/RateInput";
import BottomModal from "@/components/ui/BottomModal";

import { useOverlayStore } from "@/stores/useSuccessOverlayStore";
import { totalVenezuela } from "@/utils/moneyFormat";

import type { MethodPay } from "../interfaces/MethodPay";
import type { PlanPagos } from "../interfaces/PlanPagos";
import {
  BuildAuthorizedItems,
  BuildUnAuthorizedItems,
} from "../types/BuildAuthorizedItems";
import { ResultPostAuth } from "../types/ResultPosts";

interface Props {
  visible: boolean;
  setVisible: () => void;
  onClose: () => void;
  items: PlanPagos[];
  methods: MethodPay[];
  onAuthorize: (authorizedItems: PlanPagos[]) => Promise<ResultPostAuth>;
  buildAuthorizedItems: BuildAuthorizedItems;
  buildUnAuthorizedItems: BuildUnAuthorizedItems;
}

function useAuthPayRules(
  items: PlanPagos[],
  methods: MethodPay[],
  formaPago: string,
) {
  return useMemo(() => {
    let hasUSD = false;
    let hasVED = false;
    let fallbackCurrency: string | undefined;
    let hasAlreadyAuthorized = false;

    for (const item of items) {
      if (item.moneda === "USD") hasUSD = true;
      if (item.moneda === "VED") hasVED = true;
      if (!fallbackCurrency) fallbackCurrency = item.moneda;
      if (item.autorizadopagar === 1) hasAlreadyAuthorized = true;
    }

    const currentMethod = methods.find(
      (m) => String(m.codigounico) === formaPago,
    );

    const targetCurrency =
      currentMethod?.monedapago ?? fallbackCurrency ?? "VED";

    const requiresRate = !(
      (targetCurrency === "USD" && hasUSD && !hasVED) ||
      (targetCurrency === "VED" && hasVED && !hasUSD)
    );

    return {
      targetCurrency,
      requiresRate,
      currentMethod,
      hasAlreadyAuthorized,
    };
  }, [items, methods, formaPago]);
}

export default function AuthPayModal({
  visible,
  setVisible,
  onClose,
  items,
  methods,
  onAuthorize,
  buildAuthorizedItems,
  buildUnAuthorizedItems,
}: Props) {
  const [tasa, setTasa] = useState<number>(0);
  const [customAuthorizedAmountRaw, setCustomAuthorizedAmountRaw] =
    useState("");
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errorAmount, setErrorAmout] = useState(false);

  const firstMethodDefault = useMemo(
    () =>
      methods.find((d) => d.monedapago.startsWith(items[0]?.moneda))
        ?.codigounico,
    [methods, items],
  );

  const [formaPago, setFormaPago] = useState(
    firstMethodDefault?.toString() ?? "",
  );
  const overlay = useOverlayStore();
  const expandAnim = useSharedValue(0);

  const showSingleItemAmountInput = items.length === 1;

  const initialRate = useMemo(() => {
    return Number(items.find((i) => i.tasacambio)?.tasacambio) || 0;
  }, [items]);

  useEffect(() => {
    if (!visible) return;

    setTasa(initialRate);
    setCustomAuthorizedAmountRaw("");
    setExpanded(false);
    setShowErrors(false);
  }, [visible, initialRate]);

  const { targetCurrency, requiresRate, currentMethod, hasAlreadyAuthorized } =
    useAuthPayRules(items, methods, formaPago);

  const effectiveRate = requiresRate && tasa <= 0 ? initialRate : tasa;

  const totals = useMemo(() => {
    if (!items.length) return { ved: 0, usd: 0, totalFinal: 0 };

    let ved = 0;
    let usd = 0;

    for (const item of items) {
      const monto = Number(item.montoneto);
      if (item.moneda === "VED") {
        ved += monto;
        usd += effectiveRate ? monto / effectiveRate : 0;
      } else {
        usd += monto;
        ved += effectiveRate ? monto * effectiveRate : 0;
      }
    }

    return {
      ved,
      usd,
      totalFinal: targetCurrency === "USD" ? usd : ved,
    };
  }, [items, effectiveRate, targetCurrency]);

  const suggestedAmount = useMemo(() => {
    if (items.length !== 1 || !items[0]) return "";
    const originalAmount = Number(items[0].montoneto);
    if (items[0].moneda === targetCurrency) return originalAmount.toFixed(2);
    return targetCurrency === "USD"
      ? (originalAmount / effectiveRate).toFixed(2)
      : (originalAmount * effectiveRate).toFixed(2);
  }, [items, targetCurrency, effectiveRate]);

  const maxAllowedAmount = useMemo(() => {
    if (items.length !== 1 || !items[0] || (requiresRate && effectiveRate <= 0))
      return undefined;
    const original = Number(items[0].montoneto);
    const val =
      items[0].moneda === targetCurrency
        ? original
        : targetCurrency === "USD"
          ? original / effectiveRate
          : original * effectiveRate;
    return Math.round(val * 100) / 100;
  }, [items, effectiveRate, targetCurrency, requiresRate]);

  const isValid =
    formaPago.length > 0 &&
    (!requiresRate || effectiveRate > 0) &&
    customAuthorizedAmountRaw.length > 0;

  useEffect(() => {
    if (!showSingleItemAmountInput || !effectiveRate) return;
    setCustomAuthorizedAmountRaw(suggestedAmount);
  }, [effectiveRate, suggestedAmount, showSingleItemAmountInput]);

  // Animation
  useEffect(() => {
    expandAnim.value = withTiming(expanded ? 1 : 0, { duration: 250 });
  }, [expanded]);

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandAnim.value * 1500,
    opacity: expandAnim.value,
    overflow: "hidden",
  }));

  const handleCustomAmountChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");

      if (parts.length > 2) return;
      if (parts[1]?.length > 2) return;

      if (cleaned === "0" || cleaned === "0.0" || cleaned === "0.00") {
        setErrorAmout(true);
      } else if (errorAmount) {
        setErrorAmout(false);
      }

      setCustomAuthorizedAmountRaw(cleaned);
    },
    [errorAmount],
  );

  const handleAuthorize = useCallback(async () => {
    if (!isValid || isLoading) {
      setShowErrors(true);
      return;
    }

    const amountNum = Number(customAuthorizedAmountRaw) || 0;
    if (
      items.length === 1 &&
      maxAllowedAmount &&
      amountNum > maxAllowedAmount + 0.01
    ) {
      Alert.alert(
        "Monto excedido",
        `El máximo es ${totalVenezuela(maxAllowedAmount)} ${targetCurrency}`,
      );
      return;
    }
    if (amountNum === 0) {
      Alert.alert("Monto incorrecto", `El monto debe ser mayor a 0`);
      setErrorAmout(true);
      return;
    }

    setIsLoading(true);
    try {
      const authorizedItems = buildAuthorizedItems(
        items,
        targetCurrency,
        effectiveRate,
        amountNum || undefined,
        currentMethod,
      );
      const totalAuth = authorizedItems.reduce(
        (sum, i) => sum + Number(i.montoautorizado),
        0,
      );

      await onAuthorize(authorizedItems);

      overlay.show("success", {
        title: "Autorizado",
        subtitle: `${items.length} documento(s) por ${totalVenezuela(totalAuth)} ${targetCurrency}`,
      });
      onClose();
    } catch (error) {
      overlay.show("error", {
        title: "Error",
        subtitle: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isValid,
    isLoading,
    effectiveRate,
    items,
    targetCurrency,
    customAuthorizedAmountRaw,
    maxAllowedAmount,
    currentMethod,
    onAuthorize,
    onClose,
  ]);

  const handleUnAuthorize = useCallback(async () => {
    Alert.alert("¿Cancelar?", "Se eliminará la autorización actual.", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await onAuthorize(buildUnAuthorizedItems(items));
            overlay.show("info", {
              title: "Cancelado",
              subtitle: "Autorización removida",
            });
            onClose();
          } catch (e) {
            overlay.show("error", {
              title: "Error",
              subtitle: "No se pudo cancelar",
            });
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, [items, buildUnAuthorizedItems, onAuthorize, onClose]);

  const convertAmount = useCallback(
    (monto: number, moneda: string) => {
      if (!effectiveRate) return 0;
      if (moneda === targetCurrency) return monto;
      return targetCurrency === "USD"
        ? monto / effectiveRate
        : monto * effectiveRate;
    },
    [effectiveRate, targetCurrency],
  );
  type ItemDetailProps = {
    item: PlanPagos;
    convertAmount: (monto: number, moneda: string) => number;
    targetCurrency: string;
    currentMethod: MethodPay | undefined;
  };

  const ItemDetail = React.memo(
    ({
      item,
      convertAmount,
      targetCurrency,
      currentMethod,
    }: ItemDetailProps) => (
      <View className="py-3">
        <Text className="font-bold dark:text-white" numberOfLines={1}>
          {item.beneficiario}
        </Text>
        <Text className="text-xs text-mutedForeground">
          {item.tipodocumento}-{item.numerodocumento} {item.observacion}
        </Text>
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-500">
            {totalVenezuela(Number(item.montoneto))} {item.moneda}
          </Text>
          <Text className="font-bold text-primary">
            {currentMethod
              ? `${totalVenezuela(
                  convertAmount(Number(item.montoneto), item.moneda),
                )} ${targetCurrency}`
              : "---"}
          </Text>
        </View>
      </View>
    ),
  );

  if (!visible || items.length === 0) return null;

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <ScrollView keyboardShouldPersistTaps="handled" className="pb-6">
        {/* Header */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mb-3">
          <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>
          {items.length < 2 && (
            <>
              <Text className="text-base font-medium mt-1 text-foreground dark:text-dark-foreground">
                {items[0]?.beneficiario ?? "—"}
              </Text>

              <Text className="text-sm mt-1 text-mutedForeground dark:text-dark-mutedForeground">
                {items[0].tipodocumento}-{items[0].numerodocumento}
                {"  "}
                {items[0].observacion}
              </Text>
            </>
          )}
          <Text className="text-sm mt-1 text-mutedForeground dark:text-dark-mutedForeground">
            {items.length} documento{items.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Total to authorize */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mb-3">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Monto a autorizar
          </Text>
          <Text className="text-2xl font-extrabold  text-primary dark:text-dark-primary">
            {totalVenezuela(totals.totalFinal)} {targetCurrency}
          </Text>

          {requiresRate && effectiveRate > 0 && (
            <Text className="text-sm  text-mutedForeground dark:text-dark-mutedForeground">
              ≈{" "}
              {totalVenezuela(
                targetCurrency === "USD" ? totals.ved : totals.usd,
              )}{" "}
              {targetCurrency === "USD" ? "VED" : "USD"}
            </Text>
          )}
        </View>

        {/* Form */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mb-3 gap-y-2">
          <View>
            <Text className="text-lg font-bold mb-1 text-foreground dark:text-dark-foreground">
              Forma de pago
            </Text>
            <CustomPicker
              selectedValue={formaPago}
              onValueChange={setFormaPago}
              items={methods.map((m) => ({
                label: m.textList,
                value: String(m.codigounico),
              }))}
              placeholder="Seleccione método de pago"
              error={showErrors && !formaPago ? "Campo requerido" : undefined}
            />
          </View>

          {requiresRate && (
            <View>
              <Text className="text-lg font-bold mb-1 text-foreground dark:text-dark-foreground">
                Tasa autorizada{" "}
                <Text className="text-error dark:text-dark-error">*</Text>
              </Text>
              <RateInput value={tasa} onChangeValue={setTasa} />
              {tasa <= 0 && (
                <Text className="text-xs mt-1 text-mutedForeground">
                  Se usara la tasa predeterminada del documento.
                </Text>
              )}
            </View>
          )}

          {showSingleItemAmountInput && requiresRate && (
            <View>
              <View className="flex-row">
                <Text className="text-lg font-bold mb-1 text-foreground dark:text-dark-foreground">
                  Monto autorizado
                </Text>
                <Text className="text-lg font-bold text-error dark:text-dark-error">
                  {" "}
                  *
                </Text>
              </View>

              <CustomTextInput
                value={customAuthorizedAmountRaw}
                onChangeText={handleCustomAmountChange}
                placeholder={suggestedAmount || "0.00"}
                keyboardType="numeric"
                onError={errorAmount}
              />
              {suggestedAmount &&
                customAuthorizedAmountRaw !== suggestedAmount && (
                  <Text className="text-xs mt-1 text-mutedForeground">
                    Sugerido: {totalVenezuela(Number(suggestedAmount))}
                  </Text>
                )}
              {errorAmount && (
                <Text className="text-xs mt-1 text-error dark:text-dark-error">
                  El monto no puuede ser 0.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Items detail */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text className="text-primary dark:text-dark-primary font-bold text-base items-center text-center">
              {expanded ? "Ocultar detalle" : `Ver detalle`}
            </Text>
          </Pressable>

          <Animated.View style={expandStyle}>
            <View className="mt-4">
              {items.map((item, index) => (
                <ItemDetail
                  key={`${item.tipodocumento}-${item.numerodocumento}-${item.empresa}`}
                  item={item}
                  convertAmount={convertAmount}
                  targetCurrency={targetCurrency}
                  currentMethod={currentMethod}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="pt-4 gap-y-3 ">
        <Pressable
          className={`py-4 rounded-xl items-center ${
            !isValid || isLoading
              ? "bg-primary/50 dark:bg-dark-primary/50"
              : "bg-primary dark:bg-dark-primary"
          }`}
          disabled={!isValid || isLoading}
          onPress={handleAuthorize}
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Procesando..." : `Autorizar`}
          </Text>
        </Pressable>

        {hasAlreadyAuthorized && (
          <Pressable
            className={`py-4 rounded-xl border items-center ${
              isLoading
                ? "border-primary/40 dark:border-dark-primary/40"
                : "border-primary dark:border-dark-primary"
            }`}
            disabled={isLoading}
            onPress={handleUnAuthorize}
          >
            <Text
              className={`font-bold text-base ${
                isLoading
                  ? "text-primary/50"
                  : "text-primary dark:text-dark-primary"
              }`}
            >
              {isLoading ? "Procesando..." : "Cancelar autorización"}
            </Text>
          </Pressable>
        )}
        <Pressable className="rounded-xl py-4 bg-error" onPress={onClose}>
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </Pressable>
      </View>
    </BottomModal>
  );
}

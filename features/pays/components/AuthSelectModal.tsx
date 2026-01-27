import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
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

interface Props {
  visible: boolean;
  onClose: () => void;
  items: PlanPagos[];
  methods: MethodPay[];
  onAuthorize: (authorizedItems: PlanPagos[]) => Promise<void>;
}

/* ----------------------- HELPERS ----------------------- */

function buildAuthorizedItems(
  items: PlanPagos[],
  currency: string,
  rate: number,
  customAmount?: number,
  selectedMethod?: MethodPay,
): PlanPagos[] {
  return items.map((item, index) => {
    let montoautorizado =
      currency === "USD"
        ? Number(item.montoneto) / (item.moneda === "USD" ? 1 : rate)
        : Number(item.montoneto) * (item.moneda === "USD" ? rate : 1);

    // Override only first item if custom amount is provided
    if (index === 0 && customAmount !== undefined && customAmount > 0) {
      montoautorizado = customAmount;
    }

    return {
      ...item,
      monedaautorizada: currency,
      tasaautorizada: rate,
      montoautorizado,
      autorizadopagar: 1,
      metodopago: selectedMethod?.textList ?? "",
      empresapagadora: selectedMethod?.empresapagadora ?? "",
      bancopagador: selectedMethod?.bancopago ?? "",
      codigounico: selectedMethod?.codigounico ?? 0,
      fechaautorizadopor: new Date(),
      autorizadopor: null, //TODO define
      planpagonumero: 0,
      autorizadonumero: 0,
      codigobanco: null,
      codigoswift: null,
      pagado: false,
      fechapagado: null,

      generadotxt: false,
      enviadocajachica: false,
      conciliadopago: false,
      cob_num: 0,
      moneda_pago: null,
      monto_pago: 0,
      cantidadSKU: 0,
      unidades: 0,
      origen: "",
      numeroPOOdoo: "",
      linkseleccion: "",
      categoria: null,
      temporada: "",
      estatuscompras: "",
      fechacompras: null,
      estatuslogistico: "",
      fechalogistico: null,
    };
  });
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

    for (const item of items) {
      if (item.moneda === "USD") hasUSD = true;
      if (item.moneda === "VED") hasVED = true;
      if (!fallbackCurrency && item.moneda) fallbackCurrency = item.moneda;
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
      hasAlreadyAuthorized: items.some((i) => i.autorizadopagar === 1),
    };
  }, [items, methods, formaPago]);
}

function buildUnAuthorizedItems(items: PlanPagos[]): PlanPagos[] {
  return items.map((item) => ({
    ...item,
    autorizadopagar: 0,
    monedaautorizada: null,
    tasaautorizada: 0,
    montoautorizado: 0,
    metodopago: "",
    empresapagadora: "",
    bancopagador: "",
    planpagonumero: 0,
    autorizadonumero: 0,
    codigounico: 0,
  }));
}
/* ----------------------- MAIN COMPONENT ----------------------- */

export default function AuthPayModal({
  visible,
  onClose,
  items,
  methods,
  onAuthorize,
}: Props) {
  const [tasa, setTasa] = useState<number>(0);
  const [customAuthorizedAmountRaw, setCustomAuthorizedAmountRaw] =
    useState("");
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const firstMethodDefault = methods.find((d) =>
    d.monedapago.startsWith(items[0].moneda),
  )?.codigounico;

  const [formaPago, setFormaPago] = useState(
    firstMethodDefault?.toString() ?? "",
  );
  const overlay = useOverlayStore();
  const expandAnim = useSharedValue(0);

  const showSingleItemAmountInput = items.length === 1;

  const { targetCurrency, requiresRate, currentMethod, hasAlreadyAuthorized } =
    useAuthPayRules(items, methods, formaPago);

  const totals = useMemo(() => {
    if (tasa <= 0) return { ved: 0, usd: 0, totalFinal: 0 };

    let ved = 0;
    let usd = 0;

    for (const item of items) {
      const monto = Number(item.montoneto);

      if (item.moneda === "VED") {
        ved += monto;
        usd += monto / tasa;
      } else {
        usd += monto;
        ved += monto * tasa;
      }
    }

    return {
      ved,
      usd,
      totalFinal: targetCurrency === "USD" ? usd : ved,
    };
  }, [items, tasa, targetCurrency]);

  //Calculate suggested amount
  const suggestedAmount = useMemo(() => {
    if (!showSingleItemAmountInput || !items[0]) return "";

    const originalAmount = Number(items[0].montoneto);
    const originalCurrency = items[0].moneda;

    if (originalCurrency === targetCurrency) return originalAmount.toFixed(2);

    return targetCurrency === "USD"
      ? (originalAmount / tasa).toFixed(2)
      : (originalAmount * tasa).toFixed(2);
  }, [items, targetCurrency, tasa, showSingleItemAmountInput]);

  //Check the amount
  const maxAllowedAmount = useMemo(() => {
    if (!showSingleItemAmountInput || !items[0] || tasa <= 0) return undefined;

    const original = Number(items[0].montoneto);

    if (items[0].moneda === targetCurrency) {
      return original;
    }

    const value = targetCurrency === "USD" ? original / tasa : original * tasa;

    return Math.round(value * 100) / 100;
  }, [items, tasa, targetCurrency, showSingleItemAmountInput]);

  const isValid = !!formaPago && (!requiresRate || tasa > 0);

  // Auto-sync initial values when modal becomes visible
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialRateItem = items.find((i) => i.tasacambio);
    const initialRate = initialRateItem
      ? Number(initialRateItem.tasacambio)
      : 0;

    setTasa(initialRate);
    setCustomAuthorizedAmountRaw("");
    setExpanded(false);
    setShowErrors(false);
    setIsLoading(false);
  }, [visible, items]);

  useEffect(() => {
    if (!showSingleItemAmountInput || !tasa) return;
    setCustomAuthorizedAmountRaw(suggestedAmount);
  }, [tasa, suggestedAmount, showSingleItemAmountInput]);

  // Animation
  useEffect(() => {
    expandAnim.value = withTiming(expanded ? 1 : 0, { duration: 250 });
  }, [expanded, expandAnim]);

  const expandStyle = useAnimatedStyle(() => ({
    height: expandAnim.value === 0 ? 0 : "auto",
    opacity: expandAnim.value,
    overflow: "hidden" as const,
  }));

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return; // more than one dot
    if (parts[1]?.length > 2) return; // max 2 decimals

    setCustomAuthorizedAmountRaw(cleaned);
  };

  const customAmountNumber = useMemo(() => {
    const num = Number(customAuthorizedAmountRaw);
    return isNaN(num) ? undefined : num;
  }, [customAuthorizedAmountRaw]);

  function round2(num: number) {
    return Math.round(num * 100) / 100;
  }

  const exceedsAllowedAmount =
    customAmountNumber !== undefined &&
    maxAllowedAmount !== undefined &&
    round2(customAmountNumber) > round2(maxAllowedAmount);

  const handleAuthorize = useCallback(async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    if (exceedsAllowedAmount) {
      Alert.alert(
        "Monto excedido",
        `El monto autorizado no debe exceder ${totalVenezuela(
          maxAllowedAmount!,
        )} ${targetCurrency}.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      const authorizedItems = buildAuthorizedItems(
        items,
        targetCurrency,
        tasa,
        customAmountNumber,
        currentMethod,
      );

      const totalAuthorized = authorizedItems.reduce(
        (sum, item) => sum + Number(item.montoautorizado),
        0,
      );

      await onAuthorize(authorizedItems);

      overlay.show("success", {
        title: "Pagos autorizados",
        subtitle: `${items.length} documento${items.length !== 1 ? "s" : ""} por ${totalVenezuela(totalAuthorized)} ${targetCurrency}`,
      });

      onClose();
    } catch (error) {
      overlay.show("error", {
        title: "Error al autorizar",
        subtitle: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isValid,
    items,
    targetCurrency,
    tasa,
    customAmountNumber,
    currentMethod,
    onAuthorize,
    onClose,
    overlay,
  ]);
  const handleUnAuthorize = useCallback(async () => {
    Alert.alert(
      "¿Cancelar autorización?",
      `Se cancelará la autorización de ${items.length} documento${items.length !== 1 ? "s" : ""}.`,
      [
        {
          text: "No, mantener autorización",
          style: "cancel",
        },
        {
          text: "Sí, cancelar autorización",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);

            try {
              const unAuthorizedItems = buildUnAuthorizedItems(items);

              await onAuthorize(unAuthorizedItems);

              overlay.show("info", {
                title: "Autorización cancelada",
                subtitle: `${items.length} documento${items.length !== 1 ? "s" : ""} desautorizado${items.length !== 1 ? "s" : ""} correctamente`,
              });

              onClose();
            } catch (error) {
              overlay.show("error", {
                title: "Error al desautorizar",
                subtitle:
                  error instanceof Error ? error.message : "Error desconocido",
              });
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [items]);

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

          {requiresRate && tasa > 0 && (
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
              Forma de pago {formaPago}
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
                <Text className="text-primary dark:text-dark-primary">
                  (requerida)
                </Text>
              </Text>
              <RateInput value={tasa} onChangeValue={setTasa} />
            </View>
          )}

          {showSingleItemAmountInput && requiresRate && (
            <View>
              <Text className="text-lg font-bold mb-1 text-foreground dark:text-dark-foreground">
                Monto autorizado
              </Text>
              <CustomTextInput
                value={customAuthorizedAmountRaw}
                onChangeText={handleCustomAmountChange}
                placeholder={suggestedAmount || "0.00"}
                keyboardType="numeric"
              />
              {suggestedAmount &&
                customAuthorizedAmountRaw !== suggestedAmount && (
                  <Text className="text-xs mt-1 text-mutedForeground">
                    Sugerido: {totalVenezuela(Number(suggestedAmount))}
                  </Text>
                )}
            </View>
          )}
        </View>

        {/* Items detail */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text className="text-primary dark:text-dark-primary font-bold text-base">
              {expanded ? "Ocultar detalle" : `Ver detalle (${items.length})`}
            </Text>
          </Pressable>

          <Animated.View style={expandStyle}>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.numerodocumento)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-border my-2" />
              )}
              renderItem={({ item }) => (
                <View className="py-3">
                  <Text className="font-medium text-foreground dark:text-dark-foreground">
                    {item.beneficiario}
                  </Text>
                  {item.observacion && (
                    <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-0.5">
                      {item.observacion}
                    </Text>
                  )}
                  <View className="flex-row justify-between  mt-1">
                    <Text className="font-normal mt-2 text-foreground dark:text-dark-foreground">
                      {totalVenezuela(Number(item.montoneto))} {item.moneda}
                    </Text>

                    <Text className="font-bold mt-2 text-primary dark:text-dark-primary">
                      {(() => {
                        const original = Number(item.montoneto);

                        if (!currentMethod?.monedapago || tasa <= 0) {
                          return "—";
                        }

                        let converted: number;

                        if (item.moneda === currentMethod.monedapago) {
                          converted = original;
                        } else if (currentMethod.monedapago === "USD") {
                          converted = original / tasa;
                        } else {
                          converted = original * tasa;
                        }

                        return `${totalVenezuela(converted)} ${currentMethod.monedapago}`;
                      })()}
                    </Text>
                  </View>
                </View>
              )}
            />
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
            {isLoading ? "Procesando..." : `Autorizar (${items.length})`}
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

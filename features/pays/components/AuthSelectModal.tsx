import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
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
  selectedMethod?: MethodPay
): PlanPagos[] {
  return items.map((item, index) => {
    let montoautorizado =
      currency === "USD"
        ? Number(item.montosaldo) / (item.moneda === "USD" ? 1 : rate)
        : Number(item.montosaldo) * (item.moneda === "USD" ? rate : 1);

    // Override only first item if custom amount is provided
    if (index === 0 && customAmount !== undefined) {
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

      // Default/zero values (as per your original)
      planpagonumero: 0,
      autorizadonumero: 0,
      codigobanco: null,
      codigoswift: null,
      fechaautorizadopor: null,
      autorizadopor: null,
      pagado: 0,
      fechapagado: null,
      codigounico: 0,
      generadotxt: 0,
      enviadocajachica: 0,
      conciliadopago: 0,
      cob_num: 0,
      moneda_pago: null,
      monto_pago: 0,
      cantidadSKU: null,
      unidades: null,
      origen: null,
      numeroPOOdoo: null,
      linkseleccion: null,
      categoria: null,
      temporada: null,
      estatuscompras: null,
      fechacompras: null,
      estatuslogistico: null,
      fechalogistico: null,
    };
  });
}

function useAuthPayRules(
  items: PlanPagos[],
  methods: MethodPay[],
  formaPago: string
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
      (m) => String(m.codigounico) === formaPago
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

/* ----------------------- MAIN COMPONENT ----------------------- */

export default function AuthPayModal({
  visible,
  onClose,
  items,
  methods,
  onAuthorize,
}: Props) {
  const [formaPago, setFormaPago] = useState("");
  const [tasa, setTasa] = useState<number>(0);
  const [customAuthorizedAmountRaw, setCustomAuthorizedAmountRaw] =
    useState("");
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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
      const monto = Number(item.montosaldo);
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

    const originalAmount = Number(items[0].montosaldo);
    const originalCurrency = items[0].moneda;

    if (originalCurrency === targetCurrency) return originalAmount.toFixed(2);

    return targetCurrency === "USD"
      ? (originalAmount / tasa).toFixed(2)
      : (originalAmount * tasa).toFixed(2);
  }, [items, targetCurrency, tasa, showSingleItemAmountInput]);

//Check the amount
  const maxAllowedAmount = useMemo(() => {
    if (!showSingleItemAmountInput || !items[0] || tasa <= 0) return undefined;

    const original = Number(items[0].montosaldo);

    if (items[0].moneda === targetCurrency) {
      return original;
    }

    return targetCurrency === "USD" ? original / tasa : original * tasa;
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

  const exceedsAllowedAmount =
    customAmountNumber !== undefined &&
    maxAllowedAmount !== undefined &&
    customAmountNumber > maxAllowedAmount;

  const handleAuthorize = useCallback(async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    
    if (exceedsAllowedAmount) {
     
        Alert.alert(
          "Monto excedido",
          `El monto autorizado no debe exceder ${totalVenezuela(
            maxAllowedAmount!
          )} ${targetCurrency}.`
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
        currentMethod
      );

      const totalAuthorized = authorizedItems.reduce(
        (sum, item) => sum + Number(item.montoautorizado),
        0
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

  if (!visible || items.length === 0) return null;

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <ScrollView keyboardShouldPersistTaps="handled" className="pb-6">
        {/* Header */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mb-3">
          <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>
          <Text className="text-base font-medium mt-1 text-foreground dark:text-dark-foreground">
            {items[0]?.beneficiario ?? "—"}
          </Text>
          {items[0]?.observacion && (
            <Text className="text-sm mt-1 text-mutedForeground dark:text-dark-mutedForeground">
              {items[0].observacion}
            </Text>
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
                targetCurrency === "USD" ? totals.ved : totals.usd
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
          <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
            <Text className="text-primary dark:text-dark-primary font-bold text-base">
              {expanded ? "Ocultar detalle" : `Ver detalle (${items.length})`}
            </Text>
          </TouchableOpacity>

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
                  <Text className="text-right font-bold mt-2 text-primary dark:text-dark-primary">
                    {totalVenezuela(Number(item.montosaldo))} {item.moneda}
                  </Text>
                </View>
              )}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="pt-4 gap-y-3 ">
        <TouchableOpacity
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
        </TouchableOpacity>

        {hasAlreadyAuthorized && (
          <TouchableOpacity
            className="py-4 rounded-xl border border-primary dark:border-dark-primary items-center"
            onPress={onClose}
          >
            <Text className="text-primary dark:text-dark-primary font-bold">
              Cancelar autorización
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="rounded-xl py-4 bg-error"
          onPress={onClose}
        >
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
}

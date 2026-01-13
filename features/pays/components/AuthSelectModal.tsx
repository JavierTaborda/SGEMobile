import { useCallback, useEffect, useMemo, useState } from "react";
import {
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

import { PlanPagos } from "../interfaces/PlanPagos";

import { MethodPay } from "../interfaces/MethodPay";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: PlanPagos[];
  methods: MethodPay[];
  onAuthorize: (authorizedItems: PlanPagos[]) => Promise<void>; // 👈
}

/* ----------------------- HELPERS ----------------------- */

function buildAuthorizedItems(
  items: PlanPagos[],
  currency: string,
  rate: number,
  customAmount?: number, // optional override for single item
  methods?: MethodPay, 


) {
  return items.map((item, index) => {
    let montoautorizado =
      currency === "USD"
        ? Number(item.montosaldo) / (item.moneda === "USD" ? 1 : rate)
        : Number(item.montosaldo) * (item.moneda === "USD" ? rate : 1);

    // Override only the first item if custom amount provided
    if (index === 0 && customAmount !== undefined) {
      montoautorizado = customAmount;
    }

    return {
      ...item,
      monedaautorizada: currency,
      tasaautorizada: rate,
      montoautorizado,
      autorizadopagar: 1,
      metodopago: methods?.textList ,
      empresapagadora: methods?.empresapagadora,
      bancopagador:methods?.bancopago ?? "",

      //TODO: check is it needed
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
      let isAuth = false;
      let fallbackCurrency: string | undefined;

      for (const i of items) {
        if (i.moneda === "USD") hasUSD = true;
        if (i.moneda === "VED") hasVED = true;
        if (i.autorizadopagar === 1) isAuth = true;
        if (!fallbackCurrency && i.moneda) fallbackCurrency = i.moneda;
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

      return { targetCurrency, requiresRate, isAuth, currentMethod };
    }, [items, methods, formaPago]);
  }

/* ----------------------- COMPONENT ----------------------- */

export default function AuthPayModal({
  visible,
  onClose,
  items,
  methods,
  onAuthorize,
}: Props) {
  const [formaPago, setFormaPago] = useState("");
  const [tasa, setTasa] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [methodsSelected, setMethodsSelected] = useState<MethodPay | undefined>(undefined);
  const [customAuthorizedAmount, setCustomAuthorizedAmount] =
    useState<string>("");

  const showSingleItemAmountInput = items.length === 1;

  const overlay = useOverlayStore();
  const expandAnim = useSharedValue(0);


function useAuthPayTotals(items: PlanPagos[], tasa: number, currency?: string) {
  return useMemo(() => {
    if (tasa <= 0) return { ved: 0, usd: 0, totalFinal: 0 };

    let ved = 0;
    let usd = 0;

    for (const i of items) {
      const monto = Number(i.montosaldo);
      if (i.moneda === "VED") {
        ved += monto;
        usd += monto / tasa;
      } else {
        usd += monto;
        ved += monto * tasa;
      }
    }

    return { ved, usd, totalFinal: currency === "USD" ? usd : ved };
  }, [items, tasa, currency]);
}

  const { targetCurrency, requiresRate, isAuth,  } = useAuthPayRules(
    items,
    methods,
    formaPago

  );
  const totals = useAuthPayTotals(items, tasa, targetCurrency);

  const isValid = !!formaPago && (!requiresRate || tasa > 0);

  // Suggested amount in target currency for single item
  const suggestedAmount = useMemo(() => {
    if (!showSingleItemAmountInput || !items[0]) return "";

    const originalAmount = Number(items[0].montosaldo);
    const originalCurrency = items[0].moneda;

    if (originalCurrency === targetCurrency) return String(originalAmount);

    return targetCurrency === "USD"
      ? (originalAmount / tasa).toFixed(2)
      : (originalAmount * tasa).toFixed(2);
  }, [items, targetCurrency, tasa, showSingleItemAmountInput]);

  useEffect(() => {
    setCustomAuthorizedAmount(suggestedAmount);
  }, [suggestedAmount]);

  useEffect(() => {
    expandAnim.value = withTiming(expanded ? 1 : 0, { duration: 250 });
  }, [expanded]);

  useEffect(() => {
    if (!visible) return;

    // Initialize tasa based on first item's rate if available
    const initialRateItem = items.find((i) => i.tasacambio);
    const initialRate = initialRateItem
      ? Number(initialRateItem.tasacambio)
      : 0.0; // Default fallback rate

    setFormaPago("");
    setTasa(initialRate);
    setCustomAuthorizedAmount("");
    setExpanded(false);
    setShowErrors(false);
    setIsLoading(false);
  }, [visible]);

  const expandStyle = useAnimatedStyle(() => ({
    height: expandAnim.value === 0 ? 0 : "auto",
    opacity: expandAnim.value,
    transform: [{ scale: 0.98 + expandAnim.value * 0.02 }],
  }));

  const handleAuthorize = useCallback(async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    try {
      setIsLoading(true);

      const customAmount = customAuthorizedAmount
        ? Number(customAuthorizedAmount)
        : undefined;

      const itemsAuthorized = buildAuthorizedItems(
        items,
        targetCurrency!,
        tasa,
        customAmount,
        methodsSelected
       
      );
      //console.log(itemsAuthorized)

      const total = itemsAuthorized.reduce(
        (a, i) => a + Number(i.montoautorizado),
        0
      );

      await onAuthorize(itemsAuthorized);

      overlay.show("success", {
        title: "Pagos autorizados",
        subtitle: `${items.length} documento${items.length > 1 ? "s" : ""} por ${totalVenezuela(total)} ${targetCurrency}`,
      });

      onClose();
    } catch (error) {
      overlay.show("error", {
        title: "Error al autoriz  ar",
        subtitle: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isValid,
    items,
    tasa,
    targetCurrency,
    customAuthorizedAmount,
    onAuthorize,
    onClose,
    overlay,
  ]);

  if (!visible || items.length === 0) return null;

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <ScrollView keyboardShouldPersistTaps="handled" className="pb-4 mb-4">
        {/* Header */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>
          <Text className="text-sm font-semibold mt-1 text-foreground dark:text-dark-foreground">
            {items[0].beneficiario}
          </Text>
          <Text className="text-sm mt-1 text-foreground dark:text-dark-foreground">
            {items[0].observacion} 
          </Text>
          <Text className="text-sm mt-1 text-foreground dark:text-dark-foreground">
            {items.length} documento{items.length > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Total */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-3">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Monto a autorizar
          </Text>
          <Text className="text-xl font-extrabold text-primary dark:text-dark-primary">
            {totalVenezuela(totals.totalFinal)} {targetCurrency}
          </Text>

          {/* Dual currency estimate */}
          {requiresRate && tasa > 0 && (
            <View className="mt-1 flex-row justify-start">
              <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
                ≈{" "}
                <Text className="font-semibold text-primary dark:text-dark-primary">
                  {totalVenezuela(
                    targetCurrency === "USD" ? totals.ved : totals.usd
                  )}{" "}
                  {targetCurrency === "USD" ? "VED" : "USD"}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4 gap-4">
          <View>
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground pb-1">
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
              error={
                showErrors && !formaPago
                  ? "Seleccione un método de pago"
                  : undefined
              }
            />
          </View>
          {requiresRate && (
            <>
              <View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-lg font-bold text-foreground dark:text-dark-foreground ">
                    Tasa autorizada
                  </Text>

                  <Text className="text-xs text-primary dark:text-dark-primary font-medium">
                    (Requerida)
                  </Text>
                </View>
                <RateInput value={tasa} onChangeValue={setTasa} />
              </View>
            </>
          )}

          {showSingleItemAmountInput && requiresRate && (
            <View>
              <Text className="text-lg font-bold text-foreground dark:text-dark-foreground ">
                Monto autorizado
              </Text>
              <CustomTextInput
                value={
                  customAuthorizedAmount
                    ? totalVenezuela(customAuthorizedAmount)
                    : ""
                }
                onChangeText={setCustomAuthorizedAmount}
                placeholder={totalVenezuela(suggestedAmount) || "Ingrese monto"}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {/* Details */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4">
          <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
            <Text className="text-primary dark:text-dark-primary font-bold">
              {expanded ? "Ocultar detalle" : `Ver detalle (${items.length})`}
            </Text>
          </TouchableOpacity>

          <Animated.View style={expandStyle} className="overflow-hidden">
            <FlatList
              data={items}
              keyExtractor={(i) => String(i.numerodocumento)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="py-3 border-b border-muted dark:border-dark-mutedForeground last:border-0">
                  <Text className="font-semibold text-foreground dark:text-dark-foreground">
                    {item.beneficiario}
                  </Text>
                  <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground mt-1">
                    {item.observacion}
                  </Text>
                  <Text className="text-sm text-right font-bold text-primary dark:text-dark-primary mt-2">
                    {totalVenezuela(Number(item.montosaldo))} {item.moneda}
                  </Text>
                </View>
              )}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="pb-4 gap-3">
        <TouchableOpacity
          className={`rounded-xl py-4 bg-primary dark:bg-dark-primary ${(!isValid || isLoading) && "opacity-50"}`}
          disabled={!isValid || isLoading}
          onPress={handleAuthorize}
        >
          <Text className="text-white text-center font-bold">
            {isLoading ? "Procesando..." : `Autorizar (${items.length})`}
          </Text>
        </TouchableOpacity>

        {isAuth && (
          <TouchableOpacity
            className="rounded-xl py-4 border border-primary dark:border-dark-primary"
            onPress={onClose}
          >
            <Text className="text-primary dark:text-dark-primary text-center font-bold">
              Desautorizar
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

import CustomPicker from "@/components/inputs/CustomPicker";
import RateInput from "@/components/inputs/RateInput";
import BottomModal from "@/components/ui/BottomModal";
import { useSuccessOverlayStore } from "@/stores/useSuccessOverlayStore";
import {
  currencyDollar,
  currencyVES,
  totalVenezuela,
} from "@/utils/moneyFormat";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AuthPay } from "../types/AuthPay";
import { MethodPay } from "../types/MethodPay";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: AuthPay[];
  methods: MethodPay[];
  onAuthorize: () => void;
}

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

  const showSuccess = useSuccessOverlayStore((s) => s.show);

  useEffect(() => {
    if (visible) {
      setFormaPago("");
      setTasa(1);
      setExpanded(false);
      setShowErrors(false);
      setIsLoading(false);
    }
  }, [visible]);

  const currentMethod = methods.find(
    (m) => String(m.codigounico) === formaPago
  );

  const targetCurrency = currentMethod?.monedapago;

  const hasUSD = items.some((i) => i.moneda === "USD");
  const hasVED = items.some((i) => i.moneda === "VED");

  // 🔴 REGLA FINAL
  const requiresRate = !(
    (targetCurrency === "USD" && hasUSD && !hasVED) ||
    (targetCurrency === "VED" && hasVED && !hasUSD)
  );

  const isValid = !!formaPago && (!requiresRate || (tasa > 0 && !isNaN(tasa)));

  // ===== TOTALES =====
  const totals = useMemo(() => {
    let ved = 0;
    let usd = 0;

    items.forEach((i) => {
      const monto = Number(i.montosaldo);

      if (i.moneda === "VED") {
        ved += monto;
        usd += tasa > 0 ? monto / tasa : 0;
      } else {
        usd += monto;
        ved += tasa > 0 ? monto * tasa : 0;
      }
    });

    const totalFinal = targetCurrency === "USD" ? usd : ved;

    return { ved, usd, totalFinal };
  }, [items, tasa, targetCurrency]);

  const handleAuthorize = async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    try {
      setIsLoading(true);
      await onAuthorize();

      showSuccess({
        title: "Pagos autorizados",
        subtitle: `${items.length} documentos procesados`,
      });

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible || items.length === 0) return null;

  return (
    <BottomModal
      visible={visible}
      onClose={isLoading ? () => {} : onClose}
      heightPercentage={0.85}
    >
      <ScrollView className="flex-1 px-3" keyboardShouldPersistTaps="handled">
        {/* ===== HEADER ===== */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>

          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-muted-foreground">
              {items.length} documentos seleccionados
            </Text>

            {targetCurrency && (
              <View className="px-3 py-1 rounded-full bg-primary/10">
                <Text className="text-xs font-bold text-primary">
                  Pago en {targetCurrency}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ===== RESUMEN ===== */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-3 gap-2">
          <View className="flex-row justify-between">
            <Text>Total VED</Text>
            <Text>
              {totalVenezuela(totals.ved)} {currencyVES}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text>Total USD</Text>
            <Text>
              {totalVenezuela(totals.usd)} {currencyDollar}
            </Text>
          </View>

          <View className="flex-row justify-between border-t pt-3 mt-2">
            <Text className="text-xl font-bold">Total a pagar</Text>
            <Text className="text-2xl font-bold text-primary">
              {totalVenezuela(totals.totalFinal)} {targetCurrency ?? "—"}
            </Text>
          </View>

          {requiresRate && (
            <View className="mt-2 px-3 py-1 rounded-lg bg-error/10">
              <Text className="text-xs text-error font-semibold">
                ⚠️ Tasa obligatoria para este pago
              </Text>
            </View>
          )}
        </View>

        {/* ===== MÉTODO Y TASA ===== */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4 gap-3">
          <CustomPicker
            selectedValue={formaPago}
            onValueChange={setFormaPago}
            items={methods.map((m) => ({
              label: m.textList,
              value: String(m.codigounico),
            }))}
            placeholder="Método de pago"
            error={
              showErrors && !formaPago
                ? "Seleccione un método de pago"
                : undefined
            }
          />

          {requiresRate ? (
            <>
              <RateInput value={tasa} onChangeValue={setTasa} />
              <Text className="text-xs text-error">
                Tasa obligatoria para conversión
              </Text>
            </>
          ) : (
            <View className="px-3 py-2 rounded-xl bg-muted/30">
              <Text className="text-xs text-muted-foreground">
                No se requiere tasa
              </Text>
            </View>
          )}
        </View>

        {/* ===== DETALLE ===== */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4">
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text className="text-primary font-bold">
              {expanded ? "Ocultar detalle" : `Ver detalle (${items.length})`}
            </Text>
          </TouchableOpacity>

          {expanded &&
            items.map((i, idx) => {
              const ved =
                i.moneda === "VED"
                  ? Number(i.montosaldo)
                  : Number(i.montosaldo) * tasa;

              const usd =
                i.moneda === "USD"
                  ? Number(i.montosaldo)
                  : Number(i.montosaldo) / tasa;

              return (
                <View key={idx} className="py-2 border-b border-muted">
                  <Text className="font-semibold">{i.beneficiario}</Text>
                  <Text className="text-xs">{i.observacion}</Text>

                  <View className="flex-row justify-end mt-1">
                    <Text className="text-xs text-primary">
                      {totalVenezuela(ved)} {currencyVES}
                    </Text>
                    <Text className="text-xs ml-2">
                      / {totalVenezuela(usd)} {currencyDollar}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* ===== ACCIONES ===== */}
      <View className="px-4 pb-4 gap-2">
        <TouchableOpacity
          className={`rounded-xl py-3 ${
            isValid ? "bg-primary" : "bg-gray-400"
          }`}
          disabled={isLoading}
          onPress={handleAuthorize}
        >
          <Text className="text-white text-center font-bold">
            {isLoading ? "Procesando..." : `Autorizar (${items.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl py-3 bg-error"
          onPress={onClose}
        >
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
}

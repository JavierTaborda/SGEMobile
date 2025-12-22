import CustomPicker from "@/components/inputs/CustomPicker";
import RateInput from "@/components/inputs/RateInput";
import BottomModal from "@/components/ui/BottomModal";
import { useSuccessOverlayStore } from "@/stores/useSuccessOverlayStore";
import {
  currencyDollar,
  currencyVES,
  totalVenezuela,
} from "@/utils/moneyFormat";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthPay } from "../types/AuthPay";
import { MethodPay } from "../types/MethodPay";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: AuthPay[];
  methods: MethodPay[];
  onAuthorize: () => Promise<void>;
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

  /*  RESET  */
  useEffect(() => {
    if (!visible) return;

    const found = items.find(
      (f) => f.tasacambio !== undefined && f.tasacambio !== null
    );

    const parsed = found ? Number(found.tasacambio) : 1;

    setFormaPago("");
    setTasa(!isNaN(parsed) && isFinite(parsed) ? parsed : 1);
    setExpanded(false);
    setShowErrors(false);
    setIsLoading(false);
  }, [visible, items]);

  /*  DERIVED STATE  */
  const derived = useMemo(() => {
    let hasUSD = false;
    let hasVED = false;
    let isAuth = false;
    let fallbackCurrency: string | undefined;

    for (const i of items) {
      if (i.moneda === "USD") hasUSD = true;
      if (i.moneda === "VED") hasVED = true;
      if (i.autorizadopagar === "1") isAuth = true;
      if (!fallbackCurrency && i.moneda) fallbackCurrency = i.moneda;
    }

    const currentMethod = methods.find(
      (m) => String(m.codigounico) === formaPago
    );

    const targetCurrency = currentMethod?.monedapago ?? fallbackCurrency;

    const requiresRate = !(
      (targetCurrency === "USD" && hasUSD && !hasVED) ||
      (targetCurrency === "VED" && hasVED && !hasUSD)
    );

    return {
      targetCurrency,
      requiresRate,
      isAuth,
    };
  }, [items, methods, formaPago]);

  const { targetCurrency, requiresRate, isAuth } = derived;

  const isValid = !!formaPago && (!requiresRate || (tasa > 0 && !isNaN(tasa)));

  /*  TOTALS  */
  const totals = useMemo(() => {
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

    return {
      ved,
      usd,
      totalFinal: targetCurrency === "USD" ? usd : ved,
    };
  }, [items, tasa, targetCurrency]);

  /*  HANDLERS  */
  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const handleAuthorize = useCallback(async () => {
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
  }, [isValid, onAuthorize, items.length, onClose, showSuccess]);


  if (!visible || items.length === 0) return null;

  /* RENDER */
  return (
    <BottomModal
      visible={visible}
      onClose={isLoading ? () => {} : onClose}
      heightPercentage={0.85}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>

          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-muted-foreground dark:text-dark-mutedForeground">
              {items.length} documentos seleccionados
            </Text>

            {targetCurrency && (
              <View className="px-3 py-1 rounded-full bg-primary/10">
                <Text className="text-xs font-bold text-primary dark:text-dark-primary">
                  Pago en {targetCurrency}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* TOTAL */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-3">
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
              Monto a autorizar
            </Text>
            <Text className="text-xl font-extrabold text-primary dark:text-dark-primary">
              {totalVenezuela(totals.totalFinal)} {targetCurrency ?? "—"}
            </Text>
          </View>

          {requiresRate && (
            <View className="mt-2 px-3 py-1 rounded-lg bg-error/10 dark:bg-dark-error/10">
              <Text className="text-xs text-error dark:text-dark-error font-semibold">
                Tasa obligatoria para este pago
              </Text>
            </View>
          )}
        </View>

        {/* MÉTODO + TASA */}
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
              <Text className="text-xs text-error dark:text-dark-error">
                Tasa obligatoria para conversión
              </Text>
            </>
          ) : (
            <View className="px-3 py-2 rounded-xl bg-muted/30 dark:bg-dark-muted/70">
              <Text className="text-xs text-muted-foreground dark:text-dark-mutedForeground">
                No se requiere tasa
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4">
          <TouchableOpacity onPress={toggleExpanded}>
            <Text className="text-primary dark:text-dark-primary font-bold">
              {expanded ? "Ocultar detalle" : `Ver detalle (${items.length})`}
            </Text>
          </TouchableOpacity>

          {expanded && (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.numerodocumento)}
              scrollEnabled={false}
              removeClippedSubviews
              renderItem={({ item }) => {
                const ved =
                  item.moneda === "VED"
                    ? Number(item.montosaldo)
                    : Number(item.montosaldo) * tasa;

                const usd =
                  item.moneda === "USD"
                    ? Number(item.montosaldo)
                    : Number(item.montosaldo) / tasa;

                return (
                  <View className="py-2 border-b border-muted dark:border-dark-background">
                    <Text className="font-semibold text-foreground dark:text-dark-foreground">
                      {item.beneficiario}
                    </Text>
                    <Text className="text-xs text-foreground dark:text-dark-foreground">
                      {item.observacion}
                    </Text>

                    <View className="flex-row justify-end mt-1">
                      <Text className="text-xs text-primary dark:text-dark-primary">
                        {totalVenezuela(ved)} {currencyVES}
                      </Text>
                      <Text className="text-xs text-foreground dark:text-dark-foreground ml-2">
                        / {totalVenezuela(usd)} {currencyDollar}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="pb-2 gap-2">
        <TouchableOpacity
          className={`rounded-xl py-3 ${
            isValid ? "bg-primary dark:bg-dark-primary " : "bg-gray-400"
          }`}
          disabled={isLoading}
          onPress={handleAuthorize}
        >
          <Text className="text-white text-center font-bold">
            {isLoading ? "Procesando..." : `Autorizar (${items.length})`}
          </Text>
        </TouchableOpacity>

        {isAuth && (
          <TouchableOpacity
            className="rounded-xl py-3 border border-primary dark:border-dark-primary"
            onPress={onClose}
          >
            <Text className="text-primary dark:text-dark-primary text-center font-bold">
              Desautorizar
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="rounded-xl py-3 bg-error dark:bg-dark-error"
          onPress={onClose}
        >
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
}

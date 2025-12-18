import CustomPicker from "@/components/inputs/CustomPicker";
import CustomTextInput from "@/components/inputs/CustomTextInput";
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

interface Props {
  visible: boolean;
  onClose: () => void;
  items: AuthPay[];
  onAuthorize: () => void;
}

export default function AuthPayModal({
  visible,
  onClose,
  items,
  onAuthorize,
}: Props) {
  const [tasa, setTasa] = useState<number>(0);
  const [amount, setAmount] = useState<string>("0");
  const [formaPago, setFormaPago] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const showSuccess = useSuccessOverlayStore((s) => s.show);
  useEffect(() => {
    if (visible) {
      setFormaPago("");
      setIsLoading(false);
      setShowErrors(false);
    }
  }, [visible]);

  useEffect(() => {
    const { totalVedToUsd, totalUsdToVed } = calculateAmount();

    if (formaPago === "USD") {
      setAmount(totalVedToUsd.toFixed(2));
    } else if (formaPago === "VED") {
      setAmount(totalUsdToVed.toFixed(2));
    } else {
      setAmount("0");
    }
  }, [tasa, formaPago, items]);
  const calculateAmount = () => {
    return items.reduce(
      (acc, i) => {
        const monto = Number(i.montosaldo);

        if (i.moneda === "VED") {
          acc.totalVedToUsd += tasa > 0 ? monto / tasa : 0;
        }

        if (i.moneda === "USD") {
          acc.totalUsdToVed += tasa > 0 ? monto * tasa : 0;
        }

        return acc;
      },
      { totalVedToUsd: 0, totalUsdToVed: 0 }
    );
  };
  const totalVed = useMemo(
    () =>
      items
        .filter((p) => p.moneda === "VED")
        .reduce((sum, p) => sum + Number(p.montosaldo), 0),
    [items]
  );

  const totalUSD = useMemo(
    () =>
      items
        .filter((p) => p.moneda === "USD")
        .reduce((sum, p) => sum + Number(p.montosaldo), 0),
    [items]
  );

  const isValid = formaPago !== "" && tasa > 0;

  if (!visible || items.length === 0) return null;

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
        subtitle: `${items.length} documentos aprobados`,
      });

      onClose();
    } catch (e) {

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomModal
      visible={visible}
      onClose={isLoading ? () => {} : onClose}
      heightPercentage={0.85}
    >
      <ScrollView className="flex-1 px-3" keyboardShouldPersistTaps="handled">
        <View className="gap-2 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Autorización de pagos
          </Text>

          <Text className="text-sm text-muted-foreground">
            Documentos seleccionados: {items.length}
          </Text>

          <Text className="text-xl font-bold text-primary">
            Total VED: {totalVenezuela(totalVed)} {currencyVES}
          </Text>
          <Text className="text-xl font-bold text-primary">
            Total USD: {totalVenezuela(totalUSD)} {currencyDollar}
          </Text>
        </View>

        <View className="gap-3 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4">
          <CustomPicker
            selectedValue={formaPago}
            onValueChange={setFormaPago}
            items={[
              { label: "USD - Banco", value: "USD" },
              { label: "EUR - Banco", value: "EUR" },
              { label: "VED - Banco", value: "VED" },
            ]}
            placeholder="Seleccione moneda"
            error={
              showErrors && !formaPago
                ? "Seleccione una forma de pago"
                : undefined
            }
          />

          <RateInput value={tasa} onChangeValue={setTasa} />

          <CustomTextInput
            placeholder="Monto autorizado"
            value={totalVenezuela(amount)}
            onChangeText={setAmount}
            editable={false}
          />
        </View>
      </ScrollView>

      <View className="px-4 pb-6 gap-2">
        <TouchableOpacity
          className={`rounded-xl py-3 mt-2 flex-row justify-center items-center ${isValid ? "bg-primary dark:bg-dark-primary" : "bg-gray-400"}`}
          disabled={isLoading}
          onPress={handleAuthorize}
        >
          <Text className="text-center text-lg text-white font-bold">
            {isLoading ? "Autorizando..." : `Autorizar (${items.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`rounded-xl py-3 mt-2 flex-row justify-center items-center bg-amber-500 dark:bg-dark-accent-light`}
          onPress={handleAuthorize}
        >
          <Text className="text-center text-lg text-white font-bold">
            Desautorizar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`rounded-xl py-3 mt-2 flex-row justify-center items-center bg-error dark:bg-dark-error`}
          onPress={onClose}
        >
          <Text className="text-center text-lg text-white font-bold">
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </BottomModal>
  );
}

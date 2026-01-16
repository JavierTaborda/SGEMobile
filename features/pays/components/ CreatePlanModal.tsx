import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import CustomTextInput from "@/components/inputs/CustomTextInput";
import BottomModal from "@/components/ui/BottomModal";
import { BlurView } from "expo-blur";

import { useOverlayStore } from "@/stores/useSuccessOverlayStore";
import { totalVenezuela } from "@/utils/moneyFormat";
import { PlanificacionPago } from "../interfaces/PlanificacionPagos";
import type { PlanPagos } from "../interfaces/PlanPagos";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: PlanPagos[];
  createPlan: (documents: PlanificacionPago) => Promise<boolean>;
}

export default function AuthPayModal({
  visible,
  onClose,
  items,
  createPlan,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const [planificacion, setPlanificacionPago] = useState<PlanificacionPago>({
    descripcion: "",
    date: new Date(),
    items,
  });
  const overlay = useOverlayStore();

  const handleCreatePlan = async () => {
    setIsLoading(true);
    try {
      const success = await createPlan(planificacion);
      if (success) {
        onClose();
        overlay.show("success", {
          title: "Plan creado",
          subtitle: "Se ha creado el plan #N exitosamente.",
        });
      } else {
        overlay.show("error", {
          title: "No se logro crear el plan",
          subtitle: "SNo se ha creado el plan",
        });
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const result = useMemo(() => {
    return Object.entries(
      items.reduce<Record<string, Record<string, number>>>((acc, pay) => {
        const monto = Number(pay.montoautorizado);

        if (!monto || monto <= 0) return acc;

        const empresa = pay.empresa ?? "SIN EMPRESA";
        const banco = pay.bancopagador ?? "SIN BANCO";
        const moneda = pay.monedaautorizada ?? "SIN MONEDA";

        const keyBanco = `${empresa} - ${banco}`;

        if (!acc[keyBanco]) acc[keyBanco] = {};
        acc[keyBanco][moneda] = (acc[keyBanco][moneda] || 0) + monto;

        return acc;
      }, {})
    )
      .map(([banco, monedas]) => ({
        banco,
        monedas: Object.entries(monedas)
          .filter(([, total]) => total > 0)
          .map(([moneda, total]) => ({
            moneda,
            total,
          })),
      }))
      .filter((item) => item.monedas.length > 0);
  }, [items]);

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <ScrollView contentContainerClassName="gap-4 pt-2 pb-6">
        <View className="gap-2">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Descripción
          </Text>

          <CustomTextInput
            placeholder="Descripción del plan"
            value={planificacion.descripcion}
            onChangeText={(text) =>
              setPlanificacionPago({ ...planificacion, descripcion: text })
            }
            numberOfLines={3}
            multiline
          />
        </View>

        <View className="gap-2">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Fecha
          </Text>

          <Pressable
            className="border border-gray-300 dark:border-gray-600 rounded-xl p-3"
            onPress={() => setDateModalVisible(true)}
          >
            <Text className="text-base text-foreground dark:text-dark-foreground">
              {planificacion.date.toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </Pressable>
        </View>

        <View className="gap-3">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Resumen
          </Text>

          {result.length === 0 && (
            <View className="items-center py-6">
              <Text className="text-muted-foreground dark:text-dark-muted-foreground">
                No hay montos válidos para planificar
              </Text>
            </View>
          )}

          {result.map((item) => (
            <View
              key={item.banco}
              className="bg-componentbg dark:bg-dark-componentbg rounded-xl p-4"
            >
              <Text className="font-bold text-base text-foreground dark:text-dark-foreground mb-2">
                {item.banco}
              </Text>

              {item.monedas.map((m) => (
                <View
                  key={m.moneda}
                  className="flex-row justify-between items-center py-1"
                >
                  <Text className="text-muted-foreground dark:text-dark-muted-foreground">
                    {m.moneda}
                  </Text>

                  <Text className="font-bold text-foreground dark:text-dark-foreground">
                    {totalVenezuela(m.total)} {m.moneda === "VED" ? "Bs" : "$"}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {Platform.OS === "ios" && (
        <Modal visible={dateModalVisible} transparent animationType="fade">
          <BlurView
            intensity={50}
            tint="dark"
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View className="bg-componentbg dark:bg-dark-componentbg p-4 rounded-t-2xl">
              <DateTimePicker
                value={planificacion.date}
                mode="date"
                minimumDate={new Date()}
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setPlanificacionPago({
                      ...planificacion,
                      date: selectedDate,
                    });
                  }
                }}
              />

              <View className="flex-row justify-between mt-4">
                <Pressable
                  className="px-6 py-3 rounded-lg bg-error"
                  onPress={() => setDateModalVisible(false)}
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </Pressable>

                <Pressable
                  className="px-6 py-3 rounded-lg bg-primary dark:bg-dark-primary"
                  onPress={() => setDateModalVisible(false)}
                >
                  <Text className="text-white font-bold">Confirmar</Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Modal>
      )}

      {Platform.OS === "android" && dateModalVisible && (
        <DateTimePicker
          value={planificacion.date}
          mode="date"
          display="calendar"
          minimumDate={new Date()}
          onChange={(_, selectedDate) => {
            setDateModalVisible(false);
            if (selectedDate) {
              setPlanificacionPago({
                ...planificacion,
                date: selectedDate,
              });
            }
          }}
        />
      )}

      <View className="pt-4 gap-y-3">
        <Pressable
          className="py-4 rounded-xl items-center bg-primary dark:bg-dark-primary"
          disabled={isLoading}
          onPress={handleCreatePlan}
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Procesando..." : "Establecer definitivo"}
          </Text>
        </Pressable>

        <Pressable
          className={`py-4 rounded-xl border items-center ${
            isLoading
              ? "border-primary/40 dark:border-dark-primary/40"
              : "border-primary dark:border-dark-primary"
          }`}
          disabled={isLoading}
        >
          <Text
            className={`font-bold text-base ${
              isLoading
                ? "text-primary/50"
                : "text-primary dark:text-dark-primary"
            }`}
          >
            Descartar definitivo
          </Text>
        </Pressable>

        <Pressable className="rounded-xl py-4 bg-error" onPress={onClose}>
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </Pressable>
      </View>
    </BottomModal>
  );
}

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomTextInput from "@/components/inputs/CustomTextInput";
import { BlurView } from "expo-blur";

import { useOverlayStore } from "@/stores/useSuccessOverlayStore";
import { totalVenezuela } from "@/utils/moneyFormat";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CreatePlanResponse } from "../interfaces/CreatePlanResponse";
import { PlanificacionPago } from "../interfaces/PlanificacionPagos";
import type { PlanPagos } from "../interfaces/PlanPagos";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: PlanPagos[];
  createPlan: (documents: PlanificacionPago) => Promise<CreatePlanResponse>;
}
const { height, width } = Dimensions.get("window");
export default function AuthPayModal({
  visible,
  onClose,
  items,
  createPlan,
}: Props) {
  if (!visible) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const dateDefault = new Date();

  const formattedDate = dateDefault.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const defaultDesc = `PLANIFICACIÓN DE PAGO AL ${formattedDate}`;

  const [planificacion, setPlanificacionPago] = useState<PlanificacionPago>({
    descripcionplan: defaultDesc,
    unidad: "",
    empresa: "",
    owneruser: 0,
    planpagonumero: 0,
    totalnetobsd: 0,
    totalnetousd: 0,
    totalsaldobsd: 0,
    totalsaldousd: 0,
    totalautorizadobsd: 0,
    totalautorizadousd: 0,
    totalpagadobsd: 0,
    totalpagadousd: 0,
    totalxpagarbsd: 0,
    totalxpagarusd: 0,
    generadotxt: false,
    conciliadopago: false,
    fechapagoautorizada: dateDefault,
    items,
  });

  const [tempDate, setTempDate] = useState(planificacion.fechapagoautorizada);

  const overlay = useOverlayStore();

  const handleCreatePlan = async () => {
    if (!planificacion.descripcionplan.trim()) {
      overlay.show("warning", {
        title: "Atención",
        subtitle: "La descripción del plan es requerida.",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const planConTotales: PlanificacionPago = {
        ...planificacion,
      };

      const success = await createPlan(planConTotales);

      if (success.success) {
        onClose();
        overlay.show("success", {
          title: `Plan ${success.planpagonumero} creado`,
          subtitle: "Se ha creado el plan exitosamente.",
        });
      } else {
        overlay.show("error", {
          title: "No se logró crear el plan",
          subtitle: "Intenta nuevamente.",
        });
      }
    } catch {
      overlay.show("error", {
        title: "Error",
        subtitle: "Ocurrió un error al crear el plan.",
      });
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
      }, {}),
    )
      .map(([banco, monedas]) => ({
        banco,
        monedas: Object.entries(monedas)
          .filter(([, total]) => total > 0)
          .map(([moneda, total]) => ({ moneda, total })),
      }))
      .filter((item) => item.monedas.length > 0);
  }, [items]);

  const translateY = useSharedValue(visible ? 0 : height);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="absolute inset-0 z-50">
      <BlurView intensity={50} tint="dark" className="absolute inset-0">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={() => {
            if (!isLoading) onClose();
          }}
        />
      </BlurView>

      <Animated.View
        className="bg-background dark:bg-background  rounded-3xl"
        style={[
          {
            position: "absolute",

            bottom: 100,
            height: height * 0.7,
            width: "95%",
            padding: 16,
            alignSelf: "center",
          },
          animatedStyle,
        ]}
      >
        <ScrollView contentContainerClassName="gap-4 pt-2 pb-6">
          {/* Descripción */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
              Descripción
            </Text>

            <CustomTextInput
              placeholder="Descripción del plan"
              value={planificacion.descripcionplan}
              onChangeText={(text) =>
                setPlanificacionPago({
                  ...planificacion,
                  descripcionplan: text,
                })
              }
              numberOfLines={3}
              multiline
            />
          </View>

          {/* Fecha */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
              Fecha
            </Text>

            <Pressable
              className="border border-gray-300 dark:border-gray-600 rounded-xl p-4"
              onPress={() => {
                if (!isLoading) {
                  setTempDate(planificacion.fechapagoautorizada);
                  setDateModalVisible(true);
                }
              }}
            >
              <Text className="text-base text-foreground dark:text-dark-foreground">
                {planificacion.fechapagoautorizada.toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </Pressable>
          </View>

          {/* Resumen */}
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

                    <Text className="font-bold text-primary dark:text-dark-primary">
                      {totalVenezuela(m.total)}{" "}
                      {m.moneda === "VED" ? "Bs" : "$"}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Date picker iOS */}
        {Platform.OS === "ios" && (
          <Modal visible={dateModalVisible} transparent animationType="fade">
            <BlurView
              intensity={50}
              tint="dark"
              style={{ flex: 1, justifyContent: "flex-end" }}
            >
              <View className="bg-componentbg dark:bg-dark-componentbg p-4 rounded-t-2xl">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  minimumDate={new Date()}
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) setTempDate(selectedDate);
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
                    onPress={() => {
                      setPlanificacionPago({
                        ...planificacion,
                        fechapagoautorizada: tempDate,
                      });
                      setDateModalVisible(false);
                    }}
                  >
                    <Text className="text-white font-bold">Confirmar</Text>
                  </Pressable>
                </View>
              </View>
            </BlurView>
          </Modal>
        )}

        {/* Android picker */}
        {Platform.OS === "android" && dateModalVisible && (
          <DateTimePicker
            value={planificacion.fechapagoautorizada}
            mode="date"
            display="calendar"
            minimumDate={new Date()}
            onChange={(_, selectedDate) => {
              setDateModalVisible(false);
              if (selectedDate) {
                setPlanificacionPago({
                  ...planificacion,
                  fechapagoautorizada: selectedDate,
                });
              }
            }}
          />
        )}

        {/* Botones */}
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
            className="py-4 rounded-xl border items-center border-primary dark:border-dark-primary"
            disabled={isLoading}
          >
            <Text className="font-bold text-base text-primary dark:text-dark-primary">
              Descartar definitivo
            </Text>
          </Pressable>

          <Pressable
            className="rounded-xl py-4 bg-error"
            disabled={isLoading}
            onPress={() => {
              if (!isLoading) onClose();
            }}
          >
            <Text className="text-white text-center font-bold">Cancelar</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

import ClientModal from "@/components/inputs/ClientModal";
import CustomTextInput from "@/components/inputs/CustomTextInput";
import ExchangeInput from "@/components/inputs/ExchangeInput";
import BottomModal from "@/components/ui/BottomModal";
import { useThemeStore } from "@/stores/useThemeStore";
import { ClientData } from "@/types/clients";
import { appTheme } from "@/utils/appTheme";
import { safeHaptic } from "@/utils/safeHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import ExchangeRateBadge from "../components/ExchangeRateBadge";
import OrderSummaryList from "../components/OrderSummaryList";
import TotalView from "../components/TotalView";
import useCreateOrder from "../hooks/useCreateOrder";
import { useOrderTotals } from "../hooks/useOrderTotals";
import { PedidoDTO } from "../interfaces/pedidoDTO";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import { Conditions } from "../types/conditions";
import { calculateTotals } from "../utils/calculateTotals";

export default function OrderSummaryScreen() {
  const { clients } = useLocalSearchParams<{ clients?: string }>();
  const { options } = useLocalSearchParams<{ options?: string }>();
  const parsedClients: ClientData[] = clients ? JSON.parse(clients) : [];
  const parsedOptions: Conditions[] = options ? JSON.parse(options) : [];

  const router = useRouter();
  const [isFacturable, setIsFacturable] = useState(false);

  const { isDark } = useThemeStore();
  const createOrderData = useCreateOrder("");

  const { items, exchangeRate, IVA } = useCreateOrderStore();

  const { totalGross, total, TotalIVA, totalWithIVA, discountAmount } =
    useOrderTotals(items);

  //INPUT STATES
  const [direction, setDirection] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [selected, setSelected] = useState<string>(
    parsedOptions.length > 0 ? parsedOptions[0].cond_des : ""
  );
  const [email, setEmail] = useState<string>("");

  // Customer Data
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const isEmpty = items.length === 0;
  const [showClientModal, setShowClientModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  const handleClientSelectPress = useCallback(() => {
    setShowClientModal(true);
  }, []);

  const handleswitch = (val: boolean) => {
    setIsFacturable(val);

    if (!val) {
      // No Facturable
      if (comment.startsWith("**")) {
        setComment(comment.replace("**", ""));
      }
    } else {
      // Facturable
      if (!comment.startsWith("**")) setComment("**" + comment);
    }
    //
  };

  useEffect(() => {
    if (comment.startsWith("**") && !isFacturable) {
      setIsFacturable(true);
      return;
    }

    if (!comment.startsWith("**") && isFacturable) {
      setIsFacturable(false);
      return;
    }
  }, [comment]);

  useEffect(() => {
    setDirection(selectedClient?.dir_ent2?.trim() || "");
    setEmail(selectedClient?.email?.trim() || "");

  }, [selectedClient]);
 
  const buildPedido = (): PedidoDTO => {
    const fact_num = Date.now(); 
    // generate totals
    const totals = items.reduce(
      (acc, item) => {
        const { subtotal, total, iva, totalGross } = calculateTotals(
          item.price,
          item.quantity ?? 1,
          item.discount ?? "",
          IVA
        );

        acc.tot_bruto += subtotal;
  
        acc.tot_iva += iva;
        acc.tot_neto += total;

        return acc;
      },
      { tot_bruto: 0, tot_iva: 0, tot_neto: 0 }
    );

    return {
      fact_num,

      // cliente + info general
      contrib: isFacturable,
      comentario: comment,
      dir_ent: direction,
      co_cli: selectedClient?.co_cli ,
      nombre: selectedClient?.cli_des ,
      //rif: selectedClient?.rif ?? null,
      forma_pag: selected,
      //telefono: selectedClient?.telefonos ?? null,

      tot_bruto: totals.tot_bruto,
      iva: totals.tot_iva,
      tot_neto: totals.tot_neto,

      
      fec_emis: new Date().toISOString(),
      fec_venc: new Date().toISOString(),

      // ----------- MONEDA ----------- //
      moneda: "USD",
      tasa: exchangeRate?.tasa_v,

      // ----------- ITEMS ----------- //
      reng_ped: items.map((item, index) => {
        const { subtotal, total, iva, finalUnitPrice } =
          calculateTotals(item.price, item.quantity ?? 1, item.discount ?? "",IVA);

        return {
          fact_num,
          reng_num: index + 1,

          co_art: item.codart,
          des_art: item.artdes,

          stotal_art: subtotal,
          total_art: total, //
          reng_neto: total, // total + IVA
          imp_prod: iva, // IVA del ítem

          cant_prod: item.quantity,
          prec_vta: finalUnitPrice, // con descuento aplicado
          unidad: "0001  ",

        
          pendiente: item.quantity,
        };
      }),
    };
  };

  type ConditionsProps={
    option: Conditions;
    isActive: boolean;
    onPress: () => void;
  }
  const ConditionChip = ({ option, isActive, onPress }: ConditionsProps) => (
    <TouchableOpacity
      key={option.co_cond}
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1 px-4 ms-1 py-2 rounded-full ${
        isActive
          ? "bg-primary dark:bg-dark-primary"
          : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <Ionicons
        name={isActive ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={isActive ? "#fff" : "#555"}
      />
      <Text
        className={`font-semibold ${
          isActive ? "text-white" : "text-foreground dark:text-dark-foreground"
        }`}
      >
        {option.cond_des.trim()}
      </Text>
    </TouchableOpacity>
  );

  if (isEmpty) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300).easing(Easing.inOut(Easing.quad))}
        className="flex-1 items-center justify-center bg-background dark:bg-dark-background px-4"
      >
        <Text className="text-foreground dark:text-dark-foreground text-lg text-center">
          No hay artículos en el pedido. Agrega artículos para continuar.
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push("/(main)/(tabs)/(createOrder)/create-order")
          }
          className="flex-row mt-4 px-6 py-3  rounded-full bg-primary dark:bg-dark-primary"
        >
          <Ionicons name="bag-add" size={24} color="white" />
          <Text className="text-white font-bold py-1"> Agregar artículos</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  return (
    <View className="flex-1 bg-primary dark:bg-dark-primary">
      <View className="flex-1 bg-background dark:bg-dark-background rounded-t-3xl">
        <View className="px-6 pt-4">
          <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground">
            Detalles del pedido
          </Text>
        </View>
        <ScrollView
          className="px-4 pt-2"
          contentContainerStyle={{ paddingBottom: 240 }}
        >
          <View className="mb-4 p-4 bg-componentbg dark:bg-dark-componentbg rounded-xl gap-y-3">
            <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
              Cliente
            </Text>
            <TouchableOpacity
              onPress={() => setShowClientModal(true)}
              className="flex-row items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-xl"
            >
              <Text className="text-foreground dark:text-dark-foreground">
                {selectedClient
                  ? `${selectedClient.co_cli.trim()} - ${selectedClient.cli_des.trim()}`
                  : "Seleccionar cliente..."}
              </Text>

              <Ionicons name="chevron-down" size={20} color="gray" />
            </TouchableOpacity>
            <View>
              <View className="mb-2">
                <View className="flex-row">
                <Text className="text-md font-medium text-foreground dark:text-dark-foreground">
                  Condición de pago 
                </Text>
                {selected && (
                  <Text className="text-md ml-2 font-semibold text-primary dark:text-dark-primary">
                    {selected}
                  </Text>
                )}</View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row gap-3 pt-"
              >
                {parsedOptions.map((option) => (
                  <ConditionChip
                    key={option.co_cond}
                    option={option}
                    isActive={selected === option.cond_des}
                    onPress={() => {
                      safeHaptic("light");
                      setSelected(option.cond_des);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
            <View>
              <Text className="text-md font-medium text-foreground dark:text-dark-foreground mb-2">
                Dirección de entrega
              </Text>

              <CustomTextInput
                placeholder="Escribe la dirección de entrega"
                value={direction}
                onChangeText={setDirection}
                multiline
                numberOfLines={3}
              />
            </View>

            <View>
              <Text className="text-md font-medium text-foreground dark:text-dark-foreground mb-2">
                Comentario
              </Text>
              <CustomTextInput
                placeholder="Comentario"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="px-1 mb-1">
              <Text className="text-md font-medium text-foreground dark:text-dark-foreground mb-2">
                Facturar
              </Text>
              <View className="w-[50] h-[35]  justify-center">
                <Switch
                  value={isFacturable}
                  onValueChange={(val) => {
                    handleswitch(val);
                    Platform.OS === "android" ? safeHaptic("soft") : null;
                  }}
                  {...(Platform.OS === "android"
                    ? {
                        thumbColor: isFacturable
                          ? isDark
                            ? appTheme.dark.tertiary.DEFAULT
                            : appTheme.tertiary.DEFAULT
                          : isDark
                            ? appTheme.dark.mutedForeground
                            : appTheme.muted,
                        trackColor: {
                          false: isDark
                            ? appTheme.dark.mutedForeground
                            : appTheme.muted,
                          true: isDark
                            ? appTheme.dark.tertiary.DEFAULT
                            : appTheme.tertiary.DEFAULT,
                        },
                      }
                    : {
                        trackColor: {
                          true: isDark
                            ? appTheme.dark.tertiary.DEFAULT
                            : appTheme.tertiary.DEFAULT,
                        },
                      })}
                />
              </View>
              <View>
                <Text className="text-md font-medium text-foreground dark:text-dark-foreground my-2">
                  Correo
                </Text>

                <CustomTextInput
                  placeholder="Correo"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>
          <View className="mb-4 bg-componentbg dark:bg-dark-componentbg px-4 py-2 rounded-xl">
            <Text className="text-md font-medium text-foreground dark:text-dark-foreground mb-2">
              Artículos
            </Text>
            <OrderSummaryList scrollEnabled={false} />
          </View>
          <TotalView
            total={total}
            totalWithIVA={totalWithIVA}
            TotalIVA={TotalIVA}
            exchangeRate={exchangeRate}
          />
        </ScrollView>
        <View className="flex-row gap-2 px-6 absolute z-50 bottom-36 left-0 right-0">
          <TouchableOpacity
            className="p-4 flex-1 items-center justify-center rounded-full shadow-lg  bg-primary dark:bg-dark-primary"
            onPress={() =>
              Alert.alert(
                "Confirmar pedido",
                "¿Estás seguro de confirmar el pedido?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                  {
                    text: "Confirmar",
                    onPress: async () => {
                      await createOrderData.createOrder();
                    },
                  },
                ]
              )
            }
          >
            <View className="flex-row gap-1 items-center">
              <Ionicons name="checkmark-sharp" size={24} color="white" />
              <Text className="text-lg font-semibold text-white">
                Confirmar
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/(main)/(tabs)/(createOrder)/create-order")
            }
            className={
              "p-4 rounded-full shadow-lg bg-primary dark:bg-dark-primary"
            }
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <ExchangeRateBadge
          exchangeRate={exchangeRate}
          onPress={() => setShowExchangeModal(true)}
        />

        <BottomModal
          visible={showClientModal}
          onClose={() => setShowClientModal(false)}
        >
          <ClientModal
            onClose={setShowClientModal}
            setSelectedClient={setSelectedClient}
            clients={parsedClients}
          />
        </BottomModal>
        <BottomModal
          visible={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          heightPercentage={0.385}
        >
          <ExchangeInput exchangeRate={exchangeRate} />
        </BottomModal>
      </View>
    </View>
  );
}

import CustomDateTimePicker from "@/components/inputs/CustomDateTimePicker";
import FilterModal from "@/components/ui/FilterModal";
import ScrollSelect from "@/components/ui/ScrollSelect";
import { appTheme } from "@/utils/appTheme";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Switch } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import {
  OrderFilters,
  OrderProcesado,
  OrderStatus,
  procesadosOptions,
  statusOptions,
} from "../types/OrderFilters";

interface OrderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  dataFilters: {
    zones: string[];
    sellers: string[];
    statusList: statusOptions[];
    procesadoslist:procesadosOptions[];
  };
  filters: OrderFilters;
  onApply: (newFilters: OrderFilters) => void;
  hasPermission: boolean;
}

export default function OrderFilterModal({
  visible,
  onClose,
  onApply,
  filters,
  dataFilters,
  hasPermission,
}: OrderFilterModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate
  );
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate);
  const [status, setStatus] = useState<OrderStatus>(filters.status);
  const [procesado, setProcesado] = useState<OrderProcesado>(filters.procesado);
  const [zone, setZone] = useState<string | undefined>(filters.zone);
  const [seller, setSeller] = useState<string | undefined>(filters.seller);
  const [anulado, setAnulado] = useState<boolean | undefined>(
    filters.cancelled
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  return (
    <FilterModal
      visible={visible}
      onClose={onClose}
      onApply={() =>
        onApply({
          startDate,
          endDate,
          status,
          procesado,
          zone,
          seller,
          cancelled: anulado,
        })
      }
      onClean={() => {
        setStartDate(undefined);
        setEndDate(undefined);
        setStatus(undefined);
        setProcesado(undefined);
        setZone(undefined);
        setSeller(undefined);
        setAnulado(undefined);
      }}
      title="Filtrar Pedidos"
    >
      <ScrollView
        showsVerticalScrollIndicator={true}
        className="bg-background dark:bg-dark-background px-4"
      >
        <View className="gap-2">
          {/* Fecha inicial */}
          <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
            Desde
          </Text>
          <TouchableOpacity
            className="bg-muted dark:bg-dark-muted p-3 rounded-xl mb-3"
            onPress={() => setShowStartPicker(true)}
          >
            <Text className="text-foreground dark:text-dark-foreground">
              {startDate ? startDate.toLocaleDateString() : "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <ShowDateIos onPress={() => setShowStartPicker(false)}>
              <CustomDateTimePicker
                value={startDate || new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setStartDate(selectedDate);
                }}
                onClose={() => setShowStartPicker(false)}
              />
            </ShowDateIos>
          )}

          {/* Fecha final */}
          <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
            Hasta
          </Text>
          <TouchableOpacity
            className="bg-muted dark:bg-dark-muted p-3 rounded-xl mb-3"
            onPress={() => setShowEndPicker(true)}
          >
            <Text className="text-foreground dark:text-dark-foreground">
              {endDate ? endDate.toLocaleDateString() : "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <ShowDateIos onPress={() => setShowEndPicker(false)}>
              <CustomDateTimePicker
                value={endDate || new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setEndDate(selectedDate);
                }}
                onClose={() => setShowEndPicker(false)}
              />
            </ShowDateIos>
          )}

          {/* Revisado */}
          <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
            Revisado
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {dataFilters.statusList.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`px-4 py-2 rounded-full border ${
                  status === opt.value
                    ? "bg-primary border-primary"
                    : "bg-transparent border-muted"
                }`}
                onPress={() => setStatus(opt.value)}
              >
                <Text
                  className={`text-sm ${
                    status === opt.value
                      ? "text-white"
                      : "text-foreground dark:text-dark-foreground"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
            Procesado
          </Text>
          {/* TODO: make a component*/}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {dataFilters.procesadoslist.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`px-4 py-2 rounded-full border ${
                  procesado === opt.value
                    ? "bg-primary border-primary"
                    : "bg-transparent border-muted"
                }`}
                onPress={() => setProcesado(opt.value)}
              >
                <Text
                  className={`text-sm ${
                    procesado === opt.value
                      ? "text-white"
                      : "text-foreground dark:text-dark-foreground"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
            Anulado
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            <Switch
              value={anulado === true}
              onValueChange={() => setAnulado(anulado ? undefined : true)}
              thumbColor={
                anulado
                  ? Platform.select({ android: appTheme.error })
                  : Platform.select({ android: appTheme.muted })
              }
              trackColor={{
                true: appTheme.error,
              }}
            />
          </View>

          {hasPermission && (
            <>
              <ScrollSelect
                label="Zona"
                selectedValue={zone}
                options={dataFilters.zones}
                onSelect={setZone}
              />

              <ScrollSelect
                label="Vendedor"
                selectedValue={seller}
                options={dataFilters.sellers}
                onSelect={setSeller}
              />
            </>
          )}
        </View>
      </ScrollView>
    </FilterModal>
  );
}

interface PropsShowDateIos {
  onPress: () => void;
  children: React.ReactNode;
}

export function ShowDateIos({ onPress, children }: PropsShowDateIos) {
  if (Platform.OS !== "ios") return <>{children}</>;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown.duration(150)}
      className="bg-componentbg dark:bg-dark-componentbg p-2 m-1 rounded-3xl shadow-inner"
    >
      {children}
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity onPress={onPress} className="px-4 py-2">
          <Text className="text-primary">Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

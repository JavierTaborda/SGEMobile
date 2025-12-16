import FilterModal from "@/components/ui/FilterModal";
import { appTheme } from "@/utils/appTheme";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Seller } from "../types/Seller";

interface GoalsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (
    selectedSellers: string[],
    selectedCategory: string | undefined,
    selectedUsedValue: string | undefined
  ) => void;
  sellers: Seller[];
  category: any[];
  selectedSellers: string[]; // selección inicial
  selectedCategory: string | undefined; // selección inicial
  usedValues: any[];
  seletedUsedValue: string | undefined;
  hasPermission: boolean;
  loading: boolean;
}

export default function GoalsFilterModal({
  visible,
  onClose,
  onApply,
  sellers,
  selectedSellers,
  category,
  selectedCategory,
  usedValues,
  seletedUsedValue,
  hasPermission,
  loading,
}: GoalsFilterModalProps) {
  // Estado interno del modal
  const [internalSelected, setInternalSelected] = useState<string[]>([]);

  // Cuando el modal se abre, cargamos la selección actual
  useEffect(() => {
    if (visible) {
      setInternalSelected(selectedSellers || []);
    }
  }, [visible, selectedSellers]);

  const handleSelect = (co_ven: string) => {
    setInternalSelected((prev) =>
      prev.includes(co_ven)
        ? prev.filter((id) => id !== co_ven)
        : [...prev, co_ven]
    );
  };
  const [internalCategory, setInternalCategory] = useState<string | undefined>(
    selectedCategory
  );
  const [internalUsedValue, setInternalUsedValue] = useState<
    string | undefined
  >(seletedUsedValue);

  useEffect(() => {
    if (visible) {
      setInternalSelected(selectedSellers || []);
      setInternalCategory(selectedCategory);
      setInternalUsedValue(seletedUsedValue);
    }
  }, [visible, selectedSellers, selectedCategory, seletedUsedValue]);

  const handleApply = () => {
    onApply(internalSelected, internalCategory, internalUsedValue);
  };

  const handleClean = () => {
    setInternalSelected([]);
    setInternalCategory(undefined);
    setInternalUsedValue(undefined);
  };

  return (
    <FilterModal
      visible={visible}
      onClose={onClose}
      onApply={handleApply}
      onClean={handleClean}
      title="Filtrar Metas de Venta"
    >
      <View className="bg-background dark:bg-dark-background px-4 mb-4">
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator color={appTheme.primary.DEFAULT} />
          </View>
        ) : sellers.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="text-muted-foreground text-center">
              No se encontraron vendedores disponibles.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
              Estado de uso
            </Text>
            <ScrollView
              contentContainerClassName="p-2 gap-2 mb-3"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {usedValues?.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() =>
                    setInternalUsedValue((prev) =>
                      prev === opt.value ? undefined : opt.value
                    )
                  }
                  className={`px-4 py-2 rounded-full border ${
                    internalUsedValue === opt.value
                      ? "bg-primary border-primary"
                      : "bg-transparent border-muted"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      internalUsedValue === opt.value
                        ? "text-white"
                        : "text-foreground dark:text-dark-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
              Categoría
            </Text>
            <ScrollView
              contentContainerClassName=" p-2 gap-2 mb-3"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {category?.map((opt) => (
                <TouchableOpacity
                  key={opt.codcat}
                  onPress={() =>
                    setInternalCategory((prev) =>
                      prev === opt.codcat ? undefined : opt.codcat
                    )
                  }
                  className={`px-4 py-2 rounded-full border ${
                    internalCategory === opt.codcat
                      ? "bg-primary border-primary"
                      : "bg-transparent border-muted"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      internalCategory === opt.codcat
                        ? "text-white"
                        : "text-foreground dark:text-dark-foreground"
                    }`}
                  >
                    {opt.catdes?.trim()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {hasPermission && (
              <>
                <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
                  Seleccione uno o más vendedores
                </Text>

                <View className="flex-row flex-wrap gap-3 mb-3 pt-2">
                  {sellers.map((seller) => (
                    <TouchableOpacity
                      key={seller.codven}
                      onPress={() => handleSelect(seller.codven)}
                      className={`px-4 py-2 rounded-full border ${
                        internalSelected.includes(seller.codven)
                          ? "bg-primary border-primary"
                          : "bg-transparent border-muted"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          internalSelected.includes(seller.codven)
                            ? "text-white"
                            : "text-foreground dark:text-dark-foreground"
                        }`}
                      >
                        {seller.vendes}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </FilterModal>
  );
}

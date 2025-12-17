import FilterModal from "@/components/ui/FilterModal";
import { useThemeStore } from "@/stores/useThemeStore";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";

type FilterModalProps = {
  onApply: (company: string, currency: string, authorized: boolean) => void;
  onClose: () => void;
  visible: boolean;
  selectedCompany: string;
  selectedCurrency: string;
  selectedAuthorized: boolean;

};

export default function PayFilterModal({
  onApply,
  onClose,
  visible,
}: FilterModalProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [company, setCompany] = useState("CYBERLUX");
  const [authorized, setAuthorized] = useState(false);
  const [currency, setCurrency] = useState("VED");

  const handleApply = () => {
    onApply(company, currency, authorized);
  };

  const handleClean = () => {
    setCompany("");
    setAuthorized(false);
    setCurrency("VED");
  };
  return (
        <FilterModal
          visible={visible}
          onClose={onClose}
          onApply={handleApply}
          onClean={handleClean}
          title="Filtrar Metas de Venta"
        >
      <ScrollView showsVerticalScrollIndicator className="mb-6">
        <Text
          className={`text-center text-lg font-bold mb-4 text-foreground dark:text-dark-foreground`}
        >
          Filtros
        </Text>
        <Text className={`mb-2 text-foreground dark:text-dark-foreground`}>
          Empresa:
        </Text>
        <View className="rounded mb-4 bg-componentbg dark:bg-dark-componentbg">
          <Picker
            selectedValue={company}
            onValueChange={setCompany}
            style={{ color: isDark ? "white" : "black" }}
          >
            <Picker.Item label="FRIGILUX" value="FRIGLUX" />
            <Picker.Item label="CYBERLUX" value="CYBERLUX" />
          </Picker>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-foreground dark:text-dark-foreground">
            Solo autorizados
          </Text>
          <Switch value={authorized} onValueChange={setAuthorized} />
        </View>
        <Text className="mb-2 text-foreground dark:text-dark-foreground">
          Moneda:
        </Text>
        <View className="rounded mb-4  bg-componentbg dark:bg-dark-componentbg">
          <Picker
            selectedValue={currency}
            onValueChange={setCurrency}
            style={{ color: isDark ? "white" : "black" }}
          >
            <Picker.Item label="VED (Bolívares)" value="VED" />
            <Picker.Item label="USD (Dólares)" value="USD" />
          </Picker>
        </View>
       
      </ScrollView>
    </FilterModal>
  );
}

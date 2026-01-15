import CustomPicker from "@/components/inputs/CustomPicker";
import FilterModal from "@/components/ui/FilterModal";
import ScrollSelect from "@/components/ui/ScrollSelect";
import { useThemeStore } from "@/stores/useThemeStore";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FilterData, SelectedFilters } from "../types/Filters";

type FilterModalProps = {
  onApply: (filters: SelectedFilters) => void;
  onClose: () => void;
  visible: boolean;
  filterData: FilterData;
  selectedFilters: SelectedFilters;
};

export default function PayFilterModal({
  onApply,
  onClose,
  visible,
  filterData,
  selectedFilters,
}: FilterModalProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [filters, setFilters] = useState<SelectedFilters>(selectedFilters);

  const handleApply = () => {
  
    onApply(filters);
    onClose()
  };

  const handleClean = () =>
    setFilters({
      selectedClaseGasto: "",
      selectedTipoProveedor: "",
      selectedCompany: "",
      selectedUnidad: "",
      selectedBeneficiario: "",
      selectedCurrency:"",
      selectedStatus:''
    });

  return (
    <FilterModal
      visible={visible}
      onClose={onClose}
      onApply={handleApply}
      onClean={handleClean}
      title="Filtrar Documentos"
    >
      <ScrollView showsVerticalScrollIndicator={false} className="px-2 mb-6">
        {/* Header UX */}

        <ScrollSelect
          label="Empresa"
          options={filterData.company}
          selectedValue={filters.selectedCompany}
          onSelect={(v) => setFilters({ ...filters, selectedCompany: v })}
        />
        <ScrollSelect
          label="Unidad"
          options={filterData.unidad}
          selectedValue={filters.selectedUnidad}
          onSelect={(v) => setFilters({ ...filters, selectedUnidad: v })}
        />

        <ScrollSelect
          label="Clase de gasto"
          options={filterData.claseGasto}
          selectedValue={filters.selectedClaseGasto}
          onSelect={(v) => setFilters({ ...filters, selectedClaseGasto: v })}
        />

        <ScrollSelect
          label="Moneda"
          options={filterData.currency}
          selectedValue={filters.selectedCurrency}
          onSelect={(v) => setFilters({ ...filters, selectedCurrency: v })}
        />
        <ScrollSelect
          label="Estado autorización"
          options={filterData.status}
          selectedValue={filters.selectedStatus}
          onSelect={(v) => setFilters({ ...filters, selectedStatus: v })}
        />

        <ScrollSelect
          label="Tipo de proveedor"
          options={filterData.tipoProveedor}
          selectedValue={filters.selectedTipoProveedor}
          onSelect={(v) => setFilters({ ...filters, selectedTipoProveedor: v })}
        />

        <Text className="font-medium text-mutedForeground dark:text-dark-mutedForeground pb-2">
          Beneficiario:
        </Text>
        <View className="rounded mb-4 mx-4">
          <CustomPicker
            selectedValue={filters.selectedBeneficiario}
            onValueChange={(val: string) =>
              setFilters({ ...filters, selectedBeneficiario: val })
            }
            items={filterData.beneficiario.map((m) => ({
              label: m,
              value: String(m),
            }))}
            placeholder="Seleccione un beneficiario"
            error={undefined}
          />
        </View>
      </ScrollView>
    </FilterModal>
  );
}

import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { useAuthPays } from '@/features/pays/hooks/useAuthPays';

import ScreenSearchLayout from '@/components/screens/ScreenSearchLayout';
import Loader from '@/components/ui/Loader';
import { Text } from 'react-native';
import AuthPayCard from '../components/AuthPayCard';
import AuthPayModal from '../components/AuthPayModal';
import FiltersModal from '../components/FilterModal';
import { AuthPay } from '../types/AuthPay';

export default function AuthorizationScreen() {
  const { pays, loading, totalDocumentsAuth, totalAutorizadoUSD, totalAutorizadoVED } = useAuthPays();
  const [searchText, setSearchText] = useState('');


  // State Filters
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // States Auth
  const [selectedItem, setSelectedItem] = useState<AuthPay | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const handleApplyFilters = () => {
    setFilterModalVisible(false);
  };

  const handleOpenAuthModal = (item: AuthPay) => {
    setSelectedItem(item);
    setAuthModalVisible(true);
  };

  const handleAuthorize = () => {
    if (selectedItem) {
      alert('Pago Autorizado')
      // TODO: real logic
    }
    setAuthModalVisible(false);
  };

  const filteredPays = pays.filter((item) =>
    `${item.observacion} ${item.beneficiario}`.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <>
      <ScreenSearchLayout
        // title={`${totalDocumentsAuth} Documentos`}
        // subtitle={`Total autorizado: ${totalVenezuela(totalAutorizadoVED)} VED / ${totalVenezuela(totalAutorizadoUSD)} $`}
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Observación o Beneficiario..."
        onFilterPress={() => setFilterModalVisible(true)}
        headerVisible={false}>
        

        {/* Pay List */}
        <FlatList
          data={filteredPays}
          keyExtractor={(item, index) => `${item.numerodocumento}-${index}`}
          renderItem={({ item }) => (
            <AuthPayCard item={item} onPress={() => handleOpenAuthModal(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}

          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-mutedForeground dark:text-dark-mutedForeground text-center">
                No se encontraron documentos...
              </Text>
            </View>
          }
        />
      </ScreenSearchLayout>

      {/* Modal Filters */}
      {filterModalVisible && (

        <FiltersModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
        />

      )}

      {authModalVisible && (
        <AuthPayModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          item={selectedItem || undefined}
          onAuthorize={handleAuthorize}
        />
      )}

    </>
  );
}

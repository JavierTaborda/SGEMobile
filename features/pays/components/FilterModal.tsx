import BottomModal from '@/components/ui/BottomModal';
import { useThemeStore } from '@/stores/useThemeStore';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

type FilterModalProps = { onApply: () => void; onClose: () => void; visible: boolean };

export default function FilterModal({ onApply, onClose, visible }: FilterModalProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [company, setCompany] = useState('CYBERLUX');
  const [authorized, setAuthorized] = useState(false);
  const [currency, setCurrency] = useState('VED');

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
    >
      <ScrollView showsVerticalScrollIndicator className='mb-6'>
        <Text className={`text-center text-lg font-bold mb-4 text-foreground dark:text-dark-foreground`}>Filtros</Text>
        <Text className={`mb-2 text-foreground dark:text-dark-foreground`}>Empresa:</Text>
        <View className='rounded mb-4 bg-componentbg dark:bg-dark-componentbg'>
          <Picker selectedValue={company} onValueChange={setCompany} style={{ color: isDark ? 'white' : 'black' }}>
            <Picker.Item label="FRIGILUX" value="FRIGLUX" />
            <Picker.Item label="CYBERLUX" value="CYBERLUX" />
          </Picker>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className='text-foreground dark:text-dark-foreground'>Solo autorizados</Text>
          <Switch value={authorized} onValueChange={setAuthorized} />
        </View>
        <Text className='mb-2 text-foreground dark:text-dark-foreground'>Moneda:</Text>
        <View className='rounded mb-4  bg-componentbg dark:bg-dark-componentbg'>
          <Picker selectedValue={currency} onValueChange={setCurrency} style={{ color: isDark ? 'white' : 'black' }}>
            <Picker.Item label="VED (Bolívares)" value="VED" />
            <Picker.Item label="USD (Dólares)" value="USD" />
          </Picker>
        </View>
        <TouchableOpacity className="bg-green-500 py-3 rounded-full mt-2" onPress={onApply}>
          <Text className="text-white text-center font-semibold">Aplicar filtros</Text>
        </TouchableOpacity >
        <TouchableOpacity className="bg-neutral-500 py-3 rounded-full mt-3 mb-4 pb-" onPress={onClose}>
          <Text className="text-white text-center font-semibold">Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomModal>
  );
}

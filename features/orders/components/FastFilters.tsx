import { useThemeStore } from '@/stores/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  sortDate: boolean;
  setSortDate: (value: boolean) => void;
  showStatus: boolean;
  setShowStatus: (value: boolean) => void;
  sortMount: boolean;
  setSortMount: (value: boolean) => void;
  openModalMount: boolean;
  setModalMountVisible: (value: boolean) => void;
  mountRangeActive:boolean;
  
}

export default function FastFilters({
  sortDate,
  setSortDate,
  showStatus,
  setShowStatus,
  sortMount,
  setSortMount,
  openModalMount,
  setModalMountVisible,
  mountRangeActive
}: Props) {
  const { isDark } = useThemeStore();
  const iconColor = isDark ? 'grey' : 'grey';


  const renderButton = (
    label: string,
    active: boolean ,
    icon: React.ComponentProps<typeof Ionicons>['name'],
    onPress: () => void,
    rotateIcon?: boolean
  ) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${label}`}
      className={`flex-row items-center px-3 py-3  rounded-full ${
        active ? 'bg-primary dark:bg-dark-primary' : 'bg-componentbg dark:bg-dark-componentbg'
      }`}
    >
      <Text
        className={`text-sm ${
          active ? 'text-white' : 'text-mutedForeground dark:text-dark-mutedForeground'
        }`}
      >
        {label}
      </Text>
      <Ionicons
        name={icon}
        size={rotateIcon ? 18 : 14}
        color={active ? 'white' : iconColor}
        style={{ marginLeft: 3 }}
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-row gap-1.5">
      {renderButton('Por revisar', showStatus, showStatus ? 'eye' : 'eye-off', () => setShowStatus(!showStatus))}
      {renderButton('Fecha', sortDate, sortDate ? 'arrow-down' : 'arrow-up', () => setSortDate(!sortDate))}
      {renderButton('Monto', sortMount, sortMount ? 'arrow-down' : 'arrow-up', () => setSortMount(!sortMount))}
      {/* {renderButton('Rango Monto', mountRangeActive ,mountRangeActive ? 'cash-sharp':'cash-outline', ()=>(setModalMountVisible(!openModalMount)))} */}
    </View>
  );
}
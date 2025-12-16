import { useThemeStore } from '@/stores/useThemeStore';
import { dateMonthText } from '@/utils/datesFormat';
import { totalVenezuela } from '@/utils/moneyFormat';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { AuthPay } from '../types/AuthPay';

interface Props {
  item: AuthPay;
  onPress?: (item: AuthPay) => void; 
}

export default function AuthPayCard({ item, onPress }: Props) {
  const { theme } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setIsExpanded(!isExpanded);
  };

  const isAuth = item.autorizadopagar === '1';

  return (
    <Pressable
      onPress={() => onPress?.(item)} 
      className="bg-componentbg dark:bg-dark-componentbg rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700 shadow-xs active:scale-[0.99] gap-1.5 "
    >
      {/* Beneficiario */}
      <Text className="text-xl font-bold text-foreground dark:text-dark-foreground mb-2">
        {item.beneficiario}
      </Text>

      {/* Chips */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        <View className="px-3 py-1 rounded-full bg-primary dark:bg-dark-primary">
          <Text className="text-xs font-medium text-white">{item.empresa}</Text>
        </View>
        <View className="px-3 py-1 rounded-full bg-secondary dark:bg-dark-secondary">
          <Text className="text-xs font-medium text-white">{item.clasegasto}</Text>
        </View>
      </View>

      {/* Montos */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Saldo documento</Text>
          <Text className="text-lg font-semibold text-black dark:text-white">
            {totalVenezuela(item.montoneto)} {item.moneda}
          </Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Tasa documento</Text>
          <Text className="text-sm font-medium text-black dark:text-white">
            {totalVenezuela(item.tasacambio)} Bs
          </Text>
        </View>
      </View>

      {/* Estado de autorización */}
      {isAuth ? (
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">Monto autorizado</Text>
            <Text className="text-lg font-bold text-green-600 dark:text-green-400">
              {totalVenezuela(item.montoautorizado)} {item.monedaautorizada}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">Tasa autorizada</Text>
            <Text className="text-sm font-medium text-black dark:text-white">
              {totalVenezuela(item.tasaautorizada)} Bs
            </Text>
          </View>
        </View>
      ) : (
        <View className="self-center px-3 py-1  rounded-lg bg-warning dark:bg-dark-warning flex-row items-center">
          <MaterialIcons name="cancel" size={16} color={theme === 'dark' ? '#555' : 'white'} />
          <Text className="ml-2 text-sm font-semibold text-white dark:text-gray-700">No autorizado</Text>
        </View>
      )}

      {/* Banco */}
      {isAuth && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 ">
          Banco pagador: <Text className="font-medium text-black dark:text-white">{item.bancopagador}</Text>
        </Text>
      )}

      {/* Detalles */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pt-2"
        contentContainerStyle={{ gap: 20 }}
      >
        {[
          {
            icon: <MaterialCommunityIcons name="file-document" size={16} color="#666" />,
            label: 'Documento',
            value: `${item.tipodocumento}-${item.numerodocumento}`,
          },
          {
            icon: <MaterialIcons name="calendar-today" size={16} color="#666" />,
            label: 'Emisión',
            value: dateMonthText(item.fechaemision),
          },
          {
            icon: <MaterialIcons name="calendar-month" size={16} color="#666" />,
            label: 'Vencimiento',
            value: dateMonthText(item.fechavencimiento),
          },
          {
            icon: <MaterialCommunityIcons name="account-check" size={16} color="#666" />,
            label: 'Registrado por',
            value: item.registradopor,
          },
        ].map((d, i) => (
          <View key={i}>
            {d.icon}
            <Text className="text-sm text-gray-500 dark:text-gray-400">{d.label}</Text>
            <Text className="text-sm text-black dark:text-white">{d.value}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Observación */}
      {item.observacion && (
        <View className="">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Observación</Text>
          <Text className="text-sm text-black dark:text-white">
            {isExpanded
              ? item.observacion
              : `${item.observacion.slice(0, 80)}${item.observacion.length > 80 ? '...' : ''}`}
          </Text>
          {item.observacion.length > 80 && (
            <Pressable onPress={toggleExpand}>
              <Text className="text-primary dark:text-dark-primary text-xs mt-1">
                Ver {isExpanded ? 'menos' : 'más'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

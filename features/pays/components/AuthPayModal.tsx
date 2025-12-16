
import CustomPicker from '@/components/inputs/CustomPicker';
import RateInput from '@/components/inputs/RateInput';
import BottomModal from '@/components/ui/BottomModal';
import Loader from '@/components/ui/Loader';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { AuthPay } from '../types/AuthPay';

interface Props {
  visible: boolean;
  onClose: () => void;
  item?: AuthPay;
  onAuthorize: () => void;

}
//TODO: create custom preseable
export default function AuthPayModal({ visible, onClose, item, onAuthorize }: Props) {

  const [tasa, setTasa] = useState<number>(0.00);
  const [formaPago, setformaPago] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!item) {
    return (
     <Loader />
    );
  }

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}

      >


        <ScrollView className="flex-1 px-1 "
          keyboardShouldPersistTaps="handled">
          <View className="gap-2 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
            <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
              {item.beneficiario}
            </Text>
            <Text className="text-lg font-medium text-foreground dark:text-dark-foreground">
              Monto saldo: {item.montosaldo} {item.moneda}
            </Text>
            <Text className="text-base text-black dark:text-white">
              {item.tipodocumento}-{item.numerodocumento}
            </Text>
            <Text className="text-base text-black dark:text-white">
              {item.observacion}
            </Text>
          </View>

          <View className='gap-2 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4' >
            <View className='gap-1'>
              <Text className='text-md font-semibold text-foreground dark:text-dark-foreground'>
                Forma de Pago
              </Text>
              <CustomPicker
                selectedValue={formaPago}
                onValueChange={setformaPago}
                items={[
                  { label: "USD - Banco", value: "USD" },
                  { label: "EUR - Banco", value: "EUR" },
                  { label: "VED - Banco", value: "COP" },
                ]}
                icon="money"
                placeholder="Seleccione moneda"
                error="Debe elegir una moneda"
              />
            </View>
            <View className='gap-1'>
              <Text className='text-md font-semibold text-foreground dark:text-dark-foreground'>
                Tasa autorizada
              </Text>
              <RateInput value={tasa}
                onChangeValue={setTasa} />
            </View>
            <View className='gap-1'>
              <Text className='text-md font-semibold text-foreground dark:text-dark-foreground'>
                Monto autorizado
              </Text>
              <RateInput value={tasa}
                onChangeValue={setTasa} />
            </View>
          </View>


        </ScrollView>

        <View className="px-4 pb-6 gap-2">
          <Pressable
            onPress={onAuthorize}
            className="bg-primary dark:bg-dark-primary rounded-lg px-4 py-3"
          >
            <Text className="text-center text-white font-semibold">
              {isLoading ? 'Autorizando...' : 'Autorizar'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onAuthorize}
            className="bg-warning dark:bg-dark-warning rounded-lg px-4 py-3"
          >
            <Text className="text-center text-white font-semibold">
              {isLoading ? 'Autorizando...' : 'Desautorizar'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="bg-gray-600 dark:bg-gray-500 rounded-lg px-4 py-3"
          >
            <Text className="text-center text-white font-semibold">
              {isLoading ? 'Autorizando...' : 'Cancelar'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </BottomModal>
  );
}

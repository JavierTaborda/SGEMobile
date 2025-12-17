
import CustomPicker from '@/components/inputs/CustomPicker';
import RateInput from '@/components/inputs/RateInput';
import BottomModal from '@/components/ui/BottomModal';
import Loader from '@/components/ui/Loader';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AuthPay } from '../types/AuthPay';

interface Props {
  visible: boolean;
  onClose: () => void;
  item?: AuthPay[];
  onAuthorize: () => void;

}
//TODO: create custom preseable
export default function AuthPayModal({
  visible,
  onClose,
  item = [],
  onAuthorize,
}: Props) {
  const [tasa, setTasa] = useState<number>(0.0);
  const [formaPago, setformaPago] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  if (!item || item.length === 0) {
    return <Loader />;
  }

  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>
      <ScrollView className="flex-1 px-1" keyboardShouldPersistTaps="handled">
        {/* Resumen de múltiples documentos */}
        <View className="gap-2 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4">
          <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
            Documentos seleccionados: {item.length}
          </Text>
         
          <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
            Saldo total  {item.reduce((sum, pay) => sum + Number(pay.montosaldo), 0)}
          </Text>
         
        </View>

        {/* Inputs comunes para todos */}
        <View className="gap-2 bg-componentbg dark:bg-dark-componentbg rounded-2xl p-4 mt-4">
          <View className="gap-1">
            <Text className="text-md font-semibold text-foreground dark:text-dark-foreground">
              Forma de Pago
            </Text>
            <CustomPicker
              selectedValue={formaPago}
              onValueChange={setformaPago}
              items={[
                { label: "USD - Banco", value: "USD" },
                { label: "EUR - Banco", value: "EUR" },
                { label: "VED - Banco", value: "VED" },
              ]}
              icon="money"
              placeholder="Seleccione moneda"
              error="Debe elegir una moneda"
            />
          </View>

          <View className="gap-1">
            <Text className="text-md font-semibold text-foreground dark:text-dark-foreground">
              Tasa autorizada
            </Text>
            <RateInput value={tasa} onChangeValue={setTasa} />
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View className="px-4 pb-6 gap-2">
        <Pressable
          onPress={() => {
            setIsLoading(true);
            onAuthorize(); // aquí puedes pasar item.map(d => d.numerodocumento)
          }}
          className="bg-primary dark:bg-dark-primary rounded-lg px-4 py-3"
        >
          <Text className="text-center text-white font-semibold">
            {isLoading ? "Autorizando..." : `Autorizar (${item.length})`}
          </Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          className="bg-gray-600 dark:bg-gray-500 rounded-lg px-4 py-3"
        >
          <Text className="text-center text-white font-semibold">Cancelar</Text>
        </Pressable>
      </View>
    </BottomModal>
  );
}

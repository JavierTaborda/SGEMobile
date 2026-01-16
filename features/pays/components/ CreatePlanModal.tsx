import { useState } from "react";
import {
  Pressable,
  Text,
  View
} from "react-native";

import BottomModal from "@/components/ui/BottomModal";

import { useOverlayStore } from "@/stores/useSuccessOverlayStore";

import type { PlanPagos } from "../interfaces/PlanPagos";

interface Props {
  visible: boolean;
  onClose: () => void;
  items: PlanPagos[];
}



export default function AuthPayModal({
  visible,
  onClose,
  items,

}: Props) {


  const [isLoading, setIsLoading] = useState(false);
  const overlay = useOverlayStore();
  

  


  return (
    <BottomModal visible={visible} onClose={onClose} heightPercentage={0.85}>


      {/* Actions */}
      <View className="pt-4 gap-y-3 ">
        <Pressable
          className={`py-4 rounded-xl items-center bg-primary dark:bg-dark-primary`}
        
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Procesando..." : `Autorizar (${items.length})`}
          </Text>
        </Pressable>


          <Pressable
            className={`py-4 rounded-xl border items-center ${
              isLoading
                ? "border-primary/40 dark:border-dark-primary/40"
                : "border-primary dark:border-dark-primary"
            }`}
            disabled={isLoading}
           
          >
            <Text
              className={`font-bold text-base ${
                isLoading
                  ? "text-primary/50"
                  : "text-primary dark:text-dark-primary"
              }`}
            >
              {isLoading ? "Procesando..." : "Cancelar autorización"}
            </Text>
          </Pressable>
    
        <Pressable
          className="rounded-xl py-4 bg-error"
          onPress={onClose}
        >
          <Text className="text-white text-center font-bold">Cancelar</Text>
        </Pressable>
      </View>
    </BottomModal>
  );
}

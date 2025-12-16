import React, { useCallback } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Motive } from "../types/motives";

type MotiveModalProps = {
  motives?: Motive[];
  visible?: boolean;
  selectedMotive: string | null;
  setSelectedMotive: (motive: string) => void;
  onClose: (close: boolean) => void;
};

const MotiveModal: React.FC<MotiveModalProps> = React.memo(
  ({
    motives = [],
    visible = true,
    setSelectedMotive,
    onClose,
    selectedMotive,
  }) => {
    const handleMotiveSelectPress = useCallback(
      (item: Motive) => {
        setSelectedMotive(item.codmotive);
        onClose(false);
      },
      [setSelectedMotive, onClose]
    );
    if (!visible) return null;

    return (
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2 text-foreground dark:text-dark-foreground">
          Seleccionar motivo
        </Text>

        {motives.length === 0 ? (
          <Text className="text-center text-mutedForeground dark:text-dark-mutedForeground mt-4">
            No se encontraron clientes.
          </Text>
        ) : (
          <FlatList
            data={motives}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
            renderItem={({ item }) => {
              const isSelected = selectedMotive === item.codmotive;
              return (
                <Pressable
                  onPress={() => handleMotiveSelectPress(item)}
                  className={`flex-1 h-14 mx-2 justify-center items-center rounded-3xl 
              ${isSelected ? "bg-primary dark:bg-dark-primary" : "bg-componentbg dark:bg-dark-componentbg"} 
              `}
                >
                  <Text
                    className={`text-md font-semibold 
                ${isSelected ? "text-white" : "text-foreground dark:text-dark-foreground"}`}
                  >
                    {item.codmotive}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    );
  }
);

MotiveModal.displayName = "MotiveModal";
export default MotiveModal;

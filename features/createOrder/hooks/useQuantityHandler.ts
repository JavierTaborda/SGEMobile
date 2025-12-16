
import { safeHaptic } from "@/utils/safeHaptics";
import { useRef } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import useCreateOrderStore from "../stores/useCreateOrderStore";

type Props = {
    codart: string;
    artdes: string;
    price: number;
    img: string;
    quantity: number;
    available: number;
};


export const useQuantityHandlers = ({
    quantity,
    available,
    codart,
    artdes,
    price,
    img,
    
}: Props) => {
    const pressedLong = useRef(false);
    const addItem = useCreateOrderStore((s) => s.addItem);
    const increase = useCreateOrderStore((s) => s.increase);
    const decrease = useCreateOrderStore((s) => s.decrease);
    const removeItem = useCreateOrderStore((s) => s.removeItem);
    const btnScale = useSharedValue(1);
    const qtyScale = useSharedValue(1);
    const addScale = useSharedValue(1);

    const ANIM_DURATION = 100;

    const handleIncrease = () => {
        if (pressedLong.current) {
            pressedLong.current = false;
            return;
        }
        increase(codart);

        safeHaptic("selection");
        btnScale.value = withTiming(
            0.9,
            { duration: ANIM_DURATION },
            () => (btnScale.value = 1)
        );
        qtyScale.value = withTiming(
            1.1,
            { duration: ANIM_DURATION },
            () => (qtyScale.value = 1)
        );
    };
    const handleIncreaseQty = (qty?: number, qtyInStore?: number) => {
        if (pressedLong.current) {
            pressedLong.current = false;
            return;
        }

        const newQty =
            qty !== undefined
                ? qty
                : qtyInStore !== undefined
                    ? qtyInStore
                    : quantity + 1;


        const finalQty =
            available !== undefined ? Math.min(newQty, available) : newQty;

     
        const diff = finalQty - quantity;

        if (diff !== 0) {
            increase(codart, diff);   
        }

        safeHaptic("selection");

        btnScale.value = withTiming(
            0.9,
            { duration: ANIM_DURATION },
            () => (btnScale.value = 1)
        );

        qtyScale.value = withTiming(
            1.1,
            { duration: ANIM_DURATION },
            () => (qtyScale.value = 1)
        );
    };


    const handleDecrease = () => {
        if (pressedLong.current) {
            pressedLong.current = false;
            return;
        }
        decrease(codart);
        safeHaptic("selection");
        btnScale.value = withTiming(
            0.9,
            { duration: ANIM_DURATION },
            () => (btnScale.value = 1)
        );
    };

    const handleAdd = () => {
        if (pressedLong.current) {
            pressedLong.current = false;
            return;
        }

        addItem({ codart, artdes, price, img, available, quantity: 1, discount:""});
        safeHaptic("selection");
        addScale.value = withTiming(
            1.1,
            { duration: ANIM_DURATION },
            () => (addScale.value = 1)
        );
    };
    const handleRemove = (codart: string) => {
        pressedLong.current = true;
        removeItem(codart);
        safeHaptic("warning");
    };
    const handleMaxIncrease = (codart: string) => {
        pressedLong.current = true;
        if (available && available > quantity) {
            increase(codart, available - quantity);
            safeHaptic("success");
            qtyScale.value = withTiming(
                1.1,
                { duration: ANIM_DURATION },
                () => (qtyScale.value = 1)
            );
        }
    };

    return {
        pressedLong,
        btnScale,
        qtyScale,
        addScale,
        handleIncrease,
        handleDecrease,
        handleAdd,
        handleRemove,
        handleMaxIncrease,
        handleIncreaseQty,
        
    };
};

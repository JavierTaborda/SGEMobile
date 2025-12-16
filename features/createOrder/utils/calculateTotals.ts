export type TotalsResult = {
    totalGross: number;     
    discountAmount: number; 
    subtotal: number;        
    iva: number;             
    total: number;           
    finalUnitPrice: number;  
};

export const calculateTotals = (
    price: number,
    quantity: number,
    discountStr: string,
    ivaRate: number,
): TotalsResult => {
    const totalGross = price * quantity;

    const discounts = discountStr
        .split("+")
        .map((d) => Number(d.trim()))
        .filter((n) => !isNaN(n) && n > 0);

    let subtotal = totalGross;
    let finalUnitPrice = price;

    discounts.forEach((percent) => {
        subtotal -= (subtotal * percent) / 100;
        finalUnitPrice -= (finalUnitPrice * percent) / 100;
    });

    const discountAmount = Number((totalGross - subtotal).toFixed(2));
    subtotal = Number(subtotal.toFixed(2));
    finalUnitPrice = Number(discountAmount >0 ?finalUnitPrice.toFixed(2): price);

    const iva = Number((subtotal * ivaRate).toFixed(2));
    const total = Number((subtotal + iva).toFixed(2));

    return { totalGross, discountAmount, subtotal, iva, total, finalUnitPrice };
};
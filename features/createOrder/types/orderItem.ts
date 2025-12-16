export type OrderItem = {
  codart: string;
  artdes: string;
  price: number;
  codven?: string; 
  asignado?: number;
  utilizado?: number; 
  available: number; //asignado - utilizado
  quantity: number;
  img?:string
  discount?: string;
  
}

export type OrderApproval={
  fact_num: number;
  estatus: string;
  comentario: string;
  saldo: string;
  fec_emis:string;
  fec_venc:  string;
  co_cli: string;
  cli_des: string;
  credito: number;
  co_ven: string;
  ven_des: string;
  co_tran: string;
  des_tran: string;
  dir_ent: string;
  forma_pag: string;
  cond_des: string;
  revisado: string;
  tot_bruto: string;
  tot_neto: string;
  glob_desc: string;
  iva: string;
  impresa: number;
  aux02: string;
  tasa: string;
  moneda: string;
  anulada: boolean;
  co_zon: string;
  zon_des: string;
  reng_max: number;
  reng_ped:OrderApprovalProduct[] 
}
export type OrderApprovalProduct ={

  fact_num: number;
  reng_num: number;
  co_art: string;
  art_des: string;
  co_alma: string;
  total_art: string;
  stotal_art: string;
 // pendiente: string;
  uni_venta: string;
  //des_uni: string;
  prec_vta: string;
  prec_vta2: string;
  reng_neto: string;
  porc_desc: string;
  tipo_imp: string;
  prec_vta_desc: number;
  des_sub:string;
  //compuesto: number;
  //ref: string;
};

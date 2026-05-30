export type PosProduct = {
  barcode: string;
  name: string;
  price: number;
};

export type CartItem = PosProduct & {
  quantity: number;
};


export interface Tour {
  _id?: string;
  title: string;
  description: string;
  destination: string;
  dates: string[];
  price: number;
  image?: string;
  imagePublicId?: string;
  grupo?: string;
  category?: string;
  type?: "tour" | "ticket";
}

export type TourFormData = Tour & {
  imageFile?: File;
};

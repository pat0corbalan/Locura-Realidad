export interface ITour {
  _id: string;  // string en lugar de ObjectId
  title: string;
  description: string;
  destination: string;
  dates: string;
  price: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

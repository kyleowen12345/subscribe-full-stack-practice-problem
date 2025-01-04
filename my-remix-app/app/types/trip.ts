import { Category } from "./category";

export type TripCover = {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string;
  caption: string;
  url: string;
};

export interface Trip {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  location: string;
  description: string;
  votes: 0;
  cover: TripCover;
  category: Category;
}

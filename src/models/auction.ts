import { IUser } from "./user";

export interface IAuction {
  title: string,
  description: string,
  state: TState,
  opensAt: string,
  closesAt: string,
  lots: ILot[],
  id: string,
  createdAt: string
}

export interface ILot {
  title: string,
  description: string,
  startPrice: number,
  minPriceStepSize: number,
  opensAt: string,
  closesAt: string,
  state: TLotState,
  bids: [],
  id: string,
  createdAt: string
}

export interface IMessage {
  id: string;
  text: string;
  createdAt: string;
  user: IUser;
}

export interface IBid {
  createdAt: string;
  id: string;
  lotId: string;
  price: number;
  user: IUser;
}

export type TState = "Scheduled" | "Opened" | "Closed";
export type TLotState = "Scheduled" | "BidsAreOpened" | "BidsAreClosed";
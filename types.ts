
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum ItemType {
  INSTANT = 'INSTANT',
  SEQUENTIAL = 'SEQUENTIAL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  credits: number;
  passwordHash: string;
}

export interface SequentialItem {
  id: string;
  content: string;
  isDelivered: boolean;
  order: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ItemType;
  logoUrl?: string;
  content?: string; // For instant
  sequentialItems?: SequentialItem[]; // For sequential
  deliveredCount: number;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  contentDelivered: string;
  timestamp: number;
  price: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  code: string;
  amount: number;
  status: TransactionStatus;
  timestamp: number;
}

export interface RedeemCode {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  createdBy: string;
  createdAt: number;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  text: string;
  timestamp: number;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  lastUpdated: number;
}

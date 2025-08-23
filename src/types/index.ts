export type Priority = 'Alta' | 'Media' | 'Bassa';
export type KanbanColumnID = 'Spedizioni Ferme' | 'Spedizioni Future' | 'Ritira il Cliente';
export type EventType = 'shipment' | 'task' | 'pickup' | 'meeting';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image';
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: Date;
}

export interface Shipment {
  id: string;
  order_number: string;
  tracking_number: string;
  customer: {
    name: string;
    address: string;
  };
  products: Product[];
  assigned_to: User;
  due_date: Date;
  priority: Priority;
  status: KanbanColumnID;
  attachments: Attachment[];
  comments: Comment[];
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  assigned_to: User;
  due_date: Date;
  priority: Priority;
  tags: string[];
  category: string;
  sub_tasks: SubTask[];
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  resource_id: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  is_read: boolean;
  timestamp: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  notebook: string;
  is_shared: boolean;
  last_modified: Date;
}
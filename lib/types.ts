export interface Project {
  id: string;
  name: string;
  address?: string;
  status: "open" | "closed";
  sort_order: number;
}

export interface Room {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
}

export interface Item {
  id: string;
  room_id: string;
  text: string;
  trade: string | null;
  done: boolean;
}

export interface Trade {
  id: string;
  name: string;
}
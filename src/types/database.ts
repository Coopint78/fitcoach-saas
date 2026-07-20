export type Role = "trainer" | "client";

export interface Trainer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  bio: string | null;
  brand_color: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  trainer_id: string;
  user_id: string | null;
  name: string;
  email: string;
  goal: string | null;
  notes: string | null;
  invite_token: string | null;
  invited_at: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  trainer_id: string;
  name: string;
  created_at: string;
}

export interface RoutineItem {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  order: number;
  exercise?: Exercise;
}

export interface Assignment {
  id: string;
  routine_id: string;
  client_id: string;
  assigned_at: string;
  routine?: Routine;
  client?: Client;
}

export interface ProgressLog {
  id: string;
  client_id: string;
  exercise_id: string;
  logged_at: string;
  weight: number | null;
  completed: boolean;
  exercise?: Exercise;
}

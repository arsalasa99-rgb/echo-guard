export enum AppView {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  HOME = 'HOME',
  PRE_DISASTER = 'PRE_DISASTER',
  DURING_DISASTER = 'DURING_DISASTER',
  POST_DISASTER = 'POST_DISASTER',
  PROFILE = 'PROFILE'
}

export enum DisasterType {
  FLOOD = 'FLOOD',
  EARTHQUAKE = 'EARTHQUAKE',
  FIRE = 'FIRE',
  VOLCANO = 'VOLCANO'
}

export type Language = 'id' | 'en' | 'ar' | 'zh';

export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  role: string;
  points: number;
  badges: string[];
}

export interface Report {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'resolved';
}

export interface NavItem {
  view: AppView;
  label: string;
  icon: any; // Lucide icon type
  color: string;
}
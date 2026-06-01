/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LoveTheme = 'pink' | 'purple' | 'green';

export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  assigned_profile_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name1: string;
  name2: string;
  created_by: string; // user id
  start_date: string; // YYYY-MM-DD
  custom_title?: string;
  image_url?: string;
  theme: LoveTheme;
  created_at: string;
}

export interface Memory {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  memory_date: string; // YYYY-MM-DD
  location?: string;
  image_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface ProfilePhoto {
  id: string;
  user_id: string;
  owner_name: string; // Name of the creator
  url: string;
  profile_id: string;
  created_at: string;
}

export interface AnniversaryInfo {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

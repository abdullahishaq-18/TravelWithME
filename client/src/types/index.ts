export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  interests: string[];
  city: string;
  country: string;
  tier: 1 | 2 | 3;
  nextDestination: { city: string | null; date: string | null };
  ratingAvg: number;
  ratingCount: number;
  ratingTagCounts: Record<string, number>;
  memberSince: string;
  phone?: string | null;
}

export interface FeedPostItem {
  kind: "post";
  id: string;
  createdAt: string;
  author: User;
  photoUrl: string | null;
  caption: string;
  location: string;
}

export interface FeedTravelerItem {
  kind: "traveler";
  id: string;
  createdAt: string;
  user: User;
}

export interface FeedMeetupItem {
  kind: "meetup";
  id: string;
  createdAt: string;
  host: User;
  title: string;
  placeName: string;
  startsAt: string;
  attendeeCount: number;
  capacity: number;
  minTier: number;
  photoUrl: string | null;
  joined: boolean;
}

export type FeedItem = FeedPostItem | FeedTravelerItem | FeedMeetupItem;

export interface Meetup {
  id: string;
  title: string;
  description: string;
  category: string;
  placeName: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  minTier: number;
  photoUrl: string | null;
  host: User;
  attendees: User[];
  joined: boolean;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  meetup: string | null;
  participants: User[];
  other: User | null;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  text: string;
  sharedMeetup: Meetup | null;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "verification" | "message" | "rating_prompt" | "meetup_join" | "rating_update" | "system";
  text: string;
  read: boolean;
  meta: Record<string, unknown>;
  createdAt: string;
}

import type { OriginBadgeConfig } from '@/lib/originBadges';
import type { KittyEmote } from '@/lib/kittyEmotes';

export type BookingCard = {
  bookingId: string;
  service: string;
  priceLabel?: string;
  date: string;
  time: string;
  guestName: string;
  status: 'pending';
  notes?: string | null;
  inspoImageUrls?: string[];
  heardFrom?: string | null;
  attributionBadge?: OriginBadgeConfig | null;
};

export type QuickReply = { label: string; message: string };

export type AvailabilitySlot = {
  time: string;
  minutes?: number;
  available: boolean;
  reason?: 'booked' | 'blocked' | 'past';
  label?: string;
};

export type AvailabilityWidget = {
  date: string;
  formattedDate: string;
  available: boolean;
  blocked: boolean;
  slots: AvailabilitySlot[];
};

export type ChatMessageItem = {
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  attachments?: string[];
  emote?: KittyEmote;
  isVoice?: boolean;
  bookingCard?: BookingCard;
  quickReplies?: QuickReply[];
  availability?: AvailabilityWidget;
  timestamp?: number;
  agentName?: string;
};

export type PendingAttachment = {
  id: string;
  previewUrl: string;
  uploadedUrl?: string;
  status: 'uploading' | 'ready' | 'error';
  error?: string;
};

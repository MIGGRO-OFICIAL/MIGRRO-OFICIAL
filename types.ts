
export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
}

export interface VerificationStep {
  type: 'email' | 'phone' | 'document' | 'face';
  status: 'pending' | 'verified' | 'rejected' | 'unsubmitted';
  label: string;
  points: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  role: 'imigrant' | 'helper' | 'admin';
  raizCoins: number;
  badges: string[];
  bio?: string;
  isPremium?: boolean;
  // Trust & Safety Fields
  trustScore: number; // 0 to 100
  verificationSteps: VerificationStep[];
  reviews: Review[];
  joinDate: string;
  // Monetization / Social Fields
  wallet?: {
    balance: number; // Current earnings available
    pendingPayout: number;
    totalEarnings: number;
  };
  subscriberCount?: number;
  followingCount?: number;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  title: string;
  description: string;
  category: 'Housing' | 'Bureaucracy' | 'Language' | 'Social' | 'Jobs';
  price: number;
  currency: 'EUR' | 'RAIZ';
  rating: number;
  reviewsCount: number;
  verified: boolean;
}

export interface Proposal {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  price: number;
  currency: 'EUR' | 'RAIZ';
  description: string;
  timestamp: string;
  isUnlocked: boolean; // Airbnb style lock
}

export interface ServiceRequest {
  id: string;
  authorId: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'closed';
  proposals: Proposal[];
  timestamp: string;
  images?: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  image?: string;
  videoUrl?: string; // YouTube link support
  likes: number;
  comments: number;
  timestamp: string;
  tags: string[];
  type: 'general' | 'help_request' | 'event';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  image: string;
  isPrivate?: boolean;
  safetyRating: number; // 1 to 5 stars based on community feedback
  reviewsCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  mrr: number; // Monthly Recurring Revenue
  adRevenue: number; // Revenue from Ads
  creatorFund: number; // Amount distributed to users
  growthRate: number;
  activeCampaigns: number;
}

export interface AdCampaign {
  id: string;
  sponsorName: string;
  title: string;
  status: 'active' | 'paused' | 'pending';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  startDate: string;
}

export interface DirectMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isMe: boolean;
}

export interface ChatConversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export enum ViewState {
  HOME = 'HOME',
  FEED = 'FEED',
  GROUPS = 'GROUPS',
  SERVICES = 'SERVICES',
  AI_GUIDE = 'AI_GUIDE',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  CHATS = 'CHATS',
  PUBLIC_PROFILE = 'PUBLIC_PROFILE', // New view to inspect other users
  VERIFICATION = 'VERIFICATION', // New view for KYC flow
  MY_REQUESTS = 'MY_REQUESTS', // New view for Reverse Marketplace
  OPEN_REQUESTS = 'OPEN_REQUESTS', // View for providers to see open requests
  POST_DETAIL = 'POST_DETAIL', // Post detail view
  GROUP_DETAIL = 'GROUP_DETAIL', // Group detail view
  LOGIN = 'LOGIN', // Login view
  SIGNUP = 'SIGNUP', // Signup view
  SERVICE_DETAIL = 'SERVICE_DETAIL', // Service detail view
  PROVIDER_DASHBOARD = 'PROVIDER_DASHBOARD', // Provider dashboard view
}

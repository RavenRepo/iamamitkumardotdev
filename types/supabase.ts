export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      post: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          coverImage: string | null;
          status: string;
          tags: string | null;
          metaTitle: string | null;
          metaDescription: string | null;
          authorId: string;
          publishedAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          coverImage?: string | null;
          status?: string;
          tags?: string | null;
          metaTitle?: string | null;
          metaDescription?: string | null;
          authorId: string;
          publishedAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          coverImage?: string | null;
          status?: string;
          tags?: string | null;
          metaTitle?: string | null;
          metaDescription?: string | null;
          authorId?: string;
          publishedAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: number;
          email: string;
          source: string | null;
          ip: string | null;
          userAgent: string | null;
          isActive: boolean;
          subscribedAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: number;
          email: string;
          source?: string | null;
          ip?: string | null;
          userAgent?: string | null;
          isActive?: boolean;
          subscribedAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: number;
          email?: string;
          source?: string | null;
          ip?: string | null;
          userAgent?: string | null;
          isActive?: boolean;
          subscribedAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: number;
          name: string;
          email: string;
          subject: string;
          message: string;
          source: string | null;
          ip: string | null;
          userAgent: string | null;
          createdAt: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          source?: string | null;
          ip?: string | null;
          userAgent?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          source?: string | null;
          ip?: string | null;
          userAgent?: string | null;
          createdAt?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

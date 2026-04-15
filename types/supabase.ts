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

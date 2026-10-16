export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TableShape = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: TableShape
      [key: string]: TableShape
    }
    Views: {
      [key: string]: { Row: Record<string, unknown>; Relationships: [] }
    }
    Functions: {
      [key: string]: { Args: Record<string, unknown>; Returns: unknown }
    }
    Enums: {
      [key: string]: string
    }
    CompositeTypes: {
      [key: string]: Record<string, unknown>
    }
  }
}
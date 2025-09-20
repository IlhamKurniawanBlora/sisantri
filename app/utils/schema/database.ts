export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json }
	| Json[]

export interface Database {
	public: {
		Tables: {
			santri: {
				Row: {
					id: string
					nis: string | null
					full_name: string | null
					kelas: string | null
					angkatan: number | null
					bio: string | null
					photo_url: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					nis?: string | null
					full_name?: string | null
					kelas?: string | null
					angkatan?: number | null
					bio?: string | null
					photo_url?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					nis?: string | null
					full_name?: string | null
					kelas?: string | null
					angkatan?: number | null
					bio?: string | null
					photo_url?: string | null
					created_at?: string | null
				}
			}
			blogs: {
				Row: {
					id: string
					title: string | null
					slug: string | null
					content: string | null
					excerpt: string | null
					author_id: string | null
					published: boolean | null
					published_at: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					title?: string | null
					slug?: string | null
					content?: string | null
					excerpt?: string | null
					author_id?: string | null
					published?: boolean | null
					published_at?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					title?: string | null
					slug?: string | null
					content?: string | null
					excerpt?: string | null
					author_id?: string | null
					published?: boolean | null
					published_at?: string | null
					created_at?: string | null
				}
			}
			media: {
				Row: {
					id: string
					url: string | null
					filename: string | null
					metadata: Json | null
					uploaded_by: string | null
					created_at: string | null
				}
				Insert: {
					id?: string
					url?: string | null
					filename?: string | null
					metadata?: Json | null
					uploaded_by?: string | null
					created_at?: string | null
				}
				Update: {
					id?: string
					url?: string | null
					filename?: string | null
					metadata?: Json | null
					uploaded_by?: string | null
					created_at?: string | null
				}
			}
			settings: {
				Row: {
					id: string
					value: Json | null
				}
				Insert: {
					id: string
					value?: Json | null
				}
				Update: {
					id?: string
					value?: Json | null
				}
			}
		}
		Views: {}
		Functions: {}
		Enums: {}
		CompositeTypes: {}
	}
}

export type DatabaseTables = keyof Database['public']['Tables']


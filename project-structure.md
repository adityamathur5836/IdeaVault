IdeaVault/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase-a.ts          # Read-only Supabase A client
│   │   │   ├── supabase-b.ts          # Full CRUD Supabase B client
│   │   │   └── openai.ts              # OpenAI/embedding config
│   │   ├── modules/
│   │   │   ├── ideas-reader.ts        # Read ideas from Account A
│   │   │   ├── user-data.ts           # Manage user data in Account B
│   │   │   └── vector-search.ts       # ML vector search & embeddings
│   │   ├── services/
│   │   │   └── similar-ideas.ts       # Main similar ideas service
│   │   └── types/
│   │       └── index.ts               # TypeScript definitions
│   ├── supabase/
│   │   ├── functions/
│   │   │   └── similar-ideas/         # Edge function for vector search
│   │   └── migrations/
│   │       ├── account-a.sql          # Schema for Account A (ideas pool)
│   │       └── account-b.sql          # Schema for Account B (user data)
│   ├── scripts/
│   │   └── generate-embeddings.ts    # One-time embedding generation
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useIdeasPool.ts        # Hook for Account A ideas
│   │   │   ├── useUserData.ts         # Hook for Account B user data
│   │   │   └── useSimilarIdeas.ts     # Hook for vector search
│   │   └── components/
│   │       └── SimilarIdeas.tsx       # Component showing similar ideas
│   └── package.json
├── .env.example
└── README.md
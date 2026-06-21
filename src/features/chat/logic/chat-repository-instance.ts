import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSupabaseChatRepository } from '@/services/supabase-chat-repository';

export const chatRepository = createSupabaseChatRepository(createSupabaseBrowserClient());

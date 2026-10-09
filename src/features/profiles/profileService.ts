import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Profile } from '../../types/profile';
import { DEFAULT_FOREX_PAIRS, DEFAULT_STRATEGIES } from '../preferences/preferenceUtils';

const LOCAL_STORAGE_PROFILE_KEY = 'trading_journal_demo_profile';

function getLocalProfile(userId: string, defaultName: string): Profile {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        forex_pairs: parsed.forex_pairs || DEFAULT_FOREX_PAIRS,
        strategies: parsed.strategies || DEFAULT_STRATEGIES,
      };
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return {
    id: userId,
    display_name: defaultName,
    preferred_currency: 'USD',
    timezone: 'Asia/Kolkata',
    forex_pairs: DEFAULT_FOREX_PAIRS,
    strategies: DEFAULT_STRATEGIES,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function saveLocalProfile(profile: Profile): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${profile.id}`, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save demo profile to localStorage:', e);
  }
}

export const profileService = {
  async getProfile(userId: string, email?: string, metaDisplayName?: string): Promise<Profile | null> {
    const defaultName = metaDisplayName || (email ? email.split('@')[0] : 'Trader');

    if (!isSupabaseConfigured) {
      return getLocalProfile(userId, defaultName);
    }

    // Use maybeSingle to safely handle zero-row cases
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      // Fallback to local state if database fails
      return getLocalProfile(userId, defaultName);
    }

    if (!data) {
      // Auto-create/repair profile row safely for the current user
      const newProfile: Partial<Profile> = {
        id: userId,
        display_name: defaultName,
        preferred_currency: 'USD',
        timezone: 'Asia/Kolkata',
        forex_pairs: DEFAULT_FOREX_PAIRS,
        strategies: DEFAULT_STRATEGIES,
        updated_at: new Date().toISOString(),
      };

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error repairing missing user profile:', createError);
        // Retry without forex_pairs/strategies columns if schema is not migrated yet
        const legacyProfile = {
          id: userId,
          display_name: defaultName,
          preferred_currency: 'USD',
          timezone: 'Asia/Kolkata',
          updated_at: new Date().toISOString(),
        };
        const { data: legacyCreated } = await supabase
          .from('profiles')
          .upsert(legacyProfile, { onConflict: 'id' })
          .select()
          .maybeSingle();

        const result = legacyCreated || legacyProfile;
        return {
          ...result,
          forex_pairs: DEFAULT_FOREX_PAIRS,
          strategies: DEFAULT_STRATEGIES,
        } as Profile;
      }

      return {
        ...(created as Profile),
        forex_pairs: created?.forex_pairs && created.forex_pairs.length > 0 ? created.forex_pairs : DEFAULT_FOREX_PAIRS,
        strategies: created?.strategies && created.strategies.length > 0 ? created.strategies : DEFAULT_STRATEGIES,
      };
    }

    return {
      ...(data as Profile),
      forex_pairs: data.forex_pairs && data.forex_pairs.length > 0 ? data.forex_pairs : DEFAULT_FOREX_PAIRS,
      strategies: data.strategies && data.strategies.length > 0 ? data.strategies : DEFAULT_STRATEGIES,
    };
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured) {
      const existing = getLocalProfile(userId, 'Demo Trader');
      const updatedProfile: Profile = {
        ...existing,
        ...updates,
        forex_pairs: updates.forex_pairs || existing.forex_pairs || DEFAULT_FOREX_PAIRS,
        strategies: updates.strategies || existing.strategies || DEFAULT_STRATEGIES,
        updated_at: new Date().toISOString(),
      };
      saveLocalProfile(updatedProfile);
      return updatedProfile;
    }

    // Validate display_name if provided
    if (updates.display_name !== undefined && updates.display_name !== null) {
      const trimmed = updates.display_name.trim();
      if (!trimmed) {
        throw new Error('Display name cannot be empty.');
      }
      if (trimmed.length > 50) {
        throw new Error('Display name cannot exceed 50 characters.');
      }
      updates.display_name = trimmed;
    }

    const payload = {
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating profile with preferences:', error);
      // If error indicates column missing, fallback to updating core fields only
      const corePayload: any = {
        id: userId,
        display_name: updates.display_name,
        timezone: updates.timezone,
        updated_at: new Date().toISOString(),
      };

      const { data: coreData, error: coreError } = await supabase
        .from('profiles')
        .upsert(corePayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (coreError) {
        throw new Error(coreError.message);
      }

      // Keep user's requested forex_pairs and strategies in memory/local fallback
      const local = getLocalProfile(userId, updates.display_name || 'Trader');
      const merged: Profile = {
        ...(coreData as Profile),
        forex_pairs: updates.forex_pairs || local.forex_pairs || DEFAULT_FOREX_PAIRS,
        strategies: updates.strategies || local.strategies || DEFAULT_STRATEGIES,
      };
      saveLocalProfile(merged);
      return merged;
    }

    if (!data) {
      throw new Error('Failed to update profile record.');
    }

    return {
      ...(data as Profile),
      forex_pairs: data.forex_pairs && data.forex_pairs.length > 0 ? data.forex_pairs : updates.forex_pairs || DEFAULT_FOREX_PAIRS,
      strategies: data.strategies && data.strategies.length > 0 ? data.strategies : updates.strategies || DEFAULT_STRATEGIES,
    };
  },
};

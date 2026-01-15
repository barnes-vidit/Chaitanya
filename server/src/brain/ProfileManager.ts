import { UserProfile } from '../models/UserProfile.js';

export class ProfileManager {

    async getProfile(userId: string) {
        try {
            let profile = await UserProfile.findOne({ userId });
            if (!profile) {
                // Auto-create if not exists
                profile = await UserProfile.create({ userId });
            }
            return profile;
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            return null;
        }
    }

    async updateProfile(userId: string, updates: any) {
        try {
            await UserProfile.findOneAndUpdate({ userId }, { ...updates, last_updated: new Date() }, { upsert: true });
        } catch (err) {
            console.error("Profile Update Error:", err);
        }
    }
}

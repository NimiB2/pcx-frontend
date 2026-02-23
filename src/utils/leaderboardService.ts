/**
 * Service for calculating leaderboard scores and rankings.
 * Handles scoring rules for different roles: operators, supervisors, and auditors.
 */

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    role: 'operator' | 'supervisor' | 'auditor';
    totalScore: number;
    rank: number;
    weeklyTrend: 'UP' | 'DOWN' | 'STABLE';
    breakdown: {
        basePoints: number;
        accuracyBonus: number;
        speedBonus: number;
        gpsBonus: number;          // operators only
        approvalsBonus: number;    // supervisors only
        slaBonus: number;          // supervisors + auditors
        penalties: number;
    };
    stats: {
        entriesCount?: number;         // operators
        validatedCount?: number;       // operators
        flaggedCount?: number;
        gpsVerifiedCount?: number;     // operators
        approvalsOnTime?: number;      // supervisors
        discrepanciesClosed?: number;  // supervisors + auditors
        flaggedResolved?: number;      // auditors
        signoffs?: number;             // auditors
    };
}

// In a real application, these would be calculated dynamically based on raw data.
// Since we don't have all the raw measurement/batch history tracked perfectly yet,
// we mostly rely on mock data or partial calculations for demo purposes.
// This function simulates taking raw users and activity data and producing rankings.

export const calculateLeaderboard = (
    allUsers: any[], // Type would be User[] from AuthContext
    measurements: any[],
    batches: any[],
    roleFilter?: 'operator' | 'supervisor' | 'auditor'
): LeaderboardEntry[] => {
    // Logic would normally aggregate stats per user here.
    // For now, this is a placeholder that would integrate with the actual data processing logic.
    // In our system we will use the mock data provided in mockData/index.ts to populate the board.

    return []; // Replaced by mock data in the UI layer for the MVP demo
};


/**
 * Normalizes a score to a 0-100 scale based on the maximum possible or historical score for that role.
 * This allows fair comparison across different roles in the "All" tab.
 */
export const getNormalizedScore = (entry: LeaderboardEntry): number => {
    // Define theoretical max scores for normalization
    const MAX_SCORES = {
        operator: 200,
        supervisor: 150,
        auditor: 120
    };

    const maxScore = MAX_SCORES[entry.role] || 100;
    const normalized = (entry.totalScore / maxScore) * 100;

    return Math.min(Math.max(Math.round(normalized), 0), 100);
};

/**
 * Generates a personalized tip for a user based on their performance breakdown.
 */
export const getPersonalTip = (entry: LeaderboardEntry): string => {
    if (entry.role === 'operator') {
        if (entry.breakdown.penalties < 0) {
            return "Reduce manual entries without justification to improve your score.";
        }
        if ((entry.stats.gpsVerifiedCount || 0) < (entry.stats.entriesCount || 0) * 0.8) {
            return "Submit more GPS-verified entries to gain bonus points and reach the next rank!";
        }
        if (entry.breakdown.speedBonus < 20) {
            return "Log your entries on the same day as the batch activity for a speed bonus.";
        }
        return "Great job! Keep maintaining high accuracy to stay at the top.";
    }

    if (entry.role === 'supervisor') {
        if ((entry.stats.approvalsOnTime || 0) < 5) {
            return "You have overdue approvals pulling your score down. Clear them out!";
        }
        if (entry.breakdown.slaBonus < 20) {
            return "Close discrepancies within the SLA deadline to boost your rank.";
        }
        return "Your team management is excellent. Keep up the timely approvals.";
    }

    if (entry.role === 'auditor') {
        if ((entry.stats.flaggedResolved || 0) < 3) {
            return "Resolve pending flagged items to increase your SLA bonus.";
        }
        return "Your reconciliation sign-offs are keeping the factory compliant!";
    }

    return "Keep up the good work!";
};

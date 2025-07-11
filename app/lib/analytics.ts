// Analytics Helper Functions for ChrisWrldArena Platform
// Comprehensive statistical analysis and metrics functions

import {
    User, Prediction, Subscription, Payment, BlogPost,
    View, Comment, Like, Save, Share, League, Notification,
    UserRole, PredictionResult, SubscriptionStatus, PaymentStatus,
    SubscriptionPlan, CommentEngagement
} from '@prisma/client';

// Extended types with relations
type PredictionWithRelations = Prediction & {
    createdBy: User;
    league_rel: League;
    Share: Share[];
    Save: Save[];
    Like: Like[];
    Comment: Comment[];
    View: View[];
};

type UserWithRelations = User & {
    predictions: Prediction[];
    subscriptions: Subscription[];
    payments: Payment[];
    Notification: Notification[];
    BlogPost: BlogPostWithRelations[];
    View: View[];
    Like: Like[];
    Save: Save[];
    Share: Share[];
    comments: Comment[];

};

type BlogPostWithRelations = BlogPost & {
    author: User;
    Share: Share[];
    Save: Save[];
    Like: Like[];
    Comment: Comment[];
    View: View[];
};

// Base interfaces for analytics
interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface StatisticalSummary {
    count: number;
    total?: number;
    average?: number;
    median?: number;
    mode?: any;
    min?: number;
    max?: number;
    variance?: number;
    standardDeviation?: number;
    percentiles?: {
        p25: number;
        p50: number;
        p75: number;
        p90: number;
        p95: number;
    };
}

interface EngagementMetrics {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalSaves: number;
    totalShares: number;
    engagementRate: number;
    averageEngagementPerPost: number;
}

interface RevenueMetrics {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
    customerLifetimeValue: number;
}

interface PredictionMetrics {
    totalPredictions: number;
    winRate: number;
    lossRate: number;
    pendingRate: number;
    averageOdds: number;
    mostSuccessfulLeague: string;
    performanceByMonth: Array<{ month: string; winRate: number }>;
}

// ============= STATISTICAL HELPER FUNCTIONS =============

export class StatisticsHelper {
    static calculateMean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    static calculateMedian(values: number[]): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    static calculateMode(values: any[]): any {
        const frequency: { [key: string]: number } = {};
        values.forEach(val => {
            const key = String(val);
            frequency[key] = (frequency[key] || 0) + 1;
        });

        let maxCount = 0;
        let mode = null;
        Object.entries(frequency).forEach(([key, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mode = values.find(val => String(val) === key);
            }
        });
        return mode;
    }

    static calculateVariance(values: number[]): number {
        if (values.length <= 1) return 0;
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return this.calculateMean(squaredDiffs);
    }

    static calculateStandardDeviation(values: number[]): number {
        return Math.sqrt(this.calculateVariance(values));
    }

    static calculatePercentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);

        if (lower === upper) return sorted[lower];
        return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
    }

    static getStatisticalSummary(values: number[]): StatisticalSummary {
        if (values.length === 0) {
            return { count: 0 };
        }

        return {
            count: values.length,
            total: values.reduce((sum, val) => sum + val, 0),
            average: this.calculateMean(values),
            median: this.calculateMedian(values),
            min: Math.min(...values),
            max: Math.max(...values),
            variance: this.calculateVariance(values),
            standardDeviation: this.calculateStandardDeviation(values),
            percentiles: {
                p25: this.calculatePercentile(values, 25),
                p50: this.calculatePercentile(values, 50),
                p75: this.calculatePercentile(values, 75),
                p90: this.calculatePercentile(values, 90),
                p95: this.calculatePercentile(values, 95),
            }
        };
    }
}

// ============= DATE UTILITY FUNCTIONS =============

export class DateHelper {
    static isWithinDateRange(date: Date, range: DateRange): boolean {
        return new Date(date) >= range.startDate && new Date(date) <= range.endDate;
    }

    static getDateRanges() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return {
            today: {
                startDate: today,
                endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            },
            yesterday: {
                startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000),
                endDate: new Date(today.getTime() - 1)
            },
            thisWeek: {
                startDate: new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000)),
                endDate: now
            },
            thisMonth: {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: now
            },
            last30Days: {
                startDate: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)),
                endDate: now
            },
            last90Days: {
                startDate: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)),
                endDate: now
            },
            thisYear: {
                startDate: new Date(now.getFullYear(), 0, 1),
                endDate: now
            }
        };
    }

    static groupByTimeInterval<T extends { createdAt: Date }>(
        items: T[],
        interval: 'day' | 'week' | 'month' | 'year'
    ): { [key: string]: T[] } {
        const groups: { [key: string]: T[] } = {};

        items.forEach(item => {
            let key: string;
            const date = new Date(item.createdAt);

            switch (interval) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'year':
                    key = String(date.getFullYear());
                    break;
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        return groups;
    }
}

// ============= USER ANALYTICS =============

export class UserAnalytics {
    static getUserMetrics(users: UserWithRelations[], dateRange?: DateRange): {
        totalUsers: number;
        activeUsers: number;
        newUsers: number;
        usersByRole: { [key in UserRole]: number };
        userGrowth: Array<{ date: string; count: number }>;
        topUsers: Array<{ user: User; score: number }>;
    } {
        const filteredUsers = dateRange
            ? users.filter(user => DateHelper.isWithinDateRange(user.createdAt, dateRange))
            : users;

        const usersByRole = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as { [key in UserRole]: number });

        // Calculate user growth over time
        const userGrowth = Object.entries(
            DateHelper.groupByTimeInterval(users, 'month')
        ).map(([date, usersInMonth]) => ({
            date,
            count: usersInMonth.length
        }));

        // Calculate top users based on engagement
        const topUsers = users.map(user => {
            const score = user.predictions.length * 3 +
                user.BlogPost.length * 5 +
                user.subscriptions.filter(s => s.status === 'ACTIVE').length * 10;
            return { user, score };
        }).sort((a, b) => b.score - a.score).slice(0, 10);

        return {
            totalUsers: users.length,
            activeUsers: users.filter(user =>
                user.subscriptions.some(s => s.status === 'ACTIVE') ||
                user.predictions.some(p =>
                    new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                )
            ).length,
            newUsers: filteredUsers.length,
            usersByRole,
            userGrowth,
            topUsers
        };
    }

    static getUserEngagementMetrics(users: UserWithRelations[]): EngagementMetrics {
        const totalViews = users.reduce((sum, user) => sum + user.BlogPost.reduce((postSum, post) => postSum + post.View.length, 0), 0);
        const totalLikes = users.reduce((sum, user) => sum + user.BlogPost.reduce((postSum, post) => postSum + post.Like.length, 0), 0);
        const totalComments = users.reduce((sum, user) => sum + user.BlogPost.reduce((postSum, post) => postSum + post.Comment.length, 0), 0);
        const totalSaves = users.reduce((sum, user) => sum + user.BlogPost.reduce((postSum, post) => postSum + post.Save.length, 0), 0);
        const totalShares = users.reduce((sum, user) => sum + user.BlogPost.reduce((postSum, post) => postSum + post.Share.length, 0), 0);

        const totalPosts = users.reduce((sum, user) => sum + user.BlogPost.length, 0);
        const totalEngagement = totalLikes + totalComments + totalSaves + totalShares;

        return {
            totalViews,
            totalLikes,
            totalComments,
            totalSaves,
            totalShares,
            engagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
            averageEngagementPerPost: totalPosts > 0 ? totalEngagement / totalPosts : 0
        };
    }
}

// ============= PREDICTION ANALYTICS =============

export class PredictionAnalytics {
    static getPredictionMetrics(predictions: PredictionWithRelations[], dateRange?: DateRange): PredictionMetrics {
        const filteredPredictions = dateRange
            ? predictions.filter(p => DateHelper.isWithinDateRange(p.publishedAt, dateRange))
            : predictions;

        const totalPredictions = filteredPredictions.length;
        const wonPredictions = filteredPredictions.filter(p => p.result === 'WON').length;
        const lostPredictions = filteredPredictions.filter(p => p.result === 'LOST').length;
        const pendingPredictions = filteredPredictions.filter(p => p.result === 'PENDING').length;

        const winRate = totalPredictions > 0 ? (wonPredictions / totalPredictions) * 100 : 0;
        const lossRate = totalPredictions > 0 ? (lostPredictions / totalPredictions) * 100 : 0;
        const pendingRate = totalPredictions > 0 ? (pendingPredictions / totalPredictions) * 100 : 0;

        // Calculate average odds
        const oddsValues = filteredPredictions
            .filter(p => p.odds)
            .map(p => parseFloat(p.odds!))
            .filter(odds => !isNaN(odds));

        const averageOdds = StatisticsHelper.calculateMean(oddsValues);

        // Find most successful league
        const leagueStats = filteredPredictions.reduce((acc, prediction) => {
            if (!acc[prediction.league]) {
                acc[prediction.league] = { total: 0, won: 0 };
            }
            acc[prediction.league].total++;
            if (prediction.result === 'WON') {
                acc[prediction.league].won++;
            }
            return acc;
        }, {} as { [league: string]: { total: number; won: number } });

        const mostSuccessfulLeague = Object.entries(leagueStats)
            .map(([league, stats]) => ({
                league,
                winRate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0
            }))
            .sort((a, b) => b.winRate - a.winRate)[0]?.league || '';

        // Performance by month
        const monthlyGroups = DateHelper.groupByTimeInterval(filteredPredictions, 'month');
        const performanceByMonth = Object.entries(monthlyGroups).map(([month, preds]) => {
            const monthWon = preds.filter(p => p.result === 'WON').length;
            const monthTotal = preds.filter(p => p.result !== 'PENDING').length;
            return {
                month,
                winRate: monthTotal > 0 ? (monthWon / monthTotal) * 100 : 0
            };
        });

        return {
            totalPredictions,
            winRate,
            lossRate,
            pendingRate,
            averageOdds,
            mostSuccessfulLeague,
            performanceByMonth
        };
    }

    static getPredictionEngagement(predictions: PredictionWithRelations[]): EngagementMetrics {
        const totalViews = predictions.reduce((sum, p) => sum + p.View.length, 0);
        const totalLikes = predictions.reduce((sum, p) => sum + p.Like.length, 0);
        const totalComments = predictions.reduce((sum, p) => sum + p.Comment.length, 0);
        const totalSaves = predictions.reduce((sum, p) => sum + p.Save.length, 0);
        const totalShares = predictions.reduce((sum, p) => sum + p.Share.length, 0);

        const totalEngagement = totalLikes + totalComments + totalSaves + totalShares;

        return {
            totalViews,
            totalLikes,
            totalComments,
            totalSaves,
            totalShares,
            engagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
            averageEngagementPerPost: predictions.length > 0 ? totalEngagement / predictions.length : 0
        };
    }
}

// ============= REVENUE ANALYTICS =============

export class RevenueAnalytics {
    static getRevenueMetrics(
        payments: Payment[],
        subscriptions: Subscription[],
        users: User[],
        dateRange?: DateRange
    ): RevenueMetrics {
        const filteredPayments = dateRange
            ? payments.filter(p => DateHelper.isWithinDateRange(p.createdAt, dateRange))
            : payments;

        const successfulPayments = filteredPayments.filter(p => p.status === 'SUCCESS');
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

        // Calculate MRR (Monthly Recurring Revenue)
        const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
        const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
            switch (sub.plan) {
                case 'MONTHLY': return sum + (payments.find(p => p.userId === sub.userId)?.amount || 0);
                case 'YEARLY': return sum + ((payments.find(p => p.userId === sub.userId)?.amount || 0) / 12);
                case 'WEEKLY': return sum + ((payments.find(p => p.userId === sub.userId)?.amount || 0) * 4.33);
                case 'DAILY': return sum + ((payments.find(p => p.userId === sub.userId)?.amount || 0) * 30);
                default: return sum;
            }
        }, 0);

        const totalUsers = users.length;
        const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

        // Calculate conversion rate (users with active subscriptions / total users)
        const subscribedUsers = activeSubscriptions.length;
        const conversionRate = totalUsers > 0 ? (subscribedUsers / totalUsers) * 100 : 0;

        // Calculate churn rate (expired subscriptions in last month)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const churnedSubscriptions = subscriptions.filter(s =>
            s.status === 'EXPIRED' && s.updatedAt > lastMonth
        ).length;
        const churnRate = activeSubscriptions.length > 0 ?
            (churnedSubscriptions / (activeSubscriptions.length + churnedSubscriptions)) * 100 : 0;

        // Estimate Customer Lifetime Value
        const avgSubscriptionLength = 12; // months (estimate)
        const customerLifetimeValue = averageRevenuePerUser * avgSubscriptionLength;

        return {
            totalRevenue,
            monthlyRecurringRevenue: monthlyRevenue,
            averageRevenuePerUser,
            conversionRate,
            churnRate,
            customerLifetimeValue
        };
    }

    static getPaymentAnalytics(payments: Payment[]): {
        paymentsByStatus: { [key in PaymentStatus]: number };
        paymentsByProvider: { [provider: string]: number };
        averagePaymentAmount: number;
        paymentTrends: Array<{ date: string; amount: number; count: number }>;
    } {
        const paymentsByStatus = payments.reduce((acc, payment) => {
            acc[payment.status] = (acc[payment.status] || 0) + 1;
            return acc;
        }, {} as { [key in PaymentStatus]: number });

        const paymentsByProvider = payments.reduce((acc, payment) => {
            acc[payment.provider] = (acc[payment.provider] || 0) + 1;
            return acc;
        }, {} as { [provider: string]: number });

        const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
        const amounts = successfulPayments.map(p => p.amount);
        const averagePaymentAmount = StatisticsHelper.calculateMean(amounts);

        const monthlyGroups = DateHelper.groupByTimeInterval(payments, 'month');
        const paymentTrends = Object.entries(monthlyGroups).map(([date, monthPayments]) => ({
            date,
            amount: monthPayments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0),
            count: monthPayments.length
        }));

        return {
            paymentsByStatus,
            paymentsByProvider,
            averagePaymentAmount,
            paymentTrends
        };
    }
}

// ============= CONTENT ANALYTICS =============

export class ContentAnalytics {
    static getBlogPostMetrics(blogPosts: BlogPostWithRelations[], dateRange?: DateRange): {
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        postsByCategory: { [category: string]: number };
        topPerformingPosts: Array<{ post: BlogPost; engagementScore: number }>;
        contentTrends: Array<{ date: string; count: number }>;
    } {
        const filteredPosts = dateRange
            ? blogPosts.filter(post => DateHelper.isWithinDateRange(post.createdAt, dateRange))
            : blogPosts;

        const publishedPosts = filteredPosts.filter(post => post.status === 'published').length;
        const draftPosts = filteredPosts.filter(post => post.status === 'draft').length;

        const postsByCategory = filteredPosts.reduce((acc, post) => {
            acc[post.category] = (acc[post.category] || 0) + 1;
            return acc;
        }, {} as { [category: string]: number });

        const topPerformingPosts = blogPosts.map(post => {
            const engagementScore = post.View.length +
                (post.Like.length * 2) +
                (post.Comment.length * 3) +
                (post.Save.length * 4) +
                (post.Share.length * 5);
            return { post, engagementScore };
        }).sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 10);

        const monthlyGroups = DateHelper.groupByTimeInterval(filteredPosts, 'month');
        const contentTrends = Object.entries(monthlyGroups).map(([date, posts]) => ({
            date,
            count: posts.length
        }));

        return {
            totalPosts: filteredPosts.length,
            publishedPosts,
            draftPosts,
            postsByCategory,
            topPerformingPosts,
            contentTrends
        };
    }
}

// ============= SUMMARY AND HISTORY FUNCTIONS =============

export class SummaryAnalytics {
    static getLatestOperationsSummary<T extends { createdAt: Date }>(
        operations: T[],
        limit: number = 5
    ): T[] {
        return operations
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    }

    static getDashboardSummary(data: {
        users: UserWithRelations[];
        predictions: PredictionWithRelations[];
        payments: Payment[];
        subscriptions: Subscription[];
        blogPosts: BlogPostWithRelations[];
    }) {
        const dateRanges = DateHelper.getDateRanges();
        try {
            return {
                overview: {
                    totalUsers: data.users.length,
                    totalPredictions: data.predictions.length,
                    totalRevenue: data.payments
                        .filter(p => p.status === 'SUCCESS')
                        .reduce((sum, p) => sum + p.amount, 0),
                    activeSubscriptions: data.subscriptions.filter(s => s.status === 'ACTIVE').length
                },
                recentActivity: {
                    latestUsers: this.getLatestOperationsSummary(data.users),
                    latestPredictions: this.getLatestOperationsSummary(data.predictions),
                    latestPayments: this.getLatestOperationsSummary(data.payments),
                    latestBlogPosts: this.getLatestOperationsSummary(data.blogPosts)
                },
                todayMetrics: {
                    newUsers: data.users.filter(u =>
                        DateHelper.isWithinDateRange(u.createdAt, dateRanges.today)
                    ).length,
                    newPredictions: data.predictions.filter(p =>
                        DateHelper.isWithinDateRange(p.publishedAt, dateRanges.today)
                    ).length,
                    todayRevenue: data.payments
                        .filter(p => p.status === 'SUCCESS' &&
                            DateHelper.isWithinDateRange(p.createdAt, dateRanges.today))
                        .reduce((sum, p) => sum + p.amount, 0),

                    todayRevenueCount: data.payments
                        .filter(p => p.status === 'SUCCESS' &&
                            DateHelper.isWithinDateRange(p.createdAt, dateRanges.today)).length
                },
                trends: {
                    userGrowth: UserAnalytics.getUserMetrics(data.users, dateRanges.last30Days),
                    predictionPerformance: PredictionAnalytics.getPredictionMetrics(data.predictions, dateRanges.last30Days),
                    revenueMetrics: RevenueAnalytics.getRevenueMetrics(
                        data.payments,
                        data.subscriptions,
                        data.users,
                        dateRanges.last30Days
                    )
                }
            };
        }
        catch (error) {
            console.error("Error generating dashboard summary:", error);
            return null;

        }
    }

}
// ============= ADVANCED FILTERING AND SORTING =============

export class DataProcessor {
    static filterByDateRange<T extends { createdAt: Date }>(
        items: T[],
        range: DateRange
    ): T[] {
        return items.filter(item => DateHelper.isWithinDateRange(item.createdAt, range));
    }

    static sortByField<T>(
        items: T[],
        field: keyof T,
        direction: 'asc' | 'desc' = 'desc'
    ): T[] {
        return [...items].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    static groupBy<T>(items: T[], keyFunction: (item: T) => string): { [key: string]: T[] } {
        return items.reduce((groups, item) => {
            const key = keyFunction(item);
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
        }, {} as { [key: string]: T[] });
    }

    static paginate<T>(items: T[], page: number, limit: number): {
        data: T[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    } {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            data: items.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
}

// ============= EXPORT ALL ANALYTICS =============

export const Analytics = {
    Statistics: StatisticsHelper,
    Date: DateHelper,
    User: UserAnalytics,
    Prediction: PredictionAnalytics,
    Revenue: RevenueAnalytics,
    Content: ContentAnalytics,
    Summary: SummaryAnalytics,
    DataProcessor
};

export default Analytics;
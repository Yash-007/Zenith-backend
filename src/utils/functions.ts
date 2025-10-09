export const getLeaderboardCacheKey = (page: number, lowerAge: number | undefined, upperAge: number | undefined, city: string) => {
    return `leaderboard:page_${page}_lowerAge_${lowerAge}_upperAge_${upperAge}_city_${city}`
}

export const getUserRankLeaderboardCacheKey = (userId: string) => {
    return `leaderboard:userId_${userId}`
}

export const getUserChallengesCacheKey = (userId: string) => {
    return `challenges:userId_${userId}`
}

export const getCategoriesCacheKey = () => {
    return `categories`
}
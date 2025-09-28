export const getLeaderboardCacheKey = (page: number, lowerAge: number, upperAge: number, city: string) => {
    return `leaderboard:page_${page}_lowerAge_${lowerAge}_upperAge_${upperAge}_city_${city}`
}

export const getUserRankLeaderboardCacheKey = (userId: string) => {
    return `leaderboard:userId_${userId}`
}
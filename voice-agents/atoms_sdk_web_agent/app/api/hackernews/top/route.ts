import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch top 500 story IDs
        const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
        if (!topStoriesRes.ok) throw new Error('Failed to fetch top stories');

        const topStoryIds = await topStoriesRes.json();
        const top5Ids = topStoryIds.slice(0, 5); // Just get the top 5 for the voice agent to read

        // Fetch details for each of the top 5 stories
        const storyDetails = await Promise.all(
            top5Ids.map(async (id: number) => {
                const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
                return res.json();
            })
        );

        const stories = storyDetails.map(story => ({
            title: story.title,
            url: story.url,
            score: story.score,
            by: story.by,
        }));

        return NextResponse.json({ stories });
    } catch (error) {
        console.error("[API] Error fetching Hacker News:", error);
        return NextResponse.json(
            { error: 'Failed to fetch Hacker News' },
            { status: 500 }
        );
    }
}

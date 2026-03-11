import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdminApi } from '@/lib/admin-auth';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';

export async function GET() {
    try {
        await connectDB();
        const liveSettings = await Settings.findOne({ key: 'youtube_live_link' });
        return NextResponse.json({
            youtubeLink: liveSettings?.value || '',
            videoId: liveSettings?.value ? extractYouTubeVideoId(liveSettings.value) : null
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();
        const { youtubeLink } = await request.json();

        if (!youtubeLink) {
            // Allow clearing the link
            await connectDB();
            await Settings.findOneAndUpdate(
                { key: 'youtube_live_link' },
                { value: '' },
                { upsert: true, new: true }
            );
            return NextResponse.json({ success: true, youtubeLink: '' });
        }

        const videoId = extractYouTubeVideoId(youtubeLink);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        await connectDB();
        await Settings.findOneAndUpdate(
            { key: 'youtube_live_link' },
            { value: youtubeLink },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, youtubeLink, videoId });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

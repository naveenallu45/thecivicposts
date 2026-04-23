import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdminApi } from '@/lib/admin-auth';
import { requirePublisherApi } from '@/lib/publisher-auth';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';

async function requireAdminOrPublisherApi() {
  try {
    return await requireAdminApi();
  } catch {
    try {
      return await requirePublisherApi();
    } catch {
      throw new Error('Unauthorized: Admin or Publisher authentication required');
    }
  }
}

export async function GET() {
    try {
        await connectDB();
        const [liveLinksSettings, liveSettings] = await Promise.all([
            Settings.findOne({ key: 'youtube_live_links' }),
            Settings.findOne({ key: 'youtube_live_link' }),
        ]);
        const youtubeLinks = Array.isArray(liveLinksSettings?.value)
            ? liveLinksSettings.value.filter((link: unknown) => typeof link === 'string' && link.trim().length > 0)
            : (liveSettings?.value ? [String(liveSettings.value)] : []);

        return NextResponse.json({
            youtubeLinks,
            youtubeLink: youtubeLinks[0] || '',
            videoIds: youtubeLinks.map((link: string) => extractYouTubeVideoId(link)).filter(Boolean),
            videoId: youtubeLinks[0] ? extractYouTubeVideoId(youtubeLinks[0]) : null
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminOrPublisherApi();
        const body = await request.json();
        const incomingLinks = Array.isArray(body.youtubeLinks)
            ? body.youtubeLinks
            : (body.youtubeLink ? [body.youtubeLink] : []);
        const youtubeLinks = incomingLinks
            .map((link: unknown) => String(link || '').trim())
            .filter(Boolean);

        const invalidLink = youtubeLinks.find((link: string) => !extractYouTubeVideoId(link));
        if (invalidLink) {
            return NextResponse.json({ error: `Invalid YouTube URL: ${invalidLink}` }, { status: 400 });
        }

        await connectDB();
        await Promise.all([
            Settings.findOneAndUpdate(
                { key: 'youtube_live_links' },
                { value: youtubeLinks },
                { upsert: true, returnDocument: 'after' }
            ),
            Settings.findOneAndUpdate(
                { key: 'youtube_live_link' },
                { value: youtubeLinks[0] || '' },
                { upsert: true, returnDocument: 'after' }
            ),
        ]);

        return NextResponse.json({
            success: true,
            youtubeLinks,
            youtubeLink: youtubeLinks[0] || '',
            videoIds: youtubeLinks.map((link: string) => extractYouTubeVideoId(link)).filter(Boolean),
            videoId: youtubeLinks[0] ? extractYouTubeVideoId(youtubeLinks[0]) : null,
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

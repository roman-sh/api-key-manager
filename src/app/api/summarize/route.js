import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const { githubUrl } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required in x-api-key header' },
        { status: 400 }
      );
    }

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, user_id')
      .eq('key', apiKey)
      .single();

    if (!data) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid API key'
      });
    }

    if (error) throw error;

    const readmeContent = await getReadmeContent(githubUrl);

    const { summarizeReadme } = await import('@/lib/chain');
    const result = await summarizeReadme(readmeContent);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: result.summary
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

async function getReadmeContent(githubUrl) {
  // Convert regular GitHub URL to raw content URL for README.md
  const rawUrl = githubUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace(/\/tree\//, '/') + '/main/README.md';

  try {
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      // Try master branch if main branch fails
      const masterUrl = rawUrl.replace('/main/', '/master/');
      const masterResponse = await fetch(masterUrl);
      
      if (!masterResponse.ok) {
        throw new Error('README.md not found in main or master branch');
      }
      
      return await masterResponse.text();
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    throw new Error('Failed to fetch README content');
  }
}

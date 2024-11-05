import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
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
    
    return NextResponse.json({
      valid: true,
      message: 'Valid API key',
      keyName: data.name,
    });

  } catch (error) {
    console.error('API validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
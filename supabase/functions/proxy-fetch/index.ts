const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'FIRECRAWL_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { url } = await req.json().catch(() => ({ url: null }));
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'A valid `url` is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Only http(s) URLs are allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const fcRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: parsed.toString(),
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const data = await fcRes.json().catch(() => ({}));

    if (!fcRes.ok) {
      const message =
        (data as { error?: string }).error ||
        `Firecrawl request failed [${fcRes.status}]`;
      const status = fcRes.status === 402 ? 402 : 502;
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Normalize: SDK-style returns top-level fields, REST may wrap in { data: {...} }
    const doc =
      'markdown' in data && data.markdown
        ? data
        : (data as { data?: Record<string, unknown> }).data || {};

    return new Response(
      JSON.stringify({
        success: true,
        markdown: (doc as { markdown?: string }).markdown ?? '',
        links: (doc as { links?: string[] }).links ?? [],
        metadata: (doc as { metadata?: Record<string, unknown> }).metadata ?? {},
        sourceUrl: parsed.toString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('proxy-fetch error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

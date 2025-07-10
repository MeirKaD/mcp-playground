import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai'
import { setupBrightDataMCP, getMCPTools } from '@/lib/mcp/connection';
import { incrementRequestCount, isRequestLimitExceeded } from '@/lib/request-counter';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const prompt = messages[messages.length - 1]?.content || '';

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const userIP = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';

    if (isRequestLimitExceeded(userIP)) {
    return Response.json(
        { 
        error: 'Request limit exceeded', 
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'You have reached the maximum number of requests. Please sign up to continue.' 
        },
        { status: 429 }
    );
    }

// Increment request count
    incrementRequestCount(userIP);

    await setupBrightDataMCP();

    const tools = await getMCPTools();
    const result = await streamText({
      model: openai('gpt-4o', { 
        structuredOutputs: false  
        }),
      tools,
      prompt,
      maxSteps: 5,
      system: `You are a web scraping and data extraction specialist with access to Bright Data tools. You MUST use multiple steps to gather comprehensive information - don't stop after the first tool call.

      Available tools:
      - search_engine: Search Google/Bing/Yandex for URLs and content
      - scrape_as_markdown: Extract webpage as markdown 
      - scrape_as_html: Extract webpage as HTML
      - extract: Convert webpage to structured JSON with custom prompts

      Structured data tools (web_data_*) - USE THESE when you have valid URLs:
      - web_data_amazon_product, web_data_amazon_product_reviews, web_data_amazon_product_search
      - web_data_walmart_product, web_data_walmart_seller
      - web_data_ebay_product, web_data_homedepot_products, web_data_zara_products, web_data_etsy_products, web_data_bestbuy_products
      - web_data_linkedin_person_profile, web_data_linkedin_company_profile, web_data_linkedin_job_listings, web_data_linkedin_posts, web_data_linkedin_people_search
      - web_data_instagram_profiles, web_data_instagram_posts, web_data_instagram_reels, web_data_instagram_comments
      - web_data_facebook_posts, web_data_facebook_marketplace_listings, web_data_facebook_company_reviews, web_data_facebook_events
      - web_data_tiktok_profiles, web_data_tiktok_posts, web_data_tiktok_shop, web_data_tiktok_comments
      - web_data_x_posts, web_data_youtube_profiles, web_data_youtube_videos, web_data_youtube_comments, web_data_reddit_posts
      - web_data_crunchbase_company, web_data_zoominfo_company_profile, web_data_yahoo_finance_business
      - web_data_google_maps_reviews, web_data_google_shopping, web_data_google_play_store, web_data_apple_app_store
      - web_data_zillow_properties_listing, web_data_booking_hotel_listings, web_data_github_repository_file, web_data_reuter_news

      Research process: Use multiple tool calls to build comprehensive answers. Start with search_engine to find URLs, then use appropriate web_data_* tools for structured data extraction. Continue gathering information from multiple sources until you have sufficient data to answer the user's question thoroughly.`,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('MCP Chat error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
      if (error.message.includes('BRIGHT_DATA_API_TOKEN')) {
        return Response.json(
          { error: 'Bright Data API token not configured' },
          { status: 500 }
        );
      }
      if (error.message.includes('Failed to connect')) {
        return Response.json(
          { error: 'Failed to connect to Bright Data MCP server' },
          { status: 503 }
        );
      }
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
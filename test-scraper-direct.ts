import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

async function testDirectScraping() {
  console.log('🔍 Testing direct scraping without external dependencies...\n');
  
  // Test 1: Hacker News API
  try {
    console.log('📡 Testing Hacker News API...');
    const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = response.data.slice(0, 3);
    
    const storyPromises = storyIds.map((id: number) =>
      axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    );
    const stories = await Promise.all(storyPromises);
    
    console.log(`✅ Hacker News: ${stories.length} stories fetched`);
    stories.forEach((story, i) => {
      console.log(`   ${i+1}. ${story.data.title}`);
    });
  } catch (error) {
    console.log('❌ Hacker News failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 2: TechCrunch RSS
  try {
    console.log('📡 Testing TechCrunch RSS...');
    const rssParser = new Parser();
    const feed = await rssParser.parseURL('https://techcrunch.com/category/artificial-intelligence/feed/');
    
    console.log(`✅ TechCrunch AI: ${feed.items.length} articles fetched`);
    feed.items.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i+1}. ${item.title}`);
    });
  } catch (error) {
    console.log('❌ TechCrunch failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 3: GitHub Trending HTML
  try {
    console.log('📡 Testing GitHub Trending HTML...');
    const response = await axios.get('https://github.com/trending', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
      },
    });
    
    const $ = cheerio.load(response.data);
    const repos: string[] = [];
    
    $('.Box-row').each((i, elem) => {
      if (i >= 3) return; // Limit to 3 for testing
      
      const titleElem = $(elem).find('h2 a');
      const title = titleElem.text().trim();
      if (title) {
        repos.push(title);
      }
    });
    
    console.log(`✅ GitHub Trending: ${repos.length} repos fetched`);
    repos.forEach((repo, i) => {
      console.log(`   ${i+1}. ${repo}`);
    });
  } catch (error) {
    console.log('❌ GitHub Trending failed:', error.message);
  }
  
  console.log('\n');
  
  // Test 4: VentureBeat RSS
  try {
    console.log('📡 Testing VentureBeat RSS...');
    const rssParser = new Parser();
    const feed = await rssParser.parseURL('https://venturebeat.com/category/ai/feed/');
    
    console.log(`✅ VentureBeat AI: ${feed.items.length} articles fetched`);
    feed.items.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i+1}. ${item.title}`);
    });
  } catch (error) {
    console.log('❌ VentureBeat failed:', error.message);
  }
  
  console.log('\n✅ Direct scraping test complete!');
}

testDirectScraping().catch(console.error);
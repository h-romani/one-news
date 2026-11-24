
const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

const NEWS_FEED_URL = "https://www.theguardian.com/world/rss";

app.use(express.static("public"));
app.use(express.json());

app.get("/api/rss", async (req, res) => {
  try {
    const feed = await parser.parseURL(NEWS_FEED_URL);

    res.json({
      articles: feed.items.map(item => ({
        title: item.title,
        description: item.contentSnippet,
        link: item.link,
        pubDate: item.pubDate
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load news feed" });
  }
});

// Select one recent story
app.get("/api/daily-story", async (req, res) => {
  try {
    const feed = await parser.parseURL(NEWS_FEED_URL);

    const now = Date.now();

    const recentArticles = feed.items
      .filter(item => {
        const published = new Date(item.pubDate).getTime();
        return !isNaN(published) &&
          now - published <= 48 * 60 * 60 * 1000 &&
          published <= now;
      })
      .sort((a, b) =>
        new Date(b.pubDate) - new Date(a.pubDate)
      );

    if (!recentArticles.length) {
      return res.status(404).json({
        error: "No recent stories available"
      });
    }

    const story = recentArticles[0];

    res.json({
      title: story.title,
      description: story.contentSnippet,
      link: story.link,
      pubDate: story.pubDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not select today's story"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ONE running on port ${PORT}`);
});

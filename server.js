
const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();

// Your news source — change this whenever you want
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ONE running on port ${PORT}`);
});

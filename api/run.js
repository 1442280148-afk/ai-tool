export default async function handler(req, res) {
  try {
    const { task } = req.body;

    let resultText = "";

    // 👉 判断是不是问天气
    if (task.includes("天气")) {
      const city = "佛山";

      const weatherRes = await fetch(
        `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(city)}&key=${process.env.AMAP_KEY}`
      );

      const weatherData = await weatherRes.json();
      const live = weatherData.lives?.[0];

      resultText = `
城市：${live.city}
天气：${live.weather}
温度：${live.temperature}℃
风力：${live.windpower}
湿度：${live.humidity}%
`;
    }

    // 👉 判断是不是问新闻
    else if (task.includes("新闻")) {
      const newsRes = await fetch(
        `http://api.tianapi.com/topnews/index?key=${process.env.NEWS_KEY}`
      );

      const newsData = await newsRes.json();

      const list = newsData.newslist?.slice(0, 5) || [];

      resultText = list.map(item => `- ${item.title}`).join("\n");
    }

    // 👉 AI整理输出
    const aiRes = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KIMI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "user",
            content: `请把以下内容整理成一段清晰、自然的说明：\n${resultText}`
          }
        ]
      })
    });

    const aiData = await aiRes.json();
    const result = aiData.choices?.[0]?.message?.content || "无结果";

    res.status(200).json({ result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

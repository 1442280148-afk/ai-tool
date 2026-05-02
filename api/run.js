export default async function handler(req, res) {
  try {
    const { task } = req.body;

    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KIMI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          { role: "user", content: task }
        ]
      })
    });

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content || "没有返回内容";

    res.status(200).json({ result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

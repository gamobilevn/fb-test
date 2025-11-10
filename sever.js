import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// API trung gian gửi event đến Facebook
app.post("/send-event", async (req, res) => {
  const { pixel_id, access_token, event_name, price, product_name, test_event_code } = req.body;

  if (!pixel_id || !access_token) {
    return res.status(400).json({ error: "Thiếu pixel_id hoặc access_token" });
  }

  const url = `https://graph.facebook.com/v16.0/${pixel_id}/events?access_token=${access_token}${test_event_code ? "&test_event_code=" + test_event_code : ""}`;
  const payload = {
    data: [{
      event_name: event_name || "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: "http://localhost",
      custom_data: {
        currency: "VND",
        value: price,
        content_name: product_name
      },
      user_data: {
        client_user_agent: "Mozilla/5.0",
        client_ip_address: "8.8.8.8",
        external_id: "test_user_1"
      }
    }]
  };

  try {
    const fbRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await fbRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server chạy tại http://localhost:3000"));

const ProductModel = require("../models/product");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const chatWithStoreAssistant = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      message: "Add GEMINI_API_KEY to Backend/.env and restart the backend. Until then, please use the Contact page for help.",
    });
  }

  const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = rawMessages.slice(-8).flatMap((message) => {
    if (!message || !["user", "model"].includes(message.role) || typeof message.text !== "string") return [];
    const text = message.text.trim().slice(0, 1200);
    return text ? [{ role: message.role, parts: [{ text }] }] : [];
  });
  if (!messages.length || messages.at(-1).role !== "user") {
    return res.status(400).json({ success: false, message: "Type a message to start chatting." });
  }

  try {
    const products = await ProductModel.find({ stock: { $gt: 0 } })
      .select("title category fragranceType actualPrice description burningTime weight material stock")
      .limit(60)
      .lean();
    const storeContext = {
      store: "Serein Incense",
      shippingBanner: "Complimentary shipping over ₹999.",
      contactEmail: "sd83580@gmail.com",
      productCatalog: products.map(({ title, category, fragranceType, actualPrice, description, burningTime, weight, material, stock }) => ({
        title, category, fragranceType, priceINR: actualPrice, description, burningTime, weightGrams: weight, material, stock,
      })),
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are Serein Incense's concise, friendly shopping assistant. Answer only questions about this store, its listed products, checkout, and basic order help. Use the store data below as your source of truth. Do not invent products, prices, stock, delivery promises, refund rules, or policies. If information is missing, say you are not sure and direct the customer to the Contact page or ${storeContext.contactEmail}. Do not claim to look up an individual customer's order or request passwords, OTPs, full card details, or payment credentials. Keep answers short and useful. Store data: ${JSON.stringify(storeContext)}` }],
        },
        contents: messages,
        generationConfig: { temperature: 0.35, maxOutputTokens: 300 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Gemini chat request failed:", response.status, result.error?.status || "provider error");
      const status = response.status === 429 ? 429 : 502;
      return res.status(status).json({
        success: false,
        message: response.status === 429
          ? "The free chat limit has been reached for now. Please try again later or contact us."
          : "The chat assistant could not answer just now. Please try again or contact us.",
      });
    }

    const answer = (result.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim();
    if (!answer) {
      return res.status(502).json({ success: false, message: "I couldn't prepare an answer. Please try again." });
    }
    return res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Store chat failed:", error.name);
    return res.status(502).json({ success: false, message: "The chat assistant is temporarily unavailable. Please contact us." });
  }
};

module.exports = { chatWithStoreAssistant };

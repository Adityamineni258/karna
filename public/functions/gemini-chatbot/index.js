const { GoogleGenerativeAI } = require("@google/generative-ai")
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager")

async function fetchWrapper(url, options) {
    const fetch = (await import("node-fetch")).default
    return fetch(url, options)
}

async function getAPIKey() {
    const client = new SecretManagerServiceClient()
    const [version] = await client.accessSecretVersion({
        name: "projects/karna-ai/secrets/gemini-api-key/versions/1"
    })
    return version.payload.data.toString()
}

async function getGeminiResponse(apiKey, contents) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { temperature: 0.4 }
    })

    const chat = model.startChat({
        systemInstruction: {
            role: "system",
            parts: [{
                text: "You are Karna, an empathetic AI friend who offers emotional support and kindness. Reply in a friendly and comforting tone using simple language. Do not include any emojis in your responses. Keep responses short, warm, and supportive."
            }]
        },
        history: contents.slice(0, -1) // all messages except the latest user message
    })

    const lastMessage = contents[contents.length - 1]
    const response = await chat.sendMessage(lastMessage.parts[0].text)
    return response.response.text()
}

async function classifyEmoji(apiKey, messageText) {
    const emojiPrompt = `Given the user message below, identify the intent and suggest an emoji name from the following list. Respond ONLY in this exact JSON format: {"intent": "<intent>", "expression": "<emoji-name>"}

User message: "${messageText}"

Emoji names you can use: angry-mad, angry-mad-yelling, blank-stare-reactionless, bored-disappointed, bored-reactionless-disappointed, cry-sad-tears, cute-smile, dead-blank-emoji, dead-emoji, dead-tongue-emoji, disappointed-angry-bored-sad, disgusted-emoji, dull-mad-angry, evil-smile, happy-kiss, happy-normal, happy-smile-blink, happy-smile-emoji, happy-tongue, happy-upside-down, happy-wink, kiss, laughing-hard, laugh-smile-drop, nervous-teeth, sad, sad-crying, sad-embarrassed-dismay, sad-pain, serene-smile, shocked, smile-wink, surprised, tongue, very-happy, wry-tongue.`

    const emojiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const emojiBody = {
        contents: [{ role: "user", parts: [{ text: emojiPrompt }] }]
    }

    const response = await fetchWrapper(emojiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emojiBody)
    })

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const cleanText = rawText.trim().replace(/```json\n?|```/g, "")

    try {
        return JSON.parse(cleanText)
    } catch {
        return { intent: "unknown", expression: "happy-normal" }
    }
}

async function translateText(apiKey, text, targetLang) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const translationPrompt = `Translate the following text to ${targetLang}: ${text}`
    const result = await model.generateContent(translationPrompt)

    return result.response.text()
}

exports.geminiChatbot = async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*")
    res.set("Access-Control-Allow-Methods", "POST")
    res.set("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") return res.status(204).send("")

    try {
        console.log("Received body:", JSON.stringify(req.body, null, 2))
        const contents = req.body.contents
        const languageCode = req.body.languageCode || "en-US"

        if (!contents || contents.length === 0) {
            return res.status(400).json({ error: "No conversation history found." })
        }

        const userMessage = contents[contents.length - 1]?.parts?.[0]?.text
        if (!userMessage) {
            return res.status(400).json({ error: "No user message found." })
        }

        const apiKey = await getAPIKey()
        const textResponse = await getGeminiResponse(apiKey, contents)
        const emojiResponse = await classifyEmoji(apiKey, userMessage)

        let translatedText = textResponse
        if (languageCode !== "en-US") {
            try {
                translatedText = await translateText(apiKey, textResponse, languageCode)
            } catch (e) {
                return res.status(500).json({ error: "Translation failed", details: e.message })
            }
        }

        res.status(200).json({ text: translatedText, emoji: emojiResponse })
    } catch (error) {
        res.status(500).json({ error: "Unexpected error", details: error.message })
    }
}

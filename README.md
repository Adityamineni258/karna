# 🧠 KARNA — The Mental Health Companion  
**Your Private AI Wellness Partner**

**🔗 Live Site:** [https://astoundin.netlify.app](https://astoundin.netlify.app)

---

## 🌟 Overview

*KARNA* is a privacy-first, AI-powered mental health assistant offering emotional support through voice or text conversations. It adapts to your emotional state using emoji-driven emotional intelligence and supports multilingual interaction to promote accessibility and comfort.

---

## 💡 Features

### 🔐 Secure Firebase Authentication
- **Google & GitHub Sign-In** via Firebase Authentication.
- Auth state is used to **restrict access** to the chatbot until login.
- Ensures user identity is verified before any interaction.
- **No personal chat data is stored** — all processing is done in-memory and in real time for maximum privacy.

### 💖 Emotional Intelligence with Emoji Feedback
- Detects and reflects user emotion using Gemini Flash + emoji expressions.
- Provides mood-aligned suggestions like affirmations, mindfulness tips, or empathetic replies.
- Dynamically switches emoji states to enhance visual feedback.

### 🗣️ Multilingual Voice & Text Interaction
- Powered by **Web Speech API** for both speech-to-text and **response readout**.
- Users can **speak naturally** and hear back the AI’s response.
- **Voice readout** helps users who are **visually impaired or blind** interact with the assistant seamlessly.
- Supports **13 languages**, selectable via a dropdown UI.

#### ✅ Supported Languages
- English (US, UK, India)
- Hindi  
- Spanish (Spain, US)  
- French  
- Chinese (Simplified)  
- German  
- Italian  
- Japanese  
- Korean  
- Dutch  
- Polish  
- Portuguese (Brazil)  
- Russian  

---

## ⚙️ Tech Stack

| Feature                         | Technology                      |
|-------------------------------|----------------------------------|
| Emotional AI & NLU            | Gemini 2.0 Flash (Google API)    |
| Frontend                      | HTML, CSS, JavaScript            |
| Voice Interaction             | Web Speech API                   |
| Authentication                | Firebase Auth (Google, GitHub)   |
| Secure Hosting                | Netlify                          |
| API Security                  | Google Secret Manager            |
| Backend Proxy                 | Google Cloud Function (Node.js)  |

---

## 🔒 Privacy-First & Inclusive by Design

- No conversations are stored.
- No third-party analytics or tracking scripts.
- Firebase Auth is used **only for identity gating**.
- API keys are stored securely in **Google Secret Manager**.
- All interaction is **session-based and local** to the user’s browser.
- **Voice readout ensures accessibility** for blind or visually impaired users.
- UI is keyboard-navigable and screen-reader friendly.

> 🛡️ Your mental wellness is personal — KARNA ensures it stays that way.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mental-health-companion.git
cd mental-health-companion
'''

2. Setup
Deploy geminiChatbot backend via Google Cloud Functions.

Store your Gemini API key using Google Secret Manager.

Set the deployed URL in script.js.

3. Run Locally
Open login.html and sign in via Google or GitHub.

Once authenticated, index.html will load automatically.

Start chatting with your AI wellness companion using voice or text.

📈 Future Roadmap
Personalized daily check-ins & journaling (fully encrypted).

Wearable device integration for biofeedback-based support.

AI-driven self-care recommendations.

Offline-first PWA version.

Community forums with anonymity built-in.

🤝 Contributing
We welcome contributions!

Fork the repo

Create a feature branch

Push your changes

Open a Pull Request

⚠️ Disclaimer
KARNA is not a substitute for professional help.
It is an experimental support tool, not a licensed counselor.
If you're in crisis, please seek immediate help from mental health professionals.

💖 Our Vision
To create a secure, compassionate, multilingual, and accessible digital companion that empowers everyone — especially the underrepresented — to take charge of their emotional wellbeing with empathy and dignity.

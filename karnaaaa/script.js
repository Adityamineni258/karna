            document.addEventListener('DOMContentLoaded', () => {
            const userInputElement = document.getElementById('prompt');
            const sendButton = document.getElementById('sendBtn');
            const emojiElement = document.getElementById('emoji');
            const outputArea = document.getElementById('output');
            const sendIcon = document.querySelector('.send-icon');
const loadingSpinner = document.getElementById('loading-spinner');

            const apiKey = "insert api key"; // Replace with your actual API key
            let conversationHistory = []; // Array to store conversation history

            userInputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
            }
            });

            async function sendMessage() {
                const userPrompt = userInputElement.value;
                if (!userPrompt) return;
            
                conversationHistory.push({ role: 'user', parts: [{ text: userPrompt }] });
            
                sendIcon.style.display = 'none'; // Hide send icon
                loadingSpinner.style.display = 'block'; // Show loading spinner
                outputArea.innerText = '';
            
                try {
                    const geminiResponse = await getGeminiChatbotResponse(conversationHistory);
                    const emojiExpression = await getGeminiEmojiResponse(userPrompt);
            
                    outputArea.innerText = geminiResponse;
                    if (emojiExpression) {
                        emojiElement.src = `${emojiExpression.expression}.svg`;
                    }
            
                    conversationHistory.push({ role: 'model', parts: [{ text: geminiResponse }] });
                } catch (error) {
                    console.error('Error:', error);
                    outputArea.innerText = `An error occurred: ${error.message || 'Unknown error'}`;
                }
            
                sendIcon.style.display = 'block'; // Show send icon
                loadingSpinner.style.display = 'none'; // Hide loading spinner
                userInputElement.value = ''; // Clear input field
            }
            async function getGeminiChatbotResponse(history) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const requestBody = {
            contents: history, // Send entire history to Gemini
            };

            const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            }

            async function getGeminiEmojiResponse(prompt) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const requestBody = {
            contents: [{
            parts: [{
            text: `Analyze the following text and return the intent and suggested emoji expression. Text: ${prompt}. Return the response as JSON. Only use these emoji names: angry-mad, angry-mad-yelling, blank-stare-reactionless, bored-disappointed, bored-reactionless-disappointed, cry-sad-tears, cute-smile, dead-blank-emoji, dead-emoji, dead-tongue-emoji, disappointed-angry-bored-sad, disgusted-emoji, dull-mad-angry, evil-smile, happy-kiss, happy-normal, happy-smile-blink, happy-smile-emoji, happy-tongue, happy-upside-down, happy-wink, kiss, laughing-hard, laugh-smile-drop, nervous-teeth, sad, sad-crying, sad-embarrassed-dismay, sad-pain, serene-smile, shocked, smile-wink, surprised, tongue, very-happy, wry-tongue. Example: {"intent": "make_joke", "expression":"laughing-hard"}`
            }]
            }]
            };

            const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            const parsedResponse = JSON.parse(responseText.replace(/```json\n/g, '').replace(/```/g, ''));
            return parsedResponse;
            }

            sendButton.addEventListener('click', sendMessage);
            });
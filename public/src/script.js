import app from './firebase-config.js';
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const auth = getAuth(app);

// 👇 Exported to be used from auth.js
export function showChatUI(user) {
  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    const name = user.displayName || user.email;
    usernameEl.innerText = `Hello, ${name}`;
  }

  const chatContainer = document.getElementById("chat-container");
  if (chatContainer) {
    chatContainer.style.display = "block"; // Show chatbot UI
  }
}


  
document.addEventListener('DOMContentLoaded', () => {
    const userInputElement = document.getElementById('prompt');
    const sendButton = document.getElementById('sendBtn');
    const emojiElement = document.getElementById('emoji');
    const outputArea = document.getElementById('output');
    const sendIcon = document.querySelector('.send-icon');
    const loadingSpinner = document.getElementById('loading-spinner');
    const voiceBtn = document.getElementById('voiceBtn');
    const micIcon = voiceBtn.querySelector('.mic-icon'); 
    const languageSelect = document.getElementById('languageSelect');

    
    userInputElement.addEventListener('input', () => {
        const cursorPosition = userInputElement.selectionStart;
      
        let text = userInputElement.value;
        if (text.length > 0) {
          const firstChar = text.charAt(0).toUpperCase();
          const rest = text.slice(1);
          const newText = firstChar + rest;
      
          if (newText !== text) {
            userInputElement.value = newText;
            userInputElement.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      });
      

    let isListening = false;
    let recognizing = false;

    languageSelect.addEventListener("change", (e) => {
        stopSpeech();
        setTimeout(() => {
            lang = e.target.value;
            if (outputArea.innerText) {
                speakText(outputArea.innerText, lang, outputArea);
            }
        }, 200);
    });
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageSelect.value;


        micIcon.addEventListener('click', async () => {
            if (isListening) {
                recognition.stop();
                micIcon.classList.remove('rotating');
                isListening = false;
            } else {
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    micIcon.classList.add('rotating');
                    recognition.start();
                    isListening = true;
                    recognizing = true;
                } catch (error) {
                    console.error("Microphone access error:", error);
                    outputArea.innerText = "Microphone access denied or error.";
                    micIcon.classList.remove('rotating');
                    isListening = false;
                }
            }
        });

        let latestTranscript = '';
        let enterPressedDuringRecognition = false;
        
        recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            latestTranscript = finalTranscript;
            userInputElement.value = finalTranscript;
            }
        };

        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                outputArea.innerText = "No speech detected.";
            } else if (event.error === 'audio-capture') {
                outputArea.innerText = "Microphone access denied.";
            } else {
                outputArea.innerText = "Speech recognition error.";
            }
            micIcon.classList.remove('rotating');
            isListening = false;
        };

        recognition.onend = () => {
            micIcon.classList.remove('rotating');
            isListening = false;
            recognizing = false;
        
            if (enterPressedDuringRecognition) {
                const message = latestTranscript.trim();
                if (message !== '') {
                    sendMessage(message);
                    userInputElement.value = '';
                }
                enterPressedDuringRecognition = false;
            }
        };
        
        
        

        sendButton.addEventListener('click', () => {
            recognition.stop();
            micIcon.classList.remove('rotating');
            isListening = false;
        });

    } else {
        micIcon.style.display = 'none';
        console.log('Speech recognition not supported.');
    }

    let conversationHistory = [];

    userInputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
    
            if (recognizing) {
                enterPressedDuringRecognition = true;
                recognition.stop(); // triggers onend
                micIcon.classList.remove('rotating');
                isListening = false;
                recognizing = false;
            } else {
                const message = userInputElement.value.trim();
                if (message !== '') {
                    sendMessage(message);
                    userInputElement.value = '';
                }
            }
        }
    });
     
    
    function speakText(text, lang) {
        if ('speechSynthesis' in window) {
            function attemptSpeak() {
                const selectedVoice = findVoice(lang);
                if (!selectedVoice) {
                    console.warn(`Text to speech is not available for language: ${lang}.`);
                    return;
                }
                try {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.voice = selectedVoice;
                    utterance.pitch = 1.2;
                    utterance.rate = 1.1;
                    utterance.onerror = (event) => {
                        console.error("Utterance error:", event);
                        console.error("Utterance error message:", event.error);
                        console.error("Utterance error text:", event.utterance.text);
                    };
                    utterance.onend = (event) => {
                        console.log("Utterance finished:", event);
                    }
                    utterance.onstart = (event) => {
                        console.log("Utterance started:", event);
                    }
                    setTimeout(() => {
                        window.speechSynthesis.speak(utterance);
                    }, 100);

                } catch (utteranceError) {
                    console.error("Error creating SpeechSynthesisUtterance:", utteranceError);
                    console.warn(`Text to speech is not available for language: ${lang}.`);
                }
            }
            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = function () {
                    console.log("Voices loaded:", window.speechSynthesis.getVoices());
                    attemptSpeak();
                    window.speechSynthesis.onvoiceschanged = null;
                };
            } else {
                attemptSpeak();
            }
        } else {
            console.error('Speech synthesis not supported.');
        }
    }
    async function sendMessage(message) {
        outputArea.textContent = ''; // temporary: clear old response
        const selectedLanguage = languageSelect.value;
        const userPrompt = message || userInputElement.value;
        if (!userPrompt) return;

        conversationHistory.push({ role: 'user', parts: [{ text: userPrompt }] });
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
        }

        sendIcon.style.display = 'none';
        loadingSpinner.style.display = 'block';
        outputArea.innerText = '';

        try {
            const geminiResponse = await getGeminiChatbotResponse(conversationHistory, selectedLanguage, userPrompt);
            console.log("Raw Gemini Response:", geminiResponse);

            if (!geminiResponse || !geminiResponse.text) {
                console.error("Invalid response structure from backend");
                speakText("Sorry, I couldn't process that.", selectedLanguage, outputArea);
                return;
              }
              
            const cleanedResponse = (geminiResponse.text || "Sorry, I couldn't process that.").replace(/\*/g, '');



            if (geminiResponse.emoji && geminiResponse.emoji.expression) {
                emojiElement.src = `${geminiResponse.emoji.expression}.svg`;
            }

            conversationHistory.push({ role: 'model', parts: [{ text: cleanedResponse }] });
            stopSpeech();
            animateTextWordByWord(cleanedResponse, outputArea);
            speakText(cleanedResponse, selectedLanguage, outputArea);

        } catch (error) {
            console.error('Error:', error);
            outputArea.innerText = `An error occurred: ${error.message || 'Unknown error'}`;
        } finally {
            sendIcon.style.display = 'block';
            loadingSpinner.style.display = 'none';
            userInputElement.value = '';
            userInputElement.disabled = false; // Enable input field once processing is done
        }
    }

    async function getGeminiChatbotResponse(history, languageCode, prompt) {
        const url = 'https://asia-south1-karna-ai.cloudfunctions.net/geminiChatbot';

        let requestBody = {
            contents: [],
            generationConfig: {
                temperature: 0.4,
            },
            prompt: prompt
        };

                requestBody.contents = requestBody.contents.concat(history);
                let modifiedHistory = [...history.map(entry => ({ ...entry, parts: [...entry.parts] }))];

                if (languageCode !== 'en-US') {
                    const lastIdx = modifiedHistory.length - 1;
                    const originalText = modifiedHistory[lastIdx].parts[0].text;
                    modifiedHistory[lastIdx].parts[0].text = `Respond in ${languageCode}: ${originalText}`;
                }
                // Remove any leading model responses (Gemini can't start with model role)
                while (modifiedHistory.length && modifiedHistory[0].role !== 'user') {
                    modifiedHistory.shift();
                }
                requestBody.contents = modifiedHistory;
                
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();

            if (data) {
                return data;
            } else {
                return {response: "An error occurred during processing."};
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            return {response: "An error occurred communicating with the API."};
        }
    }
    function stopSpeech() {
        window.speechSynthesis.cancel();
    }

    sendButton.addEventListener('click', sendMessage);

    
    function findVoice(lang) {
      const voices = window.speechSynthesis.getVoices();
      console.log(`Requested language: ${lang}`);
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

      let voice = voices.find(v => v.lang === lang);

      if (voice) {
        console.log(`Exact voice found: ${voice.name} (${voice.lang})`);
        return voice;
      } else {
        voice = voices.find(v => v.name.includes("Google") && v.lang.startsWith(lang));
      }

      if (voice) {
        console.log(`Fallback Google voice found: ${voice.name} (${voice.lang})`);
        return voice;
      } else {
        voice = voices.find(v => v.lang.startsWith(lang));
      }

      if (voice) {
        console.log(`Fallback voice found: ${voice.name} (${voice.lang})`);
        return voice;
      } else {
        console.warn(`No voice found for language: ${lang}`);
        console.warn("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
        return null;
      }
    }
    function animateTextWordByWord(text, outputElement) {
        const words = text.split(' ');
        let currentIndex = 0;

        function addWord() {
            if (currentIndex < words.length) {
                outputElement.innerText += (currentIndex === 0 ? '' : ' ') + words[currentIndex];
                currentIndex++;
                setTimeout(addWord, 100);
            }
        }

        outputElement.innerText = '';
        addWord();
    }
   

});

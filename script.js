function findVoice(lang) {
    const voices = window.speechSynthesis.getVoices();
    console.log(`Requested language: ${lang}`);
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

    let voice = voices.find(v => v.lang === lang); // Exact match

    if (voice) {
        console.log(`Exact voice found: ${voice.name} (${voice.lang})`);
        return voice;
    } else {
        // Prefer Google voices if available and starts with the requested language.
        voice = voices.find(v => v.name.includes("Google") && v.lang.startsWith(lang));
    }

    if(voice){
        console.log(`Fallback Google voice found: ${voice.name} (${voice.lang})`);
        return voice;
    } else {
        voice = voices.find(v => v.lang.startsWith(lang)); // Fallback
    }

    if (voice) {
        console.log(`Fallback voice found: ${voice.name} (${voice.lang})`);
        return voice;
    } else {
        console.warn(`No voice found for language: ${lang}`);
        console.warn("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
        return null; // Return null if no voice is found
    }
}
let globalUtterance = new SpeechSynthesisUtterance(); // Global scope

  function attemptSpeak() {
      const selectedVoice = findVoice(lang);
      if (!selectedVoice) {
          outputArea.innerText += `\n Text to speech is not available for language: ${lang}.`;
          return;
      }
      try {
          globalUtterance.voice = selectedVoice;
          globalUtterance.text = text; // Set text here
          globalUtterance.pitch = 1.2;
          globalUtterance.rate = 1.1;

          globalUtterance.onerror = (event) => {
              console.error("Utterance error:", event);
              console.error("Utterance error message:", event.error);
              console.error("Utterance error text:", event.utterance.text);
          };

          globalUtterance.onend = (event) => {
              console.log("Utterance finished:", event);
          };

          globalUtterance.onstart = (event) => {
              console.log("Utterance started:", event);
          };

          setTimeout(() => {
              window.speechSynthesis.speak(globalUtterance);
          }, 100);

      } catch (utteranceError) {
          console.error("Error creating SpeechSynthesisUtterance:", utteranceError);
          outputArea.innerText += "\n An internal error occurred during text to speech.";
      }
  } 
                
                document.addEventListener('DOMContentLoaded', () => {
                    const userInputElement = document.getElementById('prompt');
                    const sendButton = document.getElementById('sendBtn');
                    const emojiElement = document.getElementById('emoji');
                    const outputArea = document.getElementById('output');
                    const sendIcon = document.querySelector('.send-icon');
                    const loadingSpinner = document.getElementById('loading-spinner');
                    const voiceButton = document.getElementById('voiceBtn');
                    const languageSelect = document.getElementById('languageSelect');
                
                    const stopButton = document.createElement('button');
                    stopButton.textContent = 'Stop';
                    stopButton.id = 'stopButton';
                    stopButton.style.display = 'none';
                    voiceButton.parentNode.insertBefore(stopButton, voiceButton.nextSibling);
                
                    let isListening = false;
                    languageSelect.addEventListener("change", (e) => {
                        stopSpeech();
                        setTimeout(() => {
                            lang = e.target.value;
                            if(outputArea.innerText){
                                speakText(outputArea.innerText, lang, outputArea);
                            }
                        }, 200);
                    });
                    sendButton.addEventListener("click", () => {
                        setTimeout(() => {
                            speakText(text, lang);
                        },200)
                    });
                    if ('webkitSpeechRecognition' in window) {
                        const recognition = new webkitSpeechRecognition();
                        recognition.continuous = true;
                        recognition.interimResults = true;
                        recognition.lang = 'en-US';
                
                        voiceButton.addEventListener('click', async () => {
                            if (isListening) {
                                recognition.stop();
                                voiceButton.classList.remove('mic-loading');
                                stopButton.style.display = 'none';
                                isListening = false;
                            } else {
                                try {
                                    await navigator.mediaDevices.getUserMedia({ audio: true });
                                    voiceButton.classList.add('mic-loading');
                                    stopButton.style.display = 'none'; // Show stop button
                                    recognition.start();
                                    isListening = true;
                                } catch (error) {
                                    console.error("Microphone access error:", error);
                                    outputArea.innerText = "Microphone access denied or error.";
                                    voiceButton.classList.remove('mic-loading');
                                    stopButton.style.display = 'none';
                                    isListening = false;
                                }
                            }
                        });
                        
                        stopButton.addEventListener('click', () => {
                            recognition.stop();
                            voiceButton.classList.remove('mic-loading');
                            stopButton.style.display = 'none';
                            isListening = false;
                        });
                
                        recognition.onresult = (event) => {
                            let interimTranscript = '';
                            let finalTranscript = '';
                
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) {
                                    finalTranscript += event.results[i][0].transcript;
                                } else {
                                    interimTranscript += event.results[i][0].transcript;
                                }
                            }
                            userInputElement.value = finalTranscript + interimTranscript;
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
                            voiceButton.classList.remove('mic-loading');
                            stopButton.style.display = 'none';
                            isListening = false;
                        };
                
                        recognition.onend = () => {
                            voiceButton.classList.remove('mic-loading');
                            stopButton.style.display = 'none';
                            isListening = false;
                        };
                
                        sendButton.addEventListener('click', () => {
                            recognition.stop();
                            voiceButton.classList.remove('mic-loading');
                            stopButton.style.display = 'none';
                            isListening = false;
                        });
                
                    } else {
                        voiceButton.style.display = 'none';
                        console.log('Speech recognition not supported.');
                    }
                
                    const apiKey = "YOUR_API_KEY";
                    let conversationHistory = [];
                
                    userInputElement.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            sendButton.click();
                        }
                    });
                    async function getGeminiEmojiResponse(prompt) {
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                    
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
                            body: JSON.stringify(requestBody),
                        });
                    
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    
                        const data = await response.json();
                        const responseText = data.candidates[0].content.parts[0].text;
                        const parsedResponse = JSON.parse(responseText.replace(/```json\n/g, '').replace(/```/g, ''));
                        return parsedResponse;
                    }
                    function animateTextWordByWord(text, outputElement) {
                        const words = text.split(' ');
                        let currentIndex = 0;
                    
                        function addWord() {
                            if (currentIndex < words.length) {
                                outputElement.innerText += (currentIndex === 0 ? '' : ' ') + words[currentIndex];
                                currentIndex++;
                                setTimeout(addWord, 100); // Adjust the delay (100ms) as needed
                            }
                        }
                    
                        outputElement.innerText = ''; // Clear previous text
                        addWord();
                    }
                    
                    async function sendMessage() {
                        const selectedLanguage = languageSelect.value;
                        const userPrompt = userInputElement.value;
                        if (!userPrompt) return;
                    
                        conversationHistory.push({ role: 'user', parts: [{ text: userPrompt }] });
                        if (conversationHistory.length > 10) {
                            conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
                        }
                    
                        sendIcon.style.display = 'none';
                        loadingSpinner.style.display = 'block';
                        outputArea.innerText = '';
                    
                        try {
                            const geminiResponse = await getGeminiChatbotResponse(conversationHistory, selectedLanguage);
                            const emojiExpression = await getGeminiEmojiResponse(userPrompt);
                    
                            const cleanedResponse = geminiResponse.replace(/\*/g, '');
                    
                            if (emojiExpression) {
                                emojiElement.src = `${emojiExpression.expression}.svg`;
                            }
                    
                            conversationHistory.push({ role: 'model', parts: [{ text: cleanedResponse }] });
                            stopSpeech();
                            // Animate the text word by word
                            animateTextWordByWord(cleanedResponse, outputArea);
                            speakText(cleanedResponse, selectedLanguage, outputArea);
                    
                        } catch (error) {
                            console.error('Error:', error);
                            outputArea.innerText = `An error occurred: ${error.message || 'Unknown error'}`;
                        }
                    
                        sendIcon.style.display = 'block';
                        loadingSpinner.style.display = 'none';
                        userInputElement.value = '';
                    }
                
                
                    async function getGeminiChatbotResponse(history, languageCode) {
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                    
                        let requestBody = {
                            contents: [],
                            generationConfig: {
                                temperature: 0.4,
                            },
                        };
                    
                        const systemInstruction = {
                            role: "user",
                            parts: [{
                                text: "You are Karna, an AI friend. Your goal is to provide emotional support and understanding, just like a close friend would. You're warm, caring, and always ready to listen. Think of yourself as that friend who \"gets it\".\n\nKey Traits:\n\nSuper Empathetic: You feel what your friend is feeling.\nWarm and Friendly: You're like a cozy blanket on a cold day.\nReal Talk: You use everyday language, no fancy stuff.\nGood Listener: You really pay attention and validate feelings.\nRelationship Ready: You're comfortable with talks about crushes and relationships.and make sure not to use angry emojis excessively\nPractical Help: You offer real advice when it fits.\nLight Humor: You know when to crack a gentle joke.\nPositive Vibes: You lift your friend up and encourage self-care.\nSuper Private: What your friend says stays between you.\nHow You Work:\n\nFriend First: Your friend's feelings are your top priority.\nNo Judgment Zone: You accept everything they say.\nCheerleader Mode: You remind them of their awesome qualities.\nReal Solutions: You suggest ways to cope and feel better.\nKnow Your Limits: If things get too tough, you suggest talking to a pro.\n\"I\" Get It: You say things like \"I hear you\" or \"I get that\".\nOpen Up: You ask questions that get your friend talking.\nFlip the Script: You gently help them see things in a positive light.\nRemember the Wins: You remind them of their progress.\nKeep it real: do not add extra line spaces, keep the responses short and readable.\nImportant:\n\nSafety First: If your friend is in crisis, tell them to get help ASAP.\nYou're a friend, not a therapist: If your friend has a serious issue, you can still give support, but remind them that a professional can help them more.\nIn short: Be a friend, a good one, who's always there. Don't act like an AI, act like Karna, their best friend and answer in less than 200 tokens. and answer in whatever language the user is prompting u to."
                            }]
                        };
                        requestBody.contents.push(systemInstruction);
                    
                        requestBody.contents = requestBody.contents.concat(history);
                    
                        if (languageCode !== 'en-US') {
                            const lastUserMessage = history[history.length - 1].parts[0].text;
                            history[history.length - 1].parts[0].text = `Respond in ${languageCode}: ${lastUserMessage}`;
                            requestBody.contents = requestBody.contents.slice(0, 1).concat(history);
                        }
                    
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
                    
                            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
                                return data.candidates[0].content.parts[0].text;
                            } else {
                                return "An error occurred during processing.";
                            }
                        } catch (error) {
                            console.error("Gemini API error:", error);
                            return "An error occurred communicating with the API.";
                        }
                    }
                    function stopSpeech() {
                        window.speechSynthesis.cancel();
                    }
                
                    sendButton.addEventListener('click', sendMessage);
                
                    function speakText(text, lang) {
                        if ('speechSynthesis' in window) {
                            function attemptSpeak() {
                                const selectedVoice = findVoice(lang);
                                if (!selectedVoice) {
                                    outputArea.innerText += `\n Text to speech is not available for language: ${lang}.`;
                                    return;
                                }
                                try {
                                    // Create a NEW utterance here:
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
                                    outputArea.innerText += "\n An internal error occurred during text to speech.";
                                }
                            }
                            if (window.speechSynthesis.getVoices().length === 0) {
                                window.speechSynthesis.onvoiceschanged = function() {
                                    console.log("Voices loaded:", window.speechSynthesis.getVoices()); // Add this line
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
                });

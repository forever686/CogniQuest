export const ttsService = {
    speak: (text: string, lang: string = 'en-US') => {
        if (!('speechSynthesis' in window)) {
            console.warn('TTS not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // Slightly slower for educational purposes

        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === lang && v.name.includes('Google')) ||
            voices.find(v => v.lang === lang);

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
    },

    stop: () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    },

    getVoices: () => {
        if (!('speechSynthesis' in window)) return [];
        return window.speechSynthesis.getVoices();
    }
};

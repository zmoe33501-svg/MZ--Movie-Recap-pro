import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Loader2, Mic, Activity, Gauge, Clock, Pause, Trash2, Download, 
  Volume2, AlertCircle, Upload, FastForward, Zap, Sun, Moon, Music, Film, 
  Eraser, FileText, Headphones, MessageSquare, LayoutList, Languages, 
  Wand2, Settings, X, Copy, Check, ArrowRight, FileAudio, FileVideo, Save,
  Sparkles
} from 'lucide-react';

const SYSTEM_API_KEY = ""; // 👈 ကိုယ်ပိုင် API Key ကို ဒီနေရာမှာ ထည့်ပါ

const VOICES = [
  { id: 'Charon', name: 'အောင်အောင်', gender: 'Male' }, { id: 'Fenrir', name: 'ရဲရင့်', gender: 'Male' },
  { id: 'Orus', name: 'မင်းခန့်', gender: 'Male' }, { id: 'Enceladus', name: 'ဇေယျာ', gender: 'Male' },
  { id: 'Iapetus', name: 'ထက်မြတ်', gender: 'Male' }, { id: 'Algenib', name: 'မျိုးမင်း', gender: 'Male' },
  { id: 'Rasalgethi', name: 'စည်သူ', gender: 'Male' }, { id: 'Schedar', name: 'ကောင်းကင်', gender: 'Male' },
  { id: 'Alnilam', name: 'သီဟ', gender: 'Male' }, { id: 'Sadachbia', name: 'ဝေယံ', gender: 'Male' },
  { id: 'Kore', name: 'စုစု', gender: 'Female' }, { id: 'Aoede', name: 'သန္တာ', gender: 'Female' },
  { id: 'Leda', name: 'လှိုင်', gender: 'Female' }, { id: 'Callirrhoe', name: 'အေးအေး', gender: 'Female' },
  { id: 'Autonoe', name: 'မြမြ', gender: 'Female' }, { id: 'Despina', name: 'နန်းဆု', gender: 'Female' },
  { id: 'Erinome', name: 'ရွှေရည်', gender: 'Female' }, { id: 'Laomedeia', name: 'သီရိ', gender: 'Female' },
  { id: 'Achernar', name: 'မေမီ', gender: 'Female' }, { id: 'Gacrux', name: 'နှင်းနှင်း', gender: 'Female' }
];

const EMOTIONS = [
  { id: 'Neutral', label: 'ပုံမှန်', emoji: '😐' }, { id: 'Happy', label: 'ပျော်ရွှင်သော', emoji: '😊' },
  { id: 'Sad', label: 'ဝမ်းနည်းသော', emoji: '😢' }, { id: 'Angry', label: 'ဒေါသထွက်သော', emoji: '😠' },
  { id: 'Calm', label: 'တည်ငြိမ်သော', emoji: '😌' }, { id: 'Energetic', label: 'တက်ကြွသော', emoji: '⚡️' },
  { id: 'Whisper', label: 'တိုးတိုးပြော', emoji: '🤫' }, { id: 'Storytelling', label: 'ပုံပြင်ပြော', emoji: '📖' },
  { id: 'Professional', label: 'လုပ်ငန်းသုံး', emoji: '👔' }, { id: 'Casual', label: 'ပေါ့ပေါ့ပါးပါး', emoji: '☕️' },
  { id: 'Fearful', label: 'ကြောက်ရွံသော', emoji: '😨' }, { id: 'Surprised', label: 'အံ့သြသော', emoji: '😲' },
  { id: 'Excited', label: 'စိတ်လှုပ်ရှားသော', emoji: '🤩' }, { id: 'Romantic', label: 'ချစ်စရာကောင်းသော', emoji: '🥰' }
];

const BGM_OPTIONS = [
  { id: 'none', label: 'နောက်ခံတေးဂီတ မပါ', url: '' },
  { id: 'suspense', label: 'သည်းထိတ်ရင်ဖို (Suspense)', url: 'https://ia802500.us.archive.org/6/items/KevinMacLeod-PreludeAndAction/Prelude%20and%20Action.mp3' },
  { id: 'epic', label: 'အက်ရှင် (Epic)', url: 'https://ia801309.us.archive.org/21/items/KevinMacLeod-VolatileReaction/Volatile%20Reaction.mp3' },
  { id: 'chill', label: 'အေးချမ်းသော (Chill)', url: 'https://ia902202.us.archive.org/23/items/KevinMacLeod-Carefree/Carefree.mp3' }
];

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const chunkText = (text, maxLength = 1200) => {
  const chunks = [];
  let currentIdx = 0;
  while (currentIdx < text.length) {
    let endIdx = currentIdx + maxLength;
    if (endIdx < text.length) {
      let breakPoint = Math.max(text.lastIndexOf('\n', endIdx), text.lastIndexOf('။', endIdx));
      if (breakPoint <= currentIdx) breakPoint = text.lastIndexOf('၊', endIdx);
      if (breakPoint <= currentIdx) breakPoint = text.lastIndexOf(' ', endIdx);
      if (breakPoint > currentIdx) endIdx = breakPoint + 1;
    }
    const chunk = text.slice(currentIdx, endIdx).trim();
    if (chunk) chunks.push(chunk);
    currentIdx = endIdx;
  }
  return chunks;
};

const AdvancedPlayer = ({ item, onDelete, theme }) => {
  const mainAudioRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDownloads, setShowDownloads] = useState(false);

  const togglePlay = () => { isPlaying ? mainAudioRef.current.pause() : mainAudioRef.current.play(); };
  const handleTimeUpdate = () => setProgress(mainAudioRef.current.currentTime);
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    mainAudioRef.current.currentTime = time;
    if (bgmAudioRef.current) bgmAudioRef.current.currentTime = time % bgmAudioRef.current.duration || 0;
    setProgress(time);
  };

  useEffect(() => { if (bgmAudioRef.current) { bgmAudioRef.current.volume = 0.04; bgmAudioRef.current.loop = true; } }, []);

  const handleDownload = (format) => {
    const finalName = `MZ_Studio_${item.id}`;
    if (format === 'wav' || format === 'mp3') {
      const audioLink = document.createElement("a");
      audioLink.href = item.audioUrl;
      audioLink.download = `${finalName}.${format}`;
      document.body.appendChild(audioLink);
      audioLink.click();
      document.body.removeChild(audioLink);
    }
  };

  const isDark = theme === 'dark';
  return (
    <div className={`${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl p-5 flex flex-col gap-4 mb-4`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs font-bold">{item.voice.name}</span>
            <span className="bg-pink-500/20 text-pink-500 px-2 py-1 rounded text-xs font-bold">{item.emotion.emoji} {item.emotion.label}</span>
          </div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm line-clamp-2`}>{item.text}</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-3 ${isDark ? 'bg-black/40' : 'bg-gray-100'} p-3 rounded-xl border ${isDark ? 'border-white/5' : 'border-transparent'}`}>
        <button onClick={togglePlay} className="w-10 h-10 shrink-0 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 text-white">
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs font-medium text-gray-500 px-1"><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
          <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
        
        <div className="relative">
          <button onClick={() => setShowDownloads(!showDownloads)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"><Download className="w-4 h-4" /></button>
          {showDownloads && (
            <div className={`absolute right-0 bottom-full mb-2 w-48 rounded-xl shadow-xl border p-2 z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button onClick={() => handleDownload('wav')} className="w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white rounded text-xs font-bold transition">WAV (HQ)</button>
              <button onClick={() => handleDownload('mp3')} className="w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white rounded text-xs font-bold transition">MP3</button>
            </div>
          )}
        </div>
        <button onClick={() => onDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
        <audio ref={mainAudioRef} src={item.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={() => setDuration(mainAudioRef.current.duration)} onPlay={() => { setIsPlaying(true); if(bgmAudioRef.current) bgmAudioRef.current.play(); }} onPause={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} onEnded={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />
        {item.bgm && item.bgm.url && <audio ref={bgmAudioRef} src={item.bgm.url} />}
      </div>
    </div>
  );
};

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mz_apikey') || "");
  const [showSettings, setShowSettings] = useState(false);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('mz_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('stt'); 
  
  // STT State
  const [sttFile, setSttFile] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttProgressText, setSttProgressText] = useState('');
  const [sttResult, setSttResult] = useState('');
  const [sttError, setSttError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const fileInputRef = useRef(null);

  // TTS State
  const [ttsText, setTtsText] = useState(() => localStorage.getItem('mz_tts_text') || "");
  const [selectedVoice, setSelectedVoice] = useState('Charon');
  const [selectedEmotion, setSelectedEmotion] = useState('Neutral');
  const [selectedBGM, setSelectedBGM] = useState('none');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsProgress, setTtsProgress] = useState('');
  const [ttsError, setTtsError] = useState('');
  const [ttsHistory, setTtsHistory] = useState([]);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('mz_theme', theme);
    localStorage.setItem('mz_apikey', apiKey);
    localStorage.setItem('mz_tts_text', ttsText);
  }, [theme, apiKey, ttsText]);

  const isDark = theme === 'dark';
  const appBg = isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const panelBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-xl';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setSttError("ဖိုင်ဆိုဒ်အရမ်းကြီးနေပါသည်။ (200MB အောက်သာ လက်ခံပါသည်)");
        return;
      }
      setSttFile(file); setSttError(''); setSttResult(''); setAiResult('');
    }
  };

  const getActiveKey = (fileSize) => {
    const isSmallFile = fileSize <= 20 * 1024 * 1024;
    return isSmallFile && SYSTEM_API_KEY ? SYSTEM_API_KEY : apiKey;
  };

  const handleTranscribe = async () => {
    if (!sttFile) return setSttError("ကျေးဇူးပြု၍ Audio သို့မဟုတ် Video ဖိုင်ရွေးပါ။");
    
    const activeKey = getActiveKey(sttFile.size);
    if (!activeKey) {
      setShowSettings(true);
      return setSttError("20MB အထက် ဖိုင်များကို စာသားပြောင်းရန် သင့်ကိုယ်ပိုင် API Key လိုအပ်ပါသည်။ Settings တွင် ထည့်သွင်းပါ။");
    }

    setIsTranscribing(true); setSttError(''); setSttResult(''); setAiResult('');
    try {
      setSttProgressText('ဖိုင်ကို Upload တင်နေပါသည်... ⬆️');
      
      const uploadRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${activeKey}`, {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'raw',
          'X-Goog-Upload-Command': 'start, upload',
          'X-Goog-Upload-Header-Content-Length': sttFile.size.toString(),
          'X-Goog-Upload-Header-Content-Type': sttFile.type,
        },
        body: sttFile
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");
      const fileUri = uploadData.file.uri;
      const fileName = uploadData.file.name;

      setSttProgressText('ဖိုင်ကို စစ်ဆေးနေပါသည် (ခေတ္တစောင့်ပါ)... ⏳');
      
      // Polling mechanism to check file state
      let isFileReady = false;
      while (!isFileReady) {
        const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${activeKey}`);
        const checkData = await checkRes.json();
        
        if (!checkRes.ok) throw new Error("ဖိုင်စစ်ဆေးခြင်း မအောင်မြင်ပါ။");
        
        if (checkData.state === 'ACTIVE') {
          isFileReady = true;
        } else if (checkData.state === 'FAILED') {
          throw new Error("ဗီဒီယိုဖိုင် ပြင်ဆင်မှု ကျရှုံးသွားပါသည်။ အခြားဖိုင်တစ်ခု ပြောင်းစမ်းကြည့်ပါ။");
        } else {
          // Wait 3 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setSttProgressText('AI စာသားပြောင်းပေးနေပါသည်... 🧠');
      
      const payload = {
        contents: [{
          parts: [
            { fileData: { mimeType: sttFile.type, fileUri: fileUri } },
            { text: "Transcribe the speech in this audio/video. If it's Burmese, transcribe in Burmese. If it's English, in English. Provide only the pure transcription text with proper punctuation, without any extra markdown or comments." }
          ]
        }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Transcription failed");
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setSttResult(text.trim());
      else throw new Error("စာသားရှာမတွေ့ပါ။");

    } catch (err) {
      setSttError(err.message || "အမှားအယွင်းဖြစ်ပေါ်နေပါသည်။");
    } finally {
      setIsTranscribing(false);
      setSttProgressText('');
    }
  };

  const handleAIAction = async (actionType) => {
    if (!sttResult) return;
    const activeKey = SYSTEM_API_KEY || apiKey;
    if (!activeKey) return setShowSettings(true);
    
    setAiLoading(true); setSttError(''); setAiResult('');
    
    try {
      let prompt = "";
      if (actionType === 'summarize') prompt = `အောက်ပါစာသားကို အဓိကအချက်များချည်းသာ အကျဉ်းချုပ် Bullet points များဖြင့် ရေးပေးပါ။\n\n${sttResult}`;
      else if (actionType === 'translate') prompt = `Translate this to English if it's Burmese, or to Burmese if it's English:\n\n${sttResult}`;
      else if (actionType === 'social') prompt = `Based on the following text, act as a viral social media manager. Generate: 1) Three highly engaging and clickbaity video titles. 2) A captivating social media caption (hook) to keep viewers engaged. 3) A list of relevant trending hashtags. Please write the response entirely in Burmese (Myanmar) language with appropriate emojis.\n\nText:\n${sttResult}`;
      else prompt = `Rewrite this as an engaging "Movie Recap" style script in Burmese:\n\n${sttResult}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message);
      
      setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } catch (err) {
      setSttError("AI လုပ်ဆောင်မှု ကျရှုံးပါသည်။ " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const sendToVoice = (text) => {
    setTtsText(text);
    setActiveTab('tts');
  };

  const createWavFile = (pcmData, sampleRate) => {
    const numChannels = 1; const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeString = (view, offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
    writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    const pcmBytes = new Uint8Array(buffer, 44); pcmBytes.set(pcmData);
    return new Blob([view], { type: 'audio/wav' });
  };

  const fetchTTSChunk = async (chunkText, index, activeKey) => {
    const promptText = selectedEmotion !== 'Neutral' ? `Say in a ${selectedEmotion.toLowerCase()} tone: ${chunkText}` : chunkText;
    const payload = { contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } }, model: "gemini-2.5-flash-preview-tts" };
    let attempt = 0, delay = 1000;
    while (attempt < 3) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${activeKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message);
        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        const binaryString = atob(inlineData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
        return { bytes, mimeType: inlineData.mimeType, index };
      } catch (err) { attempt++; if (attempt >= 3) throw new Error(`အပိုင်း (${index + 1}) အား ဖန်တီးရာတွင် အမှားဖြစ်နေပါသည်။`); await new Promise(r => setTimeout(r, delay)); delay *= 2; }
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) return setTtsError("ကျေးဇူးပြု၍ စာသားထည့်ပေးပါ။");
    const activeKey = SYSTEM_API_KEY || apiKey;
    if (!activeKey) return setShowSettings(true);
    setIsGeneratingTTS(true); setTtsError('');
    const textChunks = chunkText(ttsText, 1200); 
    
    try {
      setTtsProgress(`စာပိုဒ် (${textChunks.length}) ပိုဒ်ခွဲ၍ ဖန်တီးနေပါသည် ⚡`);
      const results = await Promise.all(textChunks.map((chunk, i) => fetchTTSChunk(chunk, i, activeKey)));
      
      let allPcmBytes = new Uint8Array(0);
      let finalSampleRate = 24000;

      for (let i = 0; i < results.length; i++) {
        if (results[i].index === 0 && results[i].mimeType.match(/rate=(\d+)/)) {
          finalSampleRate = parseInt(results[i].mimeType.match(/rate=(\d+)/)[1], 10);
        }
        const silenceBytesLength = i > 0 ? Math.floor((finalSampleRate * 2) * 0.3) : 0; 
        const mergedBytes = new Uint8Array(allPcmBytes.length + silenceBytesLength + results[i].bytes.length);
        mergedBytes.set(allPcmBytes);
        if (silenceBytesLength > 0) mergedBytes.set(new Uint8Array(silenceBytesLength), allPcmBytes.length);
        mergedBytes.set(results[i].bytes, allPcmBytes.length + silenceBytesLength);
        allPcmBytes = mergedBytes;
      }

      const wavBlob = createWavFile(allPcmBytes, finalSampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const newItem = { 
        id: Date.now(), text: ttsText, 
        voice: VOICES.find(v => v.id === selectedVoice), 
        emotion: EMOTIONS.find(e => e.id === selectedEmotion), 
        bgm: BGM_OPTIONS.find(b => b.id === selectedBGM), 
        audioUrl, timestamp: new Date().toLocaleString() 
      };
      
      setTtsHistory(prev => [newItem, ...prev]); 
      setActiveTab('history'); 
    } catch (err) { setTtsError(err.message || "အမှားအယွင်းဖြစ်ပေါ်နေပါသည်။"); } 
    finally { setIsGeneratingTTS(false); setTtsProgress(''); }
  };

  return (
    <div className={`min-h-screen ${appBg} p-4 font-sans transition-colors duration-300 selection:bg-blue-500/30 pb-24`}>
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">MZ Studio PRO</h1>
            <p className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>All-in-One AI Media Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}><Settings className="w-5 h-5"/></button>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}>
            {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto mb-8">
        <div className={`flex gap-2 p-1.5 rounded-2xl border w-full overflow-x-auto custom-scrollbar ${isDark ? 'bg-gray-900/50 border-white/5' : 'bg-gray-100/50 border-gray-200'}`}>
          <button onClick={() => setActiveTab('stt')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all min-w-[140px] ${activeTab === 'stt' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
            <FileVideo className="w-4 h-4"/> စာသားပြောင်းမည်
          </button>
          <button onClick={() => setActiveTab('tts')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all min-w-[140px] ${activeTab === 'tts' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
            <Volume2 className="w-4 h-4"/> အသံဖန်တီးမည်
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all min-w-[140px] ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
            <Clock className="w-4 h-4"/> မှတ်တမ်း
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto">
        {/* STT TAB */}
        {activeTab === 'stt' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className={`${panelBg} border rounded-3xl p-6 flex flex-col`}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-500"/> ဖိုင်ရွေးချယ်ပါ</h2>
              
              <div className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-colors ${sttFile ? (isDark ? 'border-blue-500 bg-blue-500/5' : 'border-blue-500 bg-blue-50') : (isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-300 bg-gray-50 hover:bg-gray-100')}`}>
                <input type="file" accept="audio/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full">
                  {sttFile ? (
                    <>
                      <div className="p-4 bg-blue-500 text-white rounded-full"><FileAudio className="w-8 h-8" /></div>
                      <p className="font-bold text-blue-500 line-clamp-1">{sttFile.name}</p>
                      <p className="text-xs text-gray-500">{(sttFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button className="mt-2 text-xs font-bold text-red-500 hover:underline" onClick={(e) => {e.preventDefault(); setSttFile(null);}}>ဖယ်ရှားမည်</button>
                    </>
                  ) : (
                    <>
                      <div className={`p-4 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}><Upload className="w-8 h-8" /></div>
                      <p className="font-bold">ဖိုင်ကို နှိပ်၍ ရွေးပါ</p>
                      <p className="text-xs text-gray-500">Video သို့မဟုတ် Audio (Max: 200MB)</p>
                    </>
                  )}
                </label>
              </div>

              {sttError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0"/> {sttError}</div>}

              <button onClick={handleTranscribe} disabled={!sttFile || isTranscribing} className={`mt-6 w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${!sttFile || isTranscribing ? 'bg-gray-600 text-white/50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25'}`}>
                {isTranscribing ? <><Loader2 className="w-5 h-5 animate-spin" /> {sttProgressText}</> : <><Wand2 className="w-5 h-5" /> စာသားအဖြစ် ပြောင်းမည်</>}
              </button>
            </div>

            <div className={`flex flex-col gap-4 ${!sttResult && 'opacity-50 pointer-events-none'}`}>
              <div className={`${panelBg} border rounded-3xl p-5 flex flex-col min-h-[300px]`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-green-500"/> ရလဒ်စာသား</h3>
                  <div className="flex gap-2">
                    <button onClick={() => sendToVoice(sttResult)} className="text-xs flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg font-bold transition">🔊 အသံပြောင်းမည်</button>
                    <button onClick={() => copyToClipboard(sttResult)} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>} Copy
                    </button>
                  </div>
                </div>
                <textarea readOnly value={sttResult} placeholder="စာသားရလဒ်များ ဤနေရာတွင် ပေါ်လာပါမည်..." className={`w-full flex-1 bg-transparent p-2 outline-none resize-none text-sm leading-relaxed custom-scrollbar ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
              </div>

              {/* AI Actions */}
              <div className={`${panelBg} border rounded-3xl p-5`}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> AI ဖြင့် ထပ်မံပြုပြင်ရန်</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => handleAIAction('summarize')} disabled={aiLoading} className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}><LayoutList className="w-4 h-4 text-green-500"/> အကျဉ်းချုပ်</button>
                  <button onClick={() => handleAIAction('translate')} disabled={aiLoading} className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}><Languages className="w-4 h-4 text-blue-500"/> ဘာသာပြန်</button>
                  <button onClick={() => handleAIAction('recap')} disabled={aiLoading} className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}><Film className="w-4 h-4 text-amber-500"/> Recap ပြောင်းမည်</button>
                  <button onClick={() => handleAIAction('social')} disabled={aiLoading} className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${isDark ? 'bg-purple-900/30 border-purple-500/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'}`}><MessageSquare className="w-4 h-4 text-pink-500"/> ခေါင်းစဉ်/Caption</button>
                </div>
                
                {(aiLoading || aiResult) && (
                  <div className={`p-4 rounded-xl text-sm leading-relaxed border ${isDark ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} relative`}>
                    {aiLoading ? <div className="flex items-center gap-2 text-blue-500 font-bold"><Loader2 className="w-4 h-4 animate-spin"/> AI စဉ်းစားနေပါသည်...</div> : 
                    <>
                      <div className="whitespace-pre-wrap">{aiResult}</div>
                      <button onClick={() => copyToClipboard(aiResult)} className="absolute top-2 right-2 p-1.5 bg-gray-500/10 rounded-lg hover:bg-gray-500/20"><Copy className="w-4 h-4"/></button>
                      <button onClick={() => sendToVoice(aiResult)} className="mt-3 w-full py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-lg font-bold text-xs flex justify-center items-center gap-2 transition">🔊 ဤစာသားကို အသံပြောင်းမည် <ArrowRight className="w-3 h-3"/></button>
                    </>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'tts' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${panelBg} border rounded-3xl overflow-hidden flex flex-col`}>
               <div className={`flex justify-between items-center px-5 py-4 border-b ${isDark ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                  <span className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500"/> စာသား ရိုက်ထည့်ပါ</span>
                  <button onClick={() => setTtsText("")} className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 flex items-center gap-1"><Eraser className="w-3 h-3"/> ရှင်းမည်</button>
               </div>
               <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} placeholder="အသံပြောင်းလိုသော စာသားများကို ဤနေရာတွင် ရိုက်ထည့်ပါ (သို့မဟုတ်) 'စာသားပြောင်းမည်' မှတဆင့် ပေးပို့ပါ..." className={`w-full h-[400px] bg-transparent p-6 outline-none resize-none text-lg leading-relaxed custom-scrollbar ${isDark ? 'text-gray-100' : 'text-gray-800'}`} />
               
               {ttsError && <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0"/> {ttsError}</div>}
               
               <div className="p-4 pt-0">
                  <button onClick={handleGenerateTTS} disabled={isGeneratingTTS || !ttsText.trim()} className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${isGeneratingTTS || !ttsText.trim() ? 'bg-gray-600 text-white/50 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'}`}>
                    {isGeneratingTTS ? <><Zap className="w-5 h-5 text-yellow-300 animate-pulse" /> {ttsProgress}</> : <><Play className="w-5 h-5 fill-white" /> အသံဖန်တီးမည်</>}
                  </button>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className={`${panelBg} border rounded-3xl p-5`}>
                <label className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> အသံသရုပ်ဆောင်</label>
                <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className={`w-full p-3.5 rounded-xl border outline-none font-medium text-sm ${isDark ? 'bg-gray-950 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>)}
                </select>

                <label className="text-sm font-bold mt-5 mb-3 flex items-center gap-2"><Gauge className="w-4 h-4 text-pink-500" /> စိတ်ခံစားချက်</label>
                <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {EMOTIONS.map(e => (
                    <button key={e.id} onClick={() => setSelectedEmotion(e.id)} className={`p-2.5 text-xs rounded-xl border flex items-center justify-start px-3 gap-2 transition-all ${selectedEmotion === e.id ? 'bg-pink-500/20 border-pink-500 text-pink-500 font-bold' : isDark ? 'bg-gray-950 border-white/5 text-gray-400 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white'}`}>
                      <span className="text-base">{e.emoji}</span> <span className="truncate">{e.label}</span>
                    </button>
                  ))}
                </div>

                <label className="text-sm font-bold mt-5 mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-amber-500" /> နောက်ခံတေးဂီတ</label>
                <select value={selectedBGM} onChange={(e) => setSelectedBGM(e.target.value)} className={`w-full p-3.5 rounded-xl border outline-none font-medium text-sm ${isDark ? 'bg-gray-950 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                    {BGM_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-2xl mx-auto">
            {ttsHistory.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center">
                 <Headphones className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-bold">မှတ်တမ်း မရှိသေးပါ</p>
                 <p className="text-sm mt-2 opacity-70">ဖန်တီးထားသော အသံများ ဤနေရာတွင် ပေါ်လာပါမည်။</p>
               </div>
            ) : (
               ttsHistory.map(item => <AdvancedPlayer key={item.id} item={item} theme={theme} onDelete={(id) => setTtsHistory(prev => prev.filter(i => i.id !== id))} />)
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl relative ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
            <button onClick={() => setShowSettings(false)} className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><X className="w-5 h-5"/></button>
            <h3 className={`text-xl font-black mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Settings className="w-6 h-6 text-blue-500"/> Settings</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Google Gemini API Key ထည့်သွင်းပါ။ (အခမဲ့ရယူနိုင်ပါသည်)</p>
            
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..." className={`w-full p-4 rounded-xl border outline-none font-mono text-sm mb-4 ${isDark ? 'bg-gray-950 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'}`} />
            
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mb-6 block font-bold">👉 API Key အသစ်ယူရန် ဤနေရာကိုနှိပ်ပါ</a>
            
            <button onClick={() => setShowSettings(false)} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex justify-center items-center gap-2"><Save className="w-5 h-5"/> သိမ်းဆည်းမည်</button>
          </div>
        </div>
      )}
    </div>
  );
}

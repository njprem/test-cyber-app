import { useState } from 'react'
import './App.css'
import { Mic, Search,Smile, Users, XCircle,BookOpen,BellRing, Settings,FileText,Bot,Home } from 'lucide-react';
const App = () => {
  const [currentPage, setCurrentPage] = useState('Home');
  const [transcribedText, setTranscribedText] = useState('');
  const [sentimentResult, setSentimentResult] = useState('');
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const [speakerDiarizationResult, setSpeakerDiarizationResult] = useState('');
  const [abnormalSpeechResult, setAbnormalSpeechResult] = useState('');
  const [contextualAnalysisResult, setContextualAnalysisResult] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [customKeywords, setCustomKeywords] = useState(['urgent action required', 'bank details', 'social security number', 'customer service', 'account verification']);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Simulate an alert
  const triggerAlert = (message) => {
    setAlertMessage(message);
    setIsAlertModalOpen(true);
    setAlerts(prev => [...prev, { id: Date.now(), message, timestamp: new Date().toLocaleString() }]);
  };

  // Simulate LLM call for STT
  const simulateSTT = async (audioInput) => {
    try {
      const prompt = `Transcribe the following audio input into text. If the input is about a call, make it sound like a conversation. Input: "${audioInput}"`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      console.log("Calling Gemini API for STT simulation...");
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setTranscribedText(text);
        console.log("STT Simulation Result:", text);
        return text;
      } else {
        console.error("STT Simulation: Unexpected API response structure or no content.");
        setTranscribedText("Error: Could not transcribe audio. Please try again.");
        return "Error: Could not transcribe audio. Please try again.";
      }
    } catch (error) {
      console.error("Error simulating STT:", error);
      setTranscribedText("Error during transcription. Please check your network or try again.");
      return "Error during transcription. Please check your network or try again.";
    }
  };

  // Simulate LLM call for Contextual Analysis
  const simulateContextualAnalysis = async (text) => {
    try {
      const prompt = `Analyze the context of the following conversation snippet and identify any suspicious shifts in topic or intent that might indicate phishing or unusual call center behavior. Provide a brief summary of the context and any suspicious findings. Conversation: "${text}"`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      console.log("Calling Gemini API for Contextual Analysis simulation...");
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const analysis = result.candidates[0].content.parts[0].text;
        setContextualAnalysisResult(analysis);
        console.log("Contextual Analysis Result:", analysis);
      } else {
        console.error("Contextual Analysis Simulation: Unexpected API response structure or no content.");
        setContextualAnalysisResult("Error: Could not perform contextual analysis.");
      }
    } catch (error) {
      console.error("Error simulating Contextual Analysis:", error);
      setContextualAnalysisResult("Error during contextual analysis. Please try again.");
    }
  };

  // Utility to simulate processing after transcription
  const processTranscribedText = (text) => {
    // Simulate Keyword/Phrase Detection
    const detected = [];
    customKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        detected.push(keyword);
      }
    });
    setDetectedKeywords(detected);
    if (detected.length > 0) {
      triggerAlert(`Detected suspicious keywords: ${detected.join(', ')}`);
    }

    // Simulate Sentiment Analysis
    const sentiments = ['Neutral', 'Positive', 'Negative', 'Urgent', 'Aggressive', 'Suspiciously-Friendly'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    setSentimentResult(randomSentiment);
    if (randomSentiment === 'Urgent' || randomSentiment === 'Aggressive' || randomSentiment === 'Suspiciously-Friendly') {
      triggerAlert(`Detected ${randomSentiment.replace('-', ' ')} sentiment.`);
    }

    // Simulate Speaker Diarization
    const mockConversation = `Speaker 1: Hello, this is customer service. How may I help you?\nSpeaker 2: Yes, I received a call about an urgent action required on my account.\nSpeaker 1: Can you please provide your account verification details?\nSpeaker 2: I'm not sure I should give out my bank details over the phone.`;
    setSpeakerDiarizationResult(mockConversation);

    // Simulate Abnormal Speech Pattern Detection
    const patterns = [];
    if (text.split(' ').length < 5 && text.length > 0) patterns.push('Unusually short phrases');
    if (text.toLowerCase().includes('um') || text.toLowerCase().includes('uh')) patterns.push('Frequent filler words');
    if (text.split('.').length > 5 && text.split('.').length / text.split(' ').length > 0.1) patterns.push('Repetitive phrasing');
    setAbnormalSpeechResult(patterns.length > 0 ? patterns.join(', ') : 'No significant abnormal patterns detected.');
    if (patterns.length > 0) {
      triggerAlert(`Detected abnormal speech patterns: ${patterns.join(', ')}`);
    }

    // Call LLM for contextual analysis
    simulateContextualAnalysis(text);
  };

  // Component for Navigation Bar
  const Navbar = ({ setCurrentPage }) => (
    <nav className="navbar">
      <NavItem icon={<Home size={24} />} label="Home" onClick={() => setCurrentPage('Home')} />
      <NavItem icon={<Mic size={24} />} label="STT" onClick={() => setCurrentPage('STT')} />
      <NavItem icon={<Search size={24} />} label="Keywords" onClick={() => setCurrentPage('KeywordDetection')} />
      <NavItem icon={<Smile size={24} />} label="Sentiment" onClick={() => setCurrentPage('SentimentAnalysis')} />
      <NavItem icon={<Users size={24} />} label="Diarization" onClick={() => setCurrentPage('SpeakerDiarization')} />
    </nav>
  );

  // Helper for Navigation Items
  const NavItem = ({ icon, label, onClick }) => (
    <button className="nav-item" onClick={onClick}>
      {icon}
      <span className="nav-item-label">{label}</span>
    </button>
  );

  // Page Components

  // Home Page
  const HomePage = ({ setCurrentPage }) => (
    <div className="page-container home-page">
      <h1 className="home-title">Phishing Detection App</h1>
      <p className="home-subtitle">Your intelligent assistant for identifying suspicious calls and voice phishing attempts.</p>
      <div className="feature-grid">
        <FeatureCard icon={<Mic size={36} />} title="Speech-to-Text" onClick={() => setCurrentPage('STT')} />
        <FeatureCard icon={<Search size={36} />} title="Keyword Detection" onClick={() => setCurrentPage('KeywordDetection')} />
        <FeatureCard icon={<Smile size={36} />} title="Sentiment Analysis" onClick={() => setCurrentPage('SentimentAnalysis')} />
        <FeatureCard icon={<Users size={36} />} title="Speaker Diarization" onClick={() => setCurrentPage('SpeakerDiarization')} />
        <FeatureCard icon={<XCircle size={36} />} title="Abnormal Speech" onClick={() => setCurrentPage('AbnormalSpeech')} />
        <FeatureCard icon={<BookOpen size={36} />} title="Contextual Analysis" onClick={() => setCurrentPage('ContextualAnalysis')} />
        <FeatureCard icon={<BellRing size={36} />} title="Alerting System" onClick={() => setCurrentPage('AlertingSystem')} />
        <FeatureCard icon={<Settings size={36} />} title="Custom Rules" onClick={() => setCurrentPage('CustomizableRules')} />
        <FeatureCard icon={<FileText size={36} />} title="Reports & Logs" onClick={() => setCurrentPage('ReportingLogging')} />
        <FeatureCard icon={<Bot size={36} />} title="Voice Biometrics" onClick={() => setCurrentPage('VoiceBiometrics')} />
      </div>
    </div>
  );

  // Helper for Feature Cards on Home Page
  const FeatureCard = ({ icon, title, onClick }) => (
    <button className="feature-card" onClick={onClick}>
      {icon}
      <span className="feature-card-title">{title}</span>
    </button>
  );

  // Speech-to-Text Page
  const STTPage = ({ transcribedText, setTranscribedText, processTranscribedText, simulateSTT }) => {
    const [audioInput, setAudioInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulateTranscription = async () => {
      if (!audioInput.trim()) {
        alert("Please enter some text to simulate audio input.");
        return;
      }
      setIsLoading(true);
      const text = await simulateSTT(audioInput);
      setTranscribedText(text);
      processTranscribedText(text); // Process the transcribed text for other features
      setIsLoading(false);
    };

    return (
      <div className="page-container">
        <h2 className="page-title">Speech-to-Text Conversion</h2>
        <p className="page-subtitle">Accurately transcribes spoken audio into text for analysis.</p>
        <div className="content-wrapper">
          <textarea
            className="textarea-input"
            placeholder="Enter text to simulate audio input (e.g., 'Hello, this is your bank calling about an urgent matter on your account.')"
            value={audioInput}
            onChange={(e) => setAudioInput(e.target.value)}
          ></textarea>
          <button onClick={handleSimulateTranscription} className="button button-primary" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : <Mic size={20} />}
            {isLoading ? 'Transcribing...' : 'Simulate Transcription'}
          </button>
        </div>
        <div className="result-box">
          <h3 className="result-box-title">Transcribed Text:</h3>
          <p className="result-box-content">
            {transcribedText || 'No audio transcribed yet. Enter text and click "Simulate Transcription".'}
          </p>
        </div>
      </div>
    );
  };

  // Keyword/Phrase Detection Page
  const KeywordDetectionPage = ({ transcribedText, detectedKeywords, customKeywords, setCustomKeywords, triggerAlert }) => {
    const [newKeyword, setNewKeyword] = useState('');

    const handleAddKeyword = () => {
      if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim().toLowerCase())) {
        setCustomKeywords([...customKeywords, newKeyword.trim().toLowerCase()]);
        setNewKeyword('');
        triggerAlert(`Added new keyword: "${newKeyword.trim()}"`);
      }
    };

    const handleDeleteKeyword = (keywordToDelete) => {
      setCustomKeywords(customKeywords.filter(k => k !== keywordToDelete));
      triggerAlert(`Removed keyword: "${keywordToDelete}"`);
    };

    const highlightKeywords = (text, keywords) => {
      if (!text) return null;
      let result = text;
      keywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi');
        result = result.replace(regex, `<span class="highlighted-keyword">$1</span>`);
      });
      return <div dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return (
      <div className="page-container">
        <h2 className="page-title">Keyword/Phrase Detection</h2>
        <p className="page-subtitle">Identifies common words or patterns associated with call centers or phishing.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Transcribed Text (from STT):</h3>
          <div className="text-analysis-box">
            {highlightKeywords(transcribedText, detectedKeywords) || 'No text to analyze. Go to STT page to transcribe audio.'}
          </div>
          <div className="detected-keywords-section">
            <h4 className="section-subtitle">Detected Keywords:</h4>
            {detectedKeywords.length > 0 ? (
              <ul className="keyword-list">
                {detectedKeywords.map((keyword, index) => <li key={index}>{keyword}</li>)}
              </ul>
            ) : (
              <p>No suspicious keywords detected yet.</p>
            )}
          </div>
        </div>
        <div className="content-wrapper">
          <h3 className="section-title">Manage Custom Keywords:</h3>
          <div className="input-group">
            <input
              type="text"
              className="text-input"
              placeholder="Add new keyword (e.g., 'threat', 'prize')"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
            <button onClick={handleAddKeyword} className="button button-add">Add</button>
          </div>
          <div className="result-box">
            <h4 className="section-subtitle">Current Keywords:</h4>
            <div className="keyword-tags">
              {customKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                  <button onClick={() => handleDeleteKeyword(keyword)} className="delete-keyword-btn">
                    <XCircle size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sentiment Analysis Page
  const SentimentAnalysisPage = ({ transcribedText, sentimentResult }) => {
    return (
      <div className="page-container">
        <h2 className="page-title">Sentiment Analysis</h2>
        <p className="page-subtitle">Determines the emotional tone of the speech.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Text for Analysis:</h3>
          <div className="text-analysis-box">
            <p>{transcribedText || 'No text to analyze. Go to STT page to transcribe audio.'}</p>
          </div>
        </div>
        <div className="sentiment-result-card">
          <h3 className="section-title">Detected Sentiment:</h3>
          <p className={`sentiment-text sentiment-${sentimentResult.toLowerCase()}`}>
            {sentimentResult.replace('-', ' ') || 'N/A'}
          </p>
          <p className="sentiment-note">This is a simulated sentiment based on the transcribed text.</p>
        </div>
      </div>
    );
  };

  // Speaker Diarization Page
  const SpeakerDiarizationPage = ({ speakerDiarizationResult }) => {
    return (
      <div className="page-container">
        <h2 className="page-title">Speaker Diarization</h2>
        <p className="page-subtitle">Separates and identifies different speakers in the conversation.</p>
        <div className="result-box full-height">
          <h3 className="result-box-title">Conversation with Speakers:</h3>
          <p className="result-box-content">
            {speakerDiarizationResult || 'No conversation to diarize. Go to STT page to transcribe audio.'}
          </p>
          <p className="simulation-note">(This is a simulated output. Real diarization requires advanced audio processing.)</p>
        </div>
      </div>
    );
  };
  
    // Voice Biometrics/Authentication Page (Conceptual)
  const VoiceBiometricsPage = () => {
    return (
      <div className="page-container centered-page">
        <h2 className="page-title">Voice Biometrics/Authentication</h2>
        <p className="page-subtitle">This feature would identify known legitimate voices or flag unknown/suspicious voices. It requires extensive backend infrastructure for voice print analysis and database management.</p>
        <div className="placeholder-card">
          <Bot size={64} className="placeholder-icon" />
          <p className="placeholder-text-bold">Voice authentication capabilities coming soon!</p>
          <p className="placeholder-text-sm">(Requires advanced machine learning and secure voice print storage.)</p>
        </div>
      </div>
    );
  };

  // Abnormal Speech Pattern Detection Page
  const AbnormalSpeechPage = ({ transcribedText, abnormalSpeechResult }) => {
    return (
      <div className="page-container">
        <h2 className="page-title">Abnormal Speech Pattern Detection</h2>
        <p className="page-subtitle">Looks for unusual pauses, repeated phrases, unnatural intonation, or robotic speech.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Text for Analysis:</h3>
          <div className="text-analysis-box">
            <p>{transcribedText || 'No text to analyze. Go to STT page to transcribe audio.'}</p>
          </div>
        </div>
        <div className="result-box">
          <h3 className="result-box-title">Detected Abnormalities:</h3>
          <p className="result-box-content">{abnormalSpeechResult || 'Run STT to detect patterns.'}</p>
          <p className="simulation-note">(This is a simulated output based on text analysis. Real detection involves audio features.)</p>
        </div>
      </div>
    );
  };

  // Contextual Analysis Page
  const ContextualAnalysisPage = ({ transcribedText, contextualAnalysisResult }) => {
    return (
      <div className="page-container">
        <h2 className="page-title">Contextual Analysis</h2>
        <p className="page-subtitle">Understands the overall topic and flow of the conversation to identify suspicious shifts.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Text for Analysis:</h3>
          <div className="text-analysis-box">
            <p>{transcribedText || 'No text to analyze. Go to STT page to transcribe audio.'}</p>
          </div>
        </div>
        <div className="result-box">
          <h3 className="result-box-title">Contextual Summary:</h3>
          <p className="result-box-content">{contextualAnalysisResult || 'Run STT to perform contextual analysis.'}</p>
          <p className="simulation-note">(This analysis uses a large language model to interpret context.)</p>
        </div>
      </div>
    );
  };
  
    // Alerting System Page
  const AlertingSystemPage = ({ alerts, triggerAlert }) => {
    return (
      <div className="page-container">
        <h2 className="page-title">Alerting System</h2>
        <p className="page-subtitle">Notifies the user when a high-risk call is detected.</p>
        <div className="button-container">
          <button onClick={() => triggerAlert('Manually triggered test alert!')} className="button button-primary">
            <BellRing size={20} /> Trigger Test Alert
          </button>
        </div>
        <div className="result-box full-height">
          <h3 className="result-box-title">Recent Alerts:</h3>
          {alerts.length > 0 ? (
            <ul className="alert-list">
              {alerts.map((alert) => (
                <li key={alert.id} className="alert-item">
                  <p className="alert-message">{alert.message}</p>
                  <p className="alert-timestamp">{alert.timestamp}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No alerts triggered yet.</p>
          )}
        </div>
        <p className="simulation-note">(Alerts can be triggered by keyword detection, sentiment analysis, etc.)</p>
      </div>
    );
  };

  // Customizable Rules/Thresholds Page
  const CustomizableRulesPage = ({ customKeywords, setCustomKeywords, triggerAlert }) => {
    const [newKeyword, setNewKeyword] = useState('');

    const handleAddKeyword = () => {
      if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim().toLowerCase())) {
        setCustomKeywords([...customKeywords, newKeyword.trim().toLowerCase()]);
        setNewKeyword('');
        triggerAlert(`Added new keyword rule: "${newKeyword.trim()}"`);
      }
    };

    const handleDeleteKeyword = (keywordToDelete) => {
      setCustomKeywords(customKeywords.filter(k => k !== keywordToDelete));
      triggerAlert(`Removed keyword rule: "${keywordToDelete}"`);
    };

    return (
      <div className="page-container">
        <h2 className="page-title">Customizable Rules & Thresholds</h2>
        <p className="page-subtitle">Define your own keywords, phrases, and sensitivity levels for detection.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Manage Custom Keywords:</h3>
          <div className="input-group">
            <input
              type="text"
              className="text-input"
              placeholder="Add new keyword (e.g., 'scam', 'verify now')"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
            <button onClick={handleAddKeyword} className="button button-add">Add</button>
          </div>
          <div className="result-box">
            <h4 className="section-subtitle">Current Keywords:</h4>
            <div className="keyword-tags">
              {customKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                  <button onClick={() => handleDeleteKeyword(keyword)} className="delete-keyword-btn">
                    <XCircle size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="threshold-card">
          <h3 className="section-title">Sentiment Thresholds (Mock):</h3>
          <div className="threshold-sliders">
            <div className="slider-group">
              <label>Urgency Threshold:</label>
              <input type="range" min="0" max="100" defaultValue="70" />
            </div>
            <div className="slider-group">
              <label>Aggression Threshold:</label>
              <input type="range" min="0" max="100" defaultValue="60" />
            </div>
          </div>
          <p className="simulation-note">(These are mock sliders. Real thresholds would be tied to complex model outputs.)</p>
        </div>
      </div>
    );
  };

  // Reporting and Logging Page
  const ReportingLoggingPage = ({ alerts }) => {
    const mockReports = [
      { id: 1, date: '2025-07-01', type: 'Phishing Attempt', summary: 'Detected "urgent action" and aggressive tone.', status: 'High Risk' },
      { id: 2, date: '2025-06-28', type: 'Call Center Call', summary: 'Routine customer service call, no anomalies.', status: 'Low Risk' },
      { id: 3, date: '2025-06-25', type: 'Voice Phishing', summary: 'Identified "social security number" request and suspicious friendliness.', status: 'Critical Risk' },
    ];

    return (
      <div className="page-container">
        <h2 className="page-title">Reporting & Logging</h2>
        <p className="page-subtitle">Keeps records of analyzed calls, detected anomalies, and alerts.</p>
        <div className="content-wrapper">
          <h3 className="section-title">Recent Analysis Reports:</h3>
          <div className="report-list-box">
            {mockReports.length > 0 ? (
              <ul className="report-list">
                {mockReports.map((report) => (
                  <li key={report.id} className="report-item">
                    <p className="report-title">{report.type} - {report.date}</p>
                    <p className="report-summary">{report.summary}</p>
                    <p className={`report-status status-${report.status.toLowerCase().replace(' ', '-')}`}>
                      Status: {report.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No past reports available.</p>
            )}
          </div>
        </div>
        <div className="result-box">
          <h3 className="result-box-title">Recent Alerts Log:</h3>
          {alerts.length > 0 ? (
            <ul className="alert-log-list">
              {alerts.map((alert) => (
                <li key={alert.id} className="alert-log-item">
                  [{alert.timestamp}] {alert.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>No alerts logged yet.</p>
          )}
        </div>
      </div>
    );
  };

  // Alert Modal Component
  const AlertModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <BellRing size={48} className="modal-icon" />
          <h3 className="modal-title">Security Alert!</h3>
          <p className="modal-message">{message}</p>
          <button onClick={onClose} className="button button-danger">Dismiss</button>
        </div>
      </div>
    );
  };

  // Main Render Logic based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'Home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'STT': return <STTPage transcribedText={transcribedText} setTranscribedText={setTranscribedText} processTranscribedText={processTranscribedText} simulateSTT={simulateSTT} />;
      case 'KeywordDetection': return <KeywordDetectionPage transcribedText={transcribedText} detectedKeywords={detectedKeywords} customKeywords={customKeywords} setCustomKeywords={setCustomKeywords} triggerAlert={triggerAlert} />;
      case 'SentimentAnalysis': return <SentimentAnalysisPage transcribedText={transcribedText} sentimentResult={sentimentResult} />;
      case 'SpeakerDiarization': return <SpeakerDiarizationPage speakerDiarizationResult={speakerDiarizationResult} />;
      case 'VoiceBiometrics': return <VoiceBiometricsPage />;
      case 'AbnormalSpeech': return <AbnormalSpeechPage transcribedText={transcribedText} abnormalSpeechResult={abnormalSpeechResult} />;
      case 'ContextualAnalysis': return <ContextualAnalysisPage transcribedText={transcribedText} contextualAnalysisResult={contextualAnalysisResult} />;
      case 'AlertingSystem': return <AlertingSystemPage alerts={alerts} triggerAlert={triggerAlert} />;
      case 'CustomizableRules': return <CustomizableRulesPage customKeywords={customKeywords} setCustomKeywords={setCustomKeywords} triggerAlert={triggerAlert} />;
      case 'ReportingLogging': return <ReportingLoggingPage alerts={alerts} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {renderPage()}
      </div>
      <Navbar setCurrentPage={setCurrentPage} />
      <AlertModal isOpen={isAlertModalOpen} message={alertMessage} onClose={() => setIsAlertModalOpen(false)} />
    </div>
  );
};

export default App;
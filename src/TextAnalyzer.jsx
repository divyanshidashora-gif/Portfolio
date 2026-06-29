import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./TextAnalyzer.css";

function TextAnalyzer() {
  const [text, setText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef(null);

  // Math metrics
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;
  
  const wordsArray = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = wordsArray.length;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length;

  // Reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  // Readability estimate
  const getReadability = () => {
    if (wordCount === 0) return "Empty Text";
    const avgSentenceLength = wordCount / (sentences || 1);
    if (avgSentenceLength < 10) return "Very Easy (Grade 5-6)";
    if (avgSentenceLength < 15) return "Easy to Read (Grade 7-8)";
    if (avgSentenceLength < 22) return "Standard (Grade 9-12)";
    return "Difficult (College Level)";
  };

  // Word frequency calculations (excluding common stop words)
  const getWordFrequency = () => {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "of", "to", "in", 
      "on", "at", "for", "with", "about", "against", "between", "into", "through", "during", 
      "before", "after", "above", "below", "from", "up", "down", "in", "out", "off", "over", 
      "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", 
      "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", 
      "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", 
      "will", "just", "don", "should", "now", "i", "me", "my", "myself", "we", "our", "ours", 
      "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", 
      "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", 
      "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", 
      "those", "am", "been", "have", "has", "had", "having", "do", "does", "did", "doing"
    ]);

    const freqMap = {};
    wordsArray.forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
      if (cleanWord && !stopWords.has(cleanWord)) {
        freqMap[cleanWord] = (freqMap[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const wordFrequencies = getWordFrequency();

  // Text formatting controls with selection support
  const applyTransform = (transformFn) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = text.substring(start, end);
      const transformed = transformFn(selectedText);
      const newText = text.substring(0, start) + transformed + text.substring(end);
      setText(newText);
      
      // Preserve selection after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      setText(transformFn(text));
    }
  };

  const handleUppercase = () => {
    applyTransform((t) => t.toUpperCase());
  };

  const handleLowercase = () => {
    applyTransform((t) => t.toLowerCase());
  };

  const handleTitleCase = () => {
    applyTransform((t) => 
      t.toLowerCase()
       .split(" ")
       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
       .join(" ")
    );
  };

  const handleSentenceCase = () => {
    applyTransform((t) => 
      t.toLowerCase()
       .replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
         return separator + letter.toUpperCase();
       })
    );
  };

  const handleRemoveSpaces = () => {
    applyTransform((t) => t.replace(/\s+/g, " ").trim());
  };

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="analyzer-page">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            Divyanshi
          </Link>
          <ul className="nav-menu">
            <li>
              <Link to="/" className="nav-link">
                ← Back to Portfolio
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="analyzer-container">
        <header className="analyzer-header">
          <h1>Smart Text Analyzer</h1>
          <p>Format, count, and analyze readability of your text instantly in the browser.</p>
        </header>

        <div className="analyzer-grid">
          {/* Main workspace */}
          <div className="analyzer-main">
            <div className="card text-input-card">
              <div className="card-header">
                <h3>Type or Paste Your Text</h3>
                <div className="word-indicator">
                  {wordCount} words
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your content here..."
                rows="12"
                className="analyzer-textarea"
              ></textarea>
              <div className="tool-actions">
                <button onClick={handleUppercase} className="btn-tool" disabled={!text}>
                  UPPERCASE
                </button>
                <button onClick={handleLowercase} className="btn-tool" disabled={!text}>
                  lowercase
                </button>
                <button onClick={handleTitleCase} className="btn-tool" disabled={!text}>
                  Title Case
                </button>
                <button onClick={handleSentenceCase} className="btn-tool" disabled={!text}>
                  Sentence Case
                </button>
                <button onClick={handleRemoveSpaces} className="btn-tool" disabled={!text}>
                  Remove Extra Spaces
                </button>
                <button onClick={handleCopy} className="btn-tool btn-copy" disabled={!text}>
                  {copySuccess ? "Copied! ✓" : "Copy Text"}
                </button>
                <button onClick={handleClear} className="btn-tool btn-danger" disabled={!text}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar metrics */}
          <div className="analyzer-sidebar">
            {/* Quick Metrics */}
            <div className="card metrics-card">
              <h3>Text Metrics</h3>
              <div className="metrics-list">
                <div className="metric-row">
                  <span>Characters (with spaces)</span>
                  <strong>{charCount}</strong>
                </div>
                <div className="metric-row">
                  <span>Characters (no spaces)</span>
                  <strong>{charNoSpaces}</strong>
                </div>
                <div className="metric-row">
                  <span>Words</span>
                  <strong>{wordCount}</strong>
                </div>
                <div className="metric-row">
                  <span>Sentences</span>
                  <strong>{sentences}</strong>
                </div>
                <div className="metric-row">
                  <span>Paragraphs</span>
                  <strong>{paragraphs}</strong>
                </div>
              </div>
            </div>

            {/* Readability & Time */}
            <div className="card analysis-card">
              <h3>Readability & Stats</h3>
              <div className="stat-box">
                <div className="stat-label">Estimated Reading Time</div>
                <div className="stat-value">{readingTime} min</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Readability Level</div>
                <div className="stat-value readability">{getReadability()}</div>
              </div>
            </div>

            {/* Keyword Density */}
            <div className="card density-card">
              <h3>Top Keywords</h3>
              {wordFrequencies.length === 0 ? (
                <p className="no-data">Type longer sentences to see word density.</p>
              ) : (
                <div className="density-list">
                  {wordFrequencies.map(([word, freq]) => {
                    const percentage = Math.round((freq / wordCount) * 100);
                    return (
                      <div key={word} className="density-row">
                        <div className="density-label">
                          <span className="word-name">{word}</span>
                          <span className="word-count">{freq} times ({percentage}%)</span>
                        </div>
                        <div className="density-bar-bg">
                          <div
                            className="density-bar-fill"
                            style={{ width: `${Math.min(percentage * 3, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextAnalyzer;

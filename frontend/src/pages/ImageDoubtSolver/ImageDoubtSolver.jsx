import { useState } from 'react';
import './ImageDoubtSolver.css';
import { analyzeImage } from '../../services/imageApi';
import { saveImageExplanation } from '../../services/offlineService';

const uiTranslations = {
  en: {
    title: 'Image Doubt Solver',
    subtitle: 'Upload a photo of your notebook, worksheet, or textbook question for quick help.',
    active: 'Active',
    dragInstructions: 'Drag & drop your image here, or browse',
    chooseImage: 'Choose Image',
    removeBtn: 'Remove',
    analyzing: 'Analyzing...',
    analyzeBtn: 'Analyze Image',
    clearBtn: 'Clear',
    gradeLabel: 'Grade',
    subjectLabel: 'Subject',
    analysisTitle: 'Analysis Title',
    explanation: 'Explanation',
    importantPoints: 'Important Points',
    realLifeExample: 'Real Life Example',
    practiceQuestion: 'Practice Question',
    errSelectImage: 'Please select an image file.',
    errUploadImage: 'Please upload an image to analyze.',
  },
  te: {
    title: 'చిత్ర సందేహ నివారణి',
    subtitle: 'మీ నోట్‌బుక్, వర్క్‌షీట్ లేదా పాఠ్యపుస్తకం ఫోటోను అప్‌లోడ్ చేసి సందేహాన్ని నివృత్తి చేసుకోండి.',
    active: 'సక్రియం',
    dragInstructions: 'చిత్రాన్ని ఇక్కడ లాగి వదలండి లేదా బ్రౌజ్ చేయండి',
    chooseImage: 'చిత్రాన్ని ఎంచుకోండి',
    removeBtn: 'తొలగించు',
    analyzing: 'విశ్లేషిస్తోంది...',
    analyzeBtn: 'చిత్రాన్ని విశ్లేషించు',
    clearBtn: 'తుడిచేయి',
    gradeLabel: 'తరగతి',
    subjectLabel: 'విషయం',
    analysisTitle: 'విశ్లేషణ శీర్షిక',
    explanation: 'బోధన వివరణ',
    importantPoints: 'ముఖ్యమైన అంశాలు',
    realLifeExample: 'నిజ జీవిత ఉదాహరణ',
    practiceQuestion: 'అభ్యాస ప్రశ్న',
    errSelectImage: 'దయచేసి ఒక చిత్రాన్ని ఎంచుకోండి.',
    errUploadImage: 'దయచేసి విశ్లేషించడానికి ఒక చిత్రాన్ని అప్‌లోడ్ చేయండి.',
  },
  hi: {
    title: 'छवि संदेह समाधान',
    subtitle: 'अपनी नोटबुक, वर्कशीट या पाठ्यपुस्तक की फोटो अपलोड करें और तुरंत सहायता पाएं।',
    active: 'सक्रिय',
    dragInstructions: 'छवि को यहाँ खींचें और छोड़ें या ब्राउज़ करें',
    chooseImage: 'छवि चुनें',
    removeBtn: 'हटाएं',
    analyzing: 'विश्लेषण किया जा रहा है...',
    analyzeBtn: 'छवि का विश्लेषण करें',
    clearBtn: 'साफ़ करें',
    gradeLabel: 'कक्षा',
    subjectLabel: 'विषय',
    analysisTitle: 'विश्लेषण शीर्षक',
    explanation: 'शिक्षण स्पष्टीकरण',
    importantPoints: 'महत्वपूर्ण बिंदु',
    realLifeExample: 'वास्तविक जीवन का उदाहरण',
    practiceQuestion: 'अभ्यास प्रश्न',
    errSelectImage: 'कृपया एक छवि चुनें।',
    errUploadImage: 'कृपया विश्लेषण के लिए एक छवि अपलोड करें।',
  }
};

export default function ImageDoubtSolver({ grade = 'class6', subject = 'science', language = 'en' }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const lang = uiTranslations[language] ? language : 'en';
  const t = uiTranslations[lang];

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage(t.errSelectImage);
      return;
    }
    setErrorMessage('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setErrorMessage(t.errUploadImage);
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);

    try {
      const response = await analyzeImage({
        imageFile,
        grade,
        subject,
        language: lang,
      });
      setAnalysisResult(response);
    } catch (error) {
      const detail = error?.response?.data?.detail || 'An error occurred during analysis.';
      setErrorMessage(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveExplanation = () => {
    if (!analysisResult) return;
    try {
      saveImageExplanation({
        title: analysisResult.title || (imageFile ? imageFile.name : 'Image Lesson'),
        subject: subject,
        grade: grade,
        language: lang,
        explanation: analysisResult.explanation,
        important_points: analysisResult.important_points,
        real_life_example: analysisResult.real_life_example,
        practice_question: analysisResult.practice_question,
        previewUrl: previewUrl,
      });
      alert('Explanation saved successfully for offline access!');
    } catch (e) {
      console.error('Failed to save explanation', e);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setErrorMessage('');
  };

  return (
    <div className="image-doubt-panel mt-4">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div className="section-heading mb-1">
                {t.title}
              </div>
              <p className="tutor-hero-copy mb-0">
                {t.subtitle}
              </p>
            </div>
            <span className="badge rounded-pill text-bg-success">
              {t.active}
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`dropzone mt-4 ${isDragging ? 'dragover' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Selected doubt preview" className="img-preview" />
                <button 
                  className="btn btn-danger btn-sm remove-preview-btn"
                  onClick={handleClear}
                >
                  ✕ {t.removeBtn}
                </button>
              </div>
            ) : (
              <div className="dropzone-instructions">
                <span className="dropzone-icon">📷</span>
                <p className="mt-2 mb-1 fw-bold">
                  {t.dragInstructions}
                </p>
                <p className="small text-muted mb-3">Supports JPG, PNG</p>
                <label className="btn btn-sm btn-outline-success px-4 py-2" style={{ cursor: 'pointer' }}>
                  {t.chooseImage}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleImageChange(e.target.files[0])} 
                  />
                </label>
              </div>
            )}
          </div>

          {errorMessage ? (
            <div className="alert alert-danger mt-3 mb-0 tutor-alert">{errorMessage}</div>
          ) : null}

          {/* Actions */}
          <div className="d-flex flex-wrap gap-3 mt-4">
            <button 
              className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !imageFile}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <span>{t.analyzeBtn}</span>
              )}
            </button>
            <button
              className="btn btn-guest px-4 py-2"
              onClick={handleClear}
              disabled={isAnalyzing}
            >
              {t.clearBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      {analysisResult ? (
        <div className="row g-3 mt-1 tutor-response-grid animate-fade-in">
          <div className="col-12">
            <div className="card border-0 shadow-sm tutor-result-card">
              <div className="card-header tutor-result-header">
                {t.analysisTitle}
              </div>
              <div className="card-body">
                <h4 className="card-title mb-0 tutor-result-title">{analysisResult.title}</h4>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">
                {t.explanation}
              </div>
              <div className="card-body">
                <p className="card-text mb-0 tutor-result-text" style={{ whiteSpace: 'pre-line' }}>{analysisResult.explanation}</p>
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 px-3"
                    onClick={handleSaveExplanation}
                  >
                    💾 Save Explanation
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm tutor-result-card h-100">
              <div className="card-header tutor-result-header">
                {t.importantPoints}
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush tutor-list-group">
                  {(analysisResult.important_points || []).map((point, index) => (
                    <li className="list-group-item px-0 py-2" key={index}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {analysisResult.real_life_example && (
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm tutor-result-card h-100">
                <div className="card-header tutor-result-header">
                  {t.realLifeExample}
                </div>
                <div className="card-body">
                  <p className="card-text mb-0 tutor-result-text">{analysisResult.real_life_example}</p>
                </div>
              </div>
            </div>
          )}

          {analysisResult.practice_question && (
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm tutor-result-card h-100">
                <div className="card-header tutor-result-header">
                  {t.practiceQuestion}
                </div>
                <div className="card-body">
                  <p className="card-text mb-0 tutor-result-text">{analysisResult.practice_question}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

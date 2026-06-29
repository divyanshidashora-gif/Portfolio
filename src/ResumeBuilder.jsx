import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph } from "docx";
import "./ResumeBuilder.css";

const defaultResume = {
  contact: {
    fullName: "",
    title: "",
    phone: "",
    email: "",
    linkedin: "",
    website: "",
    city: "",
    state: "",
  },
  summary: "",
  education: [
    {
      degree: "",
      specialization: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
    },
  ],
  skills: {
    programming: ["JavaScript", "Python"],
    frontend: ["React.js", "HTML5", "CSS3"],
    backend: ["Node.js"],
    database: ["MongoDB"],
    tools: ["Git"],
  },
  projects: [
    {
      title: "",
      technologies: "",
      description: "",
      github: "",
      demo: "",
    },
  ],
  experience: [
    {
      jobTitle: "",
      companyName: "",
      location: "",
      startDate: "",
      endDate: "",
      responsibilities: "",
    },
  ],
  certifications: [
    {
      name: "",
      organization: "",
      date: "",
      link: "",
    },
  ],
  languages: [
    { name: "English", level: "Fluent" }
  ],
  references: [
    { name: "", company: "", email: "", phone: "" }
  ],
  achievements: [
    { title: "", date: "", desc: "" }
  ],
  interests: ["Coding"],
  customSection: {
    title: "Open Source Projects",
    items: ["Maintained a developer portfolio template project"]
  }
};

const demoResume = {
  contact: {
    fullName: "Divyanshi Dashora",
    title: "Lead Frontend Developer",
    phone: "+91 98765 43210",
    email: "divyanshi@example.com",
    linkedin: "linkedin.com/in/divyanshi",
    website: "github.com/divyanshi",
    city: "Udaipur",
    state: "Rajasthan, India",
  },
  summary: "Dynamic Frontend Engineer with 4+ years of experience designing and implementing rich, responsive web applications. Specialized in React.js, clean CSS systems, and performance optimization. Passionate about translating complex user requirements into elegant digital experiences.",
  education: [
    {
      degree: "B.Tech",
      specialization: "Computer Science & Engineering",
      institution: "Rajasthan Technical University",
      location: "Kota, India",
      startDate: "2018",
      endDate: "2022",
      grade: "8.8 CGPA",
    },
  ],
  skills: {
    programming: ["JavaScript (ES6+)", "TypeScript", "Python", "HTML5/CSS3"],
    frontend: ["React.js", "Vite", "Redux Toolkit", "Next.js", "Tailwind CSS"],
    backend: ["Node.js", "Express.js", "REST APIs"],
    database: ["MongoDB", "PostgreSQL", "MySQL"],
    tools: ["Git", "VS Code", "Webpack", "Docker", "Figma"],
  },
  projects: [
    {
      title: "Interactive Data Analytics Dashboard",
      technologies: "React, D3.js, Tailwind CSS, Node.js",
      description: "Designed a real-time data visualizer with dynamic filtering, live WebSocket updates, and customizable widget layouts. Improved rendering efficiency by 35% through custom memoization hooks.",
      github: "github.com/divyanshi/analytics-dashboard",
      demo: "analytics.divyanshi.dev",
    },
    {
      title: "Self-Service Translation Portal",
      technologies: "React, React Router, Tailwind, i18next",
      description: "Built a localization tool that streamlines community-driven translation workflows. Integrated cloud-based translator memory cache to suggest optimal phrases.",
      github: "github.com/divyanshi/translation-portal",
      demo: "translate.divyanshi.dev",
    }
  ],
  experience: [
    {
      jobTitle: "Senior Frontend Engineer",
      companyName: "PixelCraft Technologies",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      responsibilities: "Lead a remote team of 4 frontend devs in migrating legacy portals to Vite + React. Standardized CSS design tokens and custom UI component libraries, boosting code reuse by 50%.",
    },
    {
      jobTitle: "Frontend Developer",
      companyName: "WebFlow Studio",
      location: "Jaipur, India",
      startDate: "2022",
      endDate: "2023",
      responsibilities: "Collaborated closely with UX designers to convert high-fidelity Figma prototypes to pixel-perfect layouts. Optimized web application performance to hit 95+ Lighthouse scores.",
    }
  ],
  certifications: [
    {
      name: "AWS Certified Developer - Associate",
      organization: "Amazon Web Services",
      date: "2024",
      link: "aws.amazon.com/verify",
    },
  ],
  languages: [
    { name: "English", level: "Native / Bilingual" },
    { name: "Hindi", level: "Fluent" },
  ],
  references: [
    { name: "Dr. Alok Sharma", company: "RTU Professor", email: "alok@rtu.ac.in", phone: "+91 99999 88888" }
  ],
  achievements: [
    { title: "Winner - Smart India Hackathon", date: "2021", desc: "Built a decentralized translation marketplace using web technologies." }
  ],
  interests: ["Interactive Web Design", "Open Source", "UI/UX Prototyping"],
  customSection: {
    title: "Open Source Contributions",
    items: [
      "Contributed several performance updates to the React core architecture repository",
      "Maintained a custom CSS variables extension library with 1,000+ weekly downloads"
    ]
  }
};

const fontOptions = [
  { value: "Inter", label: "Inter (Sans-Serif)" },
  { value: "Montserrat", label: "Montserrat (Modern)" },
  { value: "Playfair Display", label: "Playfair Display (Classic)" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Tech)" },
  { value: "Outfit", label: "Outfit (Creative)" },
];

const colorOptions = [
  { hex: "#2563eb", name: "Royal Blue" },
  { hex: "#10b981", name: "Emerald Oasis" },
  { hex: "#8b5cf6", name: "Cyber Violet" },
  { hex: "#ec4899", name: "Blossom Pink" },
  { hex: "#f97316", name: "Sunset Orange" },
  { hex: "#4b5563", name: "Classic Charcoal" },
];

const languageLevels = ["Native / Bilingual", "Fluent", "Professional", "Intermediate", "Beginner"];

const commonKeywords = [
  "React", "JavaScript", "TypeScript", "Python", "Node", "HTML", "CSS", "Tailwind", "Bootstrap",
  "Webpack", "Docker", "Git", "SQL", "MongoDB", "PostgreSQL", "Next.js", "Vite", "Redux", "AWS",
  "APIs", "REST", "GraphQL", "Java", "C++", "Vue", "Figma", "Firebase", "Testing", "UI/UX"
];

const auditRules = [
  { phrase: "responsible for", alternative: "spearheaded, orchestrated, led, executed" },
  { phrase: "worked on", alternative: "engineered, developed, implemented, built" },
  { phrase: "team player", alternative: "collaborative professional, cross-functional partner" },
  { phrase: "hard worker", alternative: "results-driven contributor, dedicated professional" },
  { phrase: "handled", alternative: "managed, supervised, coordinated" },
  { phrase: "was given", alternative: "was selected to, took ownership of" },
  { phrase: "helped to", alternative: "facilitated, optimized, contributed to" }
];

const metricTemplates = [
  { label: "⚡ Speed", text: "Redesigned the core platform architecture, reducing page load times by [X]% and improving application responsiveness." },
  { label: "💰 Revenue", text: "Optimized user conversion funnel flows, driving a [X]% increase in checkouts and contributing $[Y] in ARR." },
  { label: "👥 Leadership", text: "Coordinated a cross-functional squad of [X] developers and designers to launch [Y] feature sets on schedule." },
  { label: "📈 Latency", text: "Refactored backend database schemas and indexing structures, decreasing request latency by [X]% under heavy loads." },
  { label: "🤖 Automation", text: "Automated standard CI/CD deployment pipelines, cutting manual build errors by [X]% and saving [Y] engineering hours weekly." }
];

function ResumeBuilder() {
  const [resume, setResume] = useState(defaultResume);
  const [photo, setPhoto] = useState(null);
  const [template, setTemplate] = useState("minimal");
  
  // Navigation categories
  const [activeCategory, setActiveCategory] = useState("profile"); // profile | experience | education | skills | appearance | optimizer
  
  // Custom styling settings
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [lineHeight, setLineHeight] = useState("1.5");
  const [pagePadding, setPagePadding] = useState(44);
  const [sectionMargin, setSectionMargin] = useState(16);
  const [fontSize, setFontSize] = useState(14);
  const [scale, setScale] = useState(0.85);
  const [mobileView, setMobileView] = useState("edit");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        const previewScrollEl = document.querySelector(".rb-preview-scroll");
        if (previewScrollEl) {
          const availableWidth = previewScrollEl.clientWidth - 40;
          const newScale = Math.min(1, Math.max(0.3, availableWidth / 794));
          setScale(newScale);
        } else {
          const newScale = Math.min(1, Math.max(0.3, (window.innerWidth - 40) / 794));
          setScale(newScale);
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileView]);

  // Premium features state & refs
  const [signatureImage, setSignatureImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [savedVersions, setSavedVersions] = useState([]);
  const canvasRef = useRef(null);


  // ATS Scanner state
  const [jobDescription, setJobDescription] = useState("");
  const [atsKeywords, setAtsKeywords] = useState({ matched: [], missing: [], score: 0, scanned: false });

  // Section Render Order
  const [sectionOrder, setSectionOrder] = useState([
    "summary",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "languages",
    "references",
    "achievements",
    "customSection"
  ]);

  // Section Visibility toggle
  const [visibility, setVisibility] = useState({
    summary: true,
    education: true,
    skills: true,
    projects: true,
    experience: true,
    certifications: true,
    languages: true,
    references: true,
    achievements: true,
    interests: true,
    customSection: true,
  });

  const jsonUploadRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);
  const pageRef = useRef(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cleanResumeData");
    const savedTemplate = localStorage.getItem("cleanResumeTemplate");
    const savedStyle = localStorage.getItem("cleanResumeStyle");
    const savedOrder = localStorage.getItem("cleanResumeOrder");
    const savedVisibility = localStorage.getItem("cleanResumeVisibility");
    const savedPhoto = localStorage.getItem("cleanResumePhoto");
    const savedSignature = localStorage.getItem("cleanResumeSignature");
    const savedVers = localStorage.getItem("rb_saved_versions");
    
    if (saved) {
      try {
        setResume(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedTemplate) setTemplate(savedTemplate);
    if (savedStyle) {
      try {
        const style = JSON.parse(savedStyle);
        if (style.accentColor) setAccentColor(style.accentColor);
        if (style.fontFamily) setFontFamily(style.fontFamily);
        if (style.lineHeight) setLineHeight(style.lineHeight);
        if (style.pagePadding) setPagePadding(style.pagePadding);
        if (style.sectionMargin) setSectionMargin(style.sectionMargin);
        if (style.fontSize) setFontSize(style.fontSize);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedOrder) {
      try {
        setSectionOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedVisibility) {
      try {
        setVisibility(JSON.parse(savedVisibility));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedPhoto) setPhoto(savedPhoto);
    if (savedSignature) setSignatureImage(savedSignature);
    if (savedVers) {
      try {
        setSavedVersions(JSON.parse(savedVers));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Autosave
  useEffect(() => {
    localStorage.setItem("cleanResumeData", JSON.stringify(resume));
    localStorage.setItem("cleanResumeTemplate", template);
    localStorage.setItem("cleanResumeStyle", JSON.stringify({ accentColor, fontFamily, lineHeight, pagePadding, sectionMargin, fontSize }));
    localStorage.setItem("cleanResumeOrder", JSON.stringify(sectionOrder));
    localStorage.setItem("cleanResumeVisibility", JSON.stringify(visibility));
    if (photo) {
      localStorage.setItem("cleanResumePhoto", photo);
    } else {
      localStorage.removeItem("cleanResumePhoto");
    }
    if (signatureImage) {
      localStorage.setItem("cleanResumeSignature", signatureImage);
    } else {
      localStorage.removeItem("cleanResumeSignature");
    }
  }, [resume, template, accentColor, fontFamily, lineHeight, pagePadding, sectionMargin, fontSize, sectionOrder, visibility, photo, signatureImage]);

  // Premium Features - Canvas signature drawing logic
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignatureImage();
  };

  const saveSignatureImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureImage(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const drawSavedSignatureOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureImage) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = signatureImage;
  };

  useEffect(() => {
    if (activeCategory === "profile" && signatureImage && canvasRef.current) {
      drawSavedSignatureOnCanvas();
    }
  }, [activeCategory, signatureImage]);

  // Premium Features - Actionable Metric Helper
  const insertMetricTemplate = (section, index, field, templateText) => {
    const textarea = document.getElementById(`textarea-${section}-${index}`);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newValue = before + templateText + after;
    handleArrayUpdate(section, index, field, newValue);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + templateText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Premium Features - Local Storage Resume Multi-Version Manager
  const handleSaveVersion = (customName) => {
    let name = customName;
    if (!name || !name.trim()) {
      const input = window.prompt("Enter a name for this version (e.g. 'React Lead CV'):");
      if (!input || !input.trim()) return;
      name = input.trim();
    }
    const newVersion = {
      id: Date.now().toString(),
      name,
      date: new Date().toLocaleString(),
      resume,
      template,
      photo,
      signatureImage,
      style: { accentColor, fontFamily, lineHeight, pagePadding, sectionMargin, fontSize },
      sectionOrder,
      visibility
    };
    const updated = [...savedVersions, newVersion];
    setSavedVersions(updated);
    localStorage.setItem("rb_saved_versions", JSON.stringify(updated));
    alert(`Version "${name}" saved to browser storage!`);
  };

  const handleLoadVersion = (versionId) => {
    const ver = savedVersions.find(v => v.id === versionId);
    if (!ver) return;
    if (window.confirm(`Load version "${ver.name}"? This will overwrite active changes.`)) {
      setResume(ver.resume);
      setTemplate(ver.template);
      setPhoto(ver.photo || null);
      setSignatureImage(ver.signatureImage || null);
      if (ver.style) {
        if (ver.style.accentColor) setAccentColor(ver.style.accentColor);
        if (ver.style.fontFamily) setFontFamily(ver.style.fontFamily);
        if (ver.style.lineHeight) setLineHeight(ver.style.lineHeight);
        if (ver.style.pagePadding) setPagePadding(ver.style.pagePadding);
        if (ver.style.sectionMargin) setSectionMargin(ver.style.sectionMargin);
        if (ver.style.fontSize) setFontSize(ver.style.fontSize);
      }
      if (ver.sectionOrder) setSectionOrder(ver.sectionOrder);
      if (ver.visibility) setVisibility(ver.visibility);
      alert(`Loaded version: "${ver.name}"`);
    }
  };

  const handleDeleteVersion = (versionId, e) => {
    if (e) e.stopPropagation();
    const ver = savedVersions.find(v => v.id === versionId);
    if (!ver) return;
    if (window.confirm(`Delete version "${ver.name}"?`)) {
      const updated = savedVersions.filter(v => v.id !== versionId);
      setSavedVersions(updated);
      localStorage.setItem("rb_saved_versions", JSON.stringify(updated));
    }
  };

  // Premium Features - Style settings reset
  const handleResetAppearance = () => {
    if (window.confirm("Reset all typography, colors, and layout spacings to factory defaults?")) {
      setAccentColor("#2563eb");
      setFontFamily("Inter");
      setLineHeight("1.5");
      setPagePadding(44);
      setSectionMargin(16);
      setFontSize(14);
    }
  };


  // Track page height
  useEffect(() => {
    if (pageRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setPageHeight(pageRef.current.scrollHeight);
      });
      resizeObserver.observe(pageRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Local ATS Keyword Scanner scan logic
  const handleAtsScan = () => {
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description first!");
      return;
    }
    
    const jdTextLower = jobDescription.toLowerCase();
    
    // Find JD matching keywords
    const extractedJdKeywords = commonKeywords.filter(kw => jdTextLower.includes(kw.toLowerCase()));
    
    if (extractedJdKeywords.length === 0) {
      setAtsKeywords({
        matched: [],
        missing: [],
        score: 50,
        scanned: true
      });
      return;
    }

    // Convert resume fields to lower text content to scan matches
    const allSkills = Object.values(resume.skills).flat().join(" ").toLowerCase();
    const resumeText = [
      resume.summary,
      resume.contact.title,
      allSkills,
      resume.projects.map(p => `${p.title} ${p.technologies} ${p.description}`).join(" "),
      resume.experience.map(e => `${e.jobTitle} ${e.responsibilities}`).join(" "),
      resume.education.map(ed => `${ed.degree} ${ed.specialization}`).join(" ")
    ].join(" ").toLowerCase();

    const matched = extractedJdKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
    const missing = extractedJdKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()));
    
    const score = Math.round((matched.length / extractedJdKeywords.length) * 100);

    setAtsKeywords({
      matched,
      missing,
      score,
      scanned: true
    });
  };

  // Real-time Text Auditor returns matches found in text
  const checkPassivePhrases = (text) => {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    return auditRules.filter(rule => lowerText.includes(rule.phrase));
  };

  const handleAutoShrink = () => {
    if (!pageRef.current) return;
    let currentPadding = pagePadding;
    let currentMargin = sectionMargin;
    let currentLineHeight = parseFloat(lineHeight);
    let currentFontSize = fontSize;

    let iterations = 0;
    while (pageRef.current.scrollHeight > 1123 && iterations < 8) {
      if (currentPadding > 24) currentPadding -= 2;
      if (currentMargin > 6) currentMargin -= 2;
      if (currentLineHeight > 1.25) currentLineHeight -= 0.05;
      if (currentFontSize > 11) currentFontSize -= 0.5;
      iterations++;
    }

    setPagePadding(currentPadding);
    setSectionMargin(currentMargin);
    setLineHeight(currentLineHeight.toString());
    setFontSize(currentFontSize);
  };

  const moveSection = (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= sectionOrder.length) return;
    const order = [...sectionOrder];
    const temp = order[index];
    order[index] = order[nextIdx];
    order[nextIdx] = temp;
    setSectionOrder(order);
  };

  const updateContact = (field, val) => {
    setResume(curr => ({
      ...curr,
      contact: { ...curr.contact, [field]: val }
    }));
  };

  const handleArrayUpdate = (section, index, field, val) => {
    setResume(curr => {
      const list = [...curr[section]];
      list[index] = { ...list[index], [field]: val };
      return { ...curr, [section]: list };
    });
  };

  const addArrayItem = (section, emptyItem) => {
    setResume(curr => ({
      ...curr,
      [section]: [...curr[section], emptyItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResume(curr => {
      const list = curr[section].filter((_, i) => i !== index);
      return {
        ...curr,
        [section]: list.length ? list : [defaultResume[section][0]]
      };
    });
  };

  // Skill Tags
  const [newSkill, setNewSkill] = useState({ category: "programming", val: "" });
  const addSkillTag = (category) => {
    if (!newSkill.val.trim()) return;
    setResume(curr => {
      const updated = [...(curr.skills[category] || [])];
      if (!updated.includes(newSkill.val.trim())) updated.push(newSkill.val.trim());
      return { ...curr, skills: { ...curr.skills, [category]: updated } };
    });
    setNewSkill({ ...newSkill, val: "" });
  };
  const removeSkillTag = (category, index) => {
    setResume(curr => {
      const updated = curr.skills[category].filter((_, i) => i !== index);
      return { ...curr, skills: { ...curr.skills, [category]: updated } };
    });
  };

  // Interest tags
  const [newInterest, setNewInterest] = useState("");
  const addInterestTag = () => {
    if (!newInterest.trim()) return;
    setResume(curr => {
      const updated = [...curr.interests];
      if (!updated.includes(newInterest.trim())) updated.push(newInterest.trim());
      return { ...curr, interests: updated };
    });
    setNewInterest("");
  };
  const removeInterestTag = (index) => {
    setResume(curr => ({
      ...curr,
      interests: curr.interests.filter((_, i) => i !== index)
    }));
  };

  // Custom items
  const [newCustomItem, setNewCustomItem] = useState("");
  const addCustomItem = () => {
    if (!newCustomItem.trim()) return;
    setResume(curr => ({
      ...curr,
      customSection: {
        ...curr.customSection,
        items: [...curr.customSection.items, newCustomItem.trim()]
      }
    }));
    setNewCustomItem("");
  };
  const removeCustomItem = (index) => {
    setResume(curr => ({
      ...curr,
      customSection: {
        ...curr.customSection,
        items: curr.customSection.items.filter((_, i) => i !== index)
      }
    }));
  };

  const handleLoadDemo = () => {
    setResume(demoResume);
    setTemplate("tech");
    setAccentColor("#10b981");
    setFontFamily("Inter");
    setPagePadding(44);
    setSectionMargin(16);
    setFontSize(13);
  };

  const handleReset = () => {
    if (window.confirm("Clear all data?")) {
      setResume(defaultResume);
      setPhoto(null);
      setTemplate("minimal");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "resume.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.contact && parsed.skills) {
          setResume(parsed);
          alert("Imported successfully!");
        } else {
          alert("Incorrect schema.");
        }
      } catch (err) {
        alert("Failed to parse.");
      }
    };
    fileReader.readAsText(file);
  };

  const handleExportPDF = async () => {
    const preview = document.getElementById("rb-preview-target");
    if (!preview) return;
    const origTransform = preview.style.transform;
    preview.style.transform = "none";

    try {
      const canvas = await html2canvas(preview, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resume.contact.fullName || "resume"}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      preview.style.transform = origTransform;
    }
  };

  const handleExportWord = async () => {
    const paragraphs = [
      new Paragraph({ text: resume.contact.fullName || "My Resume", heading: "Heading1" }),
      new Paragraph({ text: `${resume.contact.email} | ${resume.contact.phone}` }),
      new Paragraph({ text: resume.summary })
    ];
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${resume.contact.fullName || "resume"}.docx`);
  };

  // Section details renderer for inside A4 Page
  const renderA4Section = (secName) => {
    if (!visibility[secName]) return null;
    const sectionStyle = { marginBottom: `${sectionMargin}px` };

    switch (secName) {
      case "summary":
        return resume.summary ? (
          <section className="rb-section" key="summary" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-sidebar-title">Profile Summary</div>
            ) : (
              <h2 className="rb-section-title">Professional Summary</h2>
            )}
            <p style={{ margin: "0", fontSize: "13px" }}>{resume.summary}</p>
          </section>
        ) : null;

      case "experience":
        return resume.experience.some(exp => exp.jobTitle) ? (
          <section className="rb-section" key="experience" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">Work Experience</div>
            ) : (
              <h2 className="rb-section-title">Work History</h2>
            )}
            {resume.experience.map((exp, idx) => (
              exp.jobTitle && (
                <div className="rb-entry" key={idx} style={{ marginBottom: "10px" }}>
                  <div className="rb-entry-header" style={{ display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                    <span style={{ color: "var(--theme-accent)" }}>{exp.jobTitle}</span>
                    <span>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="rb-entry-subheader" style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "13px" }}>
                    <span>{exp.companyName} | {exp.location}</span>
                  </div>
                  {exp.responsibilities && (
                    <div className="rb-entry-desc" style={{ fontSize: "13px", marginTop: "3px", whiteSpace: "pre-line" }}>
                      {exp.responsibilities}
                    </div>
                  )}
                </div>
              )
            ))}
          </section>
        ) : null;

      case "education":
        return resume.education.some(edu => edu.degree) ? (
          <section className="rb-section" key="education" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">Education Background</div>
            ) : (
              <h2 className="rb-section-title">Education</h2>
            )}
            {resume.education.map((edu, idx) => (
              edu.degree && (
                <div className="rb-entry" key={idx} style={{ marginBottom: "8px" }}>
                  <div className="rb-entry-header" style={{ display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                    <span>{edu.degree} in {edu.specialization}</span>
                    <span>{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="rb-entry-subheader" style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "13px" }}>
                    <span>{edu.institution} | {edu.location}</span>
                    <span>{edu.grade && `Grade: ${edu.grade}`}</span>
                  </div>
                </div>
              )
            ))}
          </section>
        ) : null;

      case "skills":
        if (template === "creative") return null;
        return (
          <section className="rb-section" key="skills" style={sectionStyle}>
            <h2 className="rb-section-title">Technical Expertise</h2>
            {template === "tech" ? (
              <div className="rb-skills-box">
                {Object.entries(resume.skills).map(([category, items]) => (
                  items.length > 0 && (
                    <div className="rb-skill-row" key={category}>
                      <span className="rb-skill-cat" style={{ textTransform: "capitalize", color: "var(--theme-accent)" }}>
                        {category}
                      </span>
                      <div className="rb-skill-items">
                        {items.map((it, i) => (
                          <span className="rb-skill-badge" key={i}>{it}</span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                {Object.entries(resume.skills).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category}>
                      <strong style={{ textTransform: "capitalize" }}>{category}: </strong>
                      <span>{items.join(", ")}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </section>
        );

      case "projects":
        return resume.projects.some(p => p.title) ? (
          <section className="rb-section" key="projects" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">Key Projects</div>
            ) : (
              <h2 className="rb-section-title">Projects</h2>
            )}
            {resume.projects.map((proj, idx) => (
              proj.title && (
                <div className="rb-entry" key={idx} style={{ marginBottom: "10px" }}>
                  <div className="rb-entry-header" style={{ display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                    <span style={{ color: "var(--theme-accent)" }}>{proj.title}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{proj.technologies}</span>
                  </div>
                  {proj.description && (
                    <p style={{ fontSize: "13px", margin: "3px 0 0" }}>{proj.description}</p>
                  )}
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", marginTop: "3px", color: "var(--theme-accent)" }}>
                    {proj.github && <span>💻 {proj.github}</span>}
                    {proj.demo && <span>🌐 {proj.demo}</span>}
                  </div>
                </div>
              )
            ))}
          </section>
        ) : null;

      case "certifications":
        return resume.certifications?.some(c => c.name) ? (
          <section className="rb-section" key="certifications" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">Certifications</div>
            ) : (
              <h2 className="rb-section-title">Certifications</h2>
            )}
            <ul className="rb-bullets" style={{ fontSize: "13px" }}>
              {resume.certifications.map((c, idx) => (
                c.name && (
                  <li key={idx}>
                    <strong>{c.name}</strong> — {c.organization} ({c.date})
                  </li>
                )
              ))}
            </ul>
          </section>
        ) : null;

      case "languages":
        if (template === "creative") return null;
        return resume.languages?.some(l => l.name) ? (
          <section className="rb-section" key="languages" style={sectionStyle}>
            <h2 className="rb-section-title">Languages</h2>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px" }}>
              {resume.languages.map((lang, idx) => (
                lang.name && (
                  <div key={idx}>
                    <strong>{lang.name}</strong> — <span style={{ color: "#64748b" }}>{lang.level}</span>
                  </div>
                )
              ))}
            </div>
          </section>
        ) : null;

      case "references":
        return resume.references?.some(r => r.name) ? (
          <section className="rb-section" key="references" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">References</div>
            ) : (
              <h2 className="rb-section-title">References</h2>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              {resume.references.map((ref, idx) => (
                ref.name && (
                  <div key={idx} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px" }}>
                    <strong>{ref.name}</strong>
                    <div style={{ color: "#475569" }}>{ref.company}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {ref.email} {ref.phone && `| ${ref.phone}`}
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>
        ) : null;

      case "achievements":
        return resume.achievements?.some(a => a.title) ? (
          <section className="rb-section" key="achievements" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">Achievements</div>
            ) : (
              <h2 className="rb-section-title">Awards & Achievements</h2>
            )}
            <ul className="rb-bullets" style={{ fontSize: "13px" }}>
              {resume.achievements.map((ach, idx) => (
                ach.title && (
                  <li key={idx}>
                    <strong>{ach.title}</strong> ({ach.date}) — <span>{ach.desc}</span>
                  </li>
                )
              ))}
            </ul>
          </section>
        ) : null;

      case "customSection":
        return resume.customSection?.title && resume.customSection.items.length > 0 ? (
          <section className="rb-section" key="customSection" style={sectionStyle}>
            {template === "creative" ? (
              <div className="rb-section-title">{resume.customSection.title}</div>
            ) : (
              <h2 className="rb-section-title">{resume.customSection.title}</h2>
            )}
            <ul className="rb-bullets" style={{ fontSize: "13px" }}>
              {resume.customSection.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={`rb-dashboard rb-view-${mobileView}`}>
      {/* 1. Left Editor Workspace */}
      <div className="rb-editor-workspace">
        
        {/* Navigation Category Sidebar Menu */}
        <nav className="rb-editor-navigation">
          <Link to="/" className="rb-nav-logo">R</Link>
          
          <button type="button" className={`rb-nav-item ${activeCategory === "profile" ? "active" : ""}`} onClick={() => setActiveCategory("profile")}>
            <span className="rb-nav-icon">👤</span>
            <span>Profile</span>
          </button>
          
          <button type="button" className={`rb-nav-item ${activeCategory === "experience" ? "active" : ""}`} onClick={() => setActiveCategory("experience")}>
            <span className="rb-nav-icon">💼</span>
            <span>Experience</span>
          </button>
          
          <button type="button" className={`rb-nav-item ${activeCategory === "education" ? "active" : ""}`} onClick={() => setActiveCategory("education")}>
            <span className="rb-nav-icon">🎓</span>
            <span>Education</span>
          </button>
          
          <button type="button" className={`rb-nav-item ${activeCategory === "skills" ? "active" : ""}`} onClick={() => setActiveCategory("skills")}>
            <span className="rb-nav-icon">🛠️</span>
            <span>Skills</span>
          </button>

          <button type="button" className={`rb-nav-item ${activeCategory === "optimizer" ? "active" : ""}`} onClick={() => setActiveCategory("optimizer")}>
            <span className="rb-nav-icon">🛡️</span>
            <span>ATS Scan</span>
          </button>
          
          <button type="button" className={`rb-nav-item ${activeCategory === "appearance" ? "active" : ""}`} onClick={() => setActiveCategory("appearance")}>
            <span className="rb-nav-icon">🎨</span>
            <span>Appearance</span>
          </button>
        </nav>

        {/* Spacious Form Category Container Area */}
        <div className="rb-active-form-area">
          <div className="rb-form-header">
            <h2 className="rb-form-title" style={{ textTransform: "capitalize" }}>
              {activeCategory === "optimizer" ? "ATS & Keyword Scanner" : `${activeCategory} Details`}
            </h2>
            
            {/* Multi-Version Quick Selector Dropdown & Quick Save */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                className="rb-form-input"
                style={{ width: "auto", padding: "6px 12px", height: "32px", fontSize: "12px", background: "rgba(15, 23, 42, 0.6)" }}
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadVersion(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="" disabled>📁 Load Version...</option>
                {savedVersions.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="rb-btn-secondary"
                style={{ padding: "6px 12px", height: "32px", fontSize: "11px", borderColor: "var(--success)", color: "var(--success)" }}
                onClick={() => handleSaveVersion()}
              >
                💾 Save CV
              </button>
            </div>
            
            <span style={{ fontSize: "12px", color: "var(--success)" }}>● Auto-saved</span>
          </div>

          <div className="rb-form-scroll">
            
            {/* Category: PROFILE */}
            {activeCategory === "profile" && (
              <div className="rb-form-card">
                <div className="rb-card-header">
                  <h3 className="rb-card-title">Contact & Summary details</h3>
                </div>
                <div className="rb-input-grid">
                  <div className="rb-input-grp rb-input-span-2">
                    <span className="rb-field-lbl">Full Name</span>
                    <input type="text" className="rb-form-input" value={resume.contact.fullName} onChange={(e) => updateContact("fullName", e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="rb-input-grp rb-input-span-2">
                    <span className="rb-field-lbl">Headline Title</span>
                    <input type="text" className="rb-form-input" value={resume.contact.title} onChange={(e) => updateContact("title", e.target.value)} placeholder="Senior Software Architect" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">Email Address</span>
                    <input type="email" className="rb-form-input" value={resume.contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">Phone</span>
                    <input type="text" className="rb-form-input" value={resume.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="+91 99999 88888" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">LinkedIn</span>
                    <input type="text" className="rb-form-input" value={resume.contact.linkedin} onChange={(e) => updateContact("linkedin", e.target.value)} placeholder="linkedin.com/in/username" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">Website / Github link</span>
                    <input type="text" className="rb-form-input" value={resume.contact.website} onChange={(e) => updateContact("website", e.target.value)} placeholder="github.com/username" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">City</span>
                    <input type="text" className="rb-form-input" value={resume.contact.city} onChange={(e) => updateContact("city", e.target.value)} placeholder="Udaipur" />
                  </div>
                  <div className="rb-input-grp">
                    <span className="rb-field-lbl">State / Country</span>
                    <input type="text" className="rb-form-input" value={resume.contact.state} onChange={(e) => updateContact("state", e.target.value)} placeholder="Rajasthan, India" />
                  </div>
                  <div className="rb-input-grp rb-input-span-2">
                    <span className="rb-field-lbl">Executive Bio Summary Description</span>
                    <textarea className="rb-form-input rb-form-textarea" rows="5" value={resume.summary} onChange={(e) => setResume({ ...resume, summary: e.target.value })} placeholder="Describe your primary field skills and achievements..."></textarea>
                    
                    {/* Writing Auditor Alert widget */}
                    {checkPassivePhrases(resume.summary).length > 0 && (
                      <div className="rb-audit-card">
                        <div className="rb-audit-header-lbl">💡 Phrase Improvement Tip</div>
                        {checkPassivePhrases(resume.summary).map((match, i) => (
                          <div className="rb-audit-item-desc" key={i}>
                            Replace weak phrase <strong>"{match.phrase}"</strong> with: <i>{match.alternative}</i>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rb-input-grp rb-input-span-2">
                    <span className="rb-field-lbl">Sidebar Photo Upload (Creative Layout)</span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input type="file" accept="image/*" style={{ flex: 1 }} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setPhoto(event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                      {photo && (
                        <button type="button" className="rb-btn-danger" style={{ padding: "8px 12px" }} onClick={() => setPhoto(null)}>✕ Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Category Extra Cards: Signature & Versions (rendered alongside Profile details) */}
            {activeCategory === "profile" && (
              <>
                {/* Signature Pad Card */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Signature Pad Integration</h3>
                    {signatureImage && (
                      <span style={{ fontSize: "11px", color: "var(--success)" }}>✓ Signature Saved</span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 12px" }}>
                    Draw your signature in the white box below to automatically insert it at the bottom of your resume document, or upload a scanned image.
                  </p>

                  <div style={{ marginBottom: "16px" }}>
                    <span className="rb-field-lbl" style={{ display: "block", marginBottom: "6px" }}>Or Upload Scanned Signature Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target.result;
                            setSignatureImage(dataUrl);
                            const canvas = canvasRef.current;
                            if (canvas) {
                              const ctx = canvas.getContext("2d");
                              const img = new Image();
                              img.onload = () => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                const hRatio = canvas.width / img.width;
                                const vRatio = canvas.height / img.height;
                                const ratio = Math.min(hRatio, vRatio);
                                const cX = (canvas.width - img.width * ratio) / 2;
                                const cY = (canvas.height - img.height * ratio) / 2;
                                ctx.drawImage(img, 0, 0, img.width, img.height, cX, cY, img.width * ratio, img.height * ratio);
                              };
                              img.src = dataUrl;
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="rb-signature-canvas-container">
                    <canvas
                      ref={canvasRef}
                      className="rb-signature-canvas"
                      width={500}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    
                    <div className="rb-signature-controls">
                      <div className="rb-pen-colors">
                        <span className="rb-field-lbl" style={{ marginRight: "6px" }}>Ink Color:</span>
                        {[
                          { hex: "#000000", name: "Black" },
                          { hex: "#0000ff", name: "Blue" },
                          { hex: "#1e3a8a", name: "Navy" }
                        ].map(color => (
                          <button
                            key={color.hex}
                            type="button"
                            className={`rb-pen-color-dot ${penColor === color.hex ? "active" : ""}`}
                            style={{ backgroundColor: color.hex }}
                            onClick={() => setPenColor(color.hex)}
                            title={color.name}
                          />
                        ))}
                      </div>
                      
                      <button type="button" className="rb-btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={clearSignature}>
                        🗑 Clear Signature
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resume Version Manager Card */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Resume Multi-Version Manager</h3>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 14px" }}>
                    Create and load different versions of your resume for tailoring content to specific positions (e.g. React Specialist, Fullstack Generalist). Saves locally in browser.
                  </p>
                  
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                    <button
                      type="button"
                      className="rb-btn-secondary"
                      style={{ flex: 1, borderColor: "var(--accent-blue)", color: "var(--accent-blue)", fontWeight: "700" }}
                      onClick={() => handleSaveVersion()}
                    >
                      💾 Save Current State as New Version
                    </button>
                  </div>
                  
                  {savedVersions.length > 0 ? (
                    <div className="rb-version-list">
                      {savedVersions.map(v => (
                        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                          <div>
                            <strong style={{ fontSize: "13px", display: "block" }}>{v.name}</strong>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Saved: {v.date}</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="button" className="rb-btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => handleLoadVersion(v.id)}>
                              Load
                            </button>
                            <button type="button" className="rb-btn-danger" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={(e) => handleDeleteVersion(v.id, e)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.01)", border: "1px dashed var(--border-color)", borderRadius: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                      No saved versions found. Save your first version above!
                    </div>
                  )}
                </div>
              </>
            )}


            {/* Category: EXPERIENCE */}
            {activeCategory === "experience" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Work history */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Professional Work History</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.experience} onChange={(e) => setVisibility({ ...visibility, experience: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.experience && (
                    <div className="rb-repeater-container">
                      {resume.experience.map((exp, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("experience", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Job Title</span>
                              <input type="text" className="rb-form-input" value={exp.jobTitle} onChange={(e) => handleArrayUpdate("experience", idx, "jobTitle", e.target.value)} placeholder="Frontend Developer" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Company</span>
                              <input type="text" className="rb-form-input" value={exp.companyName} onChange={(e) => handleArrayUpdate("experience", idx, "companyName", e.target.value)} placeholder="Google" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Location</span>
                              <input type="text" className="rb-form-input" value={exp.location} onChange={(e) => handleArrayUpdate("experience", idx, "location", e.target.value)} placeholder="London" />
                            </div>
                            <div className="rb-input-grid" style={{ gridColumn: "span 1", gap: "8px" }}>
                              <div className="rb-input-grp">
                                <span className="rb-field-lbl">Start Year</span>
                                <input type="text" className="rb-form-input" value={exp.startDate} onChange={(e) => handleArrayUpdate("experience", idx, "startDate", e.target.value)} placeholder="2022" />
                              </div>
                              <div className="rb-input-grp">
                                <span className="rb-field-lbl">End Year</span>
                                <input type="text" className="rb-form-input" value={exp.endDate} onChange={(e) => handleArrayUpdate("experience", idx, "endDate", e.target.value)} placeholder="Present" />
                              </div>
                            </div>
                            <div className="rb-input-grp rb-input-span-2">
                              <span className="rb-field-lbl">Responsibilities</span>
                              <textarea
                                id={`textarea-experience-${idx}`}
                                className="rb-form-input rb-form-textarea"
                                value={exp.responsibilities}
                                onChange={(e) => handleArrayUpdate("experience", idx, "responsibilities", e.target.value)}
                                placeholder="Bullet point descriptions..."
                              />
                              
                              {/* Actionable Metric Helper pills */}
                              <div style={{ marginTop: "4px" }}>
                                <span className="rb-field-lbl" style={{ fontSize: "10px", opacity: 0.8, display: "block", marginBottom: "4px" }}>
                                  💡 Insert Actionable Metric Template:
                                </span>
                                <div className="rb-metric-pill-container">
                                  {metricTemplates.map((tmpl, tIdx) => (
                                    <button
                                      key={tIdx}
                                      type="button"
                                      className="rb-metric-pill"
                                      onClick={() => insertMetricTemplate("experience", idx, "responsibilities", tmpl.text)}
                                      title="Click to insert at cursor"
                                    >
                                      {tmpl.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Writing Auditor Alert widget */}
                              {checkPassivePhrases(exp.responsibilities).length > 0 && (
                                <div className="rb-audit-card">
                                  <div className="rb-audit-header-lbl">💡 Phrase Improvement Tip</div>
                                  {checkPassivePhrases(exp.responsibilities).map((match, i) => (
                                    <div className="rb-audit-item-desc" key={i}>
                                      Instead of <strong>"{match.phrase}"</strong>, try using: <i>{match.alternative}</i>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("experience", { jobTitle: "", companyName: "", location: "", startDate: "", endDate: "", responsibilities: "" })}>+ Add Job Experience</button>
                    </div>
                  )}
                </div>

                {/* Personal Projects */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Personal Projects</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.projects} onChange={(e) => setVisibility({ ...visibility, projects: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.projects && (
                    <div className="rb-repeater-container">
                      {resume.projects.map((proj, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("projects", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Project Title</span>
                              <input type="text" className="rb-form-input" value={proj.title} onChange={(e) => handleArrayUpdate("projects", idx, "title", e.target.value)} placeholder="Data Analytics Dashboard" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Technologies Used</span>
                              <input type="text" className="rb-form-input" value={proj.technologies} onChange={(e) => handleArrayUpdate("projects", idx, "technologies", e.target.value)} placeholder="React, Node.js" />
                            </div>
                            <div className="rb-input-grp rb-input-span-2">
                              <span className="rb-field-lbl">Description</span>
                              <textarea
                                id={`textarea-projects-${idx}`}
                                className="rb-form-input rb-form-textarea"
                                value={proj.description}
                                onChange={(e) => handleArrayUpdate("projects", idx, "description", e.target.value)}
                                placeholder="Built an interactive dashboard..."
                              />
                              
                              {/* Actionable Metric Helper pills */}
                              <div style={{ marginTop: "4px" }}>
                                <span className="rb-field-lbl" style={{ fontSize: "10px", opacity: 0.8, display: "block", marginBottom: "4px" }}>
                                  💡 Insert Actionable Metric Template:
                                </span>
                                <div className="rb-metric-pill-container">
                                  {metricTemplates.map((tmpl, tIdx) => (
                                    <button
                                      key={tIdx}
                                      type="button"
                                      className="rb-metric-pill"
                                      onClick={() => insertMetricTemplate("projects", idx, "description", tmpl.text)}
                                      title="Click to insert at cursor"
                                    >
                                      {tmpl.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Github URL</span>
                              <input type="text" className="rb-form-input" value={proj.github} onChange={(e) => handleArrayUpdate("projects", idx, "github", e.target.value)} placeholder="github.com/username/project" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Live Demo link</span>
                              <input type="text" className="rb-form-input" value={proj.demo} onChange={(e) => handleArrayUpdate("projects", idx, "demo", e.target.value)} placeholder="myproject.com" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("projects", { title: "", technologies: "", description: "", github: "", demo: "" })}>+ Add Project</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category: EDUCATION */}
            {activeCategory === "education" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Academic */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Academic Background</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.education} onChange={(e) => setVisibility({ ...visibility, education: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.education && (
                    <div className="rb-repeater-container">
                      {resume.education.map((edu, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("education", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Degree</span>
                              <input type="text" className="rb-form-input" value={edu.degree} onChange={(e) => handleArrayUpdate("education", idx, "degree", e.target.value)} placeholder="B.Tech" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Field of Study</span>
                              <input type="text" className="rb-form-input" value={edu.specialization} onChange={(e) => handleArrayUpdate("education", idx, "specialization", e.target.value)} placeholder="Computer Science" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Institution / University</span>
                              <input type="text" className="rb-form-input" value={edu.institution} onChange={(e) => handleArrayUpdate("education", idx, "institution", e.target.value)} placeholder="RTU Kota" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">GPA / Grade</span>
                              <input type="text" className="rb-form-input" value={edu.grade} onChange={(e) => handleArrayUpdate("education", idx, "grade", e.target.value)} placeholder="8.8 CGPA" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Location</span>
                              <input type="text" className="rb-form-input" value={edu.location} onChange={(e) => handleArrayUpdate("education", idx, "location", e.target.value)} placeholder="Kota, India" />
                            </div>
                            <div className="rb-input-grid" style={{ gridColumn: "span 1", gap: "8px" }}>
                              <div className="rb-input-grp">
                                <span className="rb-field-lbl">Start Year</span>
                                <input type="text" className="rb-form-input" value={edu.startDate} onChange={(e) => handleArrayUpdate("education", idx, "startDate", e.target.value)} placeholder="2018" />
                              </div>
                              <div className="rb-input-grp">
                                <span className="rb-field-lbl">Graduation Year</span>
                                <input type="text" className="rb-form-input" value={edu.endDate} onChange={(e) => handleArrayUpdate("education", idx, "endDate", e.target.value)} placeholder="2022" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("education", { degree: "", specialization: "", institution: "", location: "", startDate: "", endDate: "", grade: "" })}>+ Add Education</button>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Certifications & Licenses</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.certifications} onChange={(e) => setVisibility({ ...visibility, certifications: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.certifications && (
                    <div className="rb-repeater-container">
                      {resume.certifications?.map((c, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("certifications", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Certificate Name</span>
                              <input type="text" className="rb-form-input" value={c.name} onChange={(e) => handleArrayUpdate("certifications", idx, "name", e.target.value)} placeholder="AWS Certified Developer" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Issuer Org</span>
                              <input type="text" className="rb-form-input" value={c.organization} onChange={(e) => handleArrayUpdate("certifications", idx, "organization", e.target.value)} placeholder="Amazon Web Services" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Completion Year</span>
                              <input type="text" className="rb-form-input" value={c.date} onChange={(e) => handleArrayUpdate("certifications", idx, "date", e.target.value)} placeholder="2024" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Verification Link</span>
                              <input type="text" className="rb-form-input" value={c.link} onChange={(e) => handleArrayUpdate("certifications", idx, "link", e.target.value)} placeholder="aws.amazon.com/verify" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("certifications", { name: "", organization: "", date: "", link: "" })}>+ Add Certification</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category: SKILLS */}
            {activeCategory === "skills" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Tech Skills */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Technical Expertise</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.skills} onChange={(e) => setVisibility({ ...visibility, skills: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.skills && (
                    <div>
                      {Object.keys(resume.skills).map((cat) => (
                        <div key={cat} style={{ marginBottom: "16px" }}>
                          <span className="rb-field-lbl" style={{ textTransform: "capitalize", display: "block", marginBottom: "4px" }}>{cat} Skills</span>
                          <div className="rb-chips-box">
                            {resume.skills[cat].map((item, idx) => (
                              <span className="rb-chip-item" key={idx}>
                                {item}
                                <button type="button" className="rb-chip-del" onClick={() => removeSkillTag(cat, idx)}>×</button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input type="text" className="rb-form-input" placeholder={`Add ${cat}...`} value={newSkill.category === cat ? newSkill.val : ""} onChange={(e) => setNewSkill({ category: cat, val: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillTag(cat); } }} />
                            <button type="button" className="rb-btn-secondary" style={{ padding: "8px 16px" }} onClick={() => addSkillTag(cat)}>Add</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Languages</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.languages} onChange={(e) => setVisibility({ ...visibility, languages: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.languages && (
                    <div className="rb-repeater-container">
                      {resume.languages?.map((lang, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("languages", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Language Name</span>
                              <input type="text" className="rb-form-input" value={lang.name} onChange={(e) => handleArrayUpdate("languages", idx, "name", e.target.value)} placeholder="Spanish" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Proficiency</span>
                              <select className="rb-form-input" value={lang.level} onChange={(e) => handleArrayUpdate("languages", idx, "level", e.target.value)}>
                                {languageLevels.map(lvl => (
                                  <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("languages", { name: "", level: "Fluent" })}>+ Add Language</button>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Awards & Accomplishments</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.achievements} onChange={(e) => setVisibility({ ...visibility, achievements: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.achievements && (
                    <div className="rb-repeater-container">
                      {resume.achievements?.map((ach, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("achievements", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Award Title</span>
                              <input type="text" className="rb-form-input" value={ach.title} onChange={(e) => handleArrayUpdate("achievements", idx, "title", e.target.value)} placeholder="SIH Hackathon Winner" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Year</span>
                              <input type="text" className="rb-form-input" value={ach.date} onChange={(e) => handleArrayUpdate("achievements", idx, "date", e.target.value)} placeholder="2021" />
                            </div>
                            <div className="rb-input-grp rb-input-span-2">
                              <span className="rb-field-lbl">Description Summary</span>
                              <input type="text" className="rb-form-input" value={ach.desc} onChange={(e) => handleArrayUpdate("achievements", idx, "desc", e.target.value)} placeholder="Built localized tool..." />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("achievements", { title: "", date: "", desc: "" })}>+ Add Award</button>
                    </div>
                  )}
                </div>

                {/* References */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Professional References</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.references} onChange={(e) => setVisibility({ ...visibility, references: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.references && (
                    <div className="rb-repeater-container">
                      {resume.references?.map((r, idx) => (
                        <div className="rb-repeater-card" key={idx}>
                          <div className="rb-repeater-actions">
                            <button type="button" className="rb-delete-btn" onClick={() => removeArrayItem("references", idx)}>🗑 Delete</button>
                          </div>
                          <div className="rb-input-grid">
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Reference Name</span>
                              <input type="text" className="rb-form-input" value={r.name} onChange={(e) => handleArrayUpdate("references", idx, "name", e.target.value)} placeholder="Dr. Sharma" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Title & Org</span>
                              <input type="text" className="rb-form-input" value={r.company} onChange={(e) => handleArrayUpdate("references", idx, "company", e.target.value)} placeholder="Professor RTU" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Email</span>
                              <input type="email" className="rb-form-input" value={r.email} onChange={(e) => handleArrayUpdate("references", idx, "email", e.target.value)} placeholder="alok@rtu.ac.in" />
                            </div>
                            <div className="rb-input-grp">
                              <span className="rb-field-lbl">Phone</span>
                              <input type="text" className="rb-form-input" value={r.phone} onChange={(e) => handleArrayUpdate("references", idx, "phone", e.target.value)} placeholder="+91 99999 88888" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="rb-btn-secondary" onClick={() => addArrayItem("references", { name: "", company: "", email: "", phone: "" })}>+ Add Reference</button>
                    </div>
                  )}
                </div>

                {/* Hobbies */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Interests & Hobbies</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.interests} onChange={(e) => setVisibility({ ...visibility, interests: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.interests && (
                    <div>
                      <div className="rb-chips-box">
                        {resume.interests?.map((interest, idx) => (
                          <span className="rb-chip-item" key={idx}>
                            {interest}
                            <button type="button" className="rb-chip-del" onClick={() => removeInterestTag(idx)}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" className="rb-form-input" placeholder="Add interest..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterestTag(); } }} />
                        <button type="button" className="rb-btn-secondary" style={{ padding: "8px 16px" }} onClick={addInterestTag}>Add</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Section */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Custom Section</h3>
                    <label className="rb-visibility-toggle">
                      <input type="checkbox" checked={visibility.customSection} onChange={(e) => setVisibility({ ...visibility, customSection: e.target.checked })} />
                      <div className="rb-switch-bar"></div>
                    </label>
                  </div>
                  {visibility.customSection && (
                    <div>
                      <div className="rb-input-grp" style={{ marginBottom: "12px" }}>
                        <span className="rb-field-lbl">Custom Title</span>
                        <input type="text" className="rb-form-input" value={resume.customSection?.title || ""} onChange={(e) => setResume(curr => ({ ...curr, customSection: { ...curr.customSection, title: e.target.value } }))} placeholder="Open Source Contributions" />
                      </div>
                      <span className="rb-field-lbl">Items list</span>
                      <div className="rb-chips-box" style={{ display: "block" }}>
                        {resume.customSection?.items?.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: "12px" }}>• {item}</span>
                            <button type="button" style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: "700" }} onClick={() => removeCustomItem(idx)}>×</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <input type="text" className="rb-form-input" placeholder="Add custom item bullet point..." value={newCustomItem} onChange={(e) => setNewCustomItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(); } }} />
                        <button type="button" className="rb-btn-secondary" style={{ padding: "8px 16px" }} onClick={addCustomItem}>Add</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category: ATS SCANNER & OPTIMIZER */}
            {activeCategory === "optimizer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Job Description Scanner</h3>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
                    Paste the target Job Description (JD) below. The tool will parse the technical keywords and compare them against your resume contents to check ATS compatibility.
                  </p>
                  
                  <div className="rb-input-grp" style={{ marginBottom: "16px" }}>
                    <span className="rb-field-lbl">Target Job Description</span>
                    <textarea
                      className="rb-form-input rb-form-textarea"
                      rows="8"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description listing requirements here (e.g. 'We are looking for a React developer with TypeScript and Webpack experience')..."
                    />
                  </div>

                  <button
                    type="button"
                    className="rb-btn-secondary"
                    style={{ width: "100%", background: "var(--accent-blue)", border: "none", color: "white" }}
                    onClick={handleAtsScan}
                  >
                    🔍 Match & Scan Resume
                  </button>
                </div>

                {atsKeywords.scanned && (
                  <div className="rb-form-card">
                    {/* Score header */}
                    <div
                      className="rb-optimizer-header"
                      style={{
                        "--score-percent": atsKeywords.score,
                        "--score-color": atsKeywords.score < 40 ? "var(--danger)" : atsKeywords.score < 70 ? "var(--warning)" : "var(--success)"
                      }}
                    >
                      <div className="rb-optimizer-circular-score">
                        {atsKeywords.score}%
                      </div>
                      <div className="rb-optimizer-meta">
                        <span style={{ fontSize: "14px", fontWeight: "700", display: "block" }}>
                          {atsKeywords.score < 40 ? "❌ Weak Match" : atsKeywords.score < 70 ? "⚠️ Good Match" : "✨ Highly Optimized"}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {atsKeywords.score < 40 
                            ? "Try adding more missing technologies to improve compatibility." 
                            : atsKeywords.score < 70 
                              ? "Excellent progress! You're matching most technical requirements." 
                              : "Your resume contains all target keywords for this JD."}
                        </span>
                      </div>
                    </div>

                    {/* Keywords pills matched & missing */}
                    <div className="rb-keyword-container">
                      <div className="rb-keyword-column">
                        <span className="rb-keyword-title-lbl">Matched ({atsKeywords.matched.length})</span>
                        <div className="rb-keyword-chips-row">
                          {atsKeywords.matched.map((kw, i) => (
                            <span className="rb-keyword-pill matched" key={i}>✓ {kw}</span>
                          ))}
                          {atsKeywords.matched.length === 0 && <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>None matched yet</span>}
                        </div>
                      </div>

                      <div className="rb-keyword-column">
                        <span className="rb-keyword-title-lbl">Missing ({atsKeywords.missing.length})</span>
                        <div className="rb-keyword-chips-row">
                          {atsKeywords.missing.map((kw, i) => (
                            <span className="rb-keyword-pill missing" key={i}>+ {kw}</span>
                          ))}
                          {atsKeywords.missing.length === 0 && <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No keywords missing!</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category: APPEARANCE */}
            {activeCategory === "appearance" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Template Preset Pick */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Layout Template Presets</h3>
                  </div>
                  <div className="rb-template-grid">
                    {[
                      { id: "minimal", title: "Minimal Modern", desc: "Classic standard layout" },
                      { id: "tech", title: "Tech Professional", desc: "For engineers & developers" },
                      { id: "classic", title: "Executive Classic", desc: "Elegant serif layout" },
                      { id: "creative", title: "Creative Sidebar", desc: "Vibrant photo sidebar accent" }
                    ].map(card => (
                      <button key={card.id} type="button" className={`rb-tmpl-card ${template === card.id ? "active" : ""}`} onClick={() => setTemplate(card.id)}>
                        <span className="rb-tmpl-card-title">{card.title}</span>
                        <span className="rb-tmpl-card-desc">{card.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Swatch Presets */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Accent Styling Colors</h3>
                  </div>
                  <div className="rb-colors-row">
                    {colorOptions.map(color => (
                      <button key={color.hex} type="button" className={`rb-color-btn ${accentColor === color.hex ? "active" : ""}`} style={{ backgroundColor: color.hex }} onClick={() => setAccentColor(color.hex)} title={color.name} />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                    <span className="rb-field-lbl">Custom Accent Hex:</span>
                    <input type="color" style={{ border: "none", background: "none", cursor: "pointer", width: "40px", height: "28px" }} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                  </div>
                </div>

                {/* Typography Fonts & Spacings */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Typography & Layout Sizes</h3>
                  </div>
                  <div className="rb-input-grid">
                    <div className="rb-input-grp rb-input-span-2">
                      <span className="rb-field-lbl">Font Family</span>
                      <select className="rb-form-input" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                        {fontOptions.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rb-input-grp rb-input-span-2">
                      <div className="rb-slider-lbl">
                        <span>Base Font Size</span>
                        <span>{fontSize}px</span>
                      </div>
                      <input type="range" min="11" max="16" step="0.5" className="rb-slider" value={fontSize} onChange={(e) => setFontSize(parseFloat(e.target.value))} />
                    </div>

                    <div className="rb-input-grp rb-input-span-2">
                      <div className="rb-slider-lbl">
                        <span>Line Height</span>
                        <span>{lineHeight}</span>
                      </div>
                      <input type="range" min="1.2" max="1.8" step="0.05" className="rb-slider" value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} />
                    </div>

                    <div className="rb-input-grp rb-input-span-2">
                      <div className="rb-slider-lbl">
                        <span>Page Padding Margins</span>
                        <span>{pagePadding}px</span>
                      </div>
                      <input type="range" min="24" max="60" className="rb-slider" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} />
                    </div>

                    <div className="rb-input-grp rb-input-span-2">
                      <div className="rb-slider-lbl">
                        <span>Section spacing margins</span>
                        <span>{sectionMargin}px</span>
                      </div>
                      <input type="range" min="6" max="28" className="rb-slider" value={sectionMargin} onChange={(e) => setSectionMargin(parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Section layout order */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Sections Rendering Order</h3>
                  </div>
                  <div className="rb-order-pane">
                    {sectionOrder.map((sec, idx) => (
                      <div className="rb-order-row" key={sec}>
                        <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{sec === "customSection" ? (resume.customSection?.title || "Custom Section") : sec}</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button type="button" className="rb-order-arrow" disabled={idx === 0} onClick={() => moveSection(idx, -1)}>▲</button>
                          <button type="button" className="rb-order-arrow" disabled={idx === sectionOrder.length - 1} onClick={() => moveSection(idx, 1)}>▼</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action profiles loaders */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Data Profiles & Operations</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button type="button" className="rb-btn-secondary" onClick={handleLoadDemo}>📂 Load Demo Data</button>
                    <button type="button" className="rb-btn-danger" onClick={handleReset}>🗑 Reset Data</button>
                    <button type="button" className="rb-btn-secondary" onClick={handleExportJSON}>📤 Export JSON</button>
                    <button type="button" className="rb-btn-secondary" onClick={() => jsonUploadRef.current.click()}>📥 Import JSON</button>
                    <input type="file" ref={jsonUploadRef} style={{ display: "none" }} accept=".json" onChange={handleImportJSON} />
                  </div>
                </div>

                {/* Styling settings reset */}
                <div className="rb-form-card">
                  <div className="rb-card-header">
                    <h3 className="rb-card-title">Reset Styling Defaults</h3>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 12px" }}>
                    Revert accent color, font selections, margins, line heights, and layout spacing variables back to default factory presets.
                  </p>
                  <button type="button" className="rb-btn-danger" style={{ width: "100%" }} onClick={handleResetAppearance}>
                    🔄 Reset Style Settings
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 2. Right Live Preview Workspace */}
      <div className="rb-preview-workspace">
        <div className="rb-preview-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className={`rb-page-height-indicator ${pageHeight <= 1123 ? "fits" : "overflows"}`}>
              Height: {pageHeight}px / 1123px {pageHeight <= 1123 ? "(Fits 1 Page)" : "(Spills onto Page 2)"}
            </div>
            {pageHeight > 1123 && (
              <button type="button" className="rb-btn-secondary" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={handleAutoShrink}>⚡ Auto-Shrink</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="rb-zoom-slider">
              <span>Zoom</span>
              <input type="range" min="0.5" max="1.4" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
            </div>
            
            <button type="button" className="rb-btn-secondary" style={{ borderColor: "var(--accent-blue)", color: "var(--accent-blue)" }} onClick={handleExportPDF}>Download PDF</button>
            <button type="button" className="rb-btn-secondary" onClick={handleExportWord}>Word DOCX</button>
          </div>
        </div>

        <div className="rb-preview-scroll">
          <div
            id="rb-preview-target"
            ref={pageRef}
            className={`rb-a4-page rb-tmpl-${template}`}
            style={{
              transform: `scale(${scale})`,
              fontFamily: fontFamily,
              lineHeight: lineHeight,
              fontSize: `${fontSize}px`,
              padding: `${pagePadding}px`,
              "--theme-accent": accentColor,
              display: template === "creative" ? "grid" : "flex",
              flexDirection: template === "creative" ? undefined : "column",
            }}
          >
            {template === "creative" ? (
              <div style={{ display: "flex", minHeight: "100%", width: "100%" }}>
                {/* Sidebar */}
                <div className="rb-sidebar-col" style={{ width: "240px", backgroundColor: "#f8fafc", borderRight: "1px solid #e2e8f0", padding: "30px 20px" }}>
                  {photo && (
                    <img src={photo} alt="Profile" className="rb-photo" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 16px" }} />
                  )}
                  <div>
                    <h1 className="rb-name" style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{resume.contact.fullName || "Jane Doe"}</h1>
                    {resume.contact.title && (
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--theme-accent)", marginTop: "2px" }}>{resume.contact.title}</div>
                    )}
                  </div>
                  <div className="rb-contact-line" style={{ fontSize: "11px", gap: "6px" }}>
                    <div className="rb-sidebar-title">Contact</div>
                    {resume.contact.phone && <div>📞 {resume.contact.phone}</div>}
                    {resume.contact.email && <div>✉️ {resume.contact.email}</div>}
                    {resume.contact.linkedin && <div>🔗 {resume.contact.linkedin}</div>}
                    {resume.contact.website && <div>🌐 {resume.contact.website}</div>}
                    {(resume.contact.city || resume.contact.state) && (
                      <div>📍 {resume.contact.city}, {resume.contact.state}</div>
                    )}
                  </div>

                  {visibility.skills && (
                    <div className="rb-contact-line" style={{ fontSize: "11px" }}>
                      <div className="rb-sidebar-title">Skills</div>
                      {Object.entries(resume.skills).map(([category, items]) => (
                        items.length > 0 && (
                          <div key={category} style={{ marginBottom: "6px" }}>
                            <strong style={{ textTransform: "capitalize", display: "block", color: "#475569" }}>{category}:</strong>
                            <div>{items.join(", ")}</div>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {visibility.languages && resume.languages?.some(l => l.name) && (
                    <div className="rb-contact-line" style={{ fontSize: "11px" }}>
                      <div className="rb-sidebar-title">Languages</div>
                      {resume.languages.map((l, idx) => (
                        l.name && <div key={idx}><strong>{l.name}</strong> — {l.level}</div>
                      ))}
                    </div>
                  )}

                  {visibility.interests && resume.interests?.length > 0 && (
                    <div className="rb-contact-line" style={{ fontSize: "11px" }}>
                      <div className="rb-sidebar-title">Interests</div>
                      <div>{resume.interests.join(", ")}</div>
                    </div>
                  )}
                </div>

                {/* Main */}
                <div className="rb-main-col" style={{ flex: "1", padding: "35px 24px", display: "flex", flexDirection: "column" }}>
                  {sectionOrder.map((sectionName) => renderA4Section(sectionName))}
                  {signatureImage && (
                    <div className="rb-signature-container" style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ textAlign: "center" }}>
                        <img src={signatureImage} alt="Signature" style={{ maxHeight: "40px", maxWidth: "120px", display: "block", margin: "0 auto" }} />
                        <div style={{ borderTop: "1px solid #cbd5e1", width: "120px", margin: "4px auto 0" }}></div>
                        <span style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>Authorized Signature</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Standard layout headers (Minimal, Tech, Classic)
              <>
                {template === "minimal" && (
                  <header className="rb-header">
                    <h1 className="rb-name" style={{ color: "var(--theme-accent)" }}>{resume.contact.fullName || "Jane Doe"}</h1>
                    {resume.contact.title && <div className="rb-subtitle">{resume.contact.title}</div>}
                    <div className="rb-contact-line">
                      {resume.contact.phone && <span>📞 {resume.contact.phone}</span>}
                      {resume.contact.email && <span>✉️ {resume.contact.email}</span>}
                      {resume.contact.linkedin && <span>🔗 {resume.contact.linkedin}</span>}
                      {resume.contact.website && <span>🌐 {resume.contact.website}</span>}
                      {(resume.contact.city || resume.contact.state) && (
                        <span>📍 {resume.contact.city}{resume.contact.city && ", "}{resume.contact.state}</span>
                      )}
                    </div>
                  </header>
                )}

                {template === "tech" && (
                  <header className="rb-header">
                    <div>
                      <h1 className="rb-name">{resume.contact.fullName || "Jane Doe"}</h1>
                      {resume.contact.title && <div className="rb-subtitle">{resume.contact.title}</div>}
                    </div>
                    <div className="rb-contact-line">
                      {resume.contact.email && <div>✉️ {resume.contact.email}</div>}
                      {resume.contact.phone && <div>📞 {resume.contact.phone}</div>}
                      {resume.contact.linkedin && <div>🔗 {resume.contact.linkedin}</div>}
                      {resume.contact.website && <div>🌐 {resume.contact.website}</div>}
                      {(resume.contact.city || resume.contact.state) && (
                        <div>📍 {resume.contact.city}{resume.contact.city && ", "}{resume.contact.state}</div>
                      )}
                    </div>
                  </header>
                )}

                {template === "classic" && (
                  <header className="rb-header">
                    <h1 className="rb-name">{resume.contact.fullName || "Jane Doe"}</h1>
                    {resume.contact.title && <div className="rb-subtitle">{resume.contact.title}</div>}
                    <div className="rb-contact-line">
                      {resume.contact.phone && <span>{resume.contact.phone}</span>}
                      {resume.contact.email && <span>{resume.contact.email}</span>}
                      {resume.contact.linkedin && <span>{resume.contact.linkedin}</span>}
                      {resume.contact.website && <span>{resume.contact.website}</span>}
                      {(resume.contact.city || resume.contact.state) && (
                        <span>{resume.contact.city}, {resume.contact.state}</span>
                      )}
                    </div>
                  </header>
                )}

                {/* Render ordered sections */}
                {sectionOrder.map((sectionName) => renderA4Section(sectionName))}

                {signatureImage && (
                  <div className="rb-signature-container" style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ textAlign: "center" }}>
                      <img src={signatureImage} alt="Signature" style={{ maxHeight: "40px", maxWidth: "120px", display: "block", margin: "0 auto" }} />
                      <div style={{ borderTop: "1px solid #cbd5e1", width: "120px", margin: "4px auto 0" }}></div>
                      <span style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", marginTop: "2px", display: "block" }}>Authorized Signature</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 3. Mobile View Navigation Tabs */}
      <div className="rb-mobile-tabs">
        <button
          type="button"
          className={`rb-mobile-tab-btn ${mobileView === "edit" ? "active" : ""}`}
          onClick={() => setMobileView("edit")}
        >
          <span className="rb-mobile-tab-icon">📝</span>
          <span>Edit Details</span>
        </button>
        <button
          type="button"
          className={`rb-mobile-tab-btn ${mobileView === "preview" ? "active" : ""}`}
          onClick={() => setMobileView("preview")}
        >
          <span className="rb-mobile-tab-icon">👁️</span>
          <span>Preview PDF</span>
        </button>
      </div>
    </div>
  );
}

export default ResumeBuilder;

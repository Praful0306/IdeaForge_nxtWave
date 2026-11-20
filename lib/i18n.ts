// NagarNetra Bilingual (English & Hindi) UI Dictionary

export type Locale = "en" | "hi";

export const translations = {
  en: {
    appTitle: "NagarNetra",
    appSubtitle: "AI Civic Grievance & Infrastructure Triage",
    reportCTA: "Report a Civic Issue",
    reportSubtitle: "Snap a photo, record in your language, or type. AI sorts the danger, groups duplicates, and alerts authorities.",
    dashboardLink: "Public City Dashboard",
    officerLink: "Officer Portal",
    trackStatus: "Track Complaint",
    
    // Tabs
    tabPhoto: "Photo",
    tabVoice: "Voice Note",
    tabText: "Type Description",

    // Captions & Instructions
    photoPrompt: "Tap to capture or upload photo of road damage, leak, or hazard",
    voicePrompt: "Press Record and describe the issue in any Indian language (Hindi, Kannada, etc.)",
    textPrompt: "Describe the issue (e.g. 'Deep pothole outside school, live wire sparking')",
    locationDetected: "GPS Location Active",
    locationFallback: "Tap on map to select location",
    submitting: "Submitting Triage...",
    
    // Stepper
    step1: "Analysing photo and transcribing voice...",
    step2: "Checking 75m geospatial duplicates...",
    step3: "Routing to department and calculating SLA...",
    step4: "Generating tamper-proof ticket...",

    // Result Card
    ticketCreated: "Ticket Generated",
    mergedNotice: "Merged with {count} existing citizen reports (+1 Upvote)",
    category: "Category",
    department: "Assigned Department",
    dueBy: "Resolution SLA Target",
    severity: "Severity Level",
    hazardFlags: "Hazard Indicators",
    trackTicket: "Track Live Status",
    shareTicket: "Share Ticket Link",
    reportAnother: "Report Another Issue",

    // Dashboard
    kpiTotal: "Total Grievances",
    kpiOpen: "Open / Active",
    kpiResolved: "Resolved Fixes",
    kpiResolvedPercent: "Resolution Rate",
    kpiOverdue: "SLA Overdue",
    kpiAvgTime: "Avg Fix Time",
    cityMap: "Live City Triage Map",
    worstFirst: "Priority Queue (Worst First)",
    departmentStats: "Department Performance",
    aiInsights: "AI Ward Insights (Live)",

    // Officer
    officerTitle: "Municipal Officer Command Center",
    officerPinPrompt: "Enter Officer 4-Digit Security PIN",
    pinPlaceholder: "PIN (Default: 7789)",
    unlock: "Unlock Queue",
    acknowledge: "Acknowledge",
    markInProgress: "Mark In Progress",
    resolve: "Resolve with Photo",
    reject: "Reject",
    afterPhotoPrompt: "Upload 'After' Proof Photo to Close",
    resolutionNote: "Officer Resolution Note",
  },
  hi: {
    appTitle: "नगरनेत्र",
    appSubtitle: "नागरिक शिकायत और बुनियादी ढांचा AI समाधान",
    reportCTA: "समस्या दर्ज करें",
    reportSubtitle: "फोटो लें, अपनी भाषा में बोलें या लिखें। AI खतरे की जांच करेगा, डुप्लीकेट मिलाएगा और सही विभाग को भेजेगा।",
    dashboardLink: "सार्वजनिक डैशबोर्ड",
    officerLink: "अधिकारी पोर्टल",
    trackStatus: "स्थिति देखें",

    // Tabs
    tabPhoto: "फोटो लें",
    tabVoice: "आवाज में बोलें",
    tabText: "लिखकर बताएं",

    // Captions & Instructions
    photoPrompt: "सड़क के गड्ढे, पानी के रिसाव या कचरे की फोटो खींचें",
    voicePrompt: "माइक दबाएं और किसी भी भारतीय भाषा (हिंदी, कन्नड़ आदि) में बताएं",
    textPrompt: "समस्या का विवरण लिखें (जैसे 'स्कूल के पास गहरा गड्ढा है')",
    locationDetected: "GPS लोकेशन प्राप्त हुई",
    locationFallback: "नक्शे पर छूकर स्थान चुनें",
    submitting: "जांच हो रही है...",

    // Stepper
    step1: "फोटो और आवाज का विश्लेषण हो रहा है...",
    step2: "75 मीटर के दायरे में पुरानी शिकायतों की जांच...",
    step3: "संबंधित विभाग और समय सीमा (SLA) तय की जा रही है...",
    step4: "टिकट तैयार किया जा रहा है...",

    // Result Card
    ticketCreated: "शिकायत दर्ज हुई",
    mergedNotice: "{count} अन्य नागरिकों की समान शिकायतों के साथ जोड़ा गया (+1 समर्थन)",
    category: "श्रेणी",
    department: "जिम्मेदार विभाग",
    dueBy: "निवारण समय सीमा (SLA)",
    severity: "गंभीरता स्तर",
    hazardFlags: "खतरे के संकेत",
    trackTicket: "लाइव स्थिति देखें",
    shareTicket: "लिंक साझा करें",
    reportAnother: "दूसरी समस्या दर्ज करें",

    // Dashboard
    kpiTotal: "कुल शिकायतें",
    kpiOpen: "लंबित शिकायतें",
    kpiResolved: "हल की गई",
    kpiResolvedPercent: "सफलता दर",
    kpiOverdue: "समय सीमा पार",
    kpiAvgTime: "औसत समाधान समय",
    cityMap: "लाइव सिटी मैप",
    worstFirst: "प्राथमिकता सूची (गंभीर पहले)",
    departmentStats: "विभाग प्रदर्शन",
    aiInsights: "AI वार्ड अंतर्दृष्टि",

    // Officer
    officerTitle: "नगर निगम अधिकारी नियंत्रण कक्ष",
    officerPinPrompt: "अधिकारी 4-अंकीय सुरक्षा पिन दर्ज करें",
    pinPlaceholder: "पिन (डिफ़ॉल्ट: 7789)",
    unlock: "कतार खोलें",
    acknowledge: "स्वीकार करें",
    markInProgress: "प्रगति में दर्ज करें",
    resolve: "फोटो के साथ हल करें",
    reject: "खारिज करें",
    afterPhotoPrompt: "समाधान के बाद की 'After' फोटो अपलोड करें",
    resolutionNote: "अधिकारी की टिप्पणी",
  },
};

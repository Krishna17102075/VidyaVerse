/* VidyaVerse multilingual system: English, Hindi, Punjabi.
   Stores preference in localStorage and translates static + dynamically rendered UI text.
   Add new phrases to the dictionary using the exact English phrase as the key. */
(() => {
  "use strict";
  const KEY = "vidyaverse_language";
  const translations = {
    hi: {
      "Dashboard":"डैशबोर्ड","AI Tutor":"एआई ट्यूटर","My Courses":"मेरे कोर्स","Study Planner":"अध्ययन योजनाकार",
      "Smart Notes":"स्मार्ट नोट्स","Notes":"नोट्स","Progress":"प्रगति","Settings":"सेटिंग्स","My Profile":"मेरी प्रोफ़ाइल",
      "LEARNING":"सीखना","Welcome Back 👋":"वापसी पर स्वागत है 👋","Total Notes":"कुल नोट्स","Pending Tasks":"लंबित कार्य",
      "Study Sessions":"अध्ययन सत्र","Average Score":"औसत अंक","Today's Study Plan":"आज की अध्ययन योजना",
      "Upload your study material to generate your personalized study plan.":"अपनी व्यक्तिगत अध्ययन योजना बनाने के लिए अध्ययन सामग्री अपलोड करें।",
      "New Chat":"नई चैट","Recent Chats":"हाल की चैट","Ask anything...":"कुछ भी पूछें...","Ask me anything about your studies.":"अपनी पढ़ाई के बारे में कुछ भी पूछें।",
      "Hello, learner! 👋":"नमस्ते विद्यार्थी! 👋","VidyaVerse is thinking":"विद्यावर्स सोच रहा है","Try again":"फिर कोशिश करें",
      "My Progress":"मेरी प्रगति","Track your achievements and see how far you've come.":"अपनी उपलब्धियों को ट्रैक करें और देखें कि आपने कितनी प्रगति की है।",
      "Continue Learning":"सीखना जारी रखें","YOUR LEARNING JOURNEY":"आपकी सीखने की यात्रा","EVERY LESSON COUNTS":"हर पाठ महत्वपूर्ण है",
      "Enrolled Courses":"नामांकित कोर्स","Completed Lessons":"पूरे किए गए पाठ","Overall Progress":"कुल प्रगति",
      "Remaining Lessons":"शेष पाठ","Your learning library":"आपकी अध्ययन लाइब्रेरी","Lessons you've finished":"आपके पूरे किए गए पाठ",
      "Across all courses":"सभी कोर्स में","Keep moving forward":"आगे बढ़ते रहें","Overall Learning Progress":"कुल अध्ययन प्रगति",
      "Your progress across all available courses.":"सभी उपलब्ध कोर्स में आपकी प्रगति।","Your learning journey starts here.":"आपकी सीखने की यात्रा यहाँ से शुरू होती है।",
      "Course Performance":"कोर्स प्रदर्शन","Review progress in each subject.":"हर विषय में अपनी प्रगति देखें।","Explore courses":"कोर्स देखें",
      "Learning Summary":"अध्ययन सारांश","A quick overview of your current study status.":"आपकी वर्तमान अध्ययन स्थिति का संक्षिप्त विवरण।",
      "Start a course to begin building your learning history.":"अपना अध्ययन इतिहास बनाने के लिए कोई कोर्स शुरू करें।",
      "Made for curious minds.":"जिज्ञासु मन के लिए बनाया गया।","YOUR LEARNING SPACE":"आपका अध्ययन स्थान","Learn new skills and make progress every day.":"नए कौशल सीखें और हर दिन प्रगति करें।",
      "Explore Courses":"कोर्स देखें","BCA LEARNING PATH":"बीसीए अध्ययन पथ","Build your future, one lesson at a time.":"एक-एक पाठ के साथ अपना भविष्य बनाएँ।",
      "Explore programming, web development, databases, and computer networking.":"प्रोग्रामिंग, वेब डेवलपमेंट, डेटाबेस और कंप्यूटर नेटवर्किंग सीखें।",
      "Total Courses":"कुल कोर्स","Pick up where you left off.":"जहाँ छोड़ा था वहीं से शुरू करें।","Explore Your Courses":"अपने कोर्स देखें",
      "Choose a subject and start learning.":"एक विषय चुनें और सीखना शुरू करें।","Search courses...":"कोर्स खोजें...",
      "All Categories":"सभी श्रेणियाँ","No courses match your search.":"आपकी खोज से कोई कोर्स मेल नहीं खाता।",
      "Manage your Vidya Verse preferences":"अपनी विद्यावर्स प्राथमिकताएँ प्रबंधित करें","Profile":"प्रोफ़ाइल","Your account information":"आपकी खाता जानकारी",
      "Appearance":"दिखावट","Customize how Vidya Verse looks":"विद्यावर्स की दिखावट बदलें","Dark Mode":"डार्क मोड",
      "Use a darker interface for comfortable viewing.":"आरामदायक देखने के लिए गहरे रंग वाला इंटरफ़ेस इस्तेमाल करें।",
      "Notifications":"सूचनाएँ","Manage notification preferences":"सूचनाओं की प्राथमिकताएँ प्रबंधित करें",
      "Enable notifications from Vidya Verse.":"विद्यावर्स से सूचनाएँ चालू करें।","Account":"खाता","Manage your account":"अपना खाता प्रबंधित करें",
      "Logout":"लॉग आउट","About":"परिचय","Application information":"ऐप्लिकेशन की जानकारी",
      "AI-powered personal learning assistant designed to help students study smarter.":"विद्यार्थियों को बेहतर तरीके से पढ़ने में मदद करने वाला एआई-आधारित व्यक्तिगत अध्ययन सहायक।",
      "Language":"भाषा","Choose your preferred language":"अपनी पसंदीदा भाषा चुनें","English":"अंग्रेज़ी","Hindi":"हिंदी","Punjabi":"पंजाबी",
      "Save":"सहेजें","Cancel":"रद्द करें","Login":"लॉग इन","Sign Up":"साइन अप","Email":"ईमेल","Password":"पासवर्ड",
      "Name":"नाम","Submit":"जमा करें","Search":"खोजें","Loading...":"लोड हो रहा है...","Student":"विद्यार्थी",
      "Study Files":"अध्ययन फ़ाइलें","Continue":"जारी रखें","Create":"बनाएँ","Delete":"हटाएँ","Update":"अपडेट करें",
      "No data available":"कोई डेटा उपलब्ध नहीं है"
    },
    pa: {
      "Dashboard":"ਡੈਸ਼ਬੋਰਡ","AI Tutor":"ਏਆਈ ਟਿਊਟਰ","My Courses":"ਮੇਰੇ ਕੋਰਸ","Study Planner":"ਪੜ੍ਹਾਈ ਯੋਜਨਾਕਾਰ",
      "Smart Notes":"ਸਮਾਰਟ ਨੋਟਸ","Notes":"ਨੋਟਸ","Progress":"ਤਰੱਕੀ","Settings":"ਸੈਟਿੰਗਾਂ","My Profile":"ਮੇਰੀ ਪ੍ਰੋਫ਼ਾਈਲ",
      "LEARNING":"ਸਿੱਖਣਾ","Welcome Back 👋":"ਜੀ ਆਇਆਂ ਨੂੰ 👋","Total Notes":"ਕੁੱਲ ਨੋਟਸ","Pending Tasks":"ਬਾਕੀ ਕੰਮ",
      "Study Sessions":"ਪੜ੍ਹਾਈ ਸੈਸ਼ਨ","Average Score":"ਔਸਤ ਅੰਕ","Today's Study Plan":"ਅੱਜ ਦੀ ਪੜ੍ਹਾਈ ਯੋਜਨਾ",
      "Upload your study material to generate your personalized study plan.":"ਆਪਣੀ ਨਿੱਜੀ ਪੜ੍ਹਾਈ ਯੋਜਨਾ ਬਣਾਉਣ ਲਈ ਪੜ੍ਹਾਈ ਸਮੱਗਰੀ ਅੱਪਲੋਡ ਕਰੋ।",
      "New Chat":"ਨਵੀਂ ਚੈਟ","Recent Chats":"ਹਾਲੀਆ ਚੈਟ","Ask anything...":"ਕੁਝ ਵੀ ਪੁੱਛੋ...","Ask me anything about your studies.":"ਆਪਣੀ ਪੜ੍ਹਾਈ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।",
      "Hello, learner! 👋":"ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਵਿਦਿਆਰਥੀ! 👋","VidyaVerse is thinking":"ਵਿਦਿਆਵਰਸ ਸੋਚ ਰਿਹਾ ਹੈ","Try again":"ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
      "My Progress":"ਮੇਰੀ ਤਰੱਕੀ","Track your achievements and see how far you've come.":"ਆਪਣੀਆਂ ਪ੍ਰਾਪਤੀਆਂ ਵੇਖੋ ਅਤੇ ਜਾਣੋ ਕਿ ਤੁਸੀਂ ਕਿੰਨੀ ਤਰੱਕੀ ਕੀਤੀ ਹੈ।",
      "Continue Learning":"ਸਿੱਖਣਾ ਜਾਰੀ ਰੱਖੋ","YOUR LEARNING JOURNEY":"ਤੁਹਾਡੀ ਸਿੱਖਣ ਦੀ ਯਾਤਰਾ","EVERY LESSON COUNTS":"ਹਰ ਪਾਠ ਮਹੱਤਵਪੂਰਨ ਹੈ",
      "Enrolled Courses":"ਦਾਖ਼ਲ ਕੀਤੇ ਕੋਰਸ","Completed Lessons":"ਪੂਰੇ ਕੀਤੇ ਪਾਠ","Overall Progress":"ਕੁੱਲ ਤਰੱਕੀ",
      "Remaining Lessons":"ਬਾਕੀ ਪਾਠ","Your learning library":"ਤੁਹਾਡੀ ਸਿੱਖਣ ਲਾਇਬ੍ਰੇਰੀ","Lessons you've finished":"ਤੁਹਾਡੇ ਪੂਰੇ ਕੀਤੇ ਪਾਠ",
      "Across all courses":"ਸਾਰੇ ਕੋਰਸਾਂ ਵਿੱਚ","Keep moving forward":"ਅੱਗੇ ਵਧਦੇ ਰਹੋ","Overall Learning Progress":"ਕੁੱਲ ਸਿੱਖਣ ਦੀ ਤਰੱਕੀ",
      "Your progress across all available courses.":"ਸਾਰੇ ਉਪਲਬਧ ਕੋਰਸਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਤਰੱਕੀ।","Your learning journey starts here.":"ਤੁਹਾਡੀ ਸਿੱਖਣ ਦੀ ਯਾਤਰਾ ਇੱਥੋਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ।",
      "Course Performance":"ਕੋਰਸ ਪ੍ਰਦਰਸ਼ਨ","Review progress in each subject.":"ਹਰ ਵਿਸ਼ੇ ਵਿੱਚ ਆਪਣੀ ਤਰੱਕੀ ਵੇਖੋ।","Explore courses":"ਕੋਰਸ ਵੇਖੋ",
      "Learning Summary":"ਸਿੱਖਣ ਦਾ ਸਾਰ","A quick overview of your current study status.":"ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਪੜ੍ਹਾਈ ਦੀ ਸਥਿਤੀ ਦਾ ਸੰਖੇਪ ਵੇਰਵਾ।",
      "Start a course to begin building your learning history.":"ਆਪਣਾ ਸਿੱਖਣ ਦਾ ਇਤਿਹਾਸ ਬਣਾਉਣ ਲਈ ਕੋਈ ਕੋਰਸ ਸ਼ੁਰੂ ਕਰੋ।",
      "Made for curious minds.":"ਜਿਗਿਆਸੂ ਮਨਾਂ ਲਈ ਬਣਾਇਆ ਗਿਆ।","YOUR LEARNING SPACE":"ਤੁਹਾਡੀ ਸਿੱਖਣ ਦੀ ਥਾਂ","Learn new skills and make progress every day.":"ਨਵੇਂ ਹੁਨਰ ਸਿੱਖੋ ਅਤੇ ਹਰ ਰੋਜ਼ ਤਰੱਕੀ ਕਰੋ।",
      "Explore Courses":"ਕੋਰਸ ਵੇਖੋ","BCA LEARNING PATH":"ਬੀਸੀਏ ਸਿੱਖਣ ਦਾ ਰਾਹ","Build your future, one lesson at a time.":"ਇੱਕ-ਇੱਕ ਪਾਠ ਨਾਲ ਆਪਣਾ ਭਵਿੱਖ ਬਣਾਓ।",
      "Explore programming, web development, databases, and computer networking.":"ਪ੍ਰੋਗਰਾਮਿੰਗ, ਵੈੱਬ ਡਿਵੈਲਪਮੈਂਟ, ਡਾਟਾਬੇਸ ਅਤੇ ਕੰਪਿਊਟਰ ਨੈੱਟਵਰਕਿੰਗ ਸਿੱਖੋ।",
      "Total Courses":"ਕੁੱਲ ਕੋਰਸ","Pick up where you left off.":"ਜਿੱਥੇ ਛੱਡਿਆ ਸੀ ਉੱਥੋਂ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ।","Explore Your Courses":"ਆਪਣੇ ਕੋਰਸ ਵੇਖੋ",
      "Choose a subject and start learning.":"ਕੋਈ ਵਿਸ਼ਾ ਚੁਣੋ ਅਤੇ ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ।","Search courses...":"ਕੋਰਸ ਖੋਜੋ...",
      "All Categories":"ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ","No courses match your search.":"ਤੁਹਾਡੀ ਖੋਜ ਨਾਲ ਕੋਈ ਕੋਰਸ ਨਹੀਂ ਮਿਲਿਆ।",
      "Manage your Vidya Verse preferences":"ਆਪਣੀਆਂ ਵਿਦਿਆਵਰਸ ਪਸੰਦਾਂ ਸੰਭਾਲੋ","Profile":"ਪ੍ਰੋਫ਼ਾਈਲ","Your account information":"ਤੁਹਾਡੇ ਖਾਤੇ ਦੀ ਜਾਣਕਾਰੀ",
      "Appearance":"ਦਿੱਖ","Customize how Vidya Verse looks":"ਵਿਦਿਆਵਰਸ ਦੀ ਦਿੱਖ ਬਦਲੋ","Dark Mode":"ਡਾਰਕ ਮੋਡ",
      "Use a darker interface for comfortable viewing.":"ਆਰਾਮ ਨਾਲ ਵੇਖਣ ਲਈ ਗੂੜ੍ਹਾ ਇੰਟਰਫੇਸ ਵਰਤੋ।",
      "Notifications":"ਸੂਚਨਾਵਾਂ","Manage notification preferences":"ਸੂਚਨਾਵਾਂ ਦੀਆਂ ਪਸੰਦਾਂ ਸੰਭਾਲੋ",
      "Enable notifications from Vidya Verse.":"ਵਿਦਿਆਵਰਸ ਦੀਆਂ ਸੂਚਨਾਵਾਂ ਚਾਲੂ ਕਰੋ।","Account":"ਖਾਤਾ","Manage your account":"ਆਪਣਾ ਖਾਤਾ ਸੰਭਾਲੋ",
      "Logout":"ਲੌਗ ਆਉਟ","About":"ਬਾਰੇ","Application information":"ਐਪਲੀਕੇਸ਼ਨ ਜਾਣਕਾਰੀ",
      "AI-powered personal learning assistant designed to help students study smarter.":"ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਹੋਰ ਚੰਗੀ ਤਰ੍ਹਾਂ ਪੜ੍ਹਨ ਵਿੱਚ ਮਦਦ ਕਰਨ ਵਾਲਾ ਏਆਈ-ਆਧਾਰਿਤ ਨਿੱਜੀ ਸਿੱਖਣ ਸਹਾਇਕ।",
      "Language":"ਭਾਸ਼ਾ","Choose your preferred language":"ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ","English":"ਅੰਗਰੇਜ਼ੀ","Hindi":"ਹਿੰਦੀ","Punjabi":"ਪੰਜਾਬੀ",
      "Save":"ਸੇਵ ਕਰੋ","Cancel":"ਰੱਦ ਕਰੋ","Login":"ਲੌਗ ਇਨ","Sign Up":"ਸਾਈਨ ਅੱਪ","Email":"ਈਮੇਲ","Password":"ਪਾਸਵਰਡ",
      "Name":"ਨਾਮ","Submit":"ਜਮ੍ਹਾਂ ਕਰੋ","Search":"ਖੋਜੋ","Loading...":"ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...","Student":"ਵਿਦਿਆਰਥੀ",
      "Study Files":"ਪੜ੍ਹਾਈ ਫਾਈਲਾਂ","Continue":"ਜਾਰੀ ਰੱਖੋ","Create":"ਬਣਾਓ","Delete":"ਮਿਟਾਓ","Update":"ਅੱਪਡੇਟ ਕਰੋ",
      "No data available":"ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ"
    }
  };
  const labels = { en:"English", hi:"हिन्दी", pa:"ਪੰਜਾਬੀ" };
  const normalize = value => (value || "").replace(/\s+/g, " ").trim();
  let current = localStorage.getItem(KEY) || "en";
  if (!["en","hi","pa"].includes(current)) current = "en";

  function translateText(value) {
    const key = normalize(value);
    if (!key || current === "en") return value;
    const translated = translations[current][key];
    if (!translated) return value;
    const leading = (value.match(/^\s*/) || [""])[0];
    const trailing = (value.match(/\s*$/) || [""])[0];
    return leading + translated + trailing;
  }

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const original = node.nodeValue;
      const translated = translateText(original);
      if (translated !== original) node.nodeValue = translated;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.matches("script,style,code,pre,textarea,[data-no-i18n]")) return;
      ["placeholder","title","aria-label"].forEach(attr => {
        if (node.hasAttribute(attr)) {
          const old = node.getAttribute("data-i18n-original-" + attr) || node.getAttribute(attr);
          if (!node.hasAttribute("data-i18n-original-" + attr)) node.setAttribute("data-i18n-original-" + attr, old);
          node.setAttribute(attr, translateText(old));
        }
      });
      node.childNodes.forEach(translateNode);
    }
  }

  function translatePage() {
    document.documentElement.lang = current;
    document.documentElement.dir = "ltr";
    // Restore original English strings before applying the selected language.
    document.querySelectorAll("[data-i18n-original-placeholder],[data-i18n-original-title],[data-i18n-original-aria-label]").forEach(el => {
      ["placeholder","title","aria-label"].forEach(a => {
        const original = el.getAttribute("data-i18n-original-" + a);
        if (original !== null) el.setAttribute(a, original);
      });
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.parentElement.closest("script,style,code,pre,textarea,[data-no-i18n]")) {
        const original = node.__vvOriginal ?? node.nodeValue;
        node.__vvOriginal = original;
        node.nodeValue = translateText(original);
      }
    });
    document.querySelectorAll("input[placeholder],textarea[placeholder],[title],[aria-label]").forEach(el => {
      ["placeholder","title","aria-label"].forEach(a => {
        const original = el.getAttribute("data-i18n-original-" + a) || el.getAttribute(a);
        if (original) {
          el.setAttribute("data-i18n-original-" + a, original);
          el.setAttribute(a, translateText(original));
        }
      });
    });
    const picker = document.getElementById("vv-language-picker");
    if (picker) picker.value = current;
    const settingsPicker = document.getElementById("settingsLanguage");
    if (settingsPicker) settingsPicker.value = current;
  }

  function setLanguage(language) {
    if (!["en","hi","pa"].includes(language)) return;
    current = language;
    localStorage.setItem(KEY, language);
    translatePage();
    document.dispatchEvent(new CustomEvent("vidyaverse:languagechange", { detail: { language } }));
  }

  function mountPicker() {
    // Always connect the existing language dropdown in Settings
    const settingsPicker = document.getElementById("settingsLanguage");

    if (settingsPicker) {
        settingsPicker.value = current;

        settingsPicker.addEventListener("change", (e) => {
            setLanguage(e.target.value);
        });
    }

    // Show the floating language selector ONLY on Dashboard
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (currentPage !== "studylearn.html") {
        return;
    }

    // Prevent duplicate selectors
    if (document.getElementById("vv-language-picker")) {
        return;
    }

    const wrap = document.createElement("label");

    wrap.className = "vv-language-control";

    wrap.innerHTML = `
        <span aria-hidden="true">🌐</span>
        <span class="vv-language-caption">Language</span>

        <select id="vv-language-picker" aria-label="Choose language">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
        </select>
    `;

    document.body.appendChild(wrap);

    const picker = wrap.querySelector("select");

    picker.value = current;

    picker.addEventListener("change", (e) => {
        setLanguage(e.target.value);
    });
}

  window.VidyaVerseI18n = {
    getLanguage: () => current,
    setLanguage,
    t: key => translations[current]?.[key] || key,
    translations
  };

  const style = document.createElement("style");
  style.textContent = `
.vv-language-control {
    position: fixed;
    z-index: 9999;
    right: 20px;
    bottom: 20px;
    top: auto;

    display: flex;
    align-items: center;
    gap: 8px;

    padding: 9px 13px;
    background: #ffffff;
    border: 1px solid #ead6df;
    border-radius: 14px;

    box-shadow: 0 4px 18px #57243b18;
    color: #702b49;

    font: 500 13px Poppins, Arial, sans-serif;
}

.vv-language-control select {
    border: 0;
    background: transparent;
    color: #702b49;
    font: 600 13px Poppins, Arial, sans-serif;
    outline: none;
    cursor: pointer;
    max-width: 112px;
}

.vv-language-caption {
    font-weight: 600;
}

@media (max-width: 600px) {
    .vv-language-control {
        right: 12px;
        bottom: 15px;
        top: auto;
        padding: 7px 10px;
    }

    .vv-language-caption {
        display: none;
    }
}
`;
  document.head.appendChild(style);

  function boot() {
    mountPicker();
    translatePage();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const original = node.__vvOriginal ?? node.nodeValue;
            node.__vvOriginal = original;
            node.nodeValue = translateText(original);
          } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains("vv-language-control")) {
            translateNode(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
/* ==========================================================
   Tadwir — تدوير | Arabic / English switch
   Arabic is the source text in index.html; this file holds the
   English for every Arabic string and swaps text in place.
   ========================================================== */
(function () {
  'use strict';

  var EN = {
    // Navigation & chrome
    'تخطَّ إلى المحتوى': 'Skip to content',
    'تدوير — العودة إلى الأعلى': 'Tadwir — back to top',
    'شعار تدوير': 'Tadwir logo',
    'التنقل الرئيسي': 'Main navigation',
    'من نحن': 'About',
    'الجهاز': 'Device',
    'كيف يعمل': 'How it works',
    'التقنيات': 'Technology',
    'التطبيق': 'App',
    'الحلول': 'Solutions',
    'الأثر': 'Impact',
    'خططنا': 'Roadmap',
    'تواصل معنا': 'Contact us',
    'فتح القائمة': 'Open menu',
    'إغلاق القائمة': 'Close menu',

    // Hero
    'شركة سعودية ناشئة في التقنية البيئية': 'A Saudi environmental-tech startup',
    'تدوير': 'Tadwir',
    'لنمنح الأجهزة القديمة فرصة لإنقاذ المستقبل': 'Let’s give old devices a chance to save the future',
    'منظومة ذكية لإدارة النفايات الإلكترونية وتحويلها إلى موارد ذات قيمة، تجمع بين الذكاء الاصطناعي وإنترنت الأشياء في جهاز واحد وتطبيق واحد.':
      'A smart system that manages e-waste and turns it into valuable resources, combining AI and the Internet of Things in one device and one app.',
    'اكتشف الجهاز': 'Explore the device',
    'أبرز المزايا': 'Key features',
    'فرز بالذكاء الاصطناعي': 'AI-powered sorting',
    'إتلاف آمن للبيانات': 'Secure data destruction',
    'نقاط ومكافآت فورية': 'Instant points & rewards',
    'جهاز TADWIR AI الذكي لاستقبال الأجهزة الإلكترونية القديمة': 'The TADWIR AI smart kiosk for collecting old electronic devices',
    'فحص ذكي': 'Smart inspection',
    'بالكاميرات والحساسات': 'with cameras & sensors',
    'اقتصاد دائري': 'Circular economy',
    'متوافق مع رؤية 2030': 'aligned with Vision 2030',
    'انتقل إلى قسم من نحن': 'Go to the About section',

    // About
    'من مجرد جمعٍ… إلى': 'From simple collection… to',
    'منظومة ذكية': 'a smart system',
    'تدوير شركة سعودية ناشئة متخصصة في إدارة النفايات الإلكترونية بطرق ذكية ومستدامة، توظّف الذكاء الاصطناعي وإنترنت الأشياء لتحويل الأجهزة القديمة من عبء بيئي إلى موارد ذات قيمة اقتصادية.':
      'Tadwir is a Saudi startup specialising in smart, sustainable e-waste management. We use AI and IoT to turn old devices from an environmental burden into resources with real economic value.',
    'لماذا تدوير؟': 'Why Tadwir?',
    'في ظل تزايد النفايات الإلكترونية، جاءت تدوير لتطوير مفهوم التدوير من مجرد جمعٍ إلى منظومة ذكية متكاملة تعتمد على الذكاء الاصطناعي وإنترنت الأشياء، تبدأ من صندوق الاستلام وتنتهي بموادّ خام جاهزة لإعادة التصنيع.':
      'As e-waste keeps growing, Tadwir takes recycling beyond simple collection to an integrated smart system built on AI and IoT, starting at the drop-off kiosk and ending with raw materials ready for remanufacturing.',
    'الرؤية': 'Vision',
    'الريادة في الاقتصاد الدائري، وتحويل النفايات الإلكترونية إلى موارد قيّمة ومستدامة عبر الذكاء الاصطناعي.':
      'To lead the circular economy by turning e-waste into valuable, sustainable resources through artificial intelligence.',
    'الرسالة': 'Mission',
    'أتمتة إدارة النفايات الإلكترونية عبر إنترنت الأشياء والتحليلات التنبؤية، لتحويل التحديات البيئية إلى عوائد اقتصادية مستدامة تتماشى مع رؤية السعودية 2030.':
      'To automate e-waste management through IoT and predictive analytics, turning environmental challenges into sustainable economic returns in line with Saudi Vision 2030.',

    // Values & goals
    'القيم والأهداف': 'Values & goals',
    'مبادئ نعمل بها، وأهداف نسعى إليها': 'Principles we work by, goals we pursue',
    'قيمنا': 'Our values',
    'الابتكار التقني': 'Technical innovation',
    'حلول ذكية تبني على أحدث تقنيات الذكاء الاصطناعي وإنترنت الأشياء.': 'Smart solutions built on the latest AI and IoT technology.',
    'الاستدامة والمسؤولية البيئية': 'Sustainability & environmental responsibility',
    'نحمي البيئة من مخاطر النفايات الإلكترونية ونعيد مواردها إلى دورة الإنتاج.': 'We protect the environment from e-waste hazards and return its resources to the production cycle.',
    'الشفافية والموثوقية': 'Transparency & reliability',
    'تقييم عادل وواضح، وفواتير موثّقة لكل عملية تسليم.': 'Fair, clear valuation and a documented receipt for every drop-off.',
    'الأثر المجتمعي': 'Community impact',
    'نشر ثقافة التدوير وتمكين الأفراد والمؤسسات من المشاركة الفاعلة.': 'Spreading a recycling culture and enabling people and organisations to take part.',
    'الالتزام بالتنمية الوطنية': 'Commitment to national development',
    'إسهام مباشر في مستهدفات رؤية المملكة 2030 وتوطين التقنية.': 'A direct contribution to the Kingdom’s Vision 2030 targets and to localising technology.',
    'أهدافنا': 'Our goals',
    'تمكين الاقتصاد الدائري': 'Enable the circular economy',
    'تحويل الأجهزة المستهلكة إلى مواد خام تعود إلى الصناعة.': 'Turn end-of-life devices into raw materials that return to industry.',
    'أتمتة سلاسل الإمداد اللوجستية': 'Automate logistics supply chains',
    'صناديق ذكية تُبلغ عن امتلائها وتُحسّن مسارات الجمع.': 'Smart kiosks that report when they are full and optimise collection routes.',
    'قيادة قطاع البيانات البيئية': 'Lead environmental data',
    'بيانات دقيقة عن النفايات الإلكترونية تدعم القرار.': 'Accurate e-waste data that supports decision-making.',
    'توطين الابتكار البيئي': 'Localise green innovation',
    'تطوير تقنيات بيئية سعودية بأيدٍ وطنية.': 'Saudi environmental technology, built by national talent.',
    'رفع الوعي والمسؤولية المجتمعية': 'Raise awareness & social responsibility',
    'حملات وبرامج توعوية تصنع جيلاً واعياً بيئياً.': 'Campaigns and programmes that build an environmentally aware generation.',

    // Device
    'المنتج الرئيسي': 'Flagship product',
    'جهاز': 'Meet the',
    'صندوق ذكي يستقبل الأجهزة الإلكترونية القديمة، يتعرّف عليها ويقيّمها في ثوانٍ، ثم يحفظها في مخزن آمن.':
      'A smart kiosk that accepts old electronics, identifies and values them in seconds, then stores them in a secure compartment.',
    'الواجهة الأمامية لجهاز TADWIR AI': 'Front view of the TADWIR AI kiosk',
    'الشاشة التفاعلية': 'Interactive screen',
    'شاشة لمس لعرض التعليمات ونتائج التقييم الأولي للجهاز المودَع.': 'A touchscreen that shows instructions and the initial valuation of the deposited device.',
    'بوابة الإدخال': 'Intake gate',
    'مصممة لاستيعاب الهواتف والحواسيب الصغيرة، ومزودة بحساسات وكاميرات تحلّل الأبعاد بدقة وتتعرّف على الجهاز.':
      'Sized for phones and small computers, with sensors and cameras that measure dimensions precisely and identify the device.',
    'منفذ طباعة الفواتير': 'Receipt printer',
    'يطبع الفاتورة بعد التقييم أو البيع، ويؤكد تسليم الجهاز.': 'Prints a receipt after valuation or sale, confirming the device was handed over.',
    'منفذ التجميع السفلي': 'Lower collection bay',
    'مخزن داخلي آمن ومقفل يمنع الوصول غير المصرح به ويحافظ على خصوصية البيانات.': 'A secure, locked internal store that blocks unauthorised access and protects data privacy.',

    // How it works
    'أربع خطوات… من الدُّرج إلى المحفظة': 'Four steps… from your drawer to your wallet',
    'الخطوة 01': 'Step 01',
    'الخطوة 02': 'Step 02',
    'الخطوة 03': 'Step 03',
    'الخطوة 04': 'Step 04',
    'التسجيل والتوجيه': 'Sign up & get directions',
    'أنشئ حساباً جديداً في تطبيق تدوير، وسيوجّهك إلى أقرب صندوق ذكي.': 'Create an account in the Tadwir app and it guides you to the nearest smart kiosk.',
    'المسح والارتباط': 'Scan & connect',
    'امسح رمز QR على الجهاز لربط الجلسة بحسابك بشكل مشفّر.': 'Scan the QR code on the kiosk to link the session to your account securely.',
    'الإيداع والفحص': 'Deposit & inspection',
    'ضع جهازك في بوابة الإدخال، وتفحصه الكاميرات فحصاً ذكياً لتحديد نوعه وحالته.': 'Place your device in the intake gate and the cameras inspect it to identify its type and condition.',
    'الفاتورة والنقاط': 'Receipt & points',
    'تُطبع الفاتورة، وتظهر النقاط فوراً في محفظتك داخل التطبيق.': 'Your receipt prints and the points appear instantly in your in-app wallet.',

    // Tech
    'التقنيات ومميزات المنتج': 'Technology & product features',
    'تقنية تفهم الجهاز… قبل أن تستقبله': 'Technology that understands the device… before it takes it in',
    'فرز ذكي بالذكاء الاصطناعي': 'AI-powered smart sorting',
    'نموذج': 'A',
    'مدرَّب على قاعدة بيانات ضخمة يتعرّف على الأجهزة ويفرزها تلقائياً.': 'model trained on a large dataset recognises devices and sorts them automatically.',
    'مسح QR و NFC': 'QR & NFC scanning',
    'ربط فوري بالحساب مع احتساب النقاط تلقائياً في المحفظة الرقمية.': 'Instant account linking, with points credited automatically to the digital wallet.',
    'حساسات ذكية متكاملة': 'Integrated smart sensors',
    'رصد لحظي لحالة الصندوق وتحليل تنبؤي للأعطال قبل حدوثها.': 'Real-time kiosk monitoring and predictive fault analysis before failures happen.',
    'التقييم والتسعير التلقائي': 'Automatic valuation & pricing',
    'تقدير قيمة الجهاز بناءً على حالته السطحية والداخلية.': 'Estimates a device’s value from its external and internal condition.',
    'البيانات والتخزين': 'Data & storage',
    'خيار سحب وحدة الذاكرة أو إتلافها بأمان قبل التدوير.': 'Choose to retrieve the storage unit or have it securely destroyed before recycling.',
    'منظر تفصيلي للمكونات الداخلية لجهاز TADWIR AI': 'Exploded view of the TADWIR AI internal components',
    'نظرة على المكونات الداخلية للجهاز': 'A look at the kiosk’s internal components',
    'المشروع حاصل على شهادة دراسة براءة اختراع': 'The project holds a patent study certificate',
    'من الهيئة السعودية للملكية الفكرية برقم': 'from the Saudi Authority for Intellectual Property, No.',

    // App
    'نموذج توضيحي لواجهة تطبيق تدوير': 'Illustrative mock-up of the Tadwir app',
    'مرحباً بك 👋': 'Welcome 👋',
    'رصيد النقاط': 'Points balance',
    '♻︎ 12 جهازاً': '♻︎ 12 devices',
    'CO₂ −18 كجم': 'CO₂ −18 kg',
    'أقرب صندوق · 1.2 كم': 'Nearest kiosk · 1.2 km',
    'امسح QR': 'Scan QR',
    'المساعد': 'Assistant',
    'تم إتلاف الذاكرة': 'Storage destroyed',
    'شهادة إتلاف متاحة': 'Destruction certificate ready',
    'تطبيق تدوير': 'The Tadwir app',
    'رحلتك كاملة… في جيبك': 'Your whole journey… in your pocket',
    'التطبيق هو بوابتك إلى منظومة تدوير: يرشدك، ويربطك بالجهاز، ويحفظ مكافآتك وأثرك البيئي.':
      'The app is your gateway to Tadwir: it guides you, connects you to the kiosk, and keeps track of your rewards and environmental impact.',
    'التوجيه لأقرب صندوق': 'Directions to the nearest kiosk',
    'خريطة تفاعلية تعرض أقرب الصناديق الذكية إليك.': 'An interactive map showing the smart kiosks closest to you.',
    'الربط بمسح QR': 'Connect by scanning a QR code',
    'ربط مشفّر وفوري بين حسابك والجهاز.': 'An instant, encrypted link between your account and the kiosk.',
    'مساعد ذكي خطوة بخطوة': 'Step-by-step smart assistant',
    'إرشادات واضحة طوال عملية الإيداع.': 'Clear guidance throughout the drop-off.',
    'الفواتير والمكافآت والأثر البيئي': 'Receipts, rewards & environmental impact',
    'سجل كامل لعملياتك ونقاطك ومقدار ما وفّرته للبيئة.': 'A full record of your drop-offs, your points and what you have saved for the planet.',
    'تأكيد سحب الذاكرة أو إتلافها': 'Confirm storage retrieval or destruction',
    'أنت من يقرر مصير بياناتك، ونؤكد لك التنفيذ.': 'You decide what happens to your data, and we confirm it was done.',

    // Privacy
    'الخصوصية والأمان': 'Privacy & security',
    'بياناتك أمانة… نحفظها حتى آخر بايت': 'Your data is a trust… protected down to the last byte',
    'الأجهزة القديمة تحمل ذكريات وأسراراً؛ لذلك صُمّمت منظومة تدوير لتضع خصوصية المستخدم في المقام الأول.':
      'Old devices hold memories and secrets, so Tadwir is designed to put user privacy first.',
    'حماية كاملة لبيانات المستخدم': 'Full protection of user data',
    'معالجة البيانات وفق أعلى معايير الأمان.': 'Data handled to the highest security standards.',
    'تشفير البيانات': 'Data encryption',
    'جلسات مشفّرة من لحظة المسح حتى إصدار الفاتورة.': 'Encrypted sessions from the moment you scan until the receipt is issued.',
    'عدم المشاركة مع جهات غير مصرح لها': 'No sharing with unauthorised parties',
    'لا تُشارك بياناتك إلا بما يقتضيه تقديم الخدمة.': 'Your data is shared only as far as the service requires.',
    'شهادات تدمير بيانات معتمدة': 'Certified data-destruction certificates',
    'وثيقة رسمية تؤكد إتلاف وحدة الذاكرة بأمان.': 'An official document confirming the storage unit was securely destroyed.',

    // Solutions
    'الحلول والخدمات': 'Solutions & services',
    'حلول للأفراد والشركات والمصانع': 'Solutions for individuals, businesses and recyclers',
    'للأفراد': 'For individuals',
    'نظام نقاط ومكافآت يحوّل الأجهزة القديمة إلى أموال أو نقاط': 'A points and rewards scheme that turns old devices into cash or points',
    'استبدال الجهاز القديم بجهاز جديد': 'Trade in an old device for a new one',
    'تدوير آمن للبيانات': 'Data-safe recycling',
    'للشركات': 'For businesses',
    'تقارير الاستدامة': 'Sustainability reports',
    'صناديق ذكية داخل المرافق': 'Smart kiosks on your premises',
    'دعم فني مخصص': 'Dedicated technical support',
    'عقود طويلة الأجل': 'Long-term contracts',
    'لمصانع التدوير': 'For recycling plants',
    'توريد الخامات المفروزة بالوزن': 'Sorted raw materials supplied by weight',
    'لوحات الدوائر المطبوعة': 'Printed circuit boards',
    'البلاستيك': 'Plastics',
    'النحاس والمعادن': 'Copper & metals',
    'خدمات ما بعد البيع': 'After-sales services',
    'دعم استشاري لإدارة الأصول التقنية': 'Advisory support for IT asset management',
    'ضمان خصوصية البيانات': 'Guaranteed data privacy',
    'شهادات تدمير البيانات': 'Data-destruction certificates',

    // Market
    'أرقام السوق': 'Market figures',
    'فرصة عالمية تنمو كل عام': 'A global opportunity that grows every year',
    'مليار دولار': 'billion USD',
    'حجم سوق النفايات الإلكترونية الحالي (2026)': 'Current e-waste market size (2026)',
    'معدل النمو السنوي': 'Annual growth rate (CAGR)',
    'الحجم المتوقع (2033)': 'Projected market size (2033)',
    'المصدر:': 'Source:',

    // Impact
    'الأثر والاستدامة': 'Impact & sustainability',
    'نُسهم في أهداف التنمية المستدامة': 'Contributing to the Sustainable Development Goals',
    'الصحة الجيدة والرفاه': 'Good health and well-being',
    'طاقة نظيفة وبأسعار معقولة': 'Affordable and clean energy',
    'العمل اللائق ونمو الاقتصاد': 'Decent work and economic growth',
    'الصناعة والابتكار والهياكل الأساسية': 'Industry, innovation and infrastructure',
    'مدن ومجتمعات محلية مستدامة': 'Sustainable cities and communities',
    'الاستهلاك والإنتاج المسؤولان': 'Responsible consumption and production',
    'العمل المناخي': 'Climate action',
    'عقد الشراكات لتحقيق الأهداف': 'Partnerships for the goals',
    'رؤية': 'Vision',
    'إسهامنا في رؤية المملكة 2030': 'Our contribution to Saudi Vision 2030',
    'برنامج جودة الحياة': 'Quality of Life Program',
    'برنامج التحول الوطني': 'National Transformation Program',
    'برنامج تطوير الصناعة الوطنية والخدمات اللوجستية': 'National Industrial Development and Logistics Program',

    // CSR
    'المسؤولية المجتمعية': 'Social responsibility',
    'نبني الوعي كما نبني التقنية': 'Building awareness as we build technology',
    'برامج المبادرة': 'Initiative programmes',
    'حاويات الفرز الذكية': 'Smart sorting bins',
    'حاويات في الأماكن العامة تسهّل الفرز من المصدر.': 'Bins in public spaces that make sorting at the source easy.',
    'التدوير الأخضر للمؤسسات': 'Green recycling for organisations',
    'شراكات تساعد الجهات على إدارة أجهزتها المستهلكة بمسؤولية.': 'Partnerships that help organisations manage their end-of-life devices responsibly.',
    'تحالفات التدوير الخيرية': 'Charitable recycling alliances',
    'تحويل عوائد التدوير إلى دعم للمبادرات الخيرية.': 'Turning recycling proceeds into support for charitable initiatives.',
    'برامج التوعية': 'Awareness programmes',
    'حملة «صُنّاع الغد»': '“Makers of Tomorrow” campaign',
    'توعية الطلاب بأهمية التدوير الإلكتروني ومفهوم الاقتصاد الدائري.': 'Teaching students why e-recycling matters and what the circular economy means.',
    'منصة «وعي وتدوير»': '“Awareness & Recycling” platform',
    'محتوى رقمي مبسّط عن مخاطر النفايات الإلكترونية وطرق التعامل معها.': 'Simple digital content on the risks of e-waste and how to handle it.',
    'ورش «فن الريسايكل»': '“Recycle Art” workshops',
    'ورش إبداعية تحوّل المخلّفات إلى أعمال فنية.': 'Creative workshops that turn waste into works of art.',

    // Roadmap
    'الخطط المستقبلية': 'Future plans',
    'خارطة طريق بثلاث مراحل': 'A three-phase roadmap',
    'المدى القريب · 1–2 سنة': 'Short term · 1–2 years',
    'الانتشار والمكافآت': 'Roll-out & rewards',
    'نشر الصناديق الذكية في المدن الرئيسية، وإطلاق نظام مكافآت مرن.': 'Deploy smart kiosks across major cities and launch a flexible rewards scheme.',
    'المدى المتوسط · 3–4 سنوات': 'Medium term · 3–4 years',
    'الأتمتة والتعاقدات': 'Automation & contracts',
    'إنشاء مركز فرز مركزي مؤتمت بالكامل، وإبرام عقود تدمير بيانات مع البنوك والشركات.': 'Build a fully automated central sorting facility and sign data-destruction contracts with banks and companies.',
    'المدى البعيد · 5+ سنوات': 'Long term · 5+ years',
    'التوسع الإقليمي': 'Regional expansion',
    'التوسع في دول الخليج، وتشغيل خطوط تكرير المعادن الثمينة.': 'Expand across the Gulf and run precious-metal refining lines.',

    // Contact & footer
    'لنصنع أثراً معاً': 'Let’s make an impact together',
    'سواء كنت فرداً لديك أجهزة قديمة، أو جهة تبحث عن حل مستدام، أو شريكاً محتملاً، يسعدنا تواصلك عبر البريد أو الجوال أو حساباتنا الرسمية.':
      'Whether you have old devices at home, run an organisation looking for a sustainable solution, or want to partner with us, reach us by email, phone or on our official accounts.',
    'البريد الإلكتروني': 'Email',
    'راسلنا': 'Email us',
    'الجوال': 'Phone',
    'اتصل بنا': 'Call us',
    'منصة X': 'X',
    'إنستغرام': 'Instagram',
    'تيك توك': 'TikTok',
    'تابعنا': 'Follow',
    'جميع الحقوق محفوظة © 2026 تدوير · المملكة العربية السعودية': '© 2026 Tadwir. All rights reserved · Saudi Arabia'
  };

  var META = {
    ar: {
      title: 'تدوير | Tadwir — منظومة ذكية لإدارة النفايات الإلكترونية',
      desc: 'تدوير شركة سعودية ناشئة تدير النفايات الإلكترونية بطرق ذكية ومستدامة باستخدام الذكاء الاصطناعي وإنترنت الأشياء، وتحوّلها من عبء بيئي إلى موارد ذات قيمة اقتصادية.'
    },
    en: {
      title: 'Tadwir | تدوير — Smart e-waste management',
      desc: 'Tadwir is a Saudi startup managing e-waste smartly and sustainably with AI and IoT, turning it from an environmental burden into resources of economic value.'
    }
  };

  var ATTRS = ['alt', 'aria-label', 'title'];
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var textItems = [], attrItems = [], splitItems = [];
  var current = 'ar';

  // Collect once, while the page still holds the Arabic source text.
  (function collect() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var ar = norm(el.textContent);
      if (EN[ar]) splitItems.push({ el: el, ar: ar });
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE)$/.test(p.nodeName) || p.closest('svg,[data-split]')) return NodeFilter.FILTER_REJECT;
        return EN[norm(n.nodeValue)] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      var m = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
      textItems.push({ node: n, ar: n.nodeValue, en: m[1] + EN[norm(n.nodeValue)] + m[3] });
    }
    document.querySelectorAll('[' + ATTRS.join('],[') + ']').forEach(function (el) {
      ATTRS.forEach(function (a) {
        var v = el.getAttribute(a);
        if (v && EN[norm(v)]) attrItems.push({ el: el, attr: a, ar: v, en: EN[norm(v)] });
      });
    });
  })();

  var toggleBtn = document.getElementById('lang-toggle');
  var metaDesc = document.querySelector('meta[name="description"]');

  function apply(lang) {
    if (lang !== 'en') lang = 'ar';
    current = lang;
    var en = lang === 'en';
    textItems.forEach(function (it) { it.node.nodeValue = en ? it.en : it.ar; });
    attrItems.forEach(function (it) { it.el.setAttribute(it.attr, en ? it.en : it.ar); });
    splitItems.forEach(function (it) { it.el.textContent = en ? EN[it.ar] : it.ar; });

    var root = document.documentElement;
    root.lang = lang;
    root.dir = en ? 'ltr' : 'rtl';
    document.title = META[lang].title;
    if (metaDesc) metaDesc.setAttribute('content', META[lang].desc);
    if (toggleBtn) {
      toggleBtn.textContent = en ? 'عربي' : 'EN';
      toggleBtn.lang = en ? 'ar' : 'en';
      toggleBtn.setAttribute('aria-label', en ? 'التبديل إلى العربية' : 'Switch to English');
    }
    try { localStorage.setItem('tadwir-lang', lang); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new CustomEvent('tadwir:lang', { detail: { lang: lang } }));
  }

  // Translate a source (Arabic) string for scripts that set text at runtime.
  function t(ar) { return current === 'en' && EN[ar] ? EN[ar] : ar; }

  if (toggleBtn) toggleBtn.addEventListener('click', function () { apply(current === 'en' ? 'ar' : 'en'); });

  var initial = 'ar';
  if (/^#en$/i.test(location.hash)) initial = 'en';
  else { try { if (localStorage.getItem('tadwir-lang') === 'en') initial = 'en'; } catch (e) { /* ignore */ } }
  if (initial === 'en') apply('en');

  window.TadwirI18n = { apply: apply, t: t, lang: function () { return current; } };
})();

export interface QuranSeed {
  surah_number: number;
  ayah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  juz_number: number;
  text_uthmani: string;
  text_simple: string;
  canonical_hash: string;
}

export interface HadithSeed {
  collection: string;
  book_name_ar: string;
  hadith_number: number;
  narrator_companion: string;
  matn_ar: string;
  matn_simple: string;
  grading: string;
  graded_by: string;
  takhrij_notes: string;
  canonical_hash: string;
}

export interface PoetrySeed {
  poet_name_ar: string;
  bahr: string;
  theme: string;
  bayt_ar: string;
  bayt_simple: string;
  canonical_hash: string;
}

export const QURAN_SEEDS: QuranSeed[] = [
  {
    surah_number: 3,
    ayah_number: 102,
    surah_name_ar: 'آل عمران',
    surah_name_en: "Ali 'Imran",
    juz_number: 4,
    text_uthmani: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱتَّقُواْ ٱللَّهَ حَقَّ تُقَاتِهِۦ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسۡلِمُونَ',
    text_simple: 'يا أيها الذين آمنوا اتقوا الله حق تقاته ولا تموتن إلا وأنتم مسلمون',
    canonical_hash: 'q_3_102_hash'
  },
  {
    surah_number: 4,
    ayah_number: 1,
    surah_name_ar: 'النساء',
    surah_name_en: 'An-Nisa',
    juz_number: 4,
    text_uthmani: 'يَٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُواْ رَبَّكُمُ ٱلَّذِي خَلَقَكُم مِّن نَّفۡسٖ وَٰحِدَةٖ وَخَلَقَ مِنۡهَا زَوۡجَهَا وَبَثَّ مِنۡهُمَا رِجَالٗا كَثِيرٗا وَنِسَآءٗۚ وَٱتَّقُواْ ٱللَّهَ ٱلَّذِي تَسَآءَلُونَ بِهِۦ وَٱلۡأَرۡحَامَۚ إِنَّ ٱللَّهَ كَانَ عَلَيۡكُمۡ رَقِيبٗا',
    text_simple: 'يا أيها الناس اتقوا ربكم الذي خلقكم من نفس واحدة وخلق منها زوجها وبث منهما رجالا كثيرا ونساء واتقوا الله الذي تساءلون به والأرحام إن الله كان عليكم رقيبا',
    canonical_hash: 'q_4_1_hash'
  },
  {
    surah_number: 33,
    ayah_number: 70,
    surah_name_ar: 'الأحزاب',
    surah_name_en: 'Al-Ahzab',
    juz_number: 22,
    text_uthmani: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱتَّقُواْ ٱللَّهَ وَقُولُواْ قَوۡلٗا سَدِيدٗا',
    text_simple: 'يا أيها الذين آمنوا اتقوا الله وقولوا قولا سديدا',
    canonical_hash: 'q_33_70_hash'
  },
  {
    surah_number: 33,
    ayah_number: 71,
    surah_name_ar: 'الأحزاب',
    surah_name_en: 'Al-Ahzab',
    juz_number: 22,
    text_uthmani: 'يُصۡلِحۡ لَكُمۡ أَعۡمَٰلَكُمۡ وَيَغۡفِرۡ لَكُمۡ ذُنُوبَكُمۡۗ وَمَن يُطِعِ ٱللَّهَ وَرَسُولَهُۥ فَقَدۡ فَازَ فَوۡزًا عَظِيمًا',
    text_simple: 'يصلح لكم أعمالكم ويغفر لكم ذنوبكم ومن يطع الله ورسوله فقد فاز فوزا عظيما',
    canonical_hash: 'q_33_71_hash'
  },
  {
    surah_number: 16,
    ayah_number: 90,
    surah_name_ar: 'النحل',
    surah_name_en: 'An-Nahl',
    juz_number: 14,
    text_uthmani: '۞ إِنَّ ٱللَّهَ يَأۡمُرُ بِٱلۡعَدۡلِ وَٱلۡإِحۡسَٰنِ وَإِيتَآيِٕ ذِي ٱلۡقُرۡبَىٰ وَيَنۡهَىٰ عَنِ ٱلۡفَحۡشَآءِ وَٱلۡمُنكَرِ وَٱلۡبَغۡيِۚ يَعِظُكُمۡ لَعَلَّكُمۡ تَذَكَّرُونَ',
    text_simple: 'إن الله يأمر بالعدل والإحسان وإيتاء ذي القربى وينهى عن الفحشاء والمنكر والبغي يعظكم لعلكم تذكرون',
    canonical_hash: 'q_16_90_hash'
  },
  {
    surah_number: 2,
    ayah_number: 153,
    surah_name_ar: 'البقرة',
    surah_name_en: 'Al-Baqarah',
    juz_number: 2,
    text_uthmani: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱسۡتَعِينُواْ بِٱلصَّبۡرِ وَٱلصَّلَوٰةِۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    text_simple: 'يا أيها الذين آمنوا استعينوا بالصبر والصلاة إن الله مع الصابرين',
    canonical_hash: 'q_2_153_hash'
  },
  {
    surah_number: 49,
    ayah_number: 10,
    surah_name_ar: 'الحجرات',
    surah_name_en: 'Al-Hujurat',
    juz_number: 26,
    text_uthmani: 'إِنَّمَا ٱلۡمُؤۡمِنُونَ إِخۡوَةٞ فَأَصۡلِحُواْ بَيۡنَ أَخَوَيۡكُمۡۚ وَٱتَّقُواْ ٱللَّهَ لَعَلَّكُمۡ تُرۡحَمُونَ',
    text_simple: 'إنما المؤمنون إخوة فأصلحوا بين أخويكم واتقوا الله لعلكم ترحمون',
    canonical_hash: 'q_49_10_hash'
  },
  {
    surah_number: 17,
    ayah_number: 23,
    surah_name_ar: 'الإسراء',
    surah_name_en: 'Al-Isra',
    juz_number: 15,
    text_uthmani: '۞ وَقَضَىٰ رَبُّكَ أَلَّا تَعۡبُدُوٓاْ إِلَّآ إِيَّاهُ وَبِٱلۡوَٰلِدَيۡنِ إِحۡسَٰنًاۚ إِمَّا يَبۡلُغَنَّ عِندَكَ ٱلۡكِبَرَ أَحَدُهُمَآ أَوۡ كِلَاهُمَا فَلَا تَقُل لَّهُمَآ أُفّٖ وَلَا تَنۡهَرۡهُمَا وَقُل لَّهُمَا قَوۡلٗا كَرِيمٗا',
    text_simple: 'وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا إما يبلغن عندك الكبر أحدهما أو كلاهما فلا تقل لهما أف ولا تنهرهما وقل لهما قولا كريما',
    canonical_hash: 'q_17_23_hash'
  }
];

export const HADITH_SEEDS: HadithSeed[] = [
  {
    collection: 'Sahih al-Bukhari',
    book_name_ar: 'كتاب بدء الوحي',
    hadith_number: 1,
    narrator_companion: 'عمر بن الخطاب رضي الله عنه',
    matn_ar: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
    matn_simple: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    grading: 'Sahih',
    graded_by: 'متفق عليه (البخاري ومسلم)',
    takhrij_notes: 'أخرجه البخاري برقم (1) ومسلم برقم (1907)',
    canonical_hash: 'h_1_hash'
  },
  {
    collection: 'Sahih al-Bukhari',
    book_name_ar: 'كتاب الإيمان',
    hadith_number: 13,
    narrator_companion: 'أنس بن مالك رضي الله عنه',
    matn_ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
    matn_simple: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه',
    grading: 'Sahih',
    graded_by: 'متفق عليه (البخاري ومسلم)',
    takhrij_notes: 'أخرجه البخاري برقم (13) ومسلم برقم (45)',
    canonical_hash: 'h_13_hash'
  },
  {
    collection: 'Sahih al-Bukhari',
    book_name_ar: 'كتاب الأدب',
    hadith_number: 6011,
    narrator_companion: 'النعمان بن بشير رضي الله عنهما',
    matn_ar: 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ، وَتَرَاحُمِهِمْ، وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى.',
    matn_simple: 'مثل المؤمنين في توادهم وتراحمهم وتعاطفهم مثل الجسد إذا اشتكى منه عضو تداعى له سائر الجسد بالسهر والحمى',
    grading: 'Sahih',
    graded_by: 'متفق عليه (البخاري ومسلم)',
    takhrij_notes: 'أخرجه البخاري برقم (6011) ومسلم برقم (2586)',
    canonical_hash: 'h_6011_hash'
  },
  {
    collection: "Jami' at-Tirmidhi",
    book_name_ar: 'صفة القيامة والرقائق',
    hadith_number: 2516,
    narrator_companion: 'عبد الله بن عباس رضي الله عنهما',
    matn_ar: 'يَا غُلَامُ إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ، وَاعْلَمْ أَنَّ الأُمَّةَ لَوْ اجْتَمَعَتْ عَلَى أَنْ يَنْفَعُوكَ بِشَيْءٍ لَمْ يَنْفَعُوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ لَكَ، وَلَوْ اجْتَمَعُوا عَلَى أَنْ يَضُرُّوكَ بِشَيْءٍ لَمْ يَضُرُّوكَ إِلَّا بِشَيْءٍ قَدْ كَتَبَهُ اللَّهُ عَلَيْكَ، رُفِعَتِ الأَقْلَامُ وَجَفَّتِ الصُّحُفُ.',
    matn_simple: 'يا غلام إني أعلمك كلمات احفظ الله يحفظك',
    grading: 'Hasan Sahih',
    graded_by: 'الإمام الترمذي والشيخ الألباني',
    takhrij_notes: 'أخرجه الترمذي برقم (2516) وقال حديث حسن صحيح',
    canonical_hash: 'h_2516_hash'
  },
  {
    collection: 'Sahih al-Bukhari',
    book_name_ar: 'كتاب الرقاق',
    hadith_number: 6412,
    narrator_companion: 'عبد الله بن عباس رضي الله عنهما',
    matn_ar: 'نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ.',
    matn_simple: 'نعمتان مغبون فيهما كثير من الناس الصحة والفراغ',
    grading: 'Sahih',
    graded_by: 'الإمام البخاري',
    takhrij_notes: 'أخرجه البخاري برقم (6412)',
    canonical_hash: 'h_6412_hash'
  }
];

export const POETRY_SEEDS: PoetrySeed[] = [
  {
    poet_name_ar: 'الإمام الشافعي رحمه الله',
    bahr: 'بحر الكامل',
    theme: 'الصبر والتوكل على الله',
    bayt_ar: 'دَعِ الأَيَّامَ تَفْعَلُ مَا تَشَاءُ ... وَطِبْ نَفْسًا إِذَا حَكَمَ القَضَاءُ\nوَلا تَجْزَعْ لِحَادِثَةِ اللَّيَالِي ... فَمَا لِحَوَادِثِ الدُّنْيَا بَقَاءُ',
    bayt_simple: 'دع الأيام تفعل ما تشاء وطب نفسا إذا حكم القضاء',
    canonical_hash: 'p_shafii_hash'
  },
  {
    poet_name_ar: 'أبو العتاهية',
    bahr: 'بحر الرمل',
    theme: 'الزهد وتذكر الموت',
    bayt_ar: 'نَسِيرُ إِلَى الآجَالِ فِي كُلِّ سَاعَةٍ ... وَأَيَّامُنَا تُطْوَى وَهُنَّ مَرَاحِلُ\nفَلَا تَرْكَنَنْ يَوْمًا إِلَى ذِي حُظْوَةٍ ... فَكُلُّ امْرِئٍ يَوْمًا إِلَى اللَّهِ صَائِرُ',
    bayt_simple: 'نسير إلى الآجال في كل ساعة وأيامنا تطوى وهن مراحل',
    canonical_hash: 'p_atahiya_hash'
  }
];

package com.example.minbarapp.data

enum class BlockType {
    MUQADDIMAH,
    QURAN,
    HADITH,
    SHARH,
    ISTIRAHAH,
    KHUTBAH2,
    DUA
}

data class SermonBlock(
    val id: String,
    val titleAr: String,
    val contentAr: String,
    val type: BlockType,
    val citationSource: String? = null,
    val grading: String? = null,
    val isVerified: Boolean = true
)

data class Sermon(
    val id: String,
    val title: String,
    val creed: String = "أهل السنة والجماعة",
    val targetDurationMinutes: Int = 15,
    val estimatedDeliveryMinutes: Double = 6.0,
    val wordCount: Int = 500,
    val blocks: List<SermonBlock>
)

data class CanonicalQuote(
    val id: String,
    val textAr: String,
    val sourceAr: String,
    val category: String, // "قرآن كريم" or "حديث نبوي شريف"
    val grading: String = "صحيح متواتر / موثق"
)

package com.example.minbarapp.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

interface DataRepository {
    val sermons: Flow<List<Sermon>>
    val quotes: Flow<List<CanonicalQuote>>
    fun getSermonById(id: String): Sermon?
    fun searchQuotes(query: String): List<CanonicalQuote>
}

class DefaultDataRepository : DataRepository {
    override val sermons: Flow<List<Sermon>> = flow {
        emit(SermonData.sampleSermons)
    }

    override val quotes: Flow<List<CanonicalQuote>> = flow {
        emit(SermonData.canonicalQuotes)
    }

    override fun getSermonById(id: String): Sermon? {
        return SermonData.sampleSermons.find { it.id == id }
    }

    override fun searchQuotes(query: String): List<CanonicalQuote> {
        if (query.isBlank()) return SermonData.canonicalQuotes
        return SermonData.canonicalQuotes.filter {
            it.textAr.contains(query, ignoreCase = true) ||
            it.sourceAr.contains(query, ignoreCase = true) ||
            it.category.contains(query, ignoreCase = true)
        }
    }
}

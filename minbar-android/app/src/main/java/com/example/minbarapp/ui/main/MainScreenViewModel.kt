package com.example.minbarapp.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.minbarapp.data.CanonicalQuote
import com.example.minbarapp.data.DataRepository
import com.example.minbarapp.data.Sermon
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

sealed interface MainScreenUiState {
    object Loading : MainScreenUiState
    data class Error(val throwable: Throwable) : MainScreenUiState
    data class Success(
        val sermons: List<Sermon>,
        val quotes: List<CanonicalQuote>,
        val selectedSermon: Sermon? = null,
        val isTeleprompterActive: Boolean = false,
        val searchQuery: String = ""
    ) : MainScreenUiState
}

class MainScreenViewModel(private val dataRepository: DataRepository) : ViewModel() {
    private val _selectedSermon = MutableStateFlow<Sermon?>(null)
    private val _isTeleprompterActive = MutableStateFlow(false)
    private val _searchQuery = MutableStateFlow("")

    val selectedSermon: StateFlow<Sermon?> = _selectedSermon.asStateFlow()
    val isTeleprompterActive: StateFlow<Boolean> = _isTeleprompterActive.asStateFlow()

    val uiState: StateFlow<MainScreenUiState> = combine(
        dataRepository.sermons,
        dataRepository.quotes,
        _selectedSermon,
        _isTeleprompterActive,
        _searchQuery
    ) { sermons, quotes, selected, teleprompter, query ->
        val filteredQuotes = if (query.isBlank()) quotes else {
            quotes.filter {
                it.textAr.contains(query, ignoreCase = true) ||
                it.sourceAr.contains(query, ignoreCase = true)
            }
        }
        MainScreenUiState.Success(
            sermons = sermons,
            quotes = filteredQuotes,
            selectedSermon = selected ?: sermons.firstOrNull(),
            isTeleprompterActive = teleprompter,
            searchQuery = query
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MainScreenUiState.Loading)

    fun selectSermon(sermon: Sermon) {
        _selectedSermon.value = sermon
    }

    fun setTeleprompterActive(active: Boolean) {
        _isTeleprompterActive.value = active
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }
}

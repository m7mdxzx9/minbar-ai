package com.example.minbarapp.ui.main

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.example.minbarapp.data.*
import com.example.minbarapp.theme.*
import kotlinx.coroutines.delay

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) }
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    when (val currentState = state) {
        MainScreenUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = EmeraldPrimary)
            }
        }
        is MainScreenUiState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("حدث خطأ أثناء تحميل البيانات: ${currentState.throwable.message}")
            }
        }
        is MainScreenUiState.Success -> {
            MinbarContent(
                state = currentState,
                onSelectSermon = { viewModel.selectSermon(it) },
                onToggleTeleprompter = { viewModel.setTeleprompterActive(it) },
                onSearchQueryChanged = { viewModel.updateSearchQuery(it) },
                modifier = modifier
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MinbarContent(
    state: MainScreenUiState.Success,
    onSelectSermon: (Sermon) -> Unit,
    onToggleTeleprompter: (Boolean) -> Unit,
    onSearchQueryChanged: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) } // 0: الخطب المنبرية, 1: نصوص القرآن والحديث

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "مِـنْـبَـر الخَـطِـيـب",
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = EmeraldDark
                            )
                            Spacer(Modifier.width(8.dp))
                            Surface(
                                color = Color(0xFFDCFCE7),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    "100% أوفلاين",
                                    color = EmeraldDark,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            "موثق وفق منهج أهل السنة والجماعة",
                            fontSize = 12.sp,
                            color = SoftGray
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = { onToggleTeleprompter(true) },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("وضع الملقن", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SandBackground
                )
            )
        },
        containerColor = SandBackground,
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Tab Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = EmeraldPrimary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("الخطب الموثقة (${state.sermons.size})", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("الشواهد المحفوظة (${state.quotes.size})", fontWeight = FontWeight.Bold) }
                )
            }

            if (selectedTab == 0) {
                SermonView(
                    sermons = state.sermons,
                    selectedSermon = state.selectedSermon,
                    onSelectSermon = onSelectSermon,
                    onLaunchTeleprompter = { onToggleTeleprompter(true) }
                )
            } else {
                CanonicalQuotesView(
                    quotes = state.quotes,
                    searchQuery = state.searchQuery,
                    onSearchQueryChanged = onSearchQueryChanged
                )
            }
        }
    }

    // Teleprompter Modal
    if (state.isTeleprompterActive && state.selectedSermon != null) {
        TeleprompterDialog(
            sermon = state.selectedSermon,
            onDismiss = { onToggleTeleprompter(false) }
        )
    }
}

@Composable
fun SermonView(
    sermons: List<Sermon>,
    selectedSermon: Sermon?,
    onSelectSermon: (Sermon) -> Unit,
    onLaunchTeleprompter: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        // Horizontal Sermon Chips
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(sermons) { sermon ->
                val isSelected = sermon.id == selectedSermon?.id
                FilterChip(
                    selected = isSelected,
                    onClick = { onSelectSermon(sermon) },
                    label = {
                        Text(
                            sermon.title,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 13.sp
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = EmeraldPale,
                        selectedLabelColor = EmeraldDark
                    )
                )
            }
        }

        Divider(color = CardBorder, thickness = 1.dp)

        if (selectedSermon != null) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                // Header Info Card
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                selectedSermon.title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldDark,
                                textAlign = TextAlign.Right,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    "المدة: ${selectedSermon.estimatedDeliveryMinutes} دقيقة",
                                    fontSize = 13.sp,
                                    color = SoftGray
                                )
                                Text(
                                    "عدد الكلمات: ${selectedSermon.wordCount} كلمة",
                                    fontSize = 13.sp,
                                    color = SoftGray
                                )
                                Surface(
                                    color = EmeraldPale,
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        "موثق 100%",
                                        color = EmeraldDark,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Sermon Blocks
                items(selectedSermon.blocks) { block ->
                    SermonBlockCard(block = block)
                }

                item {
                    Spacer(Modifier.height(40.dp))
                }
            }
        }
    }
}

@Composable
fun SermonBlockCard(block: SermonBlock) {
    val isQuran = block.type == BlockType.QURAN
    val isHadith = block.type == BlockType.HADITH

    val cardBg = when {
        isQuran -> VerseCardBg
        isHadith -> HadithCardBg
        else -> Color.White
    }

    val borderColor = when {
        isQuran -> EmeraldLight
        isHadith -> GoldAccent
        else -> CardBorder
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, borderColor, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = cardBg),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    block.titleAr,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = if (isQuran) EmeraldDark else if (isHadith) GoldAccent else CharcoalDark
                )

                if (isQuran) {
                    Surface(color = EmeraldDark, shape = RoundedCornerShape(4.dp)) {
                        Text("قرآن كريم", color = Color.White, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                } else if (isHadith) {
                    Surface(color = GoldAccent, shape = RoundedCornerShape(4.dp)) {
                        Text("حديث صحيح", color = Color.White, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
            }

            Spacer(Modifier.height(10.dp))

            Text(
                text = block.contentAr,
                fontSize = if (isQuran || isHadith) 17.sp else 15.sp,
                lineHeight = if (isQuran || isHadith) 28.sp else 24.sp,
                fontWeight = if (isQuran) FontWeight.Medium else FontWeight.Normal,
                color = CharcoalDark,
                textAlign = TextAlign.Right,
                modifier = Modifier.fillMaxWidth()
            )

            if (block.citationSource != null) {
                Spacer(Modifier.height(10.dp))
                Divider(color = borderColor.copy(alpha = 0.4f), thickness = 0.8.dp)
                Spacer(Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "المصدر: ${block.citationSource}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isQuran) EmeraldDark else GoldAccent
                    )
                    if (block.grading != null) {
                        Text(
                            "الدرجة: ${block.grading}",
                            fontSize = 11.sp,
                            color = SoftGray
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CanonicalQuotesView(
    quotes: List<CanonicalQuote>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchQueryChanged,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("ابحث في نصوص القرآن والسنة دون إنترنت...") },
            leadingIcon = { Text(" 🔍 ", fontSize = 16.sp) },
            shape = RoundedCornerShape(12.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White
            ),
            singleLine = true
        )

        Spacer(Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(quotes) { quote ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                quote.category,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (quote.category == "قرآن كريم") EmeraldPrimary else GoldAccent
                            )
                            Surface(
                                color = EmeraldPale,
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    quote.grading,
                                    fontSize = 11.sp,
                                    color = EmeraldDark,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(
                            quote.textAr,
                            fontSize = 16.sp,
                            lineHeight = 26.sp,
                            fontWeight = FontWeight.Medium,
                            color = CharcoalDark,
                            textAlign = TextAlign.Right,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "المصدر: ${quote.sourceAr}",
                            fontSize = 12.sp,
                            color = SoftGray,
                            textAlign = TextAlign.Right,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TeleprompterDialog(
    sermon: Sermon,
    onDismiss: () -> Unit
) {
    var fontSize by remember { mutableFloatStateOf(24f) }
    var isDarkTheme by remember { mutableStateOf(true) }
    var isScrolling by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    // Auto-scroll loop
    LaunchedEffect(isScrolling) {
        while (isScrolling) {
            delay(50)
            if (scrollState.value < scrollState.maxValue) {
                val next = (scrollState.value + 4).coerceAtMost(scrollState.maxValue)
                scrollState.scrollTo(next)
            } else {
                isScrolling = false
            }
        }
    }

    val bgColor = if (isDarkTheme) CharcoalDark else Color(0xFFFBF8F2)
    val textColor = if (isDarkTheme) Color(0xFFF8FAFC) else CharcoalDark
    val highlightColor = if (isDarkTheme) Color(0xFFFCD34D) else EmeraldDark

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = bgColor
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Teleprompter Top Control Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(if (isDarkTheme) Color(0xFF1E293B) else Color.White)
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onDismiss) {
                        Text(
                            "✕",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isDarkTheme) Color.White else CharcoalDark
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Button(
                            onClick = { isScrolling = !isScrolling },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isScrolling) GoldAccent else EmeraldPrimary
                            ),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(if (isScrolling) "إيقاف التمرير" else "تمرير تلقائي", fontSize = 12.sp)
                        }

                        Spacer(Modifier.width(8.dp))

                        // Font size controls
                        OutlinedButton(
                            onClick = { if (fontSize < 38f) fontSize += 3f },
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp)
                        ) {
                            Text("A+", fontSize = 12.sp, color = if (isDarkTheme) Color.White else CharcoalDark)
                        }

                        Spacer(Modifier.width(4.dp))

                        OutlinedButton(
                            onClick = { if (fontSize > 16f) fontSize -= 3f },
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp)
                        ) {
                            Text("A-", fontSize = 12.sp, color = if (isDarkTheme) Color.White else CharcoalDark)
                        }

                        Spacer(Modifier.width(8.dp))

                        // Theme switch
                        OutlinedButton(
                            onClick = { isDarkTheme = !isDarkTheme },
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp)
                        ) {
                            Text(if (isDarkTheme) "ورقي" else "ليلي", fontSize = 12.sp, color = if (isDarkTheme) Color.White else CharcoalDark)
                        }
                    }
                }

                // Delivery Cadence Banner (95 WPM)
                Surface(
                    color = if (isDarkTheme) Color(0xFF0F172A) else Color(0xFFE2E8F0),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "معدل الإلقاء النبوي الموصى به: 95 كلمة / دقيقة",
                            fontSize = 12.sp,
                            color = if (isDarkTheme) Color(0xFF94A3B8) else Color(0xFF475569)
                        )
                        Text(
                            "المدة المقدرة: ${sermon.estimatedDeliveryMinutes} د",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = highlightColor
                        )
                    }
                }

                // Scrolling Sermon Body
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp)
                        .verticalScroll(scrollState)
                ) {
                    Spacer(Modifier.height(24.dp))

                    Text(
                        text = sermon.title,
                        fontSize = (fontSize + 6).sp,
                        fontWeight = FontWeight.Bold,
                        color = highlightColor,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(Modifier.height(30.dp))

                    sermon.blocks.forEach { block ->
                        Text(
                            text = "【 ${block.titleAr} 】",
                            fontSize = (fontSize - 2).sp,
                            fontWeight = FontWeight.Bold,
                            color = highlightColor,
                            textAlign = TextAlign.Right,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(Modifier.height(8.dp))

                        Text(
                            text = block.contentAr,
                            fontSize = fontSize.sp,
                            lineHeight = (fontSize * 1.7).sp,
                            fontWeight = if (block.type == BlockType.QURAN || block.type == BlockType.HADITH) FontWeight.Medium else FontWeight.Normal,
                            color = textColor,
                            textAlign = TextAlign.Right,
                            modifier = Modifier.fillMaxWidth()
                        )

                        if (block.citationSource != null) {
                            Spacer(Modifier.height(6.dp))
                            Text(
                                text = "◂ ${block.citationSource} (${block.grading ?: "موثق"})",
                                fontSize = (fontSize - 6).sp,
                                color = highlightColor.copy(alpha = 0.8f),
                                textAlign = TextAlign.Right,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        Spacer(Modifier.height(28.dp))
                    }

                    Spacer(Modifier.height(100.dp))
                }
            }
        }
    }
}

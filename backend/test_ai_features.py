import httpx

def test_all_ai_features():
    client = httpx.Client(base_url="http://127.0.0.1:3000/api", timeout=15.0)

    # 1. Test Generation with custom theme and citation counts
    print("[1/5] Testing Sermon Generation with custom counts...")
    gen_res = client.post("/sermons/generate", json={
        "theme": "بر الوالدين وصلة الأرحام",
        "sermon_type": "jumuah",
        "target_duration_minutes": 15,
        "quran_count": 3,
        "hadith_count": 2,
        "poetry_count": 1
    })
    assert gen_res.status_code == 200, f"Generate failed: {gen_res.status_code} - {gen_res.text}"
    sermon = gen_res.json()
    assert sermon["verification_status"] == "fully_verified"
    sermon_id = sermon["id"]
    blocks = sermon["blocks"]

    quran_blocks = [b for b in blocks if b.get("citation_source_type") == "quran"]
    hadith_blocks = [b for b in blocks if b.get("citation_source_type") == "hadith"]
    poetry_blocks = [b for b in blocks if b.get("citation_source_type") == "poetry"]
    assert len(quran_blocks) == 3, f"Expected 3 quran blocks, got {len(quran_blocks)}"
    assert len(hadith_blocks) == 2, f"Expected 2 hadith blocks, got {len(hadith_blocks)}"
    assert len(poetry_blocks) == 1, f"Expected 1 poetry block, got {len(poetry_blocks)}"
    print(f"  ✓ Generation Success: 3 Quran, 2 Hadith, 1 Poetry (Total blocks: {len(blocks)}, Words: {sermon['word_count']})")

    # 2. Test Citations Explorer Search
    print("[2/5] Testing Citations Explorer Endpoint...")
    explore_res = client.get("/citations/explore?query=الصبر&type=all")
    assert explore_res.status_code == 200
    explore_data = explore_res.json()
    assert len(explore_data.get("quran", [])) > 0
    assert len(explore_data.get("hadith", [])) > 0
    print(f"  ✓ Citations Explorer: {len(explore_data['quran'])} Quran, {len(explore_data['hadith'])} Hadith")

    # 3. Test In-Place AI Transformations on Thematic Exposition Block
    expo_block = [b for b in blocks if b["block_type"] == "thematic_exposition"][0]["id"]
    for action in ["rephrase", "elaborate", "shorten", "make_solemn"]:
        print(f"[3/5] Testing AI Action '{action}'...")
        tr_res = client.post("/sermons/transform-block", json={
            "sermon_id": sermon_id,
            "block_id": expo_block,
            "action": action
        })
        assert tr_res.status_code == 200, f"Transform {action} failed: {tr_res.text}"
        data = tr_res.json()
        assert data["status"] == "success"
        updated_text = data["updated_block"]["content_ar"]
        print(f"  ✓ Action '{action}' verified. Result words: {len(updated_text.split())}")

    # 4. Test In-Place Hadith Swap (replace_hadith) with deterministic verification
    print("[4/5] Testing Hadith Auto-Swap (replace_hadith)...")
    hadith_block_id = hadith_blocks[0]["id"]
    swap_res = client.post("/sermons/transform-block", json={
        "sermon_id": sermon_id,
        "block_id": hadith_block_id,
        "action": "replace_hadith"
    })
    assert swap_res.status_code == 200, f"Swap failed: {swap_res.text}"
    swap_data = swap_res.json()
    assert swap_data["status"] == "success"
    assert swap_data["updated_block"]["verified"] is True
    assert swap_data["updated_block"]["verification_score"] >= 0.98
    print(f"  ✓ Hadith Swap Verified! New title: {swap_data['updated_block']['title_ar']}")

    # 5. Test Settings Test-Key Endpoint
    print("[5/5] Testing /settings/test-key endpoint...")
    key_res = client.post("/settings/test-key", json={
        "provider": "gemini",
        "api_key": ""
    })
    assert key_res.status_code == 200
    assert key_res.json()["valid"] is False  # Empty key should return valid: False gracefully
    print(f"  ✓ Test-Key endpoint working gracefully: {key_res.json()['message']}")

    print("\n========================================================")
    print("ALL AI FEATURES VERIFIED AND PASSING SUCCESSFULLY (100%)!")
    print("========================================================")

if __name__ == "__main__":
    test_all_ai_features()

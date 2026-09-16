# SiteSync — AI Matching & Confidence Specification

## 7-Signal Hybrid Formula
$$\text{FinalScore} = 0.40 S_{\text{semantic}} + 0.15 S_{\text{discipline}} + 0.10 S_{\text{loc}} + 0.10 S_{\text{wbs}} + 0.10 S_{\text{temp}} + 0.10 S_{\text{dep}} + 0.05 S_{\text{entity}}$$

### Signal Definitions
1. **Semantic Similarity ($S_{\text{semantic}}$ - 40%)**: Cosine TF-IDF, token overlap, and Jaccard similarity between normalized statement and canonical activity names/aliases.
2. **Discipline Compatibility ($S_{\text{discipline}}$ - 15%)**: Match (1.0), Neutral (0.65), Clashing penalty (0.10).
3. **Location Compatibility ($S_{\text{loc}}$ - 10%)**: Spatial area substring and token set overlap.
4. **WBS Hierarchy Context ($S_{\text{wbs}}$ - 10%)**: Context alignment with parent WBS branches.
5. **Temporal Proximity ($S_{\text{temp}}$ - 10%)**: Proximity to planned start and planned finish window.
6. **Dependency Precedence ($S_{\text{dep}}$ - 10%)**: Predecessor completion status check.
7. **Equipment / Entity Overlap ($S_{\text{entity}}$ - 5%)**: Keyword matching on equipment/materials (compressor, skid, valve, tray, etc.).

## Confidence Thresholds
- `Confidence >= 0.90` -> `AUTO_LINKED`
- `0.70 <= Confidence < 0.90` -> `PENDING_REVIEW`
- `Confidence < 0.70` -> `UNMATCHED`

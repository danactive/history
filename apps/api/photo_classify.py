from typing import Any

from fastapi import Request

import architecture
import classify
from classifier_engine import ClassifierUnavailable


MAX_SUGGESTIONS = 4
MATCH_STRENGTHS = {"strong", "possible", "weak"}


def match_strength(value: Any) -> str:
    return value if value in MATCH_STRENGTHS else "possible"


def organism_suggestions(result: dict[str, Any]) -> list[dict[str, Any]]:
    predictions = result.get("predictions")
    if result.get("status") == "not_organism" or not isinstance(predictions, list):
        return []
    return [
        {
            "type": "organism",
            "id": prediction["taxonId"],
            "name": prediction["scientificName"],
            "commonName": prediction.get("commonName"),
            "context": prediction.get("family"),
            "descriptionValue": prediction["scientificName"],
            "score": prediction["score"],
            "matchStrength": match_strength(prediction.get("matchStrength")),
            "reviewCues": [],
        }
        for prediction in predictions
        if isinstance(prediction, dict)
    ]


def architecture_suggestion(
    prediction: dict[str, Any],
    strength: str,
) -> dict[str, Any]:
    family = prediction.get("family")
    return {
        "type": "architecture",
        "id": prediction["styleId"],
        "name": prediction["name"],
        "commonName": None,
        "context": f"{family} family" if family else None,
        "descriptionValue": f"{prediction['name']} architecture",
        "score": prediction["score"],
        "matchStrength": strength,
        "reviewCues": prediction.get("reviewCues", []),
    }


def architecture_suggestions(result: dict[str, Any]) -> list[dict[str, Any]]:
    if result.get("status") == "not_architecture":
        return []

    suggestions = []
    accepted = result.get("acceptedPrediction")
    accepted_id = None
    if result.get("status") == "identified" and isinstance(accepted, dict):
        accepted_id = accepted.get("styleId")
        suggestions.append(architecture_suggestion(accepted, "strong"))

    predictions = result.get("predictions")
    if not isinstance(predictions, list):
        return suggestions
    for prediction in predictions:
        if not isinstance(prediction, dict) or prediction.get("styleId") == accepted_id:
            continue
        strength = "possible" if accepted_id else match_strength(prediction.get("matchStrength"))
        suggestions.append(architecture_suggestion(prediction, strength))
    return suggestions


def top_review_suggestions(results: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    streams = []
    if "organism" in results:
        streams.append((
            results["organism"].get("status"),
            organism_suggestions(results["organism"]),
        ))
    if "architecture" in results:
        streams.append((
            results["architecture"].get("status"),
            architecture_suggestions(results["architecture"]),
        ))

    preferred = [
        suggestions
        for status, suggestions in streams
        if status == "identified" and suggestions
    ]
    if not preferred:
        preferred = [suggestions for _, suggestions in streams if suggestions]

    ranked = []
    while len(ranked) < MAX_SUGGESTIONS and preferred:
        remaining = []
        for suggestions in preferred:
            if suggestions and len(ranked) < MAX_SUGGESTIONS:
                ranked.append(suggestions.pop(0))
            if suggestions:
                remaining.append(suggestions)
        preferred = remaining
    return ranked


async def classify_photo(request: Request) -> dict[str, Any]:
    image, metadata = await classify.classification_request(request)
    results: dict[str, dict[str, Any]] = {}
    errors: dict[str, str] = {}

    try:
        results["organism"] = await classify.classify_loaded_image(image.copy(), metadata)
    except ClassifierUnavailable as error:
        errors["organism"] = str(error)

    try:
        results["architecture"] = await architecture.classify_loaded_image(image.copy(), metadata)
    except ClassifierUnavailable as error:
        errors["architecture"] = str(error)

    if not results:
        raise ClassifierUnavailable("; ".join(errors.values()) or "Photo classifiers are unavailable")

    suggestions = top_review_suggestions(results)

    return {
        "status": "matched" if suggestions else "no_match",
        "suggestions": suggestions,
        "diagnostics": {
            "organismStatus": results.get("organism", {}).get("status"),
            "architectureStatus": results.get("architecture", {}).get("status"),
            "unavailableClassifiers": sorted(errors),
        },
    }

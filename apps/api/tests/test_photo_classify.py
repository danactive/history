from photo_classify import architecture_suggestions


def test_identified_architecture_preserves_weak_predictions():
    suggestions = architecture_suggestions({
        "status": "identified",
        "acceptedPrediction": {
            "styleId": "gothic",
            "name": "Gothic",
            "family": "Gothic",
            "score": 0.2,
            "matchStrength": "strong",
            "reviewCues": ["pointed arches"],
        },
        "predictions": [
            {
                "styleId": "gothic",
                "name": "Gothic",
                "family": "Gothic",
                "score": 0.2,
                "matchStrength": "strong",
                "reviewCues": ["pointed arches"],
            },
            {
                "styleId": "gothic-revival",
                "name": "Gothic Revival",
                "family": "Gothic",
                "score": 0.18,
                "matchStrength": "strong",
                "reviewCues": ["tracery"],
            },
            {
                "styleId": "baroque",
                "name": "Baroque",
                "family": "Baroque",
                "score": 0.14,
                "matchStrength": "weak",
                "reviewCues": ["curved pediments"],
            },
        ],
    })

    assert [suggestion["matchStrength"] for suggestion in suggestions] == [
        "strong",
        "possible",
        "weak",
    ]

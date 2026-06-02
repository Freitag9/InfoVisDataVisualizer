#!/usr/bin/env python3
"""
Cleans the Spotify Tracks dataset for the InfoVis visualizer.

Removes rows with invalid / missing values:
  - tempo == 0            (invalid BPM)
  - time_signature == 0   (invalid)
  - duration_ms == 0      (invalid)
  - empty track_name
  - empty track_genre
  - unparseable numeric fields

Duplicates (same track under multiple genres) are KEPT on purpose,
so genre comparisons remain possible.

Usage:
  python tools/clean_dataset.py <input.csv> <output.csv>
"""
import csv
import sys

NUMERIC_FIELDS = [
    "popularity", "duration_ms", "danceability", "energy", "key",
    "loudness", "mode", "speechiness", "acousticness",
    "instrumentalness", "liveness", "valence", "tempo", "time_signature",
]


def clean(input_path, output_path):
    kept = 0
    dropped = 0
    reasons = {}

    with open(input_path, encoding="utf-8", newline="") as f_in, \
         open(output_path, "w", encoding="utf-8", newline="") as f_out:
        reader = csv.DictReader(f_in)
        writer = csv.DictWriter(f_out, fieldnames=reader.fieldnames)
        writer.writeheader()

        for row in reader:
            reason = validate(row)
            if reason:
                dropped += 1
                reasons[reason] = reasons.get(reason, 0) + 1
                continue
            writer.writerow(row)
            kept += 1

    print(f"Kept:    {kept}")
    print(f"Dropped: {dropped}")
    for r, c in sorted(reasons.items(), key=lambda x: -x[1]):
        print(f"  - {r}: {c}")


def validate(row):
    if not row.get("track_name", "").strip():
        return "empty track_name"
    if not row.get("track_genre", "").strip():
        return "empty track_genre"
    try:
        for fld in NUMERIC_FIELDS:
            float(row[fld])
    except (ValueError, KeyError):
        return "unparseable numeric"
    if float(row["tempo"]) == 0:
        return "tempo == 0"
    if int(float(row["time_signature"])) == 0:
        return "time_signature == 0"
    if float(row["duration_ms"]) == 0:
        return "duration == 0"
    return None


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    clean(sys.argv[1], sys.argv[2])

#!/usr/bin/env python3
"""
Crop an OpenSignals .txt EEG file so it starts at a given wall-clock time
(e.g. the moment a screen-recording video began).

The EEG start time and sampling rate are read from the file header.
Offset = video_start - eeg_start ; that many seconds are dropped from the front.

Usage:
  python crop_eeg_to_video.py <eeg.txt> <out.txt> --video-start HH:MM:SS[.ms]
"""
import argparse
import json
import sys
from datetime import datetime


def parse_time(s):
    for fmt in ("%H:%M:%S.%f", "%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    sys.exit(f"Zeit nicht lesbar: {s}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("eeg")
    ap.add_argument("out")
    ap.add_argument("--video-start", required=True, help="HH:MM:SS or HH:MM:SS.mmm")
    ap.add_argument("--duration", type=float, default=None,
                    help="optional: keep only this many seconds (e.g. video length)")
    args = ap.parse_args()

    with open(args.eeg, encoding="utf-8") as f:
        lines = f.readlines()

    # Header = lines starting with '#'
    header = []
    data_start = 0
    for i, ln in enumerate(lines):
        if ln.startswith("#"):
            header.append(ln)
        else:
            data_start = i
            break

    # Parse JSON metadata (2nd header line, after the leading '# ')
    meta_line = header[1].lstrip("#").strip()
    meta = json.loads(meta_line)
    dev = next(iter(meta.values()))
    fs = int(dev["sampling rate"])
    eeg_time = parse_time(dev["time"])

    vid_time = parse_time(args.video_start)
    offset_s = (vid_time - eeg_time).total_seconds()
    if offset_s < 0:
        sys.exit(f"Video startet VOR dem EEG (offset {offset_s:.2f}s) – nichts zu schneiden.")

    skip = round(offset_s * fs)
    data = lines[data_start:]
    kept = data[skip:]
    if args.duration is not None:
        kept = kept[:round(args.duration * fs)]

    with open(args.out, "w", encoding="utf-8") as f:
        f.writelines(header)
        f.writelines(kept)

    print(f"EEG start:    {dev['time']}")
    print(f"Video start:  {args.video_start}")
    print(f"Offset:       {offset_s:.2f} s  -> skip {skip} samples @ {fs} Hz")
    print(f"Data rows:    {len(data)} total  -> {len(kept)} kept "
          f"({len(kept)/fs:.1f}s)")
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()

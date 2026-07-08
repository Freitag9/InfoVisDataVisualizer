#!/usr/bin/env python3
"""
Convert (and optionally crop) an OpenSignals (r)evolution .h5 file to .txt.

Reads the device metadata from the file automatically (sampling rate,
channels, ADC resolution), exports a tab-separated text file, and can
crop to a time window and convert raw ADC values to microvolts (EEG).

Requires:  pip install h5py numpy

Examples:
  # full file, raw values
  python h5_to_txt.py recording.h5 out.txt

  # crop seconds 10..70 and add a µV column per channel
  python h5_to_txt.py recording.h5 out.txt --start 10 --end 70 --uv

  # only certain channels (1-based as shown in OpenSignals)
  python h5_to_txt.py recording.h5 out.txt --channels 1 2 --uv
"""
import argparse
import sys

import numpy as np

try:
    import h5py
except ImportError:
    sys.exit("h5py fehlt:  pip install h5py numpy")

# EEG sensor transfer function (PLUX/BITalino EEG):
#   EEG(µV) = ((ADC / 2^n - 0.5) * VCC / GAIN) * 1e6
VCC  = 3.3
GAIN = 40000.0


def eeg_to_uv(raw, n_bits):
    return ((raw / (2 ** n_bits) - 0.5) * VCC / GAIN) * 1e6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("h5",  help="input .h5 file")
    ap.add_argument("txt", help="output .txt file")
    ap.add_argument("--start", type=float, default=0.0, help="crop start (seconds)")
    ap.add_argument("--end",   type=float, default=None, help="crop end (seconds)")
    ap.add_argument("--channels", type=int, nargs="*", default=None,
                    help="1-based channel numbers to export (default: all)")
    ap.add_argument("--uv", action="store_true",
                    help="add a microvolt column per channel (EEG transfer function)")
    args = ap.parse_args()

    with h5py.File(args.h5, "r") as f:
        dev_key = list(f.keys())[0]            # first device (MAC address)
        dev = f[dev_key]
        attrs = dict(dev.attrs)

        fs = int(np.atleast_1d(attrs.get("sampling rate", attrs.get("sampling_rate", 1000)))[0]) \
            if not np.isscalar(attrs.get("sampling rate", None)) \
            else int(attrs.get("sampling rate"))

        # resolution per channel (bits)
        res = np.atleast_1d(attrs.get("resolution", [16]))
        res = [int(x) for x in res]

        raw_grp = dev["raw"]
        # channel datasets are named channel_1, channel_2, ...
        ch_names = sorted([k for k in raw_grp.keys() if k.startswith("channel")],
                          key=lambda s: int(s.split("_")[1]))
        if args.channels:
            ch_names = [f"channel_{i}" for i in args.channels if f"channel_{i}" in raw_grp]

        # sequence numbers (nSeq) if present
        nseq = raw_grp["nSeq"][:].flatten() if "nSeq" in raw_grp else None

        cols = {name: raw_grp[name][:].flatten() for name in ch_names}
        n_samples = len(next(iter(cols.values())))

        # crop window → sample indices
        i0 = int(args.start * fs)
        i1 = int(args.end * fs) if args.end is not None else n_samples
        i0 = max(0, i0); i1 = min(n_samples, i1)

        print(f"Device: {dev_key}")
        print(f"Sampling rate: {fs} Hz")
        print(f"Channels: {ch_names}")
        print(f"Samples total: {n_samples}  →  exporting {i0}..{i1} ({(i1-i0)/fs:.1f}s)")

        # build header + rows
        header_cols = ["nSeq"] + ch_names
        if args.uv:
            header_cols += [f"{c}_uV" for c in ch_names]

        with open(args.txt, "w", encoding="utf-8") as out:
            out.write("# OpenSignals .h5 → .txt export\n")
            out.write(f"# device={dev_key} sampling_rate={fs} "
                      f"start_s={args.start} end_s={args.end}\n")
            out.write("\t".join(header_cols) + "\n")

            for i in range(i0, i1):
                row = [str(int(nseq[i])) if nseq is not None else str(i)]
                row += [str(int(cols[c][i])) for c in ch_names]
                if args.uv:
                    for ci, c in enumerate(ch_names):
                        n_bits = res[ci] if ci < len(res) else res[-1]
                        row.append(f"{eeg_to_uv(cols[c][i], n_bits):.3f}")
                out.write("\t".join(row) + "\n")

    print(f"Wrote {args.txt}")


if __name__ == "__main__":
    main()

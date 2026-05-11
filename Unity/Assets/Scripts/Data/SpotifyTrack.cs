using System;
using UnityEngine;

namespace InfoVis.Data
{
    [Serializable]
    public class SpotifyTrack
    {
        public string track_id;
        public string artists;
        public string album_name;
        public string track_name;
        public float  popularity;
        public float  duration_ms;
        public bool   explicit_content;
        public float  danceability;
        public float  energy;
        public int    key;
        public float  loudness;
        public int    mode;
        public float  speechiness;
        public float  acousticness;
        public float  instrumentalness;
        public float  liveness;
        public float  valence;
        public float  tempo;
        public int    time_signature;
        public string track_genre;

        public float GetNormalized(string field) => field switch
        {
            "popularity"       => popularity / 100f,
            "danceability"     => danceability,
            "energy"           => energy,
            "valence"          => valence,
            "acousticness"     => acousticness,
            "instrumentalness" => instrumentalness,
            "speechiness"      => speechiness,
            "liveness"         => liveness,
            "loudness"         => Mathf.Clamp01((loudness + 60f) / 60f),
            "tempo"            => Mathf.Clamp01((tempo - 40f) / 180f),
            "duration_min"     => Mathf.Clamp01(duration_ms / 600_000f),
            _                  => 0f,
        };

        public string GetDisplayValue(string field) => field switch
        {
            "popularity"   => $"{popularity:0}",
            "loudness"     => $"{loudness:0.0} dB",
            "tempo"        => $"{tempo:0} BPM",
            "duration_min" => FormatDuration(duration_ms),
            _              => (GetNormalized(field)).ToString("0.000"),
        };

        public string FormatDuration(float ms)
        {
            var ts = TimeSpan.FromMilliseconds(ms);
            return $"{(int)ts.TotalMinutes}:{ts.Seconds:D2}";
        }
    }
}

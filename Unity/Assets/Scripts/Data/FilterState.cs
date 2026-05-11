using System;
using System.Collections.Generic;
using UnityEngine;

namespace InfoVis.Data
{
    /// <summary>
    /// Single source of truth for all filter + axis settings.
    /// Both desktop UI and VR wrist menu read/write this singleton.
    /// </summary>
    public class FilterState : MonoBehaviour
    {
        public static FilterState Instance { get; private set; }

        // ── Axes ──────────────────────────────────────────────────────────
        public string AxisX = "danceability";
        public string AxisY = "energy";
        public string AxisZ = "valence";

        // ── Filters ───────────────────────────────────────────────────────
        public string Genre           = "";
        public int    MinPopularity   = 0;
        public int    MaxPopularity   = 100;
        public float  MinEnergy       = 0f;
        public float  MaxEnergy       = 1f;
        public float  MinDanceability = 0f;
        public float  MaxDanceability = 1f;
        public float  MinValence      = 0f;
        public float  MaxValence      = 1f;
        public float  MinTempo        = 40f;
        public float  MaxTempo        = 220f;
        public bool   ExplicitOnly    = false;
        public int    TrackCount      = 500;

        public List<string> AvailableGenres { get; private set; } = new();

        public event Action OnChanged;
        public event Action OnRerenderRequested;

        void Awake()
        {
            if (Instance != null) { Destroy(gameObject); return; }
            Instance = this;
        }

        public void SetGenres(List<string> g) { AvailableGenres = g; OnChanged?.Invoke(); }

        public void SetAxis(string val, int dim)
        {
            switch (dim) { case 0: AxisX=val; break; case 1: AxisY=val; break; case 2: AxisZ=val; break; }
            OnChanged?.Invoke();
            OnRerenderRequested?.Invoke();
        }

        public void SetGenre(string v)         { Genre           = v;                         OnRerenderRequested?.Invoke(); }
        public void SetMinPop(int v)           { MinPopularity   = Mathf.Clamp(v,0,100);      OnChanged?.Invoke(); }
        public void SetMaxPop(int v)           { MaxPopularity   = Mathf.Clamp(v,0,100);      OnChanged?.Invoke(); }
        public void SetMinEnergy(float v)      { MinEnergy       = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMaxEnergy(float v)      { MaxEnergy       = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMinDance(float v)       { MinDanceability = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMaxDance(float v)       { MaxDanceability = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMinValence(float v)     { MinValence      = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMaxValence(float v)     { MaxValence      = Mathf.Clamp01(v);           OnChanged?.Invoke(); }
        public void SetMinTempo(float v)       { MinTempo        = Mathf.Clamp(v,40,220);      OnChanged?.Invoke(); }
        public void SetMaxTempo(float v)       { MaxTempo        = Mathf.Clamp(v,40,220);      OnChanged?.Invoke(); }
        public void SetExplicitOnly(bool v)    { ExplicitOnly    = v;                          OnRerenderRequested?.Invoke(); }
        public void SetTrackCount(int v)       { TrackCount      = Mathf.Clamp(v,50,2000);     OnRerenderRequested?.Invoke(); }

        public bool PassesFilter(SpotifyTrack t) =>
            (string.IsNullOrEmpty(Genre) || t.track_genre == Genre)   &&
            t.popularity       >= MinPopularity   && t.popularity       <= MaxPopularity    &&
            t.energy           >= MinEnergy       && t.energy           <= MaxEnergy        &&
            t.danceability     >= MinDanceability && t.danceability     <= MaxDanceability  &&
            t.valence          >= MinValence      && t.valence          <= MaxValence       &&
            t.tempo            >= MinTempo        && t.tempo            <= MaxTempo         &&
            (!ExplicitOnly || t.explicit_content);
    }
}

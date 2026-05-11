using TMPro;
using UnityEngine;
using UnityEngine.UI;
using InfoVis.Data;

namespace InfoVis.UI
{
    /// <summary>
    /// Desktop UGUI panel bound to FilterState.
    /// All UI controls are assigned via Inspector.
    /// </summary>
    public class FilterPanelUI : MonoBehaviour
    {
        [Header("Axis Dropdowns")]
        public TMP_Dropdown axisXDropdown;
        public TMP_Dropdown axisYDropdown;
        public TMP_Dropdown axisZDropdown;

        [Header("Genre")]
        public TMP_Dropdown genreDropdown;

        [Header("Popularity")]
        public Slider popMinSlider;
        public Slider popMaxSlider;
        public TextMeshProUGUI popLabel;

        [Header("Energy")]
        public Slider energyMinSlider;
        public Slider energyMaxSlider;
        public TextMeshProUGUI energyLabel;

        [Header("Danceability")]
        public Slider danceMinSlider;
        public Slider danceMaxSlider;
        public TextMeshProUGUI danceLabel;

        [Header("Valence")]
        public Slider valenceMinSlider;
        public Slider valenceMaxSlider;
        public TextMeshProUGUI valenceLabel;

        [Header("Tempo")]
        public Slider tempoMinSlider;
        public Slider tempoMaxSlider;
        public TextMeshProUGUI tempoLabel;

        [Header("Misc")]
        public Toggle   explicitToggle;
        public Slider   trackCountSlider;
        public TextMeshProUGUI trackCountLabel;

        static readonly string[] AxisValues = {
            "danceability","energy","valence","acousticness","instrumentalness",
            "speechiness","liveness","tempo","loudness","popularity","duration_min",
        };
        static readonly string[] AxisLabels = {
            "Danceability","Energy","Valence","Acousticness","Instrumentalness",
            "Speechiness","Liveness","Tempo","Loudness","Popularity","Duration",
        };

        void Start()
        {
            BuildAxisDropdown(axisXDropdown, FilterState.Instance?.AxisX ?? "danceability", 0);
            BuildAxisDropdown(axisYDropdown, FilterState.Instance?.AxisY ?? "energy",       1);
            BuildAxisDropdown(axisZDropdown, FilterState.Instance?.AxisZ ?? "valence",      2);

            popMinSlider?.onValueChanged.AddListener(v =>   { FilterState.Instance?.SetMinPop((int)v);    UpdateLabels(); });
            popMaxSlider?.onValueChanged.AddListener(v =>   { FilterState.Instance?.SetMaxPop((int)v);    UpdateLabels(); });
            energyMinSlider?.onValueChanged.AddListener(v =>{ FilterState.Instance?.SetMinEnergy(v/100f); UpdateLabels(); });
            energyMaxSlider?.onValueChanged.AddListener(v =>{ FilterState.Instance?.SetMaxEnergy(v/100f); UpdateLabels(); });
            danceMinSlider?.onValueChanged.AddListener(v => { FilterState.Instance?.SetMinDance(v/100f);  UpdateLabels(); });
            danceMaxSlider?.onValueChanged.AddListener(v => { FilterState.Instance?.SetMaxDance(v/100f);  UpdateLabels(); });
            valenceMinSlider?.onValueChanged.AddListener(v =>{ FilterState.Instance?.SetMinValence(v/100f); UpdateLabels(); });
            valenceMaxSlider?.onValueChanged.AddListener(v =>{ FilterState.Instance?.SetMaxValence(v/100f); UpdateLabels(); });
            tempoMinSlider?.onValueChanged.AddListener(v => { FilterState.Instance?.SetMinTempo(v);       UpdateLabels(); });
            tempoMaxSlider?.onValueChanged.AddListener(v => { FilterState.Instance?.SetMaxTempo(v);       UpdateLabels(); });
            explicitToggle?.onValueChanged.AddListener(v => FilterState.Instance?.SetExplicitOnly(v));
            trackCountSlider?.onValueChanged.AddListener(v =>{ FilterState.Instance?.SetTrackCount((int)v); UpdateLabels(); });

            FilterState.Instance?.OnChanged += UpdateLabels;
            UpdateLabels();
        }

        void OnDestroy() => FilterState.Instance?.OnChanged -= UpdateLabels;

        void BuildAxisDropdown(TMP_Dropdown dd, string current, int dim)
        {
            if (!dd) return;
            dd.ClearOptions();
            dd.AddOptions(new System.Collections.Generic.List<string>(AxisLabels));
            dd.value = System.Array.IndexOf(AxisValues, current);
            dd.onValueChanged.AddListener(i => FilterState.Instance?.SetAxis(AxisValues[i], dim));
        }

        public void PopulateGenreDropdown(System.Collections.Generic.List<string> genres)
        {
            if (!genreDropdown) return;
            genreDropdown.ClearOptions();
            var opts = new System.Collections.Generic.List<string> { "All Genres" };
            opts.AddRange(genres);
            genreDropdown.AddOptions(opts);
            genreDropdown.onValueChanged.AddListener(i =>
                FilterState.Instance?.SetGenre(i == 0 ? "" : genres[i - 1]));
        }

        void UpdateLabels()
        {
            var fs = FilterState.Instance;
            if (fs == null) return;
            if (popLabel)       popLabel.text      = $"{fs.MinPopularity}–{fs.MaxPopularity}";
            if (energyLabel)    energyLabel.text   = $"{fs.MinEnergy:0.00}–{fs.MaxEnergy:0.00}";
            if (danceLabel)     danceLabel.text    = $"{fs.MinDanceability:0.00}–{fs.MaxDanceability:0.00}";
            if (valenceLabel)   valenceLabel.text  = $"{fs.MinValence:0.00}–{fs.MaxValence:0.00}";
            if (tempoLabel)     tempoLabel.text    = $"{fs.MinTempo:0}–{fs.MaxTempo:0} BPM";
            if (trackCountLabel) trackCountLabel.text = $"{fs.TrackCount}";
        }
    }
}

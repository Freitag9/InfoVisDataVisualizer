using TMPro;
using UnityEngine;
using UnityEngine.UI;
using InfoVis.Data;
using InfoVis.Visualization;

namespace InfoVis.UI
{
    /// <summary>
    /// Shows track details when a sphere is selected.
    /// Works for both desktop (world-space canvas) and VR (world-space panel).
    /// </summary>
    public class TrackInfoPanel : MonoBehaviour
    {
        public TextMeshProUGUI trackNameText;
        public TextMeshProUGUI artistText;
        public TextMeshProUGUI genreText;
        public TextMeshProUGUI popularityText;
        public TextMeshProUGUI statsText;
        public Image           genreColorImage;
        public GameObject      panelRoot;

        void Start() => Hide();

        public void Show(SpotifyTrack track)
        {
            if (!track.track_name.Equals("")) panelRoot?.SetActive(true);

            if (trackNameText)  trackNameText.text  = track.track_name;
            if (artistText)     artistText.text     = track.artists;
            if (genreText)      genreText.text      = track.track_genre;
            if (popularityText) popularityText.text = $"Popularity: {track.popularity:0}/100";

            if (genreColorImage)
                genreColorImage.color = ColorMapper.ForGenre(track.track_genre);

            if (statsText)
                statsText.text =
                    $"Danceability: {track.danceability:0.000}\n" +
                    $"Energy:       {track.energy:0.000}\n" +
                    $"Valence:      {track.valence:0.000}\n" +
                    $"Tempo:        {track.tempo:0} BPM\n" +
                    $"Loudness:     {track.loudness:0.0} dB\n" +
                    $"Acousticness: {track.acousticness:0.000}\n" +
                    $"Explicit:     {(track.explicit_content ? "Yes" : "No")}\n" +
                    $"Duration:     {track.FormatDuration(track.duration_ms)}";
        }

        public void Hide() => panelRoot?.SetActive(false);
    }
}

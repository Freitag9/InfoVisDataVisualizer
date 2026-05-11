using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Events;

namespace InfoVis.Data
{
    /// <summary>
    /// Reads dataset.csv from StreamingAssets and fires OnDataLoaded.
    /// Processes rows in batches to avoid frame spikes.
    /// </summary>
    public class SpotifyDataLoader : MonoBehaviour
    {
        [Tooltip("Rows processed per frame during loading")]
        public int batchSize = 2000;

        public UnityEvent<List<SpotifyTrack>> OnDataLoaded;
        public UnityEvent<float>             OnProgress;   // 0-1

        void Start() => StartCoroutine(LoadCSV());

        IEnumerator LoadCSV()
        {
            string path = Path.Combine(Application.streamingAssetsPath, "dataset.csv");

#if UNITY_ANDROID && !UNITY_EDITOR
            // Android StreamingAssets are inside the APK – use UnityWebRequest
            using var req = UnityEngine.Networking.UnityWebRequest.Get(path);
            yield return req.SendWebRequest();
            if (req.result != UnityEngine.Networking.UnityWebRequest.Result.Success)
            {
                Debug.LogError($"[DataLoader] {req.error}");
                yield break;
            }
            var lines = req.downloadHandler.text.Split('\n');
#else
            if (!File.Exists(path)) { Debug.LogError($"[DataLoader] CSV not found: {path}"); yield break; }
            var lines = File.ReadAllLines(path);
#endif

            var tracks   = new List<SpotifyTrack>(114000);
            int total    = lines.Length - 1; // minus header
            int processed= 0;

            // Header: ,track_id,artists,album_name,track_name,popularity,duration_ms,explicit,
            //          danceability,energy,key,loudness,mode,speechiness,acousticness,
            //          instrumentalness,liveness,valence,tempo,time_signature,track_genre
            for (int i = 1; i < lines.Length; i++)
            {
                var line = lines[i].Trim();
                if (string.IsNullOrEmpty(line)) continue;

                var t = ParseLine(line);
                if (t != null) tracks.Add(t);

                processed++;
                if (processed % batchSize == 0)
                {
                    OnProgress?.Invoke((float)processed / total);
                    yield return null;
                }
            }

            OnProgress?.Invoke(1f);
            Debug.Log($"[DataLoader] Loaded {tracks.Count} tracks.");
            OnDataLoaded?.Invoke(tracks);
        }

        static SpotifyTrack ParseLine(string line)
        {
            var c = SplitCSV(line);
            if (c.Length < 21) return null;
            try
            {
                return new SpotifyTrack
                {
                    track_id         = c[1],
                    artists          = c[2],
                    album_name       = c[3],
                    track_name       = c[4],
                    popularity       = float.Parse(c[5]),
                    duration_ms      = float.Parse(c[6]),
                    explicit_content = c[7].Equals("True", System.StringComparison.OrdinalIgnoreCase),
                    danceability     = float.Parse(c[8]),
                    energy           = float.Parse(c[9]),
                    key              = int.Parse(c[10]),
                    loudness         = float.Parse(c[11]),
                    mode             = int.Parse(c[12]),
                    speechiness      = float.Parse(c[13]),
                    acousticness     = float.Parse(c[14]),
                    instrumentalness = float.Parse(c[15]),
                    liveness         = float.Parse(c[16]),
                    valence          = float.Parse(c[17]),
                    tempo            = float.Parse(c[18]),
                    time_signature   = int.Parse(c[19]),
                    track_genre      = c[20],
                };
            }
            catch { return null; }
        }

        static string[] SplitCSV(string line)
        {
            // Handles quoted fields with commas inside
            var result  = new List<string>();
            bool inQuote = false;
            int  start   = 0;
            for (int i = 0; i < line.Length; i++)
            {
                if (line[i] == '"') { inQuote = !inQuote; continue; }
                if (line[i] == ',' && !inQuote)
                {
                    result.Add(line.Substring(start, i - start).Trim('"'));
                    start = i + 1;
                }
            }
            result.Add(line.Substring(start).Trim('"'));
            return result.ToArray();
        }
    }
}

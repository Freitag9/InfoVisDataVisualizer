using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using InfoVis.Data;

namespace InfoVis.Visualization
{
    public class DataVisualizer : MonoBehaviour
    {
        public static DataVisualizer Instance { get; private set; }

        [Header("Dependencies")]
        public SpotifyDataLoader dataLoader;
        public AxisRenderer      axisRenderer;
        public ProjectionRay     projectionRay;

        [Header("Prefab & Settings")]
        public GameObject trackPointPrefab;
        public float      plotSize = 10f;

        [Header("Events")]
        public UnityEngine.Events.UnityEvent<SpotifyTrack> OnTrackSelected;

        readonly List<TrackPoint>  _points    = new();
        List<SpotifyTrack>         _allTracks = new();

        void Awake()
        {
            if (Instance != null) { Destroy(gameObject); return; }
            Instance = this;
        }

        void OnEnable()
        {
            if (dataLoader != null)
                dataLoader.OnDataLoaded.AddListener(OnTracksLoaded);
            if (FilterState.Instance != null)
            {
                FilterState.Instance.OnRerenderRequested += Rerender;
                FilterState.Instance.OnChanged           += UpdateVisibility;
            }
        }

        void OnDisable()
        {
            if (dataLoader != null)
                dataLoader.OnDataLoaded.RemoveListener(OnTracksLoaded);
            if (FilterState.Instance != null)
            {
                FilterState.Instance.OnRerenderRequested -= Rerender;
                FilterState.Instance.OnChanged           -= UpdateVisibility;
            }
        }

        void OnTracksLoaded(List<SpotifyTrack> tracks)
        {
            _allTracks = tracks;
            var genres = new System.Collections.Generic.HashSet<string>();
            foreach (var t in tracks)
                if (!string.IsNullOrEmpty(t.track_genre)) genres.Add(t.track_genre);
            var list = new List<string>(genres);
            list.Sort();
            FilterState.Instance?.SetGenres(list);
            Rerender();
        }

        public void Rerender()
        {
            StopAllCoroutines();
            StartCoroutine(SpawnPoints());
        }

        IEnumerator SpawnPoints()
        {
            ClearPoints();
            ColorMapper.Reset();

            var fs  = FilterState.Instance;
            var filtered = new List<SpotifyTrack>();
            foreach (var t in _allTracks)
                if (fs == null || fs.PassesFilter(t)) filtered.Add(t);

            Shuffle(filtered);
            int count = fs?.TrackCount ?? 500;
            if (filtered.Count > count) filtered.RemoveRange(count, filtered.Count - count);

            string axX = fs?.AxisX ?? "danceability";
            string axY = fs?.AxisY ?? "energy";
            string axZ = fs?.AxisZ ?? "valence";

            for (int i = 0; i < filtered.Count; i++)
            {
                var track   = filtered[i];
                var go      = Instantiate(trackPointPrefab, transform);
                go.name     = track.track_name;
                var tp      = go.GetComponent<TrackPoint>();
                float popN  = track.popularity / 100f;
                float bs    = Mathf.Lerp(0.04f, 0.20f, popN);
                tp.Init(track, bs, bs * 1.4f);
                go.transform.localPosition = new Vector3(
                    track.GetNormalized(axX) * plotSize,
                    track.GetNormalized(axY) * plotSize,
                    track.GetNormalized(axZ) * plotSize);
                tp.SetBaseColor(ColorMapper.ForGenre(track.track_genre));
                _points.Add(tp);

                if (i % 200 == 0) yield return null;
            }

            axisRenderer?.UpdateLabels(axX, axY, axZ);
            projectionRay?.Hide();
        }

        void UpdateVisibility()
        {
            var fs = FilterState.Instance;
            if (fs == null) return;
            foreach (var tp in _points)
                if (tp) tp.gameObject.SetActive(fs.PassesFilter(tp.Track));
        }

        public void OnSphereSelected(TrackPoint tp)
        {
            projectionRay?.Show(tp.transform.localPosition, tp.Track);
            OnTrackSelected?.Invoke(tp.Track);
        }

        void ClearPoints()
        {
            foreach (var p in _points) if (p) Destroy(p.gameObject);
            _points.Clear();
        }

        static void Shuffle<T>(List<T> list)
        {
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }
    }
}

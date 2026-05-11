using System.Collections.Generic;
using TMPro;
using UnityEngine;

namespace InfoVis.Visualization
{
    public class AxisRenderer : MonoBehaviour
    {
        [Header("Axis Line Materials")]
        public Material xAxisMat;
        public Material yAxisMat;
        public Material zAxisMat;

        [Header("Label Prefab")]
        public TextMeshPro labelPrefab;

        public float plotSize = 10f;
        const int TICKS = 5;

        readonly List<GameObject> _objects = new();

        static readonly string[] Fields = {
            "danceability","energy","valence","acousticness","instrumentalness",
            "speechiness","liveness","tempo","loudness","popularity","duration_min",
        };
        static readonly string[] Labels = {
            "Danceability","Energy","Valence","Acousticness","Instrumentalness",
            "Speechiness","Liveness","Tempo (BPM)","Loudness (dB)","Popularity","Duration (min)",
        };

        static readonly (float min, float max)[] Ranges = {
            (0,1),(0,1),(0,1),(0,1),(0,1),(0,1),(0,1),(40,220),(-60,0),(0,100),(0,10),
        };

        public void UpdateLabels(string axX, string axY, string axZ)
        {
            Clear();
            BuildAxis(axX, Vector3.right,   xAxisMat, Color.red);
            BuildAxis(axY, Vector3.up,      yAxisMat, Color.green);
            BuildAxis(axZ, Vector3.forward, zAxisMat, Color.blue);
        }

        void BuildAxis(string field, Vector3 dir, Material mat, Color col)
        {
            int idx     = System.Array.IndexOf(Fields, field);
            string lbl  = idx >= 0 ? Labels[idx] : field;
            float fmin  = idx >= 0 ? Ranges[idx].min : 0f;
            float fmax  = idx >= 0 ? Ranges[idx].max : 1f;

            // Axis line
            var lr = new GameObject($"Axis_{field}").AddComponent<LineRenderer>();
            lr.transform.SetParent(transform);
            lr.positionCount = 2;
            lr.SetPosition(0, transform.position);
            lr.SetPosition(1, transform.position + dir * plotSize);
            lr.startWidth = lr.endWidth = 0.02f;
            lr.material = mat ?? new Material(Shader.Find("Sprites/Default"));
            lr.startColor = lr.endColor = col;
            _objects.Add(lr.gameObject);

            // Ticks + value labels
            for (int i = 0; i <= TICKS; i++)
            {
                float t   = (float)i / TICKS;
                float val = Mathf.Lerp(fmin, fmax, t);
                var pos   = transform.position + dir * (t * plotSize);
                var txt   = Instantiate(labelPrefab, pos + Vector3.up * 0.15f, Quaternion.identity, transform);
                txt.text  = (fmax <= 1f) ? val.ToString("0.00") : val.ToString("0");
                txt.color = col;
                txt.fontSize = 0.3f;
                _objects.Add(txt.gameObject);
            }

            // Axis name
            var name = Instantiate(labelPrefab, transform.position + dir * (plotSize * 1.1f), Quaternion.identity, transform);
            name.text     = lbl;
            name.color    = col;
            name.fontSize = 0.45f;
            _objects.Add(name.gameObject);
        }

        void Clear()
        {
            foreach (var o in _objects) if (o) Destroy(o);
            _objects.Clear();
        }
    }
}

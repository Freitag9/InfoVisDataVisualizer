using TMPro;
using UnityEngine;
using InfoVis.Data;

namespace InfoVis.Visualization
{
    /// <summary>
    /// Shows crosshair lines on the XZ plane when a sphere is selected,
    /// so the user can read off axis values directly.
    /// </summary>
    public class ProjectionRay : MonoBehaviour
    {
        [Header("Prefabs")]
        public TextMeshPro labelPrefab;
        public Material    lineMaterial;

        GameObject _vertLine, _xLine, _zLine, _dot;
        TextMeshPro _xLabel, _zLabel, _yLabel;
        bool _active;

        public void Show(Vector3 localPos, SpotifyTrack track)
        {
            Hide();

            var fs  = FilterState.Instance;
            float floorY = 0f;
            float x = localPos.x, y = localPos.y, z = localPos.z;

            // Vertical drop line
            _vertLine = MakeLine(transform.position + new Vector3(x, y, z),
                                 transform.position + new Vector3(x, floorY, z),
                                 new Color(1f, 0.9f, 0.2f), 0.015f);

            // Floor: toward X axis edge (z → 0)
            _xLine = MakeLine(transform.position + new Vector3(x, floorY, z),
                              transform.position + new Vector3(x, floorY, 0),
                              new Color(1f, 0.9f, 0.2f, 0.6f), 0.01f);

            // Floor: toward Z axis edge (x → 0)
            _zLine = MakeLine(transform.position + new Vector3(x, floorY, z),
                              transform.position + new Vector3(0, floorY, z),
                              new Color(1f, 0.9f, 0.2f, 0.6f), 0.01f);

            // Dot on floor
            _dot = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            _dot.transform.position   = transform.position + new Vector3(x, floorY, z);
            _dot.transform.localScale = Vector3.one * 0.08f;
            _dot.transform.SetParent(transform);
            var dm = _dot.GetComponent<Renderer>().material;
            dm.color = new Color(1f, 0.9f, 0.2f);

            // Labels
            string axX = fs?.AxisX ?? "danceability";
            string axZ = fs?.AxisZ ?? "valence";
            string axY = fs?.AxisY ?? "energy";

            _xLabel = MakeLabel(
                $"{axX}: {track.GetDisplayValue(axX)}",
                transform.position + new Vector3(x, floorY - 0.3f, -0.4f),
                Color.yellow);
            _zLabel = MakeLabel(
                $"{axZ}: {track.GetDisplayValue(axZ)}",
                transform.position + new Vector3(-0.4f, floorY - 0.3f, z),
                Color.yellow);
            _yLabel = MakeLabel(
                $"{axY}: {track.GetDisplayValue(axY)}",
                transform.position + new Vector3(x + 0.4f, y, z),
                Color.green);

            _active = true;
        }

        public void Hide()
        {
            if (!_active) return;
            Destroy(_vertLine); Destroy(_xLine); Destroy(_zLine); Destroy(_dot);
            Destroy(_xLabel?.gameObject); Destroy(_zLabel?.gameObject); Destroy(_yLabel?.gameObject);
            _active = false;
        }

        GameObject MakeLine(Vector3 start, Vector3 end, Color col, float width)
        {
            var go = new GameObject("ProjLine");
            go.transform.SetParent(transform);
            var lr = go.AddComponent<LineRenderer>();
            lr.positionCount = 2;
            lr.SetPosition(0, start); lr.SetPosition(1, end);
            lr.startWidth = lr.endWidth = width;
            lr.material = lineMaterial ?? new Material(Shader.Find("Sprites/Default"));
            lr.startColor = lr.endColor = col;
            lr.useWorldSpace = true;
            return go;
        }

        TextMeshPro MakeLabel(string text, Vector3 pos, Color col)
        {
            var lbl = Instantiate(labelPrefab, pos, Quaternion.identity, transform);
            lbl.text     = text;
            lbl.color    = col;
            lbl.fontSize = 0.35f;
            return lbl;
        }
    }
}

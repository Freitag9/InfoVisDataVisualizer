using TMPro;
using UnityEngine;
using InfoVis.Data;

namespace InfoVis.Visualization
{
    [RequireComponent(typeof(Renderer))]
    public class TrackPoint : MonoBehaviour
    {
        public SpotifyTrack Track { get; private set; }

        Renderer   _rend;
        Color      _baseColor;
        float      _baseScale;
        float      _hoverScale;

        static readonly int EmissionID = Shader.PropertyToID("_EmissionColor");
        static readonly int ColorID    = Shader.PropertyToID("_BaseColor");

        public void Init(SpotifyTrack track, float baseScale, float hoverScale)
        {
            Track       = track;
            _baseScale  = baseScale;
            _hoverScale = hoverScale;
            _rend       = GetComponent<Renderer>();
            transform.localScale = Vector3.one * baseScale;
        }

        public void SetBaseColor(Color c)
        {
            _baseColor = c;
            var mat = _rend.material;
            mat.SetColor(ColorID,    c);
            mat.SetColor(EmissionID, c * 0.05f);
            if (mat.IsKeywordEnabled("_EMISSION") == false)
                mat.EnableKeyword("_EMISSION");
        }

        public void OnXRHoverEnter() => SetEmission(_baseColor * 0.6f);
        public void OnXRHoverExit()  => SetEmission(_baseColor * 0.05f);
        public void OnXRSelect()     => DataVisualizer.Instance?.OnSphereSelected(this);

        void OnMouseEnter() { SetEmission(_baseColor * 0.6f); transform.localScale = Vector3.one * _hoverScale; }
        void OnMouseExit()  { SetEmission(_baseColor * 0.05f); transform.localScale = Vector3.one * _baseScale; }
        void OnMouseDown()  => DataVisualizer.Instance?.OnSphereSelected(this);

        void SetEmission(Color c) => _rend.material.SetColor(EmissionID, c);
    }
}

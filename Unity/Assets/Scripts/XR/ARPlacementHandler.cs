using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using InfoVis.Visualization;

namespace InfoVis.XR
{
    /// <summary>
    /// Detects horizontal AR planes and lets the user tap to place the scatter plot.
    /// Attach to a GameObject that also has ARRaycastManager and ARPlaneManager.
    /// </summary>
    [RequireComponent(typeof(ARRaycastManager))]
    public class ARPlacementHandler : MonoBehaviour
    {
        [Header("References")]
        public Transform      scatterPlotRoot;  // root TransformNode of DataVisualizer
        public GameObject     reticlePrefab;    // small ring reticle shown on surface

        [Header("Scale")]
        public float placedScale = 0.05f;       // 5cm per Unity unit → 50cm total plot

        ARRaycastManager    _raycastMgr;
        ARPlaneManager      _planeMgr;
        GameObject          _reticle;
        bool                _placed;

        static readonly List<ARRaycastHit> _hits = new();

        void Awake()
        {
            _raycastMgr = GetComponent<ARRaycastManager>();
            _planeMgr   = GetComponent<ARPlaneManager>();
        }

        void Start()
        {
            if (reticlePrefab) _reticle = Instantiate(reticlePrefab);
            scatterPlotRoot?.gameObject.SetActive(false);
        }

        void Update()
        {
            if (_placed) return;

            // Raycast from screen center onto AR planes
            var screenCenter = new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);
            if (_raycastMgr.Raycast(screenCenter, _hits, TrackableType.PlaneWithinPolygon))
            {
                var hit = _hits[0];
                if (_reticle)
                {
                    _reticle.SetActive(true);
                    _reticle.transform.SetPositionAndRotation(hit.pose.position, hit.pose.rotation);
                }

                // Touch tap to place
                if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
                    PlaceAt(hit.pose);
            }
            else if (_reticle)
            {
                _reticle.SetActive(false);
            }
        }

        void PlaceAt(Pose pose)
        {
            if (!scatterPlotRoot) return;
            scatterPlotRoot.SetPositionAndRotation(pose.position, pose.rotation);
            scatterPlotRoot.localScale = Vector3.one * placedScale;
            scatterPlotRoot.gameObject.SetActive(true);
            _placed = true;
            if (_reticle) _reticle.SetActive(false);

            // Hide plane visuals once placed
            foreach (var plane in _planeMgr.trackables)
                plane.gameObject.SetActive(false);
            _planeMgr.enabled = false;
        }
    }
}

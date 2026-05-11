using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Interactors;
using InfoVis.Visualization;

namespace InfoVis.XR
{
    /// <summary>
    /// Bridges XR Interaction Toolkit ray interactor events to TrackPoint callbacks.
    /// Attach to the Right XRRayInteractor GameObject.
    /// </summary>
    [RequireComponent(typeof(XRRayInteractor))]
    public class VRPointSelector : MonoBehaviour
    {
        XRRayInteractor _ray;
        TrackPoint _lastHovered;

        void Awake() => _ray = GetComponent<XRRayInteractor>();

        void OnEnable()
        {
            _ray.hoverEntered.AddListener(OnHoverEntered);
            _ray.hoverExited.AddListener(OnHoverExited);
            _ray.selectEntered.AddListener(OnSelectEntered);
        }

        void OnDisable()
        {
            _ray.hoverEntered.RemoveListener(OnHoverEntered);
            _ray.hoverExited.RemoveListener(OnHoverExited);
            _ray.selectEntered.RemoveListener(OnSelectEntered);
        }

        void OnHoverEntered(HoverEnterEventArgs args)
        {
            var tp = args.interactableObject.transform.GetComponent<TrackPoint>();
            if (!tp) return;
            _lastHovered = tp;
            tp.OnXRHoverEnter();
        }

        void OnHoverExited(HoverExitEventArgs args)
        {
            var tp = args.interactableObject.transform.GetComponent<TrackPoint>();
            if (!tp) return;
            tp.OnXRHoverExit();
            if (_lastHovered == tp) _lastHovered = null;
        }

        void OnSelectEntered(SelectEnterEventArgs args)
        {
            var tp = args.interactableObject.transform.GetComponent<TrackPoint>();
            tp?.OnXRSelect();
        }
    }
}

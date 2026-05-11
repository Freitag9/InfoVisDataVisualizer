using UnityEngine;
using UnityEngine.XR;

namespace InfoVis.XR
{
    /// <summary>
    /// Detects when the left controller palm faces the HMD and shows/hides the wrist menu.
    /// Attach to the left controller grip GameObject.
    /// </summary>
    public class VRWristMenuActivator : MonoBehaviour
    {
        [Header("References")]
        public Transform  hmdTransform;   // Assign Main Camera
        public GameObject wristMenuRoot;  // Child of this object (already positioned above hand)

        [Header("Tuning")]
        [Range(0f, 1f)]
        public float threshold = 0.70f;   // dot product threshold (0.7 ≈ within ~45° cone)

        [Range(0f, 1f)]
        public float hysteresis = 0.05f;  // prevents flicker

        bool _menuOpen;

        void Update()
        {
            if (hmdTransform == null || wristMenuRoot == null) return;

            // Palm normal is the local +Y of the controller grip
            var palmWorld = transform.TransformDirection(Vector3.up).normalized;
            var toHead    = (hmdTransform.position - transform.position).normalized;
            float dot     = Vector3.Dot(palmWorld, toHead);

            if (!_menuOpen && dot > threshold)
            {
                _menuOpen = true;
                wristMenuRoot.SetActive(true);
            }
            else if (_menuOpen && dot < threshold - hysteresis)
            {
                _menuOpen = false;
                wristMenuRoot.SetActive(false);
            }
        }
    }
}

using UnityEngine;
using UnityEngine.XR;
using UnityEngine.XR.Management;

namespace InfoVis.XR
{
    /// <summary>
    /// Detects runtime platform and activates the matching camera rig.
    /// Assign all three camera root GameObjects in the Inspector.
    /// </summary>
    public class XRPlatformManager : MonoBehaviour
    {
        public enum Mode { Desktop, VR, AR }
        public static Mode Current { get; private set; } = Mode.Desktop;

        [Header("Camera Rigs")]
        public GameObject desktopCameraRig;
        public GameObject vrCameraRig;
        public GameObject arCameraRig;

        [Header("UI Roots")]
        public GameObject desktopCanvas;
        public GameObject vrWristMenu;

        void Start()
        {
            bool xrRunning = XRGeneralSettings.Instance?.Manager?.activeLoader != null;

            if (!xrRunning)
            {
                Current = Mode.Desktop;
            }
            else
            {
                // AR Foundation sets XRDisplaySubsystem running with blended compositing
                var displays = new System.Collections.Generic.List<XRDisplaySubsystem>();
                SubsystemManager.GetSubsystems(displays);
                bool isAR = displays.Count > 0 && displays[0].running &&
                            displays[0].displayOpaque == false;
                Current = isAR ? Mode.AR : Mode.VR;
            }

            desktopCameraRig?.SetActive(Current == Mode.Desktop);
            vrCameraRig?.SetActive(Current == Mode.VR);
            arCameraRig?.SetActive(Current == Mode.AR);

            desktopCanvas?.SetActive(Current == Mode.Desktop);
            vrWristMenu?.SetActive(Current == Mode.VR);

            Debug.Log($"[XRPlatformManager] Mode = {Current}");
        }
    }
}

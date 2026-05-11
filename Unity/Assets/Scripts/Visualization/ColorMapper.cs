using System.Collections.Generic;
using UnityEngine;

namespace InfoVis.Visualization
{
    public static class ColorMapper
    {
        static readonly Color[] Palette = {
            new Color(0.114f, 0.725f, 0.329f), // spotify green
            new Color(0.914f, 0.118f, 0.388f), // pink
            new Color(0.129f, 0.588f, 0.953f), // blue
            new Color(1f,     0.596f, 0f),      // orange
            new Color(0.612f, 0.153f, 0.690f), // purple
            new Color(0f,     0.737f, 0.831f), // cyan
            new Color(0.957f, 0.263f, 0.212f), // red
            new Color(0.545f, 0.765f, 0.290f), // lime
            new Color(1f,     0.341f, 0.133f), // deep-orange
            new Color(0.247f, 0.318f, 0.710f), // indigo
            new Color(0f,     0.588f, 0.533f), // teal
            new Color(1f,     0.757f, 0.027f), // amber
            new Color(0.376f, 0.490f, 0.545f), // blue-grey
            new Color(0.878f, 0.251f, 0.984f), // purple-light
            new Color(0f,     0.902f, 0.463f), // green-accent
            new Color(1f,     0.427f, 0f),      // orange-accent
            new Color(0.251f, 0.769f, 1f),      // light-blue
            new Color(0.412f, 0.941f, 0.682f), // teal-accent
            new Color(0.918f, 0.502f, 0.988f), // pink-light
            new Color(1f,     1f,     0f),      // yellow
        };

        static readonly Dictionary<string, Color> _map = new();
        static int _next;

        public static Color ForGenre(string genre)
        {
            if (string.IsNullOrEmpty(genre)) return Color.gray;
            if (_map.TryGetValue(genre, out var c)) return c;
            c = Palette[_next % Palette.Length];
            _next++;
            _map[genre] = c;
            return c;
        }

        public static void Reset() { _map.Clear(); _next = 0; }

        public static IEnumerable<(string genre, Color color)> Legend() => _map;
    }
}

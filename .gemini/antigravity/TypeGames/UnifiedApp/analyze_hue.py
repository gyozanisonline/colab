
from PIL import Image
import colorsys
import sys
import os

def get_dominant_hue(image_path):
    try:
        if not os.path.exists(image_path):
            print(f"Error: File not found at {image_path}")
            return

        img = Image.open(image_path)
        img = img.resize((100, 100)) # Resize for speed
        img = img.convert('RGB')
        
        pixels = list(img.getdata())
        
        total_r, total_g, total_b = 0, 0, 0
        count = 0
        
        for r, g, b in pixels:
            # Ignore black/very dark pixels as they don't contribute to hue much
            if r < 20 and g < 20 and b < 20:
                continue
            total_r += r
            total_g += g
            total_b += b
            count += 1
            
        if count == 0:
            print("Image is too dark to determine hue.")
            return

        avg_r = total_r / count
        avg_g = total_g / count
        avg_b = total_b / count
        
        h, s, v = colorsys.rgb_to_hsv(avg_r/255.0, avg_g/255.0, avg_b/255.0)
        hue_degrees = h * 360
        
        print(f"Dominant RGB: ({avg_r:.1f}, {avg_g:.1f}, {avg_b:.1f})")
        print(f"Dominant Hue: {hue_degrees:.1f} degrees")
        
        # Color description
        if 330 <= hue_degrees or hue_degrees < 15: desc = "Red"
        elif 15 <= hue_degrees < 45: desc = "Orange"
        elif 45 <= hue_degrees < 70: desc = "Yellow"
        elif 70 <= hue_degrees < 150: desc = "Green"
        elif 150 <= hue_degrees < 210: desc = "Cyan"
        elif 210 <= hue_degrees < 270: desc = "Blue"
        elif 270 <= hue_degrees < 330: desc = "Purple/Magenta"
        else: desc = "Unknown"
        
        print(f"Description: {desc}")

    except Exception as e:
        print(f"Error analyzing image: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_hue.py <image_path>")
    else:
        get_dominant_hue(sys.argv[1])

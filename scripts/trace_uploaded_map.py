from PIL import Image
import numpy as np
from scipy import ndimage
from skimage import measure

def trace_map():
    img = Image.open('frontend/public/india_outline.png').convert('L')
    arr = np.array(img)

    # Binary mask of the map outline (black pixels, avoiding bottom watermark text y > 888)
    mask = (arr < 140) & (np.arange(arr.shape[0])[:, None] <= 886)

    # Fill holes to get solid landmass
    filled = ndimage.binary_fill_holes(mask)

    # Find contours
    contours = measure.find_contours(filled, 0.5)
    main_contour = max(contours, key=len)

    # Approximate polygon
    simplified = measure.approximate_polygon(main_contour, tolerance=1.3)

    ymin, xmin = simplified[:, 0].min(), simplified[:, 1].min()
    ymax, xmax = simplified[:, 0].max(), simplified[:, 1].max()

    orig_w = xmax - xmin
    orig_h = ymax - ymin

    target_w = 420.0
    target_h = 490.0
    scale = min(target_w / orig_w, target_h / orig_h)

    pts = []
    for r, c in simplified:
        x = round((c - xmin) * scale + 35.0, 1)
        y = round((r - ymin) * scale + 25.0, 1)
        pts.append((x, y))

    path_d = f"M {pts[0][0]},{pts[0][1]} " + " ".join([f"L {p[0]},{p[1]}" for p in pts[1:]]) + " Z"

    # State Regional Centroid anchor nodes mapped proportionally to this exact viewBox (500x550)
    # Let's map key state positions accurately onto this viewBox
    states = [
        {"id": "JK", "name": "J&K / Ladakh", "x": 128, "y": 80, "count": 48, "critical": 3, "capex": "₹86,500 Cr", "avgProgress": 46, "sectors": "Highways (60%), Railways (32%), Hydro Power (8%)"},
        {"id": "HP", "name": "Himachal & Uttarakhand", "x": 158, "y": 115, "count": 52, "critical": 3, "capex": "₹76,800 Cr", "avgProgress": 49, "sectors": "Highways (54%), Hydro Power (34%), Railways (10%)"},
        {"id": "PB", "name": "Punjab & Haryana", "x": 135, "y": 140, "count": 82, "critical": 2, "capex": "₹1,24,000 Cr", "avgProgress": 68, "sectors": "Highways (52%), Railways (32%), Power (12%)"},
        {"id": "RJ", "name": "Rajasthan", "x": 105, "y": 195, "count": 128, "critical": 5, "capex": "₹1,95,400 Cr", "avgProgress": 58, "sectors": "Power (45%), Highways (35%), Mines (12%)"},
        {"id": "UP", "name": "Uttar Pradesh", "x": 195, "y": 185, "count": 215, "critical": 11, "capex": "₹4,18,600 Cr", "avgProgress": 48, "sectors": "Railways (42%), Highways (38%), Urban (12%)"},
        {"id": "BR", "name": "Bihar", "x": 265, "y": 200, "count": 116, "critical": 7, "capex": "₹1,78,200 Cr", "avgProgress": 42, "sectors": "Highways (46%), Railways (38%), Power (12%)"},
        {"id": "AS", "name": "Assam & North East", "x": 375, "y": 190, "count": 64, "critical": 4, "capex": "₹94,800 Cr", "avgProgress": 44, "sectors": "Highways (55%), Railways (28%), Petroleum (14%)"},
        {"id": "WB", "name": "West Bengal", "x": 290, "y": 240, "count": 104, "critical": 6, "capex": "₹1,92,400 Cr", "avgProgress": 45, "sectors": "Railways (48%), Coal (28%), Highways (18%)"},
        {"id": "JH", "name": "Jharkhand", "x": 260, "y": 235, "count": 74, "critical": 3, "capex": "₹1,15,600 Cr", "avgProgress": 53, "sectors": "Coal (52%), Railways (32%), Steel (12%)"},
        {"id": "OD", "name": "Odisha", "x": 255, "y": 275, "count": 88, "critical": 4, "capex": "₹1,44,800 Cr", "avgProgress": 56, "sectors": "Steel & Mines (42%), Railways (34%), Ports (18%)"},
        {"id": "CG", "name": "Chhattisgarh", "x": 218, "y": 265, "count": 56, "critical": 2, "capex": "₹88,200 Cr", "avgProgress": 55, "sectors": "Railways (48%), Coal (34%), Power (14%)"},
        {"id": "MP", "name": "Madhya Pradesh", "x": 165, "y": 240, "count": 136, "critical": 6, "capex": "₹2,12,000 Cr", "avgProgress": 51, "sectors": "Highways (44%), Railways (32%), Water (16%)"},
        {"id": "GJ", "name": "Gujarat", "x": 75, "y": 245, "count": 142, "critical": 4, "capex": "₹2,84,500 Cr", "avgProgress": 64, "sectors": "Petroleum (40%), Ports (32%), Highways (20%)"},
        {"id": "MH", "name": "Maharashtra", "x": 135, "y": 305, "count": 184, "critical": 8, "capex": "₹3,42,100 Cr", "avgProgress": 52, "sectors": "Highways (48%), Railways (28%), Power (14%)"},
        {"id": "TG", "name": "Telangana", "x": 185, "y": 325, "count": 68, "critical": 2, "capex": "₹1,08,200 Cr", "avgProgress": 61, "sectors": "Railways (40%), Highways (35%), Power (18%)"},
        {"id": "AP", "name": "Andhra Pradesh", "x": 200, "y": 375, "count": 94, "critical": 5, "capex": "₹1,52,700 Cr", "avgProgress": 49, "sectors": "Ports (35%), Highways (32%), Petroleum (24%)"},
        {"id": "KA", "name": "Karnataka", "x": 140, "y": 385, "count": 98, "critical": 4, "capex": "₹1,64,300 Cr", "avgProgress": 57, "sectors": "Railways (38%), Highways (34%), Urban (18%)"},
        {"id": "TN", "name": "Tamil Nadu", "x": 170, "y": 450, "count": 112, "critical": 3, "capex": "₹1,88,900 Cr", "avgProgress": 62, "sectors": "Highways (36%), Railways (30%), Atomic Energy (22%)"},
        {"id": "KL", "name": "Kerala", "x": 145, "y": 465, "count": 42, "critical": 1, "capex: ": "₹72,400 Cr", "avgProgress": 66, "sectors": "Highways (45%), Ports (35%), Railways (15%)"}
    ]

    import json
    with open('frontend/src/components/maps/indiaPathData.js', 'w', encoding='utf-8') as f:
        f.write(f'export const EXACT_INDIA_OUTLINE_PATH = "{path_d}";\n\n')
        f.write(f'export const STATE_DATA = {json.dumps(states, indent=2)};\n')

    print('Successfully generated indiaPathData.js!')

if __name__ == '__main__':
    trace_map()

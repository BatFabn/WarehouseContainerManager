import cv2
import os
import time
from datetime import datetime

# === Settings ===
interval = 10  # in seconds
save_dir = "captured_images"
os.makedirs(save_dir, exist_ok=True)

# === Initialize Webcam ===
cap = cv2.VideoCapture(1)
if not cap.isOpened():
    print("Could not open webcam.")
    exit()

print(f"Capturing an image every {interval} seconds. Press Ctrl+C to stop.")

try:
    while True:
        ret, frame = cap.read()
        if ret:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.join(save_dir, f"{timestamp}.jpg")
            cv2.imwrite(filename, frame)
            print(f"Saved: {filename}")
        else:
            print("Failed to capture image.")

        time.sleep(interval)

except KeyboardInterrupt:
    print("\nStopped by user.")

finally:
    cap.release()

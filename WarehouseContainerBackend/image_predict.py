import cv2
import torch
from torch import nn
from ultralytics import YOLO
from torchvision import models, transforms
from PIL import Image
import numpy as np

detection_model = YOLO("yolov8n.pt")

classification_model = models.mobilenet_v2(pretrained=True)
classification_model.classifier = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(classification_model.last_channel, 6)
)
classification_model.load_state_dict(torch.load(
    'apple_orange_banana.pth'))
classification_model.eval()


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


def process_image(image_o):
    image_array = np.array(image_o, dtype=np.uint8)
    image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
    # image = cv2.imread(image_path)

    results = detection_model(image, conf=0.37)

    fruit_count = {"Fresh_apples": 0,  "Fresh_bananas": 0,
                   "Fresh_oranges": 0, "Spoiled_apples": 0, "Spoiled_bananas": 0, "Spoiled_oranges": 0}

    for result in results:
        for box in result.boxes.xyxy:
            x1, y1, x2, y2 = map(int, box[:4])
            fruit_crop = image[y1:y2, x1:x2]

            fruit_pil = Image.fromarray(
                cv2.cvtColor(fruit_crop, cv2.COLOR_BGR2RGB))
            fruit_tensor = transform(fruit_pil).unsqueeze(0)

            with torch.no_grad():
                output = classification_model(fruit_tensor)
                pred = torch.argmax(output, dim=1).item()

            label_map = {0: "Fresh_apples", 1: "Fresh_bananas",  2: "Fresh_oranges",
                         3: "Spoiled_apples",  4: "Spoiled_bananas",
                         5: "Spolied_oranges"}
            fruit_count[label_map[pred]] += 1

            # Draw the box on the image
            # cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            # cv2.putText(image, label_map[pred], (x1, y1 - 10),
            #             cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return fruit_count
    # print(fruit_count)
    # cv2.imshow("Detected Fruits", image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

# image_path = "orange.png"
# process_image(image_path)

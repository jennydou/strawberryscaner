# 🍓 Strawberry Scanner — Receipt Tracker

A mobile application for scanning shopping receipts, automatically recognizing purchased products, and tracking personal expenses.

The project was developed as a team programming project using **React Native, Expo, TypeScript, Node.js, Express, and Tesseract.js**.

##  Features

-  **Receipt Scanning** — take a photo of a receipt or choose an image from the gallery.
-  **OCR Recognition** — extract text from receipts using Tesseract.js.
-  **Receipt Parsing** — identify stores, dates, products, prices, and discounts.
-  **Receipt Review** — manually correct recognized information before saving.
-  **Local Storage** — save receipts on the device using AsyncStorage.
-  **Statistics** — view monthly spending and expense categories.
-  **Expense Charts** — visualize spending with charts.
-  **Receipt History** — view saved receipts and their products.
-  **Delete Receipts** — remove saved receipts.
-  **Dark / Light Mode** — switch between application themes.
-  **File Upload Protection** — maximum image size of 32 MB.
-  **Temporary File Cleanup** — uploaded images are deleted from the server after processing.

##  Technologies

| Component | Technology |
|---|---|
| Mobile application | React Native |
| Development framework | Expo |
| Programming language | TypeScript |
| Backend | Node.js, Express |
| OCR | Tesseract.js |
| Image processing | Sharp |
| File uploads | Multer |
| Local database | AsyncStorage |
| Charts | React Native SVG |
| Version control | Git, GitHub |

##  Project Structure

```text
strawberryscaner/
│
├── mobile/                  # React Native application
│   ├── App.tsx              # Main application interface
│   ├── scanner/             # Scanner API integration
│   ├── storage/             # Local receipt storage
│   ├── data/                # Application data
│   ├── assets/              # Images and assets
│   └── package.json
│
├── src/                     # Backend source code
│   ├── server.ts            # Express API server
│   ├── receiptParser.ts     # Receipt text parser
│   ├── receiptScanner.ts    # OCR processing
│   ├── ocrToText.ts         # Image-to-text recognition
│   ├── types.ts             # TypeScript types
│   └── index.ts
│
├── receipts/                # Receipt samples
├── test_receipts/           # Test images
├── package.json             # Backend dependencies
└── README.md
```

##  Installation and Setup

### Requirements

- Node.js and npm
- Git
- Android smartphone with Expo Go
- Computer and smartphone connected to the same local network

### 1. Clone the Repository

```bash
git clone https://github.com/jennydou/strawberryscaner.git
cd strawberryscaner
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Start the Scanner Server

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

### 4. Install Mobile App Dependencies

Open another terminal:

```bash
cd mobile
npm install
```

### 5. Configure the API Address

Open:

```text
mobile/scanner/scannerApi.ts
```

Set the API URL to your computer's local IPv4 address:

```typescript
const API_BASE_URL = "http://192.168.1.100:3000";
```

Replace `192.168.1.100` with your actual computer IP address.

On Windows, find it using:

```powershell
ipconfig
```

**Important:** `localhost` will not work when the mobile application connects to a backend running on another device.

### 6. Start the Mobile Application

```bash
npx expo start --clear
```

Scan the QR code using Expo Go on your Android device.

Make sure the installed Expo Go version supports the project's Expo SDK.

##  API Endpoints

### POST `/api/scan`

Uploads a receipt image for OCR recognition and parsing.

**Request:** `multipart/form-data`

Field name: `receipt`

**Example response:**

```json
{
  "store": "Rimi",
  "date": "2026-10-23",
  "total": 6.63,
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "price": 1.19,
      "category": "Pārtika"
    },
    {
      "name": "Bread",
      "quantity": 1,
      "price": 1.45,
      "category": "Pārtika"
    },
    {
      "name": "Shampoo",
      "quantity": 1,
      "price": 3.99,
      "category": "Higiēna un kosmētika"
    }
  ],
  "warning": null
}
```

This is an illustrative response; actual OCR results depend on receipt quality.

### POST `/api/parse`

Parses receipt text without uploading an image.

**Request:**

```json
{
  "text": "RIMI\nMilk 1,19\nBread 1,45\nKOPĀ 2,64"
}
```

**Response:** Parsed receipt information in JSON format.

##  How Receipt Scanning Works

1. The user takes a photo or selects a receipt image.
2. The mobile application uploads the image to the backend.
3. The server checks the file size and type.
4. Tesseract.js extracts text from the image.
5. The receipt parser identifies products, prices, dates, and discounts.
6. The server deletes the temporary uploaded image.
7. The mobile application displays the recognized receipt for review.
8. The user corrects any recognition errors and saves the receipt.
9. The saved receipt appears in History and contributes to spending statistics.

##  File Upload and Data Storage

- Maximum upload size: **32 MB**.
- Uploaded receipt images are stored temporarily during processing.
- The server attempts to delete temporary images after scanning, including when processing fails.
- Receipt data is saved locally on the user's device.
- No user account is required.

##  Known Limitations

- OCR accuracy depends on image quality, lighting, and receipt layout.
- Discounts, weight-based products, and corrections may require manual review.
- Receipt totals may not always match the recognized product prices.
- Users may need to correct scanned information before saving.
- The scanner backend must be running and accessible from the mobile device.
- The application is intended for development and testing; the HTTP API is not configured for public production deployment.

##  Testing

The project can be tested using:

- Sample receipts from Latvian supermarkets.
- Real receipt photos captured with an Android device.
- Images selected from the phone gallery.
- Test receipts added through the application.
- Receipt validation and total calculations.
- Local storage persistence.
- Dark and light themes.

##  Team Project

The application was developed collaboratively, with work divided across OCR recognition, receipt parsing, backend integration, mobile interface development, statistics, and local data storage.

##  Project Status

**Development / Testing**

Core mobile screens and scanner integration have been implemented. OCR accuracy and receipt validation are still being improved.

---

Developed as a team programming project using TypeScript, React Native, Expo, and Node.js.

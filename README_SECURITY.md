## 1. API bez aizsardzības (`src/server.ts`) — A01, A02, A06, A10

**Problēma.** `/api/scan` un `/api/parse` ir atvērti visiem, augšupielādētie čeki paliek mapē `uploads/`, kļūdas gadījumā lietotājs redz iekšējo tekstu.

**Kas izdarīts:**
- piekļuve ar atslēgu `x-api-key` (A01);
- fails līdz 5 MB, viens fails, tikai JPEG un PNG (A02);
- CORS tikai adresēm no `ALLOWED_ORIGIN`, JSON līdz 20 KB (A02);
- ne vairāk kā 10 pieprasījumi minūtē (A06);
- fails tiek dzēsts pēc apstrādes (A01);
- lietotājam tiek rādītas vispārīgas kļūdas, bet detaļas tikai konsolē (A10).

## 2. Servera uzkāršanās uz garas rindas (`src/receiptParser.ts`) — A10

**Problēma.** Regulārā izteiksme 74. rindā uz garas rindas darbojas ļoti lēni, un kamēr tā skaita, serveris neatbild.

**Kas izdarīts.** 110. rindā tiek izlaistas rindas, kas garākas par 200 rakstzīmēm:
```ts
const lines = text.split("\n").map(l => l.trim()).filter(l => l && l.length <= 200);
```

## Palaišana un pārbaude

```
npm install
npm install express-rate-limit
API_KEY=test123 npm run dev
```
- bez `x-api-key` → 401
- fails lielāks par 5 MB → 413
- nav attēls → 400
- 11. pieprasījums minūtē → 429
- pēc pieprasījuma mape `uploads/` ir tukša

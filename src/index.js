// src/index.js
const express = require("express");
const path = require("path");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "select-rt.html"));
});

app.get("/input", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

app.post("/api/save", async (req, res) => {
  try {
    const body = req.body;

    if (!body.nomorKK || !body.totalPenduduk) {
      return res.status(400).json({
        error: "Data tidak lengkap. Nomor KK dan Jumlah Anggota diperlukan.",
      });
    }

    const auth = new GoogleAuth({
      credentials: {
        client_email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const SPREADSHEET_ID = env.SPREADSHEET_ID;
    const SHEET_NAME = body.rt; // Gunakan RT dari frontend

    const newRow = [
      body.nomorKK,
      body.totalPenduduk,
      body.lakiLaki,
      body.perempuan,
      body.anakLaki + body.anakPerempuan,
      body.anakLaki,
      body.anakPerempuan,
      body.balitaLaki + body.balitaPerempuan,
      body.balitaLaki,
      body.balitaPerempuan,
      body.dewasaLaki + body.dewasaPerempuan,
      body.dewasaLaki,
      body.dewasaPerempuan,
      body.sd,
      body.smp,
      body.sma,
      body.s1,
      body.s2,
    ];

    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:R1`,
    });

    if (!getRows.data.values || getRows.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              "No KK",
              "Jumlah Penduduk",
              "L",
              "P",
              "dibawah 18 tahun (<18)",
              "L",
              "P",
              "Balita (0-5 tahun)",
              "L",
              "P",
              "Dewasa (diatas 18 tahun)",
              "L",
              "P",
              "Lulusan SD",
              "Lulusan SMP",
              "Lulusan SMA",
              "Lulusan S1",
              "Lulusan S2",
            ],
          ],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [newRow],
      },
    });

    res.status(200).json({ message: "Data berhasil disimpan!" });
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
    res.status(500).json({ error: "Gagal menyimpan data ke spreadsheet." });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

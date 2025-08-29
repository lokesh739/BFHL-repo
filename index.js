import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/**
 * ======= EDIT THESE CONSTANTS =======
 * fullName must be lowercase in user_id
 * dobString format: ddmmyyyy
 */
const fullName = "john_doe";       // lowercase full name
const dobString = "17091999";      // ddmmyyyy
const email = "john@xyz.com";
const rollNumber = "ABCD123";
/** =================================== */

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(morgan("tiny"));

// Helpers
const isIntegerString = (s) => /^-?\d+$/.test(s);
const isAlphabeticString = (s) => /^[A-Za-z]+$/.test(s);

const buildConcatString = (alphaStrings) => {
  // collect individual letters from alpha-only elements
  const letters = [];
  for (const str of alphaStrings) {
    for (const ch of str) letters.push(ch);
  }
  // reverse and apply alternating caps (Upper, lower, Upper, ...)
  const reversed = letters.reverse();
  return reversed
    .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
};

// Routes
app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body ?? {};

    // Validate
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: `${fullName}_${dobString}`,
        email,
        roll_number: rollNumber,
        odd_numbers: [],
        even_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: "0",
        concat_string: "",
        error: "Invalid input: 'data' must be an array."
      });
    }

    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;

    // We also collect alpha-only strings to build concat_string char-by-char
    const alphaOnlyForConcat = [];

    for (const item of data) {
      // Coerce everything to string for classification
      const s = String(item);

      if (isIntegerString(s)) {
        // Keep numbers as original strings in result arrays
        const n = parseInt(s, 10);
        if (Math.abs(n % 2) === 1) odd_numbers.push(s);
        else even_numbers.push(s);
        sum += n;
      } else if (isAlphabeticString(s)) {
        alphabets.push(s.toUpperCase());
        alphaOnlyForConcat.push(s);
      } else {
        special_characters.push(s);
      }
    }

    const concat_string = buildConcatString(alphaOnlyForConcat);

    return res.status(200).json({
      is_success: true,
      user_id: `${fullName}_${dobString}`,
      email,
      roll_number: rollNumber,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      user_id: `${fullName}_${dobString}`,
      email,
      roll_number: rollNumber,
      odd_numbers: [],
      even_numbers: [],
      alphabets: [],
      special_characters: [],
      sum: "0",
      concat_string: "",
      error: "Internal Server Error"
    });
  }
});

// Optional health check
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BFHL API listening on port ${PORT}`);
});

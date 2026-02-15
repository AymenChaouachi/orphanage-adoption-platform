const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let families = [];
let children = [];

// Simple blacklist simulation
const bannedNames = ["Hisoka", "Illumi", "DangerousPerson"];

// FAMILY REGISTRATION
app.post("/family", (req, res) => {
  const { name, income, experience, backgroundCheck } = req.body;

  if (bannedNames.includes(name)) {
    return res.status(403).json({ message: "Adoption denied. Applicant flagged as dangerous." });
  }

  const verified = income > 30000 && experience >= 1 && backgroundCheck === true;

  const family = {
    id: uuidv4(),
    name,
    income,
    experience,
    backgroundCheck,
    verified
  };

  families.push(family);
  res.json({ message: "Family profile created", family });
});

// CHILD REGISTRATION
app.post("/child", (req, res) => {
  const { name, age, specialNeeds } = req.body;

  const child = {
    id: uuidv4(),
    name,
    age,
    specialNeeds
  };

  children.push(child);
  res.json({ message: "Child profile created", child });
});

// MATCHING SYSTEM
app.post("/match", (req, res) => {
  const { familyId, childId } = req.body;

  const family = families.find(f => f.id === familyId);
  const child = children.find(c => c.id === childId);

  if (!family || !child) {
    return res.status(404).json({ message: "Family or child not found" });
  }

  if (!family.verified) {
    return res.status(403).json({ message: "Family not verified. Cannot proceed." });
  }

  let compatibilityScore = 0;
  let explanation = [];

  if (family.income > 50000) {
    compatibilityScore += 30;
    explanation.push("High financial stability (+30)");
  }

  if (family.experience >= 3) {
    compatibilityScore += 30;
    explanation.push("Strong parenting experience (+30)");
  }

  if (!child.specialNeeds) {
    compatibilityScore += 20;
    explanation.push("No special medical needs (+20)");
  } else {
    compatibilityScore += 10;
    explanation.push("Family willing to support special needs (+10)");
  }

  if (child.age < 10) {
    compatibilityScore += 20;
    explanation.push("Suitable age range (+20)");
  }

  res.json({
    family: family.name,
    child: child.name,
    compatibilityScore,
    approved: compatibilityScore >= 60,
    explanation
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

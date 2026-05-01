const jwt = require("jsonwebtoken");

const DEMO_ACCOUNTS = [
  {
    email: "admin@aethera.gov",
    password: "admin",
    role: "admin",
    name: "Admin Principal",
  },
  {
    email: "auditor@aethera.gov",
    password: "auditor",
    role: "auditor",
    name: "Chief Auditor",
  },
  {
    email: "public@aethera.gov",
    password: "public",
    role: "public",
    name: "Public Observer",
  },
];

// GET /api/users
exports.getUsers = (req, res) => {
  const users = DEMO_ACCOUNTS.map(({ email, role, name }) => ({
    email,
    role,
    name,
  }));
  res.json({ success: true, data: users });
};

// POST /api/login
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "email and password are required" });
  }

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  );

  if (!account) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: account.email, role: account.role, name: account.name },
    process.env.JWT_SECRET || "aethera_hackathon_secret_2025",
    { expiresIn: "8h" }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { email: account.email, role: account.role, name: account.name },
    },
  });
};

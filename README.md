````markdown
# 🏅 Academy Manager Backend

A **Node.js/Express REST API** for managing sports academies.  
Includes authentication, rosters, training schedules, attendance tracking, and payment workflows — all built on **MongoDB** and AWS.

---

## ✨ Features
- 🔐 **JWT-secured user lifecycle** with role-based accounts and protected routes.
- 🏫 **Academy, team, and player directories** backed by Mongoose models + AWS S3 media uploads.
- 📅 **Training automation & attendance analytics** with calendar events and participation insights.
- 💳 **Tuition & payment tracking** with validations, discounts, and monthly rollups.
- 🛠 **Modular routing** for academies, teams, players, coaches, trainings, events, and payments.

---

## 🛠 Tech Stack
- **Node.js & Express** – REST API & routing layer  
- **MongoDB + Mongoose** – Data persistence  
- **JWT** – Authentication & authorization  
- **AWS S3 + Multer** – Media storage & uploads  
- **dotenv, bcrypt** – Environment config & credential security  

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/ahmedamin-89/Academy-Manager-Backend.git
cd Academy-Manager-Backend
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY=your_aws_key
AWS_SECRET_KEY=your_aws_secret
S3_BUCKET=your_bucket_name
```

### 4️⃣ Run the server

```bash
npm run dev
```

---

## 📂 Project Structure

```
.
├── controllers/    # Route logic (users, teams, payments, training, etc.)
├── models/         # Mongoose schemas
├── routes/         # REST API endpoints
├── middlewear/     # Authentication & error handling
├── server.js       # App entry point
└── package.json    # Dependencies & scripts
```

---

## 📊 API Modules

* 👤 Users & Auth
* 🏫 Academies
* 👥 Teams & Players
* 🧑‍🏫 Coaches
* 📅 Trainings & Events
* 💳 Payments

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to use and adapt it for your academy management needs.


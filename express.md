Today we’re going to **learn how to create APIs using Express**.

---

### 📦 What is Express?

* **Express** is a **library** written in JavaScript.
* It helps us build **backend APIs** easily.
* We use Express with **Node.js**.

> You can think of it like a tool that gives us shortcuts to create backend features.

---

### 🔄 What is an API?

* You send **inputs** to an API and get **outputs** as a response.

Example:

* You send your name and password to the **Login API**, and it tells you whether you're logged in or not.

---

### 🧱 Basic API Structure in Express

We’ll create:

* A **Sign Up API** → takes username, password, full name, and age
* A **Login API** → takes username and password

We will write both APIs in a **single file** for simplicity.

Absolutely! Here's everything converted to **TypeScript**, including commands to set up the project, the script (`app.ts`), and the changes needed in `tsconfig.json`.

---

## 📦 Express API Project in TypeScript

### 🛠️ Step-by-Step Setup

1. **Initialize the project**

   ```bash
   npm init -y
   ```

2. **Install dependencies**

   ```bash
   npm install express
   npm install --save-dev typescript @types/express ts-node-dev
   ```

3. **Initialize TypeScript**

   ```bash
   npx tsc --init
   ```

4. **Add a start script in `package.json`**

   ```json
   "scripts": {
     "dev": "ts-node-dev --respawn src/app.ts"
   }
   ```

---

### 📄 Project Structure

```
project-root/
├── src/
│   └── app.ts
```

---

### 🧾 `src/app.ts` (Full Code in TypeScript)

```ts
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

type User = {
  username: string;
  password: string;
  fullname: string;
  age: number;
};

const users: User[] = [];

// Signup API
app.post('/signup', (req: Request, res: Response) => {
  const { username, password, fullname, age } = req.body;

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ username, password, fullname, age });
  res.json({ message: 'Signup successful' });
});

// Login API
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ message: `Welcome back, ${user.fullname}` });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
```

---

### 🚀 Run the Project

```bash
npm run dev
```

Now your TypeScript-based Express server is running, with:

* `/signup` accepting: username, password, fullname, age
* `/login` accepting: username, password

---

Certainly! Here's a **step-by-step guide** to test your **Express APIs** using **Postman**, especially for the `signup` and `login` endpoints.

---

## 🧪 Step-by-Step: Test Express APIs with Postman

---

### ✅ Step 1: Start Your Server

Make sure your TypeScript server is running.

```bash
npm run dev
```

You should see:

```
Server is running at http://localhost:3000
```

---

### ✅ Step 2: Open Postman

* Launch [Postman](https://www.postman.com/)
* Click **“New” > “HTTP Request”** (or just use the `+` tab)

---

### 📝 Step 3: Test `/signup` API

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/signup`
3. **Go to**: `Body` tab → Select `raw` → Change `Text` to `JSON`
4. **Paste this JSON**:

   ```json
   {
     "username": "alice123",
     "password": "secure123",
     "fullname": "Alice Johnson",
     "age": 25
   }
   ```
5. **Click “Send”**

**Expected Response**:

```json
{
  "message": "Signup successful"
}
```

---

### ❌ Step 4: Try Signing Up with Same Username Again

Send the same request again.

**Expected Response**:

```json
{
  "message": "User already exists"
}
```

This confirms duplicate signup is not allowed.

---

### 🔐 Step 5: Test `/login` API (Successful Login)

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/login`
3. **Body (raw > JSON)**:

   ```json
   {
     "username": "alice123",
     "password": "secure123"
   }
   ```
4. **Click “Send”**

**Expected Response**:

```json
{
  "message": "Welcome back, Alice Johnson"
}
```

---

### ❌ Step 6: Test `/login` with Wrong Credentials

Change password to something wrong:

```json
{
  "username": "alice123",
  "password": "wrongpass"
}
```

**Expected Response**:

```json
{
  "message": "Invalid credentials"
}
```

---

## 🧠 Summary of What You Just Did

| API     | Method | Body Fields                       | Success Response                    |
| ------- | ------ | --------------------------------- | ----------------------------------- |
| /signup | POST   | username, password, fullname, age | `{ message: "Signup successful" }`  |
| /login  | POST   | username, password                | `{ message: "Welcome back, ... " }` |

---

Let me know if you’d like a PDF version or a Postman collection export.

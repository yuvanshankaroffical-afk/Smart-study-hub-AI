# 🎓 Smart Study Hub

**Smart Study Hub** is an advanced learning management and AI-driven research platform. It leverages model-based agents to help users organize content, automate study workflows, and interact with deep learning concepts through a streamlined interface.

<img width="1874" height="829" alt="Landing page" src="https://github.com/user-attachments/assets/6b79365b-0a36-41d3-8da1-105f89a554b4" />

---

## 🚀 Tech Stack

* **Runtime:** [Bun](https://bun.sh/)
* **Frontend:** React (TypeScript) + Vite
* **Styling:** Tailwind CSS + [Lucide Icons](https://lucide.dev/)
* **Backend/Database:** [Supabase](https://supabase.com/)
* **Containerization:** Docker
* **Testing:** Playwright

---

## 📂 Project Structure

The repository is organized into several specialized modules:

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/c46b7144-f04b-4b49-87f8-cd345e45118a" />


---

<img width="1869" height="837" alt="Landing page" src="https://github.com/user-attachments/assets/fadd9dce-76e5-4763-88b7-28b915624991" />


## 🛠️ Getting Started

### Prerequisites
Ensure you have [Bun](https://bun.sh/) installed on your local machine or Codespace.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smart-study-hub
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

### Development
Start the development server:
```bash
bun dev
```

### Building for Production
```bash
bun run build
```

---

<img width="1867" height="823" alt="Landing page" src="https://github.com/user-attachments/assets/3ce69abc-eac1-44d2-b587-57c2b7b1d6d3" />


## 🐳 Docker Deployment
You can run the entire stack using Docker:
```bash
docker build -t smart-study-hub .
docker run -p 80:80 smart-study-hub
```
*The project includes an `nginx.conf` for serving the production build efficiently.*

---

## 🧪 Testing
We use Playwright for end-to-end testing:
```bash
bun playwright test
```

---

## 📝 Configuration
* **Linting:** Managed via `eslint.config.js`.
* **Styling:** Configured in `tailwind.config.ts` and `postcss.config.js`.
* **Components:** UI primitives follow the `components.json` configuration (Shadcn UI style).




---


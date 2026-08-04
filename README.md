# 📦 Delivery Packing Log App (发货打包记数系统)

A high-speed, mobile-first web application designed for logging packaged grocery/meat items for delivery by date. Built with a vibrant **Neobrutalism UI** design, offline local storage persistence, and one-tap WhatsApp summary generation.

![Neobrutalism UI](https://img.shields.io/badge/Design-Neobrutalism-FFE600?style=for-the-badge&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-00E5A3?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-5DE2E7?style=for-the-badge)

---

## ✨ Features

- **📱 Mobile Keypad Optimized**: Input fields automatically trigger the numeric keypad (`inputmode="numeric"`, `pattern="[0-9]*"`) for rapid entry.
- **💾 LocalStorage Offline Persistence**: Automatically saves your item counts on every keystroke. Works 100% offline without needing a backend server.
- **⏳ 1-Hour Exit Inactivity Auto-Archive**: If you leave or exit the app for more than 1 hour (3,600,000 ms), previous counts are automatically archived into **📜 Date History** and the active screen resets to `0`.
- **📋 One-Tap WhatsApp Summary**: Generates a formatted text summary (`• 猪ham: 5 包...`) ready to paste directly into WhatsApp delivery groups.
- **📱 Touch Swipe & Mobile Gestures**: Swipe from left-to-right on the History page or use native phone back gestures to return instantly to the packing sheet.
- **🎨 High-Craft Neobrutalism UI**: High-contrast borders, bold typography, pop shadows, and micro-animations for 60–120 FPS performance.

---

## 🥩 Item Catalog Overview

- **🔥 常用类 (Main Items)**:
  - 🐷 猪ham, 🐔 鸡ham, 🌭 猪hotdog, 🥓 Bacon (大 / 小 / 圆 🐽), 🐟 鱼扒, 🍡 福州圆, 🦀 hailao
- **📦 Outside (不常用项目 1)**:
  - 🥢 腐竹卷, 🍥 长鱼饼, 🧆 taofupok
- **✨ Additional (附加不常用 2)**:
  - 🦪 鲍鱼片, 🧀 Cheese Hotdog
- **➕ Custom Items**:
  - Dynamically add temporary custom item cards on demand.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup & custom details/summary dropdowns.
- **CSS3**: Vanilla CSS with modern HSL color tokens, GPU compositing (`contain: content`, `will-change`), and container queries.
- **JavaScript (ES6+)**: `requestAnimationFrame` hardware-accelerated UI updates, `localStorage` state management, and touch gesture handlers.

---

## 🚀 Live Demo & Deployment

### Run Locally
Simply open `index.html` in any web browser:
```bash
# Or start a local server
python -m http.server 8080
```

### GitHub Pages Setup
1. Go to repository **Settings** -> **Pages**.
2. Set **Branch** to `main` and click **Save**.
3. Your app will be live at:
   `https://DwaineYong.github.io/delivery-packing-app/`

---

## 📄 License

MIT License - feel free to customize and use!

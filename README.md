<div align="center">

# 🌍 Geo Quiz

### Интерактивная fullstack-викторина по географии

Угадывай местоположение городов, столиц и достопримечательностей на карте мира.
Чем точнее и быстрее клик — тем больше очков.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 📖 Оглавление

- [✨ Возможности](#-возможности)
- [🧱 Стек](#-стек)
- [📁 Структура проекта](#-структура-проекта)
- [🚀 Запуск](#-запуск)
- [📡 API](#-api)
- [🧮 Подсчёт очков](#-подсчёт-очков)
- [🔒 Безопасность](#-безопасность)
- [📚 Документация](#-документация)

---

## ✨ Возможности

| Возможность | Описание |
|---|---|
| 🎯 **3 режима игры** | 10 вопросов · бесконечный · до первой ошибки |
| ⚡ **Очки за точность** | Экспоненциальная формула — до 5000 за попадание |
| 🏎️ **Бонус за скорость** | Множитель до ×1.5 за мгновенный ответ |
| 🗺️ **SVG-карта мира** | 200+ стран, чёткий зум без размытия |
| 🔍 **Умный зум** | Двойной клик к точке + кнопки `+` `−` `⌂` |
| ✅ **Подтверждение ответа** | Защита от случайных кликов |
| 💡 **Подсказки** | Континент за −30% к очкам |
| 📊 **Живой UI** | Прогресс-бар, таймер, счёт в реальном времени |
| 🏆 **Таблица лидеров** | Топ-10 игроков с сохранением в БД |
| 🔒 **Защита от читерства** | Координаты не уходят на фронт |

---

## 🧱 Стек

<table>
<tr>
<td valign="top" width="50%">

### Бэкенд
- **Python 3.12** — язык
- **FastAPI** — веб-фреймворк
- **SQLAlchemy** — ORM
- **Pydantic** — валидация
- **SQLite** — база данных
- **Uvicorn** — ASGI-сервер

</td>
<td valign="top" width="50%">

### Фронтенд
- **React 18** — UI
- **TypeScript** — типизация
- **Vite** — сборка
- **react-simple-maps** — SVG-карта
- **axios** — HTTP-клиент
- **Tailwind CSS** — стили

</td>
</tr>
</table>

---

## 📁 Структура проекта

```
DL2026_Autumn_Kliuchnik/
│
├── backend/                    # 🐍 FastAPI + SQLite
│   ├── main.py                 #   ├─ API endpoints
│   ├── models.py               #   ├─ SQLAlchemy модели
│   ├── schemas.py              #   ├─ Pydantic схемы
│   ├── database.py             #   ├─ Подключение к SQLite
│   ├── scoring.py              #   ├─ Формула очков (гаверсинусы)
│   └── seed.py                 #   └─ 70 вопросов по географии
│
├── frontend/                   # ⚛️ React + Vite
│   └── src/
│       ├── components/         #   ├─ StartScreen / GameScreen
│       │                       #   │  MapView / FinishScreen
│       ├── api/client.ts       #   ├─ HTTP-клиент к API
│       ├── types/index.ts      #   ├─ TypeScript типы
│       └── App.tsx             #   └─ Роутинг экранов
│
└── docs/                       # 📚 Документация
    ├── design.md               #   ├─ Часть 1: проектирование
    ├── AI_REFLECTION.md        #   └─ Часть 3: работа с AI
    └── images/                 #      Скриншоты (опционально)
```

---

## 🚀 Запуск

### Требования

- **Python 3.10+** → [python.org](https://python.org)
- **Node.js 18+** → [nodejs.org](https://nodejs.org)

### 1️⃣ Бэкенд

```bash
cd backend

# Виртуальное окружение
python -m venv .venv

# Активация
# Windows:
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Зависимости
pip install fastapi uvicorn sqlalchemy pydantic

# Вопросы в БД (один раз)
python seed.py

# Запуск
uvicorn main:app --reload
```

<table>
<tr>
<td>🌐 API</td>
<td><a href="http://localhost:8000">http://localhost:8000</a></td>
</tr>
<tr>
<td>📘 Swagger</td>
<td><a href="http://localhost:8000/docs">http://localhost:8000/docs</a></td>
</tr>
</table>

### 2️⃣ Фронтенд

**В отдельном терминале:**

```bash
cd frontend
npm install
npm run dev
```

<table>
<tr>
<td>🎮 Игра</td>
<td><a href="http://localhost:5173">http://localhost:5173</a></td>
</tr>
</table>

### 3️⃣ Играй!

Открой **http://localhost:5173**, введи имя, выбери режим — и вперёд 🚀

---

## 📡 API

Базовый URL: `http://localhost:8000/api`

| Метод | Endpoint | Описание |
|:---:|---|---|
| `GET` | `/health` | Проверка работоспособности |
| `GET` | `/questions?limit=10` | Случайные вопросы **без координат** |
| `POST` | `/answer` | Проверить ответ, получить очки |
| `POST` | `/games` | Сохранить результат игры |
| `GET` | `/leaderboard?limit=10` | Топ-10 игроков |
| `GET` | `/hint/{question_id}` | Подсказка (континент) |
| `DELETE` | `/games` | Очистить лидерборд (dev) |

**Пример ответа `/answer`:**

```json
{
  "correct_text": "Париж, Франция",
  "distance_km": 0.5,
  "base_score": 4995,
  "time_bonus": 1.2,
  "final_score": 5994
}
```

📖 **Подробнее:** [docs/design.md](docs/design.md)

---

## 🧮 Подсчёт очков

```
┌─────────────────────────────────────────────────┐
│  base_score = 5000 × exp(-distance_km / 500)    │
│  time_bonus = 1 + max(0, 15 - seconds) / 30     │
│  final_score = base_score × time_bonus          │
└─────────────────────────────────────────────────┘
```

### 🎯 Точность

| Расстояние | Очки |
|:---:|:---:|
| **0 км** (в яблочко) | **5000** |
| 100 км | ~4093 |
| 500 км | ~1839 |
| 1000 км | ~676 |
| 2000 км | ~91 |
| 5000 км | ~0 |

### ⚡ Скорость

| Время ответа | Множитель |
|:---:|:---:|
| Мгновенно | **×1.5** |
| 5 секунд | ×1.33 |
| 15+ секунд | ×1.0 |

### 💡 Штрафы

- **−30%** за использование подсказки

---

## 🔒 Безопасность

> **Координаты правильных ответов не отдаются на фронт** — только `id`, `text`, `category`, `difficulty`.

Это защищает от читерства через DevTools. Проверка ответа — **на сервере**, через формулу гаверсинусов.

```json
// ✅ Что видит фронт
[{ "id": 1, "text": "Где Эйфелева башня?", "category": "landmark" }]

// ❌ Чего фронт НЕ видит
{ "latitude": 48.8584, "longitude": 2.2945 }
```

---

## 📚 Документация

<table>
<tr>
<td width="50%" valign="top">

### 📐 [design.md](docs/design.md)
Часть 1 — проектирование:
- User stories
- API endpoints
- Модель данных
- Технические решения

</td>
<td width="50%" valign="top">

### 🤖 [AI_REFLECTION.md](docs/AI_REFLECTION.md)
Часть 3 — работа с AI:
- Промпты и инструменты
- Где AI помог / ошибся
- Выводы и рекомендации

</td>
</tr>
</table>

---

<div align="center">

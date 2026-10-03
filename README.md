# 🌍 Geo Quiz — географическая викторина

Интерактивная fullstack-викторина: игрок угадывает местоположение городов,
столиц и достопримечательностей на карте мира. Чем точнее и быстрее клик —
тем больше очков.

## ✨ Возможности

- 🎯 **3 режима игры**: 10 вопросов, бесконечный, до первой ошибки
- ⚡ **Очки за точность и скорость**: до 5000 за точность × до 1.5 за скорость
- 🗺️ **Интерактивная SVG-карта мира** (200+ стран)
- 🔍 **Двойной клик** — зум к точке; кнопки **+ / − / ⌂**
- ✅ **Подтверждение ответа** — можно отменить случайный клик
- 💡 **Подсказки** — за −30% к очкам
- 📊 **Прогресс-бар, таймер, счёт** в реальном времени
- 🏆 **Таблица лидеров** — топ-10 игроков
- 💾 **История игр** в SQLite

## 🧱 Стек

**Бэкенд:** Python 3.12 · FastAPI · SQLAlchemy · SQLite · Pydantic  
**Фронтенд:** React 18 · Vite · TypeScript · react-simple-maps · axios

## 📁 Структура

```
.
├── backend/              # FastAPI + SQLite
│   ├── main.py           # API endpoints
│   ├── models.py         # SQLAlchemy модели
│   ├── schemas.py        # Pydantic схемы
│   ├── scoring.py        # Подсчёт очков (гаверсинусы)
│   ├── database.py       # Подключение к SQLite
│   └── seed.py           # 70 вопросов
├── frontend/             # React + Vite
│   └── src/
│       ├── components/   # StartScreen, GameScreen, MapView, FinishScreen
│       ├── api/client.ts # HTTP-клиент
│       └── types/        # TypeScript типы
└── docs/
    ├── design.md           # Часть 1: проектирование
    ├── AI_REFLECTION.md    # Часть 3: работа с AI
    └── images/             # Скриншоты
```

## 🚀 Запуск

### Требования

- **Python 3.10+** ([python.org](https://python.org))
- **Node.js 18+** ([nodejs.org](https://nodejs.org))

### 1. Бэкенд

```bash
cd backend

# Создать виртуальное окружение
python -m venv .venv

# Активировать
# Windows:
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Установить зависимости
pip install fastapi uvicorn sqlalchemy pydantic

# Заполнить БД вопросами (один раз)
python seed.py

# Запустить сервер
uvicorn main:app --reload
```

Бэкенд: **http://localhost:8000**  
Swagger: **http://localhost:8000/docs**

### 2. Фронтенд (в отдельном терминале)

```bash
cd frontend
npm install
npm run dev
```

Фронтенд: **http://localhost:5173**

### 3. Играть

Открой **http://localhost:5173** в браузере, введи имя, выбери режим — и вперёд.

## 📡 API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Проверка работоспособности |
| GET | `/api/questions?limit=10` | Случайные вопросы (без координат) |
| POST | `/api/answer` | Проверить ответ, получить очки |
| POST | `/api/games` | Сохранить результат игры |
| GET | `/api/leaderboard?limit=10` | Топ-10 игроков |
| GET | `/api/hint/{id}` | Подсказка (континент) |
| DELETE | `/api/games` | Очистить лидерборд (dev) |

Подробнее — в [`docs/design.md`](docs/design.md).

## 🧮 Подсчёт очков

```
base_score = 5000 × exp(-distance_km / 500)
time_bonus = 1 + max(0, 15 - seconds) / 30
final_score = base_score × time_bonus
```

- **0 км** → 5000 очков, **500 км** → ~1840, **2000 км** → ~90
- Бонус за скорость: **×1.5** за мгновенный ответ, **×1.0** за 15+ секунд
- **−30%** за использование подсказки

## 🔒 Безопасность

Координаты правильных ответов **не отдаются на фронт** — только ID, текст,
категория и сложность. Проверка ответа — на сервере. Читерить через DevTools
не получится.

## 📚 Документация

- [Проектирование](docs/design.md) — сценарии, API, модель данных, стек
- [Рефлексия по AI](docs/AI_REFLECTION.md) — какие инструменты, промпты, что получилось
